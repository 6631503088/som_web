<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <button @click="goBack" class="mr-4 text-gray-600 hover:text-blue-600 focus:outline-none" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Lecturer Profile</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036E94]"></div>
        <span class="ml-3 text-gray-600">Loading profile...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <button @click="fetchProfileData" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">Try again</button>
      </div>

      <template v-else>
        <!-- Profile Info -->
        <div class="bg-white shadow rounded-xl p-6 mb-8">
          <div class="flex flex-col items-center justify-center mb-6">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="Profile Photo" class="w-full h-full object-cover" />
              <span v-else class="text-3xl font-bold text-gray-500">{{ getInitials(profile.fullName) }}</span>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <label class="flex items-center gap-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 7V6a2 2 0 012-2h3V2h6v2h3a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-sm text-[#036E94] font-medium hover:underline">Change Photo</span>
                <input type="file" @change="onFileChange" class="hidden" />
              </label>
            </div>
          </div>
          <div class="mt-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-800">Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Staff Code</label>
                <input v-model="profile.staffCode" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full bg-gray-50" readonly />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="profile.fullName" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="profile.email" type="email" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input v-model="profile.phone" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department / Program</label>
                <input v-model="profile.department" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Position</label>
                <input v-model="profile.position" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Office Location</label>
                <input v-model="profile.office" class="mt-2 input py-2 px-3 ring-1 ring-inset ring-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-[#036E94] transition-colors border-0 w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Education & Research Area Side by Side -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Education -->
          <div class="bg-white shadow rounded-xl p-6 h-full flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Education</h2>
              <button
                @click="addEducation"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036E94] transition-colors bg-[#036E94]"
              >
                + Add Degree
              </button>
            </div>
            <div v-if="profile.education.length" class="space-y-4 flex-1">
              <div style="max-height: 288px; overflow-y: auto;" class="space-y-4 flex-1">
                <div v-for="(edu, index) in profile.education" :key="index" class="border p-4 rounded-md">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">{{ edu.degree || 'No degree entered' }}</p>
                      <p class="text-sm text-gray-500">{{ edu.university || 'No university' }}<span v-if="edu.year"> — Graduated {{ edu.year }}</span></p>
                    </div>
                    <div class="flex space-x-2">
                      <button @click="editEducation(index)" class="text-blue-600" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button @click="removeEducation(index)" class="text-red-600" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-400 text-center py-4 flex-1 flex items-center justify-center">No education records. Click "+ Add Degree" to add one.</div>
          </div>
          
          <!-- Research Area -->
          <div class="bg-white shadow rounded-xl p-6 h-full flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Research Area</h2>
              <button
                @click="addResearchArea"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036E94] transition-colors bg-[#036E94]"
              >
                + Add Research
              </button>
            </div>
            <div v-if="profile.researchAreas.length" class="space-y-4 flex-1">
              <div style="max-height: 192px; overflow-y: auto;" class="space-y-4 flex-1">
                <div v-for="(area, index) in profile.researchAreas" :key="index" class="border p-4 rounded-md flex justify-between items-center">
                  <div class="flex-1">
                    <p class="font-medium">{{ area || 'No research area entered' }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button @click="editResearchArea(index)" class="text-blue-600" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="removeResearchArea(index)" class="text-red-600" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-400 text-center py-4 flex-1 flex items-center justify-center">No research areas. Click "+ Add Research" to add one.</div>
          </div>
        </div>

        <!-- Publications -->
        <div class="bg-white shadow rounded-xl p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Recent Publications</h2>
          </div>
          <div v-if="profile.publications.length">
            <div v-for="(pub, index) in profile.publications" :key="index" class="border p-4 rounded-md mb-2">
              <div class="flex justify-between">
                <div>
                  <p class="font-medium text-blue-700 hover:underline cursor-pointer">{{ pub.title || 'No title' }}</p>
                  <p class="text-sm text-gray-500">{{ pub.year || 'No year' }}</p>
                  <div v-if="pub.link" class="flex items-center gap-1 mt-1">
                    <span class="text-blue-600 text-sm">Link</span>
                    <button
                      @click="openPublicationLink(pub)"
                      class="focus:outline-none"
                      title="Open publication link"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button @click="editPublication(index)" class="text-blue-600" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="removePublication(index)" class="text-red-600" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400 text-center py-4">No publications found.</div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 mt-4">
          <button
            type="button"
            @click="goBack"
            class="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:border-[#036E94] hover:text-[#036E94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveChanges"
            class="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036E94] transition-colors bg-[#036E94]"
          >
            Save Changes
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthenticatedFetch } from '~/composables/useAuthenticatedFetch';

definePageMeta({
  layout: 'admin'
});

const router = useRouter();
const route = useRoute();
const { get } = useAuthenticatedFetch();

const isLoading = ref(true);
const error = ref<string | null>(null);

const profile = ref({
  photoUrl: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  office: '',
  staffCode: '',
  education: [] as Array<{ degree: string; university: string; year: string }>,
  researchAreas: [] as string[],
  publications: [] as Array<{ title: string; year: string; link?: string }>
});

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Fetch profile data based on staffCode
const fetchProfileData = async () => {
  const staffCode = route.query.staffCode as string;
  
  if (!staffCode) {
    error.value = 'No staff code provided';
    isLoading.value = false;
    return;
  }

  try {
    // Fetch lecturer profile - backend returns data directly without success wrapper
    const profileData = await get(`/api/lecturer/profile/${encodeURIComponent(staffCode)}`);
    
    if (profileData && (profileData.staffCode || profileData.staff_code)) {
      profile.value.staffCode = profileData.staffCode || profileData.staff_code || staffCode;
      profile.value.fullName = profileData.staffName || profileData.staff_name || '';
      profile.value.email = profileData.email || '';
      profile.value.phone = profileData.phone || '';
      profile.value.department = profileData.program || '';
      profile.value.position = profileData.position || 'Lecturer';
      profile.value.office = profileData.location || '';
      
      // Fetch education data - backend returns array directly
      try {
        const educationData = await get(`/api/lecturer/education/${encodeURIComponent(staffCode)}`);
        if (Array.isArray(educationData)) {
          profile.value.education = educationData.map((edu: any) => ({
            degree: edu.degree || '',
            university: edu.institution || edu.university || '',
            year: edu.year || edu.graduation_year || ''
          }));
        }
      } catch (e) {
        console.log('No education data available');
      }

      // Fetch research areas - backend returns array of strings directly
      try {
        const researchData = await get(`/api/lecturer/research/${encodeURIComponent(staffCode)}`);
        if (Array.isArray(researchData)) {
          profile.value.researchAreas = researchData.map((r: any) => 
            typeof r === 'string' ? r : (r.research_area || r.area_name || '')
          );
        }
      } catch (e) {
        console.log('No research data available');
      }

      // Fetch publications - backend returns { success: true, data: [...] }
      try {
        const publicationsData = await get(`/api/lecturer/publications/${encodeURIComponent(staffCode)}`);
        const pubArray = publicationsData.data || publicationsData;
        if (Array.isArray(pubArray)) {
          profile.value.publications = pubArray.map((pub: any) => ({
            title: pub.title || pub.publication_title || '',
            year: pub.year || pub.publication_year || '',
            link: pub.link || pub.url || ''
          }));
        }
      } catch (e) {
        console.log('No publications data available');
      }
    } else {
      error.value = 'Could not find lecturer profile';
    }
  } catch (e: any) {
    console.error('Error fetching profile:', e);
    error.value = e.message || 'Failed to load profile data';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const addEducation = () => {
  profile.value.education.push({ degree: '', university: '', year: '' });
};

const editEducation = (index: number) => {
  console.log('Edit education:', profile.value.education[index]);
};

const removeEducation = (index: number) => {
  profile.value.education.splice(index, 1);
};

const addResearchArea = () => {
  const newArea = prompt('Enter new research area:');
  if (newArea) profile.value.researchAreas.push(newArea);
};

const removeResearchArea = (index: number) => {
  profile.value.researchAreas.splice(index, 1);
};

const editResearchArea = (index: number) => {
  const current = profile.value.researchAreas[index];
  const updated = prompt('Edit research area:', current);
  if (updated !== null && updated.trim() !== '') {
    profile.value.researchAreas[index] = updated.trim();
  }
};

const editPublication = (index: number) => {
  console.log('Edit publication:', profile.value.publications[index]);
};

const removePublication = (index: number) => {
  profile.value.publications.splice(index, 1);
};

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      profile.value.photoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const openPublicationLink = (pub: { title: string; year: string; link?: string }) => {
  if (pub.link) {
    window.open(pub.link, '_blank');
  }
};

const saveChanges = () => {
  console.log('Saving profile changes:', profile.value);
  alert('Profile changes saved!');
};

onMounted(() => {
  fetchProfileData();
});
</script>
