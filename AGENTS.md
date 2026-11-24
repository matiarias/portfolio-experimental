# Instrucciones del proyecto

## Stack y arranque

- Usá Next.js App Router, React, TypeScript estricto, Tailwind CSS v4, GSAP, Node.js 24 y npm. Consultá [package.json](package.json), [package-lock.json](package-lock.json) y [.nvmrc](.nvmrc) para las versiones.
- Instalá con `npm ci` y arrancá con `npm run dev`. La raíz redirige a `/en` y la versión en español está en `/es`. El [README](README.md) documenta la puesta en marcha y los recursos.
- GSAP es el motor de animación del proyecto. `ScrollTrigger`, `Flip`, `DrawSVG`, `MotionPath`, `SplitText` y `CustomEase` vienen incluidos en el paquete `gsap` desde 3.13; `useGSAP` viene de `@gsap/react`.
- No agregues librerías de animación, 3D o i18n sin justificarlo. Motion, three.js, Rive, Lottie, Lenis y next-intl quedan fuera de alcance por decisión de diseño.

## Estructura del proyecto

- `src/app/[locale]` contiene las rutas y los metadatos por idioma. `src/app/globals.css` define los estilos globales.
- [src/content](src/content) concentra los diccionarios, la experiencia, los enlaces de contacto y el manifiesto de escena en [scene.ts](src/content/scene.ts).
- `src/lib` contiene lógica pura y testeable: el motor del callejón y los hooks compartidos.
- [`alley.tsx`](src/components/alley.tsx) conecta navegación, historial y modo lectura; [`hud.tsx`](src/components/hud.tsx) renderiza la navegación, el selector de idioma y el progreso.
- [`stage.tsx`](src/components/scene/stage.tsx) contiene las bandas y la atmósfera. La ruta renderiza [`storefronts.tsx`](src/components/scene/storefronts.tsx) en el servidor y pasa las fachadas a la escena como `children`. [`cat.tsx`](src/components/scene/cat/cat.tsx) es el SVG estático del gato.
- [`reading-mode.tsx`](src/components/reading-mode.tsx) y [`chapter-panels.tsx`](src/components/chapter-panels.tsx) componen la vista semántica con el contenido completo.
- Las pruebas de componentes viven junto al código y los flujos del sitio compilado están en [e2e](e2e).

## Convenciones de código

- Renderizá contenido y metadatos por idioma en el servidor. Reservá el código cliente para estado, audio, historial, foco y animación.
- Actualizá los diccionarios EN y ES juntos. Conservá `#about`, `#experience` y `#contact` en ambas rutas y el acceso directo sin JavaScript.
- Mantené iguales el HTML del servidor y el primer render del cliente. Leé los valores del navegador después de hidratar o usá `useSyncExternalStore` con un snapshot inicial compatible con SSR.
- Ante un aviso de hidratación, compará el HTML de la respuesta con el DOM y reproducilo en un navegador sin extensiones. Corregí las discrepancias propias en su origen. Reservá `suppressHydrationWarning` en `<html>` para atributos externos comprobados y conservá las pruebas de hidratación en Playwright.
- El progreso del scroll es una única fuente de verdad. Solo el motor escribe `transform` sobre las bandas; ningún componente anima propiedades que el motor controla.
- Conservá `position: sticky` con un contenedor alto; ScrollTrigger mide el progreso, no fija la escena. `Alley` deriva la parada activa del hash: la navegación explícita agrega una entrada al historial; el scroll reemplaza la actual al asentarse o tras un salto grande.
- El ancla horizontal del gato está al 38% del viewport. La entrada usa el origen CSS (`x = 0`) antes y después de hidratar, con un margen seguro; las demás paradas usan el ancla. Si cambiás la geometría, verificá el nombre y el rol de portada antes y después de hidratar en laptop y móvil.
- Animá solo `transform` y `opacity`. No uses `filter: blur()` sobre superficies grandes: el glow se pre-hornea o se resuelve con gradientes.
- La lógica de layout y progreso en `src/lib` debe ser pura y testeable, sin acceso al DOM dentro de la función.

## Escena y accesibilidad

- La escena es decorativa y progresiva: todo el contenido debe existir en DOM semántico.
- Los carteles interactivos son botones reales, con nombre accesible traducido y foco visible.
- Los rótulos japoneses son paths SVG decorativos (`aria-hidden`, `lang="ja"`). No agregues una fuente japonesa al sitio.
- El modo lectura es obligatorio y es el fallback de `prefers-reduced-motion` y de no-JS.
- Con movimiento reducido: sin pin, sin parallax, sin caminata y sin audio; las paradas se apilan como secciones normales.
- Usá enlaces para navegación y botones para acciones. Conservá el foco visible, el orden de teclado y la lectura móvil. Targets mínimos de 44×44 px.
- El audio nunca arranca solo: siempre detrás de un gesto del usuario y muteado por defecto.

## Flujo de trabajo y verificación

- Elegí las guías en el [índice de skills](.agents/skills/README.md). Antes de cambiar CSS o comportamiento del navegador, consultá `modern-web-guidance` para el patrón específico.
- Para cambios de documentación, revisá el diff con `git diff --check` y comprobá los enlaces afectados.
- Para cambios de contenido o componentes, corré `npm run lint`, `npm run typecheck` y las pruebas de Vitest que correspondan con `npm test`.
- Para cambios en scroll, navegación, hidratación o layout responsive, corré `npm run build` y los flujos relevantes de `npm run test:e2e`. Verificá las interacciones afectadas en Chromium, Firefox y WebKit.
- [GitHub Actions](.github/workflows/ci.yml) ejecuta la suite completa en cada push y PR. Informá qué verificaciones corriste y cuáles quedaron pendientes.

## Commits, PRs y despliegue

- Estado del trabajo: Fase 2 implementada para revisión local en `feat/alley-scene`. Consultá [design.md](design.md) para el alcance de cada fase. No integres a `main` hasta que el proyecto esté terminado y el usuario dé su visto bueno.
- Cuando el usuario pida explícitamente hacer commit y push, delegá ambas operaciones a `git-publisher`, definido en [`.codex/agents/git-publisher.toml`](.codex/agents/git-publisher.toml). Pasale los archivos autorizados, el destino conocido y las verificaciones hechas. Esperá su resultado y comunicá el hash, la rama y el resultado del push.
- Si la herramienta de delegación solo permite elegir modelo y esfuerzo, usá los valores `model` y `model_reasoning_effort` del TOML e incluí sus instrucciones en el encargo.
- Escribí mensajes de commit breves, en inglés y en imperativo. En un PR, incluí un resumen, las verificaciones realizadas y capturas de escritorio y móvil si cambia la UI.
- Revisá los cambios visuales primero en local. Desplegá a producción en Vercel cuando el usuario lo autorice explícitamente.
