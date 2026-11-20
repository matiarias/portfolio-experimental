# Portfolio de Matias Arias

**Dirección aprobada para la primera entrega:** Luces del autocine (opción B). El [handoff original](handoff-autocine-final/HANDOFF.md) fija el encuadre, la pantalla azul y la jerarquía de la escena. El [GIF comparativo](https://chatgpt.com/library?file_id=libfile_da030fe9c34c819182b034ce508579d2&account_id=personal) muestra la referencia de movimiento. Los [bocetos iniciales](design/bocetos-autocine.png) documentan la exploración.

## Composición

- Pantalla azul fija y frontal. Torre y farol a la izquierda, puente y ribera a la derecha. La pantalla tiene el mayor contraste y el mayor tamaño tipográfico.
- Ciudad en penumbra con capas de luz ancladas a la placa existente. El farol usa ámbar y el agua combina reflejos fríos con pequeños trazos cálidos. Los juncos con hojas inclinadas y bases en sombra se funden con la orilla derecha. El auto estacionado queda para una próxima iteración.
- En portada, el nombre es el título principal. **Software Engineer**, **Play** y **Ver experiencia** quedan visibles en el mismo cuadro. Portada y los capítulos están siempre disponibles debajo de la pantalla.
- Georgia para los títulos y Geist para la lectura y los controles. Azul de reposo `#263550`, azul activo `#30415C`, marfil `#FFF3E2` y ámbar `#F4C797` como referencias de color.
- Contacto centra el mensaje de disponibilidad remota y las tarjetas de GitHub, LinkedIn y correo. Las tarjetas se disponen en fila en escritorio amplio y se apilan en pantallas angostas. Comparten el mismo estilo en reposo.

## Interacción

| Momento | Respuesta |
| --- | --- |
| Cursor cerca de la torre | La punta y el remate de la torre recuperan un brillo ámbar. |
| Cursor cerca del farol | Aparece un halo cálido con un reflejo breve y suave bajo el farol. |
| Cursor cerca del puente | Se destacan el pilar y la línea de luz del tablero. |
| Cursor sobre el agua | Los reflejos se abren horizontalmente, separados del efecto del puente. |
| Cursor cerca de la orilla | Los juncos se inclinan suavemente, sueltan tres gotas de rocío y vuelven al reposo. |
| Cursor en la pantalla o fuera de la escena | Las luces locales vuelven al reposo. |
| Play | Sobre mí aparece de inmediato. La luz azul cae sobre el patio y los soportes mientras empieza el audio. |
| Pausa y Continuar | El tiempo y la música siguen el comportamiento de reproducción actual. La luz sostiene el plano durante la pausa. |
| Contacto | Vuelve un halo cálido difuso, con opacidad de 0,35, y los enlaces quedan disponibles. |

Las zonas del decorado reaccionan con puntero fino tanto en Portada como en los capítulos. La pantalla queda fija y su contenido conserva el foco. En móvil, la torre, el puente y la ribera forman una franja panorámica encima del marco. Al arrastrarla horizontalmente, los juncos se desplazan un poco más que la ciudad y ambas capas vuelven a su posición al soltar. Tocar una zona activa su luz o inclina los juncos durante el contacto. El gesto vertical sigue desplazando la página. Con movimiento reducido, la escena conserva su encuadre e iluminación ambiental y el recorrido sigue siendo manual y silencioso. Las capas son decorativas y quedan fuera de la navegación por teclado.

Experiencia conserva los ocho logros completos de Santander. Las rutas ES/EN, los enlaces directos a los tres capítulos y el acceso sin JavaScript siguen disponibles. La edición de Santander como programa de mano y los cambios al ritmo de reproducción se pueden evaluar en una iteración posterior.

## Plan en cambios pequeños

1. **Portada.** Aplicar la jerarquía tipográfica del boceto y enlazar Ver experiencia en ambos idiomas. Verificar la portada y el acceso directo con y sin JavaScript.
2. **Capas ambientales.** Colocar las luces de la ciudad y los juncos sobre la imagen actual. Cada zona tiene un efecto propio y CSS independiente. Confirmar que el recorte de la ciudad mantiene las luces ancladas y que el marco conserva el foco.
3. **Iluminación de la función.** Conectar el reflejo azul al estado de reproducción y el cálido a Contacto. Mantener el contenido legible durante el corte. Verificar Play, Pausa, Continuar, el salto manual y movimiento reducido.
4. **Revisión local.** Comparar portada y Play en escritorio y móvil. Probar el puntero sobre cada zona y de vuelta sobre la pantalla. Correr lint, tipos, Vitest, build y Playwright en Chromium, Firefox y WebKit.

La portada, la capa ambiental y la iluminación de la función se pueden revertir por separado. Para ajustar una reacción local, basta con cambiar o retirar su zona en el componente de la ciudad y su regla de estilos. La revisión visual en local precede cualquier publicación.
