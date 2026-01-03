# Scroll Patterns & Isolation Guidelines

This document outlines the standard patterns for scrolling behaviors in the application to ensure a consistent and high-quality user experience.

## Core Principles

1.  **Scroll Chaining Prevention**: prevent the whole page from moving when a user reaches the end of a scrollable area (like a customized sidebar or modal).
2.  **Body Scroll Locking**: When a modal or full-screen overlay is open, the background body content must not be scrollable.
3.  **Visual Stability**: Scrollbars should be stable and not cause layout shifts.

## Implementation Details

### 1. Scroll Isolation (`overscroll-behavior`)

Use `overscroll-behavior: contain` on all scrollable containers that are nested within the main page (e.g., Sidebars, Cards with internal lists, Dropdowns).

```css
.scrollable-container {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**Why?** This prevents the "scroll chaining" effect where scrolling to the bottom of a sidebar accidentally starts scrolling the main page content.

### 2. Body Scroll Locking

When a `Dialog`, `Modal`, or `Sheet` is open, we utilize standard libraries (like Radix UI primitives) that handle body locking automatically.

- **Mechanism**: Usually applies `pointer-events: none` to the background and `overflow: hidden` to the `body`.
- **Verification**: Ensure that `document.body` has `overflow: hidden` applied when a modal is active.

### 3. Layout Structure

Our AppShell structure should define the main scroll areas:

- **Global Window Scroll**: Minimized. We prefer the application key layout to handle scrolling regions independently.
- **Main Content Area**: Should be the primary scroll context.

```tsx
// Typical Layout
<div className="flex h-screen overflow-hidden">
  <Sidebar className="overflow-y-auto overscroll-contain" />
  <main className="flex-1 overflow-y-auto overscroll-contain">
    {/* Page Content */}
  </main>
</div>
```

## Testing

We use Playwright for E2E verification of these behaviors.
Run tests via:
```bash
npx playwright test tests/e2e/scroll-behavior.spec.ts
```
