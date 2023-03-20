<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";

const loading = ref(false);

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yards = useState("yards");
const yardName = ref("");
const error = ref("");
const alerts = useAlerts();
const region = ref(null);

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

const { data: regions, error: regionsError } = await client
  .from("regions")
  .select()
  .order("name", { ascending: true });

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const createYard = async () => {
  if (region.value === null) {
    alerts.value.unshift({
      title: "Error",
      message: "Please select a region",
      type: "error",
    });
    loading.value = false;
    return;
  }

  const { data: newYard, error: createError } = await client
    .from("yards")
    .insert({
      created_by: user.value.id,
      name: capitalizeFirstLetter(yardName.value),
      region_id: region.value.id,
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
    yards.value.unshift({ ...newYard, region_id: region.value });
  } else {
    yards.value = [newYard];
  }

  alerts.value.unshift({
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
      alerts.value.unshift({
        title: "Error Creating Yard!",
        message: "Please try again, or contact support.",
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
              class="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Create a yard
              </DialogTitle>
              <form @submit.prevent="handleSubmit" class="mt-4">
                <label class="block text-sm font-medium leading-6 text-gray-900"
                  >Name</label
                >
                <div class="mt-2">
                  <input
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    v-model="yardName"
                    required
                  />
                </div>
                <div class="mt-5">
                  <Listbox as="div" v-model="region">
                    <ListboxLabel
                      class="block text-sm font-medium leading-6 text-gray-900"
                      >Region</ListboxLabel
                    >
                    <div class="relative mt-2">
                      <ListboxButton
                        class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      >
                        <span class="flex items-center">
                          <icon
                            v-if="region !== null"
                            :name="region.flag_icon"
                            class="h-5 w-5 flex-shrink-0"
                          />
                          <span class="ml-3 block truncate">{{
                            region === null ? "Pick one" : region.name
                          }}</span>
                        </span>
                        <span
                          class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
                        >
                          <icon
                            name="heroicons:chevron-up-down"
                            class="h-5 w-5 text-gray-400"
                          />
                        </span>
                      </ListboxButton>

                      <transition
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                          <ListboxOption
                            as="template"
                            v-for="region in regions"
                            :key="region.id"
                            :value="region"
                            v-slot="{ active, selected }"
                          >
                            <li
                              :class="[
                                active
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9',
                              ]"
                            >
                              <div class="flex items-center">
                                <icon
                                  v-if="region !== null"
                                  :name="region.flag_icon"
                                  class="h-5 w-5 flex-shrink-0"
                                />
                                <span
                                  :class="[
                                    selected ? 'font-semibold' : 'font-normal',
                                    'ml-3 block truncate',
                                  ]"
                                  >{{ region.name }}</span
                                >
                              </div>

                              <span
                                v-if="selected"
                                :class="[
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                ]"
                              >
                                <icon name="heroicons:check" class="h-5 w-5" />
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </div>
                  </Listbox>
                </div>

                <div class="mt-4 pt-4 flex justify-end space-x-2">
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
