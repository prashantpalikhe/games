// Implementation: LocalStorage (Browser)
interface StorageAdapter {
    loadHighScore(mode: string): Promise<number>;
    saveHighScore(mode: string, score: number): Promise<void>;
    loadCollection(): Promise<Record<string, number>>;
    saveCollectionItem(id: string): Promise<void>;
    loadSettings(): Promise<Record<string, any>>;
    saveSettings(settings: Record<string, any>): Promise<void>;
  }
  
  const localStorageAdapter: StorageAdapter = {
    async loadHighScore(mode) {
      if (import.meta.server) return 0;
      const val = localStorage.getItem(`flag-master-highscore-${mode}`);
      return val ? parseInt(val) : 0;
    },
    async saveHighScore(mode, score) {
      if (import.meta.server) return;
      localStorage.setItem(`flag-master-highscore-${mode}`, score.toString());
    },
    async loadCollection() {
      if (import.meta.server) return {};
      const val = localStorage.getItem('flag-master-collection');
      return val ? JSON.parse(val) : {};
    },
    async saveCollectionItem(id) {
      if (import.meta.server) return;
      const collection = await this.loadCollection();
      collection[id] = (collection[id] || 0) + 1;
      localStorage.setItem('flag-master-collection', JSON.stringify(collection));
    },
    async loadSettings() {
      if (import.meta.server) return {};
      const val = localStorage.getItem('flag-master-settings');
      return val ? JSON.parse(val) : { sound: true, nativeEmoji: false };
    },
    async saveSettings(settings) {
      if (import.meta.server) return;
      localStorage.setItem('flag-master-settings', JSON.stringify(settings));
    }
  }
  
  export const usePersistence = () => {
    return localStorageAdapter;
  }