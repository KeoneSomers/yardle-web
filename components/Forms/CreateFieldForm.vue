<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useSelectedYardId();
const fields = useState("fields");
const toast = useToast();

const name = ref("");

const handleSubmit = async () => {
  const { data, error } = await client
    .from("fields")
    .insert({
      yard_id: yardId.value,
      name: name.value,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // update fields locally
  fields.value.push({
    id: data.id,
    name: name.value,
    horses: [],
  });

  toast.add({
    title: "Field Created!",
    description: "Your field has been created.",
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
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="name"
          required
        />
      </div>
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Create
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
