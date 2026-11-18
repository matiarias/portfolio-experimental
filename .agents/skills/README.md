# Skills del portfolio

Las skills compartidas se instalan en `.agents/skills/<nombre>/SKILL.md`. El archivo `skills-lock.json` en la raíz fija la revisión y el hash de cada una.

Desde la raíz de un clon nuevo, restauralas con:

```sh
npx skills experimental_install --frozen-lockfile --agent codex
```

- **frontend-design** guía la composición, la tipografía y la dirección visual.
- **modern-web-guidance** orienta los cambios de CSS y del navegador, con guías por patrón.
- **web-design-guidelines** sirve para revisar accesibilidad e interacción.
- **vercel-react-best-practices** sirve para revisar componentes React y Next.js.

Las convenciones propias del portfolio están en [AGENTS.md](../../AGENTS.md).
