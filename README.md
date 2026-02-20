# Mermaid Preview

A lightweight tool to preview Mermaid diagrams in real-time in your browser, launched from the terminal.
Built with the Bun runtime and zero external npm dependencies.

[日本語版 README](README.ja.md)

## File Structure

| File | Role |
|---|---|
| `package.json` | Project config + bin entry |
| `tsconfig.json` | TypeScript config |
| `src/cli.ts` | CLI entry point (argument parsing, stdin support, server startup, auto browser launch) |
| `src/server.ts` | HTTP server using Bun.serve() (static file serving + API) |
| `src/public/index.html` | Main page with left/right split view |
| `src/public/app.js` | mermaid.js integration, real-time rendering, dark mode support |
| `src/public/style.css` | CSS Grid layout, responsive design |
| `src/public/manifest.json` | PWA manifest |
| `src/public/sw.js` | Service Worker (CDN caching, offline support) |

## Usage

```bash
# Launch with a file
bun run src/cli.ts test.md

# Pipe via stdin
cat test.md | bun run src/cli.ts

# Launch with an empty editor
bun run src/cli.ts

# Auto-exit after browser loads (does not occupy the port)
bun run src/cli.ts --once test.md

# Global install
bun link
mermaid-preview diagram.md
```

## Features

- **Real-time preview**: Auto-renders 300ms after input (debounced)
- **Auto Mermaid extraction**: Supports both `` ```mermaid `` fenced blocks and raw Mermaid syntax
- **Dark mode**: Automatically follows OS settings
- **Drag-to-resize**: Adjust the boundary between editor and preview by dragging
- **Responsive**: Automatically switches to vertical split on narrow screens
- **PWA**: Installable as a desktop app from the browser
- **Zero dependencies**: Uses only Bun built-in features (mermaid.js loaded from CDN)
