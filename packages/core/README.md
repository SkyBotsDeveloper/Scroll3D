# @scroll3d/core

Core schemas, inferred TypeScript types, validation helpers, and fixtures for
Scroll3D projects.

## Exports

- Zod schemas for projects, pages, sections, themes, assets, scenes, frame sets,
  providers, agents, jobs, and export settings.
- TypeScript types inferred from those schemas.
- `parseProject(input)`
- `safeParseProject(input)`
- `createProject(input)`
- `validateProject(input)`
- `isProjectMode(value)`
- `sampleProject`

## Example

```ts
import { parseProject, sampleProject } from "@scroll3d/core";

const project = parseProject(sampleProject);
console.log(project.name);
```

## Development

```bash
pnpm --filter @scroll3d/core lint
pnpm --filter @scroll3d/core typecheck
pnpm --filter @scroll3d/core test
pnpm --filter @scroll3d/core build
```
