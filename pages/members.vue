<script setup>
    const client = useSupabaseClient();

    // since I just need the uid I can use this even though it's not in state
    const user = useState("user");
    const yard = useState("yard");
    const members = useState("members");
    const role = useState("role");

    await useAsyncData("members", async () => {
        const { data, error } = await client
            .from("yards")
            .select("profiles!profiles_yards(*)")
            .eq("id", user.value.user_metadata.selected_yard)
            .single();

        members.value = data.profiles;
    });
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Members</h1>
                <p class="mt-2 text-sm text-gray-700">
                    A list of all the members that are currently in this yard
                    including their username, joined date and role.
                </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                    @click="() => (createModalOpen = true)"
                    type="button"
                    class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                    Invite member
                </button>
            </div>
        </div>
        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div
                    class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
                >
                    <div
                        class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
                    >
                        <table class="w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr class="divide-x divide-gray-200">
                                    <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Username
                                    </th>
                                    <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                                    ></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr
                                    v-for="member in members"
                                    :key="member.id"
                                    class="divide-x divide-gray-200"
                                >
                                    <td
                                        class="flex items-center py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6 break-all"
                                    >
                                        <div
                                            v-if="member.avatar_url"
                                            class="h-9 w-9 rounded-full overflow-hidden mr-3"
                                        >
                                            <SupabaseImage
                                                id="avatars"
                                                :path="member.avatar_url"
                                            />
                                        </div>
                                        <div
                                            v-else
                                            class="h-9 w-9 mr-3 bg-indigo-500 rounded-full flex items-center justify-center text-white"
                                        >
                                            {{
                                                member.username[0].toUpperCase()
                                            }}
                                        </div>

                                        {{ member.username }}
                                    </td>
                                    <td
                                        class="py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 break-all"
                                    >
                                        <button
                                            v-if="
                                                yard &&
                                                member.id != user.id &&
                                                member.id != yard.created_by
                                            "
                                            @click="handleDelete(feed.id)"
                                            class="bg-red-400 rounded px-3 py-1 text-white"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
