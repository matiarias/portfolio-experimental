# Instrucciones del proyecto

- Tomá `handoff-autocine-final/HANDOFF.md` como referencia visual. Mantené la pantalla azul como foco, el fondo asimétrico en penumbra y la barra de capítulos discreta.
- Usá Next.js App Router, TypeScript estricto y Tailwind. Renderizá contenido y metadatos por idioma en el servidor. Reservá el componente cliente para el reproductor, historial, foco y animación.
- Actualizá los diccionarios EN y ES juntos. Conservá `#about`, `#experience` y `#contact` en ambas rutas y el acceso directo sin JavaScript.
- Play inicia el avance y el audio con el mismo gesto. Pausa detiene ambos, Continuar conserva el tiempo restante y los saltos manuales dejan el capítulo en lectura libre. Con movimiento reducido, el recorrido es manual y silencioso.
- Usá enlaces para navegación y botones para acciones. Conservá foco visible, orden de teclado y lectura móvil. Limitá GSAP a las transiciones de la proyección.
- Consultá el [índice de skills](.agents/skills/README.md) para elegir la guía del proyecto. Antes de cambiar CSS o comportamiento del navegador, consultá `modern-web-guidance` para el patrón específico. Preferí CSS nativo con degradación progresiva y verificá las interacciones en Chromium, Firefox y WebKit.
- Mantené iguales el HTML del servidor y el primer render del cliente. Leé valores del navegador después de hidratar o usá `useSyncExternalStore` con un snapshot inicial compatible con SSR. Si aparece un aviso, compará el HTML de la respuesta con el DOM y reproducilo en un navegador sin extensiones. Reservá `suppressHydrationWarning` en `<html>` para atributos externos comprobados. Corregí las discrepancias propias en su origen y mantené las pruebas de hidratación en Playwright.
- Después de cambios, corré `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` y `npm run test:e2e`. Usá Vitest para la interacción local y Playwright para los flujos del sitio compilado.
