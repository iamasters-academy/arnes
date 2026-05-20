# Tu primer proyecto con Arnes — guia de 30 minutos

Si nunca has trabajado con Claude Code o no sabes que es un proyecto de
software, este tutorial es para ti. Vas a salir con una web tuya, online
y funcionando, en 30 minutos.

**No necesitas saber programar.** Vas a hablar con la IA en castellano
normal. Yo te llevo de la mano.

---

## Antes de empezar: que necesitas instalado

Solo tres cosas. Si no las tienes, te dejo enlaces. Si te lias, pregunta
en la comunidad iAmasters.

### 1. Node.js (version 20 o superior)

Es el «motor» que va a hacer correr la web en tu ordenador.

- **Mac:** https://nodejs.org (descarga la version «LTS»)
- **Windows:** https://nodejs.org (igual, la version «LTS»)
- Para comprobar que esta instalado, abre la terminal y escribe:
  ```
  node --version
  ```
  Si dice `v20.x.x` o superior, OK. Si dice «command not found», hay que instalarlo.

### 2. PNPM

Es el «instalador de piezas» que va a descargar lo que tu web necesita.

```
npm install -g pnpm
```

### 3. Claude Code

Es donde vas a hablar con la IA. Si estas leyendo esto, lo mas seguro es
que ya lo tienes. Si no:

- https://claude.com/code

---

## Paso 1 — Pide tu primer proyecto

Abre Claude Code y escribe (literalmente):

```
Quiero crear una web simple para presentarme.
```

Arnes se va a activar automaticamente y te va a hacer **una pregunta clave**:

> «Genial, vamos a ello. Antes de empezar, dime una cosa: ¿como quieres
> que trabajemos?
>
> Modo Express — Te monto algo basico en 5 minutos. Sin preguntas.
> Modo Estandar — Te hago 3-4 preguntas, te ensenro un mini-plan, y lo construyo.
> Modo PRO — Para proyectos serios con tests y revisiones de seguridad.
>
> ¿Cual eliges?»

Para tu primer proyecto: **«Modo Express»**. Es lo mas rapido y sin
ceremonia. Cuando quieras algo mas serio, vuelves con Estandar o PRO.

---

## Paso 2 — Responde 2-3 preguntas

Arnes te va a hacer 2-3 preguntas. Algo como:

> ¿Que nombre quieres ponerle al proyecto? (Asi se llama la carpeta y se ve
> en el navegador.)

Tu: `landing-personal`

> ¿Que tres cosas quieres que aparezcan? Por ejemplo: «mi nombre, mis
> servicios, mi email».

Tu: `Mi nombre Angel, soy formador de IA, contacto en angel@email.com`

Y ya esta. Sin mas preguntas. Arnes empieza a construir.

---

## Paso 3 — Espera 2-3 minutos

Arnes hace todo esto solo:

- Descarga las piezas que necesita la web (Next.js + Tailwind).
- Crea la carpeta del proyecto.
- Pone tu nombre y tus tres cosas en la pagina principal.
- Inicializa el historial (Git).

Mientras tanto, te va explicando lo que esta haciendo. **No tienes que
hacer nada.**

Cuando termine, te va a decir:

> «Listo. Tu web esta en `~/proyectos/landing-personal`. Para verla:
> ```bash
> cd ~/proyectos/landing-personal
> pnpm dev
> ```
> Abre http://localhost:3000 y la veras.»

---

## Paso 4 — Ver tu web en local

Copia los dos comandos que te dio Arnes y pegalos en una terminal.
Despues de unos segundos veras algo como:

```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

Abre tu navegador en http://localhost:3000.

**Ahi esta tu web.** Tu nombre, tus tres cosas, todo funcionando.

---

## Paso 5 — Publicarla en internet (5 minutos)

Para que la vea otra gente y no solo tu, vamos a Vercel (es gratis).

### 5.1. Sube tu proyecto a GitHub

Si no tienes cuenta de GitHub, crea una en https://github.com (gratis).

En la terminal, desde la carpeta del proyecto:

```bash
gh repo create landing-personal --private --source=. --push
```

Si no tienes la herramienta `gh`, instala con: https://cli.github.com/

### 5.2. Conecta Vercel

1. Entra en https://vercel.com (login con GitHub).
2. Pulsa «Import Git Repository».
3. Elige tu repo `landing-personal`.
4. Pulsa «Deploy».

Vercel detecta que es un proyecto Next.js, lo construye y lo publica. En
2 minutos te da una URL como `https://landing-personal-xyz.vercel.app`.

**Esa URL es tu web, online.** Compartela con quien quieras.

---

## Paso 6 — Modificar tu web

Imagina que quieres cambiar tu nombre o anrnadir un boton. Vuelves a
Claude Code y le dices:

```
Quiero anrnadir un boton de "Reservar llamada conmigo" a mi landing-personal.
```

Arnes te va a hacer 1-2 preguntas y va a editar el codigo. Despues le
dices `pnpm dev` otra vez y ves el cambio en local.

Cuando este como tu quieres, lo subes a GitHub y Vercel lo actualiza solo:

```bash
git add .
git commit -m "anrnado boton de reserva"
git push
```

Y en 1 minuto tu URL de Vercel tiene el cambio.

---

## ¿Y si me lio?

Cosas que puedes decirle a Arnes en cualquier momento:

| Si dices | Yo hago |
|----------|---------|
| **«¿Donde estoy?»** | Te resumo en que paso vamos. |
| **«Explicame esto como si tuviera 10 anros»** | Te lo simplifico al maximo. |
| **«Pausa»** | Paro y te dejo pensar. |
| **«Cancela»** | Deshago todo. Tu disco como estaba. |
| **«No entiendo este comando»** | Te explico que hace y por que. |

Y si te quedas atascado: la comunidad iAmasters esta para ayudarte
(Skool + WhatsApp).

---

## ¿Que viene despues?

Cuando este primer proyecto funcione y te sientas comodo:

1. **Anrnadirle mas paginas:** «Quiero anrnadir una pagina /servicios».
2. **Anrnadirle formulario:** «Quiero un formulario de contacto que me llegue al email».
3. **Anrnadirle base de datos:** «Quiero que la gente pueda registrarse y guardar sus datos».
   - Aqui Arnes te va a decir: «vamos a upgradear esto a la plantilla con
     Supabase, que te aniade login y base de datos. ¿Adelante?»
4. **Anrnadirle pagos:** «Quiero cobrar 10 EUR por reservar».

Cada vez que pides algo mas serio, Arnes te sugiere subir un nivel.
**Empezar simple es lo mejor. La complejidad llega cuando la necesitas.**

---

## Ejemplo de spec rellena

Si quieres ver como se ve un proyecto «en serio» (Modo Estandar o PRO),
mira `tutorial/ejemplo-spec-rellena/landing-personal/`. Ahi tienes un
ejemplo de feature completa: spec, tests y el codigo resultado.

No tienes que entenderlo todo. Solo echar un ojo si tienes curiosidad.

---

## Resumen del tutorial

| Paso | Que haces | Tiempo |
|------|-----------|--------|
| 1 | Pides la web en castellano | 30s |
| 2 | Respondes 2-3 preguntas de Arnes | 1 min |
| 3 | Esperas mientras se construye | 2-3 min |
| 4 | `pnpm dev` y abres localhost | 1 min |
| 5 | Subes a Vercel y publicas | 5 min |
| **Total** | **Tu primer proyecto online** | **~30 min** |

---

## Si necesitas ayuda

- **Comunidad iAmasters Academy:** Skool + WhatsApp.
- **Cafe Camaleonico:** todos los lunes a las 19:00, donde resolvemos
  dudas en directo.
- **Github de la skill:** https://github.com/iamasters-academy/arnes (privado).

¡A por la primera web!
