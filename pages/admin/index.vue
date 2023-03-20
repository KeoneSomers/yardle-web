<script setup>
// super admin page

definePageMeta({
  layout: "blank",
  guards: [],
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const feedback = ref([]);

// Auth Check
// TODO: this should check for super admin role and not id
if (!user.value || user.value.id !== "ddc8533d-0773-4211-adaf-74db9b448a02") {
  throw createError({
    statusCode: 404,
    message: "Page not found",
  });
}

onMounted(async () => {
  // TODO: the db policy for this should be based on super admin role and not id
  const { data, error } = await supabase
    .from("feedback")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  } else {
    feedback.value = data;
  }
});

const handleDelete = async (id) => {
  const { error } = await supabase.from("feedback").delete().eq("id", id);

  if (error) {
    console.error(error);
  } else {
    feedback.value = feedback.value.filter((item) => item.id !== id);
  }
};

const handleGenerateInvoices = async () => {
  const result = await useFetch("/api/generateInvoces", {
    method: "POST",
  });

  console.log(result);
};

const handleSendEventEmailReminders = async () => {
  const result = await useFetch("/api/sendEventEmailReminders", {
    method: "POST",
  });

  console.log(result);
};
</script>

<template>
  <div class="py-20 px-10">
    <button
      @click="handleGenerateInvoices"
      class="bg-indigo-500 p-4 m-4 rounded text-white"
    >
      Manually Generate Todays Invoces
    </button>
    <button
      @click="handleSendEventEmailReminders"
      class="bg-blue-500 p-4 m-4 rounded text-white"
    >
      Send event email reminders
    </button>
    <div class="m-5 text-4xl font-fold">Feedback</div>
    <div
      v-for="(item, index) in feedback"
      :key="item.id"
      class="flex items-center border my-2 mx-5 hover:bg-gray-100"
    >
      <div class="flex-1 border-r">
        <p class="p-2">{{ index + 1 }} - {{ item.message }}</p>
        <p v-if="item.route" class="font-mono p-1 border-t text-xs bg-blue-50">
          {{ item.route }}
        </p>
      </div>
      <div class="p-2">
        <button @click="handleDelete(item.id)">
          <icon name="heroicons:trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
