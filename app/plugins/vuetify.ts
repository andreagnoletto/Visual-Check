// plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            primary: '#42A5F5',
            secondary: '#66BB6A',
            background: '#121212',
            surface: '#1E1E1E',
            error: '#EF5350',
            warning: '#FFA726',
            info: '#29B6F6',
            success: '#66BB6A',
          },
        },
        light: {
          dark: false,
          colors: {
            primary: '#1976D2',
            secondary: '#388E3C',
            background: '#FAFAFA',
            surface: '#FFFFFF',
            error: '#D32F2F',
            warning: '#F57C00',
            info: '#0288D1',
            success: '#388E3C',
          },
        },
        highContrast: {
          dark: true,
          colors: {
            primary: '#FFFFFF',
            secondary: '#FFFFFF',
            background: '#000000',
            surface: '#000000',
            error: '#FF0000',
            warning: '#FFFF00',
            info: '#00FFFF',
            success: '#00FF00',
            'on-background': '#FFFFFF',
            'on-surface': '#FFFFFF',
            'on-primary': '#000000',
            'on-secondary': '#000000',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        variant: 'flat',
        rounded: 'lg',
      },
      VCard: {
        rounded: 'lg',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
    },
  })

  app.vueApp.use(vuetify)
})
