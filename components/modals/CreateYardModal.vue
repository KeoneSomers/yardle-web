<script setup>
  import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
  } from "@headlessui/vue";
  defineProps(["isOpen"]);
  const emits = defineEmits(["close"]);

  const client = useSupabaseClient();
  const user = useSupabaseUser();
  const yards = useState("yards");

  const yardName = ref("");

  const error = ref("");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleSubmit = async () => {
    // step 1: create the yard in the database
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

    if (!createError) {
      // step 2: create the user/yard relationship
      const { error: relError } = await client.from("profiles_yards").insert([
        {
          profile_id: user.value.id,
          yard_id: newYard.id,
          role: 1,
        },
      ]);

      // step 3: update local state
      if (!relError) {
        if (yards.value) {
          yards.value.unshift(newYard);
        } else {
          yards.value = [newYard];
        }

        // now close the modal
        emits("close");
      } else {
        error.value = relError.message + relError.hint;
      }
    } else {
      error.value = createError.message + createError.hint;
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
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Create
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
