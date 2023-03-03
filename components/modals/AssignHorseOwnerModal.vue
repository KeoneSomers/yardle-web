<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

const loading = ref(false);

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const horse = useState("horse");
const error = ref("");
const owner = ref(null);
const members = useState("members");
const selectedYard = useState("selectedYard");
const query = ref("");
const alerts = useAlerts();

await useAsyncData("members", async () => {
  const { data, error } = await client
    .from("profiles_yards")
    .select("profile:profiles(*), role")
    .eq("yard_id", selectedYard.value)
    .neq("profile_id", "ddc8533d-0773-4211-adaf-74db9b448a02") // shaddow user// TODO: check if profile is super admin - not just look at hardcoded id
    .order("role", { ascending: true });

  if (data) {
    owner.value = data[0];
    members.value = data;
  }
});

let filteredMembers = computed(() =>
  query.value === ""
    ? members.value
    : members.value.filter((member) =>
        member.profile.username
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.value.toLowerCase().replace(/\s+/g, ""))
      )
);

const handleSubmit = async () => {
  // do somthing
  try {
    if (loading.value === false) {
      loading.value = true;
      const { data, error } = await client
        .from("horses")
        .update({ owner: owner.value.profile.id })
        .eq("id", horse.value.id);

      if (error) {
        throw error;
      }

      horse.value.owner = {
        id: owner.value.profile.id,
        username: owner.value.profile.username,
      };

      alerts.value.unshift({
        title: "Owner Assigned!",
        message: `${owner.value.profile.username} has been assigned to ${horse.value.name}.`,
        type: "success",
      });

      loading.value = false;
      emits("close");
    }
  } catch (error) {
    console.log(error);
    alerts.value.unshift({
      title: "Error Assigning Owner!",
      message: "Please try again for contact support.",
      type: "error",
    });
    loading.value = false;
    error.value = error.message;
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
                Assign an owner to {{ horse.name }}
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-3"
              >
                <div v-if="members">
                  <Combobox v-model="owner">
                    <div class="relative mt-1">
                      <div
                        class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      >
                        <ComboboxInput
                          class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                          :displayValue="(member) => member.profile.username"
                          @change="query = $event.target.value"
                        />
                        <ComboboxButton
                          class="absolute inset-y-0 right-0 flex items-center pr-2"
                        >
                          <ChevronUpDownIcon
                            class="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </ComboboxButton>
                      </div>
                      <TransitionRoot
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        @after-leave="query = ''"
                      >
                        <ComboboxOptions
                          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                          <div
                            v-if="filteredMembers.length === 0 && query !== ''"
                            class="relative cursor-default select-none py-2 px-4 text-gray-700"
                          >
                            Nothing found.
                          </div>

                          <ComboboxOption
                            v-for="member in filteredMembers"
                            as="template"
                            :key="member.profile.id"
                            :value="member"
                            v-slot="{ owner, active }"
                          >
                            <li
                              class="relative cursor-default select-none py-2 pl-10 pr-4"
                              :class="{
                                'bg-indigo-600 text-white': active,
                                'text-gray-900': !active,
                              }"
                            >
                              <span
                                class="block truncate"
                                :class="{
                                  'font-medium': owner,
                                  'font-normal': !owner,
                                }"
                              >
                                {{ member.profile.username }}
                              </span>
                              <span
                                v-if="owner"
                                class="absolute inset-y-0 left-0 flex items-center pl-3"
                                :class="{
                                  'text-white': active,
                                  'text-teal-600': !active,
                                }"
                              >
                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                              </span>
                            </li>
                          </ComboboxOption>
                        </ComboboxOptions>
                      </TransitionRoot>
                    </div>
                  </Combobox>
                </div>
                <div
                  v-if="error"
                  class="p-2 my-2 bg-red-100 text-red-500 rounded-lg"
                >
                  {{ error }}
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <div
                    v-if="!loading"
                    @click="$emit('close')"
                    class="cursor-pointer inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Cancel
                  </div>
                  <button
                    v-if="!loading"
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
