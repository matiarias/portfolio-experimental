# Autocine de noche

## Dirección final

El encuadre conserva la pantalla centrada, la tipografía editorial y el halo ámbar de Proyección cálida. La superficie usa el azul de Panorámica. La ciudad nocturna enmarca la escena y pierde un poco de intensidad cuando comienza la proyección.

- Pantalla en reposo `#263550` y en proyección `#30415C`.
- Texto `#FFF3E2`, acentos `#F4C797` y botón principal `#F2C294`.
- Marco de proyección al 74% del ancho en escritorio y al 94% en móvil. En móvil, el skyline se ve en una franja superior.
- Palatino Linotype, Book Antiqua o Georgia para los títulos. La tipografía de sistema sostiene los párrafos y controles.
- La escena usa un WebP y un marco con dos soportes. El nombre, los capítulos y los controles son HTML seleccionable.
- La torre escalonada y el farol quedan a la izquierda. A la derecha, el puente bajo y la ribera abierta recortan la ciudad a otra altura.

## Interacción

- **Play** enciende la proyección e inicia el audio con el mismo gesto. **Pausa** detiene el avance y el sonido. Cambiar de capítulo manualmente habilita lectura libre y pausa la música.
- **Sobre mí → Experiencia → Contacto**. El contacto queda visible al terminar. El cambio ES/EN conserva el capítulo.
- Con movimiento reducido, Play abre Sobre mí en silencio y el recorrido avanza a demanda.
- El audio de esta maqueta es el loop original de muestra de 76 BPM. La pista definitiva queda por elegir.

## Implementación

La maqueta funciona abriendo `index.html` en un navegador junto con sus dos recursos locales. Para producción, la base acordada es Next.js App Router, React, TypeScript y Tailwind, con rutas ES/EN y el contenido de cada capítulo accesible sin iniciar Play. La decisión sobre shadcn y el uso de un retrato real siguen abiertas.

<details>
<summary>Prompt de la edición del fondo con ImageGen</summary>

Precise edit of attached website artwork. Preserve wide 16:9 composition, exact midnight painterly lo-fi style, midnight navy/ink color grade and low exposure, sky, crescent moon, river horizon, shoreline, small almost-black car outline on lower left, and left side with a tall slender stepped Art Deco skyscraper and small warm amber windows plus the existing left lantern. Change the right side only so the two edges of the website definitely no longer look alike. Completely remove the tall skinny spired skyscraper at extreme right and any upper midrise cluster to right of the bridge. In the rightmost 14% of the canvas, an old low wide stone suspension bridge tower and curved suspension cables with tiny dim amber light pinpoints should be the one dominant readable silhouette in that edge band, full stone anchorage and roadway with river beneath. Place bridge tower at x=93%, y=54-68% and increase its presence slightly vs reference. No tall towers, no spires, no rooftop lantern to echo the one on the left. Beyond bridge at far right show only two or three very low warehouses and a suggestion of reeds on an unlit shore, spacious dark sky above. Right has cool muted slate low silhouettes and long thin bridge lines, left has the distinct vertical warm art deco silhouette. Keep right side quiet and low contrast. The central 74% will be obscured by a separate screen, so both sidebands x=0–13% and x=87–100% must convey clearly distinct silhouettes. This is an edit of the background plate only. No art-direction changes to the rest of the image, no cinema screen, no text, no signage, no watermarks.

</details>
