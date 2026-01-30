<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center mb-2">
        <button @click="goBack" class="mr-4 text-gray-600 hover:text-blue-600 focus:outline-none" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Faculty Analytics Dashboard</h1>
      </div>
      <p class="text-gray-600">Faculty Performance Overview</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036E94]"></div>
      <span class="ml-3 text-gray-600">Loading faculty members...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchLecturers" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">Try again</button>
    </div>

    <template v-else>
      <!-- Department Overview Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Department Overview</h2>

        <!-- Performance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <!-- Excellent Card -->
          <div class="bg-yellow-200 rounded-lg p-4 flex items-center">
            <div class="bg-yellow-400 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2L7.5 6H3v2l1.5 4.5L6 14h8l1.5-1.5L17 8V6h-4.5L10 2zM8.5 7L10 4l1.5 3h2v1l-1 3H7.5l-1-3V7h2zm1.5 7a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
                <path d="M6 16h8v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-700">Excellent</div>
              <div class="text-2xl font-bold text-gray-900">{{ performanceStats.excellent }}</div>
            </div>
          </div>

          <!-- Good Card -->
          <div class="bg-green-200 rounded-lg p-4 flex items-center">
            <div class="bg-green-400 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-green-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-700">Good</div>
              <div class="text-2xl font-bold text-gray-900">{{ performanceStats.good }}</div>
            </div>
          </div>

          <!-- Moderate Card -->
          <div class="bg-blue-200 rounded-lg p-4 flex items-center">
            <div class="bg-blue-400 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-700">Moderate</div>
              <div class="text-2xl font-bold text-gray-900">{{ performanceStats.moderate }}</div>
            </div>
          </div>

          <!-- Poor Card -->
          <div class="bg-orange-200 rounded-lg p-4 flex items-center">
            <div class="bg-orange-400 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-orange-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-700">Poor</div>
              <div class="text-2xl font-bold text-gray-900">{{ performanceStats.poor }}</div>
            </div>
          </div>

          <!-- Very Poor Card -->
          <div class="bg-red-200 rounded-lg p-4 flex items-center">
            <div class="bg-red-400 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-700">Very Poor</div>
              <div class="text-2xl font-bold text-gray-900">{{ performanceStats.veryPoor }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Faculty Members Section -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 class="text-3xl font-bold text-gray-900">{{ programName }}</h2>

          <!-- Controls -->
          <div class="flex flex-wrap gap-4 items-center">
            <!-- Search -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input type="text" v-model="searchQuery" placeholder="Search..."
                     class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Year Filter -->
            <div class="relative">
              <select v-model="selectedYear" class="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="2026">Year/ 2026</option>
                <option value="2025">Year/ 2025</option>
                <option value="2024">Year/ 2024</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- Add Member Button -->
            <button @click="openAddMemberModal" class="inline-flex items-center px-4 py-2 bg-[#036E94] text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add member
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredFaculty.length === 0" class="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Faculty Members Found</h3>
          <p class="text-gray-500">{{ searchQuery ? 'Try adjusting your search query.' : 'No lecturers are assigned to this program yet.' }}</p>
        </div>

        <!-- Faculty Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div v-for="faculty in paginatedFaculty" :key="faculty.staff_code"
               class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <!-- Faculty Info -->
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" :class="getAvatarColor(faculty.staff_code)">
                <span class="font-medium text-lg">{{ getInitials(faculty.staff_name) }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ faculty.staff_name }}</h3>
                <p class="text-sm text-gray-500">{{ faculty.position || 'Lecturer' }}</p>
              </div>
            </div>

            <!-- Performance Badge -->
            <div class="mb-4">
              <span :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getPerformanceBadgeClass(faculty.performance || 'Pending')
              ]">
                <div :class="['w-2 h-2 rounded-full mr-2', getPerformanceDotClass(faculty.performance || 'Pending')]"></div>
                {{ faculty.performance || 'Pending' }}
              </span>
            </div>

            <!-- View Details Link -->
            <button 
              @click="navigateToProfile(faculty.staff_code)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View Details
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2">
          <button @click="previousPage" :disabled="currentPage === 1"
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>

          <button v-for="page in displayedPageNumbers" :key="page"
                  @click="currentPage = page"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md',
                    currentPage === page
                      ? 'bg-[#036E94] text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  ]">
            {{ page }}
          </button>

          <button @click="nextPage" :disabled="currentPage === totalPages"
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticatedFetch } from '~/composables/useAuthenticatedFetch';

const router = useRouter();
const { get } = useAuthenticatedFetch();

definePageMeta({
  layout: 'admin'
})

// Configuration for this program
const programName = 'Logistics Management'

const searchQuery = ref('')
const selectedYear = ref('2026')
const currentPage = ref(1)
const itemsPerPage = 6
const isLoading = ref(true)
const error = ref<string | null>(null)
const facultyList = ref<any[]>([])

// Fetch lecturers from API
const fetchLecturers = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const data = await get(`/api/admin/lecturers?program=${encodeURIComponent(programName)}&limit=500`)
    
    if (data.success) {
      facultyList.value = data.data.map((lecturer: any) => ({
        ...lecturer,
        performance: getRandomPerformance()
      }))
    } else {
      throw new Error(data.message || 'Failed to fetch lecturers')
    }
  } catch (err: any) {
    console.error('Error fetching lecturers:', err)
    error.value = err.message || 'Failed to load faculty members. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const getRandomPerformance = () => {
  const performances = ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor']
  const weights = [0.3, 0.3, 0.2, 0.15, 0.05]
  const random = Math.random()
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) return performances[i]
  }
  return 'Moderate'
}

const getInitials = (name: string) => {
  if (!name) return '??'
  const parts = name.split(' ').filter(p => p.length > 0)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getAvatarColor = (staffCode: string) => {
  const colors = [
    'bg-pink-200 text-pink-600',
    'bg-blue-200 text-blue-600',
    'bg-green-200 text-green-600',
    'bg-purple-200 text-purple-600',
    'bg-yellow-200 text-yellow-600',
    'bg-indigo-200 text-indigo-600',
    'bg-red-200 text-red-600',
    'bg-teal-200 text-teal-600'
  ]
  const index = staffCode ? staffCode.charCodeAt(0) % colors.length : 0
  return colors[index]
}

const performanceStats = computed(() => {
  const stats = { excellent: 0, good: 0, moderate: 0, poor: 0, veryPoor: 0 }
  facultyList.value.forEach(faculty => {
    switch (faculty.performance) {
      case 'Excellent': stats.excellent++; break
      case 'Good': stats.good++; break
      case 'Moderate': stats.moderate++; break
      case 'Poor': stats.poor++; break
      case 'Very Poor': stats.veryPoor++; break
    }
  })
  return stats
})

const filteredFaculty = computed(() => {
  return facultyList.value.filter(faculty =>
    faculty.staff_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    faculty.position?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    faculty.staff_code?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredFaculty.value.length / itemsPerPage))

const paginatedFaculty = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFaculty.value.slice(start, end)
})

const displayedPageNumbers = computed(() => {
  const pages: number[] = [];
  const maxVisiblePages = 3;
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage.value - halfVisible);
    let endPage = Math.min(totalPages.value, currentPage.value + halfVisible);
    if (currentPage.value - halfVisible < 1) endPage = Math.min(totalPages.value, maxVisiblePages);
    if (currentPage.value + halfVisible > totalPages.value) startPage = Math.max(1, totalPages.value - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
  }
  return pages;
});

const getPerformanceBadgeClass = (performance: string) => {
  switch (performance) {
    case 'Excellent': return 'bg-yellow-100 text-yellow-800'
    case 'Good': return 'bg-green-100 text-green-800'
    case 'Moderate': return 'bg-blue-100 text-blue-800'
    case 'Poor': return 'bg-orange-100 text-orange-800'
    case 'Very Poor': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPerformanceDotClass = (performance: string) => {
  switch (performance) {
    case 'Excellent': return 'bg-yellow-400'
    case 'Good': return 'bg-green-400'
    case 'Moderate': return 'bg-blue-400'
    case 'Poor': return 'bg-orange-400'
    case 'Very Poor': return 'bg-red-400'
    default: return 'bg-gray-400'
  }
}

const navigateToProfile = (staffCode: string) => {
  navigateTo({ path: '/admin/profile', query: { staffCode } })
}

const openAddMemberModal = () => {
  navigateTo('/admin/users')
}

const goBack = () => {
  router.back();
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchLecturers()
})
</script>
