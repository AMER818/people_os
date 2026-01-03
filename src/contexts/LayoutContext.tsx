import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';

// --- Types ---

export type DensityMode = 'compact' | 'normal' | 'relaxed';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ViewportMetrics {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface LayoutMetrics {
  headerHeight: number;
  sidebarWidth: number;
  contentPadding: string; // Tailwind class
  fontSize: string; // Tailwind class
  rowHeight: string; // CSS value
}

export interface LayoutState {
  viewport: ViewportMetrics;
  density: DensityMode;
  sidebar: {
    isOpen: boolean;
    toggle: () => void;
    setOpen: (open: boolean) => void;
  };
  metrics: LayoutMetrics;
}

// --- Constants & Config ---

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const DENSITY_CONFIG: Record<DensityMode, LayoutMetrics> = {
  compact: {
    headerHeight: 56,
    sidebarWidth: 240,
    contentPadding: 'p-4',
    fontSize: 'text-xs',
    rowHeight: '32px',
  },
  normal: {
    headerHeight: 64,
    sidebarWidth: 280, // Matches current default
    contentPadding: 'p-6 md:p-8',
    fontSize: 'text-sm',
    rowHeight: '48px',
  },
  relaxed: {
    headerHeight: 72,
    sidebarWidth: 320,
    contentPadding: 'p-8 md:p-12',
    fontSize: 'text-base',
    rowHeight: '64px',
  },
};

// --- Context Definition ---

const LayoutContext = createContext<LayoutState | undefined>(undefined);

// --- Provider Component ---

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Access global UI store
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, density } = useUIStore();

  // Viewport State
  const [viewport, setViewport] = useState<ViewportMetrics>(() => getViewportMetrics());

  // Helper to calculate viewport metrics
  function getViewportMetrics(): ViewportMetrics {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        breakpoint: 'xl',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;

    let bp: Breakpoint = 'xs';
    if (w >= BREAKPOINTS['2xl']) {
      bp = '2xl';
    } else if (w >= BREAKPOINTS.xl) {
      bp = 'xl';
    } else if (w >= BREAKPOINTS.lg) {
      bp = 'lg';
    } else if (w >= BREAKPOINTS.md) {
      bp = 'md';
    } else if (w >= BREAKPOINTS.sm) {
      bp = 'sm';
    }

    return {
      width: w,
      height: h,
      breakpoint: bp,
      isMobile: w < BREAKPOINTS.md,
      isTablet: w >= BREAKPOINTS.md && w < BREAKPOINTS.lg,
      isDesktop: w >= BREAKPOINTS.lg,
    };
  }

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportMetrics());
    };

    // Debounce could be added here if needed
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adaptive Sidebar Logic
  useEffect(() => {
    if (viewport.isMobile) {
      setSidebarOpen(false);
    } else if (viewport.isDesktop) {
      setSidebarOpen(true);
    }
  }, [viewport.breakpoint]); // Only run when breakpoint class changes

  // Derived Metrics based on Density
  const activeMetrics = DENSITY_CONFIG[density || 'normal'];

  const value: LayoutState = {
    viewport,
    density: density || 'normal',
    sidebar: {
      isOpen: isSidebarOpen,
      toggle: toggleSidebar,
      setOpen: setSidebarOpen,
    },
    metrics: activeMetrics,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

// --- Hook ---

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
