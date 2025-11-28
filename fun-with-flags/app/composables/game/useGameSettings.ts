import type { GameSettings } from "~/types/game";

export const useGameSettings = () => {
  const storageKey = "flag-master-settings";

  const defaultSettings: GameSettings = {
    soundEnabled: true,
    region: "World",
  };

  const settings = useState<GameSettings>("game_settings", () => {
    if (import.meta.server) return defaultSettings;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const saveSettings = (newSettings: GameSettings) => {
    settings.value = newSettings;
    if (!import.meta.server) {
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
    }
  };

  const updateSettings = (partial: Partial<GameSettings>) => {
    saveSettings({ ...settings.value, ...partial });
  };

  return {
    settings,
    saveSettings,
    updateSettings,
  };
};
