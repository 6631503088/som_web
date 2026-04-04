<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <button @click="router.push('/admin/kpi')" class="text-gray-400 hover:text-[#1e3a5f] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ programName || programCode }} Program
          </h1>
          <span class="px-3 py-1 text-sm font-bold rounded-lg" :class="getProgramBadgeClass(programCode)">
            {{ programCode }}
          </span>
        </div>
        <p class="text-sm text-gray-600 ml-8">
          Program-level KPI analysis — {{ programLecturers.length }} lecturers
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

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
        <p class="text-gray-500">Loading program KPI data...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Program Overview Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-[#004086] to-[#1a6bb5] rounded-xl p-5 text-white shadow-sm">
          <p class="text-sm text-white/70 mb-1">Avg Total Score</p>
          <p class="text-3xl font-bold">{{ programStats.avgTotal.toFixed(1) }}%</p>
          <p class="text-xs text-white/50 mt-1">{{ programLecturers.length }} lecturers</p>
        </div>
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-sm">
          <p class="text-sm text-white/70 mb-1">Avg Academic (60%)</p>
          <p class="text-3xl font-bold">{{ programStats.avgAcademic.toFixed(1) }}%</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-sm">
          <p class="text-sm text-white/70 mb-1">Avg Behavior (40%)</p>
          <p class="text-3xl font-bold">{{ programStats.avgBehavior.toFixed(1) }}%</p>
        </div>
        <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Performance Level</p>
          <p class="text-3xl font-bold" :class="getScoreColorClass(programStats.avgTotal)">{{ getPerformanceLevel(programStats.avgTotal) }}</p>
          <p class="text-xs text-gray-400 mt-1">Based on avg total score</p>
        </div>
      </div>

      <!-- Performance Distribution & Track Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Performance Level Distribution -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performance Distribution</h3>
          <div class="space-y-3">
            <div v-for="level in performanceLevels" :key="level.name" class="flex items-center gap-3">
              <span class="w-20 text-xs font-medium" :class="level.textClass">{{ level.name }}</span>
              <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  :class="level.barClass"
                  :style="{ width: programLecturers.length > 0 ? Math.max((level.count / programLecturers.length * 100), level.count > 0 ? 15 : 0) + '%' : '0%' }">
                  <span v-if="level.count > 0" class="text-xs font-bold text-white drop-shadow-sm">{{ level.count }}</span>
                </div>
              </div>
              <span class="w-8 text-xs text-gray-400 text-right">{{ programLecturers.length > 0 ? ((level.count / programLecturers.length) * 100).toFixed(0) : 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Track Distribution -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Track Distribution</h3>
          <div class="space-y-3">
            <div v-for="track in trackDistribution" :key="track.name" class="flex items-center gap-3">
              <span class="w-32 text-xs font-medium text-gray-700 truncate">{{ track.name }}</span>
              <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  :style="{ width: programLecturers.length > 0 ? Math.max((track.count / programLecturers.length * 100), track.count > 0 ? 15 : 0) + '%' : '0%', backgroundColor: track.color }">
                  <span v-if="track.count > 0" class="text-xs font-bold text-white drop-shadow-sm">{{ track.count }}</span>
                </div>
              </div>
              <span class="w-16 text-xs text-gray-500 text-right font-medium">{{ track.avgScore.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Domain Averages -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-[#004086] to-[#1a6bb5] px-6 py-4">
          <h2 class="text-lg font-bold text-white">Domain Performance (Program Average)</h2>
          <p class="text-white/60 text-sm">Average domain scores for {{ programCode }} lecturers</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div v-for="(domain, idx) in domainAverages" :key="idx" class="text-center p-4 bg-gray-50 rounded-xl">
            <div class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm" :style="{ backgroundColor: domain.color }">
              {{ domain.avgScore.toFixed(0) }}%
            </div>
            <p class="text-xs font-semibold text-gray-700 mb-1">{{ domain.name }}</p>
            <p class="text-[10px] text-gray-400">Avg Weight: {{ domain.avgWeight.toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <!-- Lecturers Table -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-900">{{ programCode }} Lecturers ({{ programLecturers.length }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">#</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Track</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Score</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Level</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Academic</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider bg-[#e8f4fc]">Behavior</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="programLecturers.length === 0">
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                  No lecturers found for this program
                </td>
              </tr>
              <tr 
                v-for="(lecturer, idx) in sortedProgramLecturers" 
                :key="lecturer.staffCode"
                class="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                @click="navigateToDetail(lecturer.staffCode)"
              >
                <td class="px-4 py-3 text-sm text-gray-400">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" :class="avatarColors[idx % avatarColors.length]">
                      {{ getInitials(lecturer.staffName) }}
                    </div>
                    <div class="ml-3">
                      <p class="font-medium text-gray-900 text-sm group-hover:text-[#1e3a5f] transition-colors">{{ lecturer.staffName }}</p>
                      <p class="text-xs text-gray-500">{{ lecturer.staffCode }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full" :class="getTrackBadgeClass(lecturer.domainScoreName)">
                    {{ lecturer.domainScoreName || 'Teaching' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center bg-gray-50/50">
                  <span class="text-lg font-bold text-gray-900">{{ lecturer.overallPerformance.totalScore.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center bg-gray-50/50">
                  <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full" :class="getPerformanceBadgeClass(lecturer.performanceLevel)">
                    {{ lecturer.performanceLevel }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50/50">
                  {{ lecturer.overallPerformance.academicPerformance.toFixed(1) }}%
                </td>
                <td class="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50/50">
                  {{ lecturer.overallPerformance.behavior.toFixed(1) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import { useKpiCache } from '@/composables/useKpiCache';
import { useAdminKpiApi, type LecturerKpiData } from '@/composables/useAdminKpiApi';
import { computed, onMounted, ref } from 'vue';

definePageMeta({
  layout: 'admin'
});

const router = useRouter();
const route = useRoute();
const programCode = (route.params.programCode as string)?.toUpperCase() || '';

// Composables
const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();
const { cachedKpiData, hasCachedData, initializeFromStorage, refreshCache } = useKpiCache();
const { fetchAllLecturersKpi, allLecturersKpi, isLoading: kpiLoading, getPerformanceLevel } = useAdminKpiApi();

const selectedEvaluationPeriod = ref<number | null>(null);
const loading = ref(true);

// Initialize from cache immediately
if (typeof window !== 'undefined') {
  initializeFromStorage();
}

// Program name lookup
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
const programName = programNames[programCode] || programCode;

// Combined KPI data source
const combinedKpiData = computed(() => {
  if (cachedKpiData.value && cachedKpiData.value.length > 0) {
    return cachedKpiData.value;
  }
  return allLecturersKpi.value || [];
});

// Filter lecturers belonging to this program
const programLecturers = computed(() => {
  return combinedKpiData.value.filter(l => l.programCode === programCode);
});

// Sort by score descending
const sortedProgramLecturers = computed(() => {
  return [...programLecturers.value].sort((a, b) => b.overallPerformance.totalScore - a.overallPerformance.totalScore);
});

// Program stats
const programStats = computed(() => {
  const data = programLecturers.value;
  if (data.length === 0) return { avgTotal: 0, avgAcademic: 0, avgBehavior: 0 };
  
  return {
    avgTotal: data.reduce((sum, l) => sum + l.overallPerformance.totalScore, 0) / data.length,
    avgAcademic: data.reduce((sum, l) => sum + l.overallPerformance.academicPerformance, 0) / data.length,
    avgBehavior: data.reduce((sum, l) => sum + l.overallPerformance.behavior, 0) / data.length,
  };
});

// Performance level distribution
const performanceLevels = computed(() => {
  const data = programLecturers.value;
  return [
    { name: 'Excellent', count: data.filter(l => l.performanceLevel === 'Excellent').length, barClass: 'bg-yellow-400', textClass: 'text-yellow-700' },
    { name: 'Good', count: data.filter(l => l.performanceLevel === 'Good').length, barClass: 'bg-emerald-400', textClass: 'text-emerald-700' },
    { name: 'Moderate', count: data.filter(l => l.performanceLevel === 'Moderate').length, barClass: 'bg-blue-400', textClass: 'text-blue-700' },
    { name: 'Poor', count: data.filter(l => l.performanceLevel === 'Poor').length, barClass: 'bg-orange-400', textClass: 'text-orange-700' },
    { name: 'Very Poor', count: data.filter(l => l.performanceLevel === 'Very Poor').length, barClass: 'bg-red-400', textClass: 'text-red-700' },
  ];
});

// Track distribution within program
const trackDistribution = computed(() => {
  const data = programLecturers.value;
  const trackColors: Record<string, string> = {
    'Teaching': '#2563eb',
    'Research': '#0891b2',
    'Academic Service': '#059669',
    'Academic Administration': '#7c3aed'
  };
  
  const trackMap = new Map<string, { count: number; totalScore: number }>();
  data.forEach(l => {
    const track = l.domainScoreName || 'Teaching';
    const existing = trackMap.get(track) || { count: 0, totalScore: 0 };
    existing.count++;
    existing.totalScore += l.overallPerformance.totalScore;
    trackMap.set(track, existing);
  });
  
  return Array.from(trackMap.entries())
    .map(([name, info]) => ({
      name,
      count: info.count,
      avgScore: info.totalScore / info.count,
      color: trackColors[name] || '#6b7280'
    }))
    .sort((a, b) => b.count - a.count);
});

// Domain averages for the program
const domainAverages = computed(() => {
  const data = programLecturers.value;
  if (data.length === 0) return [];
  
  const domainLabels = ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'];
  const domainColors = ['#005F99', '#00BFFF', '#7FD6D6', '#7c3aed', '#8A8BE6'];
  
  return domainLabels.map((name, i) => {
    const domainKey = `domain${i + 1}` as keyof typeof data[0]['domainScores'];
    const avgScore = data.reduce((sum, l) => sum + (l.domainScores[domainKey] || 0), 0) / data.length;
    const avgWeight = data.reduce((sum, l) => sum + (l.domainWeights[domainKey] || 0), 0) / data.length;
    return { name, avgScore, avgWeight, color: domainColors[i] };
  });
});

// Navigation
const navigateToDetail = (staffCode: string) => {
  router.push({
    path: `/admin/kpi/${staffCode}`,
    query: { round: String(selectedEvaluationPeriod.value || 9) }
  });
};

// Helpers
const avatarColors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
];

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return name.charAt(0).toUpperCase();
};

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

const getTrackBadgeClass = (track: string) => {
  switch (track as string) {
    case 'Teaching': return 'bg-blue-100 text-blue-700';
    case 'Research': return 'bg-cyan-100 text-cyan-700';
    case 'Academic Service': return 'bg-emerald-100 text-emerald-700';
    case 'Academic Administration': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getProgramBadgeClass = (code: string) => {
  const colors: Record<string, string> = {
    'ACC': 'bg-[#E0EFFF] text-[#3F63C5]',
    'BA': 'bg-[#D3F3E3] text-[#0D875E]',
    'ECO': 'bg-[#F1E8FD] text-[#7C51AA]',
    'TRM': 'bg-[#FFEBD3] text-[#EC5101]',
    'AVI': 'bg-[#DEF3FA] text-[#1D7DAA]',
    'HRM': 'bg-[#FFE2F1] text-[#CD3774]',
    'LOG': 'bg-[#FCE2E5] text-[#EC5101]',
    'DEAN': 'bg-[#F6F3FC] text-[#7C51AA]'
  };
  return colors[code] || 'bg-gray-100 text-gray-600';
};

const getScoreColorClass = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 65) return 'text-amber-600';
  return 'text-red-600';
};

const onEvaluationPeriodChange = async () => {
  const evalId = selectedEvaluationPeriod.value || 9;
  loading.value = true;
  try {
    await refreshCache(evalId);
  } catch (err) {
    console.error('[Program KPI] Error loading period data:', err);
  } finally {
    loading.value = false;
  }
};

// Initialize
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

  // No cache — fetch fresh
  let attempts = 0;
  while (!user.value && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    attempts++;
  }

  await fetchEvaluationPeriods();
  if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
    selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
  }

  const evalId = selectedEvaluationPeriod.value || 9;
  await fetchAllLecturersKpi(evalId);
  loading.value = false;
});
</script>
