<script setup>
import { PlusIcon } from "@heroicons/vue/20/solid/index.js";
import BasicModal from "@/components/BasicModal.vue";
import CreateFeedModal from "@/components/modals/CreateFeedModal.vue";
import { DialogTitle } from "@headlessui/vue";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline/index.js";
import EditFeedModal from "@/components/modals/EditFeedModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const feeds = useState("feeds");

const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const selectedFeedId = ref(0);

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
      .select("name, id, avatar_url")
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

  // close the modal
  deleteModalOpen.value = false;
  selectedFeedId.value = 0;
};

// delete modal
const handleModalOpen = (feedId) => {
  selectedFeedId.value = feedId;
  deleteModalOpen.value = true;
};

const handleEdit = (feedId) => {
  selectedFeedId.value = feedId;
  editModalOpen.value = true;
};

const scrollAmount = ref(0);
const edgeShadowLeft = ref(null);
const edgeShadowLeftShow = ref(false);
const edgeShadowRight = ref(null);
const edgeShadowRightShow = ref(false);
const weatherWrapper = ref(null);
const weatherWrapperOutter = ref(null);

onMounted(() => {
  setShadow();
});

const setShadow = (event) => {
  if (event) {
    scrollAmount.value = event.target.scrollLeft;
  }

  const maxScroll =
    weatherWrapper.value.clientWidth - weatherWrapperOutter.value.clientWidth;
  var scrollPercent = (scrollAmount.value / maxScroll) * 100;

  const scrollViewport = weatherWrapperOutter.value.clientWidth;
  const scrollContent = weatherWrapper.value.clientWidth;

  // content is bigger than scroll viewport
  if (scrollContent > scrollViewport) {
    if (scrollPercent > 0) {
      edgeShadowLeftShow.value = true;
    } else {
      edgeShadowLeftShow.value = false;
    }

    if (scrollPercent < 100) {
      edgeShadowRightShow.value = true;
    } else {
      edgeShadowRightShow.value = false;
    }
  } else {
    edgeShadowLeftShow.value = false;
    edgeShadowRightShow.value = false;
  }
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 my-10">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Feed Report</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all the feeds for the horses in this yard including their
          ingredients, instructions and conditions.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 flex">
        <button
          @click="() => (createModalOpen = true)"
          type="button"
          class="inline-flex mr-2 items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon class="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create a feed
        </button>
        <DownloadFeedReport />
      </div>
    </div>

    <div class="relative">
      <div
        ref="edgeShadowLeft"
        v-if="edgeShadowLeftShow"
        class="w-6 z-50 h-full bg-gradient-to-r from-stone-200 absolute left-0 top-0 pointer-events-none border-l rounded"
      ></div>
      <div
        ref="edgeShadowRight"
        v-if="edgeShadowRightShow"
        class="w-6 z-50 h-full bg-gradient-to-l from-stone-200 absolute right-0 top-0 pointer-events-none border-r rounded"
      ></div>
      <div
        :onscroll="setShadow"
        ref="weatherWrapperOutter"
        class="mt-5 relative overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
      >
        <table
          id="feed-report"
          ref="weatherWrapper"
          class="min-w-full divide-y divide-gray-300"
        >
          <thead class="bg-gray-50">
            <tr class="divide-x divide-gray-200">
              <th
                scope="col"
                class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              ></th>
              <th
                scope="col"
                class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Chaff
              </th>
              <th
                scope="col"
                class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Nuts
              </th>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Extra
              </th>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Suppliments
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="(feed, index) in feeds"
              :key="feed.id"
              class="divide-x divide-gray-200"
              :class="index % 2 === 0 ? undefined : 'bg-gray-50'"
            >
              <td
                class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6"
              >
                <div class="min-w-80">
                  <div class="flex items-center space-x-2">
                    <SupabaseImage
                      v-if="feed.horse.avatar_url"
                      class="h-8 w-8 rounded-full overflow-hidden"
                      id="horse-avatars"
                      v-model:path="feed.horse.avatar_url"
                    />
                    <div
                      v-else
                      class="bg-pink-500 rounded-full h-8 w-8 text-white flex items-center justify-center"
                    >
                      {{ feed.horse.name[0].toUpperCase() }}
                    </div>

                    <div>
                      <p class="text-2xl font-bold">{{ feed.horse.name }}</p>
                    </div>
                  </div>

                  <div
                    v-if="feed.instructions"
                    class="flex items-center mt-3 bg-yellow-100 p-1 rounded-lg"
                  >
                    <InformationCircleIcon class="h-5 w-5 mr-2 text-gray-600" />
                    <span class="text-yellow-700 font-bold">{{
                      feed.instructions
                    }}</span>
                  </div>
                  <div v-if="feed.condition" class="flex items-center mt-1">
                    <ClockIcon class="h-5 w-5 mr-2 text-gray-600" />
                    <span class="text-purple-500 font-bold">{{
                      feed.condition
                    }}</span>
                  </div>
                  <div
                    id="feed-report-actions"
                    class="mt-2 flex justify-end w-full"
                  >
                    <button
                      @click="handleEdit(feed.id)"
                      class="text-gray-600 hover:text-gray-900 bg-gray-100 py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleModalOpen(feed.id)"
                      class="text-gray-600 hover:text-gray-900 bg-gray-100 py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap p-4 text-sm text-gray-500 w-1/5">
                <div
                  v-for="ingredient in feed.ingredients.filter(
                    (i) => i.type === 1
                  )"
                  :key="ingredient.id"
                >
                  <span
                    class="inline-flex items-center rounded-full bg-pink-100 py-0.5 px-2 text-xs font-medium text-pink-700 mr-3 mb-2"
                  >
                    {{
                      `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                    }}
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap p-4 text-sm text-gray-500 w-1/5">
                <div class="flex flex-wrap mb-3">
                  <span
                    v-for="ingredient in feed.ingredients.filter(
                      (i) => i.type === 2
                    )"
                    :key="ingredient.id"
                    class="inline-flex items-center rounded-full bg-indigo-100 py-0.5 px-2 text-xs font-medium text-indigo-700 mr-3 mb-2"
                  >
                    {{
                      `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                    }}
                  </span>
                </div>
              </td>
              <td
                class="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 w-1/5"
              >
                <div class="flex flex-wrap mb-3">
                  <span
                    v-for="ingredient in feed.ingredients.filter(
                      (i) => i.type === 3
                    )"
                    :key="ingredient.id"
                    class="inline-flex items-center rounded-full bg-yellow-100 py-0.5 px-2 text-xs font-medium text-yellow-700 mr-3 mb-2"
                  >
                    {{
                      `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                    }}
                  </span>
                </div>
              </td>
              <td
                class="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 w-1/5"
              >
                <div class="flex flex-wrap mb-3">
                  <span
                    v-for="ingredient in feed.ingredients.filter(
                      (i) => i.type === 4
                    )"
                    :key="ingredient.id"
                    class="inline-flex items-center rounded-full bg-purple-100 py-0.5 px-2 text-xs font-medium text-purple-700 mr-3 mb-2"
                  >
                    {{
                      `${ingredient.name} - ${ingredient.quantity} ${ingredient.metric}`
                    }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Create Feed Modal -->
  <CreateFeedModal
    :is-open="createModalOpen"
    :feed-id="selectedFeedId"
    @close="createModalOpen = false"
  />
  <!-- Edit Feed Modal -->
  <EditFeedModal
    :is-open="editModalOpen"
    :feed-id="selectedFeedId"
    @close="editModalOpen = false"
  />
  <!-- Delete Feed Modal -->
  <BasicModal :is-open="deleteModalOpen" @close="deleteModalOpen = false">
    <div>
      <div class="sm:flex sm:items-start">
        <div
          class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <ExclamationTriangleIcon
            class="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <DialogTitle
            as="h3"
            class="text-lg font-medium leading-6 text-gray-900"
            >Delete Feed</DialogTitle
          >
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete this feed? All of it's data will
              be permanently removed from your yard forever. This action cannot
              be undone.
            </p>
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          @click="handleDelete"
        >
          Delete
        </button>
        <button
          type="button"
          class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          @click="deleteModalOpen = false"
          ref="cancelButtonRef"
        >
          Cancel
        </button>
      </div>
    </div>
  </BasicModal>
</template>
