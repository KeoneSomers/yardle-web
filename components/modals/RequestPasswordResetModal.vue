<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { KeyIcon } from "@heroicons/vue/24/outline";
import { EnvelopeIcon } from "@heroicons/vue/20/solid";

const loading = ref(false);

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const alerts = useAlerts();

watchEffect(async () => {
  if (props.isOpen) {
    email.value = "";
    successMessage.value = "";
    successMessage.value = "";
  }
});

const client = useSupabaseClient();

const handleResetPassword = async () => {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const { data, error } = await client.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/resetpassword`,
  });

  if (!error) {
    // successMessage.value = "Success! Please check your email.";
    loading.value = false;
    alerts.value.unshift({
      title: "Success!",
      message: "Please check your email.",
      type: "success",
    });
  } else {
    // errorMessage.value = error.message;
    loading.value = false;
    alerts.value.unshift({
      title: "Error!",
      message: "Please try again, or contact support.",
      type: "error",
    });
  }
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
          class="flex min-h-full justify-center p-4 text-center items-center sm:p-0"
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
              <form @submit.prevent="handleSubmit">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10"
                  >
                    <KeyIcon
                      class="h-6 w-6 text-orange-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-medium leading-6 text-gray-900"
                      >Reset Your Password</DialogTitle
                    >
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        Please enter the email you used to create your account.
                      </p>
                    </div>
                    <div class="relative mt-4 rounded-md shadow-sm">
                      <div
                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      >
                        <EnvelopeIcon
                          class="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        v-model="email"
                        type="email"
                        name="email"
                        required
                        id="email"
                        class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div
                      v-if="errorMessage"
                      class="mt-2 text-red-500 bg-red-50 rounded p-2"
                    >
                      {{ errorMessage }}
                    </div>
                    <div
                      v-if="successMessage"
                      class="mt-2 text-green-500 bg-green-50 rounded p-2"
                    >
                      {{ successMessage }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="!successMessage"
                  class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
                >
                  <button
                    v-if="!loading"
                    type="submit"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    @click="handleResetPassword"
                  >
                    Submit
                  </button>
                  <LoadingButton v-else />
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    @click="$emit('close')"
                    ref="cancelButtonRef"
                  >
                    Cancel
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
