<template>
  <ion-page>
    <!-- Google Maps -->
    <div id="map"></div>

    <!-- Sheet Modal -->
    <ion-modal ref="modal" :is-open="isModalOpen" @did-dismiss="handleDismiss" :breakpoints="[0, 0.2, 0.5, 0.8]"
      :initial-breakpoint="0.2" :can-dismiss="canDismiss" :backdrop-breakpoint="1" :backdrop-dismiss="false"
      :handle="true" :keep-contents-mounted="true">
      <ion-content class="ion-padding">
        <!-- 検索バー -->
        <ion-searchbar v-model="searchText" placeholder="場所を検索..." @ionInput="onSearchInput"
          show-clear-button="focus"></ion-searchbar>

        <!-- ウィッシュリストボタン -->
        <ion-button expand="block" fill="outline" size="large" class="menu-button" @click="navigateTo(WishListView)">
          <ion-icon :icon="heartOutline" slot="start"></ion-icon>
          ウィッシュリスト
        </ion-button>

        <!-- 訪問記録ボタン -->
        <ion-button expand="block" fill="outline" size="large" class="menu-button" @click="navigateTo(VisitedView)">
          <ion-icon :icon="locationOutline" slot="start"></ion-icon>
          訪問記録
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, nextTick, markRaw } from 'vue';
import {
  IonIcon,
  IonModal,
  IonContent,
  IonButton,
  IonSearchbar,
  IonPage
} from '@ionic/vue';
import {
  heartOutline,
  locationOutline
} from 'ionicons/icons';
import { Loader } from '@googlemaps/js-api-loader';
import WishListView from './WishListView.vue';
import VisitedView from './VisitedView.vue';

// モーダルの状態
const isModalOpen = ref(true); // デフォルトで開いた状態
const modal = ref();
const searchText = ref('');
const canDismiss = ref(false);

const initMap = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
  });

  try {
    const { Map } = await loader.importLibrary('maps');
    const map = new Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 35.6812, lng: 139.7671 }, // 東京の座標
      zoom: 12,
    });
  } catch (error) {
    console.error('Google Mapsの読み込みに失敗しました:', error);
  }
};

// モーダル関連の関数
const handleDismiss = () => {
  console.log('handleDismiss');
  // モーダルを完全に閉じずに、最小のbreakpointに戻す
  if (modal.value) {
    modal.value.$el.setCurrentBreakpoint(0.2);
  }
};

// 検索機能
const onSearchInput = (event: any) => {
  searchText.value = event.target.value;
  // 検索ロジックをここに実装
  console.log('検索中:', searchText.value);
};

const closeModal = () => {
  canDismiss.value = true;
  nextTick(() => {
    modal.value.$el.setCurrentBreakpoint(0);
  });
  isModalOpen.value = false;
}

// ページに戻ってきた時の処理
const handleReturnToMap = () => {
  isModalOpen.value = true;
  canDismiss.value = false;
  
  if (modal.value && modal.value.$el) {
      console.log('Modal element:', modal.value.$el);
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

.menu-buttons {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-button {
  height: 60px;
  font-size: 16px;
  font-weight: 500;
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
}

ion-modal ion-content {
  flex: 1;
  --background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
</style>
