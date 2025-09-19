'use client';

import { useLocalStorage } from '@mantine/hooks';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    sound: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    duration: number;
  };
  diceRolls: {
    showCriticals: boolean;
    showBreakdown: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    autoRoll: boolean;
  };
  ui: {
    compactMode: boolean;
    autoSaveInterval: number; // minutes
    showTooltips: boolean;
    tabPersistence: boolean;
  };
  gm: {
    showPlayerNames: boolean;
    allowPlayerRolls: boolean;
    secretRollMode: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  notifications: {
    enabled: true,
    sound: false,
    position: 'top-right',
    duration: 4000,
  },
  diceRolls: {
    showCriticals: true,
    showBreakdown: true,
    animationSpeed: 'normal',
    autoRoll: false,
  },
  ui: {
    compactMode: false,
    autoSaveInterval: 5,
    showTooltips: true,
    tabPersistence: true,
  },
  gm: {
    showPlayerNames: true,
    allowPlayerRolls: true,
    secretRollMode: false,
  },
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>({
    key: 'pf2e-user-preferences',
    defaultValue: defaultPreferences,
    serialize: JSON.stringify,
    deserialize: (str) => {
      try {
        if (!str) return defaultPreferences;
        const parsed = JSON.parse(str);
        // Merge with defaults to ensure all properties exist
        return {
          ...defaultPreferences,
          ...parsed,
          notifications: {
            ...defaultPreferences.notifications,
            ...parsed.notifications,
          },
          diceRolls: {
            ...defaultPreferences.diceRolls,
            ...parsed.diceRolls,
          },
          ui: {
            ...defaultPreferences.ui,
            ...parsed.ui,
          },
          gm: {
            ...defaultPreferences.gm,
            ...parsed.gm,
          },
        };
      } catch {
        return defaultPreferences;
      }
    },
  });

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateNestedPreference = <
    K extends keyof UserPreferences,
    NK extends keyof UserPreferences[K]
  >(
    key: K,
    nestedKey: NK,
    value: UserPreferences[K][NK]
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: {
        ...(current[key] as object),
        [nestedKey]: value,
      },
    }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const resetSection = <K extends keyof UserPreferences>(section: K) => {
    setPreferences((current) => ({
      ...current,
      [section]: defaultPreferences[section],
    }));
  };

  return {
    preferences,
    setPreferences,
    updatePreference,
    updateNestedPreference,
    resetToDefaults,
    resetSection,
    defaultPreferences,
  };
}