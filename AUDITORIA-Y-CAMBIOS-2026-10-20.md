# ClukyBook For Kids — Auditoría del código subido y cambios del 2026-10-20

Proyecto examinado completo: 43 archivos, ~8,200 líneas (Vite + React 19 + TypeScript + Firebase).

## ✅ Lo que YA tenías (verificado en el código, no de oídas)

- **La plataforma completa:** roles Niño / Padre / Maestro con Auth de Firebase (Google y correo), avatar animal (9 opciones) y perfil personalizable por color.
- **Muro (Feed), Mi Cuaderno, Amigos con aprobación de los papás, galería de Fotos y Videos, Mi Clase con tareas, Panel de la Maestra y Panel de Padres** (congelar cuenta, pausa de pantalla, tiempo de pantalla, lista negra y hasta un simulador para probar el filtro).
- **Código Rojo real en el cliente** (`src/services/safetyFilter.ts`, 338 líneas): normaliza texto para cazar evasiones ("waaaatsaaap"), detecta números de teléfono disfrazados, clasifica amenazas (sacar al niño a WhatsApp/llamadas, pedir secretos, citas a escondidas, pedir fotos, pedir datos, amenazas) y trabaja en 3 niveles: amarillo retiene, naranja bloquea, **rojo bloquea antes de entregar y levanta la alerta**.
- **Botón SOS**, modo claro/oscuro, sonidos con WebAudio y diseño de 1 clic.
- **Firestore:** publicaciones en tiempo real (onSnapshot) con respaldo en localStorage para todo lo demás; `firestore.rules` con denegación por defecto y validación de esquemas.
- **Juegos de diversión:** Memorama, Atrapa las Estrellitas (arcade), Pintorcito Mágico y Piano de la Granja.

## 🎓 Lo que se AGREGÓ en esta entrega: Zona de Aprendizaje

Nueva pestaña **«Aprender»** en la navegación, con nivel por edad (5-7 / 8-10 / 11-12) y tarjeta de progreso con estrellitas (guardado en localStorage, mismo patrón que el resto de la app):

1. **✏️ Traza Letras** — aprender a escribir: letra guía gigante, trazo con dedo/mouse (Canvas + Pointer Events), colores, borrar y botón de escuchar la letra.
2. **🔤 Palabras Mágicas** — aprender a leer: completar sílabas y vocabulario por nivel, con botón para escuchar cada palabra.
3. **📖 Cuento en Voz Alta** — 3 cuentos cortos que la plataforma lee línea por línea (voz del navegador, SpeechSynthesis) con pregunta de comprensión al final.
4. **➕ Mates Divertidas** — cuentas generadas por nivel: sumas con dibujos para contar (5-7), sumas/restas/multiplicación (8-10), multiplicación/división/fracciones (11-12).
5. **🎨 Club de Talentos** — manualidades paso a paso "enseñadas por otros niños" (origami, dibujo del zorrito, plastilina, avión de papel, tarjeta, pulsera), con materiales, pasos numerados, botón «¡Yo lo intenté!» y compartir el logro en el muro (pasa por el mismo flujo seguro de publicación).

El progreso alimenta la tarjeta **Mi Progreso** y el botón «Compartir mi logro» publica en el Feed como cualquier publicación normal.

## 🔧 Arreglos hechos de una vez

1. **Bug real de avatares rotos:** en `AuthModal` y `ConversationsView` se usaban props que no existen (`avatar=` / `size=`) en 6 lugares; el componente espera `animal=` + `className`. Corregido: TypeScript pasó de **6 errores a 0**.
2. **Seguridad — lectura pública de posts:** `firestore.rules` traía `allow read: if true` en posts y comentarios: cualquiera sin sesión podía leer contenido de niños conociendo el ID. Ahora exige sesión iniciada. ⚠️ **Hay que PUBLICAR estas reglas en Firebase Console** para que el arreglo viva en la nube (la sonda vacía `test/connection` se dejó pública a propósito: no contiene datos).
3. **Open source limpio:** se eliminó `@google/genai` de las dependencias — estaba declarado y mencionado en `metadata.json`, `README.md` y `.env.example`, pero **no se usa ni una sola vez en `src/`**. Todo lo nuevo corre con estándares del navegador y las librerías ya presentes. Detalle de licencias en `OPEN-SOURCE.md`.
4. **`package-lock.json` incluido** (antes solo venía `bun.lock`).

**Verificación:** `npm install` OK, `npx tsc --noEmit` = **0 errores**, `npm run build` = **OK**.

## ⚠️ Lo que TODAVÍA falta (honesto, por orden de importancia)

1. **La alarma push real al dispositivo del padre.** Hoy el Código Rojo corre solo en el navegador del niño. Para que el padre reciba la alarma con la app cerrada faltan **Cloud Functions + Firebase Cloud Messaging** en el servidor. Es el siguiente paso grande.
2. **Firebase Storage — actualizado en esta entrega.** Se integró subida de fotos, GIFs y videos a Firebase Storage y Firestore guarda únicamente la URL. Para activarlo en producción, habilita Storage en Firebase y publica las reglas del archivo `storage.rules`.
3. **El progreso de aprendizaje aún es local.** Vive en el dispositivo (localStorage). Para que papás y maestros lo vean en sus paneles falta sincronizarlo a Firestore (colección nueva + sus reglas).
4. **Contradicción por decidir (no la toqué):** tu regla #2 era **"cero chat privado"**, pero el código trae **Mensajería 1 a 1 entre niños** (`ConversationsView`), aunque filtrada por el Código Rojo. Tú decides: se queda como "mensajería supervisada" o se elimina.
5. **Tests de reglas prometidos y ausentes:** `security_spec.md` describe `firestore.rules.test.ts` con 12 ataques que deben rechazarse; el archivo no existe.
6. **Instalación con npm a la primera:** el proyecto venía con conflicto de dependencias (Vite 8 pide esbuild ^0.27 y el proyecto fija ^0.25); con npm hay que usar `--legacy-peer-deps` (con bun, que es de donde salió, no pasa). Conviene unificar versiones.

## No verificado

La app corriendo contra el Firebase real del proyecto (es el proyecto de AI Studio): como siempre, la prueba final es abrirla en tu navegador/Windows, entrar a la pestaña **Aprender** y jugar cada actividad.

---

## 👁️ Agregado el mismo día (segunda entrega): Panel de Supervisión de Mensajes

A petición de Memento, el Panel de Padres ahora tiene la pestaña **«Mensajes supervisados»**:

- El tutor ve la **lista de conversaciones** de su hijo y la **transcripción completa** de cada una, con autor, hora y la marca de que cada mensaje pasó la revisión del Código Rojo antes de entregarse.
- Los mensajes **rojos no aparecen en la transcripción**: nunca se entregaron; viven como evidencia en la pestaña de Alertas, con su botón de bloquear y descargar evidencia.
- Es supervisión **declarada, no oculta**: la pantalla de Mensajes del niño ya avisa que está supervisada en tiempo real; el panel lo repite en su texto de cabecera.
- `firestore.rules`: nueva función `isParent()` — las conversaciones y sus mensajes ahora también se pueden **leer** con una cuenta cuyo rol registrado sea `parent`. Nadie más gana acceso; crear mensajes sigue limitado a los participantes.

**Límites honestos de esta versión:**
1. El vínculo padre↔hijo en las reglas es **por rol** (toda cuenta `parent` registrada puede leer). Para producción falta guardar `linkedChildId` en el documento del padre y exigir que la conversación sea de **su** hijo; la nota quedó escrita en el propio archivo de reglas.
2. La supervisión entre dispositivos distintos depende de la misma sincronización con Firestore y de **publicar estas reglas** en Firebase Console; en un mismo dispositivo/navegador funciona con el respaldo local, como el resto de la app.
3. La revisión sigue ocurriendo en el navegador del niño. La versión de servidor (Cloud Functions, que además prendería la alarma push con la app cerrada) sigue siendo el paso grande pendiente, igual que antes.

**Cómo calarlo:** entra como niño → Mensajes → envía un mensaje normal y uno de prueba tipo «sal de aquí a WhatsApp». El normal debe aparecer en la transcripción del Panel de Padres → Mensajes supervisados; el peligroso **no** debe aparecer ahí, sino en Alertas Código Rojo con su texto y evidencia.

---

## 🚦 Agregado el mismo día (tercera entrega): Regla de Publicación de Contenido

Regla dictada por Memento: los niños SÍ pueden publicar fotos de lo que hacen y videos grabados por ellos, siempre que no haya desnudez, contenido sexual, agresión, ofensas ni malas palabras. Lo que infrinja **no se comparte** y la plataforma muestra el mensaje oficial.

**Cómo quedó implementado:**

1. **Texto y descripciones — filtro ampliado** (`safetyFilter.ts`): dos categorías nuevas del Código Rojo:
   - `lenguaje_ofensivo`: malas palabras e insultos en español y frases de agresión ("te voy a pegar…"). La lista vive en un solo lugar y se puede extender.
   - `contenido_no_apto`: referencias a pornografía, desnudez y violencia gráfica.
   Probado con 7 casos (groserías, agresión, "video porno", grooming, texto limpio, la fábula de "la zorra y las uvas" y "el cono de helado"): **7/7 correctos, sin falsos positivos** en los dos casos limpios con palabras parecidas.
2. **Mensaje oficial de rechazo**: al bloquearse una publicación o un mensaje, el niño ve: *«Este contenido no se puede compartir porque infringe las reglas de la plataforma»* + la explicación del filtro. Antes el chat dejaba pasar los niveles amarillo/naranja; ahora **también se bloquean** y quedan registrados para los padres.
3. **Fotos, videos y GIFs — aprobación previa de un adulto** (la compuerta real): con el Modo de Aprobación Estricta activo (viene encendido; el padre puede apagarlo en su panel), todo contenido visual de un niño nace **invisible** (`isApprovedByParent: false`): no aparece en el muro ni en su cuaderno. El niño ve el aviso «quedó en revisión: un adulto debe aprobarlo antes de que se vea». El adulto lo revisa en **Panel de Padres → Aprobación y Amigos → Publicaciones en Revisión**, con la imagen a la vista y dos botones: **Aprobar y publicar** / **No compartir** (se borra).

**Lo que NINGÚN código de navegador puede prometer (honesto):**
- Detectar desnudez o abuso **dentro de los píxeles** de una foto, o malas palabras **habladas dentro del audio** de un video, de forma confiable y automática. Existen modelos open source de apoyo (p. ej. clasificación de imágenes NSFW con TensorFlow.js), pero fallan, se pueden burlar y **jamás** sustituyen la revisión; el detector mundial de material de abuso infantil funciona con huellas de material ya conocido (PhotoDNA y similares) y es servicio de servidor para plataformas verificadas, no una librería.
- Por eso la barrera verdadera de ClukyBook es la **aprobación previa de un adulto**: lo no aprobado, no se ve. Si mañana se quiere ayuda automática sobre la imagen, se agrega como **segunda opinión** para el adulto que aprueba, nunca como juez único.
- La revisión de servidor (Cloud Functions) sigue pendiente como paso grande: movería este mismo filtro fuera del navegador y prendería la alarma push.

**Cómo calarlo:** como niño, publica (1) una foto con texto limpio → debe quedar "en revisión" y NO aparecer en el muro; (2) un texto con una mala palabra → debe salir el mensaje oficial de rechazo; (3) entra al Panel de Padres → Aprobación y Amigos → aprueba la foto → ahora sí aparece en el muro.

---

## 🌎 Agregado el mismo día (cuarta entrega): Botón de Idiomas ES / EN / PT

A petición de Memento: botón **🌐 ES | EN | PT** en la cabecera (junto al botón de modo Día/Noche).

**Cómo está hecho:**
- Diccionario propio del proyecto (`src/i18n/dictionary.json`): **619 textos exactos + 18 fragmentos**, traducidos a inglés y portugués brasileño. Cubre navegación, botones, paneles de padres y maestra, juegos, la Zona de Aprendizaje completa (con cuentos y manualidades), mensajes del Código Rojo, textos de ejemplo y las frases con nombres/números variables (patrones con `{}`: "Tutor de {}", "¿Cuánto es {} + {}?", "Alertas Código Rojo ({})"...).
- Motor de traducción en vivo (`src/i18n/domTranslator.ts`): traduce los textos visibles y los atributos (placeholder, title, aria-label, alt) y sigue traduciendo lo que la app dibuje después (cambio de pestañas, modales, mensajes nuevos) con un MutationObserver. Al volver a **ES** restaura el original sin recargar.
- El idioma elegido se guarda en el dispositivo y la voz de los cuentos y actividades lee en el idioma elegido (es-MX / en-US / pt-BR).
- La guía de subida (`SUBIR-A-GITHUB-Y-NETLIFY.txt`) y el `netlify.toml` de la versión anterior se mantienen.

**Verificado en Chromium real** (no solo compilación): la app construida se abrió, se pulsó **EN** y aparecieron "Home / My Notebook / Messages / Help!", el título de la pestaña cambió a inglés y `lang="en"`; con **PT** aparecieron "Início / Meu Caderno / Mensagens" y en Juegos "Jogo da Memória / Pintorzinho Mágico"; navegando a Aprender en inglés se vio "Learning Zone / Trace Letters / Fun Math / Talent Club / My Progress"; al volver a **ES** todo regresó al español. TypeScript: **0 errores**; build: **OK**.

**Alcance honesto:** se traduce toda la interfaz y el contenido de la plataforma (incluido el contenido de ejemplo). Lo que un niño escriba (sus mensajes y publicaciones reales) **no** se autotraduce: es contenido de usuario, y traducirlo automáticamente requeriría un servicio de traducción automática en servidor — queda como opción futura si se quiere.


## Complemento de carga multimedia — 2026-10-20

- Se añadieron selectores de archivos locales independientes para imagen/foto, video y GIF animado.
- Validación de tipo y tamaño: imágenes hasta 15 MB, GIFs hasta 20 MB y videos hasta 100 MB.
- Vista previa local antes de publicar.
- Subida a Firebase Storage con sesión iniciada; Firestore recibe la URL, no el archivo binario.
- La galería combina publicaciones con medios subidos en el estado actual de la aplicación y permite reproducir videos subidos.
- Configuración necesaria para producción: habilitar Firebase Storage y publicar `storage.rules`. No se cambiaron los demás módulos ni la lógica existente de seguridad de publicaciones.
- Verificación de build: no completada en este entorno porque la instalación de dependencias quedó bloqueada/agotada por el entorno de ejecución. Ejecutar `npm ci --legacy-peer-deps` y `npm run build` antes de desplegar.
