<script setup>
definePageMeta({
  middleware: ["require-auth"],
});

const deleteUserAccountModalOpen = ref(false);

const client = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const profile = useState("profile");

const firstName = ref(null);
const lastName = ref(null);
const serviceRequestEmails = ref(true);
const serviceRequestReponseEmails = ref(true);
const calendarEventReminderEmails = ref(true);

const resetForm = () => {
  firstName.value = profile.value?.first_name;
  lastName.value = profile.value?.last_name;

  serviceRequestEmails.value = profile.value?.service_request_emails;
  serviceRequestReponseEmails.value =
    profile.value?.service_request_response_emails;
  calendarEventReminderEmails.value =
    profile.value?.calendar_event_reminder_emails;
};

onMounted(async () => {
  resetForm();
});

// save changes
const saveChanges = async () => {
  const { error } = await client
    .from("profiles")
    .update({
      first_name: firstName.value,
      last_name: lastName.value,
      service_request_emails: serviceRequestEmails.value,
      service_request_response_emails: serviceRequestReponseEmails.value,
      calendar_event_reminder_emails: calendarEventReminderEmails.value,
    })
    .eq("id", profile.value?.id);

  // error
  if (error) {
    console.log(error);

    toast.add({
      title: "Error Saving Changes!",
      description: "Please try again, or contact support.",
    });

    return;
  }

  // susccess
  profile.value.first_name = firstName.value;
  profile.value.last_name = lastName.value;
  profile.value.service_request_emails = serviceRequestEmails.value;
  profile.value.service_request_response_emails =
    serviceRequestReponseEmails.value;
  profile.value.calendar_event_reminder_emails =
    calendarEventReminderEmails.value;

  toast.add({
    title: "Changes Saved!",
    description: "Your account has been updated.",
  });
};

const handleDelete = async () => {
  try {
    if (user.value) {
      // update profile
      const { error: updateProfileError } = await client
        .from("profiles")
        .update({
          first_name: "deleted",
          last_name: "user",
          avatar_url: null,
          selected_yard: null,
          active_role: null,
          email: null,
        })
        .eq("id", user.value.id);

      if (updateProfileError) {
        throw new Error(updateProfileError.message);
      }

      // TODO TEMP: for each horse that the user has created, delete the avatar if they have one
      const { data: usersHorses, error: usersHorsesError } = await client
        .from("horses")
        .select("avatar_url")
        .eq("created_by", user.value.id);

      if (usersHorsesError) {
        throw new Error(usersHorsesError.message);
      }

      for (let index = 0; index < usersHorses.length; index++) {
        const horse = usersHorses[index];

        if (horse.avatar_url) {
          // remove avatar link from row in db
          const { error: removeAvatarUrlError } = await client
            .from("horses")
            .update({ avatar_url: null })
            .eq("avatar_url", horse.avatar_url);

          if (removeAvatarUrlError) {
            throw new Error(removeAvatarUrlError.message);
          }

          // Delete image from storage bucket
          // TODO: this could be done in a batch (single request)
          const { error: deleteHorseAvatarError } = await client.storage
            .from("horse-avatars")
            .remove([horse.avatar_url]);

          if (deleteHorseAvatarError) {
            throw new Error(deleteHorseAvatarError.message);
          }
        }
      }

      // TODO: in future - do a proper cleanup of the user's data

      // remove auth account
      const { result } = await $fetch("/api/deleteUserAccount", {
        method: "post",
        body: { userId: user.value.id },
      });

      if (result === "success") {
        await client.auth.signOut();
        await navigateTo("/");
      } else {
        throw new Error("Error deleting user account");
      }
    }
  } catch (err) {
    console.log("error", err.message);
  }
};
</script>

<template>
  <div class="md:h-screen md:overflow-y-auto">
    <div class="mx-auto my-4 max-w-7xl px-4 sm:px-6 md:my-20 lg:px-8">
      <div class="border-b pb-4 pt-5">
        <p class="text-4xl font-bold">Account Settings</p>
      </div>
      <form
        @submit.prevent="saveChanges"
        class="divide-y divide-gray-200 lg:col-span-9"
      >
        <!-- Profile section -->
        <div class="py-6 sm:py-6 lg:pb-8">
          <div>
            <h2 class="text-lg font-medium leading-6 text-gray-900">Profile</h2>
            <p class="mt-1 text-sm text-gray-500">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <!-- <div class="mt-6 flex flex-col lg:flex-row">
                      <div class="flex-grow space-y-6">
                        <div>
                          <label
                            for="username"
                            class="block text-sm font-medium leading-6 text-gray-900"
                            >Username</label
                          >
                          <div class="mt-2 flex rounded-md shadow-sm">
                            <span
                              class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm"
                              >workcation.com/</span
                            >
                            <input
                              type="text"
                              name="username"
                              id="username"
                              autocomplete="username"
                              class="block w-full min-w-0 flex-grow rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
                              :value="user.handle"
                            />
                          </div>
                        </div>
          
                        <div>
                          <label
                            for="about"
                            class="block text-sm font-medium leading-6 text-gray-900"
                            >About</label
                          >
                          <div class="mt-2">
                            <textarea
                              id="about"
                              name="about"
                              rows="3"
                              class="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:py-1.5 sm:text-sm sm:leading-6"
                            />
                          </div>
                          <p class="mt-2 text-sm text-gray-500">
                            Brief description for your profile. URLs are hyperlinked.
                          </p>
                        </div>
                      </div>
          
                      <div
                        class="mt-6 flex-grow lg:mt-0 lg:ml-6 lg:flex-shrink-0 lg:flex-grow-0"
                      >
                        <p
                          class="text-sm font-medium leading-6 text-gray-900"
                          aria-hidden="true"
                        >
                          Photo
                        </p>
                        <div class="mt-2 lg:hidden">
                          <div class="flex items-center">
                            <div
                              class="inline-block h-12 w-12 flex-shrink-0 overflow-hidden rounded-full"
                              aria-hidden="true"
                            >
                              <img
                                class="h-full w-full rounded-full"
                                :src="user.imageUrl"
                                alt=""
                              />
                            </div>
                            <div class="relative ml-5">
                              <input
                                id="mobile-user-photo"
                                name="user-photo"
                                type="file"
                                class="peer absolute h-full w-full rounded-md opacity-0"
                              />
                              <label
                                for="mobile-user-photo"
                                class="pointer-events-none block rounded-md py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 peer-hover:ring-gray-400 peer-focus:ring-2 peer-focus:ring-sky-500"
                              >
                                <span>Change</span>
                                <span class="sr-only"> user photo</span>
                              </label>
                            </div>
                          </div>
                        </div>
          
                        <div
                          class="relative hidden overflow-hidden rounded-full lg:block"
                        >
                          <img
                            class="relative h-40 w-40 rounded-full"
                            :src="user.imageUrl"
                            alt=""
                          />
                          <label
                            for="desktop-user-photo"
                            class="absolute inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100"
                          >
                            <span>Change</span>
                            <span class="sr-only"> user photo</span>
                            <input
                              type="file"
                              id="desktop-user-photo"
                              name="user-photo"
                              class="absolute inset-0 h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0"
                            />
                          </label>
                        </div>
                      </div>
                    </div> -->

          <div class="mt-6 grid grid-cols-12 gap-6">
            <div class="col-span-12 sm:col-span-6">
              <label
                for="first-name"
                class="block text-sm font-medium leading-6 text-gray-900"
                >First name</label
              >
              <input
                v-model="firstName"
                type="text"
                name="first-name"
                id="first-name"
                autocomplete="off"
                required
                class="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              />
            </div>

            <div class="col-span-12 sm:col-span-6">
              <label
                for="last-name"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Last name</label
              >
              <input
                v-model="lastName"
                type="text"
                name="last-name"
                id="last-name"
                autocomplete="off"
                required
                class="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <!-- Privacy section -->
        <div class="divide-y divide-gray-200 pt-6">
          <div>
            <div>
              <h2 class="text-lg font-medium leading-6 text-gray-900">
                Notification Preferences
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                Control which types of notifications you receive via email.
              </p>
            </div>
            <ul role="list" class="mt-2 divide-y divide-gray-200">
              <li class="flex items-center justify-between py-4">
                <div class="flex flex-col">
                  <p
                    class="text-sm font-medium leading-6 text-gray-900"
                    passive
                  >
                    Service Request Emails
                  </p>
                  <div class="text-sm text-gray-500">
                    The yard owner will receive these emails when a client
                    requests a service for their horse.
                  </div>
                </div>
                <UToggle v-model="serviceRequestEmails" size="lg" />
              </li>
              <li class="flex items-center justify-between py-4">
                <div class="flex flex-col">
                  <p
                    class="text-sm font-medium leading-6 text-gray-900"
                    passive
                  >
                    Service Request Reponse Emails
                  </p>
                  <div class="text-sm text-gray-500">
                    You'll receive these emails to let you know when your yard
                    owner has responded to your service requests.
                  </div>
                </div>
                <UToggle v-model="serviceRequestReponseEmails" size="lg" />
              </li>
              <li class="flex items-center justify-between py-4">
                <div class="flex flex-col">
                  <p
                    class="text-sm font-medium leading-6 text-gray-900"
                    passive
                  >
                    Calendar Event Reminder Emails
                  </p>
                  <div class="text-sm text-gray-500">
                    You'll receive these emails the day before any of your
                    upcoming events are scheduled to take place.
                  </div>
                </div>
                <UToggle v-model="calendarEventReminderEmails" size="lg" />
              </li>
            </ul>
          </div>
          <div class="mt-4 flex justify-end gap-x-3 py-4">
            <button
              @click="resetForm"
              type="button"
              class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </form>
      <div class="mt-20 border-2 sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Delete your account
          </h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Once you delete your account, you will lose all data associated
              with it.
            </p>
          </div>
          <div class="mt-5">
            <button
              @click="() => (deleteUserAccountModalOpen = true)"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete User Account Confirmation Modal -->
  <Modal v-model="deleteUserAccountModalOpen">
    <ModalHeaderLayout
      title="Delete User Account"
      @close="deleteUserAccountModalOpen = false"
    >
      <FormsConfirmationForm
        icon="heroicons:exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete your account? All of your data will be
            permanently removed. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
