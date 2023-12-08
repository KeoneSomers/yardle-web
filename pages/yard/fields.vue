<script setup>
import draggable from "vuedraggable";
import EditFieldRotationModal from "@/components/modals/EditFieldRotationModal.vue";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";

definePageMeta({
  middleware: ["require-auth", "require-yard"],
});

const client = useSupabaseClient();
const selectedField = ref(null);
const selectedRotation = useState("selectedRotation", () => null);
const selectedYard = useSelectedYardId();
const field_rotations = useState("field_rotations", () => []);
const toast = useToast();

// (field modals)
const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

// (field rotation modals)
const createModalOpen2 = ref(false);
const editModalOpen2 = ref(false);
const deleteModalOpen2 = ref(false);

const fetchFieldRotations = async () => {
  const { data, error } = await client
    .from("field_rotations")
    .select()
    .eq("yard_id", selectedYard.value)
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  if (data) {
    field_rotations.value = [];
    data.forEach((item) => {
      field_rotations.value.push(item);
    });

    selectedRotation.value = field_rotations.value[0];
  }
};

await fetchFieldRotations();

const selectedYardId = useSelectedYardId();
const horses = ref([]);

const getHorsesSlim = async () => {
  await useAsyncData("horses", async () => {
    const { data } = await client
      .from("horses")
      .select("id, name, avatar_url, avatar_background")
      .eq("yard_id", selectedYardId.value)
      .order("name", { ascending: true });

    horses.value = data;
  });
};

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
};

await getHorsesSlim();

const mapHorses = async () => {
  fields.value.forEach((field) => {
    field.horses = [];
  });

  const { data: data3, error: error3 } = await client
    .from("field_rotation_horses")
    .select("*")
    .eq("rotation_id", selectedRotation.value.id);

  horses.value.map(async (horse) => {
    // if the horse id is present in the field_rotation_horses table
    if (data3.find((item) => item.horse_id === horse.id)) {
      // find the field
      let field = fields.value.find(
        (field) =>
          field.id === data3.find((item) => item.horse_id === horse.id).field_id
      );

      // if the field exists, add the horse to it
      if (field) {
        field.horses.push(horse);
      } else {
        // else add it to the unsorted field
        fields.value[0].horses.push(horse);
      }
    } else {
      // else add it to the unsorted field
      fields.value[0].horses.push(horse);
    }
  });
};

onMounted(async () => {
  // TODO: this is quite in efficient to do every time from scratch
  fields.value = [
    {
      id: 0,
      name: "Unsorted",
      horses: [],
    },
  ];

  await getFields();
  await mapHorses();
});

// when the user changes rotation, re-map the horses to the fields
// watch works directly on a ref
watch(selectedRotation, async (newQuestion, oldQuestion) => {
  if (newQuestion !== oldQuestion) {
    await mapHorses();
  }
});

const handleFieldChange = async (e) => {
  const horseId = e.item.id;
  const fieldId = e.to.id;

  const { error } = await client.from("field_rotation_horses").upsert({
    field_id: fieldId == 0 ? null : fieldId,
    horse_id: horseId,
    rotation_id: selectedRotation.value.id,
  });

  if (error) {
    console.log(error);
    return;
  }
};

const handleDelete = async () => {
  // capture the horses of this field so i can move them to another field after deletion
  const horses = selectedField.value.horses;

  // remove joins for this field in the horse/rotation/field join table
  const { error: unlinkError } = await client
    .from("field_rotation_horses")
    .delete()
    .eq("field_id", selectedField.value.id);

  if (unlinkError) {
    console.log(unlinkError);
    return;
  }

  // Delete the field
  const { error } = await client
    .from("fields")
    .delete()
    .eq("id", selectedField.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // now remove the deleted feed from the webpage
  const index = fields.value.map((e) => e.id).indexOf(selectedField.value.id);
  fields.value.splice(index, 1);

  // now move the horses to another field
  horses.forEach(async (horse) => {
    fields.value[0].horses.push(horse);
  });

  // close the modal
  deleteModalOpen.value = false;
};

const handleDeleteFieldRotation = async () => {
  const index = field_rotations.value
    .map((e) => e.id)
    .indexOf(selectedRotation.value.id);

  if (field_rotations.value.length < 2) {
    // errors.value.push("You must have at least one field rotation.");

    toast.add({
      title: "Unable To Delete!",
      description: "You must have at least one field rotation.",
    });

    return;
  }

  // remove joins for this rotation in the join table
  const { error: unlinkError } = await client
    .from("field_rotation_horses")
    .delete()
    .eq("rotation_id", selectedRotation.value.id);

  if (unlinkError) {
    console.log(unlinkError);
    return;
  }

  // Delete the field rotation
  const { error } = await client
    .from("field_rotations")
    .delete()
    .eq("id", selectedRotation.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // now remove the deleted field_rotation from the webpage
  field_rotations.value.splice(index, 1);

  // set users selected rotation back to the first one
  selectedRotation.value = field_rotations.value[0];

  toast.add({
    title: "Field Rotation Deleted!",
    description: "Your field rotation has been deleted.",
  });

  // close the modal
  deleteModalOpen2.value = false;
};
</script>

<template>
  <div class="flex flex-col">
    <PageHeading title="Field Groups"></PageHeading>
    <div
      class="flex w-screen flex-1 flex-col md:overflow-y-auto lg:w-[calc(100vw-16rem)]"
    >
      <div class="mb-4 overflow-x-scroll border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="field_rotations">
          <div class="py-2">
            <div class="border-r pr-2">
              <UTooltip text="Add a field rotation">
                <div
                  @click="createModalOpen2 = true"
                  class="flex cursor-pointer items-center whitespace-nowrap rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-indigo-200 hover:text-gray-700"
                >
                  <icon name="heroicons:plus-solid" class="h-5 w-5" />
                </div>
              </UTooltip>
            </div>
          </div>

          <div
            v-for="rotation in field_rotations"
            :key="rotation.name"
            @click="selectedRotation = rotation"
            :class="[
              rotation === selectedRotation
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'flex cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
            ]"
            :aria-current="rotation.is_current ? 'page' : undefined"
          >
            {{ rotation.name }}
          </div>
        </nav>
      </div>
      <div class="flex justify-end px-4 pb-0 md:pb-2">
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium shadow"
            >
              Rotation Options
              <icon
                name="heroicons:chevron-down-solid"
                class="-mr-1 ml-2 h-5 w-5"
                aria-hidden="true"
              />
            </MenuButton>
          </div>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <a
                    @click="editModalOpen2 = true"
                    :class="[
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    ]"
                    >Edit</a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    @click="deleteModalOpen2 = true"
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
        <button
          @click="createModalOpen = true"
          type="button"
          class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add field
        </button>
        <!-- <Menu as="div" class="text-left">
                <div>
                  <MenuButton
                    class="flex ml-2 items-center rounded-full text-gray-300 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
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
                    class="relative right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <a
                          @click="
                            selectedRotation = rotation;
                            editModalOpen2 = true;
                          "
                          :class="[
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          ]"
                          >Edit</a
                        >
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <a
                          @click="
                            selectedRotation = rotation;
                            deleteModalOpen2 = true;
                          "
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
              </Menu> -->
      </div>
      <div class="flex flex-1 overflow-x-scroll p-4 pt-2">
        <div
          v-for="field in fields"
          :key="field.id"
          class="mr-4 flex w-80 min-w-max flex-col overflow-y-auto rounded-lg bg-gray-100 px-3 py-3"
        >
          <div class="flex w-48 items-center md:w-80">
            <div class="flex-1">
              <p
                class="font-sans text-sm font-semibold tracking-wide text-gray-700"
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
                  <icon
                    name="heroicons:ellipsis-vertical-solid"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
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
                        @click="
                          selectedField = field;
                          editModalOpen = true;
                        "
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'block px-4 py-2 text-sm',
                        ]"
                        >Edit</a
                      >
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a
                        @click="
                          selectedField = field;
                          deleteModalOpen = true;
                        "
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
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
                ></HorseFieldCard>
              </template>

              <!-- </transition-group> -->
            </draggable>
          </div>
        </div>
        <div
          @click="createModalOpen = true"
          class="flex w-80 items-center justify-center rounded-lg border-4 border-dashed border-gray-100 text-gray-100 hover:cursor-pointer hover:bg-gray-50 hover:text-white"
        >
          <icon name="heroicons:plus-solid" class="h-24 w-24" />
        </div>
      </div>
    </div>
  </div>

  <!-- Create Field Modal -->
  <Modal v-model="createModalOpen">
    <ModalHeaderLayout title="Create a Field" @close="createModalOpen = false">
      <FormsCreateFieldForm @onSuccess="createModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Edit Field Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Field" @close="editModalOpen = false">
      <FormsEditFieldForm
        :field="selectedField"
        @onSuccess="editModalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Field Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout title="Delete Field" @close="deleteModalOpen = false">
      <FormsConfirmationForm
        icon="heroicons:exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this field? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Create Field Rotation Modal -->
  <Modal v-model="createModalOpen2">
    <ModalHeaderLayout
      title="Create a Field Rotation"
      @close="createModalOpen2 = false"
    >
      <FormsCreateFieldRotationForm @onSuccess="createModalOpen2 = false" />
    </ModalHeaderLayout>
  </Modal>

  <EditFieldRotationModal
    v-if="editModalOpen2"
    :is-open="editModalOpen2"
    :field="selectedRotation"
    @close="editModalOpen2 = false"
  />

  <!-- Delete Field Rotation Confirmation Modal -->
  <Modal v-model="deleteModalOpen2">
    <ModalHeaderLayout
      title="Delete Field Rotation"
      @close="deleteModalOpen2 = false"
    >
      <FormsConfirmationForm
        icon="heroicons:exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this field rotation? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDeleteFieldRotation()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>

<style scoped>
.ghost-card {
  opacity: 0.5;
  background: #f7fafc;
  border: 1px solid #4299e1;
}
</style>
