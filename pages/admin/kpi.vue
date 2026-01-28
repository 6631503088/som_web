<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
          KPI Performance Overview
        </h1>
        <p class="text-sm sm:text-base text-gray-600">View all lecturers' performance metrics</p>
      </div>
      <!-- Evaluation Period Selector -->
      <div class="relative w-full sm:w-48 lg:w-auto">
        <select
          v-model="selectedEvaluationPeriod"
          @change="onEvaluationPeriodChange"
          class="w-full appearance-none bg-white border-0 rounded-lg py-2.5 pl-3 pr-8 shadow-sm ring-2 ring-[#4697b9] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4697b9]"
          :disabled="isLoadingPeriods"
        >
          <option v-if="isLoadingPeriods" disabled>Loading periods...</option>
          <option 
            v-for="period in evaluationPeriods" 
            :key="period.evaluateid" 
            :value="period.evaluateid"
          >
            Round {{ period.evaluatename }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4697b9]"></div>
      <p class="ml-3 text-sm text-gray-600">Loading KPI data...</p>
    </div>

    <!-- Error message -->
    <div v-if="fetchError && !loading" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">API Connection Issue</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ fetchError }}</p>
            <p class="mt-1">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Domain Summary Cards -->
    <div v-if="!loading && displayKpiCategories.length > 0" class="mb-6 sm:mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-600">
          <span v-if="selectedLecturer">{{ selectedLecturer.staffName }}'s KPI Scores</span>
          <span v-else>Average KPI Scores ({{ allLecturersKpi?.length || 0 }} Lecturers)</span>
        </h3>
        <button 
          v-if="selectedLecturer" 
          @click="selectedLecturer = null"
          class="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Show Averages
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          v-for="(category, index) in displayKpiCategories"
          :key="index"
          class="rounded-lg p-4 text-center transition-colors cursor-pointer bg-gradient-to-b from-[#38ADEA] to-[#21739D] text-white"
        >
          <p class="text-sm text-inherit">
            {{ category.name }} ({{ category.weight }}%)
          </p>
          <p class="text-xl font-bold text-inherit">{{ category.score.toFixed(2) }}%</p>
        </div>
      </div>
    </div>

    <!-- Statistics Summary Cards -->
    <div v-if="!loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <!-- Total Lecturers -->
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div class="flex items-center">
          <div class="bg-blue-100 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Total</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.total }}</div>
          </div>
        </div>
      </div>

      <!-- Excellent -->
      <div class="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
        <div class="flex items-center">
          <div class="bg-yellow-200 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2L7.5 6H3v2l1.5 4.5L6 14h8l1.5-1.5L17 8V6h-4.5L10 2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Excellent</div>
            <div class="text-xl font-bold text-yellow-700">{{ statistics.excellent }}</div>
          </div>
        </div>
      </div>

      <!-- Good -->
      <div class="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
        <div class="flex items-center">
          <div class="bg-green-200 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Good</div>
            <div class="text-xl font-bold text-green-700">{{ statistics.good }}</div>
          </div>
        </div>
      </div>

      <!-- Moderate -->
      <div class="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
        <div class="flex items-center">
          <div class="bg-blue-200 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Moderate</div>
            <div class="text-xl font-bold text-blue-700">{{ statistics.moderate }}</div>
          </div>
        </div>
      </div>

      <!-- Poor -->
      <div class="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-200">
        <div class="flex items-center">
          <div class="bg-orange-200 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Poor</div>
            <div class="text-xl font-bold text-orange-700">{{ statistics.poor }}</div>
          </div>
        </div>
      </div>

      <!-- Very Poor -->
      <div class="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
        <div class="flex items-center">
          <div class="bg-red-200 rounded-lg p-2 mr-3">
            <svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <div class="text-xs text-gray-500">Very Poor</div>
            <div class="text-xl font-bold text-red-700">{{ statistics.veryPoor }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div v-if="!loading" class="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by name or staff code..."
            class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <!-- Performance Level Filter -->
        <div class="relative sm:w-48">
          <select 
            v-model="selectedPerformanceLevel"
            class="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Moderate">Moderate</option>
            <option value="Poor">Poor</option>
            <option value="Very Poor">Very Poor</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      <!-- Dynamic Track Chart (Left Column) -->
      <div class="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-gray-100 p-6 sm:p-8">
        <div class="text-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900">
            <span v-if="loading || !selectedLecturer">Select a Lecturer</span>
            <span v-else>{{ selectedLecturer.domainScoreName || 'Performance' }} Track - {{ selectedLecturer.staffName }}</span>
          </h2>
          <p class="text-sm text-gray-500 mt-1">{{ formatDateRange() }}</p>
        </div>
        
        <!-- Chart Container -->
        <div v-if="selectedLecturer" class="relative w-full h-80 mx-auto flex items-center justify-center">
          <canvas ref="performanceChart" class="w-full h-full"></canvas>
        </div>
        
        <!-- Placeholder when no lecturer selected -->
        <div v-else class="flex flex-col items-center justify-center h-80 text-gray-400">
          <svg class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p class="text-lg font-medium">Select a lecturer to view their performance chart</p>
        </div>

        <!-- Legend -->
        <div v-if="selectedLecturer" class="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          <div v-for="(category, index) in kpiCategories" :key="index" class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              :style="{ backgroundColor: category.color }"
            ></div>
            <span class="text-sm font-medium text-gray-700 whitespace-nowrap">
              {{ category.name }} 
            </span>
          </div>
        </div>
      </div>

      <!-- Right Column - Performance Metrics & Lecturer List -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Overall Performance (when lecturer selected) -->
        <div v-if="selectedLecturer" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Overall Performance
          </h2>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Academic Performance (60%)</span>
                <span class="text-sm font-medium text-gray-700">{{ selectedLecturer.overallPerformance.academicPerformance.toFixed(2) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full"
                  :style="{ width: (selectedLecturer.overallPerformance.academicPerformance / 60 * 100) + '%' }"
                ></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Behavior (40%)</span>
                <span class="text-sm font-medium text-gray-700">{{ selectedLecturer.overallPerformance.behavior.toFixed(2) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full"
                  :style="{ width: (selectedLecturer.overallPerformance.behavior / 40 * 100) + '%' }"
                ></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Total Score (100%)</span>
                <span class="text-sm font-medium text-gray-700">{{ selectedLecturer.overallPerformance.totalScore.toFixed(2) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-indigo-600 h-2 rounded-full"
                  :style="{ width: selectedLecturer.overallPerformance.totalScore + '%' }"
                ></div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Performance Level</span>
                <span 
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="getPerformanceBadgeClass(selectedLecturer.performanceLevel)"
                >{{ selectedLecturer.performanceLevel }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Level Legend -->
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Performance Level
          </h2>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">&lt; 55</span>
              <span class="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Very Poor</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">55-64</span>
              <span class="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Poor</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">65-74</span>
              <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Moderate</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">75-84</span>
              <span class="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Good</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-700">85-100</span>
              <span class="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lecturers List -->
    <div v-if="!loading" class="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">Lecturers ({{ filteredLecturers.length }})</h2>
      </div>
      <div class="max-h-[500px] overflow-y-auto">
        <div v-if="filteredLecturers.length === 0" class="p-6 text-center text-gray-500">
          No lecturers found matching your criteria
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          <div 
            v-for="lecturer in paginatedLecturers" 
            :key="lecturer.staffCode"
            @click="selectLecturer(lecturer)"
            class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
            :class="{ 'bg-blue-100 border-blue-400': selectedLecturer?.staffCode === lecturer.staffCode }"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ lecturer.staffName }}</p>
                <p class="text-sm text-gray-500">{{ lecturer.staffCode }}</p>
              </div>
              <div class="ml-2">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getPerformanceBadgeClass(lecturer.performanceLevel)"
                >
                  {{ lecturer.performanceLevel }}
                </span>
              </div>
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-600">
              <span>Total Score: </span>
              <span class="font-semibold ml-1">{{ lecturer.overallPerformance.totalScore.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-200 flex justify-center items-center space-x-2">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Detailed KPI Data Section -->
    <div v-if="!loading && selectedLecturer && lecturerDetailedData" class="mt-8 space-y-6">
      <h2 class="text-xl font-bold text-gray-900">Detailed KPI Data for {{ selectedLecturer.staffName }}</h2>
      
      <!-- Domain 1: Teaching Performance -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#005F99] to-[#00BFFF]">
          <h3 class="text-lg font-semibold text-white">Domain 1: Teaching Performance</h3>
        </div>
        <div class="p-4">
          <!-- Undergraduate Courses -->
          <div v-if="groupedUndergraduateCourses.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ groupedUndergraduateCourses.length }}</span>
              Undergraduate Courses
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Course Code</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Course Name</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Sections</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Total Students</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(course, idx) in groupedUndergraduateCourses" :key="idx" :class="idx % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ idx + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 font-mono">{{ course.coursecode }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ course.coursename }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ course.sections.join(', ') }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 font-medium text-center">{{ course.totalStudents }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Graduate Courses -->
          <div v-if="groupedGraduateCourses.length > 0" class="mb-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ groupedGraduateCourses.length }}</span>
              Graduate Courses
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Course Code</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Course Name</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Sections</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Total Students</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(course, idx) in groupedGraduateCourses" :key="idx" :class="idx % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ idx + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 font-mono">{{ course.coursecode }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ course.coursename }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ course.sections.join(', ') }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 font-medium text-center">{{ course.totalStudents }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="groupedUndergraduateCourses.length === 0 && groupedGraduateCourses.length === 0" class="text-gray-500 text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            No teaching data available for this evaluation period
          </div>
        </div>
      </div>

      <!-- Domain 2: Research Performance -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#00BFFF] to-[#7FD6D6]">
          <h3 class="text-lg font-semibold text-white">Domain 2: Research Performance</h3>
        </div>
        <div class="p-4">
          <!-- Research Studies -->
          <div v-if="lecturerDetailedData.research?.studies?.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.research.studies.length }}</span>
              Research Studies
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Level</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Research Title</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(study, idx) in lecturerDetailedData.research.studies" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ study.level || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ study.researchtitle || study.projectname || study.title || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Research Publications -->
          <div v-if="lecturerDetailedData.research?.publications?.length > 0" class="mb-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-cyan-100 text-cyan-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.research.publications.length }}</span>
              Research Publications
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-white uppercase">Level</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Publication Title</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(pub, idx) in lecturerDetailedData.research.publications" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ pub.level || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ pub.researchtitle || pub.publicationtitle || pub.title || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="!lecturerDetailedData.research?.publications?.length && !lecturerDetailedData.research?.studies?.length" class="text-gray-500 text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            No research data available for this evaluation period
          </div>
        </div>
      </div>

      <!-- Domain 3: Academic Service -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#7FD6D6] to-[#7c3aed]">
          <h3 class="text-lg font-semibold text-white">Domain 3: Academic Service</h3>
        </div>
        <div class="p-4">
          <div v-if="lecturerDetailedData.academicService?.activities?.length > 0">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-violet-100 text-violet-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.academicService.activities.length }}</span>
              Academic Service Activities
            </h4>
            <div class="space-y-3">
              <div v-for="(activity, idx) in lecturerDetailedData.academicService.activities" :key="idx" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ activity.projecttitle || activity.title || 'Untitled Activity' }}</p>
                    <p class="text-sm text-gray-600 mt-1">
                      <span class="font-medium">Budget:</span> {{ activity.budgetlimit ? activity.budgetlimit.toLocaleString() + ' THB' : 'N/A' }}
                    </p>
                  </div>
                  <span :class="activity.profitable === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" class="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    {{ activity.profitable === 0 ? 'Non-revenue' : 'Revenue' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            No academic service data available for this evaluation period
          </div>
        </div>
      </div>

      <!-- Domain 4: Administration -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#7c3aed] to-[#8A8BE6]">
          <h3 class="text-lg font-semibold text-white">Domain 4: Administration</h3>
        </div>
        <div class="p-4">
          <!-- Curricular Committee -->
          <div v-if="lecturerDetailedData.administration?.curricularCommittee?.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.administration.curricularCommittee.length }}</span>
              Curricular Committee
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Committee Name</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(comm, idx) in lecturerDetailedData.administration.curricularCommittee" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ comm.nameofcommittee || comm.committeename || comm.name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- School Committee -->
          <div v-if="lecturerDetailedData.administration?.schoolCommittee?.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.administration.schoolCommittee.length }}</span>
              School Committee
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Committee Name</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(comm, idx) in lecturerDetailedData.administration.schoolCommittee" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ comm.nameofcommittee || comm.committeename || comm.name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- University Committee -->
          <div v-if="lecturerDetailedData.administration?.universityCommittee?.length > 0" class="mb-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-fuchsia-100 text-fuchsia-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.administration.universityCommittee.length }}</span>
              University Committee
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Committee Name</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(comm, idx) in lecturerDetailedData.administration.universityCommittee" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ comm.nameofcommittee || comm.committeename || comm.name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="!lecturerDetailedData.administration?.schoolCommittee?.length && !lecturerDetailedData.administration?.universityCommittee?.length && !lecturerDetailedData.administration?.curricularCommittee?.length" class="text-gray-500 text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            No administration data available for this evaluation period
          </div>
        </div>
      </div>

      <!-- Domain 5: Arts & Culture Conservation -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#8A8BE6] to-[#C084FC]">
          <h3 class="text-lg font-semibold text-white">Domain 5: Arts & Culture Conservation</h3>
        </div>
        <div class="p-4">
          <!-- Self Development -->
          <div v-if="lecturerDetailedData.artsCulture?.selfDevelopment?.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.artsCulture.selfDevelopment.length }}</span>
              Self Development Activities
            </h4>
            <div class="space-y-3">
              <div v-for="(activity, idx) in lecturerDetailedData.artsCulture.selfDevelopment" :key="idx" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="font-medium text-gray-900 mb-2">{{ activity.activity || 'Untitled Activity' }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                  <p><span class="font-medium">Type:</span> {{ activity.typename || '-' }}</p>
                  <p><span class="font-medium">Date:</span> {{ formatActivityDate(activity.startdate) }}</p>
                  <p><span class="font-medium">Venue:</span> {{ activity.venue || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- MFU Arranged Activities -->
          <div v-if="lecturerDetailedData.artsCulture?.mfuArranged?.length > 0" class="mb-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="bg-rose-100 text-rose-800 text-xs font-medium px-2 py-1 rounded mr-2">{{ lecturerDetailedData.artsCulture.mfuArranged.length }}</span>
              MFU Arranged Activities
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-[#046e93]">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">No.</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase">Activity Name</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(activity, idx) in lecturerDetailedData.artsCulture.mfuArranged" :key="idx" :class="Number(idx) % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                    <td class="px-3 py-2 text-sm text-gray-600">{{ Number(idx) + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900">{{ activity.projectname || activity.project_name || activity.activity || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="!lecturerDetailedData.artsCulture?.selfDevelopment?.length && !lecturerDetailedData.artsCulture?.mfuArranged?.length" class="text-gray-500 text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            No arts & culture data available for this evaluation period
          </div>
        </div>
      </div>
    </div>

    <!-- Loading detailed data -->
    <div v-if="loadingDetailedData" class="mt-8 flex justify-center items-center py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#4697b9]"></div>
      <p class="ml-3 text-sm text-gray-600">Loading detailed KPI data...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import { useAdminKpiApi, type LecturerKpiData } from '@/composables/useAdminKpiApi';
import Chart from "chart.js/auto";
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from "vue";

definePageMeta({
  layout: 'admin'
});

// Composables
const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();
const { 
  allLecturersKpi, 
  isLoading: kpiLoading, 
  error: kpiError, 
  fetchAllLecturersKpi,
  getKpiStatistics
} = useAdminKpiApi();

// Runtime config for API
const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBaseUrl || 'https://eport.mfu.ac.th/api/master';
const API_CREDENTIALS = {
  username: runtimeConfig.public.apiUsername || 'sombi',
  password: runtimeConfig.public.apiPassword || 'kTzQmR7pWv9LbYD'
};

// Auth token for detailed API calls
const authToken = ref<string | null>(null);

// State
const selectedEvaluationPeriod = ref<number | null>(null);
const loading = ref(true);
const fetchError = ref<string | null>(null);
const searchQuery = ref('');
const selectedPerformanceLevel = ref('all');
const selectedLecturer = ref<LecturerKpiData | null>(null);
const currentPage = ref(1);
const itemsPerPage = 20;
const loadingDetailedData = ref(false);
const lecturerDetailedData = ref<any>(null);

// Computed properties to group courses by course code
const groupedUndergraduateCourses = computed(() => {
  const courses = lecturerDetailedData.value?.teaching?.undergraduate || [];
  return groupCoursesByCourseCode(courses);
});

const groupedGraduateCourses = computed(() => {
  const courses = lecturerDetailedData.value?.teaching?.graduate || [];
  return groupCoursesByCourseCode(courses);
});

// Helper function to group courses by course code
function groupCoursesByCourseCode(courses: any[]) {
  const grouped: Record<string, { coursecode: string; coursename: string; sections: string[]; totalStudents: number }> = {};
  
  courses.forEach(course => {
    const code = course.coursecode || 'Unknown';
    if (!grouped[code]) {
      grouped[code] = {
        coursecode: code,
        coursename: course.coursename || '-',
        sections: [],
        totalStudents: 0
      };
    }
    if (course.section) {
      grouped[code].sections.push(String(course.section));
    }
    grouped[code].totalStudents += parseInt(course.totalstudent) || 0;
  });
  
  // Sort sections numerically
  Object.values(grouped).forEach(g => {
    g.sections.sort((a, b) => parseInt(a) - parseInt(b));
  });
  
  return Object.values(grouped);
}

// Chart refs
const performanceChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Statistics computed
const statistics = computed(() => {
  return getKpiStatistics();
});

// Filtered lecturers based on search and performance level
const filteredLecturers = computed(() => {
  let result = allLecturersKpi.value || [];
  
  // Filter by performance level
  if (selectedPerformanceLevel.value !== 'all') {
    result = result.filter(l => l.performanceLevel === selectedPerformanceLevel.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(l => 
      l.staffName.toLowerCase().includes(query) || 
      l.staffCode.includes(searchQuery.value)
    );
  }
  
  return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredLecturers.value.length / itemsPerPage));

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLecturers.value.slice(start, end);
});

// KPI categories for selected lecturer
const kpiCategories = computed(() => {
  if (!selectedLecturer.value) return [];
  
  const { domainWeights, domainScores } = selectedLecturer.value;
  
  return [
    { name: 'Teaching', weight: domainWeights.domain1, score: domainScores.domain1, color: '#005F99' },
    { name: 'Research', weight: domainWeights.domain2, score: domainScores.domain2, color: '#00BFFF' },
    { name: 'Academic Service', weight: domainWeights.domain3, score: domainScores.domain3, color: '#7FD6D6' },
    { name: 'Administration', weight: domainWeights.domain4, score: domainScores.domain4, color: '#7c3aed' },
    { name: 'Arts & Culture', weight: domainWeights.domain5, score: domainScores.domain5, color: '#8A8BE6' }
  ];
});

// Average KPI categories across ALL lecturers (for summary cards)
const averageKpiCategories = computed(() => {
  const data = allLecturersKpi.value || [];
  if (data.length === 0) return [];
  
  // Calculate average scores for each domain
  const avgDomain1 = data.reduce((sum, l) => sum + (l.domainScores?.domain1 || 0), 0) / data.length;
  const avgDomain2 = data.reduce((sum, l) => sum + (l.domainScores?.domain2 || 0), 0) / data.length;
  const avgDomain3 = data.reduce((sum, l) => sum + (l.domainScores?.domain3 || 0), 0) / data.length;
  const avgDomain4 = data.reduce((sum, l) => sum + (l.domainScores?.domain4 || 0), 0) / data.length;
  const avgDomain5 = data.reduce((sum, l) => sum + (l.domainScores?.domain5 || 0), 0) / data.length;
  
  // Get weights from first lecturer (should be same for all)
  const weights = data[0]?.domainWeights || { domain1: 60, domain2: 15, domain3: 10, domain4: 5, domain5: 10 };
  
  return [
    { name: 'Teaching', weight: weights.domain1, score: avgDomain1, color: '#005F99' },
    { name: 'Research', weight: weights.domain2, score: avgDomain2, color: '#00BFFF' },
    { name: 'Academic Service', weight: weights.domain3, score: avgDomain3, color: '#7FD6D6' },
    { name: 'Administration', weight: weights.domain4, score: avgDomain4, color: '#7c3aed' },
    { name: 'Arts & Culture', weight: weights.domain5, score: avgDomain5, color: '#8A8BE6' }
  ];
});

// Display KPI categories: individual when lecturer selected, average when not
const displayKpiCategories = computed(() => {
  if (selectedLecturer.value) {
    return kpiCategories.value;
  }
  return averageKpiCategories.value;
});

// Format date range for selected evaluation period
const formatDateRange = () => {
  if (isLoadingPeriods.value) {
    return 'Loading...';
  }
  
  if (!selectedEvaluationPeriod.value || !evaluationPeriods.value) {
    return 'No period selected';
  }
  
  const selectedPeriod = evaluationPeriods.value.find(p => p.evaluateid === selectedEvaluationPeriod.value);
  if (!selectedPeriod) {
    return 'Period not found';
  }
  
  const startDate = new Date(selectedPeriod.evaluatestartdate).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const endDate = new Date(selectedPeriod.evaluateenddate).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  return startDate + '-' + endDate;
};

// Helper functions
const getPerformanceBadgeClass = (level: string) => {
  switch (level) {
    case 'Excellent': return 'bg-yellow-100 text-yellow-800';
    case 'Good': return 'bg-green-100 text-green-800';
    case 'Moderate': return 'bg-blue-100 text-blue-800';
    case 'Poor': return 'bg-orange-100 text-orange-800';
    case 'Very Poor': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Login to MFU API
const login = async (): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(API_BASE_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(API_CREDENTIALS),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      authToken.value = data.token || data.access_token || data.bearer_token;
      return authToken.value;
    } else {
      throw new Error('Authentication failed: ' + response.status);
    }
  } catch (err: any) {
    console.error('[Admin KPI] Login error:', err);
    return null;
  }
};

// Format activity date helper
const formatActivityDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Fetch detailed data for a specific lecturer
const fetchDetailedData = async (staffCode: string, evaluateId: number) => {
  try {
    loadingDetailedData.value = true;
    
    if (!authToken.value) {
      await login();
    }
    
    if (!authToken.value) {
      throw new Error('Failed to authenticate');
    }

    const headers: Record<string, string> = {
      'Authorization': 'Bearer ' + authToken.value,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': evaluateId.toString(),
      'lang': 'en',
      'staffcode': staffCode
    };

    // Fetch multiple endpoints in parallel - all 5 domains
    const [
      // Domain 1: Teaching
      undergraduateRes,
      graduateRes,
      // Domain 2: Research
      researchPubRes,
      researchStudiesRes,
      // Domain 3: Academic Service
      academicServiceRes,
      // Domain 4: Administration
      schoolCommitteeRes,
      universityCommitteeRes,
      curricularCommitteeRes,
      // Domain 5: Arts & Culture
      selfDevelopmentRes,
      mfuArrangedRes
    ] = await Promise.all([
      // Teaching
      fetch(API_BASE_URL + '/get_Undergraduate', { method: 'GET', headers }).catch(() => null),
      fetch(API_BASE_URL + '/get_Graduate', { method: 'GET', headers }).catch(() => null),
      // Research
      fetch(API_BASE_URL + '/get_ResearchPublication', { method: 'GET', headers }).catch(() => null),
      fetch(API_BASE_URL + '/get_ResearchStudies', { method: 'GET', headers }).catch(() => null),
      // Academic Service
      fetch(API_BASE_URL + '/get_AcademicServiceActivities', { method: 'GET', headers }).catch(() => null),
      // Administration
      fetch(API_BASE_URL + '/get_SchoolCommittee', { method: 'GET', headers }).catch(() => null),
      fetch(API_BASE_URL + '/get_UniversityCommitteeorCommitteeAppointedWorkingGroupRawscore', { method: 'GET', headers }).catch(() => null),
      fetch(API_BASE_URL + '/get_CurricularCommittee', { method: 'GET', headers }).catch(() => null),
      // Arts & Culture
      fetch(API_BASE_URL + '/get_Selfdevelopment', { method: 'GET', headers }).catch(() => null),
      fetch(API_BASE_URL + '/get_MFUarrangedactivities', { method: 'GET', headers }).catch(() => null)
    ]);

    const parseResponse = async (res: Response | null) => {
      if (!res || !res.ok) return null;
      try {
        const data = await res.json();
        return data.code === 200 ? data.data : null;
      } catch {
        return null;
      }
    };

    const [
      undergraduate, graduate,
      publications, studies,
      academicService,
      schoolCommittee, universityCommittee, curricularCommittee,
      selfDevelopment, mfuArranged
    ] = await Promise.all([
      parseResponse(undergraduateRes),
      parseResponse(graduateRes),
      parseResponse(researchPubRes),
      parseResponse(researchStudiesRes),
      parseResponse(academicServiceRes),
      parseResponse(schoolCommitteeRes),
      parseResponse(universityCommitteeRes),
      parseResponse(curricularCommitteeRes),
      parseResponse(selfDevelopmentRes),
      parseResponse(mfuArrangedRes)
    ]);

    lecturerDetailedData.value = {
      teaching: {
        undergraduate: Array.isArray(undergraduate) ? undergraduate : [],
        graduate: Array.isArray(graduate) ? graduate : []
      },
      research: {
        publications: Array.isArray(publications) ? publications : [],
        studies: Array.isArray(studies) ? studies : []
      },
      academicService: {
        activities: Array.isArray(academicService) ? academicService : []
      },
      administration: {
        schoolCommittee: Array.isArray(schoolCommittee) ? schoolCommittee : [],
        universityCommittee: Array.isArray(universityCommittee) ? universityCommittee : [],
        curricularCommittee: Array.isArray(curricularCommittee) ? curricularCommittee : []
      },
      artsCulture: {
        selfDevelopment: Array.isArray(selfDevelopment) ? selfDevelopment : [],
        mfuArranged: Array.isArray(mfuArranged) ? mfuArranged : []
      }
    };

    console.log('[Admin KPI] Detailed data loaded:', lecturerDetailedData.value);

  } catch (err) {
    console.error('[Admin KPI] Error fetching detailed data:', err);
    lecturerDetailedData.value = null;
  } finally {
    loadingDetailedData.value = false;
  }
};

const selectLecturer = async (lecturer: LecturerKpiData) => {
  selectedLecturer.value = lecturer;
  lecturerDetailedData.value = null;
  
  nextTick(() => {
    renderChart();
  });

  // Fetch detailed data for the selected lecturer
  const evalId = selectedEvaluationPeriod.value || activeEvaluationPeriod.value?.evaluateid || 9;
  await fetchDetailedData(lecturer.staffCode, evalId);
};

// Chart rendering (same style as lecturer page)
const renderChart = () => {
  if (!performanceChart.value || !selectedLecturer.value) return;
  if (chartInstance) chartInstance.destroy();

  const ctx = performanceChart.value.getContext('2d');
  if (!ctx) return;

  const categories = kpiCategories.value;
  const ringThickness = 60;
  const ringSpacing = -60;

  const datasets = categories.map((cat, index) => {
    const outerRadius = 100 - (index * (ringThickness + ringSpacing));
    const innerRadius = outerRadius - ringThickness;
    
    const softGrey = '#E5E7EB';
    const actualValue = cat.score || 0;
    const maxWeight = cat.weight || 0;
    const remainingValue = Math.max(0.1, maxWeight - actualValue);

    return {
      data: [actualValue, remainingValue],
      backgroundColor: [cat.color, softGrey],
      cutout: innerRadius + '%',
      radius: outerRadius + '%',
      borderWidth: 2,
      borderRadius: [14, 14],
      rotation: -90,
      circumference: 360,
    };
  });

  chartInstance = new Chart(performanceChart.value, {
    type: 'doughnut',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (function(categoriesSnapshot) {
              return function (context: any) {
                const idx = context.datasetIndex;
                const cat = categoriesSnapshot[idx];
                if (!cat) return '';
                if (context.dataIndex === 0) {
                  return cat.name + ': ' + cat.score.toFixed(2) + '% (' + cat.weight + '%)';
                } else {
                  const remaining = cat.weight - cat.score;
                  return 'Remaining: ' + remaining.toFixed(2) + '%';
                }
              }
            })(categories),
          },
        },
      },
    },
    plugins: [
      {
        id: 'centerText',
        beforeDraw(chart: any) {
          const ctx = chart.ctx;
          const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
          const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

          ctx.save();
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = '#1f2937';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Academic', centerX, centerY - 10);
          ctx.fillText('Performance', centerX, centerY + 10);
          ctx.restore();
        },
      },
    ],
  });
};

// Data loading
const loadData = async () => {
  try {
    loading.value = true;
    fetchError.value = null;
    
    const evalId = selectedEvaluationPeriod.value || activeEvaluationPeriod.value?.evaluateid || 9;
    console.log('[Admin KPI] Loading data for evaluation period:', evalId);
    
    await fetchAllLecturersKpi(evalId);
    
    if (kpiError.value) {
      throw new Error(kpiError.value);
    }
    
    console.log('[Admin KPI] Loaded', allLecturersKpi.value?.length || 0, 'lecturers');
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Admin KPI] Error:', errorMessage);
    fetchError.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

const onEvaluationPeriodChange = async () => {
  selectedLecturer.value = null;
  lecturerDetailedData.value = null;
  currentPage.value = 1;
  await loadData();
};

// Reset page when filters change
watch([searchQuery, selectedPerformanceLevel], () => {
  currentPage.value = 1;
});

// Watch selected lecturer to re-render chart
watch(selectedLecturer, () => {
  if (selectedLecturer.value) {
    nextTick(() => {
      renderChart();
    });
  }
});

// Initialize
onMounted(async () => {
  try {
    // Wait for Firebase auth to be ready
    let attempts = 0;
    while (!user.value && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts++;
    }
    
    if (!user.value) {
      fetchError.value = 'Please log in to view KPI data';
      loading.value = false;
      return;
    }
    
    await fetchEvaluationPeriods();
    
    if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
      selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
    }
    
    await loadData();
    
    // Login to API for detailed data fetching
    await login();
    
    // Unregister datalabels plugin if present
    if (Chart.registry) {
      const datalabelsPlugin = Chart.registry.plugins.get('datalabels');
      if (datalabelsPlugin) {
        Chart.unregister(datalabelsPlugin);
      }
    }
  } catch (error) {
    console.error('[Admin KPI] Initialization error:', error);
    loading.value = false;
  }
});

// Cleanup
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
