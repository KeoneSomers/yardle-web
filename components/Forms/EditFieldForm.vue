<script setup>
const loading = ref(false);

const props = defineProps(["field"]);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const fields = useState("fields");

const name = ref("");

onMounted(() => {
  name.value = props.field.name;
});

const handleSubmit = async () => {
  const { data, error } = await client
    .from("fields")
    .update({
      name: name.value,
    })
    .eq("id", props.field.id);

  if (error) {
    console.log(error);
    return;
  }

  // update fields locally
  const i = fields.value.map((e) => e.id).indexOf(props.field.id);
  fields.value[i].name = name.value;

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
        Save
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
