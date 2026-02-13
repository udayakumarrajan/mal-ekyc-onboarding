// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(null)),
    setItem: jest.fn((key, value) => Promise.resolve()),
    removeItem: jest.fn((key) => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key) => {
    if (key === 'access_token') return Promise.resolve('mock_access_token');
    if (key === 'refresh_token') return Promise.resolve('mock_refresh_token');
    return Promise.resolve(null);
  }),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Suppress console.error during tests
global.console = {
  ...console,
  error: jest.fn(),
};
