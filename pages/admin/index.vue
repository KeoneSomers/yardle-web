<script setup>
import { DateTime } from "luxon";

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

  // const { data: requests, error: errorRequests } = await supabase
  //   .from("service_requests")
  //   .select("*, horse_id!inner(id, yard_id, owner, name)")
  //   .eq("horse_id.owner", "13957855-6f61-4a0b-b2fe-69391fb38c4a");
  // // .lte("id", 100);

  // console.log(requests, errorRequests);

  const { data: dd1, error: ee1 } = await supabase.functions.invoke(
    "get-next-billing-date",
    {
      body: {
        yardId: 136,
      },
    }
  );

  console.log(dd1, ee1);

  const { data: dd, error: ee } = await supabase.functions.invoke(
    "get-previous-billing-date",
    {
      body: {
        offset: 1,
        nextBillingDate: dd1,
        yardId: 136,
      },
    }
  );

  console.log(dd, ee);
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

const updateInvoiceItemHorseNames = async () => {
  const { data: data1, error: error1 } = await supabase
    .from("invoice_items")
    .select("id, horse_id, horse_name")
    .filter("horse_name", "is", null);

  console.log(data1, error1);

  if (error1) {
    return;
  }

  for (const item of data1) {
    // get the horse name
    const { data: data, error: error } = await supabase
      .from("horses")
      .select("id, name")
      .eq("id", item.horse_id)
      .single();

    const { data: data2, error: error2 } = await supabase
      .from("invoice_items")
      .update({ horse_name: data.name })
      .eq("id", item.id);

    console.log(data2, error2);

    if (error2) {
      return;
    }
  }
};
</script>

<template>
  <div class="p-10">
    <h1 class="mb-10 text-3xl">Admin Page</h1>
    <!-- <button
      @click="updateInvoiceItemHorseNames"
      class="my-4 mr-4 rounded bg-emerald-500 p-4 text-white"
    >
      Update Invoice Item Horse Names
    </button>
    <button
      @click="handleGenerateInvoices"
      class="my-4 mr-4 rounded bg-emerald-500 p-4 text-white"
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
    </button> -->
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
          <UIcon name="i-heroicons-trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
