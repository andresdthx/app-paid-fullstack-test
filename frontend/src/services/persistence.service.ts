import type { CheckoutState } from '../store/slices/checkout.slice';

const STORAGE_KEY = 'checkout_state';
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface PersistedState {
  state: Omit<CheckoutState, 'cardData'>;
  timestamp: number;
}

export const persistenceService = {
  save(state: CheckoutState): void {
    try {
      if (!this.isAvailable()) return;
      const { cardData, ...safeState } = state;
      const persisted: PersistedState = {
        state: safeState,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  },

  load(): Omit<CheckoutState, 'cardData'> | null {
    try {
      if (!this.isAvailable()) return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const persisted: PersistedState = JSON.parse(raw);

      // Check expiry
      if (Date.now() - persisted.timestamp > MAX_AGE_MS) {
        this.clear();
        return null;
      }

      // Validate structure
      if (!persisted.state || !persisted.state.step) {
        this.clear();
        return null;
      }

      return persisted.state;
    } catch {
      this.clear();
      return null;
    }
  },

  clear(): void {
    try {
      if (!this.isAvailable()) return;
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail
    }
  },

  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};

export default persistenceService;
