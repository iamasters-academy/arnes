# Seguridad: las reglas que NO se rompen

Las reglas de este documento existen para protegerte. No son sugerencias.
Si Arnes detecta que se va a romper una, **se detiene** y avisa.

Esto es lo que separa una app que **funciona y es segura** de una app que
funciona pero te puede **arruinar el negocio o demandar legalmente**.

---

## La regla cero

> «Mejor pararnos 10 minutos que filtrar datos.»

Si en cualquier momento Arnes duda si algo es seguro, te avisa y para.
El precio de un falso positivo: 10 minutos de discusion. El precio de un
falso negativo: filtracion de datos, posible multa GDPR (hasta el 4% de
tu facturacion anual), reputacion destruida.

No hay simetria.

---

## 1. Las contrasenas y claves NUNCA suben a internet

**Que significa:**
Tu app usa «claves» (passwords, API keys) para conectarse a Stripe,
Supabase, OpenAI, etc. Estas claves dan acceso completo a esos servicios.
Si las publicas por accidente:

- Alguien las encuentra en tu repositorio publico.
- Las usa.
- Te llega una factura de 5.000€ de OpenAI al mes siguiente.
- O peor: borra todos tus datos de Supabase.

**Como te protege Arnes:**
Antes de cada `git commit` (guardado), un verificador automatico (el
«pre-commit hook») busca patrones de claves conocidas en tus ficheros:

- Claves de OpenAI (empiezan por `sk-` o `sk-proj-`).
- Claves de Anthropic (empiezan por `sk-ant-`).
- Claves de Stripe (empiezan por `sk_live_` o `sk_test_`).
- Claves de AWS, GitHub, Slack, Google, Supabase service_role.
- Cualquier fichero `.env` (excepto `.env.example`).

Si encuentra algo, **bloquea el commit** y te avisa. Tu reemplazas la
clave por la variable de entorno y vuelves a intentar.

**Excepcion:** `.env.example` con valores tipo `YOUR_KEY_HERE` esta bien.
Es la plantilla, no la clave real.

**Si una clave se te escapa al repo:** dala por **comprometida**. Aunque
borres el commit, sigue en el historial git. Hay que **rotarla** (pedir
una nueva en el panel del servicio) inmediatamente. No es opcional.

---

## 2. Permisos de privacidad obligatorios (RLS)

**Que significa:**
En Supabase, cuando creas una tabla nueva, por defecto **cualquier usuario
puede leer los datos de cualquier otro usuario**. Esto es una bomba.

Imagina:
- Tu app de inventario para vendedores de Amazon.
- Usuario A guarda sus productos.
- Usuario B se conecta y, con la API publica, lee los productos de A.
- Usuario A pierde su ventaja competitiva.
- Usuario A te demanda.

**RLS (Row-Level Security)** son las reglas que dicen «este usuario solo
puede ver SUS datos». Son las reglas que evitan la situacion de arriba.

**Como te protege Arnes:**
Cada vez que creo una tabla nueva en una migracion, **incluyo automaticamente:**

1. Activar RLS: `alter table X enable row level security;`.
2. Politicas para SELECT, INSERT, UPDATE, DELETE (lo que aplique).
3. Las politicas usan `auth.uid() = user_id` (cada usuario ve solo sus filas).

Y en la etapa 8 (revision dura), el «escéptico» verifica que toda tabla
nueva tiene esto. Si no, **bloquea la feature**.

**Anti-patron que NUNCA permito:**
```sql
create policy "todos pueden leer" on tabla for select using (true);
```
Esto desactiva RLS con pasos extra. Bloqueado.

---

## 3. Validar todo lo que viene de fuera

**Que significa:**
Cuando tu app recibe datos (formulario, API, webhook), no puedes confiar
en que sean correctos. Un usuario malicioso te puede enviar:

- Un email que no es email (rompe tu app).
- Un numero negativo cuando esperabas positivo.
- Un texto de 1GB que tira tu servidor.
- Codigo SQL que ejecuta en tu base de datos (inyeccion SQL).

**Como te protege Arnes:**
Uso una herramienta llamada **Zod** para definir el «contrato» de cada
input. Por ejemplo:

```ts
const InputSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
});
```

Y verifico cada input antes de procesarlo. Si no cumple, devuelvo error
400 («mal formado») sin tocar la base de datos.

**Doble validacion obligatoria:**
- **Cliente:** valida para que el formulario muestre errores bonitos.
- **Servidor:** valida porque el cliente se puede saltar (curl, devtools).

**Anti-patron:** confiar solo en el cliente. **Bloqueado.**

---

## 4. Login y permisos son cosas DISTINTAS

**Login (autenticacion):** ¿Quien eres? → Supabase Auth.
**Permisos (autorizacion):** ¿Que puedes hacer? → RLS + checks en server.

No los mezclo.

**Anti-patron habitual:**
> «El usuario solo puede acceder a /admin porque escondo el boton en el frontend.»

Mal. El backend tambien debe verificar. Si no, alguien va directo a la URL
y entra. **Bloqueado.**

---

## 5. Cabeceras de seguridad por defecto

Cada proyecto Arnes monta automaticamente las siguientes cabeceras HTTP:

| Cabecera | Que hace |
|----------|----------|
| `Content-Security-Policy` | Solo permite cargar recursos de origenes especificos |
| `Strict-Transport-Security` | Fuerza HTTPS en produccion |
| `X-Content-Type-Options: nosniff` | Evita que el navegador adivine tipos de fichero |
| `X-Frame-Options: DENY` | Evita que tu web se cargue dentro de otra (clickjacking) |
| `Referrer-Policy` | Evita que se filtren URLs sensibles a otros sitios |
| `Permissions-Policy` | Bloquea camara, microfono, GPS por defecto |

Las anades una vez en `next.config.ts` y se aplican a toda la app.

---

## 6. El checklist OWASP

En cada feature, durante la etapa 8 (revision dura), paso este checklist.
Son los **10 errores de seguridad mas comunes** segun OWASP (la fundacion
que mantiene el ranking):

- [ ] **A01 — Permisos rotos:** ¿RLS bien? ¿Checks tambien en server?
- [ ] **A02 — Crypto fail:** ¿Secrets en variables de entorno, no en codigo?
- [ ] **A03 — Inyeccion:** ¿Zod en cada input? ¿Queries parametrizadas?
- [ ] **A04 — Disenro inseguro:** ¿Hemos pensado en como un atacante usaria esto?
- [ ] **A05 — Mala config:** ¿Cabeceras de seguridad? ¿Defaults restrictivos?
- [ ] **A06 — Componentes vulnerables:** ¿`pnpm audit` limpio?
- [ ] **A07 — Auth roto:** ¿Supabase Auth (no logica de auth casera)?
- [ ] **A08 — Integridad:** ¿Lockfile commiteado? ¿Commits firmados?
- [ ] **A09 — Logs:** ¿Sin emails, telefonos, DNIs en los logs?
- [ ] **A10 — SSRF:** ¿No hacemos fetch a URLs controladas por el usuario sin whitelist?

Si alguno de estos no esta verde, no archivo la feature.

---

## 7. Datos personales (GDPR)

Si tu app maneja datos personales (mail, telefono, direccion, DNI, salud,
finanzas), Arnes anrnade automaticamente:

- **No** guardar DNI/NIE/NIF en plano. Hash si solo se compara.
- **No** guardar tarjetas de credito. Usar Stripe o token-vault.
- **No** loguear request bodies con email/telefono/direccion.
- **Si** activar audit log: «quien accedio a que datos cuando».
- **Si** endpoints `/api/me/export` y `/api/me/delete` (derecho GDPR).

Si el «escéptico» detecta datos personales sin estos endpoints, los anade
a la spec.

---

## 8. La autoridad final eres tu

Estas reglas las puedes saltar con `git commit --no-verify`. **No deberias.**

Si te encuentras saltando el hook con frecuencia, el problema NO es el hook,
es tu flujo. Para y revisa que pasa.

**Cuando NO usar `--no-verify`:**
- Commit con secrets («solo es temporal»). NO. Rota la clave.
- «Lo arreglo en el siguiente commit». NO. Arreglalo ahora.
- Tests fallan «por una razon no relacionada». Investiga primero.

**Cuando SI:**
- Falso positivo demostrado del hook (y abres issue para arreglarlo).
- Emergencia con fix urgente que se valida despues.

---

## TL;DR

| Regla | Te protege contra |
|-------|-------------------|
| Secrets bloqueados | Cuentas tomadas, facturas inesperadas |
| RLS obligatorio | Filtracion de datos entre usuarios |
| Validacion Zod | Inyeccion, datos corruptos, crashes |
| Auth ≠ permisos | Acceso sin permiso a zonas restringidas |
| Cabeceras seguridad | XSS, clickjacking, downgrade |
| OWASP en cada feature | Los 10 errores mas comunes |
| GDPR si aplica | Multas hasta 4% facturacion |

> «La velocidad se nota durante 2 semanas. Una filtracion se nota durante 5 anos.»
