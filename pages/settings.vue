<script setup>
import DeleteUserAccountModal from "@/components/modals/DeleteUserAccountModal.vue";

definePageMeta({
  guards: ["requireAuth"],
});

const deleteUserAccountModalOpen = ref(false);
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col space-y-10">
        <div class="pt-5">
          <p class="text-4xl font-bold mt-20">Account Settings Page</p>
        </div>
        <!-- 
                <div class="bg-gray-50 rounded-xl p-5">
                    <p class="text-xl font-bold">Profile Picture</p>
                </div> -->

        <!-- <div class="bg-gray-50 rounded-xl p-5">
                    <p class="text-xl font-bold">Change Password</p>
                </div> -->

        <!-- <div class="bg-gray-50 rounded-xl p-5">
                    <p class="text-xl font-bold">Edit Account Details</p>
                    <form>
                        <div>
                            <label
                                for="email"
                                class="block text-sm font-medium text-gray-700 mt-5"
                                >Email</label
                            >
                            <div class="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                for="email"
                                class="block text-sm font-medium text-gray-700 mt-3"
                                >Password</label
                            >
                            <div class="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <button type="submit" class="mt-5">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div> -->

        <div class="border-2 sm:rounded-lg">
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
  </div>

  <!-- Modals -->
  <DeleteUserAccountModal
    :is-open="deleteUserAccountModalOpen"
    @close="deleteUserAccountModalOpen = false"
  />
</template>
