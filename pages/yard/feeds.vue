<script setup>
definePageMeta({
  middleware: ["require-auth", "require-yard"],
});

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();
const feeds = useState("feeds");
const profile = useState("profile");

const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const selectedFeedId = ref(0);
const toast = useToast();

// TODO: this need to use the feeds state
// fetch feeds
await useAsyncData("all_feeds", async () => {
  const { data, error } = await client
    .from("feeds")
    .select()
    .eq("yard_id", selectedYard.value)
    .order("horse_id", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  // map the feeds to also incude their ingredients and the horses name
  const mappedFeeds = data.map(async (feed) => {
    const { data: horse, error: horseError } = await client
      .from("horses")
      .select("name, id, avatar_url, avatar_background")
      .eq("id", feed.horse_id)
      .single();

    if (horseError) {
      console.log(horseError);
      return;
    }

    const { data: ingredients, error: ingredientsError } = await client
      .from("ingredients")
      .select()
      .eq("feed_id", feed.id);

    if (ingredientsError) {
      console.log(ingredientsError);
      return;
    }

    return {
      ...feed,
      ingredients,
      horse: horse,
    };
  });

  feeds.value = await Promise.all(mappedFeeds);
});

//
// const feedsGroupedByHorse = useState("groupedFeeds");
// compute the feeds grouped by horse
const feedsGroupedByHorse = computed(() => {
  return feeds.value.reduce((r, a) => {
    r[a.horse.id] = [...(r[a.horse.id] || []), a];
    return r;
  }, {});
});

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

  // cleanup
  deleteModalOpen.value = false;
  selectedFeedId.value = 0;
};
</script>

<template>
  <div class="w-full">
    <PageHeading
      title="Feeds"
      description="A list of all the feeds for the horses in this yard including their
          ingredients, instructions and conditions."
    >
      <button
        @click="() => (createModalOpen = true)"
        type="button"
        class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-indigo-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 md:mr-2 md:w-fit md:px-4"
      >
        <icon
          name="heroicons:plus-solid"
          class="-ml-1 mr-3 h-4 w-4"
          aria-hidden="true"
        />
        Add a feed
      </button>
      <DownloadFeedReport v-show="feeds.length > 0" />
    </PageHeading>
    <div
      v-if="feeds.length > 0"
      class="px-0 sm:px-6 md:h-screen md:overflow-y-auto lg:px-8"
    >
      <!-- Page Heading -->

      <!-- Desktop Table -->
      <div class="mt-8 hidden overflow-hidden rounded-lg border sm:flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
          >
            <table class="min-w-full" id="feed-report">
              <thead class="bg-white">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Condition &amp; Instructions
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Chaff
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Balancer
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Extra
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Supplements
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <template v-for="group in feedsGroupedByHorse" :key="group">
                  <tr class="border-t border-gray-200">
                    <th
                      colspan="6"
                      scope="colgroup"
                      class="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      <div class="flex">
                        <SupabaseImage
                          v-if="group[0].horse.avatar_url"
                          class="mr-2 h-5 w-5 overflow-hidden rounded-full"
                          id="horse-avatars"
                          v-model:path="group[0].horse.avatar_url"
                        />
                        <div
                          v-else
                          class="mr-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
                          :class="
                            group[0].horse.avatar_background
                              ? group[0].horse.avatar_background
                              : 'bg-pink-500'
                          "
                        >
                          {{ group[0].horse.name[0].toUpperCase() }}
                        </div>
                        {{ group[0].horse.name }}
                      </div>
                    </th>
                  </tr>
                  <tr
                    v-for="(feed, index) in group"
                    :key="feed.email"
                    :class="[
                      index === 0 ? 'border-gray-300' : 'border-gray-200',
                      'border-t',
                    ]"
                  >
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 align-top text-sm font-medium text-gray-900 sm:pl-3"
                    >
                      <p v-if="feed.condition">
                        <span class="font-mono text-gray-400">C: </span
                        >{{ feed.condition }}
                      </p>
                      <p v-if="feed.instructions">
                        <span class="font-mono text-gray-400">I: </span
                        >{{ feed.instructions }}
                      </p>
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 align-top text-sm text-gray-500"
                    >
                      <div
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 1
                        )"
                        :key="ingredient.id"
                      >
                        <span
                          class="mb-2 mr-3 inline-flex items-center rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700"
                        >
                          {{
                            `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                          }}
                        </span>
                      </div>
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 align-top text-sm text-gray-500"
                    >
                      <div
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 2
                        )"
                        :key="ingredient.id"
                      >
                        <span
                          class="mb-2 mr-3 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {{
                            `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                          }}
                        </span>
                      </div>
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 align-top text-sm text-gray-500"
                    >
                      <div
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 3
                        )"
                        :key="ingredient.id"
                      >
                        <span
                          class="mb-2 mr-3 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"
                        >
                          {{
                            `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                          }}
                        </span>
                      </div>
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 align-top text-sm text-gray-500"
                    >
                      <div
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 4
                        )"
                        :key="ingredient.id"
                      >
                        <span
                          class="mb-2 mr-3 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                        >
                          {{
                            `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                          }}
                        </span>
                      </div>
                    </td>
                    <td
                      class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right align-top text-sm font-medium sm:pr-3"
                    >
                      <UDropdown
                        v-if="
                          profile &&
                          profile.active_role &&
                          profile.active_role < 3
                        "
                        :items="[
                          [
                            {
                              label: 'Edit',
                              icon: 'i-heroicons-pencil-20-solid',
                              click: () => {
                                selectedFeedId = feed.id;
                                editModalOpen = true;
                              },
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
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Mobile Table -->
      <FeedsTableMobile
        v-show="feeds.length > 0"
        :feeds="feeds"
        @editFeed="
          (id) => {
            selectedFeedId = id;
            editModalOpen = true;
          }
        "
        @deleteFeed="
          (id) => {
            selectedFeedId = id;
            deleteModalOpen = true;
          }
        "
      />
    </div>
    <div v-else class="flex h-screen flex-1 items-center justify-center">
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
        <p class="mt-1 text-sm text-gray-500">
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
          icon="heroicons:exclamation-triangle"
          icon-color="text-red-600"
          body="Are you sure you want to delete this feed? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
          buttonText="Delete"
          @onConfirm="handleDelete()"
        />
      </ModalHeaderLayout>
    </Modal>
  </div>
</template>
