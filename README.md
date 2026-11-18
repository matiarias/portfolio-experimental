# Portfolio experimental · Autocine de noche

Portfolio bilingüe de Matias Arias. Una pantalla de autocine presenta Sobre mí, Experiencia y Contacto sobre una ciudad nocturna. Se puede recorrer como una función con música o abrir un capítulo directamente.

## Desarrollo local

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
```

Abrí [localhost:3000](http://localhost:3000). La portada redirige a `/en` y la versión en español vive en `/es`.

## Verificación

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

`npm run test:watch` mantiene Vitest abierto. Playwright arranca el build local en el puerto 3100. También acepta `PLAYWRIGHT_BASE_URL` para probar una preview.

## Contenido y recursos

- Los diccionarios, el About y los enlaces están en [`src/content/portfolio.ts`](src/content/portfolio.ts). Los logros de Santander en ambos idiomas están en [`src/content/santander.ts`](src/content/santander.ts).
- [`handoff-autocine-final/HANDOFF.md`](handoff-autocine-final/HANDOFF.md) documenta el diseño aprobado.
- Para reemplazar la música, cambiá [`public/media/loop-crepusculo.wav`](public/media/loop-crepusculo.wav) por un loop propio o autorizado. Si cambia el nombre o el formato, actualizá la ruta en `screening.tsx`.
- En producción, configurá `SITE_URL` con el origen canónico. Las previews de Vercel pueden usar su URL automática.
