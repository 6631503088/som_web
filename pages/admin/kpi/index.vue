<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
          Performance Analytics
        </h1>
        <p class="text-sm text-gray-600">
          View all lecturers' performance metrics
          <span v-if="!loading && combinedKpiData.length > 0 && hasCachedData(selectedEvaluationPeriod)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Instant Load
          </span>
        </p>
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

    <!-- Skeleton Loading UI -->
    <div v-if="loading && !hasCachedData(selectedEvaluationPeriod)" class="space-y-6">
      <!-- Combined KPI Overview Skeleton -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <!-- Header Skeleton -->
        <div class="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] px-6 py-4">
          <div class="h-7 w-64 bg-white/20 rounded animate-pulse"></div>
          <div class="h-4 w-24 bg-white/10 rounded mt-2 animate-pulse"></div>
        </div>
        <!-- Content Skeleton matching 3-row layout -->
        <div class="p-6 space-y-6">
          <!-- ROW 1: Three metric cards -->
          <div>
            <div class="h-4 w-36 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-blue-50 rounded-lg p-3 text-center animate-pulse">
                <div class="h-7 w-16 bg-blue-200 rounded mx-auto mb-1"></div>
                <div class="h-3 w-14 bg-blue-100 rounded mx-auto"></div>
              </div>
              <div class="bg-emerald-50 rounded-lg p-3 text-center animate-pulse">
                <div class="h-7 w-16 bg-emerald-200 rounded mx-auto mb-1"></div>
                <div class="h-3 w-20 bg-emerald-100 rounded mx-auto"></div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3 text-center animate-pulse">
                <div class="h-7 w-16 bg-purple-200 rounded mx-auto mb-1"></div>
                <div class="h-3 w-20 bg-purple-100 rounded mx-auto"></div>
              </div>
            </div>
          </div>
          <!-- ROW 2+3: 2×2 grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Top-left: Pie chart skeleton -->
            <div class="bg-gray-50/60 rounded-lg p-4 animate-pulse">
              <div class="h-4 w-32 bg-gray-200 rounded mb-1"></div>
              <div class="h-3 w-40 bg-gray-100 rounded mb-3"></div>
              <div class="flex items-center gap-5">
                <div class="w-36 h-36 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="flex-1 space-y-3">
                  <div v-for="i in 4" :key="'s1-'+i" class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                      <div class="w-20 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div class="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Top-right: Pie chart skeleton -->
            <div class="bg-gray-50/60 rounded-lg p-4 animate-pulse">
              <div class="h-4 w-32 bg-gray-200 rounded mb-1"></div>
              <div class="h-3 w-48 bg-gray-100 rounded mb-3"></div>
              <div class="flex items-center gap-5">
                <div class="w-36 h-36 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="flex-1 space-y-3">
                  <div v-for="i in 5" :key="'s2-'+i" class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                      <div class="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div class="w-6 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Bottom-left: Bar chart skeleton -->
            <div class="bg-gray-50/60 rounded-lg p-4 animate-pulse">
              <div class="h-4 w-36 bg-gray-200 rounded mb-3"></div>
              <div class="space-y-3">
                <div v-for="i in 4" :key="'s3-'+i">
                  <div class="flex items-center justify-between mb-1">
                    <div class="w-28 h-3 bg-gray-200 rounded"></div>
                    <div class="w-10 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div class="h-2.5 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Search/Filter Skeleton (4 controls) -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          <div class="sm:w-40 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          <div class="sm:w-40 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          <div class="sm:w-44 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <!-- Table Skeleton -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="border-b border-gray-200">
          <div class="flex bg-gray-50 px-4 py-3">
            <div class="w-1/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-1/6 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
            <div class="w-1/6 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
            <div class="w-1/6 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
            <div class="w-1/6 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
            <div class="w-1/6 h-4 bg-gray-200 rounded animate-pulse ml-4"></div>
          </div>
        </div>
        <div class="divide-y divide-gray-100">
          <div v-for="i in 5" :key="'tbl-'+i" class="flex items-center px-4 py-4 animate-pulse">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="ml-3 flex-1">
              <div class="h-4 w-32 bg-gray-200 rounded mb-1"></div>
              <div class="h-3 w-20 bg-gray-100 rounded"></div>
            </div>
            <div class="w-20 h-5 bg-gray-200 rounded-full ml-4"></div>
            <div class="w-14 h-5 bg-gray-200 rounded ml-4"></div>
            <div class="w-16 h-5 bg-gray-200 rounded-full ml-4"></div>
            <div class="w-14 h-4 bg-gray-200 rounded ml-4"></div>
            <div class="w-14 h-4 bg-gray-200 rounded ml-4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background preload indicator -->
    <div v-if="cachePreloading && !loading" class="mb-4 flex items-center text-xs text-gray-500">
      <div class="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-2"></div>
      Updating data in background...
    </div>

    <!-- Error message -->
    <div v-if="fetchError && !loading" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">API Connection Issue</h3>
          <p class="mt-1 text-sm text-yellow-700">{{ fetchError }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content when loaded -->
    <div v-if="!loading || hasCachedData(selectedEvaluationPeriod)">
      <!-- Combined KPI Overview Card -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
        <!-- Blue Header -->
        <div class="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] px-6 py-4">
          <h2 class="text-xl font-bold text-white">Performance Analytics Overview</h2>
          <p class="text-white/70 text-sm">{{ combinedKpiData?.length || 0 }} lecturers</p>
        </div>
        
        <!-- Content -->
        <div class="p-6 space-y-6">
          
          <!-- ═══════ ROW 1: OVERALL PERFORMANCE (Full Width) ═══════ -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Overall Performance</h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-blue-700">{{ trackSafeAggregates.avgTotal.toFixed(1) }}%</p>
                <p class="text-xs text-blue-600 font-medium">Avg Total</p>
              </div>
              <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-emerald-700">{{ trackSafeAggregates.avgAcademic.toFixed(1) }}%</p>
                <p class="text-xs text-emerald-600 font-medium">Academic (60%)</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-purple-700">{{ trackSafeAggregates.avgBehavior.toFixed(1) }}%</p>
                <p class="text-xs text-purple-600 font-medium">Behavior (40%)</p>
              </div>
            </div>
          </div>

          <!-- ═══════ ROW 2+3: 2×2 GRID LAYOUT ═══════ -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            <!-- TOP-LEFT: Track Distribution Pie -->
            <div class="bg-gray-50/60 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Track Distribution</h3>
              <p class="text-[10px] text-gray-400 mb-3">{{ combinedKpiData.length }} lecturers across {{ trackSafeAggregates.trackGroups.length }} tracks</p>
              
              <div class="flex items-center gap-5">
                <!-- Pie Chart (larger) -->
                <div class="flex-shrink-0">
                  <div class="w-36 h-36">
                    <canvas ref="trackDistributionChart"></canvas>
                  </div>
                </div>
                <!-- Legend (tighter) -->
                <div class="flex-1 space-y-2">
                  <div v-for="(track, idx) in trackSafeAggregates.trackGroups" :key="'dist-legend-' + idx" class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: track.color }"></span>
                      <span class="text-xs text-gray-700 truncate">{{ track.name }}</span>
                    </div>
                    <span class="text-xs font-bold text-gray-800 ml-2 flex-shrink-0">{{ track.count }} <span class="font-normal text-gray-400">({{ (track.count / combinedKpiData.length * 100).toFixed(0) }}%)</span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- TOP-RIGHT: Performance Levels Pie -->
            <div class="bg-gray-50/60 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Performance Levels</h3>
              <p class="text-[10px] text-gray-400 mb-3">Distribution by KPI score thresholds</p>
              
              <div class="flex items-center gap-5">
                <!-- Pie Chart (larger) -->
                <div class="flex-shrink-0">
                  <div class="w-36 h-36">
                    <canvas ref="performanceDistributionChart"></canvas>
                  </div>
                </div>
                <!-- Legend (tighter) -->
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span class="text-xs text-gray-700">Excellent</span>
                    </div>
                    <span class="text-xs font-bold text-yellow-600">{{ performanceLevelCounts.Excellent || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                      <span class="text-xs text-gray-700">Good</span>
                    </div>
                    <span class="text-xs font-bold text-emerald-600">{{ performanceLevelCounts.Good || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-blue-400"></span>
                      <span class="text-xs text-gray-700">Moderate</span>
                    </div>
                    <span class="text-xs font-bold text-blue-600">{{ performanceLevelCounts.Moderate || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-orange-400"></span>
                      <span class="text-xs text-gray-700">Poor</span>
                    </div>
                    <span class="text-xs font-bold text-orange-600">{{ performanceLevelCounts.Poor || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-red-400"></span>
                      <span class="text-xs text-gray-700">Very Poor</span>
                    </div>
                    <span class="text-xs font-bold text-red-600">{{ performanceLevelCounts['Very Poor'] || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOTTOM-LEFT: Average KPI Score -->
            <div class="bg-gray-50/60 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Average KPI Score</h3>
              
              <div class="space-y-3">
                <div v-for="(track, idx) in trackSafeAggregates.trackGroups" :key="'perf-' + idx" class="relative">
                  <!-- Single line: Track name + count + score -->
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: track.color }"></span>
                      <span class="text-xs font-semibold text-gray-800 truncate">{{ track.name }}</span>
                      <span class="text-[10px] text-gray-400 flex-shrink-0">({{ track.count }} / {{ combinedKpiData.length }} lecturers)</span>
                    </div>
                    <span class="text-sm font-bold flex-shrink-0 ml-2" :style="{ color: track.color }">{{ track.avgScore.toFixed(1) }}%</span>
                  </div>
                  <!-- Performance bar (clean, no scratch) -->
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden ml-4">
                    <div 
                      class="h-2 rounded-full transition-all duration-700 ease-out"
                      :style="{ width: Math.min(track.avgScore, 100) + '%', backgroundColor: track.color }"
                    ></div>
                  </div>
                </div>
                <!-- Footer: Overall average info -->
                <div class="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-200 ml-4">
                  <span class="text-[10px] text-gray-400">Overall Avg: <span class="font-semibold text-gray-500">{{ trackSafeAggregates.avgTotal.toFixed(1) }}%</span> (all {{ combinedKpiData.length }} lecturers)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>


      <!-- Search and Filter Controls -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
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
              class="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4697b9] focus:border-transparent bg-gray-50"
            >
          </div>

          <!-- Track Filter -->
          <div class="relative sm:w-44">
            <select 
              v-model="selectedTrack"
              class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4697b9] focus:border-transparent text-sm"
            >
              <option value="all">All Tracks</option>
              <option v-for="track in availableTracks" :key="track" :value="track">{{ track }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Performance Level Filter -->
          <div class="relative sm:w-40">
            <select 
              v-model="selectedPerformanceLevel"
              class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4697b9] focus:border-transparent text-sm"
            >
              <option value="all">All Levels</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Moderate">Moderate</option>
              <option value="Poor">Poor</option>
              <option value="Very Poor">Very Poor</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Sort By -->
          <div class="relative sm:w-44">
            <select 
              v-model="sortBy"
              class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4697b9] focus:border-transparent text-sm"
            >
              <option value="score-desc">Score: High → Low</option>
              <option value="score-asc">Score: Low → High</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>
        <!-- Active filters summary -->
        <div v-if="activeFilterCount > 0" class="mt-3 flex items-center flex-wrap gap-2">
          <span class="text-xs text-gray-400">Active filters:</span>
          <span v-if="selectedTrack !== 'all'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Track: {{ selectedTrack }}
            <button @click="selectedTrack = 'all'" class="ml-1 hover:text-blue-900">×</button>
          </span>
          <span v-if="selectedPerformanceLevel !== 'all'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Level: {{ selectedPerformanceLevel }}
            <button @click="selectedPerformanceLevel = 'all'" class="ml-1 hover:text-yellow-900">×</button>
          </span>
          <span v-if="searchQuery" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Search: "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="ml-1 hover:text-gray-900">×</button>
          </span>
          <button @click="clearAllFilters" class="text-xs text-red-500 hover:text-red-700 font-medium ml-1">Clear all</button>
        </div>
      </div>

      <!-- Lecturer Table -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">User</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Track</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Score</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Level</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Academic</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Behavior</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="sortedLecturers.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  No lecturers found matching your criteria
                </td>
              </tr>
              <tr 
                v-for="(lecturer, idx) in paginatedLecturers" 
                :key="lecturer.staffCode"
                class="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                @click="navigateToDetail(lecturer.staffCode)"
              >
                <!-- User Column -->
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" :class="getAvatarColorClass(idx)">
                      {{ getInitials(lecturer.staffName) }}
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900 text-sm group-hover:text-[#1e3a5f] transition-colors">{{ lecturer.staffName }}</p>
                      <p class="text-xs text-gray-500">{{ lecturer.staffCode }}</p>
                    </div>
                  </div>
                </td>
                
                <!-- Track Column -->
                <td class="px-4 py-3 text-center">
                  <span 
                    class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="getTrackBadgeClass(lecturer.domainScoreName)"
                  >
                    {{ lecturer.domainScoreName || 'Teaching' }}
                  </span>
                </td>
                
                <!-- Score Column -->
                <td class="px-4 py-3 text-center bg-gray-50/50">
                  <span class="text-lg font-bold text-gray-900">{{ lecturer.overallPerformance.totalScore.toFixed(1) }}%</span>
                </td>
                
                <!-- Level Column -->
                <td class="px-4 py-3 text-center bg-gray-50/50">
                  <span 
                    class="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                    :class="getPerformanceBadgeClass(lecturer.performanceLevel)"
                  >
                    {{ lecturer.performanceLevel }}
                  </span>
                </td>
                
                <!-- Academic Column -->
                <td class="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50/50">
                  {{ lecturer.overallPerformance.academicPerformance.toFixed(1) }}%
                </td>
                
                <!-- Behavior Column -->
                <td class="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50/50">
                  {{ lecturer.overallPerformance.behavior.toFixed(1) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">
          <span class="text-sm text-gray-600">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredLecturers.length) }} of {{ filteredLecturers.length }}
          </span>
          <div class="flex items-center space-x-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              ← Previous
            </button>
            <span class="text-sm text-gray-600 px-2">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import { useAdminKpiApi, type LecturerKpiData } from '@/composables/useAdminKpiApi';
import { useKpiCache } from '@/composables/useKpiCache';
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
const {
  cachedKpiData,
  hasCachedData,
  isPreloading: cachePreloading,
  preloadKpiData,
  refreshCache,
  initializeFromStorage
} = useKpiCache();

// Initialize cache from localStorage immediately on script setup (client-side)
// Initialize cache from localStorage immediately - this is the KEY for instant loading
let hasInitialCache = false;
if (typeof window !== 'undefined') {
  initializeFromStorage();
  // Check if we already have cached data (don't require specific period for initial check)
  hasInitialCache = hasCachedData();
  console.log('[Admin KPI] Script setup - Initial cache check:', hasInitialCache ? 'HAS CACHE ✅' : 'NO CACHE ❌', 'count:', cachedKpiData.value?.length || 0);
}

// Runtime config for API
const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBaseUrl || 'https://eport.mfu.ac.th/api/master';
const API_CREDENTIALS = {
  username: runtimeConfig.public.apiUsername || 'sombi',
  password: runtimeConfig.public.apiPassword || 'kTzQmR7pWv9LbYD'
};

// Auth token for detailed API calls
const authToken = ref<string | null>(null);

// State - Start with loading=false if we have cached data!
const selectedEvaluationPeriod = ref<number | null>(null);
const loading = ref(!hasInitialCache);
const fetchError = ref<string | null>(null);
const searchQuery = ref('');
const selectedPerformanceLevel = ref('all');
const selectedTrack = ref('all');
const selectedProgram = ref('all');
const selectedLecturer = ref<LecturerKpiData | null>(null);
const currentPage = ref(1);
const itemsPerPage = 20;
const sortBy = ref('score-desc');

// Available tracks computed from data
const availableTracks = computed(() => {
  const tracks = new Set<string>();
  combinedKpiData.value.forEach(l => {
    if (l.domainScoreName) tracks.add(l.domainScoreName);
    else tracks.add('Teaching');
  });
  return Array.from(tracks).sort();
});

// Available programs computed from data
const availablePrograms = computed(() => {
  const programs = new Set<string>();
  combinedKpiData.value.forEach(l => {
    if (l.programCode) programs.add(l.programCode);
  });
  return Array.from(programs).sort();
});

// Program aggregates for Program Performance Summary cards
const programAggregates = computed(() => {
  const data = combinedKpiData.value;
  if (data.length === 0) return [];
  
  const programMap = new Map<string, { count: number; totalScoreSum: number; academicSum: number; behaviorSum: number }>();
  
  data.forEach(l => {
    const code = l.programCode || 'N/A';
    if (code === 'N/A') return; // Skip lecturers without program
    const existing = programMap.get(code) || { count: 0, totalScoreSum: 0, academicSum: 0, behaviorSum: 0 };
    existing.count++;
    existing.totalScoreSum += l.overallPerformance.totalScore;
    existing.academicSum += l.overallPerformance.academicPerformance;
    existing.behaviorSum += l.overallPerformance.behavior;
    programMap.set(code, existing);
  });
  
  return Array.from(programMap.entries())
    .map(([programCode, info]) => ({
      programCode,
      count: info.count,
      avgTotalScore: info.totalScoreSum / info.count,
      avgAcademic: info.academicSum / info.count,
      avgBehavior: info.behaviorSum / info.count
    }))
    .sort((a, b) => b.avgTotalScore - a.avgTotalScore);
});

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedProgram.value !== 'all') count++;
  if (selectedTrack.value !== 'all') count++;
  if (selectedPerformanceLevel.value !== 'all') count++;
  if (searchQuery.value) count++;
  return count;
});

// Clear all filters
const clearAllFilters = () => {
  selectedProgram.value = 'all';
  selectedTrack.value = 'all';
  selectedPerformanceLevel.value = 'all';
  searchQuery.value = '';
  currentPage.value = 1;
};

// Select program filter (from clicking program cards)
const selectProgramFilter = (programCode: string) => {
  if (selectedProgram.value === programCode) {
    selectedProgram.value = 'all'; // Toggle off
  } else {
    selectedProgram.value = programCode;
  }
  currentPage.value = 1;
};
const loadingDetailedData = ref(false);
const lecturerDetailedData = ref<any>(null);

// Accordion state for collapsible domain sections
const expandedDomains = ref<Set<number>>(new Set());

// Toggle domain expansion
const toggleDomain = (domainNumber: number) => {
  const newSet = new Set(expandedDomains.value);
  if (newSet.has(domainNumber)) {
    newSet.delete(domainNumber);
  } else {
    newSet.add(domainNumber);
  }
  expandedDomains.value = newSet;
};

// Check if domain is expanded
const isDomainExpanded = (domainNumber: number) => {
  return expandedDomains.value.has(domainNumber);
};

// Router for navigation to detail page
const router = useRouter();

// Navigate to lecturer detail page with evaluation period
const navigateToDetail = (staffCode: string) => {
  console.log('[Admin KPI] Navigating to detail page for:', staffCode, 'round:', selectedEvaluationPeriod.value);
  const path = `/admin/kpi/${staffCode}`;
  const query = { round: String(selectedEvaluationPeriod.value || 9) };
  console.log('[Admin KPI] Navigation path:', path, 'query:', query);
  router.push({ path, query });
};

// Chart ref for performance distribution pie chart
const performanceDistributionChart = ref<HTMLCanvasElement | null>(null);
let distributionChartInstance: Chart | null = null;

// Chart ref for track distribution pie chart
const trackDistributionChart = ref<HTMLCanvasElement | null>(null);
let trackDistributionChartInstance: Chart | null = null;

// Performance level counts computed
const performanceLevelCounts = computed(() => {
  const counts: Record<string, number> = {
    'Excellent': 0,
    'Good': 0,
    'Moderate': 0,
    'Poor': 0,
    'Very Poor': 0
  };
  
  combinedKpiData.value.forEach(lecturer => {
    if (counts[lecturer.performanceLevel] !== undefined) {
      counts[lecturer.performanceLevel]++;
    }
  });
  
  return counts;
});

// Initialize performance distribution chart
const initDistributionChart = () => {
  if (!performanceDistributionChart.value) return;
  
  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }
  
  const counts = performanceLevelCounts.value;
  
  distributionChartInstance = new Chart(performanceDistributionChart.value, {
    type: 'pie',
    data: {
      labels: ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor'],
      datasets: [{
        data: [
          counts.Excellent,
          counts.Good,
          counts.Moderate,
          counts.Poor,
          counts['Very Poor']
        ],
        // Colors aligned with statistics cards: Yellow/Gold=Excellent, Green=Good, Blue=Moderate, Orange=Poor, Red=Very Poor
        backgroundColor: ['#EAB308', '#10B981', '#3B82F6', '#F97316', '#EF4444'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
};

// Initialize track distribution pie chart
const initTrackDistributionChart = () => {
  if (!trackDistributionChart.value) return;
  
  if (trackDistributionChartInstance) {
    trackDistributionChartInstance.destroy();
  }
  
  const groups = trackSafeAggregates.value.trackGroups;
  if (groups.length === 0) return;
  
  trackDistributionChartInstance = new Chart(trackDistributionChart.value, {
    type: 'pie',
    data: {
      labels: groups.map(g => g.name),
      datasets: [{
        data: groups.map(g => g.count),
        backgroundColor: groups.map(g => g.color),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = ((value / total) * 100).toFixed(0);
              return `${label}: ${value} lecturers (${pct}%)`;
            }
          }
        }
      }
    }
  });
};

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

// Domain item count computed properties
const teachingItemCount = computed(() => {
  const undergrad = groupedUndergraduateCourses.value?.length || 0;
  const grad = groupedGraduateCourses.value?.length || 0;
  return undergrad + grad;
});

const researchItemCount = computed(() => {
  const studies = lecturerDetailedData.value?.research?.studies?.length || 0;
  const publications = lecturerDetailedData.value?.research?.publications?.length || 0;
  return studies + publications;
});

const academicServiceItemCount = computed(() => {
  return lecturerDetailedData.value?.academicService?.activities?.length || 0;
});

const administrationItemCount = computed(() => {
  const curricular = lecturerDetailedData.value?.administration?.curricularCommittee?.length || 0;
  const school = lecturerDetailedData.value?.administration?.schoolCommittee?.length || 0;
  const university = lecturerDetailedData.value?.administration?.universityCommittee?.length || 0;
  return curricular + school + university;
});

const artsCultureItemCount = computed(() => {
  const selfDev = lecturerDetailedData.value?.artsCulture?.selfDevelopment?.length || 0;
  const mfuArranged = lecturerDetailedData.value?.artsCulture?.mfuArranged?.length || 0;
  return selfDev + mfuArranged;
});

// Check if any domain has data
const hasAnyDomainData = computed(() => {
  return teachingItemCount.value > 0 || 
         researchItemCount.value > 0 || 
         academicServiceItemCount.value > 0 || 
         administrationItemCount.value > 0 || 
         artsCultureItemCount.value > 0;
});


// Chart refs
const performanceChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Combined KPI data - use cache if available, otherwise use fresh fetch data
const combinedKpiData = computed(() => {
  // Prioritize cached data for instant display
  // Don't require exact period match for initial display - show cached data immediately
  if (cachedKpiData.value && cachedKpiData.value.length > 0) {
    console.log('[Admin KPI] combinedKpiData: Using cached data, count:', cachedKpiData.value.length);
    return cachedKpiData.value;
  }
  // Fall back to freshly fetched data
  console.log('[Admin KPI] combinedKpiData: Using fresh data, count:', allLecturersKpi.value?.length || 0);
  return allLecturersKpi.value || [];
});

// Statistics computed from combinedKpiData (works with both cached and fresh data)
const statistics = computed(() => {
  const data = combinedKpiData.value;
  if (!data || data.length === 0) {
    return {
      total: 0,
      excellent: 0,
      good: 0,
      moderate: 0,
      poor: 0,
      veryPoor: 0,
      averageTotalScore: 0
    };
  }
  
  return {
    total: data.length,
    excellent: data.filter(l => l.performanceLevel === 'Excellent').length,
    good: data.filter(l => l.performanceLevel === 'Good').length,
    moderate: data.filter(l => l.performanceLevel === 'Moderate').length,
    poor: data.filter(l => l.performanceLevel === 'Poor').length,
    veryPoor: data.filter(l => l.performanceLevel === 'Very Poor').length,
    averageTotalScore: data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length
  };
});

// Filtered lecturers based on search, program, and performance level
const filteredLecturers = computed(() => {
  let result = combinedKpiData.value;
  
  // Filter by program
  if (selectedProgram.value !== 'all') {
    result = result.filter(l => l.programCode === selectedProgram.value);
  }
  
  // Filter by track
  if (selectedTrack.value !== 'all') {
    result = result.filter(l => (l.domainScoreName || 'Teaching') === selectedTrack.value);
  }
  
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

// Sorted lecturers based on sortBy selection
const sortedLecturers = computed(() => {
  const lecturers = [...filteredLecturers.value];
  switch (sortBy.value) {
    case 'score-desc':
      return lecturers.sort((a, b) => b.overallPerformance.totalScore - a.overallPerformance.totalScore);
    case 'score-asc':
      return lecturers.sort((a, b) => a.overallPerformance.totalScore - b.overallPerformance.totalScore);
    case 'name-asc':
      return lecturers.sort((a, b) => a.staffName.localeCompare(b.staffName));
    case 'name-desc':
      return lecturers.sort((a, b) => b.staffName.localeCompare(a.staffName));
    default:
      return lecturers;
  }
});

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedLecturers.value.slice(start, end);
});

// KPI categories for selected lecturer
const kpiCategories = computed(() => {
  if (!selectedLecturer.value) return [];
  
  const { domainWeights, domainScores } = selectedLecturer.value;
  
  // domainScores are percentage values (0-100%)
  // pointsEarned = (score% / 100) * weight
  return [
    { name: 'Teaching', weight: domainWeights.domain1, score: domainScores.domain1, pointsEarned: (domainScores.domain1 / 100) * domainWeights.domain1, color: '#005F99' },
    { name: 'Research', weight: domainWeights.domain2, score: domainScores.domain2, pointsEarned: (domainScores.domain2 / 100) * domainWeights.domain2, color: '#00BFFF' },
    { name: 'Academic Service', weight: domainWeights.domain3, score: domainScores.domain3, pointsEarned: (domainScores.domain3 / 100) * domainWeights.domain3, color: '#7FD6D6' },
    { name: 'Administration', weight: domainWeights.domain4, score: domainScores.domain4, pointsEarned: (domainScores.domain4 / 100) * domainWeights.domain4, color: '#7c3aed' },
    { name: 'Arts & Culture', weight: domainWeights.domain5, score: domainScores.domain5, pointsEarned: (domainScores.domain5 / 100) * domainWeights.domain5, color: '#8A8BE6' }
  ];
});

// Track-safe aggregate calculation
// Uses only Total Score, Academic Performance, and Behavior which are already track-normalized
// Also provides per-track group averages for meaningful domain-level comparison
const trackSafeAggregates = computed(() => {
  const data = combinedKpiData.value;
  if (data.length === 0) return {
    avgTotal: 0, avgAcademic: 0, avgBehavior: 0,
    trackGroups: []
  };
  
  // Overall averages (track-safe: Total Score is already normalized regardless of track)
  const avgTotal = data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length;
  const avgAcademic = data.reduce((sum, l) => sum + l.overallPerformance.academicPerformance, 0) / data.length;
  const avgBehavior = data.reduce((sum, l) => sum + l.overallPerformance.behavior, 0) / data.length;
  
  // Group by track for per-track averages
  const trackMap = new Map<string, { count: number; totalScore: number; color: string }>();
  const trackColors: Record<string, string> = {
    'Teaching': '#2563eb',
    'Research': '#0891b2',
    'Academic Service': '#059669',
    'Academic Administration': '#7c3aed'
  };
  
  data.forEach(l => {
    const track = l.domainScoreName || 'Teaching';
    const existing = trackMap.get(track) || { count: 0, totalScore: 0, color: trackColors[track] || '#6b7280' };
    existing.count++;
    existing.totalScore += l.overallPerformance.totalScore;
    trackMap.set(track, existing);
  });
  
  const trackGroups = Array.from(trackMap.entries())
    .map(([name, info]) => ({
      name,
      count: info.count,
      avgScore: info.totalScore / info.count,
      color: info.color
    }))
    .sort((a, b) => b.count - a.count);
  
  return { avgTotal, avgAcademic, avgBehavior, trackGroups };
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

// Track badge styling
const getTrackBadgeClass = (track: string) => {
  switch (track as string) {
    case 'Teaching': return 'bg-blue-100 text-blue-700';
    case 'Research': return 'bg-cyan-100 text-cyan-700';
    case 'Academic Service': return 'bg-emerald-100 text-emerald-700';
    case 'Academic Administration': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Program badge styling — matches dashboard programStyles colors
const getProgramBadgeClass = (programCode: string) => {
  const programColors: Record<string, string> = {
    'ACC': 'bg-[#E0EFFF] text-[#3F63C5]',
    'BA': 'bg-[#D3F3E3] text-[#0D875E]',
    'ECO': 'bg-[#F1E8FD] text-[#7C51AA]',
    'TRM': 'bg-[#FFEBD3] text-[#EC5101]',
    'AVI': 'bg-[#DEF3FA] text-[#1D7DAA]',
    'HRM': 'bg-[#FFE2F1] text-[#CD3774]',
    'LOG': 'bg-[#FCE2E5] text-[#EC5101]',
    'DEAN': 'bg-[#F6F3FC] text-[#7C51AA]'
  };
  return programColors[programCode] || 'bg-gray-100 text-gray-600';
};

// Score color class for program cards
const getScoreColorClass = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 65) return 'text-amber-600';
  return 'text-red-600';
};

// Score bar class for program cards
const getScoreBarClass = (score: number) => {
  if (score >= 85) return 'bg-emerald-400';
  if (score >= 75) return 'bg-blue-400';
  if (score >= 65) return 'bg-amber-400';
  return 'bg-red-400';
};

// Avatar color classes based on index
const avatarColors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
];

const getAvatarColorClass = (index: number) => {
  return avatarColors[index % avatarColors.length];
};

// Get progress bar color based on achievement percentage
const getProgressBarColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return 'bg-emerald-400';
  if (percentage >= 70) return 'bg-green-400';
  if (percentage >= 50) return 'bg-yellow-400';
  if (percentage >= 30) return 'bg-orange-400';
  return 'bg-red-400';
};

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

// Lecturer emails cache
const lecturerEmails = ref<Record<string, string>>({});
const emailsLoading = ref(false);

// Fetch lecturers with emails from backend
const fetchLecturerEmails = async () => {
  try {
    emailsLoading.value = true;
    
    // Wait for auth to be ready
    let attempts = 0;
    while (!user.value && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    
    const firebaseToken = user.value ? await user.value.getIdToken() : null;
    if (!firebaseToken) {
      console.warn('[Admin KPI] No auth token for fetching emails');
      return;
    }
    
    const backendUrl = runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app';
    console.log('[Admin KPI] Fetching lecturer emails...');
    const response = await fetch(`${backendUrl}/api/admin/lecturers?limit=500`, {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const emailMap: Record<string, string> = {};
        data.data.forEach((lecturer: any) => {
          if (lecturer.staff_code && lecturer.email) {
            emailMap[lecturer.staff_code] = lecturer.email;
          }
        });
        lecturerEmails.value = emailMap;
        console.log('[Admin KPI] Loaded', Object.keys(emailMap).length, 'lecturer emails');
      }
    }
  } catch (err) {
    console.error('[Admin KPI] Error fetching lecturer emails:', err);
  } finally {
    emailsLoading.value = false;
  }
};

// Get lecturer email by staff code
const getLecturerEmail = (staffCode: string) => {
  const email = lecturerEmails.value[staffCode];
  if (!email) {
    // Return loading indicator if emails are still being fetched
    if (emailsLoading.value) return 'Loading...';
    return null;
  }
  // Return just the username part
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? email.substring(0, atIndex) : email;
};

// Get lecturer email domain
const getLecturerEmailDomain = (staffCode: string) => {
  const email = lecturerEmails.value[staffCode];
  if (!email) return null;
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? '@' + email.substring(atIndex + 1) : null;
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

// Data loading - uses cached data when available for instant display
const loadData = async (forceRefresh: boolean = false) => {
  try {
    loading.value = true;
    fetchError.value = null;
    
    const evalId = selectedEvaluationPeriod.value || activeEvaluationPeriod.value?.evaluateid || 9;
    console.log('[Admin KPI] Loading data for evaluation period:', evalId);
    
    // Check if cached data is available and we're not forcing a refresh
    if (!forceRefresh && hasCachedData(evalId)) {
      console.log('[Admin KPI] Using cached data - instant display!');
      // The cachedKpiData is automatically available from useKpiCache
      // We just need to signal that loading is complete
      loading.value = false;
      return;
    }
    
    // If no cache available, fetch fresh data
    console.log('[Admin KPI] No cache available, fetching fresh data...');
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
  
  const evalId = selectedEvaluationPeriod.value || activeEvaluationPeriod.value?.evaluateid || 9;
  console.log('[Admin KPI] Evaluation period changed to:', evalId);
  
  // Always fetch fresh data when user explicitly changes evaluation period
  // This ensures they get the correct data for the selected round
  loading.value = true;
  try {
    await refreshCache(evalId);
    console.log('[Admin KPI] Loaded data for period', evalId, '- count:', cachedKpiData.value?.length || 0);
  } catch (err) {
    console.error('[Admin KPI] Error loading period data:', err);
  } finally {
    loading.value = false;
  }
};

// Reset page when filters change
watch([searchQuery, selectedTrack, selectedPerformanceLevel, selectedProgram, sortBy], () => {
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

// Watch combined KPI data to update distribution charts
watch(combinedKpiData, () => {
  if (combinedKpiData.value.length > 0) {
    nextTick(() => {
      initDistributionChart();
      initTrackDistributionChart();
    });
  }
}, { immediate: false });

// Initialize
onMounted(async () => {
  const startTime = performance.now()
  
  try {
    // IMPORTANT: Check cache first for instant display - don't require specific period
    initializeFromStorage()
    
    // Check for ANY valid cached data, not a specific period
    const hasValidCache = hasCachedData()
    
    if (hasValidCache) {
      const loadTime = (performance.now() - startTime).toFixed(0)
      console.log(`[Admin KPI] ✅ Cache HIT - showing data instantly! (${loadTime}ms, ${cachedKpiData.value.length} lecturers)`)
      loading.value = false
      
      // Fetch evaluation periods in background (don't block UI)
      fetchEvaluationPeriods().then(() => {
        if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
          selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid
        }
      })
      
      // Login for detailed data in background
      login()
      
      // Fetch lecturer emails IMMEDIATELY - this is important for showing emails
      await fetchLecturerEmails()
      
      // Initialize distribution charts
      nextTick(() => {
        initDistributionChart();
        initTrackDistributionChart();
      });
      
      return // Don't wait for anything else - show cached data NOW
    }
    
    console.log('[Admin KPI] ❌ Cache MISS - fetching fresh data...')
    loading.value = true
    
    // Wait for Firebase auth to be ready (with timeout)
    let attempts = 0
    while (!user.value && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 250))
      attempts++
    }
    
    if (!user.value) {
      fetchError.value = 'Please log in to view KPI data'
      loading.value = false
      return
    }
    
    // Fetch evaluation periods
    await fetchEvaluationPeriods()
    
    if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
      selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid
    }
    
    // Load KPI data
    await loadData()
    
    // Fetch lecturer emails
    fetchLecturerEmails()
    
    const totalTime = ((performance.now() - startTime) / 1000).toFixed(1)
    console.log(`[Admin KPI] Fresh data loaded in ${totalTime}s`)
    
    // Login to API for detailed data fetching
    await login()
    
    // Initialize distribution charts after data is loaded
    nextTick(() => {
      initDistributionChart();
      initTrackDistributionChart();
    });
    
    // Unregister datalabels plugin if present
    if (Chart.registry) {
      const datalabelsPlugin = Chart.registry.plugins.get('datalabels')
      if (datalabelsPlugin) {
        Chart.unregister(datalabelsPlugin)
      }
    }
  } catch (error) {
    console.error('[Admin KPI] Initialization error:', error)
    loading.value = false
  }
});

// Cleanup
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }
  if (trackDistributionChartInstance) {
    trackDistributionChartInstance.destroy();
  }
});
</script>
