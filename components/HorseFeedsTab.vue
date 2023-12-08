<script setup>
const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

// supabase
const client = useSupabaseClient();

// states
const feeds = useState("feeds");
const selectedHorseId = useState("selectedHorseId");

const toast = useToast();

// refs
const selectedFeedId = ref(0);

await useAsyncData("feeds", async () => {
  // fetch feeds
  const { data, error } = await client
    .from("feeds")
    .select()
    .eq("horse_id", selectedHorseId.value);

  if (!error) {
    feeds.value = data;
  }

  // fetch feed ingredients
  const { data: ingredientsData, error: ingredientsError } = await client
    .from("ingredients")
    .select()
    .eq("horse_id", selectedHorseId.value);

  // map ingredients to feeds
  if (!ingredientsError) {
    feeds.value = feeds.value.map((feed) => {
      feed.ingredients = ingredientsData.filter(
        (ingredient) => ingredient.feed_id === feed.id
      );

      return feed;
    });
  }
});

// functions
const handleDelete = async () => {
  // delete the feeds ingredients
  const { error: ingredientsError } = await client
    .from("ingredients")
    .delete()
    .eq("feed_id", selectedFeedId.value)
    .select();

  if (ingredientsError) {
    // somthing went wrong!
    console.log(ingredientsError);
    return;
  }

  // delete the feed
  const { error: feedError } = await client
    .from("feeds")
    .delete()
    .eq("id", selectedFeedId.value)
    .select();

  if (feedError) {
    // somthing went wrong!
    console.log(feedError);
    return;
  }

  // success! - now remove the deleted feed from the webpage
  const index = feeds.value.map((e) => e.id).indexOf(selectedFeedId.value);
  feeds.value.splice(index, 1);

  toast.add({
    title: "Feed Deleted!",
    description: "Your feed has been deleted.",
  });

  // close the modal
  deleteModalOpen.value = false;
};

const handleEdit = (feedId) => {
  selectedFeedId.value = feedId;
  editModalOpen.value = true;
};

const ingredientTypes = [
  "Pick one",
  "Chaff",
  "Balancer",
  "Extra",
  "Suppliments",
  "Other",
];
</script>

<template>
  <div class="mx-auto my-6 px-4 sm:px-6 lg:px-8 sm:mt-2 2xl:mt-5">
    <div v-if="feeds.length > 0">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Feeds</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the feeds that belong to this horse including their
            condition, instructions and ingredients.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add feed
          </button>
        </div>
      </div>
      <div class="mt-5 grid md:mt-16 md:grid-cols-2">
        <div
          v-for="feed in feeds"
          :key="feed.id"
          class="overflow-hidden rounded-lg border p-4 text-sm font-medium text-gray-900 shadow"
        >
          <div class="flex">
            <div class="flex-1 pr-4">
              <dl class="font-normal">
                <dd class="mt-1 truncate text-gray-700" v-if="feed.condition">
                  <div
                    class="whitespace-pre-wrap rounded border bg-gray-50 p-0.5"
                  >
                    Condition:
                    {{ feed.condition }}
                  </div>
                </dd>
                <dd
                  class="mt-1 truncate text-gray-700"
                  v-if="feed.instructions"
                >
                  <div
                    class="whitespace-pre-wrap rounded border bg-gray-50 p-0.5"
                  >
                    Instructions:
                    {{ feed.instructions }}
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500">
                  <div class="mr-1 mt-1">Chaff:</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="ingredient in feed.ingredients.filter(
                        (i) => i.type === 1
                      )"
                      :key="ingredient.id"
                    >
                      <span
                        class="mr-1 mb-1 inline-flex items-center rounded-full bg-pink-100 py-0.5 px-2 text-xs font-medium text-pink-700"
                      >
                        {{
                          `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                        }}
                      </span>
                    </div>
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500">
                  <div class="mr-1 mt-1">Balancer:</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="ingredient in feed.ingredients.filter(
                        (i) => i.type === 2
                      )"
                      :key="ingredient.id"
                    >
                      <span
                        class="mr-1 mb-1 inline-flex items-center rounded-full bg-indigo-100 py-0.5 px-2 text-xs font-medium text-indigo-700"
                      >
                        {{
                          `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                        }}
                      </span>
                    </div>
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500">
                  <div class="mr-1 mt-1">Extra:</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="ingredient in feed.ingredients.filter(
                        (i) => i.type === 3
                      )"
                      :key="ingredient.id"
                    >
                      <span
                        class="mr-1 mb-1 inline-flex items-center rounded-full bg-yellow-100 py-0.5 px-2 text-xs font-medium text-yellow-700"
                      >
                        {{
                          `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                        }}
                      </span>
                    </div>
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500">
                  <div class="mr-1 mt-1">Suppliments:</div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="ingredient in feed.ingredients.filter(
                        (i) => i.type === 4
                      )"
                      :key="ingredient.id"
                    >
                      <span
                        class="mr-1 mb-1 inline-flex items-center rounded-full bg-purple-100 py-0.5 px-2 text-xs font-medium text-purple-700"
                      >
                        {{
                          `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                        }}
                      </span>
                    </div>
                  </div>
                </dd>
              </dl>
            </div>
            <div>
              <UDropdown
                :items="[
                  [
                    {
                      label: 'Edit',
                      icon: 'i-heroicons-pencil-20-solid',
                      click: () => handleEdit(feed.id),
                    },
                    {
                      label: 'Delete',
                      icon: 'i-heroicons-trash-20-solid',
                      click: () => {
                        selectedFeedId = feed.id;
                        deleteModalOpen = true;
                      },
                    },
                  ],
                ]"
                :popper="{ placement: 'bottom-start' }"
              >
                <UButton
                  color="white"
                  trailing-icon="i-heroicons-ellipsis-vertical-20-solid"
                />
              </UDropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="my-20 flex w-full items-center justify-center">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vector-effect="non-scaling-stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No Feeds</h3>
        <p class="mt-1 px-10 text-sm text-gray-500">
          Feeds that belong to your horses will be shown here.
        </p>
        <div class="mt-6">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <icon
              name="heroicons:plus-solid"
              class="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            New Feed
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Feed Modal -->
  <Modal v-model="createModalOpen">
    <ModalHeaderLayout title="Create a Feed" @close="createModalOpen = false">
      <FormsCreateFeedForm @onSuccess="createModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Edit Feed Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Feed" @close="editModalOpen = false">
      <FormsEditFeedForm
        :feed-id="selectedFeedId"
        @onSuccess="editModalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Feed Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout title="Delete Feed" @close="deleteModalOpen = false">
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this feed? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
