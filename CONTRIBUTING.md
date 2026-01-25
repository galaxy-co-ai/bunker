# Contributing to Bunker

Thank you for your interest in contributing to Bunker! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Start the development server**: `npm run dev`
4. **Open** http://localhost:3000 in your browser

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/sidebar-toggle`)
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(chat): add streaming response support`
- `fix(sidebar): resolve toggle button visibility`
- `docs(readme): update installation instructions`

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure TypeScript compiles without errors: `npm run build`
4. Update documentation if needed
5. Submit a PR with a clear description

## Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier defaults
- **Imports**: Organized by category (React, external, internal, types)
- **Components**: Functional components with named exports

## Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, database, AI adapters
└── stores/        # Zustand state stores
```

## Testing

Currently, the project uses manual testing. Contributions adding automated tests are welcome!

## Questions?

Open an issue for questions or discussions about potential changes.
