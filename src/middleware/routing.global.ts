import { getCurrentUser } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'

export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
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
  } catch (error) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  }
}) 