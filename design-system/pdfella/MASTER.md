# Design System Master File — PDFella

> **LOGIC:** When building or updating a specific page or component, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** PDFella  
**Category:** Private Client-Side PDF Utility Suite  
**Core Brand Identity:** Elegant Burgundy (`#800020`) & Clean Swiss Typography (Inter)  
**Security Model:** 100% In-Browser Execution, Zero Server Uploads  

---

## Global Tokens & Palette

### Color Palette

| Role | Hex | Token / Tailwind Class | CSS Variable | WCAG 2.2 AA Contrast |
|------|-----|------------------------|--------------|----------------------|
| **Brand Primary (Burgundy)** | `#800020` | `bg-brand-primary` / `text-brand-primary` | `--brand-primary` | 8.2:1 on White (Passes AAA) |
| **Brand Primary Hover** | `#66001a` | `bg-brand-primary-hover` | `--brand-primary-hover` | 10.4:1 on White (Passes AAA) |
| **Brand Accent (Rose/Coral)** | `#d45060` | `bg-brand-accent` | `--brand-accent` | 3.5:1 graphical components |
| **Brand Subtle (Soft Pink Tint)**| `#fdf2f4` | `bg-brand-subtle` | `--brand-subtle` | Container background |
| **Brand Border** | `#f8cfd5` | `border-brand-border` | `--brand-border` | Subtle branded separator |
| **Warm Paper Surface** | `#f3e6d5` | `bg-brand-surface` | `--brand-surface` | Document workspace accent |
| **Brand Background (Tint)** | `#fff9f2` | `bg-brand-background` | `--brand-background` | Warm backdrop tint |
| **Background (Clean Canvas)** | `#ffffff` | `bg-white` | `--background` | Clean primary canvas |
| **Foreground (Neutral Dark)** | `#171717` | `text-neutral-900` | `--foreground` | 16.1:1 on White (Passes AAA) |
| **Secondary Text (Neutral 700)** | `#374151` | `text-neutral-700` | `text-neutral-700` | 9.0:1 on White (Passes AAA) |
| **Muted Text (Neutral 600)** | `#4b5563` | `text-neutral-600` | `text-neutral-600` | 5.7:1 on White (Passes AA) |
| **Border Neutral** | `#e5e5e5` | `border-neutral-200` | `--border` | Structural container dividers |
| **Surface Alt** | `#fafafa` | `bg-neutral-50` | `bg-neutral-50` | Table headers, toolbars, dropzones |
| **Success (Green)** | `#16a34a` | `bg-emerald-600` / `text-emerald-700` | — | Verification badges & sanitize |
| **Destructive (Crimson)** | `#dc2626` | `bg-rose-600` / `text-rose-600` | — | Page deletion, mark removal |

> [!IMPORTANT]
> **Contrast Rule:** Never use `text-neutral-400` for body, descriptions, metadata, or helper text on light surfaces. Always use `text-xs text-neutral-600` or `text-neutral-700` to satisfy WCAG 2.2 AA (minimum 4.5:1 contrast).

---

### Typography

- **Primary Font:** Inter (`var(--font-inter)`, `ui-sans-serif`, `system-ui`, `sans-serif`)
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700), Extrabold (800)
- **Scale:**
  - `text-3xl sm:text-4xl` font-extrabold: Page titles / Main hero (`tracking-tight`)
  - `text-2xl sm:text-3xl` font-extrabold: Tool headers
  - `text-lg sm:text-xl` font-bold: Feature sections, card titles
  - `text-sm sm:text-base`: Subtitles, primary buttons, major form inputs
  - `text-xs`: Labels, badges, metadata, secondary controls (min 12px)
  - **No sub-12px text:** Deprecated `text-[10px]` and `text-[11px]`. All informative labels must be at least `text-xs` (12px).

---

### Touch Targets (Apple HIG & Material Design 3)

All interactive elements (buttons, links, page cards, file actions, pagination controls, color pickers) must provide adequate hit areas:
- **Mobile Touch Targets:** Minimum `44px × 44px` (`min-w-[44px] min-h-[44px] w-11 h-11` or `p-2.5` padding) for hamburger toggles, sidebar drawers, modal close buttons, and primary actions.
- **Desktop Density Controls:** Minimum `32px` to `38px` (`min-h-[36px]` or `min-w-[32px] min-h-[32px]`) for reorder handles, thumbnail rotate buttons, format selectors, and secondary actions.
- **Color Presets:** Minimum `32px × 32px` (`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full`).

---

## Semantic Structure & Accessibility (WCAG 2.2 AA)

1. **Skip-to-Main-Content Landmark:**
   - Every page must render `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` at the root layout.
2. **Single `<main>` Landmark Rule:**
   - `components/layout/AppLayout/AppLayout.tsx` provides the application's unique `<main id="main-content" tabIndex={-1}>` landmark.
   - Child pages and tool layouts (`PdfToolLayout`, `MergePdfView`, etc.) must render semantic `<div>` or `<section>` containers to prevent HTML5 nested landmark validation violations.
3. **Form Controls:**
   - Every input field (text, file, range sliders, number pickers) must be programmatically paired with `<label htmlFor="id">` or have an explicit `aria-label`.
   - Hidden file inputs must use `className="sr-only"` rather than `className="hidden"` so screen readers can discover and describe them.
4. **Interactive Page Cards:**
   - Selection cards (`SplitPdfView`, `RemovePagesView`, `PdfToImageView`) must use `role="checkbox"`, `tabIndex={0}`, `aria-checked={isSelected}`, and listen for `Space` and `Enter` key presses.
   - Selected states must provide high-contrast visible focus rings (`focus:outline-hidden focus:ring-2 focus:ring-brand-primary`).
5. **Modals & Dialogs:**
   - Overlay modals (`SignaturePadModal`) must have `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`, dismiss on `Escape` key, and have a `44×44px` close button with `aria-label="Close dialog"`.
6. **Motion & Transitions:**
   - All CSS animations, spinning icons, and transitions must automatically degrade under `@media (prefers-reduced-motion: reduce)`.

---

## Component Specs

### Primary Button
```tsx
<button
  type="button"
  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover py-3.5 px-4 text-sm font-bold text-white shadow-sm transition-colors duration-150 cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-brand-primary/40"
>
  <span>Process Document</span>
  <HiArrowRight className="w-4 h-4" />
</button>
```

### Secondary / Reset Button
```tsx
<button
  type="button"
  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] inline-flex items-center"
>
  Choose different file
</button>
```

### Interactive Page Card
```tsx
<div
  role="checkbox"
  tabIndex={0}
  aria-checked={isSelected}
  aria-label={`Page ${pageNumber}, ${isSelected ? "selected" : "not selected"}`}
  onClick={toggleSelection}
  onKeyDown={(e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleSelection();
    }
  }}
  className={`group relative rounded-xl p-2 flex flex-col bg-white shadow-xs transition-colors duration-150 cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-brand-primary ${
    isSelected
      ? "border-2 border-brand-primary"
      : "border border-neutral-200 hover:border-neutral-300"
  }`}
>
  {/* Thumbnail Preview & Badge */}
</div>
```

---

## Anti-Patterns (Strictly Forbidden)

- ❌ **No `text-neutral-400` for body or metadata** (Fails 4.5:1 contrast on white).
- ❌ **No `text-[10px]` or `text-[11px]`** (Violates legible typography standards).
- ❌ **No nested `<main>` tags** (Only `AppLayout.tsx` renders `<main id="main-content">`).
- ❌ **No `<input type="file" className="hidden">`** (Use `className="sr-only"` for screen-reader accessibility).
- ❌ **No undersized mobile buttons** (All interactive touch targets must be at least 44×44px on mobile).
- ❌ **No unannounced icon-only buttons** (Always include an explicit `aria-label`).
- ❌ **No emojis as UI icons** (Use React Icons Heroicons / Lucide SVG sets exclusively).
- ❌ **No server-side processing** (All PDF reading, merging, splitting, rendering, and watermarking must remain 100% in-browser).
