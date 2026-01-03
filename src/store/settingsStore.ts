import { create } from 'zustand';
import { SettingNode } from '../types';

interface SettingsState {
    settings: SettingNode[];

    // Actions
    updateSetting: (id: string, value: any, user: string) => void;
    getSetting: (key: string) => any;
    resetSettings: () => void;
}

const INITIAL_SETTINGS: SettingNode[] = [];

export const useSettingsStore = create<SettingsState>()(
    (set, get) => ({
        settings: INITIAL_SETTINGS,

        // Actions
        updateSetting: (id: string, value: any, user: string) => set((state) => ({
            settings: state.settings.map((s) =>
                s.id === id
                    ? {
                        ...s,
                        value,
                        isOverridden: true,
                        lastUpdated: new Date().toISOString().split('T')[0],
                        updatedBy: user
                    }
                    : s
            )
        })),

        getSetting: (key: string) => {
            const setting = get().settings.find(s => s.key === key);
            return setting ? setting.value : undefined;
        },

        resetSettings: () => set({ settings: INITIAL_SETTINGS }),
    })
);
