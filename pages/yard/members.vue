<script setup>
definePageMeta({
  layout: "yard",
  middleware: ["require-auth", "require-yard"],
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
const selectedYard = useSelectedYardId();

const inviteLinkModalOpen = ref(false);
const removeMemberModalOpen = ref(false);
const memberToRemove = ref(0);
const toast = useToast();

const computedMembers = computed(() => {
  return members.value.map((member) => {
    return { ...member.profile, role: member.role };
  });
});

watchEffect(() => {
  if (members.value) {
    console.log(computedMembers.value);
  }
});

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

  toast.add({
    title: "Updated Role!",
    description: `${members.value[index].profile.first_name} ${
      members.value[index].profile.last_name
    } is now a ${roles.find((role) => role.id == roleId).name}`,
  });
};

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "actions",
  },
];

const actionItems = (row) => [
  [
    {
      label: "Remove Member",
      icon: "i-heroicons-user-minus-20-solid",
      disabled:
        !profile.value ||
        (profile.value && profile.value.active_role !== 1) ||
        row.id === profile.value.id,
      click: () => handleRemoveMember(row.id),
    },
  ],
];

const handleDelete = async () => {
  await client
    .from("profiles")
    .update({ selected_yard: null, active_role: null })
    .eq("id", memberToRemove.value);

  const { error } = await client
    .from("profiles_yards")
    .delete()
    .eq("profile_id", memberToRemove.value)
    .eq("yard_id", yard.value.id);

  if (!error) {
    // success! - now remove the member from the webpage
    const index = members.value
      .map((e) => e.profile.id)
      .indexOf(memberToRemove.value);
    members.value.splice(index, 1);

    toast.add({
      title: "Member Removed!",
      description: "The member has been removed from this yard",
    });

    // close the modal
    removeMemberModalOpen.value = false;
  } else {
    console.log(error);

    toast.add({
      title: "Error Removing Member!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <div v-if="profile && profile.active_role" class="w-full">
    <PageHeading
      title="Members"
      description="A list of all the members that are currently in this yard including
          their name and role."
    >
      <button
        @click="() => (inviteLinkModalOpen = true)"
        type="button"
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
      >
        Invite member
      </button>
    </PageHeading>

    <UTable
      :columns="columns"
      :rows="computedMembers"
      class="m-4 overflow-hidden rounded border sm:m-6 md:m-8"
    >
      <template #name-data="{ row }">
        {{ row.first_name }} {{ row.last_name }}
      </template>
      <template #actions-data="{ row }">
        <div class="flex justify-end">
          <UDropdown :items="actionItems(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </div>
      </template>
    </UTable>
  </div>

  <!-- Remove Member Confimation Modal -->
  <Modal v-model="removeMemberModalOpen">
    <ModalHeaderLayout
      title="Remove Member"
      @close="removeMemberModalOpen = false"
    >
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to remove this member? All of their
                      data such as horses and calendar events will remain but
                      the user will no longer have access to this yard."
        buttonText="Confirm"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Invite Link Modal -->
  <Modal v-model="inviteLinkModalOpen">
    <ModalHeaderLayout
      title="Copy Invite Link"
      @close="inviteLinkModalOpen = false"
    >
      <FormsInviteLinkForm @close="inviteLinkModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>
</template>
