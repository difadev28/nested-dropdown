# Coding Standards

> **Stack:** React · React Router (Data Mode) · Tailwind CSS  
> **Project:** Regional Filter App (Province → Regency → District)  
> **Audience:** Senior Engineers  
> **Version:** 1.1.0

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [Component Architecture](#3-component-architecture)
4. [React Router Data Mode Patterns](#4-react-router-data-mode-patterns)
5. [State & URL Management](#5-state--url-management)
6. [Data Layer — Loaders & Mock Data](#6-data-layer--loaders--mock-data)
7. [Styling with Tailwind CSS](#7-styling-with-tailwind-css)
8. [Sidebar — Nested Region Dropdown](#8-sidebar--nested-region-dropdown)
9. [TypeScript Contracts](#9-typescript-contracts)
10. [Form & Filter Behavior](#10-form--filter-behavior)
11. [Accessibility](#11-accessibility)
12. [Code Quality & Linting](#12-code-quality--linting)
13. [Git Conventions](#13-git-conventions)

---

## 1. Project Structure

Organize by **feature-first**, not by file type. Keep shared infrastructure flat under `src/`.

```
src/
├── components/          # Shared, reusable UI primitives
│   ├── Breadcrumb/
│   │   ├── Breadcrumb.tsx
│   │   └── index.ts
│   ├── Combobox/
│   │   ├── Combobox.tsx
│   │   └── index.ts
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarRegionFilter.tsx   # ← nested dropdown tree
│   │   ├── SidebarFilterItem.tsx     # ← single collapsible level
│   │   └── index.ts
│   └── Header/
│       ├── Header.tsx
│       └── index.ts
│
├── features/
│   └── region/          # Self-contained region filter feature
│       ├── RegionFilter.tsx
│       ├── RegionPage.tsx
│       ├── loader.ts        # React Router loader
│       ├── types.ts
│       └── index.ts
│
├── data/                # Mock data (replace with API calls later)
│   ├── provinces.ts
│   ├── regencies.ts
│   └── districts.ts
│
├── layouts/
│   └── AppLayout.tsx    # Sidebar + Header + <Outlet />
│
├── router/
│   └── index.tsx        # createBrowserRouter config
│
├── utils/
│   ├── region.ts        # Pure filter helpers
│   └── cn.ts            # Class name utility
│
└── main.tsx
```

**Rules:**
- Each component folder owns its own `index.ts` barrel export.
- No circular imports across features.
- `data/` is the single source of truth for mock data; never import raw arrays inline in components.

---

## 2. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Component file | `PascalCase.tsx` | `RegionFilter.tsx` |
| Hook file | `camelCase.ts` | `useRegionFilter.ts` |
| Loader file | `camelCase.ts` | `loader.ts` |
| Utility file | `camelCase.ts` | `region.ts` |
| Type / Interface | `PascalCase` | `Province`, `LoaderData` |
| Variable / function | `camelCase` | `selectedProvince` |
| Constant | `UPPER_SNAKE_CASE` | `DEFAULT_PROVINCE_LABEL` |
| CSS class (custom) | `kebab-case` | `breadcrumb`, `sidebar-nav` |
| URL search param | `kebab-case` | `?province=1&regency=2` |

---

## 3. Component Architecture

### 3.1 Principles

- **Single Responsibility** — one component, one job.
- **Props down, events up** — never mutate parent state from a child.
- **Dumb vs Smart** — UI components in `components/` know nothing about routing or loaders. Feature components in `features/` are allowed to use `useLoaderData`, `useSearchParams`, etc.

### 3.2 Component Signature

Always type props explicitly. Default to named exports for components.

```tsx
// ✅ Correct
interface ComboboxProps {
  name: string;           // maps to HTML name attribute
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function Combobox({ name, label, options, value, onChange, disabled = false }: ComboboxProps) {
  return (
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="..."
    >
      <option value="">— Pilih {label} —</option>
      {options.map((opt) => (
        <option key={opt.id} value={String(opt.id)}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}
```

### 3.3 Combobox `name` Contract

These three `name` attributes are **immutable**. Do not rename them.

| Label | `name` attribute |
|---|---|
| Provinsi | `province` |
| Kota/Kabupaten | `regency` |
| Kecamatan | `district` |

### 3.4 Breadcrumb Contract

The breadcrumb wrapper element **must** carry the class `breadcrumb`. This is a testable contract.

```tsx
// ✅ Required
<nav aria-label="breadcrumb" className="breadcrumb ...">
```

### 3.5 Main Content Contract

The main content area **must** use the `<main>` semantic tag.

```tsx
// ✅ Required
<main className="...">
  {/* region-dependent content */}
</main>
```

---

## 4. React Router Data Mode Patterns

This project uses **React Router data mode** (`createBrowserRouter`) without a meta-framework. No `next`, no `remix`.

### 4.1 Router Setup

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { regionLoader } from '@/features/region/loader';
import { RegionPage } from '@/features/region/RegionPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RegionPage />,
        loader: regionLoader,
      },
    ],
  },
]);
```

### 4.2 Loader Rules

- Loaders must be **pure functions** — no side effects, no setState.
- Return a plain serializable object from every loader.
- Loaders receive the `request` object; read search params from it.
- Never throw inside a loader unless you explicitly return a `Response` error to be caught by an `errorElement`.

```ts
// src/features/region/loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';
import { provinces } from '@/data/provinces';
import { regencies } from '@/data/regencies';
import { districts } from '@/data/districts';
import type { LoaderData } from './types';

export async function regionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const provinceId = Number(url.searchParams.get('province')) || null;
  const regencyId = Number(url.searchParams.get('regency')) || null;

  const filteredRegencies = provinceId
    ? regencies.filter((r) => r.province_id === provinceId)
    : [];

  const filteredDistricts = regencyId
    ? districts.filter((d) => d.regency_id === regencyId)
    : [];

  return {
    provinces,
    regencies: filteredRegencies,
    districts: filteredDistricts,
    selected: { provinceId, regencyId },
  };
}
```

### 4.3 Consuming Loader Data

Use `useLoaderData` typed with your return shape. Never use `any`.

```tsx
import { useLoaderData } from 'react-router-dom';
import type { LoaderData } from './types';

export function RegionPage() {
  const data = useLoaderData() as LoaderData;
  // ...
}
```

---

## 5. State & URL Management

### 5.1 URL as Single Source of Truth

Filter state **lives in the URL** (`?province=1&regency=3`). This is the only way to guarantee persistence across browser refreshes without touching `localStorage`.

```tsx
// ✅ Correct pattern — navigate to update filters
import { useNavigate, useSearchParams } from 'react-router-dom';

function RegionFilter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  function handleProvinceChange(provinceId: string) {
    // Clear dependent filters when parent changes
    const params = new URLSearchParams({ province: provinceId });
    navigate(`?${params.toString()}`, { replace: true });
  }

  function handleReset() {
    navigate('/', { replace: true });
  }
}
```

**Rules:**
- `replace: true` on every filter change so the browser back button doesn't re-traverse filter states.
- When province changes → clear regency and district from the URL.
- When regency changes → clear district from the URL.
- Reset navigates to `/` with no search params.

### 5.2 No Redundant Local State for Filters

Do **not** mirror URL params into `useState`. Read them directly from `useSearchParams` or from the loader.

```tsx
// ❌ Wrong
const [province, setProvince] = useState(searchParams.get('province'));

// ✅ Correct
const provinceId = searchParams.get('province') ?? '';
```

---

## 6. Data Layer — Loaders & Mock Data

### 6.1 Mock Data Structure

All mock data lives under `src/data/` as typed constant arrays. Data files export a single named constant.

```ts
// src/data/provinces.ts
import type { Province } from '@/features/region/types';

export const provinces: Province[] = [
  { id: 1, name: 'Kepulauan Riau' },
  { id: 2, name: 'DKI Jakarta' },
  { id: 3, name: 'Bali' },
];
```

```ts
// src/data/regencies.ts
import type { Regency } from '@/features/region/types';

export const regencies: Regency[] = [
  { id: 1, name: 'Kota Batam',           province_id: 1 },
  { id: 2, name: 'Kota Tanjung Pinang',  province_id: 1 },
  { id: 3, name: 'Jakarta Selatan',      province_id: 2 },
  { id: 4, name: 'Jakarta Barat',        province_id: 2 },
  { id: 5, name: 'Kota Denpasar',        province_id: 3 },
  { id: 6, name: 'Badung',               province_id: 3 },
];
```

```ts
// src/data/districts.ts
import type { District } from '@/features/region/types';

export const districts: District[] = [
  { id: 1,  name: 'Batam Kota',            regency_id: 1 },
  { id: 2,  name: 'Batu Ampar',            regency_id: 1 },
  { id: 3,  name: 'Belakang Padang',       regency_id: 1 },
  { id: 4,  name: 'Bukit Bestari',         regency_id: 2 },
  { id: 5,  name: 'Tanjung Pinang Barat',  regency_id: 2 },
  { id: 6,  name: 'Tanjung Pinang Kota',   regency_id: 2 },
  { id: 7,  name: 'Kebayoran Baru',        regency_id: 3 },
  { id: 8,  name: 'Kebayoran Lama',        regency_id: 3 },
  { id: 9,  name: 'Cilandak',              regency_id: 3 },
  { id: 10, name: 'Kebon Jeruk',           regency_id: 4 },
  { id: 11, name: 'Tamansari',             regency_id: 4 },
  { id: 12, name: 'Grogol Petamburan',     regency_id: 4 },
  { id: 13, name: 'Denpasar Selatan',      regency_id: 5 },
  { id: 14, name: 'Denpasar Barat',        regency_id: 5 },
  { id: 15, name: 'Denpasar Utara',        regency_id: 5 },
  { id: 16, name: 'Kuta',                  regency_id: 6 },
  { id: 17, name: 'Kuta Selatan',          regency_id: 6 },
  { id: 18, name: 'Kuta Utara',            regency_id: 6 },
];
```

### 6.2 Filter Utilities

Keep filtering logic in pure utility functions — easy to unit test without React.

```ts
// src/utils/region.ts
import type { Regency, District } from '@/features/region/types';

export function filterRegenciesByProvince(regencies: Regency[], provinceId: number | null): Regency[] {
  if (!provinceId) return [];
  return regencies.filter((r) => r.province_id === provinceId);
}

export function filterDistrictsByRegency(districts: District[], regencyId: number | null): District[] {
  if (!regencyId) return [];
  return districts.filter((d) => d.regency_id === regencyId);
}
```

---

## 7. Styling with Tailwind CSS

### 7.1 Principles

- **No inline styles.** Use Tailwind utility classes exclusively.
- **No custom CSS files** unless a class requires animation or a pseudo-selector that Tailwind can't express.
- Co-locate variant logic with the component, not in a separate stylesheet.

### 7.2 Class Organization Order

Follow this order within a `className` string for readability:

```
Layout → Flex/Grid → Spacing → Sizing → Typography → Color/Background → Border → Effects → State → Responsive
```

```tsx
// ✅ Consistent order
<div className="flex items-center gap-4 px-6 py-3 w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 md:px-8">
```

### 7.3 Layout Skeleton

The app uses a classic three-zone layout:

```
┌──────────────────────────────────────────┐
│                  Header                   │  h-16, sticky top-0
│  [Breadcrumb]            [User/Actions]   │
├────────────┬─────────────────────────────┤
│            │                             │
│  Sidebar   │         <main>              │
│  w-64      │         flex-1              │
│            │                             │
└────────────┴─────────────────────────────┘
```

```tsx
// src/layouts/AppLayout.tsx
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 7.4 Disabled State Pattern

Comboboxes with no options must be visually disabled and semantically `disabled`.

```tsx
<select
  name="regency"
  disabled={regencies.length === 0}
  className="... disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
>
```

### 7.5 No Magic Numbers in Classes

Define semantic token helpers for repeated patterns.

```ts
// src/utils/cn.ts  (optional, no library needed)
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

---

## 8. Sidebar — Nested Region Dropdown

The sidebar contains the primary region filter UI as a **three-level collapsible nested dropdown tree**: Province → Regency → District. This replaces a plain `<select>` stack. Each level is indented, opens only when its parent is selected, and reflects the active URL state.

### 8.1 Visual Anatomy

```
┌─────────────────────────────┐
│  SIDEBAR                    │
│  ─────────────────────────  │
│  Filter Wilayah             │
│                             │
│  ▼ Kepulauan Riau  ●        │  ← Province (selected, expanded)
│    ▼ Kota Batam    ●        │  ← Regency (selected, expanded)
│      · Batam Kota           │
│      · Batu Ampar  ●        │  ← District (active)
│      · Belakang Padang      │
│    › Kota Tanjung Pinang    │  ← Regency (collapsed)
│  › DKI Jakarta              │  ← Province (collapsed)
│  › Bali                     │
│                             │
│  [ Reset Filter ]           │
└─────────────────────────────┘
```

**Visual states:**
- `›` chevron right = collapsed (children hidden)
- `▼` chevron down = expanded (children visible)
- `●` filled dot = currently active selection
- Indentation increases with each level (`pl-3` → `pl-6` → `pl-9`)

### 8.2 Component Tree

```
Sidebar
└── SidebarRegionFilter          ← reads loader data + searchParams
    └── SidebarFilterItem        ← renders one collapsible level (province)
        └── SidebarFilterItem    ← renders one collapsible level (regency)
            └── SidebarFilterItem ← leaf level (district)
```

`SidebarFilterItem` is a **generic, recursive-ready** component. It does not know about provinces, regencies, or districts — it only knows: label, isActive, isExpanded, children, and onClick.

### 8.3 SidebarFilterItem — Component Spec

```tsx
// src/components/Sidebar/SidebarFilterItem.tsx
import { cn } from '@/utils/cn';

interface SidebarFilterItemProps {
  label: string;
  isActive: boolean;       // this item is the currently selected value
  isExpanded: boolean;     // children are visible
  depth: 0 | 1 | 2;       // 0 = province, 1 = regency, 2 = district
  onClick: () => void;
  children?: React.ReactNode;
}

const depthPadding: Record<0 | 1 | 2, string> = {
  0: 'pl-3',
  1: 'pl-6',
  2: 'pl-9',
};

export function SidebarFilterItem({
  label,
  isActive,
  isExpanded,
  depth,
  onClick,
  children,
}: SidebarFilterItemProps) {
  const hasChildren = Boolean(children);

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 w-full py-1.5 pr-3 text-sm rounded-md transition-colors',
          depthPadding[depth],
          isActive
            ? 'text-blue-600 font-semibold bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        )}
      >
        {/* Expand/collapse chevron (only if has children) */}
        {hasChildren ? (
          <span
            className={cn(
              'shrink-0 transition-transform duration-200',
              isExpanded ? 'rotate-90' : 'rotate-0',
            )}
            aria-hidden="true"
          >
            ›
          </span>
        ) : (
          <span className="shrink-0 w-3" aria-hidden="true" />
        )}

        <span className="truncate flex-1 text-left">{label}</span>

        {/* Active indicator dot */}
        {isActive && (
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
        )}
      </button>

      {/* Children — only rendered when expanded */}
      {hasChildren && isExpanded && (
        <div role="group">{children}</div>
      )}
    </div>
  );
}
```

**Rules:**
- `depth` is a discriminated union of `0 | 1 | 2` — never a plain `number`. This prevents off-by-one indentation bugs.
- Never pass routing logic into `SidebarFilterItem`. It is a pure display component.
- `children` are not mounted when `isExpanded` is `false` — no hidden DOM, clean and accessible.

### 8.4 SidebarRegionFilter — Smart Container

This component is the only one allowed to call `useSearchParams` and `useNavigate` within the sidebar. It computes the tree state and passes handlers down.

```tsx
// src/components/Sidebar/SidebarRegionFilter.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { SidebarFilterItem } from './SidebarFilterItem';
import type { LoaderData } from '@/features/region/types';

export function SidebarRegionFilter() {
  const { provinces, regencies, districts } = useLoaderData() as LoaderData;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeProvinceId = Number(searchParams.get('province')) || null;
  const activeRegencyId  = Number(searchParams.get('regency'))  || null;
  const activeDistrictId = Number(searchParams.get('district')) || null;

  function selectProvince(id: number) {
    if (id === activeProvinceId) {
      // toggle off → reset all
      navigate('/', { replace: true });
    } else {
      navigate(`?province=${id}`, { replace: true });
    }
  }

  function selectRegency(provinceId: number, regencyId: number) {
    if (regencyId === activeRegencyId) {
      navigate(`?province=${provinceId}`, { replace: true });
    } else {
      navigate(`?province=${provinceId}&regency=${regencyId}`, { replace: true });
    }
  }

  function selectDistrict(provinceId: number, regencyId: number, districtId: number) {
    if (districtId === activeDistrictId) {
      navigate(`?province=${provinceId}&regency=${regencyId}`, { replace: true });
    } else {
      navigate(
        `?province=${provinceId}&regency=${regencyId}&district=${districtId}`,
        { replace: true },
      );
    }
  }

  return (
    <nav aria-label="Filter wilayah" className="flex flex-col gap-0.5">
      {provinces.map((province) => {
        const isProvinceExpanded = activeProvinceId === province.id;
        const provinceRegencies = regencies.filter((r) => r.province_id === province.id);

        return (
          <SidebarFilterItem
            key={province.id}
            label={province.name}
            depth={0}
            isActive={activeProvinceId === province.id && activeRegencyId === null}
            isExpanded={isProvinceExpanded}
            onClick={() => selectProvince(province.id)}
          >
            {provinceRegencies.map((regency) => {
              const isRegencyExpanded = activeRegencyId === regency.id;
              const regencyDistricts = districts.filter((d) => d.regency_id === regency.id);

              return (
                <SidebarFilterItem
                  key={regency.id}
                  label={regency.name}
                  depth={1}
                  isActive={activeRegencyId === regency.id && activeDistrictId === null}
                  isExpanded={isRegencyExpanded}
                  onClick={() => selectRegency(province.id, regency.id)}
                >
                  {regencyDistricts.map((district) => (
                    <SidebarFilterItem
                      key={district.id}
                      label={district.name}
                      depth={2}
                      isActive={activeDistrictId === district.id}
                      isExpanded={false}
                      onClick={() => selectDistrict(province.id, regency.id, district.id)}
                    />
                  ))}
                </SidebarFilterItem>
              );
            })}
          </SidebarFilterItem>
        );
      })}
    </nav>
  );
}
```

### 8.5 Sidebar Shell

The sidebar shell is a fixed-width container. The region filter is one section within it — other nav items can follow.

```tsx
// src/components/Sidebar/Sidebar.tsx
import { SidebarRegionFilter } from './SidebarRegionFilter';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Sidebar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFilters = searchParams.has('province');

  return (
    <aside className="flex flex-col w-64 h-full bg-white border-r border-gray-200 shrink-0">
      {/* Logo / App name */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 shrink-0">
        <span className="text-sm font-bold tracking-wide text-gray-800 uppercase">
          Wilayah App
        </span>
      </div>

      {/* Scrollable nav */}
      <div className="flex flex-col flex-1 overflow-y-auto p-3 gap-4">
        {/* Section label */}
        <p className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Filter Wilayah
        </p>

        <SidebarRegionFilter />

        {/* Reset */}
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          disabled={!hasFilters}
          className="mt-2 mx-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-md
                     hover:bg-red-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset Filter
        </button>
      </div>
    </aside>
  );
}
```

### 8.6 Loader Update — Include All Data for Sidebar Tree

The loader must return **all** regencies and districts (not pre-filtered) so the sidebar can render the full tree. The `main` content and breadcrumb continue to use the filtered subsets.

```ts
// src/features/region/loader.ts  (updated)
export async function regionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const provinceId = Number(url.searchParams.get('province')) || null;
  const regencyId  = Number(url.searchParams.get('regency'))  || null;
  const districtId = Number(url.searchParams.get('district')) || null;

  return {
    provinces,
    regencies,          // ← full list; sidebar filters client-side
    districts,          // ← full list; sidebar filters client-side
    selected: { provinceId, regencyId, districtId },
  };
}
```

> **Why full lists?** The sidebar must render all provinces collapsed by default and expand them on selection. Pre-filtering on the server would hide the unselected branches.

### 8.7 Interaction Contract

| User action | URL result | Sidebar tree state |
|---|---|---|
| Click Province (none selected) | `?province=1` | Province expands, regencies appear |
| Click Province (already selected) | `/` | All collapsed (toggle off = reset) |
| Click Regency | `?province=1&regency=3` | Regency expands, districts appear |
| Click Regency (already selected) | `?province=1` | Regency collapses (toggle off) |
| Click District | `?province=1&regency=3&district=7` | District item marked active |
| Click District (already selected) | `?province=1&regency=3` | District deselected (toggle off) |
| Click Reset | `/` | All collapsed |

### 8.8 Tailwind Classes — Sidebar-Specific Reference

| Element | Classes | Notes |
|---|---|---|
| Sidebar container | `w-64 h-full bg-white border-r border-gray-200 shrink-0` | Never use `min-w` — fixed width only |
| Active item | `text-blue-600 font-semibold bg-blue-50` | Use `blue-600` / `blue-50` for active state |
| Hover item | `hover:text-gray-900 hover:bg-gray-100` | Subtle, not distracting |
| Chevron | `transition-transform duration-200` + `rotate-90` / `rotate-0` | CSS-only animation, no JS |
| Depth 0 padding | `pl-3` | Province |
| Depth 1 padding | `pl-6` | Regency |
| Depth 2 padding | `pl-9` | District |
| Section label | `text-xs font-semibold tracking-wider text-gray-400 uppercase` | Consistent with sidebar conventions |

### 8.9 PR Checklist Additions (Sidebar)

- [ ] Province items expand/collapse on click without page reload
- [ ] Clicking an already-active province collapses the tree and clears URL params
- [ ] District items appear only when a regency is selected
- [ ] Active item at each level has `text-blue-600 bg-blue-50` styling
- [ ] Chevron icon rotates on expand/collapse (CSS transition)
- [ ] Sidebar `<nav>` has `aria-label="Filter wilayah"`
- [ ] `role="group"` present on child containers

---

## 9. TypeScript Contracts

### 9.1 Domain Types

```ts
// src/features/region/types.ts

export interface Province {
  id: number;
  name: string;
}

export interface Regency {
  id: number;
  name: string;
  province_id: number;
}

export interface District {
  id: number;
  name: string;
  regency_id: number;
}

export interface SelectedRegion {
  provinceId: number | null;
  regencyId: number | null;
  districtId: number | null;   // ← added for district-level selection
}

export interface LoaderData {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
  selected: SelectedRegion;
}

export interface Option {
  id: number;
  name: string;
}
```

### 8.2 Rules

- **No `any`.** Use `unknown` if the shape is truly unknown, then narrow it.
- **Prefer `interface` over `type`** for object shapes; use `type` for unions and utility types.
- **Strict mode on.** `tsconfig.json` must have `"strict": true`.
- **Never cast with `as` in component code.** Type narrowing or generics are preferred.

---

## 9. Form & Filter Behavior

### 9.1 Cascade Reset Rule

When a parent filter changes, all descendant filters must be cleared from the URL.

| User action | URL result |
|---|---|
| Select Province | `?province=1` |
| Then select Regency | `?province=1&regency=3` |
| Change Province | `?province=2` ← regency cleared |
| Click Reset | `/` ← all cleared |

### 9.2 Reset Button

- Located visibly near the filter group.
- Calls `navigate('/', { replace: true })`.
- Should be disabled when no filters are active (no params in URL).

```tsx
const hasFilters = searchParams.has('province');

<button
  onClick={handleReset}
  disabled={!hasFilters}
  className="... disabled:opacity-40 disabled:cursor-not-allowed"
>
  Reset
</button>
```

### 9.3 Breadcrumb Logic

The breadcrumb always reflects the current URL state. It reads from loader data.

```
Home  /  {Province Name}  /  {Regency Name}  /  {District Name}
```

- Only render a breadcrumb segment if the corresponding ID is in the URL.
- Link segments are clickable and navigate to the filtered URL for that level.

### 9.4 Main Content — Active Region Display

The `<main>` tag renders a **region summary card** that reflects whatever is currently selected in the sidebar. The display updates progressively: Province only → Province + Regency → Province + Regency + District.

#### Empty State (no filter active)

```
┌──────────────────────────────────────────┐
│                                          │
│   🗺  Belum ada wilayah dipilih           │
│   Pilih provinsi di sidebar untuk        │
│   menampilkan informasi wilayah.         │
│                                          │
└──────────────────────────────────────────┘
```

#### Partial State (province only)

```
┌──────────────────────────────────────────┐
│  Provinsi                                │
│  ┌─────────────────────────────────────┐ │
│  │  📍 Kepulauan Riau                  │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  Kota / Kabupaten      Kecamatan         │
│  ┌───────────────┐     ┌──────────────┐  │
│  │  —            │     │  —           │  │
│  └───────────────┘     └──────────────┘  │
└──────────────────────────────────────────┘
```

#### Full State (all three selected)

```
┌──────────────────────────────────────────┐
│  Provinsi                                │
│  ┌─────────────────────────────────────┐ │
│  │  📍 Kepulauan Riau                  │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  Kota / Kabupaten      Kecamatan         │
│  ┌───────────────┐     ┌──────────────┐  │
│  │  📍 Kota Batam │     │  📍 Batu Ampar│ │
│  └───────────────┘     └──────────────┘  │
└──────────────────────────────────────────┘
```

#### Component Spec — `RegionSummary`

```tsx
// src/features/region/RegionSummary.tsx

interface RegionSummaryProps {
  province: Province | null;
  regency: Regency | null;
  district: District | null;
}

export function RegionSummary({ province, regency, district }: RegionSummaryProps) {
  if (!province) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm font-medium text-gray-500">Belum ada wilayah dipilih</p>
        <p className="text-xs text-gray-400 mt-1">Pilih provinsi di sidebar untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page title derived from active selection */}
      <h1 className="text-xl font-semibold text-gray-800">
        {district?.name ?? regency?.name ?? province.name}
      </h1>

      {/* Detail cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RegionCard label="Provinsi" value={province.name} isActive />
        <RegionCard label="Kota / Kabupaten" value={regency?.name ?? null} isActive={!!regency} />
        <RegionCard label="Kecamatan" value={district?.name ?? null} isActive={!!district} />
      </div>
    </div>
  );
}
```

#### Sub-component — `RegionCard`

```tsx
// inline in RegionSummary.tsx or extract to components/RegionCard.tsx

interface RegionCardProps {
  label: string;
  value: string | null;
  isActive: boolean;
}

function RegionCard({ label, value, isActive }: RegionCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-4 rounded-xl border transition-colors',
        isActive
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white opacity-50',
      )}
    >
      <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </span>
      <span
        className={cn(
          'text-base font-semibold',
          isActive ? 'text-blue-700' : 'text-gray-300',
        )}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
```

#### Wiring into `RegionPage`

```tsx
// src/features/region/RegionPage.tsx
import { useLoaderData } from 'react-router-dom';
import { RegionSummary } from './RegionSummary';
import type { LoaderData } from './types';

export function RegionPage() {
  const { provinces, regencies, districts, selected } = useLoaderData() as LoaderData;

  // Resolve full objects from selected IDs
  const activeProvince = provinces.find((p) => p.id === selected.provinceId) ?? null;
  const activeRegency  = regencies.find((r) => r.id === selected.regencyId)  ?? null;
  const activeDistrict = districts.find((d) => d.id === selected.districtId) ?? null;

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <RegionSummary
        province={activeProvince}
        regency={activeRegency}
        district={activeDistrict}
      />
    </main>
  );
}
```

#### Display Rules

| Condition | Province card | Regency card | District card |
|---|---|---|---|
| Nothing selected | — (empty state) | — | — |
| Province only | Active (blue) | Dimmed `—` | Dimmed `—` |
| Province + Regency | Active (blue) | Active (blue) | Dimmed `—` |
| All three selected | Active (blue) | Active (blue) | Active (blue) |

- Cards are **always rendered in all three states** — just toggled between active and dimmed. Never conditionally mount/unmount them; this avoids layout shift.
- The `<h1>` in main always shows the **most specific** selected name (district > regency > province).
- When nothing is selected, `<h1>` is not rendered — the empty state takes over instead.

---

## 10. Accessibility

- All `<select>` elements must have an associated `<label>` with matching `htmlFor` / `id`.
- The breadcrumb `<nav>` must include `aria-label="breadcrumb"`.
- The current breadcrumb item must have `aria-current="page"`.
- Color contrast must meet WCAG AA (4.5:1 for text).
- Keyboard navigation must work across all interactive elements (tab order).

```tsx
// ✅ Accessible Combobox
<div className="flex flex-col gap-1">
  <label htmlFor="province" className="text-sm font-medium text-gray-700">
    Provinsi
  </label>
  <select id="province" name="province" ...>
```

---

## 11. Code Quality & Linting

### 11.1 Required Config Files

| File | Purpose |
|---|---|
| `.eslintrc.cjs` | ESLint rules (react-hooks, jsx-a11y) |
| `prettier.config.cjs` | Consistent formatting |
| `tsconfig.json` | `strict: true`, path aliases (`@/`) |

### 11.2 Non-Negotiable ESLint Rules

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/label-has-associated-control": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### 11.3 Function Length

- A single component render function must not exceed **100 lines**.
- A loader function must not exceed **40 lines**.
- Extract to a helper or a sub-component if exceeded.

---

## 12. Git Conventions

### 12.1 Branch Naming

```
feat/region-filter-cascade
fix/breadcrumb-refresh-state
chore/add-eslint-config
```

### 12.2 Commit Message Format (Conventional Commits)

```
<type>(scope): <short description>

feat(region): add cascading regency filter driven by URL params
fix(breadcrumb): persist selected region name after browser refresh
refactor(loader): extract filterRegencies to utility function
test(utils): add unit tests for filterDistrictsByRegency
chore(config): enable strict mode in tsconfig
```

### 12.3 PR Checklist

Before merging a pull request, verify:

**Contracts**
- [ ] `name` attributes on comboboxes match the contract (`province`, `regency`, `district`)
- [ ] Breadcrumb wrapper has class `breadcrumb`
- [ ] Main content uses `<main>` tag

**Filter Behavior**
- [ ] Filters survive a hard browser refresh
- [ ] Reset button returns to `/` with no search params
- [ ] Changing province clears regency and district from URL
- [ ] Changing regency clears district from URL

**Sidebar Tree**
- [ ] Province items expand on click, collapse when clicked again
- [ ] Regency list only appears after a province is selected
- [ ] District list only appears after a regency is selected
- [ ] Active item highlighted with `text-blue-600 bg-blue-50`
- [ ] Chevron rotates on expand/collapse (CSS transition, no JS)
- [ ] Sidebar `<nav>` has `aria-label="Filter wilayah"`

**Main Content Display**
- [ ] Empty state shown when no province is selected
- [ ] Province card highlighted (blue) when province is active
- [ ] Regency card highlighted when regency is active; dimmed with `—` when not
- [ ] District card highlighted when district is active; dimmed with `—` when not
- [ ] `<h1>` shows most specific selected name (district > regency > province)
- [ ] All three cards always rendered — no mount/unmount between states (no layout shift)

**Code Quality**
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint errors
- [ ] `SidebarFilterItem` has no direct routing imports
- [ ] `RegionSummary` has no routing imports — receives resolved objects as props

---

*Maintained by the Engineering Team. Update this document when architectural decisions change.*
