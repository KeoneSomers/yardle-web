<script setup>
definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const yard = useState("yard");
const loading = ref(false);
const done = ref(false);

const yardName = ref("");
yardName.value = yard.value.name;

const updateYard = async () => {
  try {
    loading.value = true;
    const { data, error } = await client
      .from("yards")
      .update({ name: yardName.value })
      .eq("id", selectedYard.value);

    if (error) {
      throw error;
    }

    yard.value.name = yardName.value;
    loading.value = false;
    done.value = true;
    setTimeout(() => {
      done.value = false;
    }, 1200);
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
};
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="py-5">
        <p class="text-4xl font-bold mt-20">Yard Settings</p>
      </div>
      <hr class="my-10" />
      <h1 class="text-xl font-semibold text-gray-900">General</h1>
      <p class="mt-2 text-sm text-gray-700">
        Manage your yards name, address, and other details.
      </p>
      <div class="sm:col-span-6 mt-10">
        <label for="url" class="block text-sm font-medium text-blue-gray-900"
          >Yard Name</label
        >
        <input
          v-model="yardName"
          type="text"
          name="url"
          id="url"
          class="mt-1 block w-full rounded-md border-1 border-gray-300 text-blue-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div class="flex justify-end pt-8">
        <div v-if="!done">
          <button
            @click="yardName = yard.name"
            type="button"
            class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-blue-gray-900 shadow-sm hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            @click="updateYard"
            type="submit"
            class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
        <div v-else class="text-green-600 py-2">Changes Saved!</div>
      </div>
      <hr class="my-10" />
      <h1 class="text-xl font-semibold text-gray-900">Services & Billing</h1>
      <p class="mt-2 text-sm text-gray-700">
        Manage the services you offer to your clients and configure your billing
        settings.
      </p>
      <span
        class="my-5 inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800"
        >Coming Soon!</span
      >
    </div>
  </div>
</template>
