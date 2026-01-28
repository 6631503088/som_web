import { ref, computed } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

interface Publication {
  id: number
  title: string
  authors: string
  venue: string
  year: number
  link: string
  evaluateid: number
}

export const useLecturerPublications = () => {
  const { user } = useFirebaseAuth()
  const runtimeConfig = useRuntimeConfig()
  const publications = ref<Publication[]>([])
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

  const fetchPublications = async (limit?: number, evaluateid?: number) => {
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
      
      let url = `${apiBaseUrl.value}/api/lecturer/publications/${staffCode.value}`
      const params = new URLSearchParams()
      
      if (evaluateid) {
        params.append('evaluateid', evaluateid.toString())
      }
      if (limit) {
        params.append('limit', limit.toString())
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
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
        if (response.status === 404) {
          publications.value = []
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        publications.value = result.data
      } else {
        throw new Error(result.message || 'Failed to fetch publications')
      }
    } catch (err) {
      console.error('Error fetching publications:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch publications'
      
      // Fallback to mock data only in development
      if (process.env.NODE_ENV === 'development') {
        publications.value = [
          { 
            id: 1,
            title: 'A Novel Approach to Sentiment Analysis', 
            authors: 'Thein, P.M., Kumar, R., & Smith, J.',
            venue: 'Journal of Data Science', 
            year: 2024, 
            link: '#',
            evaluateid: 9
          },
          { 
            id: 2,
            title: 'Machine Learning in Education', 
            authors: 'Thein, P.M., & Johnson, A.',
            venue: 'International Conference on AI', 
            year: 2023, 
            link: '#',
            evaluateid: 9
          },
          { 
            id: 3,
            title: 'Optimizing Research Collaboration', 
            authors: 'Thein, P.M., Brown, K., & Davis, L.',
            venue: 'Research Management Review', 
            year: 2023, 
            link: '#',
            evaluateid: 9
          },
        ]
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    publications: computed(() => publications.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    staffCode,
    fetchPublications
  }
}
