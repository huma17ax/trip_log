import { getCurrentUser } from '@/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {

  try {
    const user = await getCurrentUser()
    
    if (user) {
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