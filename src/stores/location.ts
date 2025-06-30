import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Location, Visited } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "~/firebase";
import { useAuthStore } from "~/stores/auth";

const LocationCollectionId = "locations";
const VisitedCollectionId = "visited";

export const useLocationStore = defineStore("location", () => {
  // State
  const locations = ref<Location[]>([]);
  const visited = ref<Visited[]>([]);
  const initialized = ref(false);

  // Getters
  const wishLocations = computed(() =>
    locations.value.filter((location) => location.wish)
  );

  // ユーザーIDを取得するヘルパー関数
  const getUserId = () => {
    const authStore = useAuthStore();
    if (!authStore.user) {
      throw new Error("ユーザーが認証されていません");
    }
    return authStore.user.uid;
  };

  // ユーザー配下のコレクション参照を取得するヘルパー関数
  const getUserCollection = (collectionName: string) => {
    const userId = getUserId();
    return collection(db, "users", userId, collectionName);
  };

  // Actions
  const initialize = async () => {
    if (initialized.value) return;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await Promise.all([subscribeDB(), fetchLocations(), fetchVisited()]);
    initialized.value = true;
  };

  const subscribeDB = async () => {
    if (!useAuthStore().user) return;
    const userId = getUserId();
    
    onSnapshot(collection(db, "users", userId, LocationCollectionId), (snapshot) => {
      locations.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Location[];
    });

    onSnapshot(collection(db, "users", userId, VisitedCollectionId), (snapshot) => {
      visited.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Visited[];
    });
  };

  const fetchLocations = async () => {
    const snapshot = await getDocs(getUserCollection(LocationCollectionId));
    locations.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Location[];
  };

  const fetchVisited = async () => {
    const snapshot = await getDocs(getUserCollection(VisitedCollectionId));
    visited.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Visited[];
  };

  const addLocation = async (location: Omit<Location, "id">) => {
    await addDoc(getUserCollection(LocationCollectionId), location);
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    const index = locations.value.findIndex((loc) => loc.id === id);
    if (index !== -1) {
      const userId = getUserId();
      await updateDoc(doc(db, "users", userId, LocationCollectionId, id), updates);
    }
  };

  const deleteLocation = async (id: string) => {
    const index = locations.value.findIndex((loc) => loc.id === id);
    if (index !== -1) {
      const userId = getUserId();
      await deleteDoc(doc(db, "users", userId, LocationCollectionId, id));
    }
  };

  const addVisited = async (visitedData: Omit<Visited, "id">) => {
    await addDoc(getUserCollection(VisitedCollectionId), visitedData);
  };

  const updateVisited = async (id: string, updates: Partial<Visited>) => {
    const index = visited.value.findIndex((visit) => visit.id === id);
    if (index !== -1) {
      const userId = getUserId();
      await updateDoc(doc(db, "users", userId, VisitedCollectionId, id), updates);
    }
  };

  const deleteVisited = async (id: string) => {
    const index = visited.value.findIndex((visit) => visit.id === id);
    if (index !== -1) {
      const userId = getUserId();
      await deleteDoc(doc(db, "users", userId, VisitedCollectionId, id));
    }
  };

  return {
    // State
    locations,
    visited,

    // Getters
    wishLocations,

    // Actions
    initialize,
    addLocation,
    updateLocation,
    deleteLocation,
    addVisited,
    updateVisited,
    deleteVisited,
  };
});
