# Instrucciones del proyecto

## Stack y arranque

- Usá Next.js App Router, React, TypeScript estricto, Tailwind CSS v4, GSAP, Node.js 24 y npm. Consultá [package.json](package.json), [package-lock.json](package-lock.json) y [.nvmrc](.nvmrc) para las versiones.
- Instalá con `npm ci` y arrancá con `npm run dev`. La raíz redirige a `/es` por defecto; la versión en inglés está en `/en`. El [README](README.md) documenta la puesta en marcha y los recursos.
- GSAP es el motor de animación del proyecto. `ScrollTrigger`, `Flip`, `DrawSVG`, `MotionPath`, `SplitText` y `CustomEase` vienen incluidos en el paquete `gsap` desde 3.13; `useGSAP` viene de `@gsap/react`.
- No agregues librerías de animación, 3D o i18n sin justificarlo. Motion, three.js, Rive, Lottie, Lenis y next-intl quedan fuera de alcance por decisión de diseño.

## Estructura del proyecto

- `src/app/[locale]` contiene las rutas y los metadatos por idioma. `src/app/globals.css` define los estilos globales.
- [src/content](src/content) concentra los diccionarios, la experiencia, los enlaces de contacto y el manifiesto de escena en [scene.ts](src/content/scene.ts).
- `src/lib` contiene lógica pura y testeable: el motor del callejón y los hooks compartidos.
- [`alley.tsx`](src/components/alley.tsx) conecta navegación, historial y modo lectura; [`hud.tsx`](src/components/hud.tsx) agrupa la navegación y los controles a la derecha. Home/Inicio es el primer enlace y el único acceso a la entrada en el HUD; no repitas el nombre del cartel de portada en la barra.
- [`stage.tsx`](src/components/scene/stage.tsx) contiene las bandas y la atmósfera. La ruta renderiza [`storefronts.tsx`](src/components/scene/storefronts.tsx) en el servidor y pasa las fachadas a la escena como `children`. El [rig SVG del gato](src/components/scene/cat/cat.tsx) se anima desde el mismo ticker de la escena mediante [`animate-cat.ts`](src/components/scene/cat/animate-cat.ts).
- [`reading-mode.tsx`](src/components/reading-mode.tsx) y [`chapter-panels.tsx`](src/components/chapter-panels.tsx) componen la vista semántica. Compartí el contenido de Experiencia entre lectura y el modal; el botón central es el único control de la torre y sus ocho ventanas son decorativas.
- [`panel-surface.tsx`](src/components/panels/panel-surface.tsx) administra el diálogo nativo y su scroll interno. [`alley-location.ts`](src/lib/alley-location.ts) concentra el contrato de fragmentos: `#experience/details` abre la trayectoria completa y `#experience/<id>` conserva el acceso al mismo logro en ambos idiomas y en lectura/sin JS.
- Las pruebas de componentes viven junto al código y los flujos del sitio compilado están en [e2e](e2e).

## Convenciones de código

- Renderizá contenido y metadatos por idioma en el servidor. Reservá el código cliente para estado, audio, historial, foco y animación.
- Usá el origen canónico compartido de [`site-metadata.ts`](src/lib/site-metadata.ts) para metadatos, sitemap y robots. Conservá los alternates recíprocos EN/ES, `x-default` en `/es` y `noindex` en las previews de Vercel.
- Actualizá los diccionarios EN y ES juntos. Conservá `#about`, `#experience` y `#contact` en ambas rutas y el acceso directo sin JavaScript.
- Mantené iguales el HTML del servidor y el primer render del cliente. Leé los valores del navegador después de hidratar o usá `useSyncExternalStore` con un snapshot inicial compatible con SSR.
- Ante un aviso de hidratación, compará el HTML de la respuesta con el DOM y reproducilo en un navegador sin extensiones. Corregí las discrepancias propias en su origen. Reservá `suppressHydrationWarning` en `<html>` para atributos externos comprobados y conservá las pruebas de hidratación en Playwright.
- El progreso del scroll es una única fuente de verdad. Solo el motor escribe `transform` sobre las bandas; ningún componente anima propiedades que el motor controla.
- Conservá `position: sticky` con un contenedor alto; ScrollTrigger mide el progreso, no fija la escena. `Alley` deriva la parada activa del hash: la navegación explícita agrega una entrada al historial; el scroll reemplaza la actual al asentarse o tras un salto grande.
- El ancla horizontal del gato está al 38% del viewport y controla cuándo se activan las fachadas. La entrada conserva el origen CSS (`x = 0`); las demás fachadas usan el ancla en escritorio y el centro del viewport en móvil. Verificá el nombre y el rol de portada antes y después de hidratar si cambia la geometría.
- Compartí `data-lit-facade` entre el neón del cartel y los reflejos de la acera; no uses `data-active-stop` para encenderlos.
- En pestañas ocultas, pausá la lluvia y quitá solo el callback del ticker de la escena, no el ticker global de GSAP. Al reanudar, sincronizá con el scroll real sin simular un paseo.
- Animá solo `transform` y `opacity`. No uses `filter: blur()` sobre superficies grandes: el glow se pre-hornea o se resuelve con gradientes.
- Acotá en tiempo real las animaciones cortas de UI, como la entrada de un diálogo: el *lag smoothing* de GSAP estira esos tweens cuando el hilo principal se frena.
- La lógica de layout y progreso en `src/lib` debe ser pura y testeable, sin acceso al DOM dentro de la función.

## Escena y accesibilidad

- La escena es decorativa y progresiva: todo el contenido debe existir en DOM semántico.
- Los carteles interactivos son botones reales, con nombre accesible traducido y foco visible.
- Los rótulos japoneses son paths SVG decorativos (`aria-hidden`, `lang="ja"`). No agregues una fuente japonesa al sitio.
- El modo lectura es obligatorio y es el fallback de `prefers-reduced-motion` y de no-JS. Conservá la copia de no-JS en `<noscript>` para no hidratar contenido duplicado cuando la escena está activa.
- Conservá una única firma en el pie, fuera de `<main>`, con el año UTC calculado en el servidor. En escena queda fija y visible sin sumar altura al scroll; en lectura y sin JavaScript queda en el flujo normal.
- Mantené los acentos propios del modo lectura dentro de `.reading-shell`; el contenido compartido de Experiencia conserva su paleta cian en el diálogo.
- Con movimiento reducido: sin pin, sin parallax, sin caminata y sin audio; las paradas se apilan como secciones normales.
- Usá enlaces para navegación y botones para acciones. Conservá el foco visible, el orden de teclado y la lectura móvil. Targets mínimos de 44×44 px.
- El audio nunca arranca solo: siempre detrás de un gesto del usuario y muteado por defecto.
- Configurá la pista del reproductor en [`soundtrack.ts`](src/content/soundtrack.ts); no descargues el MP3 antes del gesto ni reanudes la reproducción automáticamente.

## Flujo de trabajo y verificación

- Elegí las guías en el [índice de skills](.agents/skills/README.md). Antes de cambiar CSS o comportamiento del navegador, consultá `modern-web-guidance` para el patrón específico.
- Mantené [design.md](design.md) y este archivo al día con las decisiones de diseño y las convenciones que cambien. Revisá también el [README](README.md) cuando cambien los flujos de uso, enlaces o comandos. Hacé la revisión antes de cada commit y push.
- Durante las iteraciones, verificá según el impacto. Para documentación, texto o estilos menores, revisá `git diff --check`, los enlaces afectados y la vista local cuando corresponda. No corras la suite completa por un ajuste menor.
- Si cambia la lógica, los componentes o la navegación, corré las pruebas y los checks que cubran el cambio. Para scroll, hidratación o layout responsive, priorizá los flujos afectados en Chromium, Firefox y WebKit; usá el build si la verificación depende del comportamiento de producción.
- Mantené Playwright enfocado en recorridos críticos. Repetí en los tres motores los casos donde puede variar el comportamiento del navegador (hidratación, foco, toque o audio). Usá `*.chromium.spec.ts` para comprobaciones del servidor o de SEO y para recorridos secundarios; reservá las variantes visuales para la revisión local.
- Probá el audio con reproducción nativa en Playwright; en CI de Ubuntu usá una salida virtual. Los fallos de audio adjuntan eventos del elemento multimedia y de visibilidad.
- Mantené la imagen oficial de Playwright de CI alineada con la versión exacta de `@playwright/test` en `package-lock.json`. No reinstales los navegadores ni sus librerías en cada corrida; provisioná solo la salida virtual de audio. Conservá los límites de 10 minutos para el job y 4 minutos para Playwright, y la cancelación de corridas obsoletas por evento y referencia.
- Mantené la auditoría npm en un job separado que cubra el lockfile, incluidas las dependencias transitivas y de desarrollo. Bloqueá severidades altas y críticas y conservá el informe JSON en cada ejecución. Revisá el aviso y probá la corrección antes de cambiar dependencias; no apliques `npm audit fix` automáticamente en CI.
- Reservá la suite completa (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`) para antes de publicar o cerrar una fase, o cuando el usuario la pida. No la ates a un hook de cada commit local. [GitHub Actions](.github/workflows/ci.yml) la sigue ejecutando en cada push y PR. Informá qué verificaste y qué quedó pendiente.

## Commits, PRs y despliegue

- Estado del trabajo: Fases 5 y 6 integradas a `main` mediante el PR #1 (`610e8af`, CI aprobado). Usá [design.md](design.md) como registro de la revisión final y su [guía de revisión manual](design.md#revisión-manual-antes-de-vercel) para repetirla. La emulación no valida los dispositivos físicos ni los lectores de pantalla. Nunca hagas merge a `main` sin un pedido explícito del usuario.
- Para cerrar la meta de rendimiento móvil, compará la mediana de tres corridas de Lighthouse sobre el build de producción; no tomes el mejor puntaje como resultado. La última mediana de `/en` fue 82 (meta: 85).
- Cuando el usuario pida explícitamente hacer commit y push, delegá ambas operaciones a `git-publisher`, definido en [`.codex/agents/git-publisher.toml`](.codex/agents/git-publisher.toml). Pasale los archivos autorizados, el destino conocido y las verificaciones hechas. Esperá su resultado y comunicá el hash, la rama y el resultado del push.
- Si la herramienta de delegación solo permite elegir modelo y esfuerzo, usá los valores `model` y `model_reasoning_effort` del TOML e incluí sus instrucciones en el encargo.
- Escribí mensajes de commit breves, en inglés y en imperativo.
- En cada PR, resumí todos los cambios relevantes del diff contra la rama base y explicá su propósito e impacto. Detallá las verificaciones realizadas, sus resultados y los pendientes; adjuntá capturas de escritorio y móvil si cambia la UI.
- Revisá los cambios visuales primero en local. Desplegá a producción en Vercel cuando el usuario lo autorice explícitamente.
