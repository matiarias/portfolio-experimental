# Callejón de noche

Dirección visual vigente del portfolio. El approach anterior —el autocine— queda
en stand by; su documentación sigue en [handoff-autocine-final](handoff-autocine-final/HANDOFF.md)
y sus bocetos en [design](design) como historial de exploración.
El material del autocine se conserva por ahora. El callejón no monta `SceneBackdrop`
ni usa el loop de esa maqueta. Si se limpia el directorio público, hacelo por
separado y revisá los enlaces a los recursos archivados antes de moverlos.

## Idea

Un callejón de Tokio a la noche, visto de perfil, con estética lofi y un gato
pixel-art que guía el recorrido.

El scroll vertical no acerca la cámara al fondo: desplaza la calle en horizontal.
No se avanza hacia adentro del callejón, se camina a lo largo de él.

Cada fachada es una sección del portfolio. El gato es el indicador de progreso.

## Estado y próximos pasos

- **Fase 1 — implementada.** La portada y las tres secciones
  son paradas de una tira horizontal. El HUD permite saltar entre paradas,
  cambiar de idioma sin perder la parada y alternar el modo lectura, que
  muestra todo el contenido y los enlaces reales.
- **Fase 2 — implementada para revisión local en `feat/alley-scene`.** Cuatro
  fachadas SVG independientes, rótulos japoneses vectoriales, halo por
  parada, cables, lluvia, grano y reflejos en el asfalto. La portada conserva
  su margen al hidratar.
- **Fase 3 — implementada para revisión local.** Rig SVG del gato con GSAP:
  camina, corre y cambia de dirección según la calle, se sienta al parar y se
  duerme por inactividad. El puntero cercano activa la mirada; acariciarlo
  funciona con clic, toque o teclado, todavía sin audio.
- **Fase 4 — implementada para revisión local.** Paneles de bio, experiencia
  y contacto. La experiencia de Santander se comparte con el modo lectura
  y conserva enlaces directos a cada logro.

- **Fase 5 — cerrada con verificación automatizada.** Encuadre
  móvil de una fachada por parada, menos capas, pausa en pestañas ocultas
  y foco en el destino al navegar en lectura. Pasaron 126 pruebas de
  Playwright en Chromium, Firefox y WebKit, más los recorridos táctiles
  en iPhone 13 y Pixel 7 emulados en ambas orientaciones. El build local
  de producción alcanzó 87 en rendimiento para `/en` y 88 para `/es`, con
  100 en accesibilidad en ambas rutas (Lighthouse móvil; metas: 85 y 95).
- **Fase 6 — implementada y verificada en CI.** Reproductor de *Gentle Pathways*,
  reflejos y detalles del gato ajustados e imagen social renovada. La entrega
  quedó integrada a `main` en el [PR #1](https://github.com/matiarias/portfolio-experimental/pull/1)
  (`610e8af`). El [CI del PR](https://github.com/matiarias/portfolio-experimental/actions/runs/45724629338)
  y el [de `main`](https://github.com/matiarias/portfolio-experimental/actions/runs/45725098848)
  pasaron: lint, tipos, build, Vitest y Playwright en Chromium,
  Firefox y WebKit. En Windows pasaron 30 unitarias y 141 E2E.
  La revisión local repitió el build y 108 E2E de navegación, paneles,
  ciclo de vida de la escena y audio en los tres motores; todos pasaron.
- **Revisión final.** Las pruebas en iOS y Android físicos, la medición de
  60 fps en un Android de gama media y los recorridos con VoiceOver y NVDA
  siguen pendientes. Los pasos para registrarlos están en el [README](README.md).
  No hay un teléfono físico disponible en la sesión de revisión, ni un
  entorno con VoiceOver o NVDA activo.
- **Pista.** Se conserva *Gentle Pathways* por decisión del proyecto. El
  origen informado es un video público de YouTube; no consta la licencia
  de redistribución ni un crédito verificable.
- **SEO y marca.** El favicon simplifica el rostro del gato: gris pizarra,
  ojos verdes y bigotes sobre índigo. Las tarjetas sociales usan la escena
  real; las dos rutas se declaran como versiones del mismo perfil y se
  publican en el sitemap del dominio canónico. La raíz redirige a `/es`,
  que también es la variante `x-default`; `/en` conserva su URL.

### Revisión de rendimiento

- La primera medición de Fase 6 dio 82 en `/en` y 88 en `/es`.
- El 25 de noviembre de 2026, Lighthouse 13.6.0 en perfil móvil sobre el build
  de producción local dio 77, 82 y 89 en `/en`: **mediana 82**, debajo de la
  meta de 85. `/es` dio 79 en una corrida de control, no una mediana.
- Accesibilidad automatizada: 100 en las cuatro corridas. No hubo solicitudes
  al MP3 antes de interactuar.
- En `/en`, el LCP se mantuvo cerca de 1 s; el bloqueo total del hilo principal
  varió entre 438 y 1075 ms. El siguiente paso es perfilar las tareas largas
  del arranque, antes de ajustar la escena. Esta medición no sustituye la
  prueba de fluidez en un teléfono real.

Nunca hacer merge a `main` sin un pedido explícito del usuario.

## Composición

- Escena fija a pantalla completa con `position: sticky`, sobre una tira de
  fachadas de unos cuatro viewports de ancho.
- Tres bandas de profundidad. La profundidad la dan las bandas, no un punto de fuga.
- En pantallas angostas y teléfonos apaisados, la fachada se centra
  independientemente del gato, que sigue al 38%. En cada parada queda una
  sola fachada completa; durante el desplazamiento pueden verse dos.
- El perfil móvil usa un fondo quieto, lluvia estática tenue y un solo
  reflejo. No dibuja la banda frontal, los cables, el grano ni el halo
  ambiental de los carteles; conserva el neón que sigue la forma de los glifos.
- Al ocultar la pestaña se pausa la animación CSS y se desconecta el ticker
  de la escena. Al volver, el motor lee el scroll real sin reproducir el
  desplazamiento que pudo ocurrir mientras estaba oculta.
- Fachadas frontales, sin perspectiva: la referencia de composición es un local
  visto de frente, no un corredor.
- Paradas, de izquierda a derecha:

| Parada | Fachada | Sección |
| --- | --- | --- |
| `entrance` | portón corredizo y cartel grande | portada: nombre y rol |
| `about` | ramen shop con cortina noren y vapor | sobre mí |
| `experience` | edificio de oficinas | experiencia |
| `contact` | cabina telefónica y expendedora | contacto |

- La torre conserva sus ocho ventanas decorativas y el patrón de luces. Un
  único botón central abre la experiencia en una columna, del período más
  reciente al más antiguo.
- El HUD se agrupa a la derecha, en dos filas hasta 720 px.
  Home/Inicio es el primer enlace; los idiomas y el modo lectura forman
  un grupo aparte. Solo el cartel de portada muestra el nombre en la escena.
- *Gentle Pathways* usa un botón de reproducir/pausar junto a Modo lectura,
  en la segunda fila en móvil. El título aparece al sonar en escritorio.
  No hay descarga ni reproducción antes de pulsarlo. Se pausa al ocultar la pestaña,
  al abrir un diálogo o al salir de la escena y no se reanuda sola.
  El ícono y el título siguen la reproducción real: un intento de `play()`
  reemplazado por un toque posterior no puede confirmar el estado.
- El gato queda anclado al 38% del ancho de pantalla. La calle se mueve debajo de él.
- La entrada se compone con margen fluido y se queda en `x = 0` durante toda
  la primera pausa: no se recentra al arrancar GSAP. El perfil móvil entra
  hasta 720 px y se extiende hasta 950 px con puntero táctil.
- Las [fachadas](src/components/scene/facades) y los carteles se renderizan en el
  servidor. El cliente mueve sus contenedores, no vuelve a construir el arte.

## Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--ink` | `#05060f` | fondo profundo |
| `--night-900` | `#0b1020` | cielo alto |
| `--night-800` | `#121a2e` | edificios en sombra |
| `--night-700` | `#1b2540` | superficies |
| `--neon-magenta` | `#ff2e88` | acento primario |
| `--neon-cyan` | `#22e0ff` | acento secundario |
| `--neon-amber` | `#ffb347` | luz cálida y portada |
| `--neon-jade` | `#83edc3` | cabina y reflejos de contacto |
| `--neon-violet` | `#8b5cf6` | acento terciario |
| `--paper` | `#fff4e6` | texto principal |
| `--muted` | `#9aa6bd` | texto secundario |
| `--ground` | `#0a0d18` | asfalto mojado |

Cada fachada tiene un neón dominante asignado en
[scene.ts](src/content/scene.ts). El resto de la escena se mantiene en índigo
profundo para que el color sea información, no decoración.
El reflejo de la acera toma el color del cartel con `data-lit-facade` apenas
el gato cruza el borde de la fachada, sin esperar al capítulo del HUD. Entre
fachadas no hay reflejo del neón.

En modo lectura, los títulos y los nombres de los logros quedan en marfil.
El ámbar suave (`--reading-accent`, `#e8ba83`) destaca el subtítulo y las
fechas, viñetas y divisores de Experiencia. El jade se conserva en las
tarjetas de Contacto y el modal de Experiencia mantiene su cian.

## Tipografía

- Títulos y body: Geist, ya instalada como fuente local.
- Acentos, HUD y etiquetas cortas: pila monoespaciada del sistema.
- Los rótulos japoneses son paths SVG decorativos extraídos de Noto Sans JP
  ([OFL](src/content/NotoSansJP-OFL.txt)). No se descarga ninguna fuente japonesa.
  Los futuros controles tendrán nombres accesibles traducidos.

## Materiales

- Gradientes, tramas y sombras de contacto distinguen el metal, la tela,
  el hormigón y el vidrio. El grano es una textura SVG estática.
- Una capa de lluvia usa una textura repetida y se mueve con `transform`.
  Su contraste se reduce en móvil; no se anima con movimiento reducido.
- Los charcos usan gradientes y una máscara de líneas. El halo del neón
  usa un gradiente radial sin filtros grandes.

## Movimiento

### Implementado

- [`scene.ts`](src/content/scene.ts) define las paradas y los tramos de pausa.
  [`alley-engine.ts`](src/lib/alley-engine.ts) traduce progreso normalizado a
  desplazamiento, con easing cúbico entre paradas y sin acceso al DOM.
- [`stage.tsx`](src/components/scene/stage.tsx) fija el viewport con `sticky`
  dentro de un contenedor alto. ScrollTrigger mide el progreso (sin `pin`).
  Un solo callback de `gsap.ticker` escribe el desplazamiento con `quickSetter`:
  fondo `0.15×`, calle `1×` y primer plano `1.35×`. El callback se duerme cuando
  se asientan tanto la calle como la pose.
- [`alley.tsx`](src/components/alley.tsx) lee la parada activa del hash vía
  [`useHash`](src/lib/use-hash.ts). La navegación explícita actualiza el
  historial y salta al destino; el scroll reemplaza el hash al asentarse o
  después de un salto grande. Se mantienen `#about`, `#experience` y `#contact`
  en ambos idiomas. Los tres paneles usan `#<sección>/details`. Los enlaces
  anteriores `#experience/<id>` abren el mismo modal y llevan al logro
  correspondiente; también funcionan al cambiar de idioma y en lectura/sin JS.
- Los carteles se construyen como tubos de neón sobre una placa de metal
  oscuro: el brillo sale de los glifos, con un halo que sigue sus formas y
  un derrame breve fuera de la placa. El encendido sigue al gato, tenue en
  reposo y pleno al entrar en la fachada, independientemente del hash. La
  transición usa `ease-in-out` y no hay parpadeos.
- El material cambia por fachada: ámbar sobrio en la portada, rosa cálido
  en el ramen, cian tras vidrio ahumado en la torre y jade sobre acrílico
  en la cabina. Todos comparten la misma geometría y transición.
- El gato usa el desplazamiento horizontal real entre frames: el rig no da
  pasos mientras la calle está quieta o en un salto directo de cámara.
  [La lógica de zancada](src/lib/cat-motion.ts) es pura. En modo lectura,
  con movimiento reducido o sin JavaScript se conserva el contenido sin el rig.
- Los ojos, las pupilas y el trazo de los párpados comparten la alineación
  sobre el hocico para que la expresión se mantenga al dormir.
- El gato tiene pelaje gris pizarra, iris verde hoja claro y dos grupos de
  bigotes que acompañan el giro de la cabeza. Los del lado lejano son más
  tenues para mantener el perfil.

- Paneles con `<dialog>` nativo y expansión con GSAP desde la geometría del
  disparador, sin cargar Flip. Sin disparador visible, se usa una entrada
  breve por escala y opacidad. La entrada se acota a 400 ms de tiempo real:
  si el hilo principal se frena, el panel termina de entrar en lugar de
  arrastrarse por el *lag smoothing* de GSAP.
- Los paneles se mantienen centrados. Si el contenido no cabe, solo se
  desplaza su cuerpo; los controles de idioma y cierre quedan a la vista.

## Interacción

El callejón se recorre por scroll o desde el HUD; el contenido completo también
se consulta en modo lectura. Los controles aparecen cuando el gato entra en la
fachada y siguen disponibles hasta que sale. Los botones recortados por el
viewport quedan fuera de la interacción y del orden de teclado. El gato
responde al movimiento y se puede acariciar.

| Momento | Respuesta |
| --- | --- |
| Scroll | La calle se desplaza, el gato camina y los carteles se encienden al llegar |
| Clic, toque o teclado en el ramen o la cabina | Se abre el panel de bio o contacto |
| Clic, toque o teclado en «Ver experiencia» | Se abre toda la trayectoria, con scroll dentro del modal |
| Cursor cerca del gato | Las pupilas lo siguen |
| Clic, toque o teclado sobre el gato | Se acurruca; el ronroneo queda para la fase de audio |
| Pausa en la calle | Se sienta y, tras unos 10 segundos de inactividad, se duerme |

En móvil no hay hover: cada interacción se resuelve con tap y los targets tienen
al menos 44×44 px. El gesto vertical sigue desplazando la página; no se secuestra
el scroll horizontal.

Los enlaces de Contacto usan jade sobre azul petróleo. En el panel se ven como
placas retroiluminadas de la cabina; en lectura mantienen su formato de tarjetas.

## Accesibilidad

- El modo lectura es obligatorio y es, a la vez, el fallback de
  `prefers-reduced-motion` y de no-JS.
- Con movimiento reducido: sin pin, sin parallax, sin caminata y sin audio; las
  paradas se apilan como secciones normales.
- El modo lectura contiene el contenido en HTML semántico. Las capas visuales
  quedan fuera del árbol de accesibilidad; el HUD, el gato y los controles de
  la parada tienen foco visible y nombre traducido.
- Escape o el botón Cerrar cierran los paneles. Se restaura el foco al
  disparador después de actualizar el historial; sin disparador, al enlace de
  la parada en el HUD.

## Referencias

Las imágenes de referencia son mood board, no assets de producción. Aportan
paleta, densidad de carteles, asfalto mojado, halation y vocabulario de props
(bicicletas, expendedoras, plantas, aires acondicionados, cortinas noren).

No se usan como placa: el paneo lateral rompe su perspectiva de un punto,
una pintura única no se puede separar en capas de parallax y se perdería
el control del patrón de luces de la fachada.

## Fuera de alcance

- Un quinto local o una sección nueva.
- 3D real, WebGL o three.js.
- Tema claro.
- Cambiar la pista del callejón, *Gentle Pathways*.
- Retirar o mover el material histórico del autocine como parte de la Fase 6.
