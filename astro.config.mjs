import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://n8n.jemxx.dev',
  adapter: cloudflare(),
});