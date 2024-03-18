<script setup>
import { DateTime } from "luxon";

const loading = ref(false);

const props = defineProps(["service"]);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const services = useState("services");
const yard = useState("yard");

const name = ref("");
const description = ref("");
const price = ref(0.0);

onMounted(async () => {
  name.value = props.service.name;
  description.value = props.service.description;
  price.value = props.service.price;
});

const handleSubmit = async () => {
  // first, update the service_price and service_name on service_requests where date is after today
  const { data: data2, error: error2 } = await client
    .from("service_requests")
    .update({
      service_name: name.value,
      service_price: price.value,
    })
    .gt("date", DateTime.now().toISODate())
    .eq("service_id", props.service.id);

  // now update the service
  const { data, error } = await client
    .from("livery_services")
    .update({
      name: name.value,
      description: description.value,
      price: price.value,
    })
    .eq("id", props.service.id);

  if (error) {
    console.log(error);
    return;
  }

  // update services locally
  const i = services.value.map((e) => e.id).indexOf(props.service.id);
  services.value[i].name = name.value;
  services.value[i].description = description.value;
  services.value[i].price = price.value;

  emits("onSuccess");
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name</label>
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="name"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Description (optional)</label
      >
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="description"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Price ({{ yard.region.currency_iso_code }})</label
      >
      <div class="mt-1">
        <input
          placeholder="0.00"
          pattern="^\d+(?:\.\d{1,2})?$"
          type="number"
          step=".01"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="price"
          required
        />
      </div>
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Save
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
