<script setup>
import draggable from "vuedraggable";
import CreateFieldModal from "@/components/modals/CreateFieldModal.vue";
import EditFieldModal from "@/components/modals/EditFieldModal.vue";
import DeleteFieldModal from "@/components/modals/DeleteFieldModal.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid/index.js";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const createModalOpen = ref(false);
const selectedField = ref(null);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

const handleEditField = (field) => {
  selectedField.value = field;
  editModalOpen.value = true;
};

const handleDeleteField = (field) => {
  selectedField.value = field;
  deleteModalOpen.value = true;
};

const selectedYardId = useState("selectedYard");
const horses = useState("horses");
const fields = useState("fields", () => [
  {
    id: 0,
    name: "Unsorted",
    horses: [],
  },
]);

const getFields = async () => {
  const { data, error } = await client
    .from("fields")
    .select("*")
    .eq("yard_id", selectedYardId.value)
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  fields.value.push(...data);

  fields.value.map((field) => {
    if (field.id === 0) {
      let fieldHorses = horses.value.filter((horse) => horse.field_id === null);

      field.horses = fieldHorses;
    } else {
      let fieldHorses = horses.value.filter(
        (horse) => horse.field_id === field.id
      );

      field.horses = fieldHorses;
    }
  });
};

onMounted(async () => {
  if (fields.value.length < 2) {
    await getFields();
  }
});

const handleFieldChange = async (e) => {
  const horseId = e.item.id;
  const fieldId = e.to.id;

  // update horse field_id
  const { error } = await client
    .from("horses")
    .update({ field_id: fieldId == 0 ? null : fieldId })
    .eq("id", horseId);

  if (error) {
    console.log(error);
    return;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="md:flex md:items-center md:justify-between p-12 pb-0">
      <div class="min-w-0 flex-1">
        <h2
          class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
        >
          Field Groups
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <!-- <button
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Edit
        </button> -->
        <button
          @click="createModalOpen = true"
          type="button"
          class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add a field
        </button>
      </div>
    </div>
    <div class="flex flex-1 overflow-x-scroll p-12">
      <div
        v-for="field in fields"
        :key="field.id"
        class="bg-gray-100 rounded-lg px-3 py-3 column-width mr-4 overflow-y-auto flex flex-col"
      >
        <div class="flex items-center">
          <div class="flex-1">
            <p
              class="text-gray-700 font-semibold font-sans tracking-wide text-sm"
            >
              {{ field.name }}
            </p>
          </div>

          <Menu
            v-if="field.id != 0"
            as="div"
            class="relative inline-block text-left"
          >
            <div>
              <MenuButton
                class="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                <span class="sr-only">Open options</span>
                <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
              </MenuButton>
            </div>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="handleEditField(field)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm',
                      ]"
                      >Edit</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      @click="handleDeleteField(field)"
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm',
                      ]"
                      >Delete</a
                    >
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>
        <div class="flex-1">
          <!-- Draggable component comes from vuedraggable. It provides drag & drop functionality -->
          <draggable
            :id="field.id"
            class="h-full"
            item-key="id"
            v-model="field.horses"
            :animation="200"
            ghost-class="ghost-card"
            group="horses"
            @end="handleFieldChange"
          >
            <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
            <template #item="{ element }">
              <HorseFieldCard
                :id="element.id"
                :key="element.id"
                :horse="element"
                class="mt-3 cursor-move"
              ></HorseFieldCard
            ></template>

            <!-- </transition-group> -->
          </draggable>
        </div>
      </div>
    </div>
  </div>

  <CreateFieldModal
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <EditFieldModal
    :is-open="editModalOpen"
    :field="selectedField"
    @close="editModalOpen = false"
  />
  <DeleteFieldModal
    :is-open="deleteModalOpen"
    :field="selectedField"
    @close="deleteModalOpen = false"
  />
</template>

<style scoped>
.column-width {
  min-width: 320px;
  width: 320px;
}
/* Unfortunately @apply cannot be setup in codesandbox, 
but you'd use "@apply border opacity-50 border-blue-500 bg-gray-200" here */
.ghost-card {
  opacity: 0.5;
  background: #f7fafc;
  border: 1px solid #4299e1;
}
</style>
