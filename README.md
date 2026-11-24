# Portfolio · Callejón de noche

Portfolio bilingüe de Matias Arias. Un callejón nocturno de Tokio, visto de perfil,
se recorre con el scroll: cada fachada es una sección y un gato guía el paseo.

La dirección visual está documentada en [design.md](design.md). El approach anterior
—el autocine— quedó en stand by y su material sigue en
[handoff-autocine-final](handoff-autocine-final/HANDOFF.md).

## Estado de la rama

`feat/alley-scene` contiene la Fase 1: motor de parallax, cuatro paradas, HUD,
navegación por hash y modo lectura. Las fachadas y el gato son provisionales.
Para leer el contenido completo o usar los enlaces de contacto, activá **Modo lectura**.
Las ventanas todavía no abren proyectos y la escena no reproduce audio.

La Fase 2 está en pausa hasta recibir aprobación explícita. El alcance y los
pasos siguientes están en [design.md](design.md); las reglas para continuar el
trabajo están en [AGENTS.md](AGENTS.md). No se integra a `main` hasta terminar el
proyecto y recibir el visto bueno.

## Desarrollo local

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
```

Abrí [localhost:3000](http://localhost:3000). La portada redirige a `/en` y la versión
en español vive en [`/es`](http://localhost:3000/es). Para probar una parada
directamente, abrí por ejemplo [`/es#experience`](http://localhost:3000/es#experience).
El modo lectura se guarda en el navegador y también se activa con movimiento
reducido o al navegar sin JavaScript.

## Verificación

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

`npm run test:watch` mantiene Vitest abierto. Detené `npm run dev` antes del build
local (comparten `.next`). Playwright sirve el build en el puerto 3100 y ejecuta
los flujos en Chromium, Firefox y WebKit. También acepta `PLAYWRIGHT_BASE_URL`
para probar una preview.

## Contenido y recursos

- Los diccionarios, el About y los enlaces están en [`src/content/portfolio.ts`](src/content/portfolio.ts).
  Los logros de Santander en ambos idiomas están en [`src/content/santander.ts`](src/content/santander.ts).
- El manifiesto de la escena —paradas, ritmo del paseo y ventanas de experiencia—
  está en [`src/content/scene.ts`](src/content/scene.ts). El cálculo de progreso vive en
  [`src/lib/alley-engine.ts`](src/lib/alley-engine.ts).
- [`alley.tsx`](src/components/alley.tsx) coordina la navegación y el modo lectura.
  [`stage.tsx`](src/components/scene/stage.tsx) mide y mueve las tres bandas.
  [`chapter-panels.tsx`](src/components/chapter-panels.tsx) renderiza el contenido de lectura.
- El [loop del autocine](public/media/loop-crepusculo.wav) se conserva, pero
  todavía no se usa en el callejón.
- En producción, configurá `SITE_URL` con el origen canónico. Las previews de Vercel
  pueden usar su URL automática.
