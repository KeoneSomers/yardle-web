<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const loading = ref(false);

const props = defineProps(["isOpen", "field"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const field_rotations = useState("field_rotations");
const selectedRotation = useState("selectedRotation");
const alerts = useAlerts();

const errors = ref([]);

// handle open and close
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      errors.value = [];
    }
  }
);

const handleDelete = async () => {
  const index = field_rotations.value.map((e) => e.id).indexOf(props.field.id);

  if (field_rotations.value.length < 2) {
    // errors.value.push("You must have at least one field rotation.");

    alerts.value.unshift({
      title: "Unable To Delete!",
      message: "You must have at least one field rotation.",
      type: "error",
    });

    return;
  }

  // remove joins for this rotation in the join table
  const { error: unlinkError } = await client
    .from("field_rotation_horses")
    .delete()
    .eq("rotation_id", props.field.id);

  if (unlinkError) {
    console.log(unlinkError);
    return;
  }

  // Delete the field rotation
  const { error } = await client
    .from("field_rotations")
    .delete()
    .eq("id", props.field.id);

  if (error) {
    console.log(error);
    return;
  }

  // now remove the deleted field_rotation from the webpage
  field_rotations.value.splice(index, 1);

  // set users selected rotation back to the first one
  selectedRotation.value = field_rotations.value[0];

  alerts.value.unshift({
    title: "Field Rotation Deleted!",
    message: "Your field rotation has been deleted.",
    type: "success",
  });

  // close the modal
  emits("close");
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
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <icon
                    name="heroicons:exclamation-triangle"
                    class="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900"
                    >Delete Field rotation "{{ field.name }}"</DialogTitle
                  >
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete this field rotation? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div
                v-if="errors.length > 0"
                class="my-2 rounded-lg bg-red-100 p-4 text-red-500"
              >
                <ul class="list-inside list-disc">
                  <li v-for="error in errors" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  v-if="!loading"
                  type="button"
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  @click="handleDelete"
                >
                  Delete
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
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
