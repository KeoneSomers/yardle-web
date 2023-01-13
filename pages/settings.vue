<script setup>
    definePageMeta({
        guards: ["requireAuth"],
    });
</script>

<template>
    <div>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="flex flex-col space-y-10">
                <div class="pt-5">
                    <p class="text-4xl font-bold">Account Settings Page</p>
                </div>

                <div class="bg-gray-50 rounded-xl p-5">
                    <p class="text-xl font-bold">Edit Account Details</p>
                    <form>
                        <input type="email" />
                        <input type="password" />
                        <input type="text" />
                        <button type="submit">Save Changes</button>
                    </form>
                </div>

                <div class="bg-red-100 rounded-xl p-5">
                    <p class="text-xl font-bold mb-5">Danger Zone</p>
                    <button
                        class="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
