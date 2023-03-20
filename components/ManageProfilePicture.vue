<script setup>
const props = defineProps(["path"]);
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

const uploadAvatar = async (evt) => {
  files.value = evt.target.files;
  try {
    isLoading.value = true;

    if (!files.value || files.value.length === 0) {
      throw new Error("You must select an image to upload.");
    }

    const file = files.value[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // first delete the old image
    if (path.value) {
      const { error } = await supabase.storage
        .from("horse-avatars")
        .remove([path.value]);

      if (error) {
        console.error("Error removing old image: ", error.message);
        return;
      }
    }

    // upload new image
    let { error: uploadError } = await supabase.storage
      .from("horse-avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    emit("update:path", filePath);
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
    <label for="photo" class="block text-sm font-medium text-gray-700"
      >Photo</label
    >
    <div class="mt-1 sm:col-span-2 sm:mt-0">
      <div class="flex items-center">
        <span
          class="mr-4 mt-2 h-12 w-12 overflow-hidden rounded-full bg-gray-100"
        >
          <div class="w-26 h-26">
            <img v-if="src" :src="src" alt="Avatar" class="object-cover" />
            <svg
              v-else
              class="h-full w-full text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </span>
        <!-- <button
                    type="button"
                    class="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Change
                </button> -->
        <input
          type="file"
          id="single"
          accept="image/*"
          @change="uploadAvatar"
          :disabled="isLoading"
        />
      </div>
    </div>
  </div>
</template>
