<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useSelectedYardId();
const services = useState("services");
const yard = useState("yard");

const name = ref("");
const description = ref("");
const price = ref(0.0);
const toast = useToast();

const handleSubmit = async () => {
  const { data, error } = await client
    .from("livery_services")
    .insert({
      yard_id: yardId.value,
      name: name.value,
      description: description.value,
      price: price.value,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // update services locally
  services.value.push({
    id: data.id,
    created_at: data.created_at,
    yard_id: yardId.value,
    name: name.value,
    description: description.value,
    price: price.value,
  });

  toast.add({
    title: "Service Created!",
    description: "Your service has been created.",
  });

  emits("onSuccess");
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name</label>
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="name"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Description (optional)</label
      >
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="description"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Price ({{ yard.region.currency_iso_code }})</label
      >
      <div class="mt-1">
        <input
          placeholder="0.00"
          pattern="^\d+(?:\.\d{1,2})?$"
          type="number"
          step=".01"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="price"
          required
        />
      </div>
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Create
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
