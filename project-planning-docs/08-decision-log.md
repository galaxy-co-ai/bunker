# Decision Log: Bunker

**Project:** Bunker  
**Created:** January 25, 2026  
**Status:** Active

---

## Purpose

Track every deviation from the plan during building phase. Each entry follows the Change Protocol:

1. Log the decision here
2. Update MTS if tasks change
3. Update Project Pulse
4. Update Test Plan if acceptance criteria change

---

## Decisions

### Decision D001: Use sonner instead of toast

**Date:** January 25, 2026
**Trigger:** shadcn CLI reported toast component is deprecated

**Change:**
Installed sonner component instead of toast for notifications.

**Rationale:**
shadcn/ui has deprecated the toast component in favor of sonner. The CLI refused to install toast.

**MTS Impact:**
- Tasks added: None
- Tasks removed: None
- Tasks modified: Task 7 - "toast" replaced with "sonner"

**Other Doc Impact:**
- Project Pulse: Added note about sonner usage

---

### Decision D002: Manual shadcn configuration

**Date:** January 25, 2026
**Trigger:** `npx shadcn init` failed to detect Next.js framework

**Change:**
Manually created components.json and set up shadcn/ui structure instead of using CLI init.

**Rationale:**
The shadcn CLI could not auto-detect Next.js even with proper app structure. Manual configuration followed their documentation.

**MTS Impact:**
- Tasks added: None
- Tasks removed: None
- Tasks modified: None (Task 6 completed via manual config)

**Other Doc Impact:**
- Project Pulse: Added note about manual configuration

---

### Decision D004: Lazy database initialization

**Date:** January 25, 2026
**Trigger:** Build failed with "database is locked" error during Next.js static page generation

**Change:**
- Converted database initialization from immediate (on import) to lazy (on first access)
- Used Proxy pattern to intercept db access and initialize only when needed
- Added singleton pattern to ensure single database connection

**Rationale:**
Next.js pre-renders pages during build, which was causing the SQLite database to be opened multiple times in parallel, leading to lock conflicts. Lazy initialization ensures the database is only opened at runtime when actually needed.

**MTS Impact:**
- Tasks added: None
- Tasks removed: None
- Tasks modified: None

**Other Doc Impact:**
- None (build fix)

---

### Decision D003: Tailwind CSS v4 migration

**Date:** January 25, 2026
**Trigger:** Build failed with "Cannot apply unknown utility class `border-border`" and PostCSS plugin errors

**Change:**
- Updated globals.css to use Tailwind CSS v4 syntax (`@import "tailwindcss"` instead of `@tailwind` directives)
- Installed `@tailwindcss/postcss` package
- Updated postcss.config.js to use `@tailwindcss/postcss` instead of `tailwindcss`
- Simplified tailwind.config.ts (removed darkMode and theme config - now handled in CSS)
- Installed missing `class-variance-authority` package for button component

**Rationale:**
Tailwind CSS v4 was installed but config files were using v3 syntax. v4 requires different configuration approach with CSS-first design.

**MTS Impact:**
- Tasks added: None
- Tasks removed: None
- Tasks modified: None

**Other Doc Impact:**
- None (build configuration fix)

---

## Decision Template

When adding a new decision, use this format:

```markdown
### Decision D001: [Title]

**Date:** [Date]
**Trigger:** [What caused this decision]

**Change:**
[What changed from original plan]

**Rationale:**
[Why this change was necessary]

**MTS Impact:**
- Tasks added: [List or None]
- Tasks removed: [List or None]
- Tasks modified: [List or None]

**Other Doc Impact:**
- [Document]: [Change made]
```

---

**End of Decision Log**
