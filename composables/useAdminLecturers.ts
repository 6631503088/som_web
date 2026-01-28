import { ref, computed } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

// Types
export interface LecturerProfile {
  staff_code: string
  staff_name: string
  email?: string
  phone?: string
  location?: string
  program?: string
  position?: string
  created_at?: string
  updated_at?: string
  publication_count?: number
  education_count?: number
  research_area_count?: number
}

export interface LecturerEducation {
  id?: number
  staff_code: string
  degree: string
  institution: string
  year?: number
}

export interface LecturerResearchArea {
  id?: number
  staff_code: string
  research_area: string
}

export interface LecturerPublication {
  id?: number
  staff_code: string
  title: string
  authors?: string
  venue?: string
  year?: number
  link?: string
  evaluateid?: number
}

export interface SelfDevelopment {
  id?: number
  staffcode: string
  title: string
  date?: string
  type?: string
  location?: string
  evaluateid?: number
}

export interface PaginationInfo {
  total: number
  limit: number
  offset: number
}

// Admin Lecturers API composable
export const useAdminLecturers = () => {
  const { user } = useFirebaseAuth()
  const runtimeConfig = useRuntimeConfig()
  
  const lecturers = ref<LecturerProfile[]>([])
  const programs = ref<string[]>([])
  const pagination = ref<PaginationInfo>({ total: 0, limit: 50, offset: 0 })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get API base URL
  const getBaseUrl = () => {
    return runtimeConfig.public.apiBase || 
           runtimeConfig.public.backendApiUrl ||
           'https://som.mlbbshop.app'
  }

  // Get auth headers
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    const idToken = await user.value.getIdToken()
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  }

  // ============================================
  // Lecturer Profile CRUD
  // ============================================

  // Fetch all lecturers with optional filters
  const fetchLecturers = async (options: {
    program?: string
    search?: string
    limit?: number
    offset?: number
  } = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const params = new URLSearchParams()
      if (options.program) params.append('program', options.program)
      if (options.search) params.append('search', options.search)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())

      const url = `${baseUrl}/api/admin/lecturers${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied: Admin privileges required')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        lecturers.value = result.data
        pagination.value = result.pagination
      } else {
        throw new Error(result.message || 'Failed to fetch lecturers')
      }
      
      return result.data
    } catch (err) {
      console.error('Error fetching lecturers:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch lecturers'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/programs`, { headers })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          programs.value = result.data
        }
      }
      
      return programs.value
    } catch (err) {
      console.error('Error fetching programs:', err)
      return []
    }
  }

  // Create new lecturer
  const createLecturer = async (lecturer: Partial<LecturerProfile>) => {
    isLoading.value = true
    error.value = null

    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(lecturer)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create lecturer')
      }
      
      return result
    } catch (err) {
      console.error('Error creating lecturer:', err)
      error.value = err instanceof Error ? err.message : 'Failed to create lecturer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update lecturer profile
  const updateLecturer = async (staffCode: string, data: Partial<LecturerProfile>) => {
    isLoading.value = true
    error.value = null

    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update lecturer')
      }
      
      return result
    } catch (err) {
      console.error('Error updating lecturer:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update lecturer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete lecturer and all related data
  const deleteLecturer = async (staffCode: string) => {
    isLoading.value = true
    error.value = null

    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}`, {
        method: 'DELETE',
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete lecturer')
      }
      
      // Remove from local list
      lecturers.value = lecturers.value.filter(l => l.staff_code !== staffCode)
      
      return result
    } catch (err) {
      console.error('Error deleting lecturer:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete lecturer'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Education CRUD
  // ============================================

  const addEducation = async (staffCode: string, education: Omit<LecturerEducation, 'id' | 'staff_code'>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}/education`, {
        method: 'POST',
        headers,
        body: JSON.stringify(education)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add education')
      }
      
      return result
    } catch (err) {
      console.error('Error adding education:', err)
      throw err
    }
  }

  const updateEducation = async (id: number, data: Partial<LecturerEducation>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/education/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update education')
      }
      
      return result
    } catch (err) {
      console.error('Error updating education:', err)
      throw err
    }
  }

  const deleteEducation = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/education/${id}`, {
        method: 'DELETE',
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete education')
      }
      
      return result
    } catch (err) {
      console.error('Error deleting education:', err)
      throw err
    }
  }

  // ============================================
  // Research Areas CRUD
  // ============================================

  const addResearchArea = async (staffCode: string, research_area: string) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}/research-areas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ research_area })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add research area')
      }
      
      return result
    } catch (err) {
      console.error('Error adding research area:', err)
      throw err
    }
  }

  const deleteResearchArea = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/research-areas/${id}`, {
        method: 'DELETE',
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete research area')
      }
      
      return result
    } catch (err) {
      console.error('Error deleting research area:', err)
      throw err
    }
  }

  // ============================================
  // Publications CRUD
  // ============================================

  const addPublication = async (staffCode: string, publication: Omit<LecturerPublication, 'id' | 'staff_code'>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}/publications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(publication)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add publication')
      }
      
      return result
    } catch (err) {
      console.error('Error adding publication:', err)
      throw err
    }
  }

  const updatePublication = async (id: number, data: Partial<LecturerPublication>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/publications/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update publication')
      }
      
      return result
    } catch (err) {
      console.error('Error updating publication:', err)
      throw err
    }
  }

  const deletePublication = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/publications/${id}`, {
        method: 'DELETE',
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete publication')
      }
      
      return result
    } catch (err) {
      console.error('Error deleting publication:', err)
      throw err
    }
  }

  // ============================================
  // Self Development CRUD
  // ============================================

  const addSelfDevelopment = async (staffCode: string, data: Omit<SelfDevelopment, 'id' | 'staffcode'>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/lecturers/${staffCode}/self-development`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add self development')
      }
      
      return result
    } catch (err) {
      console.error('Error adding self development:', err)
      throw err
    }
  }

  const updateSelfDevelopment = async (id: number, data: Partial<SelfDevelopment>) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/self-development/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update self development')
      }
      
      return result
    } catch (err) {
      console.error('Error updating self development:', err)
      throw err
    }
  }

  const deleteSelfDevelopment = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const baseUrl = getBaseUrl()
      
      const response = await fetch(`${baseUrl}/api/admin/self-development/${id}`, {
        method: 'DELETE',
        headers
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete self development')
      }
      
      return result
    } catch (err) {
      console.error('Error deleting self development:', err)
      throw err
    }
  }

  return {
    // State
    lecturers: computed(() => lecturers.value),
    programs: computed(() => programs.value),
    pagination: computed(() => pagination.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Lecturer Profile
    fetchLecturers,
    fetchPrograms,
    createLecturer,
    updateLecturer,
    deleteLecturer,
    
    // Education
    addEducation,
    updateEducation,
    deleteEducation,
    
    // Research Areas
    addResearchArea,
    deleteResearchArea,
    
    // Publications
    addPublication,
    updatePublication,
    deletePublication,
    
    // Self Development
    addSelfDevelopment,
    updateSelfDevelopment,
    deleteSelfDevelopment
  }
}
