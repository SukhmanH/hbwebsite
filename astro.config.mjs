// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static output — deploy-ready for Cloudflare Pages.
// Build command: npm run build · Output directory: dist
export default defineConfig({
  site: 'https://hbbrosvineyards.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
