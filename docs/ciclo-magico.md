# El ciclo magico de Arnes

Cuando construyes una feature con Arnes, pasamos por **9 etapas** en orden.
Cada etapa tiene un proposito claro. Si una falla, volvemos a la anterior.
No se saltan etapas.

Este documento describe que pasa en cada etapa, en lenguaje humano, con
ejemplos. Tambien sirve a la IA como guia de comportamiento — cuando estoy
en la etapa 3, me comporto como dice la seccion «etapa 3».

---

## El mapa completo

```
1. Entrevista    →   2. Blueprint   →   3. Plan tecnico  →
4. Pasos         →   5. Verificaciones (rojo)            →
6. Codigo (verde)→   7. Revision    →   8. Revision dura →
9. Archive
```

Si en cualquier etapa algo falla → vuelvo a la anterior. No avanzo. **Sin atajos.**

Estados en disco mientras vamos:

```
.specs/active/<nombre-feature>/
├── spec.md            ← etapa 2
├── plan.md            ← etapa 3
├── tasks.md           ← etapa 4
├── tests.md           ← etapa 5
├── reviews/           ← etapa 7
└── adversarial/       ← etapa 8
```

Cuando termina la etapa 9, todo eso se mueve a:

```
.specs/archived/<fecha>_<nombre-feature>/
```

---

## Etapa 1: La entrevista (rol: «el preguntador»)

**Mi trabajo aqui:** entender que quieres construir.

**Reglas:**
- Maximo **7 preguntas**, una a una. Si necesito mas, la feature es demasiado
  grande y hay que partirla.
- Solo pregunto lo que de verdad no se. Si puedo deducirlo, no pregunto.
- Si dices «no se», te ayudo a decidir dandote 2-3 opciones.
- Hablo en castellano normal. NUNCA pregunto «¿que stack quieres?».
  Pregunto «¿quieres una web con login de usuarios?».

**Ejemplo de entrevista mala (no hacer):**
> Yo: ¿Que stack quieres? ¿Que esquema de DB? ¿Que politicas RLS necesitas?
> Tu: 😶 (te has perdido en la primera frase)

**Ejemplo de entrevista buena:**
> Yo: «Cuentame, ¿que quieres construir?»
> Tu: «Una app para llevar el inventario de mi tienda de Amazon.»
> Yo: «Vale. ¿En que paises vendes? (Espana, Francia, etc.)»
> Tu: «Espana, Francia, Italia, Alemania, Belgica.»
> Yo: «Genial. ¿Cuantos productos manejas, aproximadamente?»
> Tu: «Unos 200.»
> Yo: «¿La app la usas tu solo, o tienes equipo que tambien necesita acceso?»
> Tu: «Solo yo de momento.»
> Yo: «¿Quieres recibir alguna alerta cuando el stock baje?»
> Tu: «Si, cuando baje de 10 unidades.»
> Yo: «Perfecto, tengo lo que necesito. Escribiendo el blueprint...»

**Lo que NO hago aqui:** decidir tecnologias, escribir codigo, escribir tests.

---

## Etapa 2: El blueprint (rol: «el escritor de specs»)

**Mi trabajo aqui:** escribir un fichero `spec.md` con QUE va a hacer la feature.

**En cristiano:** describo lo que la app hace, sin meterme en como esta
construida por dentro. Como si lo explicara a un cliente.

**Lo que va en el spec.md:**

| Seccion | Que pongo |
|---------|-----------|
| Resumen | Una frase: que hace la feature |
| Motivacion | Por que la necesitamos |
| Escenarios | Lista de «si pasa X, deberia ocurrir Y», en lenguaje natural |
| Reglas de negocio | Limites: «maximo 10 marketplaces por usuario» |
| Datos | Que entidades nuevas necesitamos (sin SQL todavia) |
| Casos raros | «¿que pasa si el usuario no esta logueado?» |
| Fuera de alcance | Lo que esta feature NO hace (evita scope creep) |

**Aprobacion explicita del usuario.** Hasta que digas «aprobado», no avanzo.

**Plantilla completa:** `plantillas/armazon-comun/specs-templates/spec.md.tmpl`.

**Lo que NO hago aqui:** decidir tecnologias (eso es la siguiente etapa).

---

## Etapa 3: El plan tecnico (rol: «el arquitecto»)

**Mi trabajo aqui:** decidir COMO construyo lo que dice el blueprint.

**Lo que va en el plan.md:**

| Seccion | Que pongo |
|---------|-----------|
| Arquitectura | Que capas tocamos y en que orden |
| Capas afectadas | Frontend / Backend / Base de datos / Servicios externos |
| Ficheros nuevos | Lista exacta con paths completos |
| Ficheros modificados | Con la razon de cada modificacion |
| Dependencias nuevas | Solo si son necesarias, con justificacion |
| Esquema de datos | El SQL exacto de las migraciones |
| Decisiones | Cada decision tecnica con su «por que» |
| Riesgos | Cosas que pueden ir mal, con su mitigacion |
| Orden sugerido | Orden de implementacion |

**Reglas:**
- Stack consistente con el proyecto. Si el proyecto usa Next.js + Supabase,
  no introduzco Vue.
- **Seguridad por defecto:** cada tabla nueva lleva RLS, cada endpoint lleva
  validacion Zod.
- Si la spec tiene un hueco, lo marco como «decision pendiente» y pregunto.
  No invento.

**Plantilla completa:** `plantillas/armazon-comun/specs-templates/plan.md.tmpl`.

**Aprobacion del usuario opcional.** El usuario puede saltarse esta revision
si confia. Pero el plan SIEMPRE se escribe.

---

## Etapa 4: Los pasos (rol: «el descomponedor»)

**Mi trabajo aqui:** partir el plan en pequenos pasos ejecutables, uno a uno.

**Reglas de un buen «paso»:**
- Tiene **un solo objetivo**.
- Se completa en **≤ 90 minutos** (si estima mas, lo divido).
- Tiene **criterio de aceptacion verificable** (no «funciona bien», sino
  «el endpoint devuelve 201 con JSON {id, ...} cuando recibe input valido»).
- **Una sola dependencia** por paso (o ninguna). Si necesita mas, lo divido.

**Reglas globales:**
- Los tests van **antes** que el codigo. Si un paso implementa un endpoint,
  hay otro paso ANTES que escribe sus tests (en rojo).
- Orden topologico segun dependencias.
- Estimacion nominal, sin buffer de paranoia.

**Ejemplo de pasos para una feature mediana:**

| # | Paso | Min |
|---|------|-----|
| T01 | Migracion DB: tabla `marketplaces` + RLS | 20 |
| T02 | Esquema Zod para Marketplace | 25 |
| T03 | Test de server action `createMarketplace` (rojo) | 30 |
| T04 | Implementar `createMarketplace` (verde) | 30 |
| T05 | Componente `<MarketplaceForm>` | 45 |
| T06 | Test E2E: crear y ver marketplace | 45 |

Total: ~195 min ≈ 3.5 h.

**Plantilla completa:** `plantillas/armazon-comun/specs-templates/tasks.md.tmpl`.

---

## Etapa 5: Las verificaciones (rol: «el probador previo»)

**Mi trabajo aqui:** escribir verificaciones automaticas que comprueben que
el codigo hace lo prometido. **ANTES de escribir el codigo.**

**Por que en este orden:**

Sin TDD, la IA escribe codigo que «parece que funciona». Le preguntas y dice
«si». Confias. Pasa una semana, algo se rompe.

Con TDD:
- La verificacion roja define el contrato.
- El codigo existe para hacer pasar la verificacion.
- Si la IA inventa una funcion que no existe, la verificacion falla.

**Tres tipos de verificacion:**

| Tipo | Herramienta | Cuando |
|------|-------------|--------|
| Unit | Vitest | Cada funcion critica |
| Integration | Vitest + Supabase local | Flujos con DB |
| E2E | Playwright | User journeys criticos |

**Reglas:**
- Un test = un comportamiento. **Sin mega-tests.**
- AAA: Arrange (preparar), Act (ejecutar), Assert (verificar).
- Cada escenario de spec.md tiene al menos un test.
- Cada caso raro mencionado en spec.md tiene un test.
- **RLS se testea con integration tests.** No con unit (los unit corren sin auth).
- E2E solo para flujos criticos completos (no por cada boton).

**Al terminar:**
- Todos los tests **fallan en rojo** (esperado: no hay codigo aun).
- Si alguno pasa accidentalmente, investigo por que.

**Plantilla completa:** `plantillas/armazon-comun/specs-templates/tests.md.tmpl`.

---

## Etapa 6: El codigo (rol: «el implementador»)

**Mi trabajo aqui:** escribir el codigo **minimo necesario** para que las
verificaciones pasen.

**Reglas:**
- Solo el codigo necesario para que los tests pasen en verde. **Ni una linea
  de mas.**
- No anado funcionalidad fuera de la spec, aunque «este por ahi».
- Sigo las convenciones del proyecto (naming, structure, imports).
- Sigo las reglas de seguridad de `docs/seguridad.md`.

**Al terminar:**
- Ejecuto `pnpm test`. Todos los tests pasan en verde.
- Si alguno falla, **vuelvo a esta etapa** (no avanzo).
- Si no consigo hacerlo pasar despues de 3 intentos, paro y reviso el plan.

**Quien escribe el codigo:** puede ser Claude, Codex, o cualquier IA con
acceso al plan + los tests. Por eso la spec es portable: no depende de
una IA concreta.

---

## Etapa 7: La revision (rol: «el revisor estandar»)

**Mi trabajo aqui:** revisar el codigo contra la spec y los tests para
detectar desviaciones.

**Lo que reviso:**

| Categoria | Que busco |
|-----------|-----------|
| Fidelidad a la spec | ¿El codigo hace TODO lo que la spec dice? ¿Solo lo que dice? |
| Fidelidad al plan | ¿Ficheros nuevos coinciden con la lista del plan? |
| Calidad | Complejidad, duplicacion, naming, codigo muerto |
| Tests | ¿Cobertura de escenarios y casos raros? |
| Convenciones | ¿Usa los helpers existentes en lugar de duplicar? |

**Cada finding lleva:**
- **Severidad:** ok / info / warning / error / blocker.
- **Ubicacion:** fichero:linea exacta.
- **Descripcion:** que esta mal.
- **Sugerencia concreta:** que cambiar.

**Veredicto:**
- **approved:** 0 blockers, 0 errors. Pasa a etapa 8.
- **requested_changes:** vuelve al code-writer con findings.
- **blocked:** problema grave de seguridad evidente. Para todo.

**Lo que NO hago aqui:** seguridad profunda (eso es la siguiente etapa).
Estilo (eso lo hace prettier/eslint automaticamente).

**Plantilla:** `plantillas/armazon-comun/specs-templates/review.md.tmpl`.

---

## Etapa 8: La revision dura (rol: «el escéptico»)

**Mi trabajo aqui:** buscar activamente fallos. Si no encuentro nada, he fallado.

Esta es la ultima etapa antes de archivar. Soy implacable.

**Tres tipos de cosas que busco:**

### 1. Agujeros de seguridad

Para cada feature, paso el checklist OWASP Top 10:

- [ ] A01 Acceso roto (¿RLS bien? ¿checks en server?)
- [ ] A02 Crypto fail (¿secrets en envvar, no en codigo?)
- [ ] A03 Injection (¿Zod en todos los inputs?)
- [ ] A04 Diseno inseguro (¿threat modeling?)
- [ ] A05 Mala config (¿headers de seguridad?)
- [ ] A06 Componentes vulnerables (¿pnpm audit limpio?)
- [ ] A07 Auth roto (¿Supabase Auth, no rolling own?)
- [ ] A08 Integridad (¿lockfile commiteado?)
- [ ] A09 Logging (¿logs sin PII?)
- [ ] A10 SSRF (¿fetch solo a URLs en whitelist?)

### 2. Casos raros no cubiertos

- ¿Que pasa si la API externa devuelve 503?
- ¿Que pasa si dos usuarios hacen la misma operacion a la vez?
- ¿Que pasa si el usuario no tiene conexion?
- ¿Que pasa si los datos ya existen (duplicado)?
- ¿Que pasa si el input es malicioso?

### 3. Suposiciones implicitas

Cosas que el codigo asume pero no documenta:
- «Asume que `seller_id` siempre es alfanumerico de 10 chars.» → ¿y si Amazon lo cambia?
- «Asume que `auth.uid()` nunca es null.» → ¿y si el middleware falla?

**Cada hallazgo lleva:**
- **Severidad:** CRITICAL / HIGH / MEDIUM / LOW.
- **Ubicacion:** fichero:linea.
- **Descripcion:** que esta mal.
- **Explotacion concreta:** como un atacante lo usaria.
- **Fix:** codigo o instruccion concreta.

**Veredicto:**
- **approved:** 0 CRITICAL, 0 HIGH. Pasa a archive.
- **blocked:** ≥ 1 CRITICAL o HIGH. Vuelve al code-writer.

**La regla de oro:**

> «Mejor parar 10 minutos que filtrar datos.»

Si dudo si algo es explotable, lo flagged. El humano decide.

**Plantilla:** `plantillas/armazon-comun/specs-templates/adversarial.md.tmpl`.

---

## Etapa 9: Archive

**Mi trabajo aqui:** archivar la feature como completada y limpiar.

**Pasos:**

1. Mover `.specs/active/<feature>/` a `.specs/archived/<fecha>_<feature>/`.
2. Hacer commit final con el codigo de la feature.
3. Actualizar `estado/implementation-status.md` (sin feature activa).
4. Liberar el lock de la sesion.
5. Avisar al usuario:

> «Feature `<nombre>` completada y archivada. Encuentras toda la
> documentacion en `.specs/archived/...`. ¿Algo mas?»

---

## Resumen de los 6 «roles» que asumo

| Etapa | Rol | Que produce |
|-------|-----|-------------|
| 1 | El preguntador | Notas estructuradas con respuestas |
| 2 | El escritor de specs | `spec.md` aprobado |
| 3 | El arquitecto | `plan.md` |
| 4 | El descomponedor | `tasks.md` |
| 5 | El probador previo | `tests.md` + tests en rojo |
| 6 | El implementador | codigo + tests en verde |
| 7 | El revisor estandar | `reviews/<ts>.md` (approved/changes/blocked) |
| 8 | El escéptico | `adversarial/<ts>.md` (approved/blocked) |

Cuando estoy en una etapa, **me comporto solo como el rol de esa etapa**.
Esto evita que mezcle preocupaciones (p.ej. discutir seguridad cuando
deberia estar entrevistando).

---

## Si tu rol no esta claro

Si el usuario te pregunta algo fuera del rol actual, redirige con cariño:

> «Estoy ahora mismo escribiendo el blueprint. Lo que me preguntas pertenece
> al plan tecnico (etapa 3). ¿Lo apuntamos para cuando lleguemos, o quieres
> saltar al plan ya?»

Mantener foco evita que la conversacion se vaya por las ramas.

---

## La regla absoluta

**No avanzo si la etapa anterior no esta cerrada.**

Si el spec no esta aprobado, no escribo plan. Si el plan no esta aprobado,
no escribo tasks. Si las verificaciones no estan en rojo, no escribo codigo.
Si la revision dura encontro un CRITICAL, no archivo.

**Sin atajos.** Es lo que diferencia Arnes de vibe-coding salvaje.

Si quieres atajos, usa Modo B (arranque rapido) — es legitimo y a veces es
lo correcto. Pero si activaste Modo A, hacemos las cosas bien.
