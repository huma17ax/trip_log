import { getCurrentUser, useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      // Set user in authStore so other stores can access it
      const authStore = useAuthStore()
      authStore.setUser(user)
      
      const locationStore = useLocationStore()
      await locationStore.initialize()
      
      if (to.path === '/login') {
        return navigateTo('/')
      }
    } else {
      if (to.path !== '/login') {
        return navigateTo('/login')
      }
    }
  } catch {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  }
}) 