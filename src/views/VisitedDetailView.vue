<template>
    <ion-header class="transparent-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="" class="back-btn"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div v-if="visited && location" class="detail-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-image" :style="heroBackgroundStyle">
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <ion-datetime-button datetime="visited-datetime" class="date-badge-btn">
                <span slot="date-target">🗓️ {{ formattedDate }}</span>
              </ion-datetime-button>
              <h1 class="location-name">{{ location.name }}</h1>
            </div>
          </div>
        </div>

        <!-- Date Picker Modal -->
        <ion-modal :keep-contents-mounted="true">
          <ion-datetime 
            id="visited-datetime" 
            v-model="dateValue"
            presentation="date"
            @ionChange="saveDate"
          ></ion-datetime>
        </ion-modal>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Info Section -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">ADDRESS</span>
              <span class="info-text">{{ location.address }}</span>
            </div>
            <a 
              v-if="location.google_place_website" 
              :href="location.google_place_website" 
              target="_blank"
              class="info-item link-item"
            >
              <span class="info-label">WEBSITE</span>
              <span class="info-text link-text">{{ location.google_place_website }}</span>
            </a>
          </div>

          <!-- Memo Section -->
          <div class="memo-section">
            <div class="memo-header">
              <span class="memo-label">MEMO</span>
            </div>
            <div class="memo-card">
              <ion-textarea
                v-model="memoText"
                :auto-grow="true"
                :rows="4"
                placeholder="この場所での思い出を記録..."
                class="memo-textarea"
                @ionBlur="saveMemo"
              ></ion-textarea>
            </div>
          </div>

          <!-- Photos Gallery -->
          <div class="photos-section">
            <div class="photos-header">
              <span class="photos-label">PHOTOS</span>
              <span v-if="visited.photos && visited.photos.length > 0" class="photos-count">
                {{ visited.photos.length }}
              </span>
            </div>
            
            <div v-if="visited.photos && visited.photos.length > 0" class="photos-carousel">
              <div 
                v-for="(photo, index) in visited.photos" 
                :key="index" 
                class="photo-card"
              >
                <ion-img :src="photo" :alt="'写真 ' + (index + 1)"></ion-img>
              </div>
            </div>
            
            <div v-else class="no-photos-card">
              <p class="no-photos-text">No photos yet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading / Not Found -->
      <div v-else class="not-found">
        <p>データが見つかりません</p>
      </div>
    </ion-content>
</template>

<script setup lang="ts">
import type { Location, Visited } from '@/types';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { 
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonTextarea,
  IonImg,
  IonDatetimeButton,
  IonDatetime,
  IonModal
} from '@ionic/vue';
import { useLocationStore } from '@/stores/location';

const props = defineProps<{
  targetVisitedId: string;
}>();

const locationStore = useLocationStore();
const visited = ref<Visited | undefined>(undefined);
const location = ref<Location | undefined>(undefined);
const memoText = ref<string>('');
const dateValue = ref<string>('');

// Format date for display (YYYY-MM-DD)
const formattedDate = computed(() => {
  if (!dateValue.value) return '';
  return dateValue.value.split('T')[0];
});

// Compute hero background style based on available images
const heroBackgroundStyle = computed(() => {
  // Priority: user photos > google place photo > gradient
  if (visited.value?.photos && visited.value.photos.length > 0) {
    return {
      backgroundImage: `url(${visited.value.photos[0]})`
    };
  } else if (location.value?.google_place_photo) {
    return {
      backgroundImage: `url(${location.value.google_place_photo})`
    };
  }
  // Fallback gradient (monochrome)
  return {
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'
  };
});

onMounted(() => {
  visited.value = locationStore.visited.find(visit => visit.id === props.targetVisitedId);
  location.value = locationStore.locations.find(loc => loc.id === visited.value?.location_id);
  memoText.value = visited.value?.memo || '';
  dateValue.value = visited.value?.date || '';
});

const saveMemo = () => {
  if (visited.value) {
    visited.value.memo = memoText.value;
    locationStore.updateVisited(visited.value.id, { memo: memoText.value });
  }
};

const saveDate = (event: CustomEvent) => {
  const newDateValue = event.detail.value;
  if (visited.value && newDateValue) {
    // Update reactive value
    dateValue.value = newDateValue;
    // Extract date part (YYYY-MM-DD) from ISO string
    const newDate = newDateValue.split('T')[0];
    visited.value.date = newDate;
    locationStore.updateVisited(visited.value.id, { date: newDate });
  }
};

// コンポーネントがアンマウントされる際にもメモを保存
onBeforeUnmount(() => {
  saveMemo();
});

</script>

<style scoped>
/* Header Styles */
.transparent-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.transparent-header ion-toolbar {
  --background: transparent;
  --border-width: 0;
}

.back-btn {
  --color: #fff;
  --background: rgba(0, 0, 0, 0.4);
  --border-radius: 50%;
  margin: 12px;
  width: 36px;
  height: 36px;
  backdrop-filter: blur(4px);
}

/* Hero Section */
.hero-section {
  position: relative;
  width: 100%;
}

.hero-image {
  width: 100%;
  height: 320px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px 24px;
  color: #fff;
}

.date-badge-btn {
  display: inline-block;
  margin-bottom: 12px;
}

.date-badge-btn::part(native) {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.location-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

/* Main Content */
.main-content {
  padding: 28px 24px;
  background: #fff;
  min-height: calc(100vh - 320px);
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  position: relative;
  z-index: 10;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #999;
}

.info-text {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

.link-item {
  cursor: pointer;
  transition: opacity 0.2s;
}

.link-item:hover {
  opacity: 0.7;
}

.link-text {
  color: #333;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Memo Section */
.memo-section {
  margin-bottom: 32px;
}

.memo-header {
  margin-bottom: 12px;
}

.memo-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #999;
}

.memo-card {
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #eee;
}

.memo-textarea {
  --background: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #333;
}

.memo-textarea::part(native) {
  color: #333;
}

/* Photos Section */
.photos-section {
  margin-bottom: 24px;
}

.photos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.photos-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #999;
}

.photos-count {
  background: #1a1a1a;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photos-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.photos-carousel::-webkit-scrollbar {
  display: none;
}

.photo-card {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  scroll-snap-align: start;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:active {
  transform: scale(0.97);
}

.photo-card ion-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photos-card {
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
}

.no-photos-text {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

/* Not Found State */
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
  color: #999;
}

.not-found p {
  font-size: 0.95rem;
}
</style>
