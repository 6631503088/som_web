import { ref } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

// Types
export interface Program {
  program_id: number
  program_code: string
  program_name: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  lecturer_count?: number
}

export interface CreateProgramPayload {
  program_code: string
  program_name: string
  is_active?: boolean
}

export interface UpdateProgramPayload {
  program_code?: string
  program_name?: string
  is_active?: boolean
}

// Admin Programs API composable
export const useAdminPrograms = () => {
  const { user } = useFirebaseAuth()
  const runtimeConfig = useRuntimeConfig()
  
  const programs = ref<Program[]>([])
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
  // Program CRUD Operations
  // ============================================

  // Fetch all programs
  const fetchPrograms = async (activeOnly: boolean = false): Promise<Program[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const headers = await getAuthHeaders()
      const url = `${getBaseUrl()}/api/admin/programs${activeOnly ? '?active_only=true' : ''}`
      
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch programs')
      }
      
      const data = await response.json()
      programs.value = data.data || []
      
      // Fetch lecturer count for each program
      await Promise.all(
        programs.value.map(async (program) => {
          try {
            const countResponse = await fetch(
              `${getBaseUrl()}/api/admin/programs/${program.program_id}/lecturers/count`,
              { headers }
            )
            if (countResponse.ok) {
              const countData = await countResponse.json()
              program.lecturer_count = countData.count || 0
            }
          } catch {
            program.lecturer_count = 0
          }
        })
      )
      
      return programs.value
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching programs:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single program by ID
  const getProgram = async (programId: number): Promise<Program | null> => {
    isLoading.value = true
    error.value = null
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(
        `${getBaseUrl()}/api/admin/programs/${programId}`,
        { headers }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch program')
      }
      
      const data = await response.json()
      return data.data
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching program:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create new program
  const createProgram = async (payload: CreateProgramPayload): Promise<Program> => {
    isLoading.value = true
    error.value = null
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${getBaseUrl()}/api/admin/programs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create program')
      }
      
      const data = await response.json()
      
      // Refresh programs list
      await fetchPrograms()
      
      return data.data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating program:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update program
  const updateProgram = async (programId: number, payload: UpdateProgramPayload): Promise<Program> => {
    isLoading.value = true
    error.value = null
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${getBaseUrl()}/api/admin/programs/${programId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update program')
      }
      
      const data = await response.json()
      
      // Refresh programs list
      await fetchPrograms()
      
      return data.data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating program:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Toggle program active status
  const toggleProgramStatus = async (programId: number, isActive: boolean): Promise<Program> => {
    return updateProgram(programId, { is_active: isActive })
  }

  // Delete program
  const deleteProgram = async (programId: number): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${getBaseUrl()}/api/admin/programs/${programId}`, {
        method: 'DELETE',
        headers
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete program')
      }
      
      // Refresh programs list
      await fetchPrograms()
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting program:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get lecturer count for a program
  const getLecturerCount = async (programId: number): Promise<number> => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(
        `${getBaseUrl()}/api/admin/programs/${programId}/lecturers/count`,
        { headers }
      )
      
      if (!response.ok) {
        return 0
      }
      
      const data = await response.json()
      return data.count || 0
    } catch {
      return 0
    }
  }

  return {
    // State
    programs,
    isLoading,
    error,
    
    // Methods
    fetchPrograms,
    getProgram,
    createProgram,
    updateProgram,
    toggleProgramStatus,
    deleteProgram,
    getLecturerCount
  }
}
