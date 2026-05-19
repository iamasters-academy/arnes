# Glosario para vibe-coders

Si alguna palabra te suena a chino, mirala aqui. **Aprenderlas no es obligatorio**:
Arnes te lleva de la mano sin pedirte que entiendas estos terminos. Pero si
tienes curiosidad o quieres saber QUE esta haciendo la IA por debajo, este
es tu sitio.

---

## Las palabras que mas oiras con Arnes

### Spec (especificacion)
**Que es:** Una descripcion clara de **que** quieres que haga tu app.
**Como lo decimos en Arnes:** «el blueprint» o «el mapa de tu idea».
**Por que importa:** Si no escribes esto primero, la IA inventa cosas y luego no funcionan.

### Plan
**Que es:** Una descripcion de **como** se va a construir la idea.
**Como lo decimos:** «el plan de construccion».
**Por que importa:** Te ensena que ficheros se van a tocar antes de tocarlos.

### Tasks (tareas)
**Que es:** El plan partido en pasos pequenos, uno a uno.
**Como lo decimos:** «los pasos».
**Por que importa:** Hace que la IA vaya despacio y sin saltarse cosas.

### Tests (pruebas)
**Que es:** Pequenas verificaciones automaticas que comprueban si tu codigo
funciona como dijiste que iba a funcionar.
**Como lo decimos:** «las comprobaciones» o «las verificaciones».
**Por que importa:** Sin esto, la IA te dice «si, funciona» y luego algo se
rompe a la semana.

### TDD (Test-Driven Development)
**Que es:** Una forma de programar donde primero escribes las comprobaciones
y despues el codigo que las hace pasar.
**Como lo decimos:** «primero las comprobaciones, luego el codigo».
**Por que importa:** Garantiza que tu codigo hace exactamente lo que dijo
que iba a hacer.

### SDD (Spec-Driven Development)
**Que es:** Una forma de programar donde primero escribes que quieres y
despues programas.
**Como lo decimos:** «primero el blueprint, luego el codigo».
**Por que importa:** Evita que tu app tenga 1000 cosas que nadie pidio.

### Review (revision)
**Que es:** Otra IA mira el codigo y dice si esta bien hecho.
**Como lo decimos:** «la revision».
**Por que importa:** Una IA escribe, otra revisa. Asi se cazan errores.

### Adversarial review
**Que es:** Una IA mas dura que busca activamente fallos de seguridad o
casos raros que se hayan colado.
**Como lo decimos:** «el escéptico» o «la revision dura».
**Por que importa:** Es el ultimo filtro antes de cerrar una feature.

---

## Seguridad

### Secrets
**Que es:** Datos sensibles como claves, contrasenas, tokens.
Por ejemplo, la clave que conecta tu app con Stripe (pagos) o con OpenAI.
**Por que importa:** Si los publicas por accidente en internet, alguien
los puede usar y gastarse tu dinero. Arnes los bloquea automaticamente
antes de que se publiquen.

### .env / .env.local
**Que es:** Un fichero secreto donde guardas las claves de tu app.
**Como lo decimos:** «el cofre de claves».
**Por que importa:** Va guardado en tu ordenador, NUNCA se sube a internet.

### RLS (Row-Level Security)
**Que es:** Las reglas de Supabase que deciden quien puede ver y modificar
cada fila de tu base de datos.
**Como lo decimos:** «permisos de privacidad».
**Por que importa:** Sin esto, cualquier usuario podria ver los datos de
los demas. Es lo unico que separa «app segura» de «filtracion de datos».

### OWASP Top 10
**Que es:** Una lista de los 10 errores de seguridad mas comunes en apps web.
**Como lo decimos:** «las 10 trampas mas comunes».
**Por que importa:** Arnes revisa los 10 en cada feature, no las tienes
que conocer tu.

### Validacion
**Que es:** Comprobar que lo que el usuario te envia es lo que esperabas.
**Como lo decimos:** «verificacion de datos de entrada».
**Por que importa:** Si no validas, el usuario te puede meter datos raros
que rompan tu app o te abran agujero de seguridad.

### Zod
**Que es:** Una herramienta para validar datos.
**Como lo decimos:** «el validador».
**Por que importa:** Es lo que Arnes usa para verificar inputs sin que tu
tengas que pelearte con expresiones regulares.

---

## Base de datos

### Tabla
**Que es:** Una «hoja de Excel» dentro de tu base de datos.
Por ejemplo, una tabla `usuarios` con columnas `email`, `nombre`, `fecha_registro`.

### Columna / campo
**Que es:** Cada «columna» de esa hoja de Excel.

### Migracion
**Que es:** Un fichero SQL que dice «vamos a anadir esta tabla nueva» o
«vamos a anadir esta columna nueva».
**Como lo decimos:** «cambios en la estructura de la base de datos».
**Por que importa:** Sin migraciones, los cambios a la BD se pierden cuando
otra persona se baja tu codigo.

### Schema (esquema)
**Que es:** La «estructura» de tu base de datos: que tablas hay, que columnas,
que tipos de dato.
**Como lo decimos:** «la estructura».

### Supabase
**Que es:** El servicio que te da base de datos + login de usuarios + ficheros
casi gratis.
**Como lo decimos:** «la base de datos en la nube».
**Por que importa:** Sin esto tendrias que configurar 5 servicios distintos
y nadie quiere eso.

---

## Frontend / Backend

### Frontend
**Que es:** La parte de tu app que ve el usuario (pantallas, botones).
**Como lo decimos:** «la cara» de la app.

### Backend
**Que es:** La parte de tu app que el usuario no ve (la logica, la base de datos).
**Como lo decimos:** «el motor» de la app.

### Componente
**Que es:** Una pieza de la pantalla reutilizable. Por ejemplo, un boton, un
formulario, una tarjeta.

### Endpoint
**Que es:** Una «direccion» a la que tu app llama para hacer algo.
Por ejemplo, `/api/marketplaces` es donde llamas para listar tus marketplaces.
**Como lo decimos:** «la direccion».

### Server action
**Que es:** Una funcion del backend que se llama desde el frontend de forma simple.
**Como lo decimos:** «accion del servidor».
**Por que importa:** Es la forma moderna de hacer cosas en Next.js sin tener
que configurar endpoints a mano.

### Middleware
**Que es:** Un filtro que pasa por delante de cada peticion antes de procesarla.
Por ejemplo: «verifica que el usuario esta logueado antes de dejarle entrar
a /dashboard».

### Next.js
**Que es:** El framework de React que usa Arnes.
**Como lo decimos:** «el armazon del frontend».

### React
**Que es:** La libreria con la que se construyen las pantallas.
**Como lo decimos:** «la herramienta de componentes».

### Tailwind
**Que es:** Una forma de poner estilos (colores, espacios, tamanos) muy rapido.
**Como lo decimos:** «el sistema de estilos».

---

## Git / control de versiones

### Git
**Que es:** El sistema que guarda el historial de cambios de tu codigo.
**Como lo decimos:** «el historial».

### Commit
**Que es:** Una «foto» del estado de tu proyecto en un momento dado.
**Como lo decimos:** «punto de guardado».
Es como pulsar «Guardar» en una partida de videojuego.

### Branch (rama)
**Que es:** Una linea paralela de cambios. Como una bifurcacion del proyecto.
**Como lo decimos:** «rama».

### Repository (repo)
**Que es:** Toda la carpeta de tu proyecto guardada con su historial git.

### Pull Request (PR)
**Que es:** Una propuesta de cambios que se revisa antes de aceptar.

### .gitignore
**Que es:** Un fichero que dice «estas cosas NO se suben al repositorio».
Por ejemplo, `.env.local`, `node_modules/`.

### GitHub
**Que es:** La pagina web donde se guardan repositorios git.

### Pre-commit hook
**Que es:** Una verificacion automatica que pasa antes de guardar (`commit`).
**Como lo decimos:** «verificador automatico».
**Por que importa:** Es lo que evita que publiques secrets por accidente.

---

## Conceptos Arnes

### Gate (puerta)
**Que es:** La pregunta que Arnes te hace al inicio: «¿Modo profesional o
arranque rapido?»
**Por que importa:** Te deja decidir cada vez si quieres rigor o velocidad.

### Atomicidad
**Que es:** Que una operacion grande se hace **entera** o **nada**.
**Como lo decimos:** «todo o nada».
**Por que importa:** Si algo se rompe a la mitad, Arnes lo deshace todo en
vez de dejarte con un proyecto medio roto.

### Rollback
**Que es:** Deshacer todos los cambios que Arnes hizo.
**Como lo decimos:** «deshacer todo».

### Staging
**Que es:** Una carpeta temporal donde Arnes trabaja antes de tocar tu
proyecto real.
**Como lo decimos:** «zona de trabajo provisional».
**Por que importa:** Permite que si algo va mal, no se toca tu proyecto.

### Lock
**Que es:** Un «echar el pestillo» para evitar que dos sesiones trabajen
sobre el mismo proyecto a la vez.
**Como lo decimos:** «cerrojo».

### Auto-resume
**Que es:** Si cierras la ventana y vuelves, Arnes sabe donde se quedo.
**Como lo decimos:** «retomar donde lo dejaste».

### AGENTS.md
**Que es:** Un fichero donde estan TODAS las reglas del proyecto, escritas
en un sitio, para que cualquier IA (Claude, ChatGPT, Copilot) las lea.
**Como lo decimos:** «el manual del proyecto».

### Multi-IA
**Que es:** Que tu proyecto funciona igual con cualquier IA (Claude, Codex,
Copilot, Gemini, Cursor) porque todas leen el mismo AGENTS.md.

### Skill
**Que es:** Una funcionalidad que extiende Claude Code, como esta misma.

---

## Stack tecnologico (las herramientas)

### PNPM
**Que es:** Una herramienta para instalar las dependencias de tu proyecto.
**Como lo decimos:** «el instalador de paquetes».
**Por que pnpm y no npm:** Mas rapido y usa menos espacio en disco.

### Node.js
**Que es:** El motor que ejecuta JavaScript fuera del navegador.
**Como lo decimos:** «el motor».

### TypeScript
**Que es:** JavaScript con tipos. Te avisa de errores antes de ejecutar el codigo.
**Como lo decimos:** «JavaScript con avisos».

### Vitest
**Que es:** La herramienta que ejecuta tests pequenos.
**Como lo decimos:** «el verificador rapido».

### Playwright
**Que es:** La herramienta que ejecuta tests grandes simulando un usuario real.
**Como lo decimos:** «el verificador completo» o «el robot que prueba la app».

### Vercel
**Que es:** El servicio donde se publica tu app en internet.
**Como lo decimos:** «el hosting».

---

## Si oyes algo que no esta aqui

Pidemelo y lo anado al glosario. Si una IA te dice algo y no lo entiendes,
pregunta: **"explicamelo como si tuviera 10 anos"**. Arnes nunca te debe
hablar en chino. Si lo hace, es un bug.
