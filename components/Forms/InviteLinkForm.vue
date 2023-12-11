<script setup>
const emits = defineEmits(["close"]);

const yard = useState("yard");
const copyButtonText = ref("Copy");
const link = ref("");

const toast = useToast();

onMounted(() => {
  link.value = `${window.location.origin}/join/${yard.value.invite_code}`;
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const copyLinkToClipboard = async () => {
  await navigator.clipboard.writeText(link.value);
  copyButtonText.value = "Copied!";

  toast.add({
    title: "Link Copied!",
    description: "You can now share this link with your friends.",
  });

  await delay(2000);
  copyButtonText.value = "Copy";
};
</script>

<template>
  <div>
    <div class="flex rounded-md shadow-sm">
      <span
        class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 px-3 font-mono text-gray-500 sm:text-sm"
        >https://yardle.app/join/</span
      >
      <input
        v-if="yard.invite_code"
        readonly
        type="text"
        :value="yard.invite_code"
        class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 px-3 py-2 font-mono focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
    <div class="w-full mt-4">
      <button
        @click="copyLinkToClipboard"
        class="w-full rounded bg-indigo-500 px-3 py-2 text-white"
      >
        <UIcon
          name="i-heroicons-clipboard-document"
          class="mr-2 inline-block h-4 w-4"
        />
        {{ copyButtonText }}
      </button>
    </div>
  </div>
</template>
