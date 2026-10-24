# Control por manos en la Zona de Juegos

Se agregó un control opcional y compartido en `src/components/HandGestureController.tsx`, activable desde el encabezado de la Zona de Juegos con el botón **Jugar con manos y cámara**. Puede usarse desde el menú y mientras se juega Memorama, Atrapa las Estrellitas, Pintorcito Mágico o Música de la Granja.

- Sigue la punta del dedo índice con la cámara.
- Mantener el dedo apuntando a un botón durante aproximadamente 0,8 segundos lo activa; también admite gesto de pinza.
- En el juego de dibujo, mantener la pinza mientras se mueve la mano dibuja en el lienzo.
- En Atrapa las Estrellitas, el movimiento del índice mueve al jugador cuando se apunta al lienzo.
- La cámara se apaga al cerrar el control o desmontar la Zona de Juegos.

Requiere permiso de cámara, conexión a Internet para descargar MediaPipe y HTTPS (o localhost). La cámara procesa el video localmente en el navegador; no se sube video a un servidor de esta función.

La compilación automática no se pudo completar en este entorno porque la instalación de dependencias excedió el tiempo disponible. Verificar con `npm ci`, `npm run lint` y `npm run build` antes de publicar.
