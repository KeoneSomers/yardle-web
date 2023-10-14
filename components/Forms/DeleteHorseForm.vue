<script setup>
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const selectedHorseId = useState("selectedHorseId");
const horse = useState("horse");
const horses = useState("horses");
const loading = ref(false);
const toast = useToast();
const viewingHorse = useState("viewingHorse");

const handleDeleteHorse = async () => {
  try {
    // delete horse image
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);

    if (horses.value[index].avatar_url) {
      const { error } = await client.storage
        .from("horse-avatars")
        .remove([horses.value[index].avatar_url.split("?")[0]]);

      if (error) {
        console.log(error);
        return;
      }
    }

    // first delete related data
    await client
      .from("service_requests")
      .delete()
      .eq("horse_id", horse.value.id);
    await client.from("rugs").delete().eq("horse_id", horse.value.id);
    await client.from("ingredients").delete().eq("horse_id", horse.value.id);
    await client.from("feeds").delete().eq("horse_id", horse.value.id);
    await client.from("medications").delete().eq("horse_id", horse.value.id);
    await client
      .from("field_rotation_horses")
      .delete()
      .eq("horse_id", horse.value.id);

    // second, delete horse from calendar events
    const { error: delError } = await client
      .from("calendar_events_horses")
      .delete()
      .eq("horse_id", horse.value.id);

    if (delError) {
      throw new Error(delError);
    }

    const { error: horseDeleteError } = await client
      .from("horses")
      .delete()
      .eq("id", horse.value.id)
      .select();

    if (horseDeleteError) {
      throw new Error(horseDeleteError);
    }

    // success! - now handle cleanup on frontend
    horses.value.splice(index, 1);

    // change selected horse
    if (horses.value.length > 0) {
      selectedHorseId.value = horses.value[0].id;
    } else {
      selectedHorseId.value = 0;
    }

    toast.add({
      title: "Horse deleted!",
      description: 'Horse "' + horse.value.name + '" has been deleted',
    });

    viewingHorse.value = false;
    emits("onSuccess");
  } catch (error) {
    loading.value = false;
    toast.add({
      title: "Error Deleting Horse",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <p class="text-sm">
    Are you sure you want to delete this horse? All of it's data will be
    permanently removed from this yard. This action cannot be undone.
  </p>
  <div class="flex justify-end mt-4">
    <UButton label="Confirm" @click="handleDeleteHorse()" color="red" />
  </div>
</template>
