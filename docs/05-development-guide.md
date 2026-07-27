# 05. Development Guide & Design System Foundations

## 1. Professional Coding Standards & Architecture
We enforce clean code patterns across both frontend and backend layers:
- **Clean Architecture:** Separate presentation, business application logic, and data infrastructure.
- **Service-Repository Pattern:** Controllers or API boundaries only parse parameters and verify auth. Business logic sits inside `services/`. Data operations are handled in `repositories/` using Supabase Client.
- **Strict Types:** No `any` type is allowed in the codebase. All API contracts and schemas are typed and validated.

---

## 2. Design System Foundations (مواصفات دليل التصميم)
To guarantee a premium, modern, and cohesive interface, Cortex AI follows this strict design foundation:

### 2.1 Color Palette (نظام الألوان)

#### Modern Technological Colors (Light Mode):
- **Primary (براند تكنولوجي):** `#0F52BA` (Sapphire Blue)
- **Secondary (إنتاجية):** `#10B981` (Emerald Green)
- **Neutral (محيط العمل):** `#F9FAFB` (Canvas White) & `#1F2937` (Charcoal Grey for text)
- **Accent:** `#8B5CF6` (Indigo)

#### Dark Mode Palette:
- **Primary:** `#3B82F6` (Electric Blue)
- **Neutral Background:** `#0F172A` (Deep Slate)
- **Neutral Card:** `#1E293B` (Border Slate)
- **Text Primary:** `#F8FAFC` (Slate Silver)

#### Status Indicators:
- **Success:** `#10B981` (Green)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)
- **Information:** `#3B82F6` (Blue)

---

### 2.2 Typography (الخطوط)
To achieve a professional SaaS appearance with seamless cross-lingual readability:
- **English Font Family:** `Inter`, `Plus Jakarta Sans`
- **Arabic Font Family (الخط العربي المعتمد):** `Cairo`
- **Header Weights:** `Bold` (`700`), `SemiBold` (`600`)
- **Body Text:** `Regular` (`400`), `Medium` (`500`)

---

### 2.3 Component Library Definitions & Spacing

- **Standard Grid System:** 8px base spacing scale (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Responsive Screen Breakpoints:**
  - **Desktop:** `1440px+`
  - **Tablet:** `768px` to `1439px`
  - **Mobile:** `320px` to `767px`

#### Reusable Interactive Elements:
1. **Buttons:**
   - *Primary:* Solid brand color with high contrast text, 6px border radius, transition duration 150ms.
   - *Secondary:* Outlined or soft tinted background for supportive tasks.
2. **Cards:**
   - 12px border radius (`rounded-xl`), soft background fill, subtle borders (`border-slate-200` in light, `border-slate-800` in dark).
3. **Forms:**
   - Labeled inputs, clear placeholder, explicit focus ring (`focus:ring-2 focus:ring-primary`).
4. **Tables:**
   - Structured columns, clean responsive rows, alternating zebra stripe option.

---

## 3. Git Workflow & Branching Strategy
We implement a streamlined version of **Git Flow**:
- `main` - Always holds deployable, tested production code.
- `develop` - Integration branch for active development.
- `feature/*` - Isolated branches for adding single, tested features.
- `bugfix/*` - Branch used for resolving issues.

---

## 4. Conventional Commits (معايير كتابة التعليقات)
Commits must follow the Conventional Commit specifications:
Format: `type(scope): description`

### Common Types:
- `feat(tasks): add AI task parsing`
- `fix(auth): solve refresh token crash`
- `docs(api): update sitemap srv`
- `refactor(db): optimize tasks index`
- `test(unit): add user settings coverage`
- `chore(deps): upgrade NextJS 15`

---

## 5. Pull Request Guidelines & Quality Gate
1. All Feature branches must trigger automated checks (Linting, Tests).
2. Code reviews from at least one peer developer.
3. Successful deployment to Staging environment before merging to `main`.
