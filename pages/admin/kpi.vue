<template>
  <NuxtPage :page-key="$route.fullPath" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
});
</script>
