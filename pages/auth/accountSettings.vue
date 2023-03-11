<script setup>
import {
  Switch,
  SwitchDescription,
  SwitchGroup,
  SwitchLabel,
} from "@headlessui/vue";
import DeleteUserAccountModal from "@/components/modals/DeleteUserAccountModal.vue";

definePageMeta({
  guards: ["requireAuth"],
});

const deleteUserAccountModalOpen = ref(false);

const client = useSupabaseClient();
const alerts = useAlerts();
const profile = useState("profile");

const firstName = ref(null);
const lastName = ref(null);
const allowEmailNotfications = ref(true);

onMounted(async () => {
  firstName.value = profile.value?.first_name;
  lastName.value = profile.value?.last_name;
  allowEmailNotfications.value = profile.value?.allow_emails;
});

// save changes
const saveChanges = async () => {
  const { error } = await client
    .from("profiles")
    .update({
      first_name: firstName.value,
      last_name: lastName.value,
      allow_emails: allowEmailNotfications.value,
    })
    .eq("id", profile.value?.id);

  // error
  if (error) {
    console.log(error);

    alerts.value.unshift({
      title: "Error Saving Changes!",
      message: "Please try again, or contact support.",
      type: "error",
    });

    return;
  }

  // susccess
  profile.value.first_name = firstName.value;
  profile.value.last_name = lastName.value;

  alerts.value.unshift({
    title: "Changes Saved!",
    message: "Your account has been updated.",
    type: "success",
  });
};

const resetForm = () => {
  firstName.value = profile.value?.first_name;
  lastName.value = profile.value?.last_name;
  allowEmailNotfications.value = profile.value?.allow_emails;
};
</script>

<template>
  <div class="md:h-screen md:overflow-y-auto">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 my-10">
      <div class="pt-5 border-b pb-4">
        <p class="text-4xl font-bold mt-20">Account Settings</p>
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

            <!-- <div class="col-span-12">
              <label
                for="url"
                class="block text-sm font-medium leading-6 text-gray-900"
                >URL</label
              >
              <input
                type="text"
                name="url"
                id="url"
                class="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-0 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
              />
            </div>

            <div class="col-span-12 sm:col-span-6">
              <label
                for="company"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Company</label
              >
              <input
                type="text"
                name="company"
                id="company"
                autocomplete="organization"
                class="mt-2 block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-0 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
              />
            </div> -->
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
              <SwitchGroup
                as="li"
                class="flex items-center justify-between py-4"
              >
                <div class="flex flex-col">
                  <SwitchLabel
                    as="p"
                    class="text-sm font-medium leading-6 text-gray-900"
                    passive
                    >Allow all email notifications</SwitchLabel
                  >
                  <SwitchDescription class="text-sm text-gray-500"
                    >Enable or disable the sending of notification emails
                    regarding yards and horses.</SwitchDescription
                  >
                </div>
                <Switch
                  v-model="allowEmailNotfications"
                  :class="[
                    allowEmailNotfications ? 'bg-teal-500' : 'bg-gray-200',
                    'relative ml-4 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
                  ]"
                >
                  <span
                    aria-hidden="true"
                    :class="[
                      allowEmailNotfications
                        ? 'translate-x-5'
                        : 'translate-x-0',
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    ]"
                  />
                </Switch>
              </SwitchGroup>
            </ul>
          </div>
          <div class="mt-4 flex justify-end gap-x-3 py-4">
            <button
              @click="resetForm"
              type="button"
              class="inline-flex justify-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center rounded-md bg-indigo-500 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </form>
      <div class="border-2 sm:rounded-lg mt-20">
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

  <!-- Modals -->
  <DeleteUserAccountModal
    :is-open="deleteUserAccountModalOpen"
    @close="deleteUserAccountModalOpen = false"
  />
</template>
