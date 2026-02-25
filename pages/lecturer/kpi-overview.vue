<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#4697b9] bg-clip-text text-transparent">
            KPI Performance Overview
          </h1>
          <p class="text-gray-600 mt-1">
            Welcome back, <span class="font-semibold text-[#4697b9]">{{ lecturerData?.staffName || user?.displayName || 'Lecturer' }}</span>
            <span v-if="lecturerData?.domainScoreName" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{{ lecturerData.domainScoreName }} Track</span>
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Evaluation Period Selector -->
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
          </div>
          <!-- Performance Badge -->
          <div v-if="lecturerData">
            <span 
              class="px-4 py-2 text-lg font-bold rounded-full"
              :class="getPerformanceBadgeClass(lecturerData.performanceLevel)"
            >
              {{ lecturerData.performanceLevel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-[#4697b9]/20 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-[#4697b9] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="mt-4 text-gray-600 font-medium">Loading your KPI data from E-port...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-amber-800">Connection Issue</h3>
            <p class="text-amber-700 mt-1">{{ fetchError }}</p>
            <button @click="fetchData" class="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="lecturerData" class="space-y-6">
        
        <!-- Score Overview Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Total Score Donut -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Overall Performance</h3>
            <ClientOnly>
              <div class="flex items-center justify-center">
                <div class="relative w-48 h-48">
                  <canvas ref="overallPieChart"></canvas>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <span class="text-3xl font-bold text-gray-900">{{ lecturerData.overallPerformance.totalScore.toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <template #fallback>
                <div class="flex items-center justify-center w-48 h-48 mx-auto">
                  <div class="w-12 h-12 border-4 border-[#4697b9]/30 border-t-[#4697b9] rounded-full animate-spin"></div>
                </div>
              </template>
            </ClientOnly>
            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-[#4697b9] mr-2"></span>
                <span>Academic: {{ lecturerData.overallPerformance.academicPerformance.toFixed(1) }}%</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-[#00BFFF] mr-2"></span>
                <span>Behavior: {{ lecturerData.overallPerformance.behavior.toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- Domain Scores Pie -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Domain Score Distribution</h3>
            <ClientOnly>
              <div class="flex items-center justify-center">
                <div class="w-48 h-48"><canvas ref="domainPieChart"></canvas></div>
              </div>
              <template #fallback>
                <div class="flex items-center justify-center w-48 h-48 mx-auto">
                  <div class="w-12 h-12 border-4 border-[#4697b9]/30 border-t-[#4697b9] rounded-full animate-spin"></div>
                </div>
              </template>
            </ClientOnly>
            <div class="mt-4 space-y-1 text-xs">
              <div v-for="item in [
                { label: 'Teaching', color: '#005F99', score: domainScores.teaching, weight: lecturerData.domainWeights?.domain1 || 0 },
                { label: 'Research', color: '#00BFFF', score: domainScores.research, weight: lecturerData.domainWeights?.domain2 || 0 },
                { label: 'Academic Service', color: '#7FD6D6', score: domainScores.academicService, weight: lecturerData.domainWeights?.domain3 || 0 },
                { label: 'Administration', color: '#7c3aed', score: domainScores.administration, weight: lecturerData.domainWeights?.domain4 || 0 },
                { label: 'Arts & Culture', color: '#C084FC', score: domainScores.artsCulture, weight: lecturerData.domainWeights?.domain5 || 0 }
              ]" :key="item.label" class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.label }} ({{ item.weight }}%)</span>
                </div>
                <span class="font-medium">{{ item.score.toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- Activity Summary -->
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Activity Summary</h3>
            <div class="space-y-3">
              <div v-for="stat in [
                { label: 'Teaching', count: teachingItemCount, bgClass: 'bg-blue-50', textClass: 'text-blue-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { label: 'Research', count: researchItemCount, bgClass: 'bg-cyan-50', textClass: 'text-cyan-600', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                { label: 'Academic Service', count: academicServiceItemCount, bgClass: 'bg-teal-50', textClass: 'text-teal-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { label: 'Administration', count: administrationItemCount, bgClass: 'bg-purple-50', textClass: 'text-purple-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { label: 'Arts & Culture', count: artsCultureItemCount, bgClass: 'bg-pink-50', textClass: 'text-pink-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
              ]" :key="stat.label" class="flex items-center justify-between p-3 rounded-lg" :class="stat.bgClass">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" :class="stat.textClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
                  </svg>
                  <span class="text-gray-700">{{ stat.label }}</span>
                </div>
                <span class="text-xl font-bold" :class="stat.textClass">{{ stat.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- Detailed Performance Breakdown                               -->
        <!-- ============================================================ -->
        <h2 class="text-xl font-bold text-gray-900">Detailed Performance Breakdown (E-port Data)</h2>

        <!-- ===== DOMAIN 1: TEACHING ===== -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div @click="toggleDomain(1)" class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#005F99] to-[#00BFFF] cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">Domain 1: Teaching Performance</h3>
              <span class="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">{{ teachingItemCount }} items</span>
            </div>
            <svg class="w-5 h-5 text-white transition-transform duration-300" :class="{ 'rotate-180': isDomainExpanded(1) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="overflow-hidden transition-all duration-300" :class="isDomainExpanded(1) ? 'max-h-[12000px] opacity-100' : 'max-h-0 opacity-0'">
            <div class="p-4 space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Teaching Horizontal Stacked Bar Chart -->
                <ClientOnly>
                  <div class="lg:col-span-2 bg-gray-50 rounded-lg p-4 relative">
                    <h4 class="font-medium text-gray-800 mb-1 text-center">Teaching Performance</h4>
                    <p class="text-xs text-gray-500 text-center mb-4">
                      Threshold ({{ lecturerData.domainThresholds?.domain1 || 0 }}) - Earned score ({{ domainScores.teaching.toFixed(1) }})
                    </p>
                    <div class="absolute top-4 right-4 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden z-10 min-w-[120px]">
                      <div class="bg-[#2C5282] text-white px-4 py-1 text-center">
                        <h5 class="text-xs font-bold">Quality of Work</h5>
                      </div>
                      <div class="bg-white px-4 py-1.5 text-center">
                        <div class="text-xl font-bold text-gray-800">{{ qualityOfWorkDisplay }}</div>
                      </div>
                    </div>
                    <div class="h-[300px] sm:h-[360px] w-full">
                      <canvas ref="teachingBarChart"></canvas>
                    </div>
                  </div>
                </ClientOnly>
                <!-- Teaching Tables -->
                <div class="flex flex-col gap-6">
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Undergraduate Teaching</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="groupedUndergraduateCourses.length === 0" class="text-center py-6 text-gray-400 text-xs">No undergraduate courses found</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">No.</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Course</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Code</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Sec</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Students</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(c, i) in groupedUndergraduateCourses" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ i + 1 }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ c.coursename }}</td>
                            <td class="px-2 py-1 text-center text-gray-600 font-mono">{{ c.coursecode }}</td>
                            <td class="px-2 py-1 text-center text-gray-600">{{ c.sections.join(', ') }}</td>
                            <td class="px-2 py-1 text-center font-medium text-gray-600">{{ c.totalStudents }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Graduate Teaching</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="groupedGraduateCourses.length === 0" class="text-center py-6 text-gray-400 text-xs">No graduate courses found</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">No.</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Course</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Code</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Sec</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Students</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(c, i) in groupedGraduateCourses" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ i + 1 }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ c.coursename }}</td>
                            <td class="px-2 py-1 text-center text-gray-600 font-mono">{{ c.coursecode }}</td>
                            <td class="px-2 py-1 text-center text-gray-600">{{ c.sections.join(', ') }}</td>
                            <td class="px-2 py-1 text-center font-medium text-gray-600">{{ c.totalStudents }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Teaching Raw Scores Summary Cards -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div v-for="item in [
                  { label: 'UG Lecture', value: getScoreSum(detailedData?.rawScores?.teaching?.undergraduate, 'scorelect'), color: 'blue' },
                  { label: 'UG Lab', value: getScoreSum(detailedData?.rawScores?.teaching?.undergraduate, 'scorelab'), color: 'blue' },
                  { label: 'Grad Lecture', value: getScoreSum(detailedData?.rawScores?.teaching?.graduate, 'scorelect'), color: 'purple' },
                  { label: 'Grad Lab', value: getScoreSum(detailedData?.rawScores?.teaching?.graduate, 'scorelab'), color: 'purple' },
                  { label: 'Student Projects', value: getScoreFirst(detailedData?.teaching?.studentProjects, 'totalscore'), color: 'green' },
                  { label: 'Thesis Oversight', value: getScoreFirst(detailedData?.teaching?.thesisOversight, 'totalscore'), color: 'amber' }
                ]" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500">{{ item.label }}</p>
                  <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
                </div>
              </div>

              <!-- Student Internships score -->
              <template v-if="hasValidData(detailedData?.teaching?.studentInternships) && parseFloat(detailedData.teaching.studentInternships[0]?.totalscore ?? 0) > 0">
                <div class="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">Score</span>
                  <span class="font-medium text-gray-800">Student Internships: {{ detailedData.teaching.studentInternships[0]?.totalscore }}</span>
                </div>
              </template>

              <!-- Other Teaching Tasks score -->
              <template v-if="hasValidData(detailedData?.teaching?.otherTeachingTasks) && parseFloat(detailedData.teaching.otherTeachingTasks[0]?.sumscore ?? 0) > 0">
                <div class="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">Score</span>
                  <span class="font-medium text-gray-800">Other Teaching Tasks: {{ detailedData.teaching.otherTeachingTasks[0]?.sumscore }}</span>
                </div>
              </template>

              <div v-if="teachingItemCount === 0" class="text-center py-8 text-gray-400">
                <p class="font-medium">No teaching data available for this evaluation period</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== DOMAIN 2: RESEARCH ===== -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div @click="toggleDomain(2)" class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#00BFFF] to-[#7FD6D6] cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">Domain 2: Research Performance</h3>
              <span class="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">{{ researchItemCount }} items</span>
            </div>
            <svg class="w-5 h-5 text-white transition-transform duration-300" :class="{ 'rotate-180': isDomainExpanded(2) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="overflow-hidden transition-all duration-300" :class="isDomainExpanded(2) ? 'max-h-[12000px] opacity-100' : 'max-h-0 opacity-0'">
            <div class="p-4 space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClientOnly>
                  <div class="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-1 text-center">Research Performance</h4>
                    <p class="text-xs text-gray-500 text-center mb-4">
                      Threshold ({{ lecturerData.domainThresholds?.domain2 || 0 }}) - Earned score ({{ domainScores.research.toFixed(1) }})
                    </p>
                    <div class="h-[300px] sm:h-[360px] w-full">
                      <canvas ref="researchBarChart"></canvas>
                    </div>
                  </div>
                </ClientOnly>
                <div class="flex flex-col gap-6">
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Research Studies</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.research?.studies)" class="text-center py-6 text-gray-400 text-xs">No research studies found</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Level</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Research Title</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(r, i) in detailedData.research.studies" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ r.level || '-' }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ r.researchtitle || r.projectname || r.title || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Research Publications</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.research?.publications)" class="text-center py-6 text-gray-400 text-xs">No publications found</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">Level</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Publication Title</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(r, i) in detailedData.research.publications" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ r.level || '-' }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ r.researchtitle || r.publicationtitle || r.title || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Research Raw Scores Summary -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                <div v-for="item in researchRawScoreSummary" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500 leading-tight">{{ item.label }}</p>
                  <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
                </div>
              </div>

              <div v-if="researchItemCount === 0" class="text-center py-8 text-gray-400">
                <p class="font-medium">No research data available for this evaluation period</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== DOMAIN 3: ACADEMIC SERVICE ===== -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div @click="toggleDomain(3)" class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#7FD6D6] to-[#38ADEA] cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">Domain 3: Academic Service</h3>
              <span class="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">{{ academicServiceItemCount }} items</span>
            </div>
            <svg class="w-5 h-5 text-white transition-transform duration-300" :class="{ 'rotate-180': isDomainExpanded(3) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="overflow-hidden transition-all duration-300" :class="isDomainExpanded(3) ? 'max-h-[12000px] opacity-100' : 'max-h-0 opacity-0'">
            <div class="p-4 space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClientOnly>
                  <div class="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-1 text-center">Academic Services Performance</h4>
                    <p class="text-xs text-gray-500 text-center mb-4">
                      Threshold ({{ lecturerData.domainThresholds?.domain3 || 0 }}) - Earned score ({{ domainScores.academicService.toFixed(1) }})
                    </p>
                    <div class="h-[280px] sm:h-[320px] w-full">
                      <canvas ref="academicServiceBarChart"></canvas>
                    </div>
                  </div>
                </ClientOnly>
                <div class="flex flex-col gap-6">
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Academic Service Activities</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.academicService?.activities)" class="text-center py-6 text-gray-400 text-xs">No activities found</div>
                      <div v-else class="space-y-2">
                        <div v-for="(act, i) in detailedData.academicService.activities" :key="i" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p class="font-medium text-gray-900 text-sm">{{ act.projecttitle || act.speakertitle || act.title || 'Untitled Activity' }}</p>
                          <p class="text-xs text-gray-500 mt-1">Budget: {{ act.budgetlimit ? Number(act.budgetlimit).toLocaleString() + ' THB' : 'N/A' }}</p>
                          <span :class="act.profitable === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'" class="text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                            {{ act.profitable === 0 ? 'Non-revenue' : 'Revenue' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Performance as an Invited Lecturer or Speaker</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.academicService?.invitedLecturer)" class="text-center py-6 text-gray-400 text-xs">No invited lecturer or speaker records found</div>
                      <div v-else class="space-y-2">
                        <div v-for="(s, i) in detailedData.academicService.invitedLecturer" :key="i" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p class="font-medium text-gray-900 text-sm">{{ s.speakertitle || s.speechtitle || s.title || '-' }}</p>
                          <p class="text-xs text-gray-500 mt-1">{{ s.organizingunit || s.organization || '-' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Academic Service Raw Scores Summary -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div v-for="item in academicServiceRawScoreSummary" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500 leading-tight">{{ item.label }}</p>
                  <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
                </div>
              </div>

              <div v-if="academicServiceItemCount === 0" class="text-center py-8 text-gray-400">
                <p class="font-medium">No academic service data available for this evaluation period</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== DOMAIN 4: ADMINISTRATION ===== -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div @click="toggleDomain(4)" class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#7c3aed] to-[#8A8BE6] cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">Domain 4: Administration</h3>
              <span class="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">{{ administrationItemCount }} items</span>
            </div>
            <svg class="w-5 h-5 text-white transition-transform duration-300" :class="{ 'rotate-180': isDomainExpanded(4) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="overflow-hidden transition-all duration-300" :class="isDomainExpanded(4) ? 'max-h-[12000px] opacity-100' : 'max-h-0 opacity-0'">
            <div class="p-4 space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClientOnly>
                  <div class="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-1 text-center">Administration Performance</h4>
                    <p class="text-xs text-gray-500 text-center mb-4">
                      Threshold ({{ lecturerData.domainThresholds?.domain4 || 0 }}) - Earned score ({{ domainScores.administration.toFixed(1) }})
                    </p>
                    <div class="h-[300px] sm:h-[380px] w-full">
                      <canvas ref="administrationBarChart"></canvas>
                    </div>
                  </div>
                </ClientOnly>
                <div class="flex flex-col gap-6">
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Curricular Committee</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.administration?.curricularCommittee)" class="text-center py-6 text-gray-400 text-xs">No curricular committee data</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">No.</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Committee Name</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(c, i) in detailedData.administration.curricularCommittee" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ i + 1 }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ c.nameofcommittee || c.name || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">School Committee</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.administration?.schoolCommittee)" class="text-center py-6 text-gray-400 text-xs">No school committee data</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">No.</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Committee Name</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(c, i) in detailedData.administration.schoolCommittee" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ i + 1 }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ c.nameofcommittee || c.name || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Administration Raw Scores Summary -->
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div v-for="item in administrationRawScoreSummary" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-[10px] text-gray-500 leading-tight">{{ item.label }}</p>
                  <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
                </div>
              </div>

              <div v-if="administrationItemCount === 0" class="text-center py-8 text-gray-400">
                <p class="font-medium">No administration data available for this evaluation period</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== DOMAIN 5: ARTS & CULTURE ===== -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div @click="toggleDomain(5)" class="p-4 border-b border-gray-200 bg-gradient-to-r from-[#8A8BE6] to-[#C084FC] cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">Domain 5: Arts & Culture Conservation</h3>
              <span class="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">{{ artsCultureItemCount }} items</span>
            </div>
            <svg class="w-5 h-5 text-white transition-transform duration-300" :class="{ 'rotate-180': isDomainExpanded(5) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="overflow-hidden transition-all duration-300" :class="isDomainExpanded(5) ? 'max-h-[12000px] opacity-100' : 'max-h-0 opacity-0'">
            <div class="p-4 space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClientOnly>
                  <div class="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-1 text-center">Arts and Culture Conservation Performance</h4>
                    <p class="text-xs text-gray-500 text-center mb-4">
                      Threshold ({{ lecturerData.domainThresholds?.domain5 || 0 }}) - Earned score ({{ domainScores.artsCulture.toFixed(1) }})
                    </p>
                    <div class="h-[280px] sm:h-[320px] w-full">
                      <canvas ref="artsCultureBarChart"></canvas>
                    </div>
                  </div>
                </ClientOnly>
                <div class="flex flex-col gap-6">
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">Self Development</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.artsCulture?.selfDevelopment)" class="text-center py-6 text-gray-400 text-xs">No self-development activities found</div>
                      <div v-else class="space-y-2">
                        <div v-for="(a, i) in detailedData.artsCulture.selfDevelopment" :key="i" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p class="font-medium text-gray-900 text-sm">{{ a.activity || a.activityname || '-' }}</p>
                          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span v-if="a.startdate">📅 {{ formatDate(a.startdate) }}</span>
                            <span v-if="a.typename">📋 {{ a.typename }}</span>
                            <span v-if="a.venue">📍 {{ a.venue }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-3 sm:p-4">
                    <h4 class="text-sm font-semibold text-gray-900 mb-2">MFU-arranged activities</h4>
                    <div class="max-h-[200px] overflow-y-auto">
                      <div v-if="!hasValidData(detailedData?.artsCulture?.mfuArranged)" class="text-center py-6 text-gray-400 text-xs">No MFU arranged activities found</div>
                      <table v-else class="min-w-full text-xs">
                        <thead class="sticky top-0">
                          <tr>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-center text-[11px] font-bold uppercase">No.</th>
                            <th class="px-2 py-2 bg-[#046e93] text-white text-left text-[11px] font-bold uppercase">Activity</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(a, i) in detailedData.artsCulture.mfuArranged" :key="i" :class="i % 2 === 1 ? 'bg-[#E8F4FC]' : ''">
                            <td class="px-2 py-1 text-center text-gray-600">{{ i + 1 }}</td>
                            <td class="px-2 py-1 text-gray-900">{{ a.activities || a.projectname || a.activity || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Arts & Culture Raw Scores Summary -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div v-for="item in artsCultureRawScoreSummary" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-gray-500 leading-tight">{{ item.label }}</p>
                  <p class="text-lg font-bold text-gray-800">{{ item.value }}</p>
                </div>
              </div>

              <div v-if="artsCultureItemCount === 0" class="text-center py-8 text-gray-400">
                <p class="font-medium">No arts & culture data available for this evaluation period</p>
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
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { computed, ref, watch, onUnmounted, onMounted, nextTick } from 'vue';

definePageMeta({ layout: 'lecturer' });

const { user } = useFirebaseAuth();
const { evaluationPeriods, loading: isLoadingPeriods, fetchEvaluationPeriods, activeEvaluationPeriod } = useEvaluationPeriods();

const selectedEvaluationPeriod = ref<number>(9);
const loading = ref(true);
const fetchError = ref<string | null>(null);
const lecturerData = ref<any>(null);
const detailedData = ref<any>(null);
const expandedDomains = ref<Set<number>>(new Set([1]));

// Chart refs
const overallPieChart = ref<HTMLCanvasElement | null>(null);
const domainPieChart = ref<HTMLCanvasElement | null>(null);
const teachingBarChart = ref<HTMLCanvasElement | null>(null);
const researchBarChart = ref<HTMLCanvasElement | null>(null);
const academicServiceBarChart = ref<HTMLCanvasElement | null>(null);
const administrationBarChart = ref<HTMLCanvasElement | null>(null);
const artsCultureBarChart = ref<HTMLCanvasElement | null>(null);

let chartInstances: Record<string, Chart | null> = {
  overall: null, domain: null, teaching: null, research: null,
  academicService: null, administration: null, artsCulture: null
};

const runtimeConfig = useRuntimeConfig();
const getBackendUrl = () => runtimeConfig.public.apiBase || runtimeConfig.public.backendApiUrl || 'https://som.mlbbshop.app';

// Toggle domain expansion
const toggleDomain = (n: number) => {
  const s = new Set(expandedDomains.value);
  s.has(n) ? s.delete(n) : s.add(n);
  expandedDomains.value = s;
};
const isDomainExpanded = (n: number) => expandedDomains.value.has(n);

// Computed domain scores
const domainScores = computed(() => {
  if (!lecturerData.value) return { teaching: 0, research: 0, academicService: 0, administration: 0, artsCulture: 0 };
  const s = lecturerData.value.domainScores || {};
  return { teaching: s.domain1 || 0, research: s.domain2 || 0, academicService: s.domain3 || 0, administration: s.domain4 || 0, artsCulture: s.domain5 || 0 };
});

// Helper: check valid data
const hasValidData = (arr: any[] | undefined): boolean => {
  if (!arr || arr.length === 0) return false;
  return arr.some(item => {
    const vals = Object.values(item);
    return vals.some(v => v !== null && v !== undefined);
  });
};

// Helper: format date
const formatDate = (d: string) => {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

// Helper: get score sum from array
const getScoreSum = (arr: any[] | undefined, field: string): string => {
  if (!arr || arr.length === 0) return '0';
  const sum = arr.reduce((s: number, item: any) => s + (parseFloat(item[field]) || 0), 0);
  return sum % 1 === 0 ? String(sum) : sum.toFixed(1);
};

// Helper: get first item score
const getScoreFirst = (arr: any[] | undefined, ...fields: string[]): string => {
  if (!arr || arr.length === 0) return '0';
  const item = arr[0];
  for (const f of fields) {
    if (item[f] !== null && item[f] !== undefined) {
      const v = parseFloat(item[f]);
      return isNaN(v) ? '0' : (v % 1 === 0 ? String(v) : v.toFixed(1));
    }
  }
  return '0';
};

// Helper: extract raw score
const extractRawScore = (arr: any[] | undefined): number => {
  if (!arr || arr.length === 0) return 0;
  const item = arr[0];
  if (item.sumscore === null && item.staffcode === null) return 0;
  const val = item.sumscore ?? item.score ?? item.rawscore ?? item.totalscore ?? item.scorelect ?? 0;
  return parseFloat(String(val)) || 0;
};

// Helper: sum all scores
const extractRawScoreSum = (arr: any[] | undefined): number => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum: number, item: any) => {
    if (item.sumscore === null && item.staffcode === null) return sum;
    const val = item.sumscore ?? item.score ?? item.rawscore ?? item.totalscore ?? 0;
    return sum + (parseFloat(String(val)) || 0);
  }, 0);
};

// Quality of Work display
const qualityOfWorkDisplay = computed(() => {
  const qw = detailedData.value?.teaching?.qualityOfWork;
  if (qw && qw.length > 0) {
    const item = qw[0];
    if (item.qualityscore !== null) {
      return `${Math.round((item.qualityscore || 0) * 100) / 100}/${item.totalquality || 50}`;
    }
  }
  return '0/50';
});

// Grouped courses
const groupedUndergraduateCourses = computed(() => groupCourses(detailedData.value?.teaching?.undergraduate || []));
const groupedGraduateCourses = computed(() => groupCourses(detailedData.value?.teaching?.graduate || []));

function groupCourses(courses: any[]) {
  const grouped: Record<string, { coursecode: string; coursename: string; sections: string[]; totalStudents: number }> = {};
  courses.forEach(c => {
    const code = c.coursecode || 'Unknown';
    if (!grouped[code]) grouped[code] = { coursecode: code, coursename: c.coursename || '-', sections: [], totalStudents: 0 };
    if (c.section) grouped[code].sections.push(String(c.section));
    grouped[code].totalStudents += parseInt(c.totalstudent) || 0;
  });
  Object.values(grouped).forEach(g => g.sections.sort((a, b) => parseInt(a) - parseInt(b)));
  return Object.values(grouped);
}

// Item counts
const teachingItemCount = computed(() => {
  const d = detailedData.value?.teaching;
  if (!d) return 0;
  return groupedUndergraduateCourses.value.length + groupedGraduateCourses.value.length +
    (hasValidData(d.studentInternships) ? d.studentInternships.length : 0) +
    (hasValidData(d.studentProjects) ? d.studentProjects.length : 0) +
    (hasValidData(d.thesisOversight) ? d.thesisOversight.length : 0) +
    (hasValidData(d.otherTeachingTasks) ? d.otherTeachingTasks.length : 0) +
    (hasValidData(d.qualityOfWork) ? 1 : 0);
});

const researchItemCount = computed(() => {
  const d = detailedData.value?.research;
  if (!d) return 0;
  return (hasValidData(d.studies) ? d.studies.length : 0) +
    (hasValidData(d.publications) ? d.publications.length : 0);
});

const academicServiceItemCount = computed(() => {
  const d = detailedData.value?.academicService;
  if (!d) return 0;
  return (hasValidData(d.activities) ? d.activities.length : 0) +
    (hasValidData(d.invitedLecturer) ? d.invitedLecturer.length : 0);
});

const administrationItemCount = computed(() => {
  const d = detailedData.value?.administration;
  if (!d) return 0;
  return (hasValidData(d.curricularCommittee) ? d.curricularCommittee.length : 0) +
    (hasValidData(d.schoolCommittee) ? d.schoolCommittee.length : 0);
});

const artsCultureItemCount = computed(() => {
  const d = detailedData.value?.artsCulture;
  if (!d) return 0;
  return (hasValidData(d.selfDevelopment) ? d.selfDevelopment.length : 0) +
    (hasValidData(d.mfuArranged) ? d.mfuArranged.length : 0);
});

// Raw Score Summaries
const researchRawScoreSummary = computed(() => {
  const rs = detailedData.value?.rawScores?.research;
  if (!rs) return [];
  return [
    { label: 'Research Studies', value: extractRawScoreSum(rs.studies) },
    { label: 'Publications', value: extractRawScoreSum(rs.publications) },
    { label: 'Academic Articles', value: extractRawScore(rs.academicArticles) },
    { label: 'Textbooks', value: extractRawScore(rs.textbooks) },
    { label: 'Patents', value: extractRawScore(rs.patentedInventions) },
    { label: 'Other Academic', value: extractRawScore(rs.otherWork) },
    { label: 'School Assigned', value: extractRawScore(rs.otherWorkSchool) }
  ].map(i => ({ ...i, value: i.value % 1 === 0 ? String(i.value) : i.value.toFixed(1) }));
});

const academicServiceRawScoreSummary = computed(() => {
  const rs = detailedData.value?.rawScores?.academicService;
  if (!rs) return [];
  return [
    { label: 'Activities', value: extractRawScoreSum(rs.activities) },
    { label: 'Invited Lecturer', value: extractRawScoreSum(rs.invitedLecturer) },
    { label: 'External Committee', value: extractRawScore(rs.externalCommittee) },
    { label: 'Academic Reviewer', value: extractRawScore(rs.academicReviewer) },
    { label: 'Other Service', value: extractRawScore(rs.otherService) }
  ].map(i => ({ ...i, value: i.value % 1 === 0 ? String(i.value) : i.value.toFixed(1) }));
});

const administrationRawScoreSummary = computed(() => {
  const rs = detailedData.value?.rawScores?.administration;
  if (!rs) return [];
  return [
    { label: 'Admin Duty', value: extractRawScore(rs.administrativeDuty) },
    { label: 'Curricular Comm.', value: extractRawScore(rs.curricularCommittee) },
    { label: 'School Comm.', value: extractRawScore(rs.schoolCommittee) },
    { label: "School's WG", value: extractRawScore(rs.schoolWorkingGroup) },
    { label: "University WG", value: extractRawScore(rs.universityWorkingGroup) },
    { label: 'Course Coord.', value: extractRawScore(rs.courseCoordination) },
    { label: 'Guest Lecturer', value: extractRawScore(rs.guestLecturer) },
    { label: 'Academic Admin', value: extractRawScore(rs.academicAdmin) }
  ].map(i => ({ ...i, value: i.value % 1 === 0 ? String(i.value) : i.value.toFixed(1) }));
});

const artsCultureRawScoreSummary = computed(() => {
  const rs = detailedData.value?.rawScores?.artsCulture;
  if (!rs) return [];
  return [
    { label: 'MFU Activities', value: extractRawScore(rs.mfuArranged) },
    { label: 'Student Dev', value: extractRawScore(rs.studentDevelopment) },
    { label: 'Self Dev', value: extractRawScore(rs.selfDevelopment) },
    { label: 'Org Dev', value: extractRawScore(rs.organizationDevelopment) },
    { label: 'Arts Conservation', value: extractRawScore(rs.artsConservation) }
  ].map(i => ({ ...i, value: i.value % 1 === 0 ? String(i.value) : i.value.toFixed(1) }));
});

// Performance badge
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

// Firebase token
const getFirebaseToken = async (): Promise<string | null> => {
  let attempts = 0;
  while (!user.value && attempts < 30) { await new Promise(r => setTimeout(r, 200)); attempts++; }
  if (!user.value) return null;
  try { return await user.value.getIdToken(); } catch { return null; }
};

// Fetch from E-port via lecturer backend proxy (own data only)
const fetchMfuData = async (endpoint: string, token: string, evaluateId: string): Promise<any[]> => {
  try {
    const url = `${getBackendUrl()}/api/lecturer/mfu/${endpoint}?evaluateid=${evaluateId}`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (response.ok) { const result = await response.json(); return result?.data || []; }
    return [];
  } catch (err) { console.error(`[E-port] Error ${endpoint}:`, err); return []; }
};

// Fetch ALL 42 E-port endpoints
const fetchDetailedDomainData = async (token: string, evaluateId: string) => {
  console.log('[lecturer] Fetching ALL E-port data (42 endpoints)...');
  try {
    // Domain 1: Teaching (9 endpoints)
    const [ug, grad, ugRaw, gradRaw, internships, projects, thesis, otherTasks, quality] = await Promise.allSettled([
      fetchMfuData('get_Undergraduate', token, evaluateId),
      fetchMfuData('get_Graduate', token, evaluateId),
      fetchMfuData('get_UndergraduateRawscore', token, evaluateId),
      fetchMfuData('get_GraduateRawscore', token, evaluateId),
      fetchMfuData('get_StudentInternships', token, evaluateId),
      fetchMfuData('get_StudentProjects', token, evaluateId),
      fetchMfuData('get_ThesisOversightDuties', token, evaluateId),
      fetchMfuData('get_OtherTeachingTasks', token, evaluateId),
      fetchMfuData('get_QualityofWork', token, evaluateId)
    ]);

    // Domain 2: Research (9 endpoints)
    const [rStudies, rPub, rStudiesRaw, rPubRaw, articlesRaw, textbooksRaw, patentsRaw, otherWorkRaw, otherWorkSchoolRaw] = await Promise.allSettled([
      fetchMfuData('get_ResearchStudies', token, evaluateId),
      fetchMfuData('get_ResearchPublication', token, evaluateId),
      fetchMfuData('get_ResearchStudiesRawscore', token, evaluateId),
      fetchMfuData('get_ResearchPublicationRawscore', token, evaluateId),
      fetchMfuData('get_AcademicArticlesRawscore', token, evaluateId),
      fetchMfuData('get_CompositionofTextbooks', token, evaluateId),
      fetchMfuData('get_PatentedInventions', token, evaluateId),
      fetchMfuData('get_OtherAcademicWork', token, evaluateId),
      fetchMfuData('get_OtherAcademicWorkassignedbytheSchool', token, evaluateId)
    ]);

    // Domain 3: Academic Service (7 endpoints)
    const [asAct, asInvited, asActRaw, asInvitedRaw, asExtCommRaw, asReviewerRaw, asOtherRaw] = await Promise.allSettled([
      fetchMfuData('get_AcademicServiceActivities', token, evaluateId),
      fetchMfuData('get_PerformanceasanInvitedLecturerorSpeaker', token, evaluateId),
      fetchMfuData('get_AcademicServiceActivitiesRawscore', token, evaluateId),
      fetchMfuData('get_PerformanceasanInvitedLecturerorSpeakerRawscore', token, evaluateId),
      fetchMfuData('get_ExternalCommitteeAdvisorMemberRawscore', token, evaluateId),
      fetchMfuData('get_AcademicreviewerRawscore', token, evaluateId),
      fetchMfuData('get_OtherTypesofAcademicServiceProvidedRawscore', token, evaluateId)
    ]);

    // Domain 4: Administration (10 endpoints)
    const [adCurr, adSchool, adDutyRaw, adCurrRaw, adSchoolRaw, adSchoolWgRaw, adUniWgRaw, adCourseRaw, adGuestRaw, adAcadRaw] = await Promise.allSettled([
      fetchMfuData('get_CurricularCommittee', token, evaluateId),
      fetchMfuData('get_SchoolCommittee', token, evaluateId),
      fetchMfuData('get_AdministrativedutyassignedbytheSchoolRawscore', token, evaluateId),
      fetchMfuData('get_CurricularCommitteeRawscore', token, evaluateId),
      fetchMfuData('get_SchoolCommitteeRawscore', token, evaluateId),
      fetchMfuData('get_SchoolCommitteeorCommitteeAppointedWorkingGroupRawscore', token, evaluateId),
      fetchMfuData('get_UniversityCommitteeorCommitteeAppointedWorkingGroupRawscore', token, evaluateId),
      fetchMfuData('get_CourseCoordinationRawscore', token, evaluateId),
      fetchMfuData('get_CoordinationwithaGuestLecturerRawscore', token, evaluateId),
      fetchMfuData('get_AcademicAdministrationassignedbytheSchoolorUniversityRawscore', token, evaluateId)
    ]);

    // Domain 5: Arts & Culture (7 endpoints)
    const [acSelf, acMfu, acMfuRaw, acStudDevRaw, acSelfRaw, acOrgRaw, acArtsRaw] = await Promise.allSettled([
      fetchMfuData('get_Selfdevelopment', token, evaluateId),
      fetchMfuData('get_MFUarrangedactivities', token, evaluateId),
      fetchMfuData('get_MFUarrangedactivitiesRawscore', token, evaluateId),
      fetchMfuData('get_StudentdevelopmentactivitiesRawscore', token, evaluateId),
      fetchMfuData('get_SelfdevelopmentRawscore', token, evaluateId),
      fetchMfuData('get_OrganizationdevelopmentorparticipationRawscore', token, evaluateId),
      fetchMfuData('get_ArtsandCultureConservationPerformanceRawscore', token, evaluateId)
    ]);

    const v = (p: PromiseSettledResult<any[]>) => p.status === 'fulfilled' ? p.value : [];

    detailedData.value = {
      teaching: {
        undergraduate: v(ug), graduate: v(grad),
        studentInternships: v(internships), studentProjects: v(projects),
        thesisOversight: v(thesis), otherTeachingTasks: v(otherTasks), qualityOfWork: v(quality)
      },
      research: {
        studies: v(rStudies), publications: v(rPub)
      },
      academicService: { activities: v(asAct), invitedLecturer: v(asInvited) },
      administration: { curricularCommittee: v(adCurr), schoolCommittee: v(adSchool) },
      artsCulture: { selfDevelopment: v(acSelf), mfuArranged: v(acMfu) },
      rawScores: {
        teaching: {
          undergraduate: v(ugRaw), graduate: v(gradRaw),
          studentInternships: v(internships), studentProjects: v(projects),
          thesisOversight: v(thesis), otherTeachingTasks: v(otherTasks)
        },
        research: {
          studies: v(rStudiesRaw), publications: v(rPubRaw),
          academicArticles: v(articlesRaw), textbooks: v(textbooksRaw),
          patentedInventions: v(patentsRaw), otherWork: v(otherWorkRaw),
          otherWorkSchool: v(otherWorkSchoolRaw)
        },
        academicService: {
          activities: v(asActRaw), invitedLecturer: v(asInvitedRaw),
          externalCommittee: v(asExtCommRaw), academicReviewer: v(asReviewerRaw),
          otherService: v(asOtherRaw)
        },
        administration: {
          administrativeDuty: v(adDutyRaw), curricularCommittee: v(adCurrRaw),
          schoolCommittee: v(adSchoolRaw), schoolWorkingGroup: v(adSchoolWgRaw),
          universityWorkingGroup: v(adUniWgRaw), courseCoordination: v(adCourseRaw),
          guestLecturer: v(adGuestRaw), academicAdmin: v(adAcadRaw)
        },
        artsCulture: {
          mfuArranged: v(acMfuRaw), studentDevelopment: v(acStudDevRaw),
          selfDevelopment: v(acSelfRaw), organizationDevelopment: v(acOrgRaw),
          artsConservation: v(acArtsRaw)
        }
      }
    };
    console.log('[lecturer] All 42 E-port endpoints loaded successfully');
  } catch (err) {
    console.error('[lecturer] Error fetching E-port data:', err);
  }
};

// Fetch data
const fetchData = async () => {
  loading.value = true;
  fetchError.value = null;

  try {
    const token = await getFirebaseToken();
    if (!token) { fetchError.value = 'Authentication required. Please log in again.'; loading.value = false; return; }

    const evalPeriod = String(selectedEvaluationPeriod.value || '9');

    // Fetch get_Percentage via lecturer proxy (backend resolves staffcode from email)
    const res = await fetch(`${getBackendUrl()}/api/lecturer/mfu/get_Percentage?evaluateid=${evalPeriod}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const result = await res.json();
      const data = result?.data || result;
      const api = Array.isArray(data) ? data[0] : data;

      if (api) {
        const ds = {
          domain1: parseFloat(api.domain1score) || 0,
          domain2: parseFloat(api.domain2score) || 0,
          domain3: parseFloat(api.domain3score) || 0,
          domain4: parseFloat(api.domain4score) || 0,
          domain5: parseFloat(api.domain5score) || 0,
        };
        const dw = {
          domain1: parseFloat(api.domain1weight) || 35,
          domain2: parseFloat(api.domain2weight) || 40,
          domain3: parseFloat(api.domain3weight) || 10,
          domain4: parseFloat(api.domain4weight) || 5,
          domain5: parseFloat(api.domain5weight) || 10
        };
        const dt = {
          domain1: parseFloat(api.domain1threshold) || 0,
          domain2: parseFloat(api.domain2threshold) || 0,
          domain3: parseFloat(api.domain3threshold) || 0,
          domain4: parseFloat(api.domain4threshold) || 0,
          domain5: parseFloat(api.domain5threshold) || 0
        };

        const academicPerformance = parseFloat(api['Academic Performance (60%)']) || parseFloat(api.academicperformance) || ((ds.domain1 / 100) * dw.domain1 + (ds.domain2 / 100) * dw.domain2 + (ds.domain3 / 100) * dw.domain3);
        const behavior = parseFloat(api['Behavior (40%)']) || parseFloat(api.behavior) || ((ds.domain4 / 100) * dw.domain4 + (ds.domain5 / 100) * dw.domain5);
        const totalScore = parseFloat(api['Total Score (100%)']) || parseFloat(api.total) || (academicPerformance + behavior);

        let performanceLevel = 'Very Poor';
        if (totalScore >= 85) performanceLevel = 'Excellent';
        else if (totalScore >= 75) performanceLevel = 'Good';
        else if (totalScore >= 65) performanceLevel = 'Moderate';
        else if (totalScore >= 55) performanceLevel = 'Poor';

        lecturerData.value = {
          staffCode: api.staffcode || '',
          staffName: api.staffname || user.value?.displayName || 'Lecturer',
          domainScoreName: api.domainscorename || 'Teaching',
          domainScores: ds,
          domainWeights: dw,
          domainThresholds: dt,
          overallPerformance: { academicPerformance, behavior, totalScore },
          performanceLevel
        };

        await fetchDetailedDomainData(token, evalPeriod);
      } else {
        throw new Error('No KPI data found for your account');
      }
    } else {
      const errBody = await res.text();
      throw new Error(`Failed to fetch KPI data: ${res.status} - ${errBody}`);
    }
  } catch (e: any) {
    fetchError.value = e.message || 'Failed to load data';
  } finally {
    loading.value = false;
    await nextTick();
    initAllCharts();
  }
};

// ============================
// CHART INITIALIZATION
// ============================

const destroyChart = (key: string) => {
  if (chartInstances[key]) { chartInstances[key]!.destroy(); chartInstances[key] = null; }
};

const initAllCharts = () => {
  if (!lecturerData.value) return;

  // 1. Overall donut
  if (overallPieChart.value) {
    destroyChart('overall');
    const a = lecturerData.value.overallPerformance.academicPerformance;
    const b = lecturerData.value.overallPerformance.behavior;
    chartInstances.overall = new Chart(overallPieChart.value, {
      type: 'doughnut',
      data: { labels: ['Academic', 'Behavior', 'Remaining'], datasets: [{ data: [a, b, Math.max(0, 100 - a - b)], backgroundColor: ['#4697b9', '#00BFFF', '#E5E7EB'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: true, cutout: '70%', plugins: { legend: { display: false } } }
    });
  }

  // 2. Domain pie
  if (domainPieChart.value) {
    destroyChart('domain');
    const s = domainScores.value;
    chartInstances.domain = new Chart(domainPieChart.value, {
      type: 'pie',
      data: { labels: ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'], datasets: [{ data: [s.teaching, s.research, s.academicService, s.administration, s.artsCulture], backgroundColor: ['#005F99', '#00BFFF', '#7FD6D6', '#7c3aed', '#C084FC'], borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
    });
  }

  // 3. Teaching horizontal stacked bar
  if (teachingBarChart.value) {
    destroyChart('teaching');
    const rs = detailedData.value?.rawScores?.teaching;
    const undergradLect = rs?.undergraduate?.reduce((s: number, i: any) => s + (parseFloat(i.scorelect) || 0), 0) || 0;
    const undergradLab = rs?.undergraduate?.reduce((s: number, i: any) => s + (parseFloat(i.scorelab) || 0), 0) || 0;
    const gradLect = rs?.graduate?.reduce((s: number, i: any) => s + (parseFloat(i.scorelect) || 0), 0) || 0;
    const gradLab = rs?.graduate?.reduce((s: number, i: any) => s + (parseFloat(i.scorelab) || 0), 0) || 0;
    const otherScore = extractRawScore(rs?.otherTeachingTasks);
    const thesisScore = extractRawScore(rs?.thesisOversight);
    const projectsScore = extractRawScore(rs?.studentProjects);
    const internshipsScore = extractRawScore(rs?.studentInternships);

    const lectData = [otherScore, thesisScore, projectsScore, internshipsScore, gradLect, undergradLect];
    const labData = [0, 0, 0, 0, gradLab, undergradLab];
    const maxCombined = Math.max(...lectData.map((l, i) => l + labData[i]));
    const dynamicMax = Math.max(Math.ceil(maxCombined * 1.2), 200);

    chartInstances.teaching = new Chart(teachingBarChart.value, {
      type: 'bar',
      data: {
        labels: ['Other Teaching Tasks', 'Thesis Oversight Duties', 'Student Projects', 'Student Internships', 'Graduate Teaching', 'Undergraduate Teaching'],
        datasets: [
          { label: 'Lecture (Score)', data: lectData, backgroundColor: '#334155', borderRadius: 0, barThickness: 25 },
          { label: 'Lab (Score)', data: labData, backgroundColor: '#C2185B', borderRadius: 0, barThickness: 25 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { stacked: true, beginAtZero: true, max: dynamicMax, ticks: { stepSize: 20, font: { size: 11 } }, title: { display: true, text: 'Raw Score', font: { size: 12, weight: 'bold' } }, grid: { color: '#E5E7EB' } },
          y: { stacked: true, ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label || ''}: ${(ctx.parsed.x || 0).toFixed(2)}` } },
          datalabels: {
            display: (ctx) => {
              const dsIdx = ctx.datasetIndex;
              const dIdx = ctx.dataIndex;
              const datasets = ctx.chart.data.datasets;
              const total = datasets.reduce((sum, ds) => { const dv = ds.data[dIdx]; return sum + (typeof dv === 'number' ? dv : 0); }, 0);
              const val = typeof ctx.dataset.data[ctx.dataIndex] === 'number' ? ctx.dataset.data[ctx.dataIndex] as number : 0;
              return val > 0 || (dsIdx === datasets.length - 1 && total >= 0);
            },
            anchor: 'end', align: 'right', color: '#374151',
            font: { size: 11, weight: 'bold' },
            formatter: (_val, ctx) => {
              const dIdx = ctx.dataIndex;
              const datasets = ctx.chart.data.datasets;
              if (ctx.datasetIndex === datasets.length - 1) {
                const total = datasets.reduce((sum, ds) => { const dv = ds.data[dIdx]; return sum + (typeof dv === 'number' ? dv : 0); }, 0);
                return total > 0 ? total.toFixed(1) : '0';
              }
              return '';
            },
            offset: 8
          }
        },
        layout: { padding: { right: 40, left: 10, top: 10, bottom: 10 } }
      },
      plugins: [ChartDataLabels]
    });
  }

  // 4. Research horizontal bar
  if (researchBarChart.value) {
    destroyChart('research');
    const rs = detailedData.value?.rawScores?.research;
    const scores = [
      extractRawScore(rs?.otherWorkSchool),
      extractRawScore(rs?.otherWork),
      extractRawScore(rs?.patentedInventions),
      extractRawScore(rs?.textbooks),
      extractRawScore(rs?.academicArticles),
      extractRawScoreSum(rs?.publications),
      extractRawScoreSum(rs?.studies)
    ];
    const labels = [
      'Other Academic Work (School)',
      'Other Academic Work',
      'Patented Inventions',
      'Textbooks/Books/e-Learning',
      'Academic Articles',
      'Research Publication',
      'Research Studies'
    ];
    const maxVal = Math.max(...scores, 10);
    chartInstances.research = new Chart(researchBarChart.value, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Score', data: scores, backgroundColor: '#172554', borderRadius: 0, barThickness: 25 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: Math.max(Math.ceil(maxVal * 1.3), 180), ticks: { stepSize: 20, font: { size: 11 } }, title: { display: true, text: 'Raw Score', font: { size: 12, weight: 'bold' } }, grid: { color: '#E5E7EB' } },
          y: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          datalabels: { anchor: 'end', align: 'right', color: '#374151', font: { size: 11, weight: 'bold' }, formatter: (val) => val > 0 ? (typeof val === 'number' ? val.toFixed(1) : val) : '0', offset: 8 }
        },
        layout: { padding: { right: 40, left: 10, top: 10, bottom: 10 } }
      },
      plugins: [ChartDataLabels]
    });
  }

  // 5. Academic Service horizontal bar
  if (academicServiceBarChart.value) {
    destroyChart('academicService');
    const rs = detailedData.value?.rawScores?.academicService;
    const scores = [
      extractRawScore(rs?.otherService),
      extractRawScore(rs?.academicReviewer),
      extractRawScore(rs?.externalCommittee),
      extractRawScoreSum(rs?.invitedLecturer),
      extractRawScoreSum(rs?.activities)
    ];
    const labels = [
      'Other Types of Academic Service',
      'Academic Reviewer',
      'External Committee/Advisor/Member',
      'Performance as Invited Lecturer/Speaker',
      'Academic Service Activities'
    ];
    const maxVal = Math.max(...scores, 10);
    chartInstances.academicService = new Chart(academicServiceBarChart.value, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Score', data: scores, backgroundColor: '#172554', borderRadius: 0, barThickness: 25 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: Math.max(Math.ceil(maxVal * 1.3), 180), ticks: { stepSize: 20, font: { size: 11 } }, title: { display: true, text: 'Raw Score', font: { size: 12, weight: 'bold' } }, grid: { color: '#E5E7EB' } },
          y: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } }
        },
        plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'right', color: '#374151', font: { size: 11, weight: 'bold' }, formatter: (val) => val > 0 ? (typeof val === 'number' ? val.toFixed(1) : val) : '0', offset: 8 } },
        layout: { padding: { right: 40, left: 10, top: 10, bottom: 10 } }
      },
      plugins: [ChartDataLabels]
    });
  }

  // 6. Administration horizontal bar
  if (administrationBarChart.value) {
    destroyChart('administration');
    const rs = detailedData.value?.rawScores?.administration;
    const scores = [
      extractRawScore(rs?.academicAdmin),
      extractRawScore(rs?.guestLecturer),
      extractRawScore(rs?.courseCoordination),
      extractRawScore(rs?.universityWorkingGroup),
      extractRawScore(rs?.schoolWorkingGroup),
      extractRawScore(rs?.schoolCommittee),
      extractRawScore(rs?.curricularCommittee),
      extractRawScore(rs?.administrativeDuty)
    ];
    const labels = [
      'Academic Administration (School/Univ)',
      'Coordination with Guest Lecturer',
      'Course Coordination',
      "University's Committee",
      "School's Committee",
      'School Committee',
      'Curricular Committee',
      'Administrative Duty (School)'
    ];
    const maxVal = Math.max(...scores, 10);
    chartInstances.administration = new Chart(administrationBarChart.value, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Score', data: scores, backgroundColor: '#172554', borderRadius: 0, barThickness: 22 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: Math.max(Math.ceil(maxVal * 1.3), 180), ticks: { stepSize: 20, font: { size: 11 } }, title: { display: true, text: 'Raw Score', font: { size: 12, weight: 'bold' } }, grid: { color: '#E5E7EB' } },
          y: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } }
        },
        plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'right', color: '#374151', font: { size: 11, weight: 'bold' }, formatter: (val) => val > 0 ? (typeof val === 'number' ? val.toFixed(1) : val) : '0', offset: 8 } },
        layout: { padding: { right: 40, left: 10, top: 10, bottom: 10 } }
      },
      plugins: [ChartDataLabels]
    });
  }

  // 7. Arts & Culture horizontal bar
  if (artsCultureBarChart.value) {
    destroyChart('artsCulture');
    const rs = detailedData.value?.rawScores?.artsCulture;
    const scores = [
      extractRawScore(rs?.artsConservation),
      extractRawScore(rs?.organizationDevelopment),
      extractRawScore(rs?.selfDevelopment),
      extractRawScore(rs?.studentDevelopment),
      extractRawScore(rs?.mfuArranged)
    ];
    const labels = [
      'Arts & Culture Conservation Performance',
      'Organization development or participation',
      'Self-development',
      'Student Development activities',
      'MFU-arranged arts & culture activities'
    ];
    const maxVal = Math.max(...scores, 10);
    chartInstances.artsCulture = new Chart(artsCultureBarChart.value, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Score', data: scores, backgroundColor: '#172554', borderRadius: 0, barThickness: 25 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: Math.max(Math.ceil(maxVal * 1.3), 160), ticks: { stepSize: 20, font: { size: 11 } }, title: { display: true, text: 'Raw Score', font: { size: 12, weight: 'bold' } }, grid: { color: '#E5E7EB' } },
          y: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { display: false } }
        },
        plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'right', color: '#374151', font: { size: 11, weight: 'bold' }, formatter: (val) => val > 0 ? (typeof val === 'number' ? val.toFixed(1) : val) : '0', offset: 8 } },
        layout: { padding: { right: 40, left: 10, top: 10, bottom: 10 } }
      },
      plugins: [ChartDataLabels]
    });
  }
};

const onEvaluationPeriodChange = async () => {
  await fetchData();
};

// Watch for user email
watch(() => user.value?.email, async (email) => {
  if (email) {
    await fetchEvaluationPeriods();
    if (!selectedEvaluationPeriod.value && activeEvaluationPeriod.value) {
      selectedEvaluationPeriod.value = activeEvaluationPeriod.value.evaluateid;
    }
    await fetchData();
  }
}, { immediate: true });

onMounted(() => {
  if (lecturerData.value && !loading.value) {
    nextTick(() => {
      setTimeout(() => initAllCharts(), 200);
    });
  }
});

onUnmounted(() => {
  Object.values(chartInstances).forEach(c => c?.destroy());
});
</script>

<style scoped>
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
