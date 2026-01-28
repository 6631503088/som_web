<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="alertState.show" class="fixed top-4 right-4 z-[100] max-w-sm w-full overflow-hidden">
      <!-- Backdrop blur for depth -->
      <div class="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-lg"></div>
      <div :class="{
        'bg-white border-l-4 border-green-500 shadow-green-100': alertState.type === 'success',
        'bg-white border-l-4 border-blue-500 shadow-blue-100': alertState.type === 'info',
        'bg-white border-l-4 border-red-500 shadow-red-100': alertState.type === 'error'
      }" class="rounded-lg p-4 shadow-lg transform transition-all">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <svg v-if="alertState.type === 'success'" class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="alertState.type === 'info'" class="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p :class="[
              'text-base font-semibold tracking-tight',
              alertState.type === 'success' ? 'text-green-900' : 
              alertState.type === 'info' ? 'text-blue-900' : 
              'text-red-900'
            ]">
              {{ alertState.title }}
            </p>
            <p :class="[
              'mt-1 text-sm leading-5',
              alertState.type === 'success' ? 'text-green-700' : 
              alertState.type === 'info' ? 'text-blue-700' : 
              'text-red-700'
            ]">
              {{ alertState.message }}
            </p>
          </div>
          <div class="flex-shrink-0 self-start ml-4">
            <button
              @click="hideAlert"
              :class="[
                'p-1.5 rounded-md inline-flex hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                alertState.type === 'success' ? 'text-green-400 hover:text-green-600' : 
                alertState.type === 'info' ? 'text-blue-400 hover:text-blue-600' : 
                'text-red-400 hover:text-red-600'
              ]"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAlert } from '~/composables/useAlert'
const { alert: alertState, hideAlert } = useAlert()
</script>
