<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const message = ref("");
const showThankYou = ref(false);

watch(
  () => props.isOpen,
  (isOpen) => {
    showThankYou.value = false;
    message.value = "";
  }
);

const handleSubmit = async () => {
  const { error } = await client.from("feedback").insert({
    user_id: user.value ? user.value.id : null,
    message: message.value,
  });

  if (!error) {
    showThankYou.value = true;
    // wait 2 seconds

    setTimeout(() => {
      showThankYou.value = false;
      emits("close");
    }, 1200);
  } else {
    console.error(error);
  }
};
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Send Feedback
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <!-- <label class="block text-sm font-medium text-gray-700"
                    >Description</label
                  > -->
                  <div class="mt-1">
                    <textarea
                      rows="7"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="message"
                      required
                    />
                  </div>
                </div>

                <div
                  v-if="showThankYou"
                  class="bg-green-100 p-2 text-green-700 rounded-lg"
                >
                  <p>Feedback sent. Thank you!</p>
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <button
                    v-if="!showThankYou"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
