# Portfolio · Callejón de noche

Portfolio bilingüe de Matias Arias. Un callejón nocturno de Tokio, visto de perfil,
se recorre con el scroll: cada fachada es una sección y un gato guía el paseo.

La dirección visual está documentada en [design.md](design.md). El approach anterior
—el autocine— quedó en stand by y su material sigue en
[handoff-autocine-final](handoff-autocine-final/HANDOFF.md).

## Estado de la rama

La Fase 4 está implementada en `feat/alley-scene`. En la torre,
«Ver experiencia» abre la trayectoria completa. El ramen abre la bio y la
cabina abre los enlaces de contacto.
El callejón conserva el parallax y el gato animado, todavía sin audio.

**Home / Inicio** vuelve a la entrada del callejón. **Modo lectura** ofrece
el mismo contenido sin animación. Los enlaces directos
a logros de experiencia funcionan tanto en escena como en lectura.

Las fases 5 y 6 siguen pendientes. Su alcance está en [design.md](design.md);
las reglas del proyecto están en [AGENTS.md](AGENTS.md). No se integra a
`main` sin autorización explícita.

## Desarrollo local

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
```

Abrí [localhost:3000](http://localhost:3000). La portada redirige a `/en` y la versión
en español vive en [`/es`](http://localhost:3000/es). Para probar una parada
directamente, abrí por ejemplo [`/es#experience`](http://localhost:3000/es#experience).
Para abrir la trayectoria, probá [`/es#experience/details`](http://localhost:3000/es#experience/details).
Para ir directo a un logro, usá [`/es#experience/0-2`](http://localhost:3000/es#experience/0-2).
El modo lectura se guarda en el navegador y también se activa con movimiento
reducido o al navegar sin JavaScript.

## Verificación

Durante una iteración, elegí los checks que cubran el cambio. Corré la suite
completa antes de publicar o cerrar una fase, no en cada ajuste menor.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

`npm run test:watch` mantiene Vitest abierto. Playwright sirve el build
en el puerto 3100 y ejecuta
los flujos en Chromium, Firefox y WebKit. También acepta `PLAYWRIGHT_BASE_URL`
para probar una preview.

## Contenido y recursos

- Los diccionarios, el About y los enlaces están en [`src/content/portfolio.ts`](src/content/portfolio.ts).
  Los logros de Santander en ambos idiomas están en [`src/content/santander.ts`](src/content/santander.ts).
- El manifiesto de la escena —paradas y ritmo del paseo—
  está en [`src/content/scene.ts`](src/content/scene.ts). El cálculo de progreso vive en
  [`src/lib/alley-engine.ts`](src/lib/alley-engine.ts).
- [`alley.tsx`](src/components/alley.tsx) coordina la navegación y el modo lectura.
  [`stage.tsx`](src/components/scene/stage.tsx) mide y mueve las tres bandas.
  [`chapter-panels.tsx`](src/components/chapter-panels.tsx) renderiza el contenido de lectura.
- Las [fachadas SVG](src/components/scene/facades) se componen en el servidor en
  [`storefronts.tsx`](src/components/scene/storefronts.tsx). Los glifos japoneses
  provienen de Noto Sans JP ([licencia OFL](src/content/NotoSansJP-OFL.txt)); no se descarga la fuente.
- El [loop del autocine](public/media/loop-crepusculo.wav) se conserva, pero
  todavía no se usa en el callejón.
- En producción, configurá `SITE_URL` con el origen canónico. Las previews de Vercel
  pueden usar su URL automática.
