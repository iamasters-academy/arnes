# Sesiones: «cerraste la ventana, vuelves, sigue donde ibas»

Trabajar con la IA tiene dos problemas tipicos:

1. **Pierdes contexto.** Cierras la ventana, vuelves manana, ya no sabes
   donde ibas. Le tienes que volver a explicar todo.

2. **Dos sesiones a la vez se pisan.** Abres una ventana, abres otra, ambas
   tocan el mismo proyecto, te quedas sin saber que paso.

Arnes resuelve los dos guardando **todo el estado en disco**, no en la
conversacion.

---

## El fichero que lo sabe todo

`estado/implementation-status.md` es donde Arnes apunta donde va. Se ve asi:

```markdown
# Implementation Status

**Proyecto:** mi-app-inventario
**Modo:** nuevo
**Active feature:** api-credentials
**Fase actual:** plan (esperando aprobacion del usuario)
**Ultima actualizacion:** 2026-05-19T20:34:12Z
**Sesion activa:** sess_a8f3c
**Host:** Macbook-Angel

## Fases completadas (feature activa)
- [x] gather (2026-05-19T20:15:00Z)
- [x] spec (2026-05-19T20:22:14Z)
- [ ] plan  ← en curso
- [ ] tasks
- [ ] tests
- [ ] code
- [ ] review
- [ ] adversarial
- [ ] archive

## Notas activas
- Usuario eligio Marketplaces: ES, FR, IT, DE, BE
- Selector ENV-based confirmado
```

Este fichero **se commitea al repo**. Asi, si trabajas con un companero, el
companero ve donde estabas tambien.

---

## El cerrojo: dos sesiones no se pisan

Cuando Arnes empieza a operar, deja un «cerrojo» en `estado/.lock`:

```json
{
  "session_id": "sess_a8f3c",
  "pid": 12345,
  "started_at": "2026-05-19T20:15:33Z",
  "current_op": "plan",
  "host": "Macbook-Angel"
}
```

Si otra sesion (otra ventana de Claude Code, o otro companero) intenta
empezar:

> «Hay otra sesion Arnes activa en este proyecto (sess_a8f3c, empezada hace
> 4 min, en fase "plan", host: Macbook-Angel). ¿Quieres:
>
> **[A] Esperar** a que termine.
> **[B] Forzar desbloqueo** (peligroso — solo si la otra sesion esta muerta).
> **[C] Abrir solo lectura** para ver el estado.»

Si eliges [B] tras confirmar, Arnes intenta deshacer lo que la sesion
anterior dejo a medias y libera el cerrojo.

---

## Volver donde lo dejaste (auto-resume)

Cuando vuelves a un proyecto Arnes (otra ventana, otro dia, otro ordenador),
te recibe asi:

> «Bienvenido de vuelta a `mi-app-inventario`.
>
> Estabas en modo «nuevo», feature `api-credentials`, fase «plan».
> El plan esta escrito pero esperando tu aprobacion.
> Ultima actividad: hace 6 horas.
>
> ¿Continuas (apruebas el plan), revisas el plan, o cancelas la feature?»

**Nunca tienes que recordar donde ibas. Arnes lo sabe.**

---

## Cerrojos huerfanos (sesiones muertas)

Si tu Claude Code se cierra de golpe (crash, perdida de internet, cierras
sin querer), el cerrojo se queda **huerfano**. Arnes lo detecta si:

- El cerrojo tiene > 1 hora de antiguedad **Y**
- No hay actividad en `operations.jsonl` desde hace > 1 hora **Y**
- El proceso (PID) del cerrojo ya no existe.

En ese caso, te ofrece auto-liberar:

> «Detecto una sesion Arnes muerta (sess_b2e1d, hace 3h, sin actividad).
> Voy a deshacer sus operaciones incompletas y liberar el cerrojo.
> ¿Procedo?»

---

## Trabajar en varios ordenadores

Si trabajas en Mac, pero a veces abres el proyecto en otro ordenador
(via git o Syncthing), funciona igual — **siempre que `estado/` este
sincronizado**.

**Que commitear y que no:**

```gitignore
# Si commitear:
# estado/implementation-status.md   (es util para review y trabajo en equipo)

# NO commitear:
estado/.lock                 (es local a la sesion activa)
estado/operations.jsonl      (es local a la sesion activa)
.arnes-staging/              (carpeta temporal)
.arnes-snapshots/            (snapshots de la sesion)
.arnes-backups/              (backups del modo adoptar)
```

---

## Trabajar en equipo

Si dos personas trabajan en el mismo proyecto:

1. **Persona A** activa Arnes, se crea el cerrojo.
2. **Persona B** intenta activar Arnes, ve el cerrojo, decide esperar.
3. Persona A termina, libera el cerrojo, commitea `implementation-status.md`.
4. Persona B hace `git pull`, ve el nuevo estado, continua.

Si A y B trabajan en features **distintas** al mismo tiempo, ambos pueden
activar Arnes a la vez **siempre que la feature activa sea distinta**. El
`implementation-status.md` solo lleva una feature activa, pero las
archivadas no entran en conflicto.

**Limitacion v1:** Arnes no auto-mergea operations.jsonl concurrentes. Si A
y B tocan `.specs/active/` al mismo tiempo, hay conflicto git. Se resuelve
manualmente. En v2 lo mejoramos.

---

## Comandos que puedes pedir en cualquier momento

| Si me dices | Yo hago |
|-------------|---------|
| «¿Donde voy?» | Leo `implementation-status.md` y te resumo |
| «Cancela la feature» | Rollback de la feature activa |
| «Libera el cerrojo» | Solo si la otra sesion esta muerta |
| «Pausa» | Paro y dejo el estado guardado en disco |
| «Sigue» | Continuo desde donde estabamos |
| «Archivame esto aunque no haya pasado adversarial» | NO. Te explico por que |

---

## Privacidad: que entra en `estado/`

`estado/` vive en el repo del proyecto. Por tanto:

- **NO** debe contener secretos (API keys, tokens, passwords).
- **NO** debe contener PII (emails reales de clientes, datos personales).
- **SI** puede contener: nombres de tablas, esquema BD, decisiones tecnicas,
  estado de fases.

Si una spec necesita referenciar secretos para entender el flujo, se
referencia **por nombre de variable de entorno**, no por valor:

```markdown
La feature usa `SUPABASE_SERVICE_ROLE_KEY` (definida en `.env.local`, no
en el repo).
```

---

## Por que importa

Sin esto, esto pasa:

> «Llevaba dos horas con una feature compleja, cerre la ventana sin querer.»
>
> «Pues ahora tienes que volver a explicarme todo el contexto. Spec
> aprobada hace 1h, plan a la mitad, no recuerdo si ya escribi los tests...»

Con esto, esto pasa:

> «Cerre la ventana sin querer, vuelvo manana.»
>
> «Yo: 'Estabas en mi-app-inventario, feature api-credentials, fase plan,
> esperando que apruebes el plan. ¿Continuas?'»

Ese es el cambio.

---

## TL;DR

- Todo el estado vive en disco, no en la conversacion.
- Cerrojo evita que dos sesiones se pisen.
- Auto-resume sabe donde lo dejaste, no tienes que recordar.
- Trabajo en equipo funciona porque `implementation-status.md` se commitea.
- Cerrojos huerfanos se detectan y limpian solos.
