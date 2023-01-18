<script setup>
definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");

const ingredientTypes = [
  "Pick one",
  "Chaff",
  "Nuts",
  "Extra",
  "Suppliments",
  "Other",
];

// fetch feeds
const { data: feeds } = await useAsyncData("all_feeds", async () => {
  const { data, error } = await client
    .from("feeds")
    .select()
    .eq("yard_id", selectedYard.value);

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

  return Promise.all(mappedFeeds);
});
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
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <!-- <button
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Add user
        </button> -->
      </div>
    </div>
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
          >
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr class="divide-x divide-gray-200">
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Horse
                  </th>
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
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                  >
                    Other
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="feed in feeds"
                  :key="feed.id"
                  class="divide-x divide-gray-200"
                >
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6"
                  >
                    <div class="flex space-x-5">
                      <div class="flex items-center">
                        <SupabaseImage
                          v-if="feed.horse.avatar_url"
                          class="h-12 w-12 rounded-full overflow-hidden"
                          id="horse-avatars"
                          v-model:path="feed.horse.avatar_url"
                        />
                        <div
                          v-else
                          class="bg-pink-500 rounded-full h-12 w-12 text-white flex items-center justify-center"
                        >
                          {{ feed.horse.name[0].toUpperCase() }}
                        </div>
                      </div>
                      <div>
                        <p class="text-xl font-bold">{{ feed.horse.name }}</p>
                        <p>Instructions: {{ feed.instructions }}</p>
                        <p>Conditions: {{ feed.condition }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap p-4 text-sm text-gray-500">
                    <div class="flex flex-wrap mb-3">
                      <span
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 1
                        )"
                        :key="ingredient.id"
                        class="inline-flex items-center rounded-full bg-pink-100 py-0.5 px-2 text-xs font-medium text-pink-700 mr-3 mb-2"
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
                  <td class="whitespace-nowrap p-4 text-sm text-gray-500">
                    <div class="flex flex-wrap mb-3">
                      <span
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 2
                        )"
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
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6"
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
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6"
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
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6"
                  >
                    <div class="flex flex-wrap mb-3">
                      <span
                        v-for="ingredient in feed.ingredients.filter(
                          (i) => i.type === 5
                        )"
                        :key="ingredient.id"
                        class="inline-flex items-center rounded-full bg-green-100 py-0.5 px-2 text-xs font-medium text-green-700 mr-3 mb-2"
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
