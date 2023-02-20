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

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useState("selectedYard");
const serviceRequests = useState("service_requests");
const horse = useState("horse");
const liveryServices = ref([]);

const selectedService = ref(null);
const date = ref(null);

watch(
  () => props.isOpen,
  (isOpen) => {
    selectedService.value = null;
  }
);

const fetchLiveryServices = async () => {
  const { data, error } = await client
    .from("livery_services")
    .select()
    .eq("yard_id", yardId.value);

  if (!error) {
    liveryServices.value = data;
  }
};

await fetchLiveryServices();

const handleSubmit = async () => {
  const { data, error } = await client
    .from("service_requests")
    .insert({
      created_by: user.value.id,
      horse_id: horse.value.id,
      service_id: selectedService.value,
      date: date.value,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // update horseServices locally
  serviceRequests.value.push(data);

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
                Request a service
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Service</label
                  >
                  <select
                    v-model="selectedService"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option
                      v-for="item in liveryServices"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.name }} - £{{ item.price }}
                    </option>
                  </select>
                </div>
                <div class="flex space-x-2">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700"
                      >Date</label
                    >
                    <div class="mt-1">
                      <input
                        type="date"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        v-model="date"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 flex justify-end space-x-2">
                  <button
                    v-if="!loading"
                    :disabled="date === null || selectedService === null"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Submit
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
