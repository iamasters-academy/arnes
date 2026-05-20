# Modo: Estandar

**Para proyectos con usuarios, datos, o que vas a ensenrar a otros.** Te
hago 3-4 preguntas, te ensenro un mini-plan, y construyo. Tarda 20-30
minutos.

Solo 2 artefactos visibles para ti: la **descripcion** (que va a hacer la
app) y las **comprobaciones** (que se verifica que funciona). Nada mas.

---

## Para que sirve

- Proyectos con login de usuarios.
- Apps con base de datos.
- Webs con formularios reales (no solo presentacion).
- Cosas que vas a ensenrar a un cliente o subir a publico.
- Pasos despues de un Express que se queda corto.

**No es para:**
- MVPs de 1 dia → usa [Express](express.md).
- Proyectos de cliente de alto valor o software profesional → usa [PRO](pro.md).

---

## El flujo (4 pasos, 20-30 min)

```
1. Mini-entrevista   →   2. Mini-plan   →   3. Construyo   →   4. Te entrego
```

**Nada de specs largas, planes de arquitectura, tasks numeradas,
adversarial review o ciclo de 9 etapas.** Esa es la diferencia con PRO.

---

### Paso 1 — Mini-entrevista (3-4 preguntas, 3 min)

Solo lo justo. Ejemplo para una app:

> «Bien. Voy a hacerte 3-4 preguntas, una a una.»

1. ¿Que nombre quieres para el proyecto?
2. ¿Que hace tu app, en una frase?
3. ¿Quien la va a usar? (Solo tu / equipo pequenro / cualquiera con
   cuenta / publico abierto.) Esto me dice si necesita login.
4. ¿Hay alguna funcionalidad imprescindible para esta primera version?
   (Por ejemplo: «que el usuario pueda crear y ver listas», o «que pueda
   subir fotos».)

**Eso es todo.** No pregunto stack, no pregunto base de datos por defecto,
no pregunto tests. Asumo Next.js + Supabase + Tailwind.

---

### Paso 2 — Mini-plan (1 mensaje, no necesita aprobacion formal)

Te muestro un resumen corto. **Sin jerga de arquitectura.**

> «He entendido esto:
>
> - **Proyecto:** `<nombre>`
> - **Hace:** <descripcion>
> - **Usuarios:** <segun lo que dijiste>
> - **Primera version incluye:**
>   - Login y registro
>   - <funcionalidades clave que dijiste>
> - **Tarda 20-30 minutos en construirse.**
>
> ¿Adelante, o quieres cambiar algo?»

Espero un «adelante» o ajuste. **No te ensenro SQL, ni paths de ficheros,
ni decisiones tecnicas detalladas.** Eso es PRO. En Estandar, decido yo
lo razonable.

---

### Paso 3 — Construyo en silencio (15-25 min)

Te aviso una sola vez:

> «Voy a montar tu proyecto. Tarda 15-25 minutos (la mayoria es descargar
> piezas). Mientras tanto, puedes ir a por un cafe. Te aviso cuando este.»

**Lo que hago internamente** (no te lo explico salvo que preguntes):

1. Adquiero el cerrojo de sesion (silencioso).
2. Renderizo el armazon comun + plantilla `nextjs-supabase`.
3. Configuro multi-IA (`setup-multi-ia.sh`).
4. `pnpm install`.
5. **Escribo la descripcion** (`.specs/active/<feature>/spec.md`).
6. **Escribo las comprobaciones** (`.specs/active/<feature>/tests.md` +
   ficheros `*.spec.ts`).
7. Implemento el codigo para que las comprobaciones pasen.
8. Verifico que `pnpm typecheck`, `pnpm lint` y `pnpm test:e2e` pasan.
9. Muevo al destino final (atomico).
10. Primer commit.
11. Libero cerrojo.

**Lo que NO te menciono:** atomicidad, staging, lock, manifest, hooks
pre-commit, AGENTS.md, multi-IA. Esa terminologia es ruido para ti.

**Lo que SI te menciono** si algo va mal: «detecto un error al instalar
las piezas, lo soluciono en 1 minuto» (lenguaje plano).

---

### Paso 4 — Entrega (1 mensaje claro)

> «¡Listo! Tu proyecto esta en `<path>`. Esto es lo que tienes:
>
> 🌐 **Para verlo en local:**
> ```bash
> cd <path>
> pnpm supabase:start   # arranca la base de datos local (necesita Docker)
> pnpm dev              # arranca la web
> ```
> Abre http://localhost:3000.
>
> 📤 **Para publicarlo en internet:**
> 1. Crea cuenta gratis en https://supabase.com y https://vercel.com.
> 2. Te ayudo a copiar las credenciales: dime «vamos a configurar Supabase».
> 3. Dime «vamos a desplegar en Vercel» cuando estes listo.
>
> 📂 **Lo que viene dentro:**
> - Login de usuarios (registro + login + recuperar contrasenra).
> - Las funcionalidades que pediste, ya funcionando.
> - Comprobaciones automaticas para que no se rompa al cambiarlo.
>
> ¿Algo mas o lo dejas para luego?»

---

## Lo que NO hago en Estandar (a diferencia de PRO)

- ❌ Ciclo de 9 etapas. Aqui son 4.
- ❌ 6 artefactos por feature. Aqui son 2 (descripcion + comprobaciones).
- ❌ Adversarial review (revision dura de seguridad).
- ❌ Plan tecnico detallado con SQL, paths, decisiones documentadas.
- ❌ Tasks atomicas numeradas (T01, T02...).
- ❌ Reviews separadas con findings.
- ❌ Hablarte de RLS, OWASP, hooks, lock, atomicidad, AGENTS.md.

**Sigo aplicando todas esas reglas de seguridad por debajo**, pero no
te las muestro. Son la fontaneria.

---

## Lo que SI hago en Estandar

- ✅ Next.js + Supabase + Tailwind + PNPM.
- ✅ Login de usuarios funcionando.
- ✅ Base de datos con permisos de privacidad correctos.
- ✅ Validacion de formularios.
- ✅ Comprobaciones automaticas (Playwright basico).
- ✅ Hook pre-commit (te bloquea si intentas subir contrasenras).
- ✅ Cabeceras de seguridad.
- ✅ Atomicidad y rollback (por debajo).
- ✅ Multi-IA (cualquier IA puede continuar el proyecto).
- ✅ Git con primer commit.

Todo esto **sin que tu te enteres**. Es lo que diferencia Estandar de
Express.

---

## Anrnadir features despues

Cuando quieras anrnadir algo nuevo:

> Tu: «Quiero anrnadir que los usuarios puedan compartir su lista con un enlace.»

Yo:

> «Vale, esto es una funcionalidad nueva. Te hago 1-2 preguntas, te
> ensenro el mini-plan y la construyo. Tarda 10-15 min.»

Sigo el mismo flujo de 4 pasos. **Una feature a la vez.**

---

## Upgrade a PRO

Si en algun momento el proyecto pasa a ser «de cliente» o «software
profesional», te puedo subir al Modo PRO. Implica:

- A partir de ahi, cada feature pasa por 9 etapas (no 4).
- Cada feature lleva 6 artefactos (no 2).
- Cada feature pasa por adversarial review obligatoria.

Avisame con «quiero pasar este proyecto a PRO» y te explico el cambio.

---

## Rollback

Si algo va mal en el paso 3:
```bash
node scripts/atomic.mjs rollback
```

Te aviso de forma plana:

> «Algo no salio bien al instalar. He deshecho todo lo que iba haciendo.
> Tu ordenador esta como antes. Vamos a intentarlo otra vez con un ajuste.»

Sin entrar en jerga.

---

## Para Claude (instrucciones internas)

**Tono Estandar:** profesional pero cercano. Mas detallado que Express
pero menos formal que PRO. **El usuario eligio Estandar porque quiere
algo serio sin complicarse la vida.**

**Reglas:**

1. **Solo 3-4 preguntas iniciales.** Si necesitas mas, es que la
   feature es demasiado grande — sugiere dividirla.

2. **2 artefactos visibles:** `spec.md` y `tests.md` (con los ficheros
   `*.spec.ts` asociados). Punto.

3. **NO te muestro ni leo en alto:** `plan.md`, `tasks.md`,
   `reviews/`, `adversarial/`. Esos son del Modo PRO. En Estandar no
   se generan ni se commitean.

4. **Toda la complejidad por debajo** (atomicidad, lock, multi-IA,
   AGENTS.md, hooks) **funciona pero no se nombra** en la conversacion
   con el usuario.

5. **Jerga tecnica:** prohibida salvo que el usuario pregunte. Si
   tienes que decir «migracion», di «cambio en la base de datos». Si
   tienes que decir «endpoint», di «direccion de la app». Etc.

6. **Si el usuario pide algo que requiere PRO** (cosa muy critica de
   seguridad, requisito de compliance, multi-tenant complejo): le
   propones upgrade a PRO en lugar de hacerlo dentro de Estandar.

7. **Mantengo `estado/implementation-status.md` actualizado** despues de
   cada paso, pero NO se lo muestro al usuario salvo que pregunte
   «¿donde estoy?».

**Variables que se sustituyen:**
- `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}` — pregunta 1 y 2.
- `{{FEATURE_NAME}}`, `{{FEATURE_TITLE}}` — derivadas de la pregunta 4.
- Automaticas: `{{DATE}}`, `{{TIMESTAMP}}`, `{{HOST}}`.
