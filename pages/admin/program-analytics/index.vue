<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-br from-[#004086] to-[#1a6bb5] p-2.5 rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Program Analytics</h1>
            <p class="text-sm text-gray-500">KPI performance breakdown by academic program</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Refresh Button -->
        <button 
          @click="handleRefresh"
          :disabled="refreshing"
          class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#004086] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg :class="{'animate-spin': refreshing}" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ refreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
        <!-- Evaluation Period Selector -->
        <div class="relative">
          <select
            v-model="selectedEvaluationPeriod"
            @change="onEvaluationPeriodChange"
            class="appearance-none bg-white border-2 border-[#004086] rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-[#004086] focus:outline-none focus:ring-2 focus:ring-[#004086]/30"
            :disabled="isLoadingPeriods || loading"
          >
            <option v-if="isLoadingPeriods" disabled>Loading...</option>
            <option v-for="period in evaluationPeriods" :key="period.evaluateid" :value="period.evaluateid">
              Round {{ period.evaluatename }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#004086]">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Banner (data being built) -->
    <div v-if="dataIncomplete && !loading" class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <svg class="h-5 w-5 text-amber-500 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <div>
        <p class="text-sm font-medium text-amber-800">KPI data is loading from MFU API...</p>
        <p class="text-xs text-amber-600">Scores will appear automatically once ready. This may take 30-60 seconds on first load.</p>
      </div>
    </div>

    <!-- Loading State (initial) -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div class="h-8 w-16 bg-gray-200 rounded mb-2 mx-auto"></div>
          <div class="h-3 w-20 bg-gray-100 rounded mx-auto"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="'s'+i" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 bg-gray-200 rounded-xl"></div><div class="flex-1"><div class="h-4 w-24 bg-gray-200 rounded mb-2"></div><div class="h-3 w-12 bg-gray-100 rounded"></div></div></div>
          <div class="grid grid-cols-3 gap-2 mb-3"><div class="h-10 bg-gray-100 rounded-lg"></div><div class="h-10 bg-gray-100 rounded-lg"></div><div class="h-10 bg-gray-100 rounded-lg"></div></div>
          <div class="h-2 bg-gray-100 rounded-full mb-3"></div>
          <div class="h-9 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <svg class="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="text-lg font-semibold text-red-800 mb-1">Failed to Load</h3>
      <p class="text-red-600 text-sm mb-4">{{ error }}</p>
      <button @click="fetchProgramData" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">Retry</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p class="text-3xl font-bold text-[#004086]">{{ programBreakdown.length }}</p>
          <p class="text-xs text-gray-500 font-medium mt-1">Programs</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p class="text-3xl font-bold text-emerald-600">{{ totalLecturers }}</p>
          <p class="text-xs text-gray-500 font-medium mt-1">Lecturers with KPI</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p class="text-3xl font-bold" :class="overallAvg > 0 ? 'text-purple-600' : 'text-gray-300'">{{ overallAvg > 0 ? overallAvg.toFixed(1) + '%' : '—' }}</p>
          <p class="text-xs text-gray-500 font-medium mt-1">Overall Avg Score</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p class="text-3xl font-bold text-orange-600">{{ topProgram }}</p>
          <p class="text-xs text-gray-500 font-medium mt-1">Top Program</p>
        </div>
      </div>

      <!-- Program Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div 
          v-for="prog in programBreakdown" 
          :key="prog.programCode"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
        >
          <!-- Program Header -->
          <div class="flex items-center gap-3 mb-4">
            <div :class="[getProgramStyle(prog.programCode).color, 'p-2.5 rounded-xl shadow-sm flex-shrink-0']">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 text-sm leading-tight truncate">{{ programNames[prog.programCode] || prog.programName || prog.programCode }}</h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{{ prog.programCode }}</span>
                <span class="text-[10px] text-gray-400">{{ prog.lecturerCount || prog.count }} faculty</span>
              </div>
            </div>
          </div>

          <!-- HAS KPI DATA -->
          <template v-if="prog.count > 0">
            <!-- Scores -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div class="text-center bg-gray-50 rounded-lg py-2">
                <p class="text-base font-bold" :class="getScoreColorClass(prog.avgTotalScore)">{{ prog.avgTotalScore.toFixed(1) }}%</p>
                <p class="text-[9px] text-gray-400 font-medium">Total</p>
              </div>
              <div class="text-center bg-gray-50 rounded-lg py-2">
                <p class="text-base font-bold text-blue-600">{{ prog.avgAcademic.toFixed(1) }}%</p>
                <p class="text-[9px] text-gray-400 font-medium">Academic</p>
              </div>
              <div class="text-center bg-gray-50 rounded-lg py-2">
                <p class="text-base font-bold text-violet-600">{{ prog.avgBehavior.toFixed(1) }}%</p>
                <p class="text-[9px] text-gray-400 font-medium">Behavior</p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div class="h-full rounded-full transition-all duration-700" :style="{ width: Math.min(prog.avgTotalScore, 100) + '%' }" :class="getScoreBarClass(prog.avgTotalScore)"></div>
            </div>

            <!-- Level + Count -->
            <div class="flex items-center justify-between mb-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="getLevelBadge(prog.avgTotalScore)">
                {{ getPerformanceLevel(prog.avgTotalScore) }}
              </span>
              <span class="text-[10px] text-gray-400">{{ prog.count }}/{{ prog.lecturerCount || prog.count }} evaluated</span>
            </div>
          </template>

          <!-- NO KPI DATA -->
          <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center py-4 text-center">
              <svg class="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-xs text-gray-400 font-medium">No KPI data available</p>
              <p class="text-[10px] text-gray-300 mt-0.5">{{ prog.lecturerCount }} faculty enrolled</p>
            </div>
          </template>

          <!-- Action Button -->
          <NuxtLink 
            v-if="prog.count > 0"
            :to="{ path: '/admin/kpi/program/' + prog.programCode.toLowerCase(), query: { round: String(selectedEvaluationPeriod || '') } }"
            :class="[getProgramStyle(prog.programCode).buttonColor, getProgramStyle(prog.programCode).textColor]"
            class="mt-auto w-full py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Detailed KPI
          </NuxtLink>
          <div v-else class="mt-auto w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 bg-gray-50 text-gray-400 cursor-not-allowed">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Awaiting KPI Data
          </div>
        </div>
      </div>

      <!-- Program KPI Comparison Bar Chart -->
      <div v-if="programsWithData.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-1">Program KPI Comparison</h3>
        <p class="text-[10px] text-gray-400 mb-4">Grouped horizontal bar chart — Total Score, Academic (60%), and Behavior (40%) per program</p>
        <div class="h-72">
          <canvas ref="programBarChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

definePageMeta({ layout: 'admin' });

const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();

const runtimeConfig = useRuntimeConfig();
const BACKEND_URL = runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app';

const selectedEvaluationPeriod = ref<number | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const error = ref<string | null>(null);
const programBreakdown = ref<any[]>([]);
const totalLecturers = ref(0);
const dataIncomplete = ref(false);
let pollTimer: ReturnType<typeof setTimeout> | null = null;
const programBarChart = ref<HTMLCanvasElement | null>(null);
let barChartInstance: Chart | null = null;

const programNames: Record<string, string> = {
  'ACC': 'Accounting', 'BA': 'Business Administration', 'ECO': 'Economics',
  'TRM': 'Tourism Management', 'AVI': 'Aviation Management',
  'HRM': 'Hospitality Management', 'LOG': 'Logistics Management', 'DEAN': 'Dean Office'
};

const programStyleMap: Record<string, { color: string; buttonColor: string; textColor: string }> = {
  ACC: { color: 'bg-[#3F63C5]', buttonColor: 'bg-[#E0EFFF]', textColor: 'text-[#3F63C5]' },
  AVI: { color: 'bg-[#1D7DAA]', buttonColor: 'bg-[#DEF3FA]', textColor: 'text-[#1D7DAA]' },
  BA:  { color: 'bg-[#0D875E]', buttonColor: 'bg-[#D3F3E3]', textColor: 'text-[#0D875E]' },
  ECO: { color: 'bg-[#7C51AA]', buttonColor: 'bg-[#F1E8FD]', textColor: 'text-[#7C51AA]' },
  HRM: { color: 'bg-[#CD3774]', buttonColor: 'bg-[#FFE2F1]', textColor: 'text-[#CD3774]' },
  TRM: { color: 'bg-[#EC5101]', buttonColor: 'bg-[#FFEBD3]', textColor: 'text-[#EC5101]' },
  LOG: { color: 'bg-[#B8860B]', buttonColor: 'bg-[#FFF3D6]', textColor: 'text-[#B8860B]' },
  DEAN: { color: 'bg-[#6B7280]', buttonColor: 'bg-[#F3F4F6]', textColor: 'text-[#6B7280]' }
};
const defaultStyle = { color: 'bg-gray-500', buttonColor: 'bg-gray-100', textColor: 'text-gray-600' };
const getProgramStyle = (code: string) => programStyleMap[code] || defaultStyle;

const overallAvg = computed(() => {
  const withData = programBreakdown.value.filter((p: any) => p.count > 0);
  if (withData.length === 0) return 0;
  const total = withData.reduce((sum: number, p: any) => sum + p.avgTotalScore * p.count, 0);
  const count = withData.reduce((sum: number, p: any) => sum + p.count, 0);
  return count > 0 ? total / count : 0;
});

const topProgram = computed(() => {
  const withData = programBreakdown.value.filter((p: any) => p.count > 0);
  if (withData.length === 0) return '—';
  return withData[0].programCode;
});

const programsWithData = computed(() => {
  return programBreakdown.value.filter((p: any) => p.count > 0 && !p.noKpiData);
});

const programHexColors: Record<string, string> = {
  ACC: '#3F63C5', AVI: '#1D7DAA', BA: '#0D875E', ECO: '#7C51AA',
  HRM: '#CD3774', TRM: '#EC5101', LOG: '#B8860B', DEAN: '#6B7280'
};

const initBarChart = () => {
  if (!programBarChart.value || programsWithData.value.length === 0) return;
  if (barChartInstance) barChartInstance.destroy();
  const programs = programsWithData.value;
  barChartInstance = new Chart(programBarChart.value, {
    type: 'bar',
    data: {
      labels: programs.map((p: any) => p.programCode),
      datasets: [
        {
          label: 'Total Score',
          data: programs.map((p: any) => p.avgTotalScore),
          backgroundColor: programs.map((p: any) => programHexColors[p.programCode] || '#6B7280'),
          borderRadius: 6,
          barPercentage: 0.7
        },
        {
          label: 'Academic',
          data: programs.map((p: any) => p.avgAcademic),
          backgroundColor: 'rgba(16, 185, 129, 0.45)',
          borderRadius: 6,
          barPercentage: 0.7
        },
        {
          label: 'Behavior',
          data: programs.map((p: any) => p.avgBehavior),
          backgroundColor: 'rgba(139, 92, 246, 0.4)',
          borderRadius: 6,
          barPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + '%' } },
        y: { grid: { display: false } }
      },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 15, font: { size: 11 } } }
      }
    }
  });
};

const getScoreColorClass = (s: number) => s >= 85 ? 'text-emerald-600' : s >= 75 ? 'text-blue-600' : s >= 65 ? 'text-amber-600' : 'text-red-600';
const getScoreBarClass = (s: number) => s >= 85 ? 'bg-emerald-400' : s >= 75 ? 'bg-blue-400' : s >= 65 ? 'bg-amber-400' : 'bg-red-400';
const getPerformanceLevel = (s: number) => s >= 85 ? 'Excellent' : s >= 75 ? 'Good' : s >= 65 ? 'Moderate' : s >= 55 ? 'Poor' : 'Very Poor';
const getLevelBadge = (s: number) => s >= 85 ? 'bg-emerald-100 text-emerald-700' : s >= 75 ? 'bg-blue-100 text-blue-700' : s >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

const getToken = async (): Promise<string | null> => {
  let attempts = 0;
  while (!user.value && attempts < 20) { await new Promise(r => setTimeout(r, 250)); attempts++; }
  if (!user.value) return null;
  try { return await user.value.getIdToken(); } catch { return null; }
};

// Fetch program data - uses program-overview endpoint first (fast), then tries cached (full data)
const fetchProgramData = async () => {
  loading.value = true;
  error.value = null;
  dataIncomplete.value = false;
  stopPolling();
  
  try {
    const token = await getToken();
    if (!token) { error.value = 'Authentication required.'; return; }
    const evalId = selectedEvaluationPeriod.value || 9;
    
    // Use AbortController for 30s timeout on the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // Try program-overview first (fast endpoint, instant return)
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/kpi/program-overview?evaluateid=${evalId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        programBreakdown.value = (result.data.programBreakdown || [])
          .filter((p: any) => p.programCode && p.programCode !== 'N/A');
        totalLecturers.value = result.data.totalLecturers || 0;
        
        // If data is not complete, start polling for full data
        if (!result.data.complete) {
          dataIncomplete.value = true;
          startPolling(evalId, token);
        } else {
          dataIncomplete.value = false;
        }
      } else {
        throw new Error(result.message || 'Failed to load');
      }
    } catch (overviewErr: any) {
      if (overviewErr.name === 'AbortError') {
        throw new Error('Request timed out. The server may be loading data. Please try again in a moment.');
      }
      
      // Fallback to cached endpoint
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 60000);
      
      const response = await fetch(`${BACKEND_URL}/api/admin/kpi/cached?evaluateid=${evalId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller2.signal
      });
      clearTimeout(timeoutId2);
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        programBreakdown.value = (result.data.programBreakdown || [])
          .filter((p: any) => p.programCode && p.programCode !== 'N/A');
        totalLecturers.value = result.data.totalLecturers || 0;
        dataIncomplete.value = !result.data.complete;
        
        if (!result.data.complete) {
          startPolling(evalId, token);
        }
      } else {
        throw new Error(result.message || 'Failed to load');
      }
    }
  } catch (err: any) {
    error.value = err.name === 'AbortError' 
      ? 'Request timed out. The server may be loading KPI data. Please try again.'
      : (err.message || 'Failed to load data');
  } finally {
    loading.value = false;
  }
};

// Poll for complete data (when cache is being built in background)
const startPolling = (evalId: number, token: string) => {
  stopPolling();
  let pollCount = 0;
  const maxPolls = 12; // Poll for up to 2 minutes (12 x 10s)
  
  const poll = async () => {
    if (pollCount >= maxPolls) {
      dataIncomplete.value = false; // Stop showing banner after max polls
      return;
    }
    pollCount++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${BACKEND_URL}/api/admin/kpi/program-overview?evaluateid=${evalId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          programBreakdown.value = (result.data.programBreakdown || [])
            .filter((p: any) => p.programCode && p.programCode !== 'N/A');
          totalLecturers.value = result.data.totalLecturers || 0;
          
          if (result.data.complete) {
            dataIncomplete.value = false;
            stopPolling();
            return;
          }
        }
      }
    } catch {
      // Ignore poll errors, will retry
    }
    
    // Schedule next poll
    pollTimer = setTimeout(poll, 10000);
  };
  
  // First poll after 10 seconds
  pollTimer = setTimeout(poll, 10000);
};

const stopPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
};

// Refresh handler - triggers background cache rebuild
const handleRefresh = async () => {
  refreshing.value = true;
  error.value = null;
  
  try {
    const token = await getToken();
    if (!token) { refreshing.value = false; return; }
    const evalId = selectedEvaluationPeriod.value || 9;
    
    // Trigger background cache refresh (returns immediately)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      await fetch(`${BACKEND_URL}/api/admin/kpi/cache/refresh?evaluateid=${evalId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch {
      // Even if refresh request fails/times out, we can still try to load data
    }
    
    // Mark as incomplete and start polling for new data
    dataIncomplete.value = true;
    startPolling(evalId, token);
    
    // Show refreshing state for a bit then turn off
    setTimeout(() => {
      refreshing.value = false;
    }, 2000);
    
  } catch (err: any) {
    error.value = err.message;
    refreshing.value = false;
  }
};

const onEvaluationPeriodChange = () => fetchProgramData();

onMounted(async () => {
  await fetchEvaluationPeriods();
  if (activeEvaluationPeriod.value) {
    selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
  }
  await fetchProgramData();
});

onUnmounted(() => {
  stopPolling();
  if (barChartInstance) barChartInstance.destroy();
});

// Watch for programBreakdown changes to reinit chart
watch(programBreakdown, async () => {
  await nextTick();
  initBarChart();
}, { deep: true });
</script>
