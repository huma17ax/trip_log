<template>
  <ion-app>
    <NuxtPage />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

// アプリケーション起動時に認証状態を初期化
const authStore = useAuthStore()

// クライアントサイドでのみ実行
onMounted(() => {
  authStore.initialize()
})
</script>

<style>
:root {
  --ion-color-primary: #007aff;
  --ion-color-primary-rgb: 0, 122, 255;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #006ccc;
  --ion-color-primary-tint: #1a84ff;
}

html.ios {
  --ion-default-font: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Roboto", sans-serif;
}
</style>
