// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },
  modules: [
    '@vite-pwa/nuxt'
  ],
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/__\/auth\/.*/],
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    manifest: {
      name: 'Trip Tail',
      short_name: 'TripTail',
      description: '旅行の記録を管理するアプリ',
      theme_color: '#7aa3da',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon'
        },
        {
          src: '/favicon.ico',
          sizes: '192x192',
          type: 'image/x-icon'
        },
        {
          src: '/favicon.ico',
          sizes: '512x512',
          type: 'image/x-icon'
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
  nitro: {
    output: {
        dir: 'dist/',
        publicDir: 'dist/'
    },
    prerender: {
      autoSubfolderIndex: false
    }
  },
  css: [
    '@ionic/vue/css/core.css',
    '@ionic/vue/css/normalize.css',
    '@ionic/vue/css/structure.css',
    '@ionic/vue/css/typography.css',
    '@ionic/vue/css/padding.css',
    '@ionic/vue/css/float-elements.css',
    '@ionic/vue/css/text-alignment.css',
    '@ionic/vue/css/text-transformation.css',
    '@ionic/vue/css/flex-utils.css',
    '@ionic/vue/css/display.css',
    '@ionic/vue/css/ionic.bundle.css',
    '@ionic/vue/css/palettes/dark.system.css',
    '@ionic/vue/css/palettes/dark.class.css'
  ],
  build: {
    transpile: ['@ionic/vue', '@ionic/core']
  },
  ssr: false
})
