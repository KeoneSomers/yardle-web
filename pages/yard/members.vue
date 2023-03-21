<script setup>
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import RemoveMemberModal from "@/components/modals/RemoveMemberModal.vue";
import InviteLinkModal from "@/components/modals/InviteLinkModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const roles = [
  {
    id: 1,
    name: "Yard Owner",
    description:
      "The owner of the yard can preform all actions within this yard",
  },
  {
    id: 2,
    name: "Yard Admin",
    description:
      "Admins can do everything an owner can do except delete the yard and demote the yard owner.",
  },
  {
    id: 3,
    name: "Yard Member",
    description:
      "Members can only view the yards information (excluding billing infomation), Owners and Admins may set members as horse owners - which allows them to preform actions on that horse as well as view the horses billing information.",
  },
];

const client = useSupabaseClient();

// since I just need the uid I can use this even though it's not in state
const user = useSupabaseUser();
const yard = useState("yard");
const members = useState("members");
const profile = useState("profile");
const selectedYard = useState("selectedYard");

const inviteLinkModalOpen = ref(false);
const removeMemberModalOpen = ref(false);
const memberToRemove = ref(0);
const alerts = useAlerts();

const handleRemoveMember = (memberId) => {
  memberToRemove.value = memberId;
  removeMemberModalOpen.value = true;
};

// correct way to get joined data
await useAsyncData("members", async () => {
  const { data, error } = await client
    .from("profiles_yards")
    .select("profile:profiles(*), role")
    .eq("yard_id", selectedYard.value)
    .neq("profile_id", "ddc8533d-0773-4211-adaf-74db9b448a02") // shaddow user// TODO: check if profile is super admin - not just look at hardcoded id
    .order("role", { ascending: true });

  members.value = data;
});

const handleRoleChange = async (memberId, roleId) => {
  // TODO: if roleId == 1 then also need to set old owner as admin
  const { error } = await client
    .from("profiles_yards")
    .update({ role: roleId })
    .eq("profile_id", memberId)
    .eq("yard_id", yard.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // check if the member currently has this yard selected and then update their profiles/active_role if so
  const { data } = await client
    .from("profiles")
    .select("selected_yard")
    .eq("id", memberId)
    .single();
  console.log(data.selected_yard);
  if (data.selected_yard) {
    if (data.selected_yard == yard.value.id) {
      await client
        .from("profiles")
        .update({ active_role: roleId })
        .eq("id", memberId);
    }
  }

  // now update local members role
  const index = members.value.map((e) => e.profile.id).indexOf(memberId);
  members.value[index].role = roleId;

  alerts.value.unshift({
    title: "Updated Role!",
    message: `${members.value[index].profile.first_name} ${
      members.value[index].profile.last_name
    } is now a ${roles.find((role) => role.id == roleId).name}`,
    type: "success",
  });
};
</script>

<template>
  <div>
    <div class="flex flex-col py-4 px-4 md:flex-row md:items-center lg:h-16">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Members</h1>
        <p class="text-xs text-gray-700">
          A list of all the members that are currently in this yard including
          their name and role.
        </p>
      </div>
      <div class="pt-4 md:pt-0">
        <button
          @click="() => (inviteLinkModalOpen = true)"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Invite member
        </button>
      </div>
    </div>
    <div>
      <div>
        <div class="inline-block min-w-full align-middle">
          <div class="ring-1 ring-black ring-opacity-5">
            <table class="w-full border-b">
              <thead>
                <tr class="border-b">
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                  ></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="(member, index) in members"
                  :key="member.profile.id"
                  :class="index % 2 === 0 ? 'bg-gray-50' : undefined"
                >
                  <td
                    class="flex items-center break-all py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6"
                  >
                    <div
                      v-if="member.profile.avatar_url"
                      class="mr-3 h-9 w-9 overflow-hidden rounded-full"
                    >
                      <SupabaseImage
                        id="avatars"
                        :path="member.profile.avatar_url"
                      />
                    </div>
                    <div
                      v-else
                      class="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm tracking-tight text-white"
                    >
                      {{ member.profile.first_name[0].toUpperCase() }}
                      {{
                        member.profile.last_name &&
                        member.profile.last_name[0].toUpperCase()
                      }}
                    </div>
                    <span class="truncate"
                      >{{ member.profile.first_name }}
                      {{ member.profile.last_name }}
                      <span v-if="user.id == member.profile.id" class="ml-2">
                        (You)</span
                      ></span
                    >
                  </td>
                  <td class="py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6">
                    <div class="flex items-center justify-end">
                      <!-- Only show this button if user is admin or owner and member.role is > role -->
                      <div
                        v-if="
                          profile &&
                          profile.active_role < 3 &&
                          member.role > profile.active_role
                        "
                      >
                        <button
                          @click="handleRemoveMember(member.profile.id)"
                          class="mr-3 inline-flex items-center rounded-md bg-red-500 p-2 px-3 font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                        >
                          <p class="text-sm font-medium">Remove</p>
                        </button>
                      </div>
                      <Listbox as="div" v-model="member.role">
                        <ListboxLabel class="sr-only">
                          Change members role
                        </ListboxLabel>
                        <div class="relative">
                          <div
                            class="inline-flex divide-x rounded-md shadow-sm"
                          >
                            <div
                              class="inline-flex divide-x rounded-md shadow-sm"
                            >
                              <div
                                class="inline-flex items-center rounded-l-md border border-transparent py-2 pl-3 pr-4 shadow-sm"
                              >
                                <p class="text-sm font-medium">
                                  {{ roles[member.role - 1].name }}
                                </p>
                              </div>
                              <ListboxButton
                                class="inline-flex items-center rounded-l-none rounded-r-md p-2 text-sm font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                              >
                                <span class="sr-only"
                                  >Change published status</span
                                >
                                <icon
                                  name="heroicons:chevron-down-solid"
                                  class="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </ListboxButton>
                            </div>
                          </div>

                          <transition
                            leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                          >
                            <ListboxOptions
                              class="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <ListboxOption
                                @click="
                                  handleRoleChange(
                                    member.profile.id,
                                    roleOption.id
                                  )
                                "
                                as="template"
                                v-for="roleOption in roles"
                                :key="roleOption.id"
                                :value="roleOption.id"
                              >
                                <li
                                  :class="[
                                    // default styles
                                    'cursor-pointer p-4 text-sm hover:bg-gray-50',
                                    {
                                      // Highlight currenly set role
                                      'pointer-events-none bg-indigo-500 text-white':
                                        member.role == roleOption.id,
                                    },
                                    {
                                      // Can't change someones role if you're not owner or admin
                                      'pointer-events-none opacity-20':
                                        profile.active_role > 2,
                                    },
                                    {
                                      // Can't promote a member to owner
                                      // TODO: remove this so that owner can be transfered
                                      'pointer-events-none opacity-20':
                                        roleOption.id == 1,
                                    },
                                    {
                                      // Can't change owners role!
                                      'pointer-events-none opacity-20':
                                        member.role == 1,
                                    },
                                  ]"
                                >
                                  <div class="flex flex-col">
                                    <div class="flex justify-between">
                                      <p
                                        :class="
                                          member.role == roleOption.id
                                            ? 'font-semibold'
                                            : 'font-normal'
                                        "
                                      >
                                        {{ roleOption.name }}
                                      </p>
                                      <span
                                        v-if="member.role == roleOption.id"
                                        :class="
                                          member.role == roleOption.id
                                            ? 'text-white'
                                            : 'text-indigo-500'
                                        "
                                      >
                                        <icon
                                          name="heroicons:check-solid"
                                          class="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </div>
                                    <p
                                      :class="[
                                        member.role == roleOption.id
                                          ? 'text-indigo-200'
                                          : 'text-gray-500',
                                        'mt-2',
                                      ]"
                                    >
                                      {{ roleOption.description }}
                                    </p>
                                  </div>
                                </li>
                              </ListboxOption>
                            </ListboxOptions>
                          </transition>
                        </div>
                      </Listbox>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <RemoveMemberModal
    :is-open="removeMemberModalOpen"
    :member-id="memberToRemove"
    @close="removeMemberModalOpen = false"
  />
  <InviteLinkModal
    :is-open="inviteLinkModalOpen"
    @close="inviteLinkModalOpen = false"
  />
</template>
