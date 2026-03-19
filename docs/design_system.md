# Design System — Stitch MCP Integration

## Overview

The app's design system comes from **Stitch**, the corporate design system exposed via MCP (Model Context Protocol). This allows both developers and AI agents to consume tokens, components, and guidelines directly from the source of truth.

## MCP Integration

### Configuration

```jsonc
// .mcp.json
{
  "mcpServers": {
    "stitch": {
      "type": "http",
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "${STITCH_API_KEY}",
      },
    },
  },
}
```

### Available MCP Resources

The Stitch MCP exposes the following resources that AI agents can query:

| Resource                     | Description                                 | Usage                          |
| ---------------------------- | ------------------------------------------- | ------------------------------ |
| `stitch://tokens/colors`     | Color palette (semantic + primitive)        | Map to Tailwind `colors`       |
| `stitch://tokens/typography` | Font families, sizes, weights, line-heights | Map to Tailwind `fontSize`     |
| `stitch://tokens/spacing`    | Spacing scale                               | Map to Tailwind `spacing`      |
| `stitch://tokens/radii`      | Border radius tokens                        | Map to Tailwind `borderRadius` |
| `stitch://tokens/shadows`    | Box shadow tokens                           | Map to Tailwind `boxShadow`    |
| `stitch://components/{name}` | Component spec (props, variants, anatomy)   | Build `shared/ui/` wrappers    |
| `stitch://patterns/{name}`   | UI pattern guidelines                       | Reference for composition      |
| `stitch://icons`             | Icon set metadata                           | Use in components              |

### Workflow: Syncing Tokens

1. **Query** — The agent queries `stitch://tokens/*` via MCP
2. **Transform** — Converts tokens to Tailwind preset format
3. **Write** — Generates `.stitch/tailwind-preset.ts`
4. **Consume** — `tailwind.config.ts` imports the preset

```typescript
// .stitch/tailwind-preset.ts (auto-generated from MCP)
import type { Config } from "tailwindcss";

export const stitchPreset: Partial<Config> = {
  theme: {
    colors: {
      // Semantic colors
      primary: {
        DEFAULT: "var(--stitch-primary)",
        hover: "var(--stitch-primary-hover)",
        active: "var(--stitch-primary-active)",
        subtle: "var(--stitch-primary-subtle)",
      },
      surface: {
        primary: "var(--stitch-surface-primary)",
        secondary: "var(--stitch-surface-secondary)",
        hover: "var(--stitch-surface-hover)",
        overlay: "var(--stitch-surface-overlay)",
      },
      content: {
        primary: "var(--stitch-content-primary)",
        secondary: "var(--stitch-content-secondary)",
        tertiary: "var(--stitch-content-tertiary)",
        inverse: "var(--stitch-content-inverse)",
      },
      border: {
        DEFAULT: "var(--stitch-border-default)",
        subtle: "var(--stitch-border-subtle)",
        strong: "var(--stitch-border-strong)",
      },
      status: {
        success: "var(--stitch-status-success)",
        warning: "var(--stitch-status-warning)",
        error: "var(--stitch-status-error)",
        info: "var(--stitch-status-info)",
      },
    },
    borderRadius: {
      none: "0",
      sm: "var(--stitch-radius-sm)",
      DEFAULT: "var(--stitch-radius-md)",
      md: "var(--stitch-radius-md)",
      lg: "var(--stitch-radius-lg)",
      xl: "var(--stitch-radius-xl)",
      full: "9999px",
    },
    fontFamily: {
      sans: ["var(--stitch-font-sans)", "system-ui", "sans-serif"],
      mono: ["var(--stitch-font-mono)", "monospace"],
    },
  },
};
```

### CSS Variables Layer

Stitch tokens are injected as CSS custom properties in the layout root:

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Injected from Stitch MCP — do not edit manually */
    --stitch-primary: #2563eb;
    --stitch-primary-hover: #1d4ed8;
    --stitch-primary-active: #1e40af;
    --stitch-primary-subtle: #eff6ff;

    --stitch-surface-primary: #ffffff;
    --stitch-surface-secondary: #f8fafc;
    --stitch-surface-hover: #f1f5f9;
    --stitch-surface-overlay: rgba(0, 0, 0, 0.5);

    --stitch-content-primary: #0f172a;
    --stitch-content-secondary: #475569;
    --stitch-content-tertiary: #94a3b8;
    --stitch-content-inverse: #ffffff;

    --stitch-border-default: #e2e8f0;
    --stitch-border-subtle: #f1f5f9;
    --stitch-border-strong: #cbd5e1;

    --stitch-status-success: #16a34a;
    --stitch-status-warning: #ca8a04;
    --stitch-status-error: #dc2626;
    --stitch-status-info: #2563eb;

    --stitch-radius-sm: 4px;
    --stitch-radius-md: 8px;
    --stitch-radius-lg: 12px;
    --stitch-radius-xl: 16px;

    --stitch-font-sans: "Inter", system-ui, sans-serif;
    --stitch-font-mono: "JetBrains Mono", monospace;
  }

  .dark {
    --stitch-primary: #3b82f6;
    --stitch-primary-hover: #60a5fa;
    --stitch-primary-active: #93c5fd;
    --stitch-primary-subtle: #1e293b;

    --stitch-surface-primary: #0f172a;
    --stitch-surface-secondary: #1e293b;
    --stitch-surface-hover: #334155;
    --stitch-surface-overlay: rgba(0, 0, 0, 0.7);

    --stitch-content-primary: #f8fafc;
    --stitch-content-secondary: #94a3b8;
    --stitch-content-tertiary: #64748b;
    --stitch-content-inverse: #0f172a;

    --stitch-border-default: #334155;
    --stitch-border-subtle: #1e293b;
    --stitch-border-strong: #475569;
  }
}
```

## Component Wrappers (shared/ui)

Components in `shared/ui/` are lightweight wrappers that apply Stitch tokens on top of headless primitives. Each wrapper:

1. Queries the component spec via `stitch://components/{name}`
2. Implements the variants defined in the spec
3. Uses Tailwind classes with Stitch tokens
4. Exposes a consistent API with `className` override via `cn()`

### Example: Button

```typescript
// shared/ui/button.tsx
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

// Variants derived from stitch://components/button spec
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-content-inverse hover:bg-primary-hover active:bg-primary-active",
        secondary: "border border-border bg-surface-primary text-content-primary hover:bg-surface-hover",
        ghost: "text-content-primary hover:bg-surface-hover",
        destructive: "bg-status-error text-content-inverse hover:bg-status-error/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
```

### Example: Badge (for card labels/priorities)

```typescript
// shared/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-subtle text-primary",
        success: "bg-status-success/10 text-status-success",
        warning: "bg-status-warning/10 text-status-warning",
        error: "bg-status-error/10 text-status-error",
        info: "bg-status-info/10 text-status-info",
        outline: "border border-border text-content-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

## Kanban-Specific Components Mapping

| Kanban Element    | Stitch Component              | Token Usage                                   |
| ----------------- | ----------------------------- | --------------------------------------------- |
| Board card        | `Card` + `surface-primary`    | `bg-surface-primary border-border rounded-lg` |
| Column            | Custom (no Stitch equiv)      | `bg-surface-secondary rounded-xl`             |
| Card drag preview | `Card` + `shadow-lg`          | `shadow-lg ring-2 ring-primary`               |
| Priority badge    | `Badge`                       | Status color variants                         |
| Column header     | `Heading` + `content-primary` | `text-content-primary font-semibold`          |
| Add card button   | `Button` ghost variant        | `variant="ghost"`                             |
| Card labels       | `Badge` custom colors         | Dynamic `bg-[color]/10 text-[color]`          |

## Design Tokens Refresh

To re-sync tokens from Stitch MCP:

```bash
# The AI agent runs this automatically when it detects drift
# or manually via command
pnpm stitch:sync
```

The script:

1. Queries all `stitch://tokens/*` endpoints
2. Generates `.stitch/tailwind-preset.ts`
3. Generates `.stitch/css-variables.css`
4. Updates `globals.css` with the new variables

## AI Agent Instructions for Stitch

When an AI agent needs to create or modify a UI component:

1. **Query first** — Before writing JSX, query `stitch://components/{name}` to see if an applicable Stitch component exists.
2. **Respect variants** — Use the variants defined in the spec, do not invent new ones.
3. **Tokens over hardcoded** — Never use hex colors directly. Always use `text-content-*`, `bg-surface-*`, etc.
4. **Dark mode for free** — Stitch CSS variables already handle dark mode. Do not duplicate logic.
5. **Wrapper, not fork** — If a Stitch component does not have a needed variant, extend the wrapper in `shared/ui/`, do not copy the component.
