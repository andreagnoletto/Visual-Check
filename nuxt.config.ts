// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // SPA mode - ideal para PWA

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
  ],

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'TV Visual Check',
      short_name: 'Visual Check',
      description: 'Triagem básica de acuidade visual para TVs e dispositivos',
      theme_color: '#1976D2',
      background_color: '#121212',
      display: 'standalone',
      orientation: 'any',
      scope: '/',
      start_url: '/',
      lang: 'pt-BR',
      categories: ['health', 'medical', 'utilities'],
      icons: [
        {
          src: 'icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: 'icon-maskable.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,otf}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  css: ['~/assets/css/main.css', '~/assets/css/optotype.css'],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: 'TV Visual Check',
      meta: [
        { name: 'description', content: 'App de triagem básica de acuidade visual' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1976D2' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Visual Check' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
        { rel: 'mask-icon', href: '/icon.svg', color: '#1976D2' },
      ],
    },
  },
})
