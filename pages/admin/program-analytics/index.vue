<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <div class="flex items-center gap-3">
          <div class="bg-[#004086] p-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900">Program Analytics</h1>
            <p class="text-gray-600 text-sm mt-1">KPI performance breakdown by academic program</p>
          </div>
        </div>
      </div>
      <!-- Evaluation Period Selector -->
      <div class="relative w-full sm:w-48 lg:w-auto">
        <select
          v-model="selectedEvaluationPeriod"
          @change="onEvaluationPeriodChange"
          class="w-full appearance-none bg-white border-0 rounded-lg py-2.5 pl-3 pr-8 shadow-sm ring-2 ring-[#004086] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004086]"
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

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-4 w-20 bg-gray-200 rounded mb-3"></div>
          <div class="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="'s'+i" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div class="h-12 w-20 bg-gray-200 rounded mb-3 mx-auto"></div>
          <div class="h-3 w-full bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <p class="text-3xl font-bold text-blue-600">{{ programAggregates.length }}</p>
          <p class="text-sm text-blue-700">Programs</p>
        </div>
        <div class="bg-green-50 rounded-lg p-4 text-center border border-green-100">
          <p class="text-3xl font-bold text-green-600">{{ combinedKpiData.length }}</p>
          <p class="text-sm text-green-700">Total Lecturers</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
          <p class="text-3xl font-bold text-purple-600">{{ overallAvg.toFixed(1) }}%</p>
          <p class="text-sm text-purple-700">Overall Avg Score</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
          <p class="text-3xl font-bold text-orange-600">{{ topProgram }}</p>
          <p class="text-sm text-orange-700">Top Program</p>
        </div>
      </div>

      <!-- Program Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="prog in programAggregates" 
          :key="prog.programCode"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 relative"
        >
          <!-- Program Header -->
          <div class="flex items-center mb-5">
            <div :class="[getProgramStyle(prog.programCode).color, 'p-4 rounded-xl mr-5 shadow-sm']">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-xl leading-tight">{{ programNames[prog.programCode] || prog.programCode }}</h3>
              <span class="text-xs text-gray-500 font-mono">{{ prog.programCode }}</span>
            </div>
          </div>

          <!-- Score -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center bg-gray-50 rounded-lg py-2">
              <p class="text-xl font-bold" :class="getScoreColorClass(prog.avgTotalScore)">{{ prog.avgTotalScore.toFixed(1) }}%</p>
              <p class="text-[10px] text-gray-500 font-medium">Total Score</p>
            </div>
            <div class="text-center bg-gray-50 rounded-lg py-2">
              <p class="text-xl font-bold text-emerald-600">{{ prog.avgAcademic.toFixed(1) }}%</p>
              <p class="text-[10px] text-gray-500 font-medium">Academic</p>
            </div>
            <div class="text-center bg-gray-50 rounded-lg py-2">
              <p class="text-xl font-bold text-purple-600">{{ prog.avgBehavior.toFixed(1) }}%</p>
              <p class="text-[10px] text-gray-500 font-medium">Behavior</p>
            </div>
          </div>

          <!-- Lecturers Count + Progress -->
          <div class="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="text-sm text-gray-700">{{ prog.count }} Lecturers</span>
          </div>

          <!-- Score Bar -->
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div class="h-full rounded-full transition-all duration-500" :style="{ width: Math.min(prog.avgTotalScore, 100) + '%' }" :class="getScoreBarClass(prog.avgTotalScore)"></div>
          </div>

          <!-- Action Button -->
          <NuxtLink 
            :to="'/admin/kpi/program/' + prog.programCode.toLowerCase()"
            :class="[getProgramStyle(prog.programCode).buttonColor, getProgramStyle(prog.programCode).textColor, 'w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md active:scale-95']"
          >
            <svg width="16" height="10" viewBox="0 0 18 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0.178711C4.28375 0.178711 0.5625 4.99996 0.5625 4.99996C0.5625 4.99996 4.28375 9.82184 9 9.82184C12.6062 9.82184 17.4375 4.99996 17.4375 4.99996C17.4375 4.99996 12.6062 0.178711 9 0.178711ZM9 8.00371C7.34375 8.00371 5.99563 6.65621 5.99563 4.99996C5.99563 3.34371 7.34375 1.99559 9 1.99559C10.6562 1.99559 12.0044 3.34371 12.0044 4.99996C12.0044 6.65621 10.6562 8.00371 9 8.00371Z" />
            </svg>
            View KPI Details
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="programAggregates.length === 0 && !loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Program Data Available</h3>
        <p class="text-gray-500">KPI data is still loading. Please wait or check the Performance Analytics page.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import { useKpiCache } from '@/composables/useKpiCache';
import { useAdminKpiApi } from '@/composables/useAdminKpiApi';
import { computed, onMounted, ref } from 'vue';

definePageMeta({
  layout: 'admin'
});

const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();
const { cachedKpiData, hasCachedData, initializeFromStorage, refreshCache } = useKpiCache();
const { fetchAllLecturersKpi, allLecturersKpi, isLoading: kpiLoading } = useAdminKpiApi();

const selectedEvaluationPeriod = ref<number | null>(null);
const hasInitialCache = typeof window !== 'undefined' ? (() => { initializeFromStorage(); return hasCachedData(); })() : false;
const loading = ref(!hasInitialCache);

// Program names
const programNames: Record<string, string> = {
  'ACC': 'Accounting',
  'BA': 'Business Administration',
  'ECO': 'Economics',
  'TRM': 'Tourism Management',
  'AVI': 'Aviation Management',
  'HRM': 'Hospitality Management',
  'LOG': 'Logistics Management',
  'DEAN': 'Dean Office'
};

// Program styles — same as dashboard
const programStyleMap: Record<string, { color: string; buttonColor: string; textColor: string }> = {
  ACC: { color: 'bg-[#3F63C5]', buttonColor: 'bg-[#E0EFFF]', textColor: 'text-[#3F63C5]' },
  AVI: { color: 'bg-[#1D7DAA]', buttonColor: 'bg-[#DEF3FA]', textColor: 'text-[#1D7DAA]' },
  BA: { color: 'bg-[#0D875E]', buttonColor: 'bg-[#D3F3E3]', textColor: 'text-[#0D875E]' },
  ECO: { color: 'bg-[#7C51AA]', buttonColor: 'bg-[#F1E8FD]', textColor: 'text-[#7C51AA]' },
  HRM: { color: 'bg-[#CD3774]', buttonColor: 'bg-[#FFE2F1]', textColor: 'text-[#CD3774]' },
  TRM: { color: 'bg-[#EC5101]', buttonColor: 'bg-[#FFEBD3]', textColor: 'text-[#EC5101]' },
  LOG: { color: 'bg-[#EC5101]', buttonColor: 'bg-[#FCE2E5]', textColor: 'text-[#EC5101]' },
  DEAN: { color: 'bg-[#7C51AA]', buttonColor: 'bg-[#F6F3FC]', textColor: 'text-[#7C51AA]' }
};
const defaultStyle = { color: 'bg-gray-500', buttonColor: 'bg-gray-100', textColor: 'text-gray-600' };
const getProgramStyle = (code: string) => programStyleMap[code] || defaultStyle;

// Combined data
const combinedKpiData = computed(() => {
  if (cachedKpiData.value && cachedKpiData.value.length > 0) return cachedKpiData.value;
  return allLecturersKpi.value || [];
});

// Program aggregates
const programAggregates = computed(() => {
  const data = combinedKpiData.value;
  if (data.length === 0) return [];
  const map = new Map<string, { count: number; totalScoreSum: number; academicSum: number; behaviorSum: number }>();
  data.forEach(l => {
    const code = l.programCode || 'N/A';
    if (code === 'N/A') return;
    const existing = map.get(code) || { count: 0, totalScoreSum: 0, academicSum: 0, behaviorSum: 0 };
    existing.count++;
    existing.totalScoreSum += l.overallPerformance.totalScore;
    existing.academicSum += l.overallPerformance.academicPerformance;
    existing.behaviorSum += l.overallPerformance.behavior;
    map.set(code, existing);
  });
  return Array.from(map.entries())
    .map(([programCode, info]) => ({
      programCode,
      count: info.count,
      avgTotalScore: info.totalScoreSum / info.count,
      avgAcademic: info.academicSum / info.count,
      avgBehavior: info.behaviorSum / info.count
    }))
    .sort((a, b) => b.avgTotalScore - a.avgTotalScore);
});

const overallAvg = computed(() => {
  const data = combinedKpiData.value;
  if (data.length === 0) return 0;
  return data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length;
});

const topProgram = computed(() => {
  if (programAggregates.value.length === 0) return '-';
  return programAggregates.value[0].programCode;
});

const getScoreColorClass = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 65) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBarClass = (score: number) => {
  if (score >= 85) return 'bg-emerald-400';
  if (score >= 75) return 'bg-blue-400';
  if (score >= 65) return 'bg-amber-400';
  return 'bg-red-400';
};

const onEvaluationPeriodChange = async () => {
  loading.value = true;
  try {
    await refreshCache(selectedEvaluationPeriod.value || 9);
  } catch (err) {
    console.error('[ProgramAnalytics] Error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  initializeFromStorage();
  if (hasCachedData()) {
    loading.value = false;
    fetchEvaluationPeriods().then(() => {
      if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
        selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
      }
    });
    return;
  }
  let attempts = 0;
  while (!user.value && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    attempts++;
  }
  await fetchEvaluationPeriods();
  if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
    selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
  }
  await fetchAllLecturersKpi(selectedEvaluationPeriod.value || 9);
  loading.value = false;
});
</script>
