<script setup>
import { DateTime } from "luxon";

definePageMeta({
  middleware: ["require-auth", "require-yard"],
});

const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useSelectedYardId();
const yard = useState("yard");
const profile = useState("profile");
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const selectedAnnouncement = ref(null);

const announcements = useState("announcements", () => []);
const formState = ref({
  announcement: "",
});

const dropdownItems = (row) => [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square",
      click: () => {
        selectedAnnouncement.value = row;
        editModalOpen.value = true;
      },
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click: () => {
        selectedAnnouncement.value = row;
        deleteModalOpen.value = true;
      },
    },
  ],
];

const formatDate = (dateString) => {
  return DateTime.fromISO(dateString).toFormat("ccc dd LLL yyyy");
};

const getAnnouncements = async () => {
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .eq("yard_id", selectedYard.value)
    .order("created_at", { ascending: false });

  if (!error) {
    announcements.value = data;
  } else {
    console.log(error);
  }
};

if (selectedYard.value) {
  getAnnouncements();
}

const handleSubmit = async () => {
  console.log("submit");

  // check if yard owner

  const { data, error } = await supabaseClient
    .from("announcements")
    .insert([
      {
        body: formState.value.announcement,
        yard_id: selectedYard.value,
      },
    ])
    .select()
    .single();

  if (!error) {
    formState.value.announcement = "";
    console.log(data);
    announcements.value.unshift(data);
  } else {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  console.log("delete");
  console.log(id);

  const { error } = await supabaseClient
    .from("announcements")
    .delete()
    .eq("id", id);

  if (!error) {
    announcements.value = announcements.value.filter((a) => a.id !== id);
    deleteModalOpen.value = false;
    selectedAnnouncement.value = null;
  } else {
    console.log(error);
  }
};
</script>

<template>
  <div v-if="yard && selectedYard" class="px-8 mt-6 w-full">
    <div>
      <h1 class="text-xl">Welcome to {{ yard.name }}</h1>
      <small class="text-gray-500">{{ formatDate(DateTime.now()) }}</small>

      <QuickLinks class="mt-6" />

      <div class="shadow-lg border dark:border-gray-700 my-6 rounded-lg">
        <div
          v-if="profile && profile.active_role == 1"
          class="p-4 bg-primary-50 dark:bg-primary-950"
        >
          <div class="flex justify-center-center">
            <UIcon
              name="heroicons-megaphone"
              class="h-6 w-6 mr-2 text-primary-500"
            />
            <h1 class="mb-6">Announcements</h1>
          </div>

          <UForm @submit="handleSubmit" :state="formState" class="mb-6">
            <UFormGroup
              help="Only you, the yard owner can see this form and create announcements."
            >
              <UTextarea
                v-model="formState.announcement"
                placeholder="Add an announcement"
                class="w-full"
              />
            </UFormGroup>

            <div class="flex justify-end pt-2">
              <UButton type="submit">Post</UButton>
            </div>
          </UForm>
        </div>
        <div v-else class="p-4 bg-primary-50">
          <div class="flex justify-center-center">
            <UIcon
              name="heroicons-megaphone"
              class="h-6 w-6 mr-2 text-primary-500"
            />
            <h1>Announcements</h1>
          </div>
        </div>

        <div v-if="announcements.length < 1" class="p-6">
          No announcements, You're all caught up!
        </div>
        <div
          v-else
          v-for="announcement in announcements"
          :key="announcement.id"
          class="w-full border-t dark:border-t-gray-700 p-6 flex"
        >
          <div class="flex-1">
            <small class="text-primary-500">{{
              formatDate(announcement.created_at)
            }}</small>
            <p class="whitespace-pre-wrap">{{ announcement.body }}</p>
          </div>
          <div v-if="profile.active_role == 1">
            <UDropdown :items="dropdownItems(announcement)">
              <UIcon name="i-heroicons-ellipsis-vertical" />
            </UDropdown>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Horse Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Announcement" @close="editModalOpen = false">
      <FormsEditAnnouncementForm
        :announcement="selectedAnnouncement"
        @onSuccess="
          editModalOpen = false;
          selectedAnnouncement = null;
        "
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Rug Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout
      title="Delete Announcement"
      @close="deleteModalOpen = false"
    >
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this announcement? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete(selectedAnnouncement.id)"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
