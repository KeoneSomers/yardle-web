<script setup>
definePageMeta({
  layout: "yard",
  middleware: ["require-auth", "require-yard"],
});

const isOpen = ref(false);
const selectedHorseId = useState("selectedHorseId");
const horses = useState("horses");
const profile = useState("profile");
</script>

<template>
  <HorseDirectory />

  <HorseDetails v-if="selectedHorseId > 0" />
  <div
    v-else-if="horses && horses.length > 0"
    class="flex w-full items-center justify-center"
  >
    <div class="text-center">
      <p class="font-semibold text-2xl mb-3">No Horse Selected.</p>
      <p>Select a horse by clicking their card in the list.</p>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-if="!horses || horses.length == 0"
    class="flex h-full w-full items-center justify-center"
  >
    <div
      v-if="
        profile &&
        profile.active_role &&
        (profile.active_role == 1 || profile.active_role == 2)
      "
      class="text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No horses
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by adding a horse to your yard.
      </p>
      <div class="mt-6">
        <button
          @click="() => (isOpen = true)"
          type="button"
          class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <UIcon
            name="i-heroicons-plus-solid"
            class="-ml-1 mr-2 h-5 w-5"
            aria-hidden="true"
          />
          New Horse
        </button>
      </div>
    </div>
  </div>

  <!-- Add Horse Modal -->
  <Modal
    v-if="
      profile &&
      profile.active_role &&
      (profile.active_role == 1 || profile.active_role == 2)
    "
    v-model="isOpen"
  >
    <ModalHeaderLayout title="Add a horse" @close="isOpen = false">
      <FormsCreateHorseForm @onSuccess="isOpen = false" />
    </ModalHeaderLayout>
  </Modal>
</template>
