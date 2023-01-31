<script setup>
const props = defineProps(["feeds"]);
</script>

<template>
  <div class="sm:hidden px-4 sm:px-6 lg:px-8">
    <div
      class="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg"
    >
      <table class="min-w-full divide-y divide-gray-300">
        <!-- <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Name
            </th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead> -->
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="feed in feeds" :key="feed.id">
            <td
              class="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6"
            >
              {{ feed.horse.name }}
              <dl class="font-normal lg:hidden">
                <dd class="mt-1 truncate text-gray-700" v-if="feed.condition">
                  <div
                    class="bg-purple-50 p-0.5 rounded border-purple-100 text-purple-800 whitespace-pre-wrap"
                  >
                    {{ feed.condition }}
                  </div>
                </dd>
                <dd
                  class="mt-1 truncate text-gray-700"
                  v-if="feed.instructions"
                >
                  <div
                    class="bg-orange-50 p-0.5 rounded border-orange-100 text-orange-800 whitespace-pre-wrap"
                  >
                    {{ feed.instructions }}
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
                  <div class="flex">
                    <div class="mr-1">Chaff:</div>
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
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
                  <div class="flex">
                    <div class="mr-1">Nuts:</div>
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
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
                  <div class="flex">
                    <div class="mr-1">Extra:</div>
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
                  </div>
                </dd>
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
                  <div class="flex">
                    <div class="mr-1">Suppliments:</div>
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
                  </div>
                </dd>
              </dl>
            </td>
            <!-- <td class="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <a href="#" class="text-indigo-600 hover:text-indigo-900"
                >Edit<span class="sr-only">, {{ feed.name }}</span></a
              >
            </td> -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
