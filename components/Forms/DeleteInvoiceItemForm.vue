<script setup>
const emits = defineEmits(["onSuccess"]);
const props = defineProps(["itemToDelete"]);

const supabase = useSupabaseClient();
const loading = ref(false);
const itemsData = useState("itemsData");
const subtotal = useState("subtotal");
const toast = useToast();

const removeItem = async () => {
  const item_id = props.itemToDelete;
  const { data, error } = await supabase
    .from("service_requests")
    .delete()
    .eq("id", item_id)
    .select()
    .single();

  if (error) {
    console.log(error);
  } else {
    // remove from the itemsData
    itemsData.value = itemsData.value.filter((item) => item.id !== item_id);

    // re-calculate the subtotal
    subtotal.value -= data.service_price;

    emits("onSuccess");
  }
  loading.value = false;

  toast.add({
    title: "Service Removed!",
    description: "This item has been removed from the invoice.",
  });
};
</script>

<template>
  <p class="text-sm">
    Are you sure you want to remove this item from the invoice?
  </p>
  <div class="flex justify-end mt-4">
    <UButton label="Confirm" @click="removeItem()" color="red" />
  </div>
</template>
