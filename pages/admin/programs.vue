<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8 bg-white bg-opacity-95 p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Programs Management
          </h1>
          <p class="text-gray-600 mt-1 text-sm">Manage academic programs and departments</p>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="isLoading" class="bg-gray-100 px-6 py-2.5 rounded-lg animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div v-else class="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-lg font-medium border border-indigo-100 shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ programs.length }} {{ programs.length === 1 ? 'program' : 'programs' }}
          </div>
          <button
            @click="openCreateModal"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Program
          </button>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ successMessage }}
        </div>
        <button @click="successMessage = ''" class="text-green-500 hover:text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ errorMessage }}
        </div>
        <button @click="errorMessage = ''" class="text-red-500 hover:text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filter Section -->
      <div class="bg-white bg-opacity-95 p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Programs</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by code or name..."
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>
          <div class="sm:w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Programs Table -->
      <div class="bg-white bg-opacity-95 rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program Name</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Lecturers</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading skeleton -->
              <template v-if="isLoading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-48"></div></td>
                  <td class="px-6 py-4 text-center"><div class="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                  <td class="px-6 py-4 text-center"><div class="h-6 bg-gray-200 rounded w-16 mx-auto"></div></td>
                  <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
                </tr>
              </template>

              <!-- Empty state -->
              <tr v-else-if="filteredPrograms.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p class="text-gray-500 text-lg">No programs found</p>
                    <p class="text-gray-400 text-sm mt-1">Try adjusting your search or create a new program</p>
                  </div>
                </td>
              </tr>

              <!-- Program rows -->
              <tr v-else v-for="program in filteredPrograms" :key="program.program_id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold bg-indigo-100 text-indigo-800">
                    {{ program.program_code }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ program.program_name }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    Created {{ formatDate(program.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    {{ program.lecturer_count || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="toggleStatus(program)"
                    :disabled="isUpdating === program.program_id"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    :class="program.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    <span class="w-2 h-2 rounded-full" :class="program.is_active ? 'bg-green-500' : 'bg-gray-400'"></span>
                    {{ program.is_active ? 'Active' : 'Inactive' }}
                  </button>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEditModal(program)"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit program"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(program)"
                      :disabled="(program.lecturer_count || 0) > 0"
                      class="p-2 rounded-lg transition-colors"
                      :class="(program.lecturer_count || 0) > 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-600 hover:bg-red-50'"
                      :title="(program.lecturer_count || 0) > 0 ? 'Cannot delete: has assigned lecturers' : 'Delete program'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
          
          <!-- Modal -->
          <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ isEditing ? 'Edit Program' : 'Create New Program' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="submitForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Code *</label>
                  <input
                    v-model="formData.program_code"
                    type="text"
                    required
                    maxlength="20"
                    placeholder="e.g., ACC, BA, ECO"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                    :disabled="isSubmitting"
                  />
                  <p class="text-xs text-gray-500 mt-1">Short code (max 20 characters)</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                  <input
                    v-model="formData.program_name"
                    type="text"
                    required
                    maxlength="255"
                    placeholder="e.g., Business Administration"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="isSubmitting"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <input
                    v-model="formData.is_active"
                    type="checkbox"
                    id="is_active"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    :disabled="isSubmitting"
                  />
                  <label for="is_active" class="text-sm text-gray-700">Active (visible in dropdowns)</label>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  :disabled="isSubmitting"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  :disabled="isSubmitting"
                >
                  <svg v-if="isSubmitting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
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
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDeleteModal = false"></div>
          
          <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">Delete Program</h3>
            <p class="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span class="font-semibold">{{ programToDelete?.program_name }}</span>? This action cannot be undone.
            </p>

            <div class="flex gap-3">
              <button
                @click="showDeleteModal = false"
                class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                @click="executeDelete"
                :disabled="isDeleting"
                class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg v-if="isDeleting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminPrograms, type Program } from '@/composables/useAdminPrograms'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const { 
  programs, 
  isLoading, 
  fetchPrograms, 
  createProgram, 
  updateProgram, 
  toggleProgramStatus, 
  deleteProgram 
} = useAdminPrograms()

// Local state
const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isUpdating = ref<number | null>(null)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const programToDelete = ref<Program | null>(null)
const editingProgramId = ref<number | null>(null)
const successMessage = ref('')
const errorMessage = ref('')

const formData = ref({
  program_code: '',
  program_name: '',
  is_active: true
})

// Computed
const filteredPrograms = computed(() => {
  let result = programs.value

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.program_code.toLowerCase().includes(query) ||
      p.program_name.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    result = result.filter(p => p.is_active)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(p => !p.is_active)
  }

  return result
})

// Methods
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const openCreateModal = () => {
  isEditing.value = false
  editingProgramId.value = null
  formData.value = {
    program_code: '',
    program_name: '',
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (program: Program) => {
  isEditing.value = true
  editingProgramId.value = program.program_id
  formData.value = {
    program_code: program.program_code,
    program_name: program.program_name,
    is_active: program.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingProgramId.value = null
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    if (isEditing.value && editingProgramId.value) {
      await updateProgram(editingProgramId.value, {
        program_code: formData.value.program_code,
        program_name: formData.value.program_name,
        is_active: formData.value.is_active
      })
      successMessage.value = 'Program updated successfully'
    } else {
      await createProgram({
        program_code: formData.value.program_code,
        program_name: formData.value.program_name,
        is_active: formData.value.is_active
      })
      successMessage.value = 'Program created successfully'
    }
    closeModal()
    setTimeout(() => successMessage.value = '', 5000)
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const toggleStatus = async (program: Program) => {
  isUpdating.value = program.program_id
  try {
    await toggleProgramStatus(program.program_id, !program.is_active)
    successMessage.value = `Program ${!program.is_active ? 'activated' : 'deactivated'} successfully`
    setTimeout(() => successMessage.value = '', 3000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update status'
  } finally {
    isUpdating.value = null
  }
}

const confirmDelete = (program: Program) => {
  programToDelete.value = program
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!programToDelete.value) return
  
  isDeleting.value = true
  try {
    await deleteProgram(programToDelete.value.program_id)
    successMessage.value = 'Program deleted successfully'
    showDeleteModal.value = false
    programToDelete.value = null
    setTimeout(() => successMessage.value = '', 5000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to delete program'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchPrograms()
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load programs'
  }
})
</script>
