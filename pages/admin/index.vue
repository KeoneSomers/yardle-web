<script setup>
// super admin page

definePageMeta({
  layout: "admin",
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

const sendTestEmail = async () => {
  await $fetch("/api/sendEmail", {
    method: "post",
    body: {
      recipients: "Keone.somers@outlook.com",
      subject: "Yardle Test Email",
      text: ``,
      html: "<p>Hello from the test email!</p>",
    },
  });
};

const handleDelete = async (id) => {
  const { error } = await supabase.from("feedback").delete().eq("id", id);

  if (error) {
    console.error(error);
  } else {
    feedback.value = feedback.value.filter((item) => item.id !== id);
  }
};

const handleGenerateInvoices = async () => {
  const result = await useFetch("/api/generateInvoices", {
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
  <div class="p-10">
    <h1 class="mb-10 text-3xl">Admin Page</h1>
    <button
      @click="handleGenerateInvoices"
      class="my-4 mr-4 rounded bg-indigo-500 p-4 text-white"
    >
      Manually Generate Todays Invoces
    </button>
    <button @click="sendTestEmail">Send Test Email</button>
    <button
      disabled
      @click="handleSendEventEmailReminders"
      class="my-4 rounded bg-blue-500 p-4 text-white"
    >
      Manually Send event email reminders
    </button>
    <div class="font-fold my-5 text-xl">Feedback</div>
    <div
      v-for="(item, index) in feedback"
      :key="item.id"
      class="my-2 flex items-center border border-zinc-800 hover:bg-zinc-800"
    >
      <div class="flex-1 border-r border-zinc-800">
        <p class="p-2">{{ index + 1 }} - {{ item.message }}</p>
        <p v-if="item.route" class="bg-zinc-800 p-1 font-mono text-xs">
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
