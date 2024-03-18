<script setup>
const sidebarOpen = useState("sidebarOpen");
const profile = useState("profile");
const supabaseClient = useSupabaseClient();
const yard = useState("yard");

const handleSignout = async () => {
  sidebarOpen.value = false;
  await supabaseClient.auth.signOut();
  navigateTo("/");
};

const items = [
  [
    {
      label: "Account Settings",
      icon: "i-heroicons-cog-8-tooth",
      to: "/auth/accountSettings",
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: async () => {
        await handleSignout();
      },
    },
  ],
];
</script>

<template>
  <div
    class="flex h-14 items-center justify-between border-b border-gray-200 px-4"
  >
    <div>
      <Logo class="h-6 w-8 dark:hidden" />
      <LogoDark class="h-6 w-8 hidden dark:block" />
    </div>
    <div class="flex items-center">
      <!-- <ColorModeButton /> -->
      <div v-if="profile && profile.first_name" class="ml-3">
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <div>
            <SupabaseImage
              v-if="profile.avatar_url"
              id="avatars"
              :path="profile.avatar_url"
              class="h-9 w-9 overflow-hidden rounded-full"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center tracking-tighter text-sm justify-center rounded-full bg-emerald-500 text-white"
            >
              {{ profile.first_name[0].toUpperCase() }}
              {{ profile.last_name[0].toUpperCase() }}
            </div>
          </div>
        </UDropdown>
      </div>

      <div v-if="yard" class="lg:hidden">
        <button
          type="button"
          class="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <UIcon name="i-heroicons-bars-3" class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
