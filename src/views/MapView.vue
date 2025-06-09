<template>
  <ion-page>
    <!-- Google Maps -->
    <div id="map"></div>

    <!-- Sheet Modal -->
    <ion-modal ref="modal" :is-open="isModalOpen" @did-dismiss="handleDismiss" :breakpoints="[0, 0.2, 0.5, 0.8]"
      :initial-breakpoint="0.2" :can-dismiss="canDismiss" :backdrop-breakpoint="1" :backdrop-dismiss="false"
      :handle="true" :keep-contents-mounted="true">
      
      <!-- 浮動アクションボタン群 - モーダル内だがはみ出し表示 -->
      <div class="floating-buttons" v-if="floatingButtonVisible">
        <ion-button fill="solid" size="default" class="floating-button wishlist-button" @click="navigateTo(WishListView)">
          <ion-icon :icon="heartOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button fill="solid" size="default" class="floating-button visited-button" @click="navigateTo(VisitedView)">
          <ion-icon :icon="locationOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <ion-content class="ion-padding">
        <!-- 検索バー -->
        <ion-searchbar v-model="searchText" placeholder="場所を検索..." @ionInput="onSearchInput"
          show-clear-button="focus"></ion-searchbar>

        <!-- メニュー説明テキスト -->
        <div class="menu-description">
          <ion-text color="medium">
            <p>右上のボタンからウィッシュリストや訪問記録にアクセスできます</p>
          </ion-text>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, nextTick, markRaw, computed, watch, onUnmounted } from 'vue';
import type { CSSProperties } from 'vue';
import {
  IonIcon,
  IonModal,
  IonContent,
  IonButton,
  IonSearchbar,
  IonPage,
  IonText
} from '@ionic/vue';
import {
  heartOutline,
  locationOutline
} from 'ionicons/icons';
import { Loader } from '@googlemaps/js-api-loader';
import WishListView from './WishListView.vue';
import VisitedView from './VisitedView.vue';

// モーダルの状態
const isModalOpen = ref(true);
const modal = ref();
const searchText = ref('');
const canDismiss = ref(false);
const floatingButtonVisible = ref(true);

const initMap = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
  });

  try {
    const { Map } = await loader.importLibrary('maps');
    const map = new Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 35.6812, lng: 139.7671 },
      zoom: 12,
    });
  } catch (error) {
    console.error('Google Mapsの読み込みに失敗しました:', error);
  }
};

const handleDismiss = () => {
  if (modal.value) {
    modal.value.$el.setCurrentBreakpoint(0.2);
  }
};

const onSearchInput = (event: any) => {
  searchText.value = event.target.value;
  console.log('検索中:', searchText.value);
};

const closeModal = () => {
  canDismiss.value = true;
  floatingButtonVisible.value = false;
  nextTick(() => {
    modal.value.$el.setCurrentBreakpoint(0);
  });
  isModalOpen.value = false;
}

const handleReturnToMap = () => {
  isModalOpen.value = true;
  canDismiss.value = false;
  floatingButtonVisible.value = true;
  if (modal.value && modal.value.$el) {
    modal.value.$el.setCurrentBreakpoint(0.2);
  }
};

const navigateTo = (component: any) => {
  closeModal();
  const navEl = document.querySelector('ion-nav');
  if (navEl) {
    const componentInstance = markRaw(component);
    navEl.push(componentInstance, { returnCallback: handleReturnToMap }).catch(err => console.error(err));
  }
}

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}

/* 浮動ボタン群のスタイル */
.floating-buttons {
  position: absolute;
  top: 0;
  right: 15px;
  transform: translateY(-105px); /* ボタン群をモーダルの上に移動 */
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

.floating-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
}

.floating-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.floating-button:active {
  transform: scale(0.95);
}

.wishlist-button {
  --background: white;
  --background-hover: white;
  --color: blue;
}

.visited-button {
  --background: white;
  --background-hover: white;
  --color: blue;
}

.menu-description {
  margin-top: 10px;
  text-align: center;
}

.menu-description p {
  font-size: 14px;
  margin: 0;
}

ion-searchbar {
  --background: var(--ion-color-light);
  --border-radius: 12px;
  margin-bottom: 10px;
}

ion-modal {
  --height: 100%;
  --max-height: 100%;
  --min-height: 20%;
  --border-radius: 16px 16px 0 0;
  --backdrop-opacity: 0;
  --box-shadow: none;
  overflow: visible !important;
}

ion-modal ion-content {
  flex: 1;
  --background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* モーダルのラッパー要素もoverflowを調整 */
ion-modal .modal-wrapper {
  overflow: visible !important;
}

/* Ionicの内部構造に対応 */
ion-modal::part(backdrop) {
  overflow: visible !important;
}

ion-modal::part(content) {
  overflow: visible !important;
}
</style>
