<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8a7e9d52-aa61-4488-b131-091e42d8b73b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. No se requiere ninguna clave de IA: la app usa Firebase (ver firebase-applet-config.json) y la voz del navegador
3. Run the app:
   `npm run dev`


## Carga de archivos multimedia

Los formularios permiten seleccionar fotos/imágenes, videos y GIFs animados desde el dispositivo y ver una vista previa antes de publicar. Los archivos se suben a Firebase Storage y las publicaciones guardan la URL en Firestore, evitando incrustar archivos grandes en documentos.

**Configuración requerida una sola vez en Firebase:** habilita Storage y publica las reglas incluidas en `storage.rules`. La subida requiere que el usuario haya iniciado sesión. Límites del formulario: imágenes 15 MB, GIFs 20 MB y videos 100 MB. Si Storage no está habilitado o las reglas no se han publicado, el formulario mostrará un mensaje de error en lugar de fingir que el archivo se guardó.


## Búsqueda global añadida
- Buscador visible en la cabecera y en el perfil infantil.
- Busca amigos previamente aprobados, Little Pages y Little Groups guardados en el navegador.
- Por seguridad, no expone un directorio público de niños ni muestra contactos no aprobados.
- Los resultados de páginas y grupos abren la sección correspondiente de Little World.
