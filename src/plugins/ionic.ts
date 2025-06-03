// src/plugins/ionic.ts
import { defineNuxtPlugin } from '#app'
import { IonicVue } from '@ionic/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(IonicVue, { 
    mode: 'ios',
    animated: true
  })
})