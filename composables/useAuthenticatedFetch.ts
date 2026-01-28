import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

/**
 * Composable to make authenticated API calls
 * Automatically adds Firebase ID token to Authorization header
 */
export const useAuthenticatedFetch = () => {
  const { user } = useFirebaseAuth()
  const runtimeConfig = useRuntimeConfig()
  
  // Get base URL from runtime config or use production URL
  const getBaseUrl = () => {
    return runtimeConfig.public.apiBase || 
           runtimeConfig.public.apiBaseUrl ||
           'https://som.mlbbshop.app'
  }

  /**
   * Make an authenticated fetch request
   * @param endpoint - API endpoint (e.g., '/api/lecturer/profile/123')
   * @param options - Fetch options (method, body, etc.)
   * @returns Response data
   */
  const authFetch = async <T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    // Get the Firebase ID token
    const idToken = await user.value.getIdToken()

    const baseUrl = getBaseUrl()
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * GET request with authentication
   */
  const get = async <T = any>(endpoint: string): Promise<T> => {
    return authFetch<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request with authentication
   */
  const post = async <T = any>(endpoint: string, body: any): Promise<T> => {
    return authFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  /**
   * PUT request with authentication
   */
  const put = async <T = any>(endpoint: string, body: any): Promise<T> => {
    return authFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  /**
   * DELETE request with authentication
   */
  const del = async <T = any>(endpoint: string): Promise<T> => {
    return authFetch<T>(endpoint, { method: 'DELETE' })
  }

  return {
    authFetch,
    get,
    post,
    put,
    del,
    getBaseUrl
  }
}
