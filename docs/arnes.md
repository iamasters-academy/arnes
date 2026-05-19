# Manifiesto Arnes

> «La IA es un caballo desbocado. Le pides una cosa y te hace otra.
> Sin metodo, alucina. Arnes es el arnes que la sujeta.»
>
> — Fernando Montero, Cafe Camaleonico, 18 de mayo de 2026

---

## El problema

Cuando una IA programa sin metodo, pasan estas cosas:

1. **Alucina** — inventa funciones, librerias y APIs que no existen.
2. **Olvida** — pasa una sesion, pierde contexto, hace lo contrario de lo que pediste.
3. **Ignora reglas** — le dices «no toques esto» y lo toca.
4. **Deja agujeros de seguridad** — porque nadie le dijo que es seguro y que no.
5. **Produce codigo no mantenible** — porque programo sin pensar primero.

El resultado: proyectos que funcionan los primeros 20 minutos y luego son
imposibles de mantener. Y, peor, vulneran datos.

---

## La respuesta

Arnes impone **disciplina antes de la generacion**:

| Disciplina | Que hace |
|------------|----------|
| **Spec-Driven Development (SDD)** | Antes de programar, se escribe la especificacion. Es la fuente de verdad. |
| **Test-Driven Development (TDD)** | Antes de escribir codigo, se escriben los tests. El codigo existe para pasar los tests. |
| **Multi-agent isolation** | Cada fase (spec, plan, test, code, review) la hace una IA distinta con un rol unico. No contaminamos contexto. |
| **Adversarial review** | Una IA critica busca fallos antes de cerrar. Es despiadada. |
| **Atomic operations** | Si algo falla a la mitad, deshacemos todo. El proyecto nunca queda en estado inconsistente. |
| **Session locking** | Dos sesiones no pueden trabajar a la vez sobre el mismo proyecto. Una espera. |
| **Auto-resume** | Cierras la sesion, vuelves manana, Arnes sabe exactamente donde ibas. |

---

## Que garantiza Arnes

1. **El codigo siempre cumple lo que prometio.** La spec es la verdad.
2. **Los tests lo demuestran.** Si no pasa los tests, no se cierra la feature.
3. **Una IA critica busca fallos** antes de que lleguen a produccion.
4. **Nunca quedas en estado inconsistente.** Si algo falla, rollback total.
5. **Puedes parar y volver manana.** El estado vive en disco, no en el contexto.

---

## Que NO garantiza Arnes

- **No te hace senior si no lo eres.** Si tu spec es mala, el codigo sera malo
  (pero al menos sera un codigo malo que pasa unos tests malos, que es mas
  facil de arreglar que codigo sin tests).
- **No es rapido.** Esta disenado para el caso «quiero hacer las cosas bien»,
  no para «quiero un MVP en 5 minutos». Por eso el gate al principio.
- **No reemplaza el criterio humano.** Tu apruebas la spec, el plan, y la
  decision final. Arnes es el armazon, tu eres el constructor.

---

## Inspiracion

- **Fernando Montero** — `fs-scaffold`, presentado en Cafe Camaleonico
  del 18 de mayo de 2026. La idea original y las 21 fases que la moldearon.
- **Ricardo** (comunidad iAmasters) — trajo Spec-Driven Development a la
  comunidad en mayo de 2026.
- **OpenAI** — el informe interno de 9 meses sobre desarrollo colaborativo
  con IA que demostro que SDD + TDD reducen alucinaciones drasticamente.
- **Kent Beck** — Test-Driven Development, 2002. Veinticuatro anos despues,
  sigue siendo la mejor disciplina para escribir codigo que funciona.

---

## La regla, las mil tentaciones

La tentacion constante con la IA es saltarse pasos:

- «Esto es solo una prueba, no necesito spec.»
- «Es un cambio pequeno, no necesito tests.»
- «Ya lo reviso luego.»

Cada vez que cedes a la tentacion, se acumula deuda. La deuda se paga.
A los 3 meses, cuando algo se rompe en produccion y nadie sabe por que.

Arnes no acepta saltos. Si quieres ir rapido, usa modo B (arranque rapido,
sin Arnes). Si activas Arnes, vas por el camino completo. **Sin negociacion.**

Esa es la regla.

---

## Por que esto importa en 2026

En 2026, la barrera tecnica para programar ha caido al suelo. Cualquiera
puede pedirle a Cloud que monte un CRM, una landing, un dashboard.

Lo que separa a un proyecto profesional de un MVP frágil es **disciplina**:

- ¿Estan los datos seguros? (RLS, secrets, OWASP)
- ¿Es mantenible a 6 meses? (specs vivas, codigo testeado)
- ¿Se puede recuperar de un fallo? (atomicidad, rollback)
- ¿Funciona si cambias de IA en un ano? (multi-IA, AGENTS.md)
- ¿Lo entiendes tu mismo dentro de 3 meses? (documentacion viva)

Arnes responde «si» a las cinco preguntas. Eso es todo lo que hace.
Y por eso vale la pena los 15 minutos extra al principio.
