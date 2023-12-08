<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yards = useState("yards");
const error = ref("");
const toast = useToast();

const formState = ref({
  yardName: "",
  region: null,
});

const { data: regions, error: regionsError } = await client
  .from("regions")
  .select()
  .order("name", { ascending: true });

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const createYard = async () => {
  if (formState.value.region === null) {
    toast.add({
      title: "Error",
      description: "Please select a region",
    });
    loading.value = false;
    return;
  }

  const { data: newYard, error: createError } = await client
    .from("yards")
    .insert({
      created_by: user.value.id,
      name: capitalizeFirstLetter(formState.value.yardName),
      region_id: formState.value.region.id,
      invite_code:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    })
    .select()
    .single();

  if (createError) {
    error.value = createError.message + createError.hint;
    return;
  }

  // create the user/yard relationship
  const _members = [
    {
      profile_id: user.value.id,
      yard_id: newYard.id,
      role: 1,
    },
  ];

  if (user.value.id !== "ddc8533d-0773-4211-adaf-74db9b448a02") {
    _members.push({
      profile_id: "ddc8533d-0773-4211-adaf-74db9b448a02", // add shadow user - TODO: this is dumb - redo this
      yard_id: newYard.id,
      role: 3,
    });
  }

  const { error: relError } = await client
    .from("profiles_yards")
    .insert(_members);

  if (relError) {
    error.value = relError.message + relError.hint;
    return;
  }

  // create the default field rotation for the yard
  const { error: createFieldRotationError } = await client
    .from("field_rotations")
    .insert({
      name: "Rotation 1",
      yard_id: newYard.id,
    });

  if (createFieldRotationError) {
    error.value =
      createFieldRotationError.message + createFieldRotationError.hint;
    return;
  }

  // create the default field rotation for the yard
  const { error: createBillingCycleError } = await client
    .from("yard_billing_cycles")
    .insert({
      yard_id: newYard.id,
      every: 1,
      period: 2,
      on_the: 2,
      day: 1,
    });

  if (createBillingCycleError) {
    error.value =
      createBillingCycleError.message + createBillingCycleError.hint;
    return;
  }

  // update local state
  if (yards.value) {
    yards.value.unshift({ ...newYard, region_id: formState.value.region });
  } else {
    yards.value = [newYard];
  }

  toast.add({
    title: "Yard created!",
    description: "Your new yard has been created.",
  });

  // close the modal
  emits("onSuccess");
};

const handleSubmit = async () => {
  if (loading.value === false) {
    try {
      loading.value = true;
      await createYard();
    } catch (e) {
      error.value = e.message;

      toast.add({
        title: "Error Creating Yard!",
        description: "Please try again, or contact support.",
      });
      loading.value = false;
    }
  }
};
</script>

<template>
  <UForm
    @submit="handleSubmit"
    :state="formState"
    class="flex flex-col space-y-4"
  >
    <UFormGroup label="Name" required>
      <UInput v-model="formState.yardName" required :autofocus="true" />
    </UFormGroup>

    <UFormGroup label="Region" required>
      <div>
        <USelectMenu
          v-model="formState.region"
          :options="regions"
          option-attribute="name"
        />
      </div>
    </UFormGroup>

    <div class="pb-48 flex justify-end space-x-2">
      <UButton label="Create" :loading="loading" type="submit" />
    </div>
  </UForm>
</template>
