# 12. App Shell & Design System Architecture

**Author:** Chief Technology Officer & Lead UI Engineer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Application Shell Structure

Cortex AI implements a premium, edge-optimized application shell to support professional daily workspace interactions:

```
┌────────────────────────────────────────────────────────┐
│                        TOP NAV                         │
│  [Breadcrumb]      [Search Bar]      [Switcher] [Icon] │
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│  S       │                                             │
│  I       │                 MAIN CONTENT                │
│  D       │                                             │
│  E       │             [Responsive Widget Grid]        │
│  B       │                                             │
│  A       │                                             │
│  R       │                                             │
└──────────┴─────────────────────────────────────────────┘
```

- **Collapsible Sidebar (`src/shared/components/layout/sidebar.tsx`):**
  - Managed by a global Zustand store (`useLayoutStore`).
  - Animates smoothly from `w-64` (expanded) to `w-16` (collapsed) using high-performance CSS transitions.
  - Dynamically displays Arabic and English typography, with smart tooltips overlaying on hover in collapsed mode.
- **Top Navigation (`src/shared/components/layout/top-nav.tsx`):**
  - Handles dynamic breadcrumb parsing directly from Next.js 15 route paths.
  - Includes the multi-tenant **Workspace Switcher** to shift contexts instantly.
  - Integrates the theme controller button (Sun/Moon toggles).

---

## 2. Design System Tokens & Variable Mapping

Cortex AI leverages **Tailwind CSS v4** direct inline CSS variable injection for rapid performance.

- **Spacing Scale:** Standardized on 8px grid multipliers (`0.5rem = 8px`, `1rem = 16px`, `1.5rem = 24px`, etc.).
- **Radius Tokens:**
  - `rounded-lg` (`var(--radius)`) - 8px for standard components.
  - `rounded-xl` - 12px for cards and major panel segments.
- **Responsive Layout Breakpoints:**
  - **Desktop (1440px+):** Sidebar expanded, full navigation panel and quad-grid widget placements.
  - **Tablet (768px-1439px):** Sidebar collapsed automatically, double-grid widget placements.
  - **Mobile (320px-767px):** Sidebar fully collapsed into overlay drawer, single-column vertical widget stack.

---

## 3. UI Component Library (Primes)

All components are copy-pasteable, modular, and WCAG AA compliant:
1. **`Button` (`src/shared/components/ui/button.tsx`):** Type-safe properties supporting color states, size overrides, and automatic spinning loading icons.
2. **`Input` (`src/shared/components/ui/input.tsx`):** Text fields featuring localized labels and active error state border triggers.
3. **`Card` (`src/shared/components/ui/card.tsx`):** Flexible layout pane supporting card headers, titles, contents, and footers.
4. **`Skeleton` (`src/shared/components/ui/skeleton.tsx`):** Pulsing grayscale panels mimicking actual text or cards during async REST API resolutions.

---

## 4. Reusable Dashboard Widget Framework
To support dynamic custom cards that can be rearranged or reused across multiple workspaces, we deploy a unified **Widget Component** (`src/shared/components/dashboard/widget.tsx`):

### Props API:
```typescript
interface WidgetProps {
  title: string;
  arabicTitle?: string;
  description?: string;
  icon?: React.ComponentType;
  isLoading?: boolean;
  error?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

- **Features:**
  - Seamless support for skeletons out of the box when `isLoading` is set to `true`.
  - Dedicated action-link button slot (`actions`) on the top-right header for widget-level actions.
  - Automatic error boundary state wrapper mapping.
