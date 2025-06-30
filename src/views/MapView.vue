<template>
  <ion-page>
    <!-- Google Maps -->
    <div id="map"></div>

    <!-- Sheet Modal -->
    <ion-modal ref="modal" :is-open="isModalOpen" @did-dismiss="handleDismiss" :breakpoints="[0, 0.2, 0.5, 0.8]"
      :initial-breakpoint="0.2" :can-dismiss="canDismiss" :backdrop-breakpoint="1" :backdrop-dismiss="false"
      :handle="true" :keep-contents-mounted="true" :expand-to-scroll="false">

      <!-- 浮動アクションボタン群 - モーダル内だがはみ出し表示 -->
      <div class="floating-buttons" v-if="floatingButtonVisible">
        <ion-button fill="solid" size="default" class="floating-button wishlist-button"
          @click="navigateTo(WishListView)">
          <ion-icon :icon="heartOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button fill="solid" size="default" class="floating-button visited-button" @click="navigateTo(VisitedView)">
          <ion-icon :icon="locationOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <ion-content class="ion-padding">
        <!-- 検索バー -->
        <ion-searchbar v-model="searchText" placeholder="場所を検索..." @ionInput="onSearchInput" @ionFocus="onSearchFocus"
          show-clear-button="focus"></ion-searchbar>

        <!-- 検索結果 -->
        <div v-if="placeDetail" class="place-detail-container">
          <!-- 場所名と住所 -->
          <div class="place-info">
            <div class="place-header">
              <h2 class="place-title">{{ placeDetail.displayName }}</h2>
              
              <!-- ステータスチップ -->
              <div class="status-chips" v-if="placeDetail.id">
                <ion-chip color="primary" outline :disabled="!isVisitedLocation">
                  <ion-icon :icon="locationOutline" style="margin: -4px;"></ion-icon>
                </ion-chip>
                <ion-chip color="danger" outline :style="isWishLocation ? { background: 'rgba(197, 0, 16, 0.12)' } : {}" @click="setWishLocation(!isWishLocation)">
                  <ion-icon :icon="heart" v-if="isWishLocation"></ion-icon>
                  <ion-icon :icon="heartOutline" v-else></ion-icon>
                  <ion-label>Wish</ion-label>
                </ion-chip>
              </div>
            </div>
            <p class="place-address">{{ placeDetail.formattedAddress }}</p>
          </div>
          
          <!-- 画像表示 -->
          <div v-if="placeDetail.photos?.[0]" class="photo-container">
            <div v-if="imageLoading" class="image-placeholder">
              <ion-spinner></ion-spinner>
              <p>画像を読み込み中...</p>
            </div>
            <img 
              v-show="!imageLoading"
              :src="placeDetail.photos[0].getURI()" 
              alt="場所の写真"
              @load="imageLoading = false"
              @error="imageLoading = false"
              class="place-photo"
            >
          </div>
          
          <!-- ウェブサイトリンク -->
          <div v-if="placeDetail.websiteURI" class="website-link">
            <ion-button fill="clear" size="small" @click="openWebsite(placeDetail.websiteURI)">
              <ion-icon :icon="globeOutline" slot="start"></ion-icon>
              {{ getWebsiteDisplayName(placeDetail.websiteURI) }}
            </ion-button>
          </div>
        </div>
        <div v-else-if="locationSuggestionsText.length > 0" class="suggestions-container">
          <ion-list class="suggestions-list">
            <div v-for="(suggestion, index) in locationSuggestionsText" :key="index" class="suggestion-item">
              <ion-item class="ion-activatable suggestion-content" button @click="handleSuggestionClick(index)">
                <ion-icon :icon="locationOutline" slot="start" class="location-icon"></ion-icon>
                <ion-label>
                  <h2 class="main-text">{{ suggestion[0] }}</h2>
                  <p class="sub-text">{{ suggestion[1] }}</p>
                </ion-label>
              </ion-item>
            </div>
          </ion-list>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, markRaw, computed } from 'vue';
import {
  IonIcon,
  IonModal,
  IonContent,
  IonButton,
  IonSearchbar,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonChip,
} from '@ionic/vue';
import {
  heartOutline,
  heart,
  locationOutline,
  globeOutline,
} from 'ionicons/icons';
import { Loader } from '@googlemaps/js-api-loader';
import WishListView from './WishListView.vue';
import VisitedView from './VisitedView.vue';
import { useLocationStore } from '@/stores/location';

// モーダル関連
const isModalOpen = ref(true);
const modal = ref();
const searchText = ref('');
const canDismiss = ref(false);
const floatingButtonVisible = ref(true);

// Location Store
const locationStore = useLocationStore();

// Google API関連
const googleApiLoader = ref<Loader | null>(null);
let Place: typeof google.maps.places.Place | null = null;
let AutocompleteSessionToken: typeof google.maps.places.AutocompleteSessionToken | null = null;
let AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion | null = null;
let locationSuggestions: (google.maps.places.PlacePrediction | null)[] = [];
const placeDetail = ref<google.maps.places.Place | null>(null);
const locationSuggestionsText = ref<(string | undefined)[][]>([]);
const autocompleteSessionToken = ref<google.maps.places.AutocompleteSessionToken | null>(null);
const placeAPIRequestId = ref(0);
let map: google.maps.Map | null = null;
let marker: google.maps.marker.AdvancedMarkerElement | null = null;
const imageLoading = ref(true);

// ステータス判定のcomputed
const isWishLocation = computed(() => {
  if (!placeDetail.value?.id) return false;
  const location = locationStore.locations.find(loc => loc.google_place_id === placeDetail.value?.id);
  return location?.wish || false;
});

const isVisitedLocation = computed(() => {
  if (!placeDetail.value?.id) return false;
  const location = locationStore.locations.find(loc => loc.google_place_id === placeDetail.value?.id);
  if (!location) return false;
  return locationStore.visited.some(visit => visit.location_id === location.id);
});

const initialize = async () => {
  googleApiLoader.value = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
  });

  try {
    const { Map } = await googleApiLoader.value.importLibrary('maps');
    map = new Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 35.6812, lng: 139.7671 },
      zoom: 12,
      disableDefaultUI: true,
      mapId: "DEMO_MAP_ID"
    });
    map.addListener('click', handleMapClick);

    const { AdvancedMarkerElement } = await googleApiLoader.value.importLibrary('marker');
    marker = new AdvancedMarkerElement({
      map
    });
  } catch (error) {
    console.error('Google Mapsの読み込みに失敗しました:', error);
  }

  try {
    const { Place: P, AutocompleteSessionToken: AST, AutocompleteSuggestion: AS } = await googleApiLoader.value.importLibrary('places');
    Place = P;
    AutocompleteSessionToken = AST;
    AutocompleteSuggestion = AS;
  } catch (error) {
    console.error('Google Places APIの読み込みに失敗しました:', error);
  }

  refreshPlaceAPIToken();
}

const handleDismiss = () => {
  if (modal.value) {
    modal.value.$el.setCurrentBreakpoint(0.2);
  }
};

const handleMapClick = async (event: google.maps.IconMouseEvent) => {
  if (!event.placeId) return;
  if (!Place) return;

  const place = new Place({
    id: event.placeId,
    requestedLanguage: 'ja',
  });

  await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'photos', 'websiteURI'] });
  placeDetail.value = place;
  imageLoading.value = true;
  if (map && marker && event.latLng) {
    map.panTo(event.latLng);
    map.setZoom(15);
    marker.position = event.latLng;
  }
}

const onSearchFocus = () => {
  if (modal.value) {
    modal.value.$el.setCurrentBreakpoint(0.5);
  }
  placeDetail.value = null;
}

const onSearchInput = async (event: any) => {
  searchText.value = event.target.value;
  console.log('検索中:', searchText.value);

  if (!AutocompleteSuggestion) {
    return;
  }

  if (searchText.value === '') {
    refreshPlaceAPIToken();
    locationSuggestionsText.value = [];
    locationSuggestions = [];
    return;
  }

  if (!autocompleteSessionToken.value) {
    refreshPlaceAPIToken();
    return;
  }

  const request = {
    input: searchText.value,
    includedPrimaryTypes: ['geocode', 'establishment'],
    includedRegionCodes: ['jp'],
    sessionToken: autocompleteSessionToken.value,
  }

  const requestId = ++placeAPIRequestId.value;

  try {
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    if (requestId !== placeAPIRequestId.value) {
      return;
    }

    locationSuggestionsText.value = suggestions.map((suggestion) => suggestion.placePrediction).map((prediction) => [prediction?.mainText?.text, prediction?.secondaryText?.text]);
    locationSuggestions = suggestions.map((suggestion) => suggestion.placePrediction);
  } catch (error) {
    console.error('オートコンプリート取得エラー:', error);
  }
};

const refreshPlaceAPIToken = () => {
  if (AutocompleteSessionToken) {
    autocompleteSessionToken.value = new AutocompleteSessionToken();
  }
}

const handleSuggestionClick = async (index: number) => {
  const place = locationSuggestions[index]?.toPlace();
  await place?.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'photos', 'websiteURI'] });
  placeDetail.value = place || null;
  imageLoading.value = true;
  if (map && marker && place?.location) {
    map.panTo(place.location);
    map.setZoom(15);
    marker.position = place.location;
  }
}

const setWishLocation = (wish: boolean) => {
  // locationsにgoogle_place_idが一致するlocationが存在する場合、wishを更新
  // locationsにgoogle_place_idが一致するlocationが存在しない場合、新規作成

  if (!placeDetail.value?.id) return;
  const location = locationStore.locations.find(loc => loc.google_place_id === placeDetail.value?.id);
  if (!location) {
    locationStore.addLocation({
      name: placeDetail.value?.displayName || '',
      address: placeDetail.value?.formattedAddress || '',
      latitude: placeDetail.value?.location?.lat() || 0,
      longitude: placeDetail.value?.location?.lng() || 0,
      google_place_id: placeDetail.value?.id,
      wish: wish,
      google_place_photo: placeDetail.value?.photos?.[0]?.getURI() || '',
      google_place_website: placeDetail.value?.websiteURI || '',
    });
  } else {
    location.wish = !location.wish;
    locationStore.updateLocation(location.id, location);
  }
}

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

const openWebsite = (websiteURI: string) => {
  window.open(websiteURI, '_blank');
}

const getWebsiteDisplayName = (websiteURI: string) => {
  try {
    const url = new URL(websiteURI);
    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    return websiteURI;
  }
}

onMounted(() => {
  initialize();
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
  transform: translateY(-105px);
  /* ボタン群をモーダルの上に移動 */
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

.suggestions-container {
  max-width: 100%;
  overflow-y: auto;
}

.suggestions-list {
  padding: 0;
}

.suggestion-item {
  padding: 10px;
}

.suggestion-content {
  position: relative;
  overflow: hidden;
  --padding-start: 0;
  --padding-end: 0;
}

.location-icon {
  margin-right: 10px;
}

.main-text {
  font-size: 16px;
  font-weight: bold;
}

.sub-text {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.place-detail-container {
  margin-bottom: 15px;
}

.place-info {
  margin-bottom: 12px;
  padding: 0 8px;
}

.place-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.place-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 4px 0 0 0;
  flex: 1;
  min-width: 0;
}

.place-address {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}

.photo-container {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--ion-color-light);
  color: var(--ion-color-medium);
}

.image-placeholder p {
  margin-top: 8px;
  font-size: 12px;
}

.place-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.website-link {
  padding: 0 8px;
}

.status-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.status-chips ion-chip {
  margin: 0;
  font-size: 12px;
  height: 24px;
}

.status-chips ion-chip ion-icon {
  font-size: 14px;
}
</style>
