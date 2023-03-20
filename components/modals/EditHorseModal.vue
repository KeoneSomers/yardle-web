<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { DateTime } from "luxon";

const loading = ref(false);

const props = defineProps(["isOpen", "horse"]);
const { horse } = toRefs(props);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const horses = useState("horses");
const isLoading = useState("isLoading");
const alerts = useAlerts();

const error = ref("");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const handleSubmit = async () => {
  // step 1: create the horse in the database
  const { data: newHorse, error: createError } = await client
    .from("horses")
    .update({
      name: capitalizeFirstLetter(horse.value.name),
      breed: horse.value.breed,
      about: horse.value.about,
      color_markings: horse.value.color_markings,
      dob: horse.value.dob ? new Date(horse.value.dob).toISOString() : null,
      updated_by: user.value.id,
      updated_at: new Date().toISOString(),
      avatar_url: horse.value.avatar_url,
    })
    .eq("id", horse.value.id)
    .select()
    .single();

  // step 2: update local state
  if (!createError) {
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);
    horses.value[index].name = horse.value.name;
    horses.value[index].avatar_url = horse.value.avatar_url;
    horses.value[index].updated_at = DateTime.now();

    alerts.value.unshift({
      title: "Changes Saved!",
      message: "Your changes have been saved.",
      type: "success",
    });
    emits("close");
  } else {
    error.value = createError.message + createError.hint;

    alerts.value.unshift({
      title: "Error Editing Horse!",
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
                Edit this horse
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-3"
              >
                <div>
                  <ManageProfilePicture v-model:path="horse.avatar_url" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Name</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="horse.name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Date of Birth</label
                  >
                  <div class="mt-1">
                    <input
                      type="date"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="horse.dob"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Breed</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="horse.breed"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Color & Markings</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="horse.color_markings"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >About</label
                  >
                  <div class="mt-1">
                    <textarea
                      rows="5"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="horse.about"
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
                    v-if="!isLoading"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Loading...
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
