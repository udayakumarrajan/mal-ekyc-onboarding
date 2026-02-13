/**
 * Mock storage for simulator to avoid Hermes callback issues
 * Uses in-memory storage instead of async native modules
 */

class MockStorage {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.storage.get(key) || null);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }
}

export const mockAsyncStorage = new MockStorage();
export const mockSecureStore = new MockStorage();
