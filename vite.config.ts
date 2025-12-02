
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Consolidate all API requests under a single /api proxy
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true, // Recommended for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix before forwarding
      },
    },
  },
});
