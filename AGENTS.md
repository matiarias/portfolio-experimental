# Instrucciones del proyecto

## Stack y arranque

- Usá Next.js App Router, React, TypeScript estricto, Tailwind CSS, GSAP, Node.js 24 y npm. Consultá [package.json](package.json), [package-lock.json](package-lock.json) y [.nvmrc](.nvmrc) para las versiones.
- Instalá con `npm ci` y arrancá con `npm run dev`. La raíz redirige a `/en` y la versión en español está en `/es`. El [README](README.md) documenta la puesta en marcha y los recursos.

## Estructura del proyecto

- `src/app/[locale]` contiene las rutas y los metadatos por idioma. `src/app/globals.css` define los estilos de la escena.
- [src/content](src/content) concentra los diccionarios, la experiencia y los enlaces de contacto.
- [src/components](src/components) contiene los capítulos y la lógica de la proyección. Las pruebas de componentes viven junto al código y los flujos del sitio compilado están en [e2e](e2e).

## Convenciones de código

- Renderizá contenido y metadatos por idioma en el servidor. Reservá el código cliente para estado, audio, historial, foco y animación.
- Actualizá los diccionarios EN y ES juntos. Conservá `#about`, `#experience` y `#contact` en ambas rutas y el acceso directo sin JavaScript.
- Mantené iguales el HTML del servidor y el primer render del cliente. Leé los valores del navegador después de hidratar o usá `useSyncExternalStore` con un snapshot inicial compatible con SSR.
- Ante un aviso de hidratación, compará el HTML de la respuesta con el DOM y reproducilo en un navegador sin extensiones. Corregí las discrepancias propias en su origen. Reservá `suppressHydrationWarning` en `<html>` para atributos externos comprobados y conservá las pruebas de hidratación en Playwright.

## Proyección y accesibilidad

- Seguí el [handoff visual aprobado](handoff-autocine-final/HANDOFF.md). Mantené la pantalla azul como foco, el fondo asimétrico en penumbra y la barra de capítulos discreta.
- Play inicia el avance y el audio con el mismo gesto. Pausa detiene ambos y Continuar conserva el tiempo restante. Los saltos manuales dejan el capítulo en lectura libre. Con movimiento reducido, el recorrido es manual y silencioso.
- Usá enlaces para navegación y botones para acciones. Conservá el foco visible, el orden de teclado y la lectura móvil. Preferí CSS nativo con degradación progresiva y limitá GSAP a las transiciones de la proyección.

## Flujo de trabajo y verificación

- Elegí las guías en el [índice de skills](.agents/skills/README.md). Antes de cambiar CSS o comportamiento del navegador, consultá `modern-web-guidance` para el patrón específico.
- Para cambios de documentación, revisá el diff con `git diff --check` y comprobá los enlaces afectados. Para cambios de contenido o componentes, corré `npm run lint`, `npm run typecheck` y las pruebas de Vitest que correspondan con `npm test`.
- Para cambios en reproducción, navegación, hidratación o layout responsive, corré `npm run build` y los flujos relevantes de `npm run test:e2e`. Verificá las interacciones afectadas en Chromium, Firefox y WebKit.
- [GitHub Actions](.github/workflows/ci.yml) ejecuta la suite completa en cada push y PR. Informá qué verificaciones corriste y cuáles quedaron pendientes.

## Commits, PRs y despliegue

- Cuando el usuario pida explícitamente hacer commit y push, delegá ambas operaciones a `git-publisher`, definido en [`.codex/agents/git-publisher.toml`](.codex/agents/git-publisher.toml). Pasale los archivos autorizados, el destino conocido y las verificaciones hechas. Esperá su resultado y comunicá el hash, la rama y el resultado del push.
- Si la herramienta de delegación solo permite elegir modelo y esfuerzo, usá los valores `model` y `model_reasoning_effort` del TOML e incluí sus instrucciones en el encargo.
- Escribí mensajes de commit breves, en inglés y en imperativo. En un PR, incluí un resumen, las verificaciones realizadas y capturas de escritorio y móvil si cambia la UI.
- Revisá los cambios visuales primero en local. Desplegá a producción en Vercel cuando el usuario lo autorice explícitamente.
