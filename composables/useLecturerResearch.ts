import { ref, computed } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

export const useLecturerResearch = () => {
  const { user } = useFirebaseAuth()
  const runtimeConfig = useRuntimeConfig()
  const researchAreas = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get API base URL from config or use production URL
  const apiBaseUrl = computed(() => {
    return runtimeConfig.public.apiBase || 
           runtimeConfig.public.apiBaseUrl ||
           'https://som.mlbbshop.app'
  })

  // Extract staff code from email (e.g., 6531503172@lamduan.mfu.ac.th -> 6531503172)
  const staffCode = computed(() => {
    if (!user.value?.email) return null
    const match = user.value.email.match(/^(\d+)@/)
    return match ? match[1] : null
  })

  const fetchResearchAreas = async () => {
    if (!staffCode.value) {
      error.value = 'No staff code found in email'
      return
    }

    if (!user.value) {
      error.value = 'User not authenticated'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Get Firebase ID token for authentication
      const idToken = await user.value.getIdToken()
      
      const response = await fetch(`${apiBaseUrl.value}/api/lecturer/research/${staffCode.value}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again')
        }
        if (response.status === 403) {
          throw new Error('Access denied: You do not have permission to view this data')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      researchAreas.value = data
    } catch (err) {
      console.error('Error fetching lecturer research areas:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch research areas data'
      
      // Fallback to mock data only in development
      if (process.env.NODE_ENV === 'development') {
        researchAreas.value = [
          'Business Intelligence and Data Analytics',
          'Machine Learning Applications in Management',
          'Higher Education Administration',
          'Research Collaboration Networks',
        ]
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    researchAreas: computed(() => researchAreas.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    staffCode,
    fetchResearchAreas
  }
}
