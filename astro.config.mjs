import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://tech.jemxx.dev',
  adapter: cloudflare(),
});