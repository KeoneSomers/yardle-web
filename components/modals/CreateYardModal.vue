<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const loading = ref(false);

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yards = useState("yards");
const yardName = ref("");
const error = ref("");
const alerts = useState("alerts");

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      yardName.value = "";
      error.value = "";
      loading.value = false;
    }
  }
);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const createYard = async () => {
  const { data: newYard, error: createError } = await client
    .from("yards")
    .insert({
      created_by: user.value.id,
      name: capitalizeFirstLetter(yardName.value),
      invite_code:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    })
    .select()
    .single();

  if (createError) {
    error.value = createError.message + createError.hint;
    return;
  }

  // create the user/yard relationship
  const _members = [
    {
      profile_id: user.value.id,
      yard_id: newYard.id,
      role: 1,
    },
  ];

  if (user.value.id !== "ddc8533d-0773-4211-adaf-74db9b448a02") {
    _members.push({
      profile_id: "ddc8533d-0773-4211-adaf-74db9b448a02", // add shadow user - TODO: this is dumb - redo this
      yard_id: newYard.id,
      role: 3,
    });
  }

  const { error: relError } = await client
    .from("profiles_yards")
    .insert(_members);

  if (relError) {
    error.value = relError.message + relError.hint;
    return;
  }

  // create the default field rotation for the yard
  const { error: createFieldRotationError } = await client
    .from("field_rotations")
    .insert({
      name: "Rotation 1",
      yard_id: newYard.id,
    });

  if (createFieldRotationError) {
    error.value =
      createFieldRotationError.message + createFieldRotationError.hint;
    return;
  }

  // create the default field rotation for the yard
  const { error: createBillingCycleError } = await client
    .from("yard_billing_cycles")
    .insert({
      yard_id: newYard.id,
      every: 1,
      period: 2,
      on_the: 2,
      day: 1,
    });

  if (createBillingCycleError) {
    error.value =
      createBillingCycleError.message + createBillingCycleError.hint;
    return;
  }

  // update local state
  if (yards.value) {
    yards.value.unshift(newYard);
  } else {
    yards.value = [newYard];
  }

  alerts.value.push({
    title: "Yard created!",
    message: "Your new yard has been created.",
    type: "success",
  });

  // close the modal
  emits("close");
};

const handleSubmit = async () => {
  if (loading.value === false) {
    try {
      loading.value = true;
      await createYard();
    } catch (e) {
      error.value = e.message;
      alerts.value.push({
        title: "Error Creating Yard!",
        message: "Please try again for contact support.",
        type: "error",
      });
      loading.value = false;
    }
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
                Create a yard
              </DialogTitle>
              <form @submit.prevent="handleSubmit" class="mt-4">
                <label class="block text-sm font-medium text-gray-700"
                  >Name</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    v-model="yardName"
                    required
                  />
                </div>

                <div
                  v-if="error"
                  class="p-2 my-2 bg-red-100 text-red-500 rounded-lg"
                >
                  {{ error }}
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <button
                    v-if="!loading"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Create
                  </button>
                  <LoadingButton v-else />
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
