# Callejón de noche

Dirección visual vigente del portfolio. El approach anterior —el autocine— queda
en stand by; su documentación sigue en [handoff-autocine-final](handoff-autocine-final/HANDOFF.md)
y sus bocetos en [design](design) como historial de exploración.

## Idea

Un callejón de Tokio a la noche, visto de perfil, con estética lofi y un gato
pixel-art que guía el recorrido.

El scroll vertical no acerca la cámara al fondo: desplaza la calle en horizontal.
No se avanza hacia adentro del callejón, se camina a lo largo de él.

Cada fachada es una sección del portfolio. El gato es el indicador de progreso.

## Estado y próximos pasos

- **Fase 1 — implementada en `feat/alley-scene`.** La portada y las tres secciones
  son paradas de una tira horizontal. El HUD permite saltar entre paradas,
  cambiar de idioma sin perder la parada y alternar el modo lectura. Las fachadas
  son maquetas CSS, los rótulos japoneses son texto decorativo y el gato es un
  SVG estático. El modo lectura ya muestra todo el contenido y los enlaces reales.
- **Fase 2 — en pausa hasta el OK del usuario.** Reemplazar las maquetas por
  fachadas frontales con SVG independientes, dibujar los rótulos japoneses como
  paths y trabajar el neón, los materiales y los objetos de cada parada. Conservar
  la geometría responsive y el contrato de scroll; comprobar que el cartel de
  portada no se recorte. Las ventanas todavía serán decorativas.
- **Fase 3 — pendiente.** Rig SVG del gato con GSAP, caminata en función del
  progreso del paseo y animaciones de reposo.
- **Fase 4 — pendiente.** Ventanas como interacción principal de Experiencia,
  paneles de detalle, timeline vertical en la pared y deep links de proyectos.
  La base de datos ya está en el manifiesto: ocho logros de Santander en dos
  períodos (cinco y tres), sin duplicar el contenido.

No empezar la Fase 2 sin aprobación ni integrar a `main` hasta que el proyecto
esté terminado y el usuario dé el visto bueno.

## Composición

- Escena fija a pantalla completa con `position: sticky`, sobre una tira de
  fachadas de unos cuatro viewports de ancho.
- Tres bandas de profundidad. La profundidad la dan las bandas, no un punto de fuga.
- Fachadas frontales, sin perspectiva: la referencia de composición es un local
  visto de frente, no un corredor.
- Paradas, de izquierda a derecha:

| Parada | Fachada | Sección |
| --- | --- | --- |
| `entrance` | portón corredizo y cartel grande | portada: nombre y rol |
| `about` | ramen shop con cortina noren y vapor | sobre mí |
| `experience` | edificio de oficinas | experiencia |
| `contact` | cabina telefónica y expendedora | contacto |

- La maqueta de experiencia muestra dos filas de cuatro ventanas decorativas.
  En el diseño final, cada ventana iluminada representa un proyecto; la pared
  lateral lleva el timeline 2023 → 2026.
- El gato queda anclado al 38% del ancho de pantalla. La calle se mueve debajo de él.
- En escritorio, el ancho de cada fachada se limita al doble del ancla para que
  su borde izquierdo no se recorte al llegar a la parada. En móvil (hasta 720 px),
  se mantiene una fachada más ancha y se desplaza el contenido del cartel hacia
  el interior para que siga siendo legible.

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
| `--neon-violet` | `#8b5cf6` | acento terciario |
| `--paper` | `#fff4e6` | texto principal |
| `--muted` | `#9aa6bd` | texto secundario |
| `--ground` | `#0a0d18` | asfalto mojado |

Cada fachada tiene un neón dominante asignado en
[scene.ts](src/content/scene.ts). El resto de la escena se mantiene en índigo
profundo para que el color sea información, no decoración.

## Tipografía

- Títulos y body: Geist, ya instalada como fuente local.
- Acentos, HUD y etiquetas cortas: pila monoespaciada del sistema.
- No se descarga ninguna fuente japonesa. En Fase 1 los rótulos usan el
  fallback del sistema; en Fase 2 pasan a paths SVG. Son decorativos. Los
  futuros controles tendrán nombres accesibles traducidos.

## Materiales

Objetivos visuales para las fachadas definitivas; no describen las maquetas actuales.

- Cero rellenos planos: cada superficie lleva un gradiente de dos o tres stops y
  una banda de sombra de contacto.
- Grano estático al 5–8% de opacidad.
- Halation en los neones fuertes, con `mix-blend-mode: screen`.
- Charcos: espejo de la capa de carteles, `blur(2px)`, `opacity(.22)` y máscara
  de gradiente horizontal.
- Aberración cromática de 1 px solo en los dos carteles más brillantes.
- Paths con imperfección: nunca rectángulos perfectos.

## Movimiento

### Implementado

- [`scene.ts`](src/content/scene.ts) define las paradas y los tramos de pausa.
  [`alley-engine.ts`](src/lib/alley-engine.ts) traduce progreso normalizado a
  desplazamiento, con easing cúbico entre paradas y sin acceso al DOM.
- [`stage.tsx`](src/components/scene/stage.tsx) fija el viewport con `sticky`
  dentro de un contenedor alto. ScrollTrigger mide el progreso (sin `pin`).
  Un solo callback de `gsap.ticker`, activo mientras el movimiento se asienta,
  escribe el desplazamiento con `quickSetter`: fondo `0.15×`, calle `1×` y
  primer plano `1.35×`.
- [`alley.tsx`](src/components/alley.tsx) lee la parada activa del hash vía
  [`useHash`](src/lib/use-hash.ts). La navegación explícita actualiza el
  historial y salta al destino; el scroll reemplaza el hash al asentarse o
  después de un salto grande. Se mantienen `#about`, `#experience` y `#contact`
  en ambos idiomas. `#experience/<id>` todavía no abre detalles.

### Pendiente

- El gato acelera con la velocidad del scroll y se detiene al parar.
- Encendido de neones con DrawSVG; el flicker anima solo la capa de halo, nunca
  el elemento filtrado.
- Paneles con `<dialog>` nativo y expansión con GSAP Flip.

## Interacción

Objetivos de las fases siguientes. En Fase 1 la escena es decorativa: se recorre
por scroll o desde el HUD y el contenido completo se consulta en modo lectura.

| Momento | Respuesta |
| --- | --- |
| Scroll | La calle se desplaza, el gato camina y los carteles se encienden al llegar |
| Cursor sobre un cartel | Flicker breve e intensificación del halo |
| Click en un cartel | El panel se expande desde el elemento clickeado |
| Cursor sobre una ventana | La ventana se ilumina y aparece el título del proyecto |
| Click en una ventana | Panel con el detalle del proyecto |
| Hover en el timeline | Se iluminan las ventanas del período |
| Cursor cerca del gato | Las pupilas lo siguen |
| Click sostenido en el gato | Se deja acariciar y ronronea |
| Ocho segundos sin actividad | El gato se sienta y se lame la pata |

En móvil no hay hover: cada interacción se resuelve con tap y los targets tienen
al menos 44×44 px. El gesto vertical sigue desplazando la página; no se secuestra
el scroll horizontal.

## Accesibilidad

- El modo lectura es obligatorio y es, a la vez, el fallback de
  `prefers-reduced-motion` y de no-JS.
- Con movimiento reducido: sin pin, sin parallax, sin caminata y sin audio; las
  paradas se apilan como secciones normales.
- El modo lectura contiene el contenido en HTML semántico. La escena actual es
  decorativa y queda fuera del árbol de accesibilidad; el HUD sí es accesible.
- Fase 4: botones reales para carteles y ventanas interactivos, con foco visible.
  ESC cierra los paneles y devuelve el foco al disparador.

## Referencias

Las imágenes de referencia son mood board, no assets de producción. Aportan
paleta, densidad de carteles, asfalto mojado, halation y vocabulario de props
(bicicletas, expendedoras, plantas, aires acondicionados, cortinas noren).

No se usan como placa por tres razones: están en perspectiva de un punto y el
paneo lateral la rompe; una pintura única no se puede parallaxear; y las ventanas
necesitan ser nodos del DOM para poder iluminarse de a una.

## Fuera de alcance

- Un quinto local o una sección nueva.
- 3D real, WebGL o three.js.
- Tema claro.
- Reemplazar la música: se reutiliza el loop existente.
- Borrar el material del autocine mientras el approach nuevo no esté aprobado.
