<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="container mx-auto px-4 py-6 lg:py-8">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div class="animate-fade-in">
          <h1 class="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#4697b9] bg-clip-text text-transparent">
            KPI Performance Overview
          </h1>
          <p class="text-gray-600 mt-1">Welcome back, <span class="font-semibold text-[#4697b9]">{{ user?.displayName || 'Lecturer' }}</span></p>
        </div>
        
        <!-- Evaluation Period Selector -->
        <div class="relative animate-fade-in-delay">
          <div class="flex items-center gap-2 bg-white rounded-xl shadow-lg px-4 py-2 border border-gray-100">
            <svg class="w-5 h-5 text-[#4697b9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <select
              v-model="selectedEvaluationPeriod"
              @change="onEvaluationPeriodChange"
              class="appearance-none bg-transparent border-0 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-8"
              :disabled="isLoadingPeriods"
            >
              <option v-if="isLoadingPeriods" disabled>Loading...</option>
              <option 
                v-for="period in evaluationPeriods" 
                :key="period.evaluateid" 
                :value="period.evaluateid"
              >
                Round {{ period.evaluatename }}
              </option>
            </select>
            <svg class="w-4 h-4 text-gray-400 -ml-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-[#4697b9]/20 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-[#4697b9] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="mt-4 text-gray-600 font-medium animate-pulse">Loading your KPI data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="animate-fade-in">
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-amber-800">Connection Issue</h3>
              <p class="text-amber-700 mt-1">{{ fetchError }}</p>
              <button @click="loadKpiData" class="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Total Score Hero Card -->
        <div class="animate-fade-in bg-gradient-to-r from-[#1e3a5f] via-[#2d5a87] to-[#4697b9] rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div class="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div class="text-center lg:text-left">
              <p class="text-blue-200 text-sm font-medium uppercase tracking-wider">Total Performance Score</p>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-5xl lg:text-6xl font-bold">{{ overallPerformance.totalScore.toFixed(2) }}</span>
                <span class="text-2xl text-blue-200">%</span>
              </div>
              <div class="mt-3">
                <span :class="getPerformanceBadgeClass(overallPerformance.performanceLevel)" class="px-4 py-1.5 rounded-full text-sm font-semibold">
                  {{ overallPerformance.performanceLevel }}
                </span>
              </div>
            </div>
            
            <!-- Mini Stats -->
            <div class="flex gap-4 lg:gap-6">
              <div class="text-center px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <p class="text-3xl font-bold">{{ overallPerformance.academicPerformance.toFixed(1) }}%</p>
                <p class="text-xs text-blue-200 mt-1">Academic (60%)</p>
              </div>
              <div class="text-center px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <p class="text-3xl font-bold">{{ overallPerformance.behavior.toFixed(1) }}%</p>
                <p class="text-xs text-blue-200 mt-1">Behavior (40%)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 5 Domain KPI Cards with Circular Progress -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in-delay">
          <NuxtLink
            v-for="(domain, index) in domainCards"
            :key="domain.key"
            :to="domain.link"
            class="group bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-transparent relative overflow-hidden"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Hover Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" :style="{ background: `linear-gradient(135deg, ${domain.color}15, ${domain.color}30)` }"></div>
            
            <div class="relative">
              <!-- Circular Progress: Max = full circle, Weight = partial, Score = progress -->
              <div class="relative w-24 h-24 mx-auto mb-3">
                <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <!-- Background circle (Max = 100%) - gray -->
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                  
                  <!-- Weight arc (partial of full circle) - light color -->
                  <circle 
                    cx="18" cy="18" r="15.5" fill="none" 
                    :stroke="domain.color + '30'"
                    stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${domain.weight}, 100`"
                    class="weight-ring"
                  />
                  
                  <!-- Score arc (actual progress) - solid color -->
                  <circle 
                    cx="18" cy="18" r="15.5" fill="none" 
                    :stroke="domain.color" 
                    stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${domain.score}, 100`"
                    class="progress-ring"
                  />
                </svg>
                
                <!-- Center Content -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <!-- Domain Icon (animated on hover) -->
                  <div class="w-6 h-6 mb-0.5 transform group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-full h-full" :style="{ color: domain.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="domain.iconPath"/>
                    </svg>
                  </div>
                  <!-- Score value -->
                  <span class="text-sm font-bold" :style="{ color: domain.color }">{{ domain.score.toFixed(1) }}</span>
                </div>
                
                <!-- Weight indicator badge -->
                <div 
                  class="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transform group-hover:scale-110 transition-transform duration-300"
                  :style="{ backgroundColor: domain.color }"
                >
                  {{ domain.weight }}
                </div>
              </div>
              
              <!-- Domain Info -->
              <div class="text-center">
                <h3 class="font-semibold text-gray-800 text-sm group-hover:text-gray-900">{{ domain.name }}</h3>
                <!-- Mini progress bar showing score vs weight -->
                <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-2 relative">
                  <!-- Weight indicator (background) -->
                  <div 
                    class="absolute h-full rounded-full"
                    :style="{ 
                      backgroundColor: domain.color + '30',
                      width: `${domain.weight}%`
                    }"
                  ></div>
                  <!-- Score bar (foreground) -->
                  <div 
                    class="h-full rounded-full progress-bar relative"
                    :style="{ 
                      backgroundColor: domain.color,
                      width: `${domain.score}%`
                    }"
                  ></div>
                </div>
                <div class="flex justify-between items-center mt-1 px-2">
                  <span class="text-[10px] text-gray-400">{{ domain.score.toFixed(1) }}%</span>
                  <span class="text-[10px] text-gray-400">/ {{ domain.weight }}%</span>
                </div>
              </div>
              
              <!-- Arrow Icon -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4" :style="{ color: domain.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-delay-2">
          <!-- Main Donut Chart -->
          <div class="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Performance Distribution</h2>
                <p class="text-sm text-gray-500 mt-1">{{ formatDateRange() }}</p>
              </div>
              <div class="w-10 h-10 bg-gradient-to-br from-[#4697b9] to-[#21739D] rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                </svg>
              </div>
            </div>
            
            <!-- Chart Container -->
            <div class="relative">
              <div class="aspect-square max-w-md mx-auto">
                <canvas ref="performanceChart"></canvas>
              </div>
            </div>

            <!-- Legend -->
            <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div 
                v-for="category in kpiCategories" 
                :key="category.key" 
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default"
              >
                <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: category.color }"></div>
                <span class="text-xs font-medium text-gray-700 truncate">{{ category.name }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column - Performance Breakdown -->
          <div class="space-y-4">
            <!-- Performance Metrics Card -->
            <div class="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-800 mb-4">Score Breakdown</h3>
              
              <div class="space-y-4">
                <!-- Academic Performance -->
                <div class="group">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">Academic Performance</span>
                    <span class="text-sm font-bold text-blue-600">{{ overallPerformance.academicPerformance.toFixed(2) }}%</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out progress-bar"
                      :style="{ width: `${(overallPerformance.academicPerformance / 60) * 100}%` }"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Max: 60%</p>
                </div>

                <!-- Behavior -->
                <div class="group">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">Behavior</span>
                    <span class="text-sm font-bold text-emerald-600">{{ overallPerformance.behavior.toFixed(2) }}%</span>
                  </div>
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out progress-bar"
                      :style="{ width: `${(overallPerformance.behavior / 40) * 100}%` }"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Max: 40%</p>
                </div>

                <!-- Total Score -->
                <div class="pt-4 border-t border-gray-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">Total Score</span>
                    <span class="text-sm font-bold text-indigo-600">{{ overallPerformance.totalScore.toFixed(2) }}%</span>
                  </div>
                  <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out progress-bar"
                      :style="{ width: `${overallPerformance.totalScore}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Level Guide -->
            <div class="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-800 mb-4">Performance Levels</h3>
              
              <div class="space-y-2">
                <div v-for="level in performanceLevels" :key="level.name" 
                     class="flex items-center justify-between p-2 rounded-lg transition-colors"
                     :class="overallPerformance.performanceLevel === level.name ? level.activeBg : 'hover:bg-gray-50'">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="level.dotClass"></div>
                    <span class="text-sm text-gray-600">{{ level.range }}</span>
                  </div>
                  <span :class="level.badgeClass" class="px-3 py-1 text-xs font-semibold rounded-full">
                    {{ level.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import Chart from "chart.js/auto";
import { computed, ref, watch, onUnmounted } from "vue";
import { useMfuKpiApi } from '@/composables/useMfuKpiApi'

const { user } = useFirebaseAuth()
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods()
const { kpiData: mfuKpiData, fetchKpiPercentages } = useMfuKpiApi()

const selectedEvaluationPeriod = ref<number | null>(null)
const loading = ref(true)
const fetchError = ref<string | null>(null)
const performanceChart = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Performance levels configuration
const performanceLevels = [
  { name: 'Excellent', range: '85-100', badgeClass: 'bg-yellow-100 text-yellow-800', dotClass: 'bg-yellow-500', activeBg: 'bg-yellow-50' },
  { name: 'Good', range: '75-84', badgeClass: 'bg-green-100 text-green-800', dotClass: 'bg-green-500', activeBg: 'bg-green-50' },
  { name: 'Moderate', range: '65-74', badgeClass: 'bg-blue-100 text-blue-800', dotClass: 'bg-blue-500', activeBg: 'bg-blue-50' },
  { name: 'Poor', range: '55-64', badgeClass: 'bg-orange-100 text-orange-800', dotClass: 'bg-orange-500', activeBg: 'bg-orange-50' },
  { name: 'Very Poor', range: '< 55', badgeClass: 'bg-red-100 text-red-800', dotClass: 'bg-red-500', activeBg: 'bg-red-50' },
]

// Domain card configuration
const domainCards = computed(() => {
  const weights = mfuKpiData.value?.domainWeights || {}
  const scores = mfuKpiData.value?.domainScores || {}
  
  return [
    { key: 'domain1', name: 'Teaching', weight: weights.domain1 || 0, score: scores.domain1 || 0, color: '#005F99', link: '/lecturer/teaching-performance', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { key: 'domain2', name: 'Research', weight: weights.domain2 || 0, score: scores.domain2 || 0, color: '#00BFFF', link: '/lecturer/research-performance', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { key: 'domain3', name: 'Academic Service', weight: weights.domain3 || 0, score: scores.domain3 || 0, color: '#10B981', link: '/lecturer/academic-performance', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { key: 'domain4', name: 'Administration', weight: weights.domain4 || 0, score: scores.domain4 || 0, color: '#8B5CF6', link: '/lecturer/administration', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { key: 'domain5', name: 'Arts & Culture', weight: weights.domain5 || 0, score: scores.domain5 || 0, color: '#EC4899', link: '/lecturer/arts-culture', iconPath: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ]
})

// KPI categories for chart
const kpiCategories = computed(() => domainCards.value.map(d => ({
  name: d.name,
  weight: d.weight,
  value: d.score,
  color: d.color,
  key: d.key
})))

// Overall performance
const overallPerformance = computed(() => {
  if (mfuKpiData.value?.overallPerformance) {
    const data = mfuKpiData.value.overallPerformance
    return {
      academicPerformance: data.academicPerformance || 0,
      behavior: data.behavior || 0,
      totalScore: data.totalScore || 0,
      performanceLevel: getPerformanceLevel(data.totalScore || 0)
    }
  }
  return { academicPerformance: 0, behavior: 0, totalScore: 0, performanceLevel: 'No Data' }
})

// Helper functions
const getPerformanceLevel = (score: number): string => {
  if (score >= 85) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 65) return 'Moderate'
  if (score >= 55) return 'Poor'
  return 'Very Poor'
}

const getPerformanceBadgeClass = (level: string): string => {
  const classes: Record<string, string> = {
    'Excellent': 'bg-yellow-400 text-yellow-900',
    'Good': 'bg-green-400 text-green-900',
    'Moderate': 'bg-blue-400 text-blue-900',
    'Poor': 'bg-orange-400 text-orange-900',
    'Very Poor': 'bg-red-400 text-red-900',
  }
  return classes[level] || 'bg-gray-400 text-gray-900'
}

const getCircleProgress = (score: number, weight: number): string => {
  if (weight <= 0) return '0, 100'
  const percentage = Math.min((score / weight) * 100, 100)
  return `${percentage}, 100`
}

const formatDateRange = () => {
  if (!selectedEvaluationPeriod.value || !evaluationPeriods.value) return 'Select period'
  const period = evaluationPeriods.value.find(p => p.evaluateid === selectedEvaluationPeriod.value)
  if (!period) return 'Period not found'
  
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${formatDate(period.evaluatestartdate)} - ${formatDate(period.evaluateenddate)}`
}

// Chart rendering
const renderChart = () => {
  if (!performanceChart.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = performanceChart.value.getContext('2d')
  if (!ctx) return

  const categories = kpiCategories.value
  const data = categories.map(c => c.value)
  const colors = categories.map(c => c.color)
  const labels = categories.map(c => c.name)

  chartInstance = new Chart(performanceChart.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverBorderWidth: 6,
        hoverOffset: 10,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 6,
          callbacks: {
            label: (context) => {
              const cat = categories[context.dataIndex]
              return ` ${cat.name}: ${cat.value.toFixed(2)}% (Weight: ${cat.weight}%)`
            }
          }
        }
      },
    },
    plugins: [{
      id: 'centerText',
      beforeDraw(chart) {
        const ctx = chart.ctx
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2
        
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Total score
        ctx.font = 'bold 28px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#1f2937'
        ctx.fillText(`${overallPerformance.value.totalScore.toFixed(1)}%`, centerX, centerY - 8)
        
        // Label
        ctx.font = '12px Inter, system-ui, sans-serif'
        ctx.fillStyle = '#6b7280'
        ctx.fillText('Total Score', centerX, centerY + 16)
        
        ctx.restore()
      }
    }]
  })
}

// Data loading
const loadKpiData = async () => {
  try {
    loading.value = true
    fetchError.value = null
    
    if (!user.value?.email) throw new Error('User email not available')
    
    const evalId = selectedEvaluationPeriod.value || activeEvaluationPeriod.value?.evaluateid || 9
    await fetchKpiPercentages(user.value.email, evalId)
    
    if (!mfuKpiData.value?.categories) {
      throw new Error('Invalid KPI data format')
    }
    
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const onEvaluationPeriodChange = async () => {
  await loadKpiData()
  if (!loading.value) renderChart()
}

// Lifecycle
definePageMeta({ layout: 'lecturer' })

watch([mfuKpiData, kpiCategories], () => {
  if (!loading.value && mfuKpiData.value) renderChart()
}, { deep: true })

watch(() => user.value?.email, async (email) => {
  if (email) {
    await fetchEvaluationPeriods()
    if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
      selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid
    }
    await loadKpiData()
    renderChart()
  }
}, { immediate: true })

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
/* Animation keyframes */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ringProgress {
  from { stroke-dasharray: 0, 100; }
}

@keyframes weightRing {
  from { stroke-dasharray: 0, 100; opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
  50% { filter: drop-shadow(0 0 6px currentColor); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-fade-in-delay {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.6s ease-out 0.4s forwards;
  opacity: 0;
}

.animate-fade-in-delay-3 {
  animation: fadeIn 0.6s ease-out 0.6s forwards;
  opacity: 0;
}

/* Progress ring animation */
.progress-ring {
  animation: ringProgress 1.5s ease-out forwards;
  transition: stroke-dasharray 1s ease-out;
}

/* Weight ring animation */
.weight-ring {
  animation: weightRing 1.2s ease-out 0.3s forwards;
  opacity: 0;
}

/* Progress bar animation */
.progress-bar {
  animation: growWidth 1.5s ease-out forwards;
}

@keyframes growWidth {
  from { width: 0%; }
}

/* Hover glow effect on cards */
.group:hover .progress-ring {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
