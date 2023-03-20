<script setup>
const props = defineProps(["id", "path"]);
const { id, path } = toRefs(props);

const client = useSupabaseClient();
const src = ref("");

onMounted(() => {
  downloadImage();

  watchEffect(() => {
    if (path) {
      downloadImage();
    }
  });
});

const downloadImage = async () => {
  try {
    const { data, error } = await client.storage
      .from(id.value)
      .download(path.value);
    if (error) throw error;
    src.value = URL.createObjectURL(data);
  } catch (error) {
    console.error("Error downloading image: ", error.message);
  }
};
</script>

<template>
  <nuxt-img
    v-if="src"
    quality="100"
    :src="src"
    alt="Image"
    format="webp"
    class="block object-cover"
  />
</template>
