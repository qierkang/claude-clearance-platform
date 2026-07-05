// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// `site` must match the real deployment origin so canonical URLs,
// hreflang links and the generated sitemap point to the correct domain.
//
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://claude.qekang.com',
  devToolbar: {
    enabled: false,
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN',
        },
      },
    }),
  ],
});
