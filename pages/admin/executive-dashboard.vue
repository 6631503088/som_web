<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Executive Dashboard
          </h1>
          <p class="text-gray-500 text-sm mt-1">School of Management — Faculty Overview & Infographics</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Program Filter -->
          <div class="relative">
            <select
              v-model="selectedProgram"
              @change="fetchOverview"
              class="appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Programs</option>
              <option v-for="p in programOptions" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <!-- Round Selector -->
          <div class="relative">
            <select
              v-model="selectedEvaluationPeriod"
              @change="fetchOverview"
              class="appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isLoadingPeriods"
            >
              <option v-if="isLoadingPeriods" disabled>Loading...</option>
              <option v-for="period in evaluationPeriods" :key="period.evaluateid" :value="period.evaluateid">
                Round {{ period.evaluatename }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <!-- Refresh -->
          <button @click="fetchOverview" :disabled="loading" class="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            <svg class="h-4 w-4 text-gray-600" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !overviewData" class="flex justify-center items-center py-32">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p class="text-gray-500 font-medium">Loading executive overview...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="overviewData">
        <!-- ═══ ROW 1: Summary Stat Cards ═══ -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div v-for="stat in summaryCards" :key="stat.label" 
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" :class="stat.bgClass">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"/></svg>
              </div>
              <div class="min-w-0">
                <p class="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{{ stat.value }}</p>
                <p class="text-[11px] text-gray-500 font-medium leading-tight truncate">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ ROW 2: KPI Overview + Performance Levels ═══ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- KPI Overview Big Card -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] px-6 py-4">
              <h2 class="text-lg font-bold text-white">Faculty KPI Overview</h2>
              <p class="text-white/60 text-xs">{{ selectedProgram ? 'Program: ' + selectedProgram : 'All Programs' }} • Round {{ currentRoundName }}</p>
            </div>
            <div class="p-6">
              <div v-if="overviewData.kpiSummary" class="space-y-5">
                <!-- Score Cards -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-blue-700">{{ overviewData.kpiSummary.avgTotalScore.toFixed(1) }}%</p>
                    <p class="text-xs font-medium text-blue-600 mt-1">Avg Total Score</p>
                  </div>
                  <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-emerald-700">{{ overviewData.kpiSummary.avgAcademic.toFixed(1) }}%</p>
                    <p class="text-xs font-medium text-emerald-600 mt-1">Academic (60%)</p>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-purple-700">{{ overviewData.kpiSummary.avgBehavior.toFixed(1) }}%</p>
                    <p class="text-xs font-medium text-purple-600 mt-1">Behavior (40%)</p>
                  </div>
                </div>
                <!-- Domain Radar Chart -->
                <div class="bg-gray-50/60 rounded-xl p-4">
                  <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Domain Performance</h3>
                  <div class="h-64">
                    <canvas ref="domainRadarChart"></canvas>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-gray-400">
                <svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                <p class="font-medium">KPI data loading...</p>
                <p class="text-xs mt-1">Cache is building. This may take 30-60 seconds.</p>
              </div>
            </div>
          </div>

          <!-- Performance Level Distribution + Top Performers -->
          <div class="space-y-6">
            <!-- Performance Levels Pie -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Performance Levels</h3>
              <div v-if="overviewData.kpiSummary" class="flex items-center gap-4">
                <div class="w-32 h-32 flex-shrink-0">
                  <canvas ref="perfLevelChart"></canvas>
                </div>
                <div class="flex-1 space-y-1.5">
                  <div v-for="(item, idx) in perfLevelItems" :key="idx" class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
                      <span class="text-xs text-gray-600">{{ item.label }}</span>
                    </div>
                    <span class="text-xs font-bold" :style="{ color: item.color }">{{ item.count }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="h-32 flex items-center justify-center text-gray-300 text-sm">Loading...</div>
            </div>

            <!-- Top Performers -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">🏆 Top Performers</h3>
              <div v-if="overviewData.topPerformers?.length" class="space-y-2">
                <div v-for="(p, i) in overviewData.topPerformers" :key="p.staffCode" 
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer"
                  @click="navigateTo({ path: `/admin/kpi/${p.staffCode}`, query: { round: String(selectedEvaluationPeriod) } })"
                >
                  <span class="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0" :class="['bg-amber-500','bg-gray-400','bg-amber-700','bg-blue-400','bg-blue-300'][i]">
                    {{ i + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium text-gray-800 truncate">{{ p.staffName }}</p>
                    <p class="text-[10px] text-gray-400">{{ p.programCode }}</p>
                  </div>
                  <span class="text-sm font-bold" :class="p.totalScore >= 80 ? 'text-emerald-600' : p.totalScore >= 60 ? 'text-blue-600' : 'text-orange-600'">
                    {{ p.totalScore.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div v-else class="h-24 flex items-center justify-center text-gray-300 text-xs">No data</div>
            </div>
          </div>
        </div>

        <!-- ═══ ROW 3: Domain Performance by Program Heatmap ═══ -->
        <div v-if="overviewData.domainByProgram?.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#1e3a5f] to-[#3d7a9f] px-6 py-4">
            <h2 class="text-lg font-bold text-white">Domain Performance by Program</h2>
            <p class="text-white/60 text-xs">Average scores across 5 evaluation domains • {{ selectedProgram ? 'Program: ' + selectedProgram : 'All Programs' }}</p>
          </div>
          <div class="p-6 overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gradient-to-r from-gray-100 to-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">Program</th>
                  <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="w-3 h-3 rounded-full bg-blue-500 mb-1"></span>
                      Teaching
                    </div>
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="w-3 h-3 rounded-full bg-cyan-500 mb-1"></span>
                      Research
                    </div>
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="w-3 h-3 rounded-full bg-emerald-500 mb-1"></span>
                      Acad. Service
                    </div>
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="w-3 h-3 rounded-full bg-purple-500 mb-1"></span>
                      Administration
                    </div>
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="w-3 h-3 rounded-full bg-amber-500 mb-1"></span>
                      Arts & Culture
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(row, i) in overviewData.domainByProgram" :key="row.programCode"
                  :class="i % 2 === 1 ? 'bg-white' : 'bg-gray-50/30'"
                  class="hover:bg-blue-50/60 transition-colors"
                >
                  <td class="px-4 py-3 sticky left-0 z-10" :class="i % 2 === 1 ? 'bg-white' : 'bg-gray-50'">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: programColor(row.programCode) }"></span>
                      <span class="font-medium text-gray-800 text-xs sm:text-sm">{{ row.programName }}</span>
                      <span class="text-[10px] text-gray-400 font-mono hidden sm:inline">{{ row.programCode }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-bold" :class="domainScoreColor(row.domains.teaching)">{{ row.domains.teaching }}%</span>
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :class="domainBarColor(row.domains.teaching)" :style="{ width: row.domains.teaching + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-bold" :class="domainScoreColor(row.domains.research)">{{ row.domains.research }}%</span>
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :class="domainBarColor(row.domains.research)" :style="{ width: row.domains.research + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-bold" :class="domainScoreColor(row.domains.academicService)">{{ row.domains.academicService }}%</span>
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :class="domainBarColor(row.domains.academicService)" :style="{ width: row.domains.academicService + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-bold" :class="domainScoreColor(row.domains.administration)">{{ row.domains.administration }}%</span>
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :class="domainBarColor(row.domains.administration)" :style="{ width: row.domains.administration + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-bold" :class="domainScoreColor(row.domains.artsCulture)">{{ row.domains.artsCulture }}%</span>
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :class="domainBarColor(row.domains.artsCulture)" :style="{ width: row.domains.artsCulture + '%' }"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ ROW 4: Activity Infographics ═══ -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 class="text-lg font-bold text-white">Activity Infographics</h2>
            <p class="text-white/60 text-xs">Aggregated from MFU E-Port API{{ overviewData.hasActivityData ? '' : ' (loading activities...)' }}</p>
          </div>
          <div class="p-6">
            <!-- Activity Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div v-for="act in activityCards" :key="act.label" 
                class="relative overflow-hidden rounded-xl p-4 text-white transition-transform hover:scale-[1.02]"
                :class="act.bgGradient"
              >
                <div class="relative z-10">
                  <svg class="w-6 h-6 mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="act.icon"/></svg>
                  <p class="text-3xl font-bold">{{ act.value }}</p>
                  <p class="text-xs font-medium opacity-80 mt-1">{{ act.label }}</p>
                </div>
                <div class="absolute -right-3 -bottom-3 w-20 h-20 rounded-full bg-white/10"></div>
              </div>
            </div>

            <!-- Activity by Program Table -->
            <div v-if="overviewData.activityByProgram?.length" class="bg-gray-50/60 rounded-xl overflow-hidden">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-gray-100 to-gray-50">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Lecturers</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Teaching</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Publications</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Self-Dev</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acad. Service</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">KPI Avg</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(row, i) in overviewData.activityByProgram" :key="row.program_code" 
                    :class="i % 2 === 1 ? 'bg-white' : 'bg-gray-50/30'"
                    class="hover:bg-blue-50/60 transition-colors"
                  >
                    <td class="px-4 py-2.5">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: programColor(row.program_code) }"></span>
                        <span class="font-medium text-gray-800">{{ row.program_name || row.program_code }}</span>
                        <span class="text-[10px] text-gray-400 font-mono">{{ row.program_code }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2.5 text-center font-medium text-gray-700">{{ row.lecturer_count }}</td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="row.total_teaching > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{{ row.total_teaching }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="row.total_publications > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{{ row.total_publications }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="row.total_self_development > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{{ row.total_self_development }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="row.total_academic_service > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">{{ row.total_academic_service }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="row.kpiAvg > 0" class="text-sm font-bold" :class="row.kpiAvg >= 80 ? 'text-emerald-600' : row.kpiAvg >= 60 ? 'text-blue-600' : 'text-orange-600'">
                        {{ row.kpiAvg.toFixed(1) }}%
                      </span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ ROW 4: Program KPI Comparison + Bottom Performers ═══ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Program KPI Bar Chart -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Program KPI Comparison</h3>
            <div v-if="overviewData.programKpiBreakdown?.length" class="h-72">
              <canvas ref="programBarChart"></canvas>
            </div>
            <div v-else class="h-72 flex items-center justify-center text-gray-300 text-sm">KPI data loading...</div>
          </div>

          <!-- Bottom Performers -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">⚠️ Needs Improvement</h3>
            <div v-if="overviewData.bottomPerformers?.length" class="space-y-2">
              <div v-for="(p, i) in overviewData.bottomPerformers" :key="p.staffCode" 
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                @click="navigateTo({ path: `/admin/kpi/${p.staffCode}`, query: { round: String(selectedEvaluationPeriod) } })"
              >
                <div class="w-6 h-6 rounded-full bg-red-100 text-red-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  !
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-gray-800 truncate">{{ p.staffName }}</p>
                  <p class="text-[10px] text-gray-400">{{ p.programCode }}</p>
                </div>
                <span class="text-sm font-bold text-red-500">{{ p.totalScore.toFixed(1) }}%</span>
              </div>
            </div>
            <div v-else class="h-32 flex items-center justify-center text-gray-300 text-xs">No data</div>

            <!-- Quick Links -->
            <div class="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <NuxtLink to="/admin/kpi" class="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium group">
                <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"/></svg>
                View All Performance Analytics →
              </NuxtLink>
              <NuxtLink to="/admin/program-analytics" class="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium group">
                <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>
                View Program Analytics →
              </NuxtLink>
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
import { useAuthenticatedFetch } from '~/composables/useAuthenticatedFetch';
import Chart from 'chart.js/auto';
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue';

definePageMeta({ layout: 'admin' });

const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();
const { get } = useAuthenticatedFetch();

// State
const loading = ref(true);
const selectedProgram = ref('');
const selectedEvaluationPeriod = ref<number>(9);
const overviewData = ref<any>(null);

// Chart refs
const domainRadarChart = ref<HTMLCanvasElement | null>(null);
const perfLevelChart = ref<HTMLCanvasElement | null>(null);
const programBarChart = ref<HTMLCanvasElement | null>(null);
let chartInstances: Record<string, Chart | null> = { radar: null, perf: null, program: null };

// Program options for filter
const programOptions = [
  { code: 'ACC', name: 'Accounting' },
  { code: 'AVI', name: 'Aviation Management' },
  { code: 'BA', name: 'Business Administration' },
  { code: 'DEAN', name: 'Dean Office' },
  { code: 'ECO', name: 'Economics' },
  { code: 'HRM', name: 'Hospitality Management' },
  { code: 'LOG', name: 'Logistics Management' },
  { code: 'TRM', name: 'Tourism Management' }
];

const programColors: Record<string, string> = {
  ACC: '#3F63C5', AVI: '#1D7DAA', BA: '#0D875E', ECO: '#7C51AA',
  HRM: '#CD3774', TRM: '#EC5101', LOG: '#D94E5D', DEAN: '#9B8FD0'
};

const programColor = (code: string) => programColors[code] || '#6B7280';

const domainScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-500';
};

const domainBarColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const currentRoundName = computed(() => {
  const found = evaluationPeriods.value?.find((p: any) => p.evaluateid === selectedEvaluationPeriod.value);
  return found?.evaluatename || String(selectedEvaluationPeriod.value);
});

// Summary cards computed
const summaryCards = computed(() => {
  if (!overviewData.value) return [];
  const a = overviewData.value.activityTotals || {};
  const k = overviewData.value.kpiSummary;
  return [
    { label: 'Total Lecturers', value: a.totalLecturers || 0, bgClass: 'bg-blue-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Active Programs', value: a.totalPrograms || 0, bgClass: 'bg-emerald-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Teaching Courses', value: (a.teachingUG || 0) + (a.teachingGrad || 0), bgClass: 'bg-teal-500', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Publications', value: a.publications || 0, bgClass: 'bg-indigo-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Self-Development', value: a.selfDevelopment || 0, bgClass: 'bg-purple-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Avg KPI Score', value: k ? k.avgTotalScore.toFixed(1) + '%' : '—', bgClass: 'bg-amber-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
  ];
});

// Performance level items
const perfLevelItems = computed(() => {
  if (!overviewData.value?.kpiSummary) return [];
  const p = overviewData.value.kpiSummary.performanceLevels;
  return [
    { label: 'Excellent', count: p.Excellent || 0, color: '#EAB308' },
    { label: 'Good', count: p.Good || 0, color: '#10B981' },
    { label: 'Moderate', count: p.Moderate || 0, color: '#3B82F6' },
    { label: 'Poor', count: p.Poor || 0, color: '#F97316' },
    { label: 'Very Poor', count: p['Very Poor'] || 0, color: '#EF4444' }
  ];
});

// Activity cards
const activityCards = computed(() => {
  if (!overviewData.value) return [];
  const a = overviewData.value.activityTotals || {};
  return [
    { label: 'Teaching Courses', value: (a.teachingUG || 0) + (a.teachingGrad || 0), bgGradient: 'bg-gradient-to-br from-emerald-500 to-green-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Publications', value: a.publications || 0, bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Self-Development', value: a.selfDevelopment || 0, bgGradient: 'bg-gradient-to-br from-purple-500 to-indigo-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Academic Service', value: a.academicService || 0, bgGradient: 'bg-gradient-to-br from-teal-500 to-cyan-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Research Studies', value: a.researchStudies || 0, bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' }
  ];
});



// Fetch overview data
const fetchOverview = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.set('evaluateid', String(selectedEvaluationPeriod.value || 9));
    if (selectedProgram.value) params.set('program_code', selectedProgram.value);

    const data = await get(`/api/admin/executive/overview?${params.toString()}`);
    if (data.success) {
      overviewData.value = data.data;
      await nextTick();
      initCharts();
    }
  } catch (err: any) {
    console.error('[Executive] Fetch error:', err);
  } finally {
    loading.value = false;
  }
};

// Chart initialization
const initCharts = () => {
  initRadarChart();
  initPerfLevelChart();
  initProgramBarChart();
};

const initRadarChart = () => {
  if (!domainRadarChart.value || !overviewData.value?.domainAverages) return;
  if (chartInstances.radar) chartInstances.radar.destroy();
  const d = overviewData.value.domainAverages;
  chartInstances.radar = new Chart(domainRadarChart.value, {
    type: 'radar',
    data: {
      labels: ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'],
      datasets: [{
        label: 'Average Score',
        data: [d.domain1, d.domain2, d.domain3, d.domain4, d.domain5],
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#3B82F6',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, font: { size: 10 } },
          pointLabels: { font: { size: 11, weight: '600' } }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
};

const initPerfLevelChart = () => {
  if (!perfLevelChart.value || !overviewData.value?.kpiSummary) return;
  if (chartInstances.perf) chartInstances.perf.destroy();
  const items = perfLevelItems.value;
  chartInstances.perf = new Chart(perfLevelChart.value, {
    type: 'doughnut',
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data: items.map(i => i.count),
        backgroundColor: items.map(i => i.color),
        borderWidth: 2, borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      cutout: '60%',
      plugins: { legend: { display: false } }
    }
  });
};

const initProgramBarChart = () => {
  if (!programBarChart.value || !overviewData.value?.programKpiBreakdown?.length) return;
  if (chartInstances.program) chartInstances.program.destroy();
  const programs = overviewData.value.programKpiBreakdown.filter((p: any) => !p.noKpiData);
  chartInstances.program = new Chart(programBarChart.value, {
    type: 'bar',
    data: {
      labels: programs.map((p: any) => p.programCode),
      datasets: [
        {
          label: 'Total Score',
          data: programs.map((p: any) => p.avgTotalScore),
          backgroundColor: programs.map((p: any) => programColors[p.programCode] || '#6B7280'),
          borderRadius: 6,
          barPercentage: 0.7
        },
        {
          label: 'Academic',
          data: programs.map((p: any) => p.avgAcademic),
          backgroundColor: 'rgba(16, 185, 129, 0.4)',
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
      responsive: true, maintainAspectRatio: false,
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

// Lifecycle
onMounted(async () => {
  await fetchEvaluationPeriods();
  if (activeEvaluationPeriod.value) {
    selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
  }
  await fetchOverview();
});

onUnmounted(() => {
  Object.values(chartInstances).forEach(c => c?.destroy());
});
</script>
