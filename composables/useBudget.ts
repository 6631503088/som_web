import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

// Budget API composable
export const useBudget = () => {
  const config = useRuntimeConfig()
  const { user } = useFirebaseAuth()
  
  // Get API base URL from config or use production URL
  const getBaseURL = () => {
    return config.public.apiBase || 
           config.public.apiBaseUrl ||
           'https://som.mlbbshop.app'
  }

  // Get auth headers with Firebase ID token
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

  // Extract staff code from email (e.g., 6531503172@lamduan.mfu.ac.th -> 6531503172)
  const extractStaffCode = (email: string): string => {
    if (!email) return ''
    const match = email.match(/^(\d+)@/)
    return match ? match[1] : ''
  }

  // Get budget overview data by staff code
  const getBudgetOverview = async (staffCode: string, evaluateid: number = 9) => {
    try {
      const headers = await getAuthHeaders()
      const baseURL = getBaseURL()
      const response = await $fetch(`${baseURL}/api/budget/overview/${staffCode}?evaluateid=${evaluateid}`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching budget overview:', error)
      throw error
    }
  }

  // Get budget projects/details by staff code
  const getBudgetProjects = async (staffCode: string, evaluateid: number = 9) => {
    try {
      const headers = await getAuthHeaders()
      const baseURL = getBaseURL()
      const response = await $fetch(`${baseURL}/api/budget/projects/${staffCode}?evaluateid=${evaluateid}`, {
        headers
      })
      return response
    } catch (error) {
      console.error('Error fetching budget projects:', error)
      throw error
    }
  }

  // Create new budget project
  const createBudgetProject = async (projectData: {
    title: string
    categoryName: string
    budgetAmount: number
    duration: string
    staffCode: string
    evaluateid?: number
    owners?: string[]
  }) => {
    try {
      const headers = await getAuthHeaders()
      const baseURL = getBaseURL()
      const response = await $fetch(`${baseURL}/api/budget/projects`, {
        method: 'POST',
        headers,
        body: projectData
      })
      return response
    } catch (error) {
      console.error('Error creating budget project:', error)
      throw error
    }
  }

  // Update budget project
  const updateBudgetProject = async (projectId: number, projectData: {
    title: string
    budgetAmount: number
    duration: string
    owners?: string[]
  }) => {
    try {
      const headers = await getAuthHeaders()
      const baseURL = getBaseURL()
      const response = await $fetch(`${baseURL}/api/budget/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: projectData
      })
      return response
    } catch (error) {
      console.error('Error updating budget project:', error)
      throw error
    }
  }

  // Delete budget project
  const deleteBudgetProject = async (projectId: number) => {
    try {
      const headers = await getAuthHeaders()
      const baseURL = getBaseURL()
      const response = await $fetch(`${baseURL}/api/budget/projects/${projectId}`, {
        method: 'DELETE',
        headers
      })
      return response
    } catch (error) {
      console.error('Error deleting budget project:', error)
      throw error
    }
  }

  return {
    extractStaffCode,
    getBudgetOverview,
    getBudgetProjects,
    createBudgetProject,
    updateBudgetProject,
    deleteBudgetProject
  }
}
