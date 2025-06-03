<template>
  <div class="tab-container">
    <ion-page>
      <!-- 共通ヘッダー -->
      <ion-header>
        <ion-toolbar>
          <ion-title>TripTales</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Swiper for Tab Content -->
      <div class="tab-content-container">
        <swiper ref="swiperRef" :slides-per-view="1" :space-between="0" :allow-touch-move="true" @swiper="onSwiper"
          @slide-change="onSlideChange" class="tab-swiper">
          <swiper-slide>
            <ion-content class="ion-padding">
              <VisitedView />
            </ion-content>
          </swiper-slide>

          <swiper-slide>
            <ion-content class="ion-padding">
              <MapView />
            </ion-content>
          </swiper-slide>

          <swiper-slide>
            <ion-content class="ion-padding">
              <WishListView />
            </ion-content>
          </swiper-slide>
        </swiper>
      </div>
      <!-- Footer Tab Navigation -->
      <ion-footer>
        <ion-toolbar>
          <div class="tab-nav">
            <button v-for="(tab, index) in tabs" :key="tab.name"
              :class="['tab-button', { active: activeTabIndex === index }]" @click="switchTab(index)">
              <ion-icon :icon="tab.icon" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </ion-toolbar>
      </ion-footer>
    </ion-page>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  IonIcon,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
} from '@ionic/vue'
import { locationOutline, mapOutline, heartOutline } from 'ionicons/icons'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

import MapView from '@/views/MapView.vue'
import VisitedView from '@/views/VisitedView.vue'
import WishListView from '@/views/WishListView.vue'

// Swiper instance reference
const swiperRef = ref<SwiperType | null>(null)
let swiperInstance: SwiperType | null = null

// Active tab index
const activeTabIndex = ref(0)

// Tab configuration
const tabs = reactive([
  { name: 'visited', label: 'Visited', icon: locationOutline },
  { name: 'map', label: 'Map', icon: mapOutline },
  { name: 'wishlist', label: 'WishList', icon: heartOutline }
])

// 現在のタブタイトルを計算プロパティとして定義
const currentTabTitle = computed(() => {
  return tabs[activeTabIndex.value]?.label || 'Visited'
})

// Swiper event handlers
const onSwiper = (swiper: SwiperType) => {
  swiperInstance = swiper
}

const onSlideChange = (swiper: SwiperType) => {
  activeTabIndex.value = swiper.activeIndex
}

// Tab switching function
const switchTab = (index: number) => {
  if (swiperInstance && activeTabIndex.value !== index) {
    activeTabIndex.value = index
    swiperInstance.slideTo(index)
  }
}
</script>

<style scoped>
.tab-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tab-content-container {
  flex: 1;
  overflow: hidden;
}

.tab-swiper {
  height: 100%;
}

.tab-swiper .swiper-slide {
  height: 100%;
}

.tab-swiper .swiper-slide ion-page {
  height: 100%;
}

.tab-nav {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--ion-color-medium);
  min-height: 60px;
  flex: 1;
  position: relative;
}

.tab-button.active {
  color: var(--ion-color-primary);
  transform: scale(1.05);
}

.tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.tab-button span {
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .tab-button span {
    font-size: 10px;
  }

  .tab-button ion-icon {
    font-size: 20px;
  }

  .tab-button {
    min-height: 50px;
    padding: 6px 12px;
  }
}

ion-content::part(scroll) {
  scrollbar-width: none;
}

ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}
</style>
