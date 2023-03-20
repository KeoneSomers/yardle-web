<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const loading = ref(false);

defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const rugs = useState("rugs");
const selectedHorseId = useState("selectedHorseId");
const alerts = useAlerts();

const type = ref("");
const description = ref("");

const error = ref("");

const handleSubmit = async () => {
  // step 1: create the horse in the database
  const { data: newRug, error: createError } = await client
    .from("rugs")
    .insert({
      horse_id: selectedHorseId.value,
      created_by: user.value.id,
      type: type.value,
      description: description.value,
    })
    .select()
    .single();

  // step 2: update local state
  if (!createError) {
    if (rugs.value) {
      rugs.value.push(newRug);
    } else {
      rugs.value = [newRug];
    }

    // clear form
    type.value = "";
    description.value = "";

    alerts.value.unshift({
      title: "Rug Created!",
      message: "Your rug has been created.",
      type: "success",
    });

    emits("close");
  } else {
    error.value = createError.message + createError.hint;

    alerts.value.unshift({
      title: "Error Creating Rug!",
      message: "Please try again, or contact support.",
      type: "error",
    });
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
                Add a rug
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Type</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      placeholder="e.g: lightweight, heavyweight, rain sheet"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="type"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Description</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      placeholder="e.g: Blue amigo with red trim"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="description"
                      required
                    />
                  </div>
                </div>

                <div
                  v-if="error"
                  class="my-2 rounded-lg bg-red-100 p-2 text-red-500"
                >
                  {{ error }}
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <button
                    v-if="!loading"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Add
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
