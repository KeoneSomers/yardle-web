<script setup>
const props = defineProps(["path", "horseId", "yardId"]);
const { path } = toRefs(props);

const emit = defineEmits(["update:path"]);

const supabase = useSupabaseClient();

const isLoading = useState("isLoading", () => false);

const src = ref("");
const files = ref();

const downloadImage = async () => {
  if (!path.value) {
    return;
  }

  const { data, error } = await supabase.storage
    .from("horse-avatars")
    .download(path.value);

  if (error) {
    console.error("Error downloading image: ", error.message);
    return;
  }

  src.value = URL.createObjectURL(data);
};

console.log(props.horseId);

const uploadAvatar = async (evt) => {
  files.value = evt.target.files;
  try {
    isLoading.value = true;

    if (!files.value || files.value.length === 0) {
      throw new Error("You must select an image to upload.");
    }

    const file = files.value[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${props.yardId}/${props.horseId}.${fileExt}`;

    // delete old image (if it exists)
    if (path.value) {
      let { error: deleteError } = await supabase.storage
        .from("horse-avatars")
        .remove([path.value.split("?")[0]]);

      if (deleteError) throw deleteError;
    }

    // upload new image
    let { error: uploadError } = await supabase.storage
      .from("horse-avatars")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    emit("update:path", fileName + "?t=" + Date.now()); // add the timestamp to force a reload on the images
  } catch (error) {
    alert(error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  downloadImage();
});

watch(path, () => {
  if (path.value) {
    downloadImage();
  }
});
</script>

<template>
  <div>
    <div class="sm:col-span-2 sm:mt-0">
      <div class="flex items-center">
        <!-- preview -->
        <span class="mr-4">
          <UAvatar v-if="src" :src="src" alt="Avatar" size="lg" />
          <svg
            v-else
            class="text-gray-300 overflow-hidden rounded-full bg-gray-100 h-12 w-12"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </span>

        <!-- Input -->
        <UFormGroup label="Photo">
          <UInput
            type="file"
            id="single"
            accept="image/*"
            @change="uploadAvatar"
            :disabled="isLoading"
          />
        </UFormGroup>
      </div>
    </div>
  </div>
</template>
