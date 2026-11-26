# Portfolio · Callejón de noche

Portfolio bilingüe de Matias Arias. Un callejón nocturno de Tokio, visto de perfil,
se recorre con el scroll: cada fachada es una sección y un gato guía el paseo.

La dirección visual está documentada en [design.md](design.md). El approach anterior
—el autocine— quedó en stand by y su material sigue en
[handoff-autocine-final](handoff-autocine-final/HANDOFF.md).

## Estado de la rama

El callejón se integró a `main` en el [PR #1](https://github.com/matiarias/portfolio-experimental/pull/1)
y pasó el [CI de `main`](https://github.com/matiarias/portfolio-experimental/actions/runs/45725098848).
«Ver experiencia» abre la trayectoria completa desde
la torre. El ramen abre la bio y la cabina abre los enlaces de contacto.
El callejón conserva el parallax y el gato animado. Los reflejos de la
acera toman el color del cartel apenas el gato entra en su fachada.

**Home / Inicio** vuelve a la entrada del callejón. **Modo lectura** ofrece
el mismo contenido sin animación. Los enlaces directos
a logros de experiencia funcionan tanto en escena como en lectura.

La Fase 5 centra una fachada por parada en móvil, aligera los efectos y
pausa la escena en pestañas ocultas. La Fase 6 incluye el reproductor de
*Gentle Pathways*, disponible desde el HUD de la escena. La pista no se
descarga ni suena hasta pulsar Reproducir. El [CI de Fase 6](https://github.com/matiarias/portfolio-experimental/actions/runs/45721819440)
pasó en Ubuntu para `176baf3`. El alcance y el estado de la revisión final
están en [design.md](design.md); las reglas, en [AGENTS.md](AGENTS.md).
El despliegue a producción requiere autorización explícita.

## Desarrollo local

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
```

Abrí [localhost:3000](http://localhost:3000). La portada redirige a [`/es`](http://localhost:3000/es)
por defecto y la versión en inglés está en [`/en`](http://localhost:3000/en). Para probar una parada
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

`npm run test:watch` mantiene Vitest abierto. Playwright sirve el build existente
en el puerto 3100 y ejecuta los flujos en Chromium, Firefox y WebKit; volvé a
correr `npm run build` si cambió el código. También acepta `PLAYWRIGHT_BASE_URL`
para probar una preview. En Ubuntu, CI usa una salida virtual para probar el
MP3 real. Si la prueba de audio falla, el artefacto `playwright-results`
incluye los eventos del medio y los cambios de visibilidad.

Para repetir Lighthouse móvil, serví el build con `npm run start -- --port 3100`
y ejecutá `npx --yes lighthouse@13.6.0 http://localhost:3100/es --only-categories=performance,accessibility`
con Chrome instalado. Repetilo para `/en`; las metas son 85 en rendimiento
y 95 en accesibilidad. Para comparar rendimiento, hacé tres corridas por
ruta sin otras pruebas en paralelo y anotá la mediana. Cerrá el servidor con
`Ctrl+C` al terminar. La última mediana de `/en` fue 82; el detalle de las
corridas y lo que falta investigar están en [design.md](design.md#revisión-de-rendimiento).

### Revisión manual antes de Vercel

Para probar el build sin desplegar, ejecutá `npm run build` y luego
`npm run start -- --hostname 0.0.0.0 --port 3100`. Desde un teléfono conectado
a la misma red, abrí `http://<IP-local-del-equipo>:3100/en` y `/es`.
Cerrá el servidor al terminar.

Recorré las cuatro paradas en Safari de iOS y Chrome de Android, en vertical
y horizontal, y cambiá de pestaña durante el paseo. Con VoiceOver en Safari
de iOS o macOS, y NVDA en Windows con Firefox o Chrome, probá también:

- Activá «Saltar al contenido» y recorré los capítulos con teclado o gestos
  del lector de pantalla.
- En la escena, abrí cada diálogo: debe anunciarse su título y al cerrar
  el foco debe volver al control que lo abrió.
- En modo lectura, usá la lista de encabezados y activá un capítulo desde
  el HUD: el foco debe ir a su título. Probá también el enlace directo a un
  logro y verificá que se conserve al cambiar de idioma.
- Desde la escena, reproducí la pista y cambiá de pestaña o abrí un diálogo.
  Al volver o cerrarlo, la música debe seguir pausada. Repetilo al entrar
  en modo lectura.

Registrá dispositivo, sistema, navegador, lector de pantalla y resultado.
En un Android de gama media, conectá el teléfono por USB con la depuración
habilitada y abrí `chrome://inspect/#devices` desde Chrome de escritorio.
Grabá en **Performance** un recorrido de Inicio a Contacto con desplazamiento
continuo, sin aplicar throttling de CPU. Guardá la traza, anotá la frecuencia
de pantalla y compará los tiempos y los frames perdidos durante el desplazamiento
con la meta de 60 fps (unos 16,7 ms por frame).

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
- La pista [`gentle-pathways.mp3`](public/media/gentle-pathways.mp3) y su
  título se configuran en [`soundtrack.ts`](src/content/soundtrack.ts).
  Se conserva el MP3 actual por decisión del proyecto. Su origen informado
  es un video público de YouTube; el repositorio no tiene un enlace a la
  fuente, una licencia de redistribución ni un crédito verificable.
  El [loop del autocine](public/media/loop-crepusculo.wav) no se usa.
- Con el servidor local activo, `node scripts/capture-social.mjs` regenera
  la [imagen para compartir](public/media/alley-social.png) a 1200 × 630.

## SEO y publicación

- En Vercel, configurá `SITE_URL` como el origen HTTPS canónico (sin ruta) en
  Production y Preview. Si no se define, se usa el dominio de producción del
  proyecto que informa Vercel, si está disponible.
- `/en` y `/es` tienen título, descripción, canonical y alternates propios;
  `x-default` apunta a `/es`. Incluyen datos estructurados de perfil y tarjetas
  Open Graph y X con la imagen del callejón. El favicon es [el gato](src/app/icon.svg).
- En el dominio final, comprobá `/robots.txt` y `/sitemap.xml`; el sitemap
  enumera los dos idiomas. Las previews usan `noindex` y no anuncian un sitemap.
  Una vez publicado, enviá el sitemap en Google Search Console y comprobá las
  tarjetas compartiendo ambas URLs.
