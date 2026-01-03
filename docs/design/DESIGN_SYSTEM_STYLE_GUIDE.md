# 🎨 Modern Design System Style Guide

**For:** HUNZAL People OS  
**Last Updated:** January 7, 2026  
**Status:** ✅ Active Across Dashboard & Employee Modules

---

## Core Design Philosophy

**Modern. Premium. Intelligent.**

The design system combines glass-morphism, gradient overlays, and glowing effects to create a premium, futuristic feel that conveys sophistication and technological advancement.

---

## Color Palette

### Primary Colors (Theme-Based)
```
Primary:     #3B82F6 (Blue)
Success:     #10B981 (Emerald)
Warning:     #F97316 (Orange)
Danger:      #EF4444 (Red)
```

### Neutrals
```
Dark Background:   #0F172A (Slate-900)
Darker:            #000000 (Black)
White Glass 5%:    rgba(255, 255, 255, 0.05)
White Glass 10%:   rgba(255, 255, 255, 0.10)
```

---

## Component Styles

### 1. Hero Headings
```tsx
className="text-5xl font-black text-foreground tracking-tighter leading-none"
```
- Size: 56px (3.5rem)
- Weight: Font-black (900)
- Tracking: -0.05em (tighter)
- Line Height: 1
- Use for: Page titles, module names

**Example:**
```
Dashboard
Workforce Intelligence & Overview
```

### 2. Subtitle with Accent
```tsx
className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3"
// With accent line:
<span className="w-8 h-[0.125rem] bg-primary"></span>
```
- Size: 10px (0.625rem)
- Weight: Font-black
- Tracking: 0.4em (extra wide)
- Use for: Page subtitles, section descriptions

### 3. Premium Glass Card
```tsx
className="p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl hover:bg-white/10 transition-all"
```
- Padding: 32px (2rem)
- Background: 5% white opacity
- Border: 10% white opacity + 2px
- Radius: 48px (3rem)
- Backdrop: Blur-xl (24px)
- Hover: 10% white opacity
- Transition: All 300ms

### 4. Dark Premium Background
```tsx
className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5"
```
- Background: Slate-900 (or black in dark mode)
- Padding: 40px (2.5rem)
- Radius: 48px (3rem)
- Border: 5% white opacity
- Shadow: 2xl (large drop shadow)
- Overflow: Hidden (for gradient overlay)

### 5. Gradient Overlay
```tsx
className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"
```
- Position: Absolute, full coverage
- Gradient: Primary color → 10% opacity
- Direction: Top-left to bottom-right
- Pointer-events: None (doesn't block clicks)

### 6. Icon Container
```tsx
className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
// Icon inside:
<PrimaryIcon size={24} className="text-primary" />
```
- Size: 48px × 48px
- Border-radius: 12px (rounded-xl)
- Background: 10% primary opacity
- Border: 20% primary opacity
- Icon size: 24px
- Icon color: Primary (full opacity)

### 7. KPI Card (Stat Display)
```tsx
className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
// With glow:
className="absolute -right-12 -top-12 w-32 h-32 {color} opacity-5 rounded-full blur-3xl group-hover:opacity-10"
```
- Content: Icon + Label + Value + Trend
- Hover: Scale-105 with background transition
- Glow: Positioned gradient circle in background

### 8. Feature Grid Item
```tsx
className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all text-center group/card"
// Icon:
className="w-8 h-8 mx-auto mb-3 text-primary group-hover/card:scale-110 transition-transform"
// Label:
className="text-[0.6875rem] font-black uppercase tracking-[0.2em]"
```
- Padding: 24px
- Radius: 16px (rounded-2xl)
- Icon: Centered, scales on hover
- Label: Extra-small, all-caps, extra tracked

### 9. Primary Button
```tsx
className="px-8 py-3 bg-primary text-white font-black uppercase text-[0.625rem] tracking-widest rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all active:scale-95"
```
- Background: Primary color
- Padding: 8px × 12px (px-8 = px×2)
- Radius: 16px (rounded-2xl)
- Hover: Scale 1.05 (5% larger)
- Active: Scale 0.95 (press effect)
- Shadow: lg (large drop shadow)

### 10. Glass Button (Secondary)
```tsx
className="px-6 py-3 bg-white/5 border border-white/10 text-white backdrop-blur-xl font-black uppercase text-[0.625rem] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
```
- Background: 5% white
- Border: 10% white
- Hover: 10% white background
- No shadow (subtle)

---

## Typography Scale

| Usage | Size | Weight | Line-Height | Tracking |
|-------|------|--------|-------------|----------|
| Hero Heading | 56px | 900 | 1 | -0.05em |
| Section Title | 32px | 900 | 1.2 | -0.02em |
| Card Title | 20px | 900 | 1.25 | -0.01em |
| Body | 16px | 400 | 1.5 | 0em |
| Label | 10px | 900 | 1 | 0.4em |
| Caption | 8px | 700 | 1 | 0.2em |

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| gap-2 | 8px | Small gaps |
| gap-4 | 16px | Component spacing |
| gap-6 | 24px | Section spacing |
| gap-8 | 32px | Major sections |
| gap-10 | 40px | Hero spacing |
| gap-12 | 48px | Large sections |

---

## Shadow & Glow Effects

### Drop Shadows
```tsx
// Small
className="shadow-sm"

// Medium
className="shadow-lg"

// Large
className="shadow-2xl"
```

### Glowing Shadows (Custom)
```tsx
// Primary Glow
className="shadow-[0_0_0.9375rem_rgba(59,130,246,0.5)]"

// Success Glow
className="shadow-[0_0_0.9375rem_rgba(16,185,129,0.5)]"

// Warning Glow
className="shadow-[0_0_0.9375rem_rgba(249,115,22,0.5)]"

// Large Glow
className="shadow-[0_2.1875rem_5rem_-0.9375rem_rgba(37,99,235,0.6)]"
```

---

## Animation & Transitions

### Smooth Transitions
```tsx
// All properties
className="transition-all duration-300"

// Specific properties
className="transition-colors duration-300"
className="transition-transform duration-300"

// Longer duration for complex animations
className="transition-all duration-700"
```

### Hover Effects
```tsx
// Scale
className="hover:scale-105"
className="active:scale-95"

// Color
className="hover:bg-white/10"
className="hover:text-primary"

// Position
className="hover:translate-x-1"
className="group-hover:translate-x-1"

// Rotate (for icons)
className="group-hover:rotate-180 transition-transform duration-700"
```

### Animation In
```tsx
className="animate-in fade-in duration-700"
className="animate-in slide-in-from-bottom-12 duration-500"
```

---

## Responsive Breakpoints

```tsx
// Mobile-first (default)
className="px-4 py-2"

// Small screens (640px)
className="sm:px-6 sm:py-3"

// Medium screens (768px)
className="md:flex md:flex-row md:items-center"

// Large screens (1024px)
className="lg:grid lg:grid-cols-4"

// Extra large (1280px)
className="xl:col-span-2"
```

---

## Dark Mode

All components include dark mode variants:

```tsx
// Light mode default, dark mode override
className="bg-slate-900 dark:bg-black"
className="text-white dark:text-white"
className="border-white/10 dark:border-white/10"
```

---

## Implementation Checklist

When applying this design system:

- [ ] Use glass-morphism for cards: `bg-white/5 border-white/10 backdrop-blur-xl`
- [ ] Add gradient overlays to hero sections
- [ ] Use proper typography scale (headings are large and bold)
- [ ] Include icon containers with color-coded backgrounds
- [ ] Add smooth transitions on all interactive elements
- [ ] Use glowing shadows for premium effect
- [ ] Maintain proper spacing and padding
- [ ] Include dark mode variants
- [ ] Test responsive layout
- [ ] Verify accessibility (contrast, focus states)

---

## Modules Using This Design System

✅ **Dashboard** — Full implementation  
✅ **Employee Management** — Full implementation  
✅ **Onboarding** — Reference design  

### Ready for Implementation
- [ ] SystemSettings
- [ ] OrgSetup
- [ ] Recruitment Suite
- [ ] Payroll Module
- [ ] Analytics Module
- [ ] Benefits Module

---

## Quick Copy-Paste Templates

### Hero Section
```tsx
<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
  <div>
    <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
      Module Title
    </h1>
    <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.625rem] flex items-center gap-3">
      <span className="w-8 h-[0.125rem] bg-primary"></span>
      Subtitle
    </p>
  </div>
</div>
```

### Glass Card
```tsx
<div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl hover:bg-white/10 transition-all">
  {/* Content */}
</div>
```

### Premium Dark Section
```tsx
<div className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

---

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** ✅ Production Ready
