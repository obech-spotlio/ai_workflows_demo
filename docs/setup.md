# Setup Guide — Kanban App

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 15
- Stitch MCP token (for design system sync)

## Quick Start

```bash
# 1. Clone and install
pnpm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Database
pnpm db:push        # Apply schema to database
pnpm db:seed        # Seed with sample data (optional)

# 4. Sync design tokens from Stitch
pnpm stitch:sync

# 5. Run
pnpm dev            # http://localhost:3000
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stitch Design System MCP
STITCH_MCP_URL="https://stitch.example.com/mcp/v1"
STITCH_MCP_TOKEN="your-stitch-token"
```

## Scripts

| Script             | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start dev server (port 3000)       |
| `pnpm build`       | Production build                   |
| `pnpm start`       | Start production server            |
| `pnpm lint`        | ESLint                             |
| `pnpm format`      | Prettier format                    |
| `pnpm test`        | Run Vitest                         |
| `pnpm test:watch`  | Vitest watch mode                  |
| `pnpm db:push`     | Push Drizzle schema to DB          |
| `pnpm db:migrate`  | Run Drizzle migrations             |
| `pnpm db:studio`   | Open Drizzle Studio                |
| `pnpm db:seed`     | Seed database                      |
| `pnpm stitch:sync` | Sync design tokens from Stitch MCP |

## Dependencies

```jsonc
// package.json (key dependencies)
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.0.0",
    "drizzle-orm": "^0.35.0",
    "postgres": "^3.4.0",
    "next-auth": "^5.0.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "drizzle-kit": "^0.28.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
  },
}
```
