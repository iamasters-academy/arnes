# Spec: Landing personal con boton de reserva

**Estado:** approved
**Autor:** spec-writer (Modo Estandar)
**Fecha:** 2026-05-20
**Proyecto:** landing-personal

---

## Resumen

Una pagina web simple que se presente como Angel Aparicio (formador de IA)
y permita reservar una llamada gratuita de 30 minutos.

---

## Motivacion

Necesito un sitio publico que me identifique y por el que la gente pueda
agendar llamadas conmigo sin tener que escribirme por whatsapp.
Actualmente uso solo Linkedin, pero quiero algo mio para enlazar desde
TikTok e Instagram.

---

## Escenarios

- **E1**: el usuario entra en la URL principal y ve: mi nombre, una frase
  corta sobre que hago, y un boton «Reservar llamada».
- **E2**: el usuario hace click en «Reservar llamada» y se abre Cal.com en
  una nueva pestanra para elegir hueco.
- **E3**: el usuario ve abajo enlaces a mi Linkedin, TikTok e Instagram.
- **E4**: la pagina se ve bien tanto en movil como en ordenador.

---

## Reglas de negocio

- El boton «Reservar llamada» abre la URL de Cal.com en una pestanra nueva
  (target="_blank").
- Los enlaces de redes sociales abren igual en pestanra nueva.
- No hay formulario propio (toda la reserva se gestiona en Cal.com).

---

## Datos

Esta feature no necesita base de datos. Toda la informacion (nombre,
descripcion, URLs) va hardcodeada en el codigo del componente.

---

## Casos raros

- **¿Que pasa si el usuario tiene JavaScript desactivado?**
  La pagina sigue mostrando el contenido (es server-side). El boton sigue
  funcionando porque es un `<a>` normal con `href`.

- **¿Que pasa si Cal.com esta caido?**
  El usuario ve la pagina caida de Cal.com. Para v0.1 es aceptable.
  En v0.2 podriamos anrnadir un email de contacto como fallback.

- **¿Que pasa si la URL de Cal.com cambia?**
  Esta hardcodeada. Si cambia, hay que editar el codigo y volver a desplegar.
  Para v0.2 podriamos mover URLs a variables de entorno.

---

## Fuera de alcance (v0.1)

- Formulario de contacto propio (uso Cal.com).
- Recogida de emails (newsletter).
- Login de usuarios.
- Base de datos.
- Analytics (lo anrnadiremos despues con Plausible).

---

## Dependencias

- Cal.com URL: `https://cal.com/angel-aparicio/llamada-30min` (ya existente).
- Vercel deploy (cuenta ya existente).
