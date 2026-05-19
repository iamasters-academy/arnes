# Atomicidad: «todo o nada»

Una operacion grande de Arnes (montar un proyecto, anrnadir una feature
compleja) implica decenas de pasos. Si algo falla a la mitad, lo normal
seria quedar **con el proyecto medio roto** y no saber por que.

Atomicidad significa: **o se hace todo, o no se hace nada**. Si algo falla,
tu disco vuelve a estar exactamente como estaba antes de empezar.

---

## La metafora del autoguardado del videojuego

Cuando juegas a un videojuego, el autoguardado funciona asi:

1. El juego va guardando tu progreso en un fichero temporal.
2. Cuando termina de guardar, **mueve el fichero temporal al final**.
3. Si se va la luz a la mitad del paso 1, el guardado anterior sigue intacto.

Arnes funciona igual:

1. Trabajo en una carpeta temporal llamada **staging** (`~/.arnes-staging/`).
2. Cuando todo esta verde en staging, **muevo todo de golpe** a tu proyecto.
3. Si algo falla en el paso 1, tu proyecto sigue intacto. Solo se borra staging.

---

## Como funciona en la practica

### Paso 1: Trabajo en staging

```
~/.arnes-staging/<id-sesion>/<nombre-proyecto>/
```

En esta carpeta monto:
- Estructura de carpetas.
- AGENTS.md y multi-IA symlinks.
- Plantillas Next.js.
- Migraciones SQL.
- Hooks de seguridad.
- `pnpm install` (descarga dependencias).

Mientras tanto, **tu carpeta destino esta intacta** (o ni siquiera existe
todavia).

### Paso 2: Si algo falla → rollback

Si en cualquier momento algo falla (red, error de configuracion, falta de
espacio en disco), **borro staging** y aviso.

Tu disco esta como estaba antes de empezar.

### Paso 3: Si todo va bien → mover de golpe

Cuando todo esta verde en staging, ejecuto:

```bash
mv ~/.arnes-staging/<id-sesion>/<nombre-proyecto> /destino/final/
```

Este `mv` es **una sola operacion atomica del sistema de ficheros**: o se
hace entera, o no se hace. No hay estados intermedios.

---

## El registro de operaciones (operations.jsonl)

Para poder deshacer, llevo un registro de cada cosa que toco:

```jsonl
{"ts":"2026-05-19T20:15:33Z","op":"mkdir","path":"/staging/mi-app"}
{"ts":"2026-05-19T20:15:34Z","op":"write","path":"/staging/mi-app/AGENTS.md","sha256":"abc..."}
{"ts":"2026-05-19T20:15:35Z","op":"symlink","from":"AGENTS.md","to":"CLAUDE.md"}
{"ts":"2026-05-19T20:15:40Z","op":"exec","cmd":"pnpm install","exit":0}
{"ts":"2026-05-19T20:16:02Z","op":"git-commit","msg":"scaffold inicial","sha":"abc123"}
{"ts":"2026-05-19T20:16:10Z","op":"mv","from":"/staging/mi-app","to":"/proyectos/mi-app"}
```

Cada linea es una operacion reversible. Si algo falla en la operacion 6,
leo las 5 anteriores y las deshago en orden inverso.

---

## Que se puede deshacer

| Hice | Lo deshago haciendo |
|------|---------------------|
| `mkdir` carpeta | `rmdir` (si esta vacia) |
| `write` fichero nuevo | `rm` el fichero |
| `write` modificando fichero existente | Restaurar desde snapshot guardado |
| `symlink` | `rm` del symlink |
| `mv` | `mv` inverso |
| `exec` (instalar paquete) | `pnpm remove` |
| `git-init` | `rm -rf .git` (solo si Arnes lo creo) |
| `git-commit` | `git reset --soft HEAD~1` |

**Para modificar ficheros existentes:** antes de tocar el fichero, hago
una copia en `.arnes-snapshots/<id-sesion>/<path>.bak`. Si hay rollback,
restauro desde ahi.

---

## Que NO se deshace automaticamente

Hay cosas que el ordenador no puede deshacer solo:

- **Pagos.** Si llame a una API que cobra (provisioning de Supabase pago,
  dominio de Vercel), no se deshace. Por eso Arnes evita estas llamadas
  hasta el ultimo paso, y siempre pide confirmacion humana primero.

- **Datos que el usuario haya anadido a mano** entre operaciones. Si Arnes
  esta a la mitad y editas un fichero, Arnes detecta el cambio (sha256
  distinto) y te pregunta antes de continuar.

- **Operaciones fuera del proyecto.** Arnes nunca toca archivos fuera del
  directorio del proyecto (excepto staging temporal). Si necesita salir,
  pide permiso explicito.

---

## Modo «adoptar»: backup obligatorio

Cuando Arnes adopta un proyecto existente, **siempre** hace un backup
completo del proyecto antes de tocar nada:

```
~/.arnes-backups/<nombre-proyecto>_<timestamp>/
```

Si el rollback automatico falla por algun motivo (raro), tienes el backup
manual:

```bash
rm -rf ~/proyectos/mi-app
cp -R ~/.arnes-backups/mi-app_2026-05-19_20-15-33 ~/proyectos/mi-app
```

El backup se conserva 30 dias por defecto. Configurable en `~/.arnes/config.yaml`.

---

## Cuando se invoca el rollback

### Automatico:
- Cualquier excepcion no controlada → rollback.
- Cualquier comando que devuelve error → rollback.
- Cualquier verificacion post-operacion que falla → rollback.
- Timeout > 5 min sin progreso → rollback.

### Manual (tu lo pides):
```
> Cancela el proyecto.
> Deshaz lo que has hecho.
> Rollback.
```

Cuando lo pides:
1. Leo `operations.jsonl`.
2. Deshago en orden inverso (la ultima operacion primero).
3. Te aviso con un resumen de lo que se deshizo.

---

## Estados de una sesion Arnes

```
idle → preparing → executing → finalizing → done
                       ↓
                   rollback → idle
```

| Estado | Que hago | Que hay en tu disco |
|--------|----------|---------------------|
| **idle** | Esperando que me digas que hacer | Sin cambios |
| **preparing** | Entrevista + plan + tu confirmacion | Sin cambios todavia |
| **executing** | Monto en staging | Solo staging (no proyecto final) |
| **finalizing** | `mv` atomico de staging → final | Proyecto final aparece de golpe |
| **done** | Termine, sesion cerrada | Proyecto listo |
| **rollback** | Deshago lo que hice | Vuelve a como estaba |

---

## Por que esto importa

Sin atomicidad, esto pasa:

> «Estaba creando el proyecto y se fue la luz. Ahora tengo medio AGENTS.md,
> el package.json a la mitad, y supabase no se instala. ¿Que hago?»
>
> «Pues ahora estas en un agujero. Tu disco esta en estado raro y nadie
> sabe que se ejecuto y que no. Empezar de cero o pelearte con la
> inconsistencia.»

Con atomicidad, esto pasa:

> «Se fue la luz, reinicio la sesion.»
>
> «Tu proyecto sigue como estaba antes (no se llego a mover de staging).
> ¿Reanudamos o cancelamos?»

Ese es el cambio.

---

## TL;DR

- Trabajo en staging temporal.
- Solo cuando todo esta verde, muevo a tu disco final (atomico).
- Si algo falla, deshago todo.
- Tu disco SIEMPRE queda consistente: o tienes el proyecto completo, o lo que tenias antes.
- Sin estados raros a la mitad.
