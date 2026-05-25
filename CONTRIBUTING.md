# Contributing

Thank you for contributing to Scroll3D.

## Development

Use pnpm workspaces and keep changes scoped to the package that owns the
behavior.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Engineering Guidelines

- Keep TypeScript strict.
- Prefer Zod schemas for persisted and cross-package data.
- Add tests for schema, validation, runtime, export, and provider behavior.
- Keep generated/exported websites backend-free unless a package explicitly
  documents otherwise.
- Document behavior changes in package READMEs or docs.
- Do not introduce proprietary assets, copied templates, copied product copy, or
  cloned UI from other products.

## Pull Requests

Pull requests should include:

- A short summary of the change.
- Tests or a reason tests are not applicable.
- Notes about behavior or schema changes.
- Screenshots only when UI behavior changes.
