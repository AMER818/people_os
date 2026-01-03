import { create } from 'zustand';
import { ModuleType } from '../types';

interface UIState {
    activeModule: ModuleType;
    isSidebarOpen: boolean;
    theme: 'light' | 'dark';
    colorTheme: 'quartz' | 'cyber' | 'forest' | 'sunset';
    density: 'compact' | 'normal' | 'relaxed';

    // Actions
    setActiveModule: (module: ModuleType) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setColorTheme: (theme: 'quartz' | 'cyber' | 'forest' | 'sunset') => void;
    setDensity: (density: 'compact' | 'normal' | 'relaxed') => void;
}

export const useUIStore = create<UIState>()(
    (set) => ({
        activeModule: 'dashboard',
        isSidebarOpen: true,
        theme: 'dark',
        colorTheme: 'cyber',
        density: 'normal',

        setActiveModule: (module) => set({ activeModule: module }),
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
        setTheme: (theme) => set({ theme }),
        setColorTheme: (colorTheme) => set({ colorTheme }),
        setDensity: (density) => set({ density }),
    })
);
