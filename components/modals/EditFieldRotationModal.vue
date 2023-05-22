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
const toast = useToast();

const name = ref("");

watch(
  () => props.isOpen,
  (isOpen) => {
    name.value = props.field.name;
  }
);

const handleSubmit = async () => {
  const { data, error } = await client
    .from("field_rotations")
    .update({
      name: name.value,
    })
    .eq("id", props.field.id);

  if (error) {
    console.log(error);
    return;
  }

  // update field_rotations locally
  const i = field_rotations.value.map((e) => e.id).indexOf(props.field.id);
  field_rotations.value[i].name = name.value;

  toast.add({
    title: "Field Rotation Updated!",
    description: "Your field rotation has been updated.",
  });

  emits("close");
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
                Edit field rotation
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Name</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="name"
                      required
                    />
                  </div>
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <button
                    v-if="!loading"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Save
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
