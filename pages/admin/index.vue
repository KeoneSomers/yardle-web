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
  const { data, error } = await supabase.from("feedback").select();

  if (error) {
    console.error(error);
  } else {
    feedback.value = data;
  }
});
</script>

<template>
  <div class="m-5 text-xl font-fold">Super Admin Page</div>
  <ul class="list-disc list-inside ml-5">
    <li v-for="item in feedback" :key="item.id">
      {{ item.message }}
    </li>
  </ul>
</template>
