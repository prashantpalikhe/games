import type { CollectedFlags, GameSettings } from '~/types/game';

export interface StorageAdapter {
  getHighScore(mode: string): number;
  saveHighScore(mode: string, score: number): void;
  getCollection(): CollectedFlags;
  saveCollection(collection: CollectedFlags): void;
  getSettings(): GameSettings;
  saveSettings(settings: GameSettings): void;
}

export const useGameStorage = () => {
  // Default Settings
  const defaultSettings: GameSettings = {
    soundEnabled: true,
    region: 'World',
  };

  // Adapter Implementation (Local Storage for now)
  const adapter: StorageAdapter = {
    getHighScore(mode: string): number {
      if (import.meta.server) return 0;
      const val = localStorage.getItem(`flag-master-highscore-${mode}`);
      // Backwards compatibility with old key if mode is normal
      if (!val && mode === 'normal') {
        return parseInt(localStorage.getItem('flag-master-highscore') || '0');
      }
      return parseInt(val || '0');
    },

    saveHighScore(mode: string, score: number): void {
      if (import.meta.server) return;
      localStorage.setItem(`flag-master-highscore-${mode}`, score.toString());
    },

    getCollection(): CollectedFlags {
      if (import.meta.server) return {};
      try {
        return JSON.parse(localStorage.getItem('flag-master-collection') || '{}');
      } catch (e) {
        return {};
      }
    },

    saveCollection(collection: CollectedFlags): void {
      if (import.meta.server) return;
      localStorage.setItem('flag-master-collection', JSON.stringify(collection));
    },

    getSettings(): GameSettings {
      if (import.meta.server) return defaultSettings;
      try {
        const saved = JSON.parse(localStorage.getItem('flag-master-settings') || '{}');
        return { ...defaultSettings, ...saved };
      } catch (e) {
        return defaultSettings;
      }
    },

    saveSettings(settings: GameSettings): void {
      if (import.meta.server) return;
      localStorage.setItem('flag-master-settings', JSON.stringify(settings));
    },
  };

  return adapter;
};

