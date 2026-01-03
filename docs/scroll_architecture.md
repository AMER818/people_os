# Scroll Architecture & Virtualization

## Overview

The application utilizes a **Scroll Isolation** strategy paired with **Virtualization** to handle large datasets efficiently.

## Core Concepts

### 1. Scroll Isolation
- **Container**: Use `.overflow-auto.overscroll-contain` on scrollable regions.
- **Purpose**: Prevents "scroll chaining" where scrolling reaching the end of a container triggers the parent page scroll.
- **Implementation**: Enforced via `DataGrid` component wrappers.

### 2. Virtualization
- **Library**: `@tanstack/react-virtual`
- **Threshold**: Enabled automatically (or via prop) for datasets > 50 rows.
- **Mechanism**:
    - Calculates total estimated height.
    - Renders only the items currently in the viewport (+ overscan).
    - Uses padding (top/bottom) to simulate full scroll height, preserving native scroll behavior.

## Usage

### DataGrid Component

The `DataGrid` component now accepts `enableVirtualization` prop.

```tsx
<DataGrid
    data={largeDataset}
    enableVirtualization={true} // Mandatory for > 500 rows
    // ...
/>
```

### Density Awareness
Virtualization estimates row height based on the current *Density* setting from `LayoutContext`:
- **Compact**: 40px
- **Normal**: 56px
- **Relaxed**: 72px

## Performance Targets
- **Render Time**: < 16ms per frame during scroll.
- **DOM Nodes**: < 1000 nodes active even with 10k items in dataset.
