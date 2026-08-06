<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <button @click="router.push('/admin/program-analytics')" class="text-gray-400 hover:text-[#1e3a5f] transition-colors">
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
      <div class="flex items-center gap-3">
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
        <div class="relative w-full sm:w-48 lg:w-auto">
          <select
            v-model="selectedEvaluationPeriod"
            @change="onEvaluationPeriodChange"
            class="w-full appearance-none bg-white border-2 border-[#4697b9] rounded-lg py-2.5 pl-3 pr-8 shadow-sm text-xs sm:text-sm font-medium text-[#004086] focus:outline-none focus:ring-2 focus:ring-[#4697b9]"
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
    </div>

    <!-- Loading Banner (data being built) -->
    <div v-if="dataIncomplete && !loading" class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <svg class="h-5 w-5 text-amber-500 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <div>
        <p class="text-sm font-medium text-amber-800">KPI data is loading from MFU API...</p>
        <p class="text-xs text-amber-600">Scores will appear automatically once ready. This may take 30-60 seconds.</p>
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
                  :style="{ width: Math.max((programLecturers.length > 0 ? (track.count / programLecturers.length * 100) : 0), 8) + '%', backgroundColor: track.color }">
                  <span class="text-xs font-bold text-white drop-shadow-sm">{{ track.count }}</span>
                </div>
              </div>
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
                  <template v-if="dataIncomplete">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004086] mx-auto mb-3"></div>
                    <p class="text-sm">Loading lecturer data from MFU API...</p>
                    <p class="text-xs text-gray-400 mt-1">This may take 30-60 seconds</p>
                  </template>
                  <template v-else>
                    No lecturers found for this program
                  </template>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';

definePageMeta({
  layout: 'admin'
});

const router = useRouter();
const route = useRoute();
const programCode = (route.params.programCode as string)?.toUpperCase() || '';

// Composables
const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();

const runtimeConfig = useRuntimeConfig();
const BACKEND_URL = runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app';

const selectedEvaluationPeriod = ref<number | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const dataIncomplete = ref(false);
const programLecturers = ref<any[]>([]);
let pollTimer: ReturnType<typeof setTimeout> | null = null;

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

// Sort by score descending
const sortedProgramLecturers = computed(() => {
  return [...programLecturers.value].sort((a, b) => b.overallPerformance.totalScore - a.overallPerformance.totalScore);
});

// Program stats
const programStats = computed(() => {
  const data = programLecturers.value;
  if (data.length === 0) return { avgTotal: 0, avgAcademic: 0, avgBehavior: 0 };
  
  return {
    avgTotal: data.reduce((sum: number, l: any) => sum + l.overallPerformance.totalScore, 0) / data.length,
    avgAcademic: data.reduce((sum: number, l: any) => sum + l.overallPerformance.academicPerformance, 0) / data.length,
    avgBehavior: data.reduce((sum: number, l: any) => sum + l.overallPerformance.behavior, 0) / data.length,
  };
});

// Performance level distribution
const performanceLevels = computed(() => {
  const data = programLecturers.value;
  return [
    { name: 'Excellent', count: data.filter((l: any) => l.performanceLevel === 'Excellent').length, barClass: 'bg-yellow-400', textClass: 'text-yellow-700' },
    { name: 'Good', count: data.filter((l: any) => l.performanceLevel === 'Good').length, barClass: 'bg-emerald-400', textClass: 'text-emerald-700' },
    { name: 'Moderate', count: data.filter((l: any) => l.performanceLevel === 'Moderate').length, barClass: 'bg-blue-400', textClass: 'text-blue-700' },
    { name: 'Poor', count: data.filter((l: any) => l.performanceLevel === 'Poor').length, barClass: 'bg-orange-400', textClass: 'text-orange-700' },
    { name: 'Very Poor', count: data.filter((l: any) => l.performanceLevel === 'Very Poor').length, barClass: 'bg-red-400', textClass: 'text-red-700' },
  ];
});

// Track distribution within program
const trackDistribution = computed(() => {
  const data = programLecturers.value;
  const trackColors: Record<string, string> = {
    'Teaching': '#4b5563', // Assuming slate-600 from user screenshot for Teaching
    'Academic Service': '#10b981', // emerald-500
    'Research': '#0ea5e9', // sky-500
    'Administration': '#8b5cf6', // violet-500
    'Arts & Culture': '#ec4899' // pink-500
  };
  
  const trackNames = ['Teaching', 'Academic Service', 'Research', 'Administration', 'Arts & Culture'];
  const trackMap = new Map<string, { count: number; totalScore: number }>();
  
  // Pre-fill all tracks with 0
  trackNames.forEach(name => {
    trackMap.set(name, { count: 0, totalScore: 0 });
  });

  data.forEach((l: any) => {
    let rawTrack = l.domainScoreName;
    if (!rawTrack || typeof rawTrack !== 'string') rawTrack = 'Teaching';
    
    let track = rawTrack.trim();
    if (track === 'Academic Administration') track = 'Administration';
    if (track === 'Arts and Culture') track = 'Arts & Culture';
    
    if (!trackMap.has(track)) {
      trackMap.set(track, { count: 0, totalScore: 0 });
    }
    
    const existing = trackMap.get(track)!;
    existing.count++;
    existing.totalScore += l.overallPerformance.totalScore;
  });
  
  // Map standard ones first, then any extra
  const result = trackNames.map(name => {
    const info = trackMap.get(name)!;
    return {
      name,
      count: info.count,
      avgScore: info.count > 0 ? info.totalScore / info.count : 0,
      color: trackColors[name] || '#6b7280'
    };
  });
  
  trackMap.forEach((info, name) => {
    if (!trackNames.includes(name)) {
      result.push({
        name,
        count: info.count,
        avgScore: info.count > 0 ? info.totalScore / info.count : 0,
        color: trackColors[name] || '#6b7280'
      });
    }
  });

  return result;
});

// Domain averages for the program
const domainAverages = computed(() => {
  const data = programLecturers.value;
  if (data.length === 0) return [];
  
  const domainLabels = ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'];
  const domainColors = ['#005F99', '#00BFFF', '#7FD6D6', '#7c3aed', '#8A8BE6'];
  
  return domainLabels.map((name, i) => {
    const domainKey = `domain${i + 1}` as string;
    const avgScore = data.reduce((sum: number, l: any) => sum + (l.domainScores?.[domainKey] || 0), 0) / data.length;
    const avgWeight = data.reduce((sum: number, l: any) => sum + (l.domainWeights?.[domainKey] || 0), 0) / data.length;
    return { name, avgScore, avgWeight, color: domainColors[i] };
  });
});

// Get Firebase token
const getToken = async (): Promise<string | null> => {
  let attempts = 0;
  while (!user.value && attempts < 20) { await new Promise(r => setTimeout(r, 250)); attempts++; }
  if (!user.value) return null;
  try { return await user.value.getIdToken(); } catch { return null; }
};

// Fetch program data from server-side cache
const fetchProgramData = async () => {
  loading.value = true;
  dataIncomplete.value = false;
  stopPolling();

  try {
    const token = await getToken();
    if (!token) { loading.value = false; return; }
    const evalId = selectedEvaluationPeriod.value || 9;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(
      `${BACKEND_URL}/api/admin/kpi/cached?evaluateid=${evalId}&program_code=${programCode}`,
      {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (result.success && result.data) {
      programLecturers.value = result.data.lecturers || [];
      
      // If data is not complete, poll for updates
      if (!result.data.complete) {
        dataIncomplete.value = true;
        startPolling(evalId, token);
      } else {
        dataIncomplete.value = false;
      }
    }
  } catch (err: any) {
    console.error('[ProgramDetail] Error fetching data:', err);
    // If server cache isn't ready, start polling
    dataIncomplete.value = true;
    const token = await getToken();
    if (token) {
      startPolling(selectedEvaluationPeriod.value || 9, token);
    }
  } finally {
    loading.value = false;
  }
};

// Poll for complete data
const startPolling = (evalId: number, token: string) => {
  stopPolling();
  let pollCount = 0;
  const maxPolls = 12; // 2 minutes max
  
  const poll = async () => {
    if (pollCount >= maxPolls) {
      dataIncomplete.value = false;
      return;
    }
    pollCount++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `${BACKEND_URL}/api/admin/kpi/cached?evaluateid=${evalId}&program_code=${programCode}`,
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          programLecturers.value = result.data.lecturers || [];
          
          if (result.data.complete && programLecturers.value.length > 0) {
            dataIncomplete.value = false;
            stopPolling();
            return;
          }
        }
      }
    } catch {
      // Ignore poll errors
    }
    
    pollTimer = setTimeout(poll, 10000);
  };
  
  pollTimer = setTimeout(poll, 8000);
};

const stopPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
};

// Refresh handler
const handleRefresh = async () => {
  refreshing.value = true;
  
  try {
    const token = await getToken();
    if (!token) { refreshing.value = false; return; }
    const evalId = selectedEvaluationPeriod.value || 9;
    
    // Trigger background cache refresh
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      await fetch(`${BACKEND_URL}/api/admin/kpi/cache/refresh?evaluateid=${evalId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch {
      // Even if refresh request fails, continue polling
    }
    
    dataIncomplete.value = true;
    startPolling(evalId, token);
    
    setTimeout(() => { refreshing.value = false; }, 2000);
  } catch {
    refreshing.value = false;
  }
};

// Navigation
const navigateToDetail = (staffCode: string) => {
  router.push({
    path: `/admin/kpi/${staffCode}`,
    query: { round: String(selectedEvaluationPeriod.value || 9) }
  });
};

const onEvaluationPeriodChange = () => fetchProgramData();

// Helpers
const getPerformanceLevel = (s: number) => s >= 85 ? 'Excellent' : s >= 75 ? 'Good' : s >= 65 ? 'Moderate' : s >= 55 ? 'Poor' : 'Very Poor';

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
    'LOG': 'bg-[#FFF3D6] text-[#B8860B]',
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

// Initialize
onMounted(async () => {
  await fetchEvaluationPeriods();
  
  // Use round from query param (passed from program-analytics overview) if available
  const roundFromQuery = route.query.round ? Number(route.query.round) : null;
  
  if (roundFromQuery && !isNaN(roundFromQuery)) {
    selectedEvaluationPeriod.value = roundFromQuery;
  } else if (activeEvaluationPeriod.value) {
    selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
  }
  
  await fetchProgramData();
});

onUnmounted(() => {
  stopPolling();
});
</script>
