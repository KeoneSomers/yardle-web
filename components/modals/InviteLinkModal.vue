<script setup>
  import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
  } from "@headlessui/vue";
  const props = defineProps(["isOpen"]);
  const emits = defineEmits(["close"]);

  const yard = useState("yard");
  const copyButtonText = ref("Copy");
  const link = ref("");

  onMounted(() => {
    link.value = `${window.location.origin}/join/${yard.value.invite_code}`;
  });

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const copyLinkToClipboard = async () => {
    await navigator.clipboard.writeText(link.value);
    copyButtonText.value = "Copied!";
    await delay(2000);
    copyButtonText.value = "Copy";
  };
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="flex items-end space-x-3">
                <div class="flex-1">
                  <label
                    for="company-website"
                    class="block text-sm font-medium text-gray-700"
                    >Invite someone to this yard with a link!</label
                  >
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span
                      class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm"
                      >https://</span
                    >
                    <input
                      readonly
                      type="text"
                      :value="link"
                      class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <button
                    @click="copyLinkToClipboard"
                    class="bg-indigo-500 px-3 rounded py-2 text-white"
                  >
                    {{ copyButtonText }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
