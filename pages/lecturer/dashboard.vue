<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004086] mx-auto mb-4"></div>
      <p class="text-gray-600">Redirecting to KPI Overview...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: 'lecturer',
  middleware: [
    function (to, from) {
      return navigateTo('/lecturer/kpi-overview')
    }
  ]
})

onMounted(() => {
  window.location.href = '/lecturer/kpi-overview'
})
</script>
