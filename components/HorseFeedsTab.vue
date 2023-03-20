<script setup>
// imports
import CreateFeedModal from "@/components/modals/CreateFeedModal.vue";
import EditFeedModal from "@/components/modals/EditFeedModal.vue";
import DeleteFeedModal from "@/components/modals/DeleteFeedModal.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";

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
  "Balancer",
  "Extra",
  "Suppliments",
  "Other",
];
</script>

<template>
  <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
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
      <div class="grid md:grid-cols-2 mt-5 md:mt-16">
        <div
          v-for="feed in feeds"
          :key="feed.id"
          class="overflow-hidden shadow border rounded-lg text-sm font-medium text-gray-900 p-4"
        >
          <div class="flex">
            <div class="flex-1 pr-4">
              <dl class="font-normal">
                <dd class="mt-1 truncate text-gray-700" v-if="feed.condition">
                  <div
                    class="bg-gray-50 p-0.5 rounded border whitespace-pre-wrap"
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
                    class="bg-gray-50 p-0.5 rounded border whitespace-pre-wrap"
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
                        class="inline-flex items-center rounded-full bg-pink-100 py-0.5 px-2 text-xs font-medium text-pink-700 mr-1 mb-1"
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
                        class="inline-flex items-center rounded-full bg-indigo-100 py-0.5 px-2 text-xs font-medium text-indigo-700 mr-1 mb-1"
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
                        class="inline-flex items-center rounded-full bg-yellow-100 py-0.5 px-2 text-xs font-medium text-yellow-700 mr-1 mb-1"
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
                        class="inline-flex items-center rounded-full bg-purple-100 py-0.5 px-2 text-xs font-medium text-purple-700 mr-1 mb-1"
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
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton
                    class="flex items-center p-0.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                  >
                    <span class="sr-only">Open options</span>
                    <icon
                      name="heroicons:ellipsis-vertical-solid"
                      class="h-6 w-6"
                      aria-hidden="true"
                    />
                  </MenuButton>
                </div>

                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems
                    class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleEdit(feed.id)"
                          :class="[
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left',
                          ]"
                        >
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleDelete(feed.id)"
                          :class="[
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left',
                          ]"
                        >
                          Delete
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex w-full my-20 justify-center items-center">
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
        <p class="mt-1 text-sm text-gray-500 px-10">
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
