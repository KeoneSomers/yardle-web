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
const selectedYard = useState("selectedYard");
const horses = useState("horses");
const selectedHorseId = useState("selectedHorseId");
const alerts = useAlerts();

const name = ref("");

const error = ref("");

const backgrounds = [
  "bg-pink-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-cyan-500",
];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const handleSubmit = async () => {
  try {
    if (loading.value === false) {
      loading.value = true;
      // step 1: create the horse in the database
      const { data: newHorse, error: createError } = await client
        .from("horses")
        .insert({
          name: capitalizeFirstLetter(name.value),
          yard_id: selectedYard.value,
          created_by: user.value.id,
          avatar_background:
            backgrounds[Math.floor(Math.random() * backgrounds.length)],
        })
        .select()
        .single();

      // step 2: update local state
      if (createError) {
        throw new Error("Error adding new horse");
      }

      horses.value.push(newHorse);
      name.value = "";
      selectedHorseId.value = newHorse.id;

      alerts.value.push({
        title: "Horse Created!",
        message: "You have added a horse to the yard.",
        type: "success",
      });

      loading.value = false;
      emits("close");
    }
  } catch (err) {
    alerts.value.push({
      title: "Error Creating Horse!",
      message: "Please try again for contact support.",
      type: "error",
    });
    loading.value = false;
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
                Add a horse
              </DialogTitle>
              <form @submit.prevent="handleSubmit" class="mt-4">
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
