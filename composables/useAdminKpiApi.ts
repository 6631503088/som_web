import { readonly, ref } from 'vue'
import { useFirebaseAuth } from '@/composables/useFirebaseAuth'

export interface LecturerKpiData {
  staffCode: string
  staffName: string
  domainScoreName: string
  domainWeights: {
    domain1: number
    domain2: number
    domain3: number
    domain4: number
    domain5: number
  }
  domainScores: {
    domain1: number
    domain2: number
    domain3: number
    domain4: number
    domain5: number
  }
  domainThresholds: {
    domain1: number
    domain2: number
    domain3: number
    domain4: number
    domain5: number
  }
  overallPerformance: {
    academicPerformance: number
    behavior: number
    totalScore: number
  }
  performanceLevel: string
}

export const useAdminKpiApi = () => {
  const { user } = useFirebaseAuth()
  const allLecturersKpi = ref<LecturerKpiData[]>([])
  const selectedLecturerKpi = ref<LecturerKpiData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const runtimeConfig = useRuntimeConfig()
  // Use backend proxy for MFU API calls to avoid CORS issues
  const BACKEND_URL = runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app'
  const API_BASE_URL = `${BACKEND_URL}/api/mfu`  // Proxy through our backend

  const authToken = ref<string | null>(null)

  // Get Firebase ID token for backend API calls
  const getFirebaseToken = async (): Promise<string | null> => {
    // Wait for user to be available (max 3 seconds)
    let attempts = 0
    while (!user.value && attempts < 12) {
      await new Promise(resolve => setTimeout(resolve, 250))
      attempts++
    }
    
    if (!user.value) {
      console.warn('[AdminKPI] No user available for token')
      return null
    }
    
    try {
      const token = await user.value.getIdToken()
      return token
    } catch (err) {
      console.error('[AdminKPI] Error getting Firebase token:', err)
      return null
    }
  }

  // No need to login to MFU API directly - the backend proxy handles authentication
  const login = async (): Promise<string | null> => {
    // The backend proxy handles MFU API authentication
    // We just need to ensure we have a Firebase token
    const token = await getFirebaseToken()
    authToken.value = token
    return token
  }

  // Helper function to determine performance level based on total score
  const getPerformanceLevel = (totalScore: number): string => {
    if (totalScore >= 85) return 'Excellent'
    if (totalScore >= 75) return 'Good'
    if (totalScore >= 65) return 'Moderate'
    if (totalScore >= 55) return 'Poor'
    return 'Very Poor'
  }

  // Fetch all lecturers from local database
  const fetchLecturersFromBackend = async (): Promise<{staffCode: string, staffName: string}[]> => {
    try {
      const firebaseToken = await getFirebaseToken()
      if (!firebaseToken) {
        console.warn('[AdminKPI] No Firebase token available, using fallback')
        return getFallbackStaffList()
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/lecturers?limit=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          return data.data.map((l: any) => ({
            staffCode: l.staff_code,
            staffName: l.staff_name
          }))
        }
      }
      
      // If backend fails, use fallback list
      console.warn('[AdminKPI] Backend returned no data, using fallback')
      return getFallbackStaffList()
    } catch (err) {
      console.error('[AdminKPI] Error fetching lecturers from backend:', err)
      return getFallbackStaffList()
    }
  }

  // Fallback staff list from database (hardcoded for reliability)
  const getFallbackStaffList = (): {staffCode: string, staffName: string}[] => {
    return [
      { staffCode: '45210012', staffName: 'Assistant Professor Dr. Apisom Intralawan' },
      { staffCode: '46212058', staffName: 'Ajarn Dr. Chachaya Yodsuwan' },
      { staffCode: '46212130', staffName: 'Ajarn Supannika Khuanmuang' },
      { staffCode: '48212025', staffName: 'Ajarn Rapipong Promnart' },
      { staffCode: '49210074', staffName: 'Ajarn Sudsiri Rungruang' },
      { staffCode: '49212075', staffName: 'Ajarn Dr. Piyatida Pianluprasidh' },
      { staffCode: '52212018', staffName: 'Assistant Professor Dr. Chatrudee Jongsureyapart' },
      { staffCode: '53212053', staffName: 'Ajarn Ekawee Vinitkhatkumnuen' },
      { staffCode: '54212008', staffName: 'Ajarn Dr. Pornpimol Chaisanit' },
      { staffCode: '54212096', staffName: 'Ajarn Dr. Pornwasin Sirisawat' },
      { staffCode: '55210030', staffName: 'Associate Professor Dr. Pensri Jaroenwanit' },
      { staffCode: '55212065', staffName: 'Ajarn Dr. Thanaporn Sriyakul' },
      { staffCode: '56212021', staffName: 'Ajarn Piyanuch Sombat' },
      { staffCode: '57212054', staffName: 'Ajarn Bunjira Maknoi' },
      { staffCode: '58210037', staffName: 'Associate Professor Dr. Winitra Leelapattana' },
      { staffCode: '58212092', staffName: 'Ajarn Nittaya Tipparat' },
      { staffCode: '59210025', staffName: 'Associate Professor Dr. Sukhuman Klamsaengsai' },
      { staffCode: '59212067', staffName: 'Ajarn Dr. Patcharin Sirasoonthorn' },
      { staffCode: '60210043', staffName: 'Associate Professor Dr. Sasitorn Chetanont' },
      { staffCode: '60212081', staffName: 'Ajarn Dr. Siriporn Dabphet' }
    ]
  }

  // Fetch KPI data for a single lecturer from MFU API via backend proxy
  const fetchSingleLecturerKpi = async (staffCode: string, evaluateId: string | number): Promise<LecturerKpiData | null> => {
    try {
      const firebaseToken = await getFirebaseToken()
      if (!firebaseToken) {
        console.warn('[AdminKPI] No Firebase token for fetchSingleLecturerKpi')
        return null
      }

      // Use query parameters for the proxy endpoint
      const url = `${API_BASE_URL}/get_Percentage?evaluateid=${evaluateId}&staffcode=${staffCode}&lang=en`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const apiResponse = await response.json()
        if (apiResponse.code === 200 && apiResponse.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
          const staffData = apiResponse.data[0]
          const totalScore = staffData['Total Score (100%)'] || 0
          
          return {
            staffCode: staffData.staffcode || staffCode,
            staffName: staffData.staffname || 'Unknown',
            domainScoreName: staffData.domainscorename || 'Teaching',
            domainWeights: {
              domain1: staffData.domain1weight || 0,
              domain2: staffData.domain2weight || 0,
              domain3: staffData.domain3weight || 0,
              domain4: staffData.domain4weight || 0,
              domain5: staffData.domain5weight || 0
            },
            domainScores: {
              domain1: staffData.domain1score || 0,
              domain2: staffData.domain2score || 0,
              domain3: staffData.domain3score || 0,
              domain4: staffData.domain4score || 0,
              domain5: staffData.domain5score || 0
            },
            domainThresholds: {
              domain1: staffData.domain1threshold || 0,
              domain2: staffData.domain2threshold || 0,
              domain3: staffData.domain3threshold || 0,
              domain4: staffData.domain4threshold || 0,
              domain5: staffData.domain5threshold || 0
            },
            overallPerformance: {
              academicPerformance: staffData['Academic Performance (60%)'] || 0,
              behavior: staffData['Behavior (40%)'] || 0,
              totalScore: totalScore
            },
            performanceLevel: getPerformanceLevel(totalScore)
          }
        }
      }
      return null
    } catch (err) {
      console.error(`[AdminKPI] Error fetching KPI for ${staffCode}:`, err)
      return null
    }
  }

  // Fetch all lecturers' KPI data
  const fetchAllLecturersKpi = async (evaluateId: string | number = '9') => {
    try {
      isLoading.value = true
      error.value = null

      // Ensure we have a Firebase token for authentication
      const firebaseToken = await getFirebaseToken()
      if (!firebaseToken) {
        throw new Error('Please log in to view KPI data')
      }
      authToken.value = firebaseToken

      // Get list of lecturers from backend database (with fallback)
      const lecturers = await fetchLecturersFromBackend()
      
      if (lecturers.length === 0) {
        console.warn('[AdminKPI] No lecturers found')
        error.value = 'No lecturers found. Please ensure lecturers are added to the system.'
        allLecturersKpi.value = []
        return []
      }

      console.log(`[AdminKPI] Found ${lecturers.length} lecturers, fetching KPI data...`)

      // Fetch KPI data for each lecturer in parallel (batch of 10)
      const batchSize = 10
      const allKpiData: LecturerKpiData[] = []
      
      for (let i = 0; i < lecturers.length; i += batchSize) {
        const batch = lecturers.slice(i, i + batchSize)
        const batchPromises = batch.map(l => fetchSingleLecturerKpi(l.staffCode, evaluateId))
        const batchResults = await Promise.all(batchPromises)
        
        for (const result of batchResults) {
          if (result) {
            allKpiData.push(result)
          }
        }
      }

      console.log(`[AdminKPI] Successfully fetched KPI data for ${allKpiData.length} lecturers`)
      allLecturersKpi.value = allKpiData
      return allKpiData

    } catch (err: any) {
      if (err.name === 'AbortError') {
        error.value = 'Request timeout'
      } else {
        error.value = err.message
      }
      allLecturersKpi.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch single lecturer's KPI data by staff code
  const fetchLecturerKpiByStaffCode = async (staffCode: string, evaluateId: string | number = '9') => {
    try {
      isLoading.value = true
      error.value = null

      const firebaseToken = await getFirebaseToken()
      if (!firebaseToken) {
        throw new Error('Please log in to view KPI data')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      // Use query parameters for the proxy endpoint
      const url = `${API_BASE_URL}/get_Percentage?evaluateid=${evaluateId}&staffcode=${staffCode}&lang=en`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (response.ok) {
        const apiResponse = await response.json()
        
        if (apiResponse.code === 200 && apiResponse.data && Array.isArray(apiResponse.data)) {
          const staffData = apiResponse.data.find((item: any) => item.staffcode === staffCode) || apiResponse.data[0]
          
          if (staffData) {
            const totalScore = staffData['Total Score (100%)'] || 0
            
            const transformedData: LecturerKpiData = {
              staffCode: staffData.staffcode || '',
              staffName: staffData.staffname || 'Unknown',
              domainScoreName: staffData.domainscorename || 'Teaching',
              domainWeights: {
                domain1: staffData.domain1weight || 0,
                domain2: staffData.domain2weight || 0,
                domain3: staffData.domain3weight || 0,
                domain4: staffData.domain4weight || 0,
                domain5: staffData.domain5weight || 0
              },
              domainScores: {
                domain1: staffData.domain1score || 0,
                domain2: staffData.domain2score || 0,
                domain3: staffData.domain3score || 0,
                domain4: staffData.domain4score || 0,
                domain5: staffData.domain5score || 0
              },
              domainThresholds: {
                domain1: staffData.domain1threshold || 0,
                domain2: staffData.domain2threshold || 0,
                domain3: staffData.domain3threshold || 0,
                domain4: staffData.domain4threshold || 0,
                domain5: staffData.domain5threshold || 0
              },
              overallPerformance: {
                academicPerformance: staffData['Academic Performance (60%)'] || 0,
                behavior: staffData['Behavior (40%)'] || 0,
                totalScore: totalScore
              },
              performanceLevel: getPerformanceLevel(totalScore)
            }

            selectedLecturerKpi.value = transformedData
            return transformedData
          } else {
            throw new Error('Lecturer not found in response')
          }
        } else {
          throw new Error('Invalid API response format')
        }
      } else {
        throw new Error(`API request failed: ${response.status}`)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        error.value = 'Request timeout'
      } else {
        error.value = err.message
      }
      selectedLecturerKpi.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get statistics summary
  const getKpiStatistics = () => {
    const data = allLecturersKpi.value
    if (!data || data.length === 0) {
      return {
        total: 0,
        excellent: 0,
        good: 0,
        moderate: 0,
        poor: 0,
        veryPoor: 0,
        averageTotalScore: 0
      }
    }

    const stats = {
      total: data.length,
      excellent: data.filter(l => l.performanceLevel === 'Excellent').length,
      good: data.filter(l => l.performanceLevel === 'Good').length,
      moderate: data.filter(l => l.performanceLevel === 'Moderate').length,
      poor: data.filter(l => l.performanceLevel === 'Poor').length,
      veryPoor: data.filter(l => l.performanceLevel === 'Very Poor').length,
      averageTotalScore: data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length
    }

    return stats
  }

  // Filter lecturers by performance level
  const filterByPerformanceLevel = (level: string) => {
    if (level === 'all') {
      return allLecturersKpi.value
    }
    return allLecturersKpi.value.filter(l => l.performanceLevel === level)
  }

  // Search lecturers by name or staff code
  const searchLecturers = (query: string) => {
    if (!query) {
      return allLecturersKpi.value
    }
    const lowerQuery = query.toLowerCase()
    return allLecturersKpi.value.filter(l => 
      l.staffName.toLowerCase().includes(lowerQuery) || 
      l.staffCode.includes(query)
    )
  }

  return {
    allLecturersKpi: readonly(allLecturersKpi),
    selectedLecturerKpi: readonly(selectedLecturerKpi),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchAllLecturersKpi,
    fetchLecturerKpiByStaffCode,
    getKpiStatistics,
    filterByPerformanceLevel,
    searchLecturers,
    getPerformanceLevel
  }
}
