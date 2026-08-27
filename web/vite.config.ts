import { defineConfig } from 'vite';

// Relative base so the built site works from any subpath — required for
// GitHub Pages (https://<user>.github.io/cron-converter-u2q/) and harmless
// on root-domain hosts like Vercel or Netlify.
export default defineConfig({
  base: './',
});
