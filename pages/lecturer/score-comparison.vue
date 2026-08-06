<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#4697b9] bg-clip-text text-transparent">
            Score Comparison
          </h1>
          <p class="text-gray-600 mt-1">
            Compare your KPI performance across multiple evaluation rounds
          </p>
        </div>
        <div v-if="staffName" class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-600">{{ staffName }}</span>
        </div>
      </div>

      <!-- Round Selector -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-gray-800">Select Rounds to Compare</h3>
            <p class="text-xs text-gray-500 mt-0.5">Choose 2–5 rounds to see your performance progression</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="selectRecentRounds"
              class="text-xs font-medium text-[#4697b9] hover:text-[#1e3a5f] hover:underline transition-colors"
            >
              Select Recent 3
            </button>
            <button
              @click="clearSelection"
              class="text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline transition-colors"
            >
              Clear All
            </button>
            <div v-if="isLoading" class="flex items-center gap-2 text-[#4697b9] text-sm">
              <div class="w-4 h-4 border-2 border-[#4697b9]/30 border-t-[#4697b9] rounded-full animate-spin"></div>
              Loading...
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="period in sortedPeriods"
            :key="period.evaluateid"
            @click="toggleRound(period.evaluateid)"
            class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border"
            :class="selectedRounds.includes(period.evaluateid)
              ? 'bg-[#4697b9] text-white border-[#4697b9] shadow-md shadow-[#4697b9]/20 scale-105'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#4697b9]/50 hover:bg-blue-50'"
            :disabled="isLoading"
          >
            {{ period.evaluatename }}
          </button>
        </div>
        <div v-if="selectedRounds.length > 0 && selectedRounds.length < 2" class="mt-3 text-xs text-amber-600 flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Select at least one more round to start comparing
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="comparisonData.length < 2 && !isLoading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-[#4697b9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Start Comparing</h3>
        <p class="text-sm text-gray-500 max-w-md mx-auto">
          Select 2 or more evaluation rounds above to visualize your KPI performance trends over time.
          You can compare up to 5 rounds simultaneously.
        </p>
      </div>

      <!-- Results -->
      <div v-if="comparisonData.length >= 2" class="space-y-6 animate-fadeIn">

        <!-- Track Change Alert -->
        <div v-if="trackChanges.length > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-semibold text-amber-800 text-sm">Track Changes Detected</p>
              <p class="text-xs text-amber-700 mt-1">
                Your evaluation track changed between some rounds, which shifts domain weights. 
                Total Score, Academic Performance, and Behavior scores remain comparable.
              </p>
              <div class="mt-2 space-y-1">
                <p v-for="change in trackChanges" :key="change.fromRound + change.toRound" class="text-xs text-amber-700">
                  <span class="font-medium">{{ change.fromRound }}</span> → <span class="font-medium">{{ change.toRound }}</span>:
                  <span class="font-bold">{{ change.from }}</span> → <span class="font-bold">{{ change.to }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Score Overview Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Highest Score</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ highestScore.toFixed(1) }}%</p>
            <p class="text-xs text-gray-400 mt-1">{{ highestScoreRound }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Lowest Score</p>
            <p class="text-2xl font-bold text-red-500 mt-1">{{ lowestScore.toFixed(1) }}%</p>
            <p class="text-xs text-gray-400 mt-1">{{ lowestScoreRound }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Average Score</p>
            <p class="text-2xl font-bold text-[#1e3a5f] mt-1">{{ averageScore.toFixed(1) }}%</p>
            <p class="text-xs text-gray-400 mt-1">Across {{ comparisonData.length }} rounds</p>
          </div>
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Trend</p>
            <div class="flex items-center gap-2 mt-1">
              <svg v-if="scoreTrend > 0" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg v-else-if="scoreTrend < 0" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
              <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14" />
              </svg>
              <span class="text-2xl font-bold" :class="scoreTrend > 0 ? 'text-green-600' : scoreTrend < 0 ? 'text-red-500' : 'text-gray-500'">
                {{ scoreTrend > 0 ? '+' : '' }}{{ scoreTrend.toFixed(1) }}%
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-1">First → Last round</p>
          </div>
        </div>

        <!-- Score Progression Chart -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-lg font-bold text-gray-800">Score Progression</h3>
          </div>
          <p class="text-xs text-gray-500 mb-5">Total Score, Academic Performance (60%), and Behavior (40%) trends across selected rounds</p>
          <ClientOnly>
            <div class="h-[320px] w-full">
              <canvas ref="progressionChart"></canvas>
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-[320px]">
                <div class="w-10 h-10 border-3 border-[#4697b9]/30 border-t-[#4697b9] rounded-full animate-spin"></div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Domain Scores Chart -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-lg font-bold text-gray-800">Domain Score Breakdown</h3>
          </div>
          <p class="text-xs text-gray-500 mb-5">Each domain score shown side-by-side per round — hover for score details and weight allocation</p>
          <ClientOnly>
            <div class="h-[350px] w-full">
              <canvas ref="domainChart"></canvas>
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-[350px]">
                <div class="w-10 h-10 border-3 border-[#4697b9]/30 border-t-[#4697b9] rounded-full animate-spin"></div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Detailed Comparison Table -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="p-5 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">Round-by-Round Details</h3>
            <p class="text-xs text-gray-500 mt-0.5">Domain weights shift when your track changes between rounds</p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gradient-to-r from-[#1e3a5f] to-[#4697b9]">
                  <th class="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wide sticky left-0 bg-[#1e3a5f] z-10">Metric</th>
                  <th
                    v-for="rd in comparisonData"
                    :key="rd.evaluateid"
                    class="px-5 py-3 text-center text-xs font-bold text-white uppercase tracking-wide min-w-[130px]"
                  >
                    {{ rd.evaluatename }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <!-- Track -->
                <tr class="bg-gray-50">
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10">Track</td>
                  <td
                    v-for="(rd, idx) in comparisonData"
                    :key="rd.evaluateid"
                    class="px-5 py-3 text-center"
                  >
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      :class="getTrackBadgeClass(rd.track)"
                    >
                      {{ rd.track || 'N/A' }}
                      <svg v-if="idx > 0 && rd.track !== comparisonData[idx-1].track" class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </td>
                </tr>
                <!-- Total Score -->
                <tr>
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 bg-white z-10">Total Score</td>
                  <td v-for="rd in comparisonData" :key="rd.evaluateid" class="px-5 py-3 text-center">
                    <span class="text-xl font-bold" :class="getScoreColor(rd.totalScore)">{{ rd.totalScore.toFixed(1) }}%</span>
                  </td>
                </tr>
                <!-- Academic -->
                <tr class="bg-gray-50">
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10">Academic (60%)</td>
                  <td v-for="rd in comparisonData" :key="rd.evaluateid" class="px-5 py-3 text-center font-semibold text-gray-800">
                    {{ rd.academic.toFixed(1) }}%
                  </td>
                </tr>
                <!-- Behavior -->
                <tr>
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 bg-white z-10">Behavior (40%)</td>
                  <td v-for="rd in comparisonData" :key="rd.evaluateid" class="px-5 py-3 text-center font-semibold text-gray-800">
                    {{ rd.behavior.toFixed(1) }}%
                  </td>
                </tr>
                <!-- Performance Level -->
                <tr class="bg-gray-50">
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10">Level</td>
                  <td v-for="rd in comparisonData" :key="rd.evaluateid" class="px-5 py-3 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-bold" :class="getPerformanceBadgeClass(rd.level)">{{ rd.level }}</span>
                  </td>
                </tr>
                <!-- 5 Domain Rows -->
                <tr v-for="(domain, dIdx) in domainLabels" :key="dIdx" :class="dIdx % 2 === 0 ? '' : 'bg-gray-50'">
                  <td class="px-5 py-3 font-semibold text-gray-700 text-xs sticky left-0 z-10" :class="dIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: domainColors[dIdx] }"></span>
                      {{ domain }}
                    </div>
                  </td>
                  <td v-for="rd in comparisonData" :key="rd.evaluateid" class="px-5 py-3 text-center">
                    <div class="text-sm font-semibold text-gray-800">{{ rd.scores[dIdx].toFixed(1) }}</div>
                    <div class="text-[10px] text-gray-400">of {{ rd.weights[dIdx] }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirebaseAuth } from '@/composables/useFirebaseAuth';
import { useEvaluationPeriods } from '@/composables/useEvaluationPeriods';
import Chart from 'chart.js/auto';
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';

definePageMeta({ layout: 'lecturer' });

const { user } = useFirebaseAuth();
const { evaluationPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();

const runtimeConfig = useRuntimeConfig();
const getBackendUrl = () => runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app';

const selectedRounds = ref<number[]>([]);
const comparisonData = ref<any[]>([]);
const isLoading = ref(false);
const staffName = ref('');

const progressionChart = ref<HTMLCanvasElement | null>(null);
const domainChart = ref<HTMLCanvasElement | null>(null);
let progressionChartInstance: Chart | null = null;
let domainChartInstance: Chart | null = null;

const domainLabels = ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'];
const domainColors = ['#005F99', '#00BFFF', '#7FD6D6', '#7c3aed', '#C084FC'];

// Sorted periods (newest first)
const sortedPeriods = computed(() => {
  return [...(evaluationPeriods.value || [])].sort((a, b) => b.evaluateid - a.evaluateid);
});

// Computed stats
const highestScore = computed(() => {
  if (comparisonData.value.length === 0) return 0;
  return Math.max(...comparisonData.value.map(d => d.totalScore));
});
const highestScoreRound = computed(() => {
  const d = comparisonData.value.find(d => d.totalScore === highestScore.value);
  return d?.evaluatename || '';
});
const lowestScore = computed(() => {
  if (comparisonData.value.length === 0) return 0;
  return Math.min(...comparisonData.value.map(d => d.totalScore));
});
const lowestScoreRound = computed(() => {
  const d = comparisonData.value.find(d => d.totalScore === lowestScore.value);
  return d?.evaluatename || '';
});
const averageScore = computed(() => {
  if (comparisonData.value.length === 0) return 0;
  return comparisonData.value.reduce((s, d) => s + d.totalScore, 0) / comparisonData.value.length;
});
const scoreTrend = computed(() => {
  if (comparisonData.value.length < 2) return 0;
  return comparisonData.value[comparisonData.value.length - 1].totalScore - comparisonData.value[0].totalScore;
});

const trackChanges = computed(() => {
  const changes: { fromRound: string; toRound: string; from: string; to: string }[] = [];
  for (let i = 1; i < comparisonData.value.length; i++) {
    const prev = comparisonData.value[i - 1];
    const curr = comparisonData.value[i];
    if (prev.track !== curr.track && prev.track !== 'N/A' && curr.track !== 'N/A') {
      changes.push({ fromRound: prev.evaluatename, toRound: curr.evaluatename, from: prev.track, to: curr.track });
    }
  }
  return changes;
});

// Firebase token
const getFirebaseToken = async (): Promise<string | null> => {
  let attempts = 0;
  while (!user.value && attempts < 30) { await new Promise(r => setTimeout(r, 200)); attempts++; }
  if (!user.value) return null;
  try { return await user.value.getIdToken(); } catch { return null; }
};

// Select / deselect rounds
const toggleRound = async (evalId: number) => {
  const idx = selectedRounds.value.indexOf(evalId);
  if (idx >= 0) {
    selectedRounds.value = selectedRounds.value.filter(id => id !== evalId);
  } else {
    if (selectedRounds.value.length >= 5) return;
    selectedRounds.value = [...selectedRounds.value, evalId];
  }
  if (selectedRounds.value.length >= 2) {
    await fetchComparisonData();
  } else {
    comparisonData.value = [];
    destroyCharts();
  }
};

const selectRecentRounds = async () => {
  const recent = sortedPeriods.value.slice(0, 3).map(p => p.evaluateid);
  selectedRounds.value = recent;
  if (recent.length >= 2) await fetchComparisonData();
};

const clearSelection = () => {
  selectedRounds.value = [];
  comparisonData.value = [];
  destroyCharts();
};

// Fetch data for selected rounds
const fetchComparisonData = async () => {
  isLoading.value = true;
  try {
    const token = await getFirebaseToken();
    if (!token) return;

    const results: any[] = [];
    const sortedIds = [...selectedRounds.value].sort((a, b) => a - b);

    for (const evalId of sortedIds) {
      try {
        const res = await fetch(`${getBackendUrl()}/api/lecturer/mfu/get_Percentage?evaluateid=${evalId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const result = await res.json();
          const data = result?.data || result;
          const api = Array.isArray(data) ? data[0] : data;
          if (api) {
            if (!staffName.value) {
              staffName.value = api.staffname || '';
            }
            const totalScore = parseFloat(api['Total Score (100%)']) || 0;
            const academic = parseFloat(api['Academic Performance (60%)']) || 0;
            const behavior = parseFloat(api['Behavior (40%)']) || 0;
            let level = 'Very Poor';
            if (totalScore >= 85) level = 'Excellent';
            else if (totalScore >= 75) level = 'Good';
            else if (totalScore >= 65) level = 'Moderate';
            else if (totalScore >= 55) level = 'Poor';

            const periodInfo = evaluationPeriods.value.find(p => p.evaluateid === evalId);
            results.push({
              evaluateid: evalId,
              evaluatename: periodInfo?.evaluatename || `Round ${evalId}`,
              track: (api.domainscorename || 'N/A').trim(),
              totalScore,
              academic,
              behavior,
              level,
              weights: [
                parseFloat(api.domain1weight) || 0,
                parseFloat(api.domain2weight) || 0,
                parseFloat(api.domain3weight) || 0,
                parseFloat(api.domain4weight) || 0,
                parseFloat(api.domain5weight) || 0
              ],
              scores: [
                parseFloat(api.domain1score) || 0,
                parseFloat(api.domain2score) || 0,
                parseFloat(api.domain3score) || 0,
                parseFloat(api.domain4score) || 0,
                parseFloat(api.domain5score) || 0
              ]
            });
          }
        }
      } catch (err) {
        console.error(`[score-comparison] Error fetching round ${evalId}:`, err);
      }
    }

    comparisonData.value = results;
    await nextTick();
    setTimeout(() => {
      initProgressionChart();
      initDomainChart();
    }, 150);
  } catch (err) {
    console.error('[score-comparison] Error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Charts
const destroyCharts = () => {
  if (progressionChartInstance) { progressionChartInstance.destroy(); progressionChartInstance = null; }
  if (domainChartInstance) { domainChartInstance.destroy(); domainChartInstance = null; }
};

const initProgressionChart = () => {
  if (!progressionChart.value || comparisonData.value.length < 2) return;
  if (progressionChartInstance) progressionChartInstance.destroy();

  const labels = comparisonData.value.map(d => d.evaluatename);
  const tracks = comparisonData.value.map(d => d.track);

  progressionChartInstance = new Chart(progressionChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Score',
          data: comparisonData.value.map(d => d.totalScore),
          borderColor: '#1e3a5f',
          backgroundColor: 'rgba(30, 58, 95, 0.08)',
          borderWidth: 3,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBackgroundColor: '#1e3a5f',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Academic (60%)',
          data: comparisonData.value.map(d => d.academic),
          borderColor: '#4697b9',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#4697b9',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          borderDash: [8, 4]
        },
        {
          label: 'Behavior (40%)',
          data: comparisonData.value.map(d => d.behavior),
          borderColor: '#00BFFF',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#00BFFF',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          borderDash: [4, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          beginAtZero: false,
          min: 0,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, callback: (v) => v + '%', stepSize: 10 }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: 'bold' as const } }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 58, 95, 0.95)',
          titleFont: { size: 13, weight: 'bold' as const },
          bodyFont: { size: 12 },
          padding: 14,
          cornerRadius: 10,
          displayColors: true,
          boxPadding: 6,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return `Round ${labels[idx]}`;
            },
            afterTitle: (items) => {
              const idx = items[0].dataIndex;
              return `Track: ${tracks[idx]}`;
            },
            label: (ctx) => {
              return ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)}%`;
            }
          }
        }
      }
    }
  });
};

const initDomainChart = () => {
  if (!domainChart.value || comparisonData.value.length < 2) return;
  if (domainChartInstance) domainChartInstance.destroy();

  // X-axis = 5 domains, each round is a separate dataset (grouped bars)
  const roundColors = ['#1e3a5f', '#4697b9', '#00BFFF', '#7c3aed', '#f59e0b'];
  const roundBgColors = ['rgba(30,58,95,0.85)', 'rgba(70,151,185,0.85)', 'rgba(0,191,255,0.85)', 'rgba(124,58,237,0.85)', 'rgba(245,158,11,0.85)'];

  const datasets = comparisonData.value.map((rd: any, rIdx: number) => ({
    label: `${rd.evaluatename} (${rd.track || 'N/A'})`,
    data: rd.scores.map((s: number) => s),
    backgroundColor: roundBgColors[rIdx % roundBgColors.length],
    borderColor: roundColors[rIdx % roundColors.length],
    borderWidth: 2,
    borderRadius: 6,
    barPercentage: 0.75,
    categoryPercentage: 0.85
  }));

  domainChartInstance = new Chart(domainChart.value, {
    type: 'bar',
    data: { labels: domainLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { size: 11 },
            callback: (v) => v + '%'
          },
          title: {
            display: true,
            text: 'Score',
            font: { size: 12, weight: 'bold' as const },
            color: '#6b7280'
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: 'bold' as const } }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 18,
            font: { size: 11, weight: 'bold' as const }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 58, 95, 0.95)',
          titleFont: { size: 13, weight: 'bold' as const },
          bodyFont: { size: 12 },
          padding: 14,
          cornerRadius: 10,
          displayColors: true,
          boxPadding: 6,
          callbacks: {
            title: (items) => {
              const domainIdx = items[0].dataIndex;
              return domainLabels[domainIdx];
            },
            label: (ctx) => {
              const roundIdx = ctx.datasetIndex;
              const domainIdx = ctx.dataIndex;
              const rd = comparisonData.value[roundIdx];
              const score = rd.scores[domainIdx];
              const weight = rd.weights[domainIdx];
              return ` ${rd.evaluatename}: ${score.toFixed(1)} pts (weight: ${weight}%)`;
            },
            afterBody: (items) => {
              const domainIdx = items[0].dataIndex;
              const scores = comparisonData.value.map((rd: any) => rd.scores[domainIdx]);
              const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
              return `\n  Avg across rounds: ${avg.toFixed(1)}`;
            }
          }
        }
      }
    }
  });
};

// Helpers
const getTrackBadgeClass = (track: string) => {
  const map: Record<string, string> = {
    'Teaching': 'bg-blue-100 text-blue-800',
    'Research': 'bg-cyan-100 text-cyan-800',
    'Academic Administration': 'bg-purple-100 text-purple-800',
    'Academic Service': 'bg-teal-100 text-teal-800'
  };
  return map[track?.trim()] || 'bg-gray-100 text-gray-700';
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 65) return 'text-amber-600';
  return 'text-red-600';
};

const getPerformanceBadgeClass = (level: string) => {
  const map: Record<string, string> = {
    'Excellent': 'bg-yellow-100 text-yellow-800',
    'Good': 'bg-green-100 text-green-800',
    'Moderate': 'bg-blue-100 text-blue-800',
    'Poor': 'bg-orange-100 text-orange-800',
    'Very Poor': 'bg-red-100 text-red-800'
  };
  return map[level] || 'bg-gray-100 text-gray-800';
};

// Init
onMounted(async () => {
  await fetchEvaluationPeriods();
});

onUnmounted(() => {
  destroyCharts();
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.35s ease-out;
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
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
