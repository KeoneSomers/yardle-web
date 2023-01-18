<script setup>
// imports
import CreateFeedModal from "@/components/modals/CreateFeedModal.vue";
import EditFeedModal from "@/components/modals/EditFeedModal.vue";
import DeleteFeedModal from "@/components/modals/DeleteFeedModal.vue";

// modal toggles
const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

// supabase
const client = useSupabaseClient();

// states
const feeds = useState("feeds");
const selectedHorseId = useState("selectedHorseId");

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
const handleDelete = (feedId) => {
  selectedFeedId.value = feedId;
  deleteModalOpen.value = true;
};

const handleEdit = (feedId) => {
  selectedFeedId.value = feedId;
  editModalOpen.value = true;
};

const ingredientTypes = [
  "Pick one",
  "Chaff",
  "Nuts",
  "Extra",
  "Suppliments",
  "Other",
];
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Feeds</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all the feeds that belong to this horse including their
          description, type, weight and age.
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
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
          >
            <table class="w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr class="divide-x divide-gray-200 grid grid-cols-4">
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Ingredients
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Instructions
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Condition
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                  ></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="feed in feeds"
                  :key="feed.id"
                  class="divide-x divide-gray-200 grid grid-cols-4"
                >
                  <td class="p-4 text-sm text-gray-500 break-all">
                    <div class="flex flex-wrap mb-3">
                      <span
                        v-for="ingredient in feed.ingredients"
                        :key="ingredient.id"
                        class="inline-flex items-center rounded-full bg-indigo-100 py-0.5 px-2 text-xs font-medium text-indigo-700 mr-3 mb-2"
                      >
                        {{
                          `${ingredient.name} (${
                            ingredientTypes[ingredient.type]
                          })
                                                     - ${ingredient.quantity} ${
                            ingredient.metric
                          }`
                        }}
                      </span>
                    </div>
                  </td>
                  <td class="p-4 text-sm text-gray-500 break-all">
                    <span v-if="feed.instructions">{{
                      feed.instructions
                    }}</span>
                    <span v-else>--</span>
                  </td>
                  <td class="p-4 text-sm text-gray-500 break-all">
                    <span v-if="feed.condition">{{ feed.condition }}</span>
                    <span v-else>--</span>
                  </td>
                  <td
                    class="py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 break-all"
                  >
                    <button
                      @click="handleEdit(feed.id)"
                      class="bg-blue-400 rounded px-3 mr-3 py-1 text-white"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleDelete(feed.id)"
                      class="bg-red-400 rounded px-3 py-1 text-white"
                    >
                      Delete
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

  <!-- Modals -->
  <CreateFeedModal
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <EditFeedModal
    :is-open="editModalOpen"
    :feed-id="selectedFeedId"
    @close="editModalOpen = false"
  />
  <DeleteFeedModal
    :is-open="deleteModalOpen"
    :feed-id="selectedFeedId"
    @close="deleteModalOpen = false"
  />
</template>
