<script setup>
  import DeleteUserAccountModal from "@/components/modals/DeleteUserAccountModal.vue";

  definePageMeta({
    guards: ["requireAuth"],
  });

  const deleteUserAccountModalOpen = ref(false);
  const user = useSupabaseUser();
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col space-y-10">
        <div class="pt-5">
          <p class="text-4xl font-bold">Account Settings Page</p>
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

        <div class="bg-red-100 rounded-xl p-5">
          <p class="text-xl font-bold mb-5">Danger Zone</p>
          <button
            @click="() => (deleteUserAccountModalOpen = true)"
            class="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <DeleteUserAccountModal
    :is-open="deleteUserAccountModalOpen"
    :user-id="user.id"
    @close="deleteUserAccountModalOpen = false"
  />
</template>
