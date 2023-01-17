<script setup>
  definePageMeta({
    guards: ["requireAuth", "requireYard"],
  });

  const client = useSupabaseClient();
  const user = useSupabaseUser();
  const selectedYard = useState("selectedYard");

  // get data for selected yard
  const { data: yard } = await useAsyncData("yard", async () => {
    const { data } = await client
      .from("yards")
      .select()
      .eq("id", selectedYard.value)
      .single();

    return data;
  });
</script>

<template>
  <div v-if="yard">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2
          class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
        >
          {{ yard.name }}
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <!-- <button
                    type="button"
                    class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Edit
                </button>
                <button
                    type="button"
                    class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Publish
                </button> -->
      </div>
    </div>
    <div class="py-4"></div>
  </div>
</template>
