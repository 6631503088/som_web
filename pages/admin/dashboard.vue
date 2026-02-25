<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Main Dashboard Title Section -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-5xl font-extrabold text-gray-900">Faculty Analytics Dashboard</h1>
          <p class="text-gray-600 text-sm mt-1">Faculty Performance Overview</p>
        </div>
        <!-- Add Program Button -->
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-[#004086] text-white rounded-lg hover:bg-[#003060] transition-colors duration-200 font-medium text-sm shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Program
        </button>
      </div>

      <!-- "Select Faculties Directory" Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="flex items-center">
          <div class="bg-[#004086] p-3.5 rounded-xl mr-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0121.485 12 12.083 12.083 0 0118.16 14.578L12 18l-6.16-3.422A12.083 12.083 0 012.515 12c0-1.25.37-2.434 1.02-3.422L12 14z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
            </svg>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Select Faculties Directory</h2>
            <p class="text-base text-gray-600 mt-1.5">Choose a department to view faculty performance metrics</p>
          </div>
        </div>

        <!-- Year Selector Dropdown -->
        <div class="relative inline-block text-left" ref="dropdownRef">
          <div>
            <button
              type="button"
              @click="toggleDropdown"
              class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              id="menu-button" aria-expanded="true" aria-haspopup="true">
              Year/ {{ selectedYear }}
              <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Dropdown menu -->
          <transition enter-active-class="transition ease-out duration-100"
                      enter-from-class="transform opacity-0 scale-95"
                      enter-to-class="transform opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="transform opacity-100 scale-100"
                      leave-to-class="transform opacity-0 scale-95">
            <div v-if="isDropdownOpen"
                 class="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
              <div class="py-1" role="none">
                <a href="#" @click.prevent="selectYear(2026)" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">2026</a>
                <a href="#" @click.prevent="selectYear(2025)" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">2025</a>
                <a href="#" @click.prevent="selectYear(2024)" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">2024</a>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004086]"></div>
        <span class="ml-3 text-gray-600">Loading programs...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <button @click="fetchPrograms" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">Try again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="departments.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
        <p class="text-gray-500 mb-4">Get started by creating your first program.</p>
        <button @click="openCreateModal" class="inline-flex items-center px-4 py-2 bg-[#004086] text-white rounded-lg hover:bg-[#003060] transition-colors duration-200 font-medium text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Program
        </button>
      </div>

      <!-- Departments Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(department, index) in departments" :key="department.program_id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 relative"
          :class="{ 'opacity-60': !department.is_active }">

          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            <span v-if="!department.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Inactive
            </span>
          </div>

          <!-- Edit/Delete Actions -->
          <div class="absolute top-3 right-3 flex space-x-1" v-if="department.is_active">
            <button @click="openEditModal(department)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Program">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(department)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Program">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Department Header -->
          <div class="flex items-center mb-5">
            <div :class="[getProgramStyle(department.program_code).color, 'p-4 rounded-xl mr-5 shadow-sm border-2 border-white/20']">
              <component :is="getProgramStyle(department.program_code).icon" class="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-xl leading-tight">{{ department.program_name }}</h3>
              <span class="text-xs text-gray-500 font-mono">{{ department.program_code }}</span>
            </div>
          </div>

          <!-- Faculty Count -->
          <div class="flex items-center mb-6">
            <peopleIcon class="h-5 w-5 text-gray-500 mr-2"/>
            <span class="text-base text-gray-700">Total Faculty: {{ department.lecturer_count }}</span>
          </div>

          <!-- Action Button -->
          <button
            @click="navigateToFaculty(department)"
            :disabled="!department.is_active"
            :class="[
              getProgramStyle(department.program_code).buttonColor, 
              getProgramStyle(department.program_code).textColor, 
              'w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2',
              'transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md',
              'active:scale-95 active:opacity-90',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50',
              { 'cursor-not-allowed opacity-50': !department.is_active }
            ]">
            <svg width="16" height="10" viewBox="0 0 18 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M9 0.178711C4.28375 0.178711 0.5625 4.99996 0.5625 4.99996C0.5625 4.99996 4.28375 9.82184 9 9.82184C12.6062 9.82184 17.4375 4.99996 17.4375 4.99996C17.4375 4.99996 12.6062 0.178711 9 0.178711ZM9 8.00371C7.34375 8.00371 5.99563 6.65621 5.99563 4.99996C5.99563 3.34371 7.34375 1.99559 9 1.99559C10.6562 1.99559 12.0044 3.34371 12.0044 4.99996C12.0044 6.65621 10.6562 8.00371 9 8.00371ZM9 3.24621C8.76695 3.24181 8.53536 3.28391 8.31877 3.37006C8.10218 3.4562 7.90494 3.58465 7.73857 3.74791C7.5722 3.91117 7.44004 4.10595 7.34983 4.32088C7.25961 4.5358 7.21314 4.76656 7.21314 4.99965C7.21314 5.23274 7.25961 5.46349 7.34983 5.67842C7.44004 5.89334 7.5722 6.08813 7.73857 6.25139C7.90494 6.41464 8.10218 6.5431 8.31877 6.62924C8.53536 6.71538 8.76695 6.75749 9 6.75309C9.45931 6.74441 9.89688 6.55587 10.2186 6.22798C10.5404 5.90009 10.7206 5.45904 10.7206 4.99965C10.7206 4.54026 10.5404 4.09921 10.2186 3.77132C9.89688 3.44343 9.45931 3.25488 9 3.24621Z" />
            </svg>
            View Faculty List
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="departments.length > 0" class="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-blue-600">{{ departments.length }}</p>
            <p class="text-sm text-blue-700">Total Programs</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-green-600">{{ activePrograms }}</p>
            <p class="text-sm text-green-700">Active Programs</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-purple-600">{{ totalLecturers }}</p>
            <p class="text-sm text-purple-700">Total Lecturers</p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-orange-600">{{ avgLecturersPerProgram }}</p>
            <p class="text-sm text-orange-700">Avg per Program</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>

          <!-- Modal panel -->
          <div class="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? 'Edit Program' : 'Create New Program' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Code *</label>
                  <input
                    v-model="formData.program_code"
                    type="text"
                    required
                    :disabled="isEditing"
                    maxlength="10"
                    placeholder="e.g., ACC, BA, ECO"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                    @input="formData.program_code = formData.program_code.toUpperCase()"
                  />
                  <p class="text-xs text-gray-500 mt-1">Short code for the program (max 10 chars)</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                  <input
                    v-model="formData.program_name"
                    type="text"
                    required
                    maxlength="100"
                    placeholder="e.g., Business Administration"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div v-if="isEditing" class="flex items-center">
                  <input
                    v-model="formData.is_active"
                    type="checkbox"
                    id="is_active"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="is_active" class="ml-2 block text-sm text-gray-700">Active</label>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="px-4 py-2 text-sm font-medium text-white bg-[#004086] rounded-lg hover:bg-[#003060] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditing ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showDeleteModal = false"></div>

          <div class="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Delete Program</h3>
                <p class="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p class="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{{ programToDelete?.program_name }}</strong>?
              <span v-if="programToDelete?.lecturer_count > 0" class="block mt-2 text-red-600 text-sm">
                Warning: This program has {{ programToDelete?.lecturer_count }} lecturer(s) assigned.
              </span>
            </p>

            <div class="flex justify-end space-x-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="isDeleting"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
      >
        <div v-if="toast.show" class="fixed bottom-4 right-4 z-50">
          <div :class="[
            'px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3',
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          ]">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ toast.message }}</span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticatedFetch } from '~/composables/useAuthenticatedFetch';
import AccountingIcon from '~/components/accountingIcon.vue';
import AviationIcon from '~/components/aviationIcon.vue';
import BusinessIcon from '~/components/businessIcon.vue';
import DeanIcon from '~/components/deanIcon.vue';
import EconomicsIcon from '~/components/economicsIcon.vue';
import HospitalityIcon from '~/components/hospitalityIcon.vue';
import LogisticIcon from '~/components/logisticIcon.vue';
import TourismIcon from '~/components/tourismIcon.vue';
import peopleIcon from '../assets/peopleIcon.vue';

const router = useRouter();
const { get, post, put, del } = useAuthenticatedFetch();

definePageMeta({
  layout: 'admin'
});

// State
const departments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const selectedYear = ref(2026);
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const formData = ref({
  program_id: null,
  program_code: '',
  program_name: '',
  is_active: true
});

// Delete modal state
const showDeleteModal = ref(false);
const programToDelete = ref(null);
const isDeleting = ref(false);

// Toast state
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// Program styles mapping
const programStyles = {
  ACC: {
    icon: AccountingIcon,
    color: 'bg-[#E0EFFF]',
    buttonColor: 'bg-[#E0EFFF]',
    textColor: 'text-[#3F63C5]'
  },
  AVI: {
    icon: AviationIcon,
    color: 'bg-[#DEF3FA]',
    buttonColor: 'bg-[#DEF3FA]',
    textColor: 'text-[#1D7DAA]'
  },
  BA: {
    icon: BusinessIcon,
    color: 'bg-[#D3F3E3]',
    buttonColor: 'bg-[#D3F3E3]',
    textColor: 'text-[#0D875E]'
  },
  ECO: {
    icon: EconomicsIcon,
    color: 'bg-[#F1E8FD]',
    buttonColor: 'bg-[#F1E8FD]',
    textColor: 'text-[#7C51AA]'
  },
  HRM: {
    icon: HospitalityIcon,
    color: 'bg-[#FFE2F1]',
    buttonColor: 'bg-[#FFE2F1]',
    textColor: 'text-[#CD3774]'
  },
  TRM: {
    icon: TourismIcon,
    color: 'bg-[#FFEBD3]',
    buttonColor: 'bg-[#FFEBD3]',
    textColor: 'text-[#EC5101]'
  },
  LOG: {
    icon: LogisticIcon,
    color: 'bg-[#FCE2E5]',
    buttonColor: 'bg-[#FCE2E5]',
    textColor: 'text-[#EC5101]'
  },
  DEAN: {
    icon: DeanIcon,
    color: 'bg-[#F6F3FC]',
    buttonColor: 'bg-[#F6F3FC]',
    textColor: 'text-[#BEADE8]'
  }
};

// Default style for unknown programs
const defaultStyle = {
  icon: BusinessIcon,
  color: 'bg-gray-100',
  buttonColor: 'bg-gray-100',
  textColor: 'text-gray-600'
};

// Computed
const activePrograms = computed(() => departments.value.filter(d => d.is_active).length);
const totalLecturers = computed(() => departments.value.reduce((sum, d) => sum + parseInt(d.lecturer_count || 0), 0));
const avgLecturersPerProgram = computed(() => {
  if (departments.value.length === 0) return 0;
  return Math.round(totalLecturers.value / departments.value.length);
});

// Methods
const getProgramStyle = (code) => {
  return programStyles[code] || defaultStyle;
};

const fetchPrograms = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const data = await get('/api/admin/dashboard/programs');
    
    if (data.success) {
      departments.value = data.programs;
    } else {
      throw new Error(data.message || 'Failed to fetch programs');
    }
  } catch (err) {
    console.error('Error fetching programs:', err);
    error.value = err.message || 'Failed to load programs. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectYear = (year) => {
  selectedYear.value = year;
  isDropdownOpen.value = false;
};

// Slug mapping for URL-friendly routes
const codeToSlugMap = {
  ACC: 'accounting',
  AVI: 'aviation',
  BA: 'business',
  ECO: 'economics',
  HRM: 'hospitality',
  TRM: 'tourism',
  LOG: 'logistics',
  DEAN: 'dean'
};

const navigateToFaculty = (department) => {
  if (!department.is_active) return;
  
  // Use mapped slug or fall back to lowercase program code
  const slug = codeToSlugMap[department.program_code] || department.program_code.toLowerCase();
  navigateTo({ path: `/admin/faculty/${slug}` });
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// Modal methods
const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    program_id: null,
    program_code: '',
    program_name: '',
    is_active: true
  };
  showModal.value = true;
};

const openEditModal = (program) => {
  isEditing.value = true;
  formData.value = {
    program_id: program.program_id,
    program_code: program.program_code,
    program_name: program.program_name,
    is_active: program.is_active === 1 || program.is_active === true
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    program_id: null,
    program_code: '',
    program_name: '',
    is_active: true
  };
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    const payload = {
      program_code: formData.value.program_code,
      program_name: formData.value.program_name,
      is_active: formData.value.is_active
    };
    
    let data;
    if (isEditing.value) {
      data = await put('/api/admin/programs/' + formData.value.program_id, payload);
    } else {
      data = await post('/api/admin/programs', payload);
    }
    
    if (data.success) {
      showToast(isEditing.value ? 'Program updated successfully' : 'Program created successfully', 'success');
      closeModal();
      await fetchPrograms();
    } else {
      throw new Error(data.message || 'Operation failed');
    }
  } catch (err) {
    console.error('Error submitting form:', err);
    showToast(err.message || 'Failed to save program', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (program) => {
  programToDelete.value = program;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!programToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    const data = await del('/api/admin/programs/' + programToDelete.value.program_id);
    
    if (data.success) {
      showToast('Program deleted successfully', 'success');
      showDeleteModal.value = false;
      programToDelete.value = null;
      await fetchPrograms();
    } else {
      throw new Error(data.message || 'Failed to delete program');
    }
  } catch (err) {
    console.error('Error deleting program:', err);
    showToast(err.message || 'Failed to delete program', 'error');
  } finally {
    isDeleting.value = false;
  }
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchPrograms();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
