# docs/internos/ — documentacion no visible al usuario

Esta carpeta contiene **documentacion tecnica para la IA**, no para el
usuario final.

Los vibe-coders no tecnicos NO deben ver esta carpeta. Los conceptos
aqui (atomicidad, lock, manifest, multi-IA) son la fontaneria que hace
que Arnes funcione sin que el usuario se entere de ellos.

---

## Que hay aqui

| Doc | Para que |
|-----|----------|
| [atomicidad.md](atomicidad.md) | Como funcionan staging, rollback y `operations.jsonl` |
| [sesiones.md](sesiones.md) | Lock concurrente, auto-resume, `implementation-status.md` |

---

## Cuando consultarlas (Claude)

Cuando vas a operar sobre el disco — antes de tocar staging, antes de
hacer un rollback, antes de adquirir lock — debes haber leido los docs
relevantes de esta carpeta. Son las **reglas tecnicas** de como
implementa Arnes su filosofia de «todo o nada».

**Importante:** NO referencies estos docs en mensajes al usuario. Si el
usuario pregunta «¿que hace el rollback?», explicalo en lenguaje plano
(«deshago todos los cambios y tu disco vuelve a como estaba»), no le
mandes a leer `docs/internos/atomicidad.md`.

---

## Por que separados

Antes de v0.2.0, atomicidad y sesiones estaban en `docs/` junto a los
docs visibles al usuario. Eso era contradictorio con el espiritu de la
skill: el usuario no debe ver complejidad que no necesita.

Tras feedback de revision (mayo 2026): se mueven aqui. La carpeta
`docs/` ahora solo contiene lo que tiene sentido que el usuario lea por
su cuenta (manifesto, ciclo magico, glosario, seguridad).
