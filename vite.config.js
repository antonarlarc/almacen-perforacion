import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Almacén de Perforación",
        short_name: "Almacén",
        description: "Registro de salidas del almacén de supplies de perforación",
        theme_color: "#28a745",
        background_color: "#1a1a2e",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        navigateFallback: "/index.html",
      },
      base: '/',
      server: {
    port: 5173,
    host: true,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
    }),
  ],
});
