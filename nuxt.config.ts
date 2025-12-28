// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Desabilitar SSR temporariamente para debug

  modules: ['@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],

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
      ],
    },
  },
})
