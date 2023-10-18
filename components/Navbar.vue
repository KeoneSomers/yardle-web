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
      label: profile.value ? profile.value.email : "",
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-cog-8-tooth",
      to: "/auth/accountSettings",
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      action: handleSignout,
    },
  ],
];
</script>

<template>
  <div
    class="z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5 backdrop-blur bg-opacity-50"
  >
    <div><Logo class="h-6 w-8" /></div>
    <div class="flex items-center">
      <div v-if="profile && profile.first_name">
        <UDropdown
          :items="items"
          :ui="{ item: { disabled: 'cursor-text select-text' } }"
          :popper="{ placement: 'bottom-start' }"
        >
          <div>
            <SupabaseImage
              v-if="profile.avatar_url"
              id="avatars"
              :path="profile.avatar_url"
              class="h-9 w-9 overflow-hidden rounded-full"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center tracking-tighter text-sm justify-center rounded-full bg-indigo-500 text-white"
            >
              {{ profile.first_name[0].toUpperCase() }}
              {{ profile.last_name[0].toUpperCase() }}
            </div>
          </div>
          <template #account="{ item }">
            <div class="text-left truncate">
              <p>Signed in as</p>
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
            </div>
          </template>
          <template #item="{ item }">
            <NuxtLink v-if="item.to" :to="item.to" class="w-full flex">
              <span class="truncate">{{ item.label }}</span>
              <UIcon
                :name="item.icon"
                class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
            /></NuxtLink>
            <span v-else-if="item.action" class="w-full">
              <button
                @click="item.action()"
                class="flex justify-between w-full"
              >
                <span class="truncate">{{ item.label }}</span>
                <UIcon
                  :name="item.icon"
                  class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
                />
              </button>
            </span>
            <span v-else class="w-full">
              <span class="truncate">{{ item.label }}</span>
              <UIcon
                :name="item.icon"
                class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
              />
            </span>
          </template>
        </UDropdown>
      </div>

      <div v-if="yard" class="lg:hidden">
        <button
          type="button"
          class="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <icon name="heroicons:bars-3" class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
