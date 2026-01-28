<template>
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <p class="text-gray-600">Manage and monitor faculty performance</p>
        </div>
        <div class="flex gap-4">
          <div class="relative">
            <select class="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>All Departments</option>
              <option>Business Administration</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Management</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#046e93] hover:bg-[#035475] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#046e93]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Faculty
          </button>
        </div>
      </div>
  
      <!-- Faculty Table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">Position</th>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">KPI Score</th>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 bg-[#046e93] text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="faculty in facultyList" :key="faculty.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img class="h-10 w-10 rounded-full" :src="faculty.avatar" :alt="faculty.name">
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ faculty.name }}</div>
                      <div class="text-sm text-gray-500">{{ faculty.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ faculty.department }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ faculty.position }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-900 mr-2">{{ faculty.kpiScore }}%</div>
                    <div class="relative w-24 h-2 bg-gray-200 rounded">
                      <div class="absolute top-0 left-0 h-full rounded" 
                           :style="{ width: `${faculty.kpiScore}%`, backgroundColor: getKPIColor(faculty.kpiScore) }">
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    faculty.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ faculty.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-3">
                    <button class="text-[#046e93] hover:text-[#035475]">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button class="text-[#046e93] hover:text-[#035475]">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">48</span> results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-[#046e93] text-sm font-medium text-white">
                    2
                  </button>
                  <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({
    layout: 'dean'
  })
  
  const facultyList = ref([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 's.johnson@mfu.edu',
      department: 'Business Administration',
      position: 'Associate Professor',
      kpiScore: 92,
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'm.chen@mfu.edu',
      department: 'Marketing',
      position: 'Assistant Professor',
      kpiScore: 88,
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen'
    },
    {
      id: 3,
      name: 'Dr. Emily Wong',
      email: 'e.wong@mfu.edu',
      department: 'Finance',
      position: 'Professor',
      kpiScore: 95,
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Wong'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      email: 'j.wilson@mfu.edu',
      department: 'Management',
      position: 'Assistant Professor',
      kpiScore: 78,
      status: 'On Leave',
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson'
    },
    {
      id: 5,
      name: 'Dr. Lisa Park',
      email: 'l.park@mfu.edu',
      department: 'Business Administration',
      position: 'Associate Professor',
      kpiScore: 90,
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Park'
    }
  ])
  
  const getKPIColor = (score: number) => {
    if (score >= 90) return '#22c55e' // green
    if (score >= 80) return '#3b82f6' // blue
    if (score >= 70) return '#eab308' // yellow
    return '#ef4444' // red
  }
  </script>
  