# ClukyBook For Kids — Registro Open Source

Regla del proyecto (la misma de QuanticTube y los demás): **solo código abierto con licencia apta para uso comercial** (MIT / Apache-2.0 / ISC / BSD). Nada GPL, nada AGPL, nada de modelos o servicios propietarios de IA.

## Librerías del proyecto y su licencia

| Pieza | Uso | Licencia |
|---|---|---|
| React / ReactDOM 19 | Interfaz | MIT |
| Vite 8 | Construcción y servidor de desarrollo | MIT |
| Tailwind CSS 4 | Estilos | MIT |
| Firebase JS SDK 13 | Auth, Firestore y Storage (cuenta y base de datos, no IA) | Apache-2.0 |
| lucide-react | Iconos | ISC |
| canvas-confetti | Celebraciones con estrellitas | ISC |
| motion | Animaciones | MIT |
| TypeScript | Lenguaje y verificación de tipos | Apache-2.0 |
| Express / dotenv | Utilidades heredadas de la plantilla | MIT / BSD-2-Clause |

## Lo que usa la Zona de Aprendizaje (nuevo, 2026-10-20)

Sin librerías nuevas. Todo corre con **estándares abiertos del navegador**:

- **Canvas 2D + Pointer Events** — trazo de letras con dedo, mouse o stylus.
- **SpeechSynthesis** — la voz incluida en el sistema operativo/navegador lee cuentos, letras y palabras. Sin claves, sin servicios externos, sin costo.
- **Web Audio API** — sonidos del proyecto (`soundEffects.ts`).
- **localStorage** — progreso del niño en su dispositivo, mismo patrón que el resto de la app.

## Lo que se sacó

- **`@google/genai`**: venía declarado en dependencias (y mencionado en `metadata.json`, `README.md` y `.env.example`) pero no se usaba en ninguna parte del código fuente. Eliminado el 2026-10-20 para mantener la plataforma 100% en la línea open source acordada.

## Nota sobre Firebase

Firebase se queda, como en QuanticTube, porque es **login, base de datos y almacenamiento** — no es el motor de IA de la app. La detección del Código Rojo es código propio del proyecto (`src/services/safetyFilter.ts`), sin servicios externos.
