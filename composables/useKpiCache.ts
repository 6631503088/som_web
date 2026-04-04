/**
 * Global KPI Cache Store with LocalStorage Persistence
 * 
 * This composable provides a persistent cache for KPI data that:
 * 1. Preloads data when admin logs in (triggered from admin layout)
 * 2. Persists data in localStorage so it survives page navigation
 * 3. Provides instant KPI display when navigating to KPI page
 * 
 * Usage:
 * - In admin layout: call preloadKpiData() on mount
 * - In KPI page: use getCachedKpiData() for instant display
 */

import { ref, readonly } from 'vue'
import type { LecturerKpiData } from './useAdminKpiApi'
import { useFirebaseAuth } from './useFirebaseAuth'
import { useEvaluationPeriods } from './useEvaluationPeriods'

// localStorage keys
const CACHE_KEY = 'kpi_cache_data'
const CACHE_META_KEY = 'kpi_cache_meta'

// Cache validity duration (15 minutes - longer for better UX)
const CACHE_VALIDITY_MS = 15 * 60 * 1000

interface CacheMeta {
  evaluationPeriodId: number
  timestamp: number
}

// Global state (shared across all component instances)
const cachedKpiData = ref<LecturerKpiData[]>([])
const cachedEvaluationPeriodId = ref<number | null>(null)
const isPreloading = ref(false)
const preloadError = ref<string | null>(null)
const lastPreloadTime = ref<number | null>(null)
const isInitialized = ref(false)
const preloadPromise = ref<Promise<void> | null>(null)

export const useKpiCache = () => {
  const { user } = useFirebaseAuth()
  const { evaluationPeriods, activeEvaluationPeriod, fetchEvaluationPeriods } = useEvaluationPeriods()

  const runtimeConfig = useRuntimeConfig()
  const BACKEND_URL = runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app'
  const API_BASE_URL = `${BACKEND_URL}/api/mfu`

  /**
   * Initialize cache from localStorage (call on app start)
   * Optimized for immediate synchronous loading
   */
  const initializeFromStorage = () => {
    if (isInitialized.value || typeof window === 'undefined') return
    
    try {
      const startTime = performance.now()
      const metaStr = localStorage.getItem(CACHE_META_KEY)
      const dataStr = localStorage.getItem(CACHE_KEY)
      
      if (metaStr && dataStr) {
        const meta: CacheMeta = JSON.parse(metaStr)
        const now = Date.now()
        const cacheAge = now - meta.timestamp
        
        // Check if cache is still valid
        if (cacheAge < CACHE_VALIDITY_MS) {
          const data: LecturerKpiData[] = JSON.parse(dataStr)
          cachedKpiData.value = data
          cachedEvaluationPeriodId.value = meta.evaluationPeriodId
          lastPreloadTime.value = meta.timestamp
          const loadTime = (performance.now() - startTime).toFixed(1)
          console.log(`[KpiCache] ⚡ Loaded ${data.length} lecturers from cache in ${loadTime}ms (age: ${Math.round(cacheAge/1000)}s)`)
        } else {
          console.log(`[KpiCache] Cache expired (age: ${Math.round(cacheAge/1000)}s), will refresh`)
          clearStorageCache()
        }
      } else {
        console.log('[KpiCache] No cached data found')
      }
    } catch (err) {
      console.warn('[KpiCache] Error loading from localStorage:', err)
      clearStorageCache()
    }
    
    isInitialized.value = true
  }

  /**
   * Save cache to localStorage
   */
  const saveToStorage = (data: LecturerKpiData[], evaluationPeriodId: number) => {
    if (typeof window === 'undefined') return
    
    try {
      const meta: CacheMeta = {
        evaluationPeriodId,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta))
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      console.log(`[KpiCache] Saved ${data.length} lecturers to localStorage`)
    } catch (err) {
      console.warn('[KpiCache] Error saving to localStorage:', err)
    }
  }

  /**
   * Clear localStorage cache
   */
  const clearStorageCache = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_META_KEY)
    } catch (err) {
      console.warn('[KpiCache] Error clearing localStorage:', err)
    }
  }

  // Get Firebase ID token
  const getFirebaseToken = async (): Promise<string | null> => {
    let attempts = 0
    while (!user.value && attempts < 12) {
      await new Promise(resolve => setTimeout(resolve, 250))
      attempts++
    }
    
    if (!user.value) {
      console.warn('[KpiCache] No user available for token')
      return null
    }
    
    try {
      const token = await user.value.getIdToken()
      return token
    } catch (err) {
      console.error('[KpiCache] Error getting Firebase token:', err)
      return null
    }
  }

  // Determine performance level based on total score
  const getPerformanceLevel = (totalScore: number): string => {
    if (totalScore >= 85) return 'Excellent'
    if (totalScore >= 75) return 'Good'
    if (totalScore >= 65) return 'Moderate'
    if (totalScore >= 55) return 'Poor'
    return 'Very Poor'
  }

  // Fetch lecturers from backend (with program info)
  const fetchLecturersFromBackend = async (firebaseToken: string): Promise<{staffCode: string, staffName: string, program?: string, programId?: number}[]> => {
    try {
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
            staffName: l.staff_name,
            program: l.program || undefined,
            programId: l.program_id || undefined
          }))
        }
      }
      
      return getFallbackStaffList()
    } catch (err) {
      console.error('[KpiCache] Error fetching lecturers:', err)
      return getFallbackStaffList()
    }
  }

  // Fetch programs list for code mapping
  const fetchProgramsFromBackend = async (firebaseToken: string): Promise<Map<number, string>> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/programs?active_only=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          const map = new Map<number, string>()
          data.data.forEach((p: any) => map.set(p.program_id, p.program_code))
          return map
        }
      }
      return new Map()
    } catch (err) {
      console.error('[KpiCache] Error fetching programs:', err)
      return new Map()
    }
  }

  // Fallback staff list
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

  // Fetch KPI data for a single lecturer
  const fetchSingleLecturerKpi = async (staffCode: string, evaluateId: number, firebaseToken: string): Promise<LecturerKpiData | null> => {
    try {
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
      console.error(`[KpiCache] Error fetching KPI for ${staffCode}:`, err)
      return null
    }
  }

  /**
   * Check if cache is valid
   * If evaluationPeriodId is provided, checks for exact match
   * If not provided or null/undefined, returns true if ANY valid cache exists
   */
  const isCacheValid = (evaluationPeriodId?: number | null): boolean => {
    // Initialize from storage if not done yet
    if (!isInitialized.value && typeof window !== 'undefined') {
      initializeFromStorage()
    }
    
    if (!lastPreloadTime.value || cachedKpiData.value.length === 0) {
      console.log('[KpiCache] isCacheValid: NO - no data or timestamp')
      return false
    }
    
    const now = Date.now()
    const cacheAge = now - lastPreloadTime.value
    const isTimeValid = cacheAge < CACHE_VALIDITY_MS
    
    // If no specific period requested, any valid cache is good
    // If specific period requested, check for match
    const isPeriodMatch = evaluationPeriodId === undefined || 
                          evaluationPeriodId === null || 
                          evaluationPeriodId === cachedEvaluationPeriodId.value
    
    const isValid = isTimeValid && isPeriodMatch
    
    if (!isValid) {
      console.log(`[KpiCache] isCacheValid: NO - timeValid=${isTimeValid} (age=${Math.round(cacheAge/1000)}s), periodMatch=${isPeriodMatch} (cached=${cachedEvaluationPeriodId.value}, requested=${evaluationPeriodId})`)
    }
    
    return isValid
  }

  /**
   * Preload KPI data in the background
   * Called from admin layout when admin logs in
   * Returns existing promise if already preloading to prevent duplicate fetches
   */
  const preloadKpiData = async (evaluationPeriodId?: number): Promise<void> => {
    // Initialize from storage first
    if (!isInitialized.value && typeof window !== 'undefined') {
      initializeFromStorage()
    }
    
    // Skip if cache is still valid
    if (isCacheValid(evaluationPeriodId)) {
      console.log('[KpiCache] ✅ Cache is valid, skipping preload')
      return
    }
    
    // Return existing promise if already preloading (prevents duplicate requests)
    if (isPreloading.value && preloadPromise.value) {
      console.log('[KpiCache] ⏳ Already preloading, returning existing promise...')
      return preloadPromise.value
    }

    // Create and track the promise
    const doPreload = async () => {
      try {
        isPreloading.value = true
        preloadError.value = null
        const startTime = performance.now()
        console.log('[KpiCache] 🚀 Starting KPI preload...')

        // Get Firebase token
        const firebaseToken = await getFirebaseToken()
        if (!firebaseToken) {
          preloadError.value = 'No authentication token available'
          return
        }

        // Fetch evaluation periods if needed
        if (evaluationPeriods.value.length === 0) {
          await fetchEvaluationPeriods()
        }

        // Determine evaluation period ID
        const evalId = evaluationPeriodId || activeEvaluationPeriod.value?.evaluateid || 9

        // Get list of lecturers and programs
        const [lecturers, programMap] = await Promise.all([
          fetchLecturersFromBackend(firebaseToken),
          fetchProgramsFromBackend(firebaseToken)
        ])
        console.log(`[KpiCache] Found ${lecturers.length} lecturers (${programMap.size} programs), fetching KPI data...`)

        // Build lecturer -> program lookup
        const lecturerProgramMap = new Map<string, { program?: string, programCode?: string, programId?: number }>()
        lecturers.forEach(l => {
          const programCode = l.programId ? programMap.get(l.programId) : undefined
          lecturerProgramMap.set(l.staffCode, {
            program: l.program,
            programCode: programCode,
            programId: l.programId
          })
        })

      // Fetch KPI data in parallel batches
      const batchSize = 10
      const allKpiData: LecturerKpiData[] = []
      
      for (let i = 0; i < lecturers.length; i += batchSize) {
        const batch = lecturers.slice(i, i + batchSize)
        const batchPromises = batch.map(l => fetchSingleLecturerKpi(l.staffCode, evalId, firebaseToken))
        const batchResults = await Promise.all(batchPromises)
        
        for (const result of batchResults) {
          if (result) {
            // Enrich KPI with program info
            const programInfo = lecturerProgramMap.get(result.staffCode)
            if (programInfo) {
              result.program = programInfo.program
              result.programCode = programInfo.programCode
              result.programId = programInfo.programId
            }
            allKpiData.push(result)
          }
        }
      }

        // Update memory cache
        cachedKpiData.value = allKpiData
        cachedEvaluationPeriodId.value = evalId
        lastPreloadTime.value = Date.now()
        
        // Save to localStorage for persistence across navigation
        saveToStorage(allKpiData, evalId)
        
        const loadTime = ((performance.now() - startTime) / 1000).toFixed(1)
        console.log(`[KpiCache] ✅ Preload complete! Cached ${allKpiData.length} lecturers in ${loadTime}s`)

      } catch (err: any) {
        preloadError.value = err.message || 'Failed to preload KPI data'
        console.error('[KpiCache] ❌ Preload error:', err)
      } finally {
        isPreloading.value = false
        preloadPromise.value = null
      }
    }
    
    preloadPromise.value = doPreload()
    return preloadPromise.value
  }

  /**
   * Get cached KPI data
   * Returns cached data if available and valid
   */
  const getCachedKpiData = (evaluationPeriodId?: number | null): LecturerKpiData[] => {
    // Initialize from storage if not done yet
    if (!isInitialized.value && typeof window !== 'undefined') {
      initializeFromStorage()
    }
    
    if (isCacheValid(evaluationPeriodId)) {
      return cachedKpiData.value
    }
    return []
  }

  /**
   * Check if data is available in cache
   * Returns true if valid cached data exists
   */
  const hasCachedData = (evaluationPeriodId?: number | null): boolean => {
    // Initialize from storage if not done yet
    if (!isInitialized.value && typeof window !== 'undefined') {
      initializeFromStorage()
    }
    
    const hasData = cachedKpiData.value.length > 0
    const isValid = isCacheValid(evaluationPeriodId)
    
    console.log(`[KpiCache] hasCachedData: hasData=${hasData}, isValid=${isValid}, count=${cachedKpiData.value.length}`)
    
    return isValid && hasData
  }

  /**
   * Clear the cache (memory and localStorage)
   */
  const clearCache = (): void => {
    cachedKpiData.value = []
    cachedEvaluationPeriodId.value = null
    lastPreloadTime.value = null
    preloadError.value = null
    clearStorageCache()
    console.log('[KpiCache] Cache cleared')
  }

  /**
   * Force refresh the cache
   */
  const refreshCache = async (evaluationPeriodId?: number): Promise<void> => {
    clearCache()
    await preloadKpiData(evaluationPeriodId)
  }

  /**
   * Get KPI statistics from cached data
   */
  const getCachedStatistics = () => {
    const data = cachedKpiData.value
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

    return {
      total: data.length,
      excellent: data.filter(l => l.performanceLevel === 'Excellent').length,
      good: data.filter(l => l.performanceLevel === 'Good').length,
      moderate: data.filter(l => l.performanceLevel === 'Moderate').length,
      poor: data.filter(l => l.performanceLevel === 'Poor').length,
      veryPoor: data.filter(l => l.performanceLevel === 'Very Poor').length,
      averageTotalScore: data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length
    }
  }

  return {
    // State (readonly)
    cachedKpiData: readonly(cachedKpiData),
    cachedEvaluationPeriodId: readonly(cachedEvaluationPeriodId),
    isPreloading: readonly(isPreloading),
    preloadError: readonly(preloadError),
    lastPreloadTime: readonly(lastPreloadTime),
    
    // Methods
    initializeFromStorage,
    preloadKpiData,
    getCachedKpiData,
    hasCachedData,
    isCacheValid,
    clearCache,
    refreshCache,
    getCachedStatistics
  }
}
