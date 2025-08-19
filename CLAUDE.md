# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Colorama is a SvelteKit-based creative canvas web application - an offline-first PWA with three drawing modes: Pixel Art, Free Drawing, and Mandala creation. The project is in early development with foundational infrastructure complete but core features not yet implemented.

## Essential Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm dev -- --open         # Start dev server and open browser

# Code Quality & Testing
pnpm check                  # Type checking with Svelte
pnpm lint                   # Lint with ESLint + Prettier
pnpm format                 # Format code with Prettier
pnpm test:unit             # Run Vitest unit tests
pnpm test:e2e              # Run Playwright E2E tests
pnpm test                  # Run all tests

# Building
pnpm build                  # Create production build
pnpm preview                # Preview production build
```

## Architecture & Code Organization

### Tech Stack
- **Frontend Framework**: SvelteKit 2.x with Svelte 5
- **Styling**: TailwindCSS 4.x
- **Internationalization**: Paraglide JS with Inlang (type-safe i18n)
- **Testing**: Vitest (browser-based for .svelte files, Node for .ts) + Playwright
- **Build**: Vite + TypeScript (strict mode)
- **Package Manager**: pnpm

### Key Architectural Patterns

1. **Internationalization Setup**
   - Server middleware handles language detection in `src/lib/i18n.ts`
   - Messages stored in `/messages/*.json` (EN/DE configured)
   - Generated code in `/src/lib/paraglide/` (gitignored)
   - URL-based localization with language routing

2. **Testing Configuration**
   - Browser-based Vitest for `.svelte` components
   - Node-based testing for server/utility code
   - E2E tests automatically build and preview before running
   - Test files: `*.spec.ts` for unit tests, `/e2e/*.test.ts` for E2E

3. **Module Resolution**
   - Use `$lib` alias for imports from `/src/lib/`
   - TypeScript configured with bundler module resolution
   - Strict type checking with `checkJs` enabled

### Planned Features (from ProjectPlan.md)

The application will implement:
- **Canvas API** with three drawing modes (Pixel, Free Draw, Mandala)
- **Offline storage** using IndexedDB/Dexie.js
- **PWA capabilities** with service workers
- **Export functionality** (PNG, SVG, GIF)
- **Optional cloud sync** with Supabase

### Code Style
- Tabs for indentation
- Single quotes for strings
- 100 character line width
- Semicolons required

## Development Workflow

When implementing new features:
1. Add translatable strings to `/messages/*.json` for all supported languages
2. Place reusable components in `/src/lib/`
3. Write unit tests alongside components (`*.spec.ts`)
4. Run `pnpm check` and `pnpm lint` before committing
5. Test offline functionality given the PWA nature of the app