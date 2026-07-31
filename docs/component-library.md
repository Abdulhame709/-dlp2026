# 14. Component Library & UI Primitives catalog

**Author:** Design System Lead & Component Engineer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. UI Primitives Catalog

Cortex AI defines a standard, highly performant component catalog under `src/shared/components/ui/` built on Tailwind CSS v4 variables:

### 1.1 Button (`src/shared/components/ui/button.tsx`)
A flexible, type-safe trigger component.
- **Variants:**
  - `primary`: Sapphire Blue solid background (Electric Blue in Dark Mode).
  - `secondary`: Emerald Green solid background.
  - `outline`: Slate grey bordered card.
  - `ghost`: Transparent hoverable button.
  - `danger`: Red alerting solid background.
- **Sizes:** `sm` (height 36px), `md` (height 40px), `lg` (height 44px), `icon` (perfect 40x40 circle/square).
- **Features:** Supports custom `isLoading` spinning loaders which disables clicking automatically during active async transitions.

### 1.2 Input (`src/shared/components/ui/input.tsx`)
Form text fields.
- **Features:** Validated schemas, supports form labels, custom placeholders, and red borders accompanied by error text messages when validation fails.

### 1.3 Card (`src/shared/components/ui/card.tsx`)
SaaS panel container.
- **Sub-components:** `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Specs:** 12px rounded borders (`rounded-xl`), Slate dark/light theme background borders.

### 1.4 Skeleton (`src/shared/components/ui/skeleton.tsx`)
Pulsing placeholder boxes.
- **Usage:** Replaces card elements and texts during loading sequences.

---

## 2. Interactive Widget Template (`src/shared/components/dashboard/widget.tsx`)
A higher-order component designed to group dashboard statistics, calendars, and checklists:
- Exposes title and optional localized Arabic subtitle slots.
- Integrates custom heading icons (`icon`).
- Integrates action button slots on header row.
- Automates skeleton rendering when `isLoading` is set to `true`.
