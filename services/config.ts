
// This file contains the primary configuration for interacting with the backend API.

/**
 * The base URL for all API requests.
 * In a development environment with Vite's proxy, this should be set to the proxy path (e.g., '/api').
 * In a production environment, this would be the full URL of your deployed backend.
 */
export const API_BASE_URL = '/api'; // CORRECTED: This now matches the Vite proxy configuration.

/**
 * A global flag to enable or disable communication with the backend API.
 * When set to `false`, the application will rely entirely on mock data stored in local storage.
 * This is useful for offline development or for testing the UI without a live backend.
 */
export const ENABLE_API = true; // Set to `true` to use the backend API.

/**
 * A simulated delay (in milliseconds) for all mock API responses.
 * This helps to mimic real-world network latency, making the development experience
 * closer to how the application will behave in production.
 * Set to 0 to disable the delay.
 */
export const MOCK_DELAY = 500; // 500ms delay for mock responses.
