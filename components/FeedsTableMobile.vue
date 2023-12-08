<script setup>
const props = defineProps(["feeds"]);
const emits = defineEmits(["editFeed", "deleteFeed"]);
</script>

<template>
  <div class="px-4 sm:hidden sm:px-6 lg:px-8">
    <div
      class="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg"
    >
      <table class="min-w-full divide-y divide-gray-300">
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="feed in feeds" :key="feed.id">
            <td
              class="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6"
            >
              <div class="mb-3 flex justify-between">
                <div class="flex items-center space-x-2">
                  <SupabaseImage
                    v-if="feed.horse.avatar_url"
                    class="h-6 w-6 overflow-hidden rounded-full"
                    id="horse-avatars"
                    v-model:path="feed.horse.avatar_url"
                  />
                  <div
                    v-else
                    class="flex h-6 w-6 items-center justify-center rounded-full text-white"
                    :class="
                      feed.horse.avatar_background
                        ? feed.horse.avatar_background
                        : 'bg-pink-500'
                    "
                  >
                    {{ feed.horse.name[0].toUpperCase() }}
                  </div>

                  <div>
                    <p class="font-semibold">{{ feed.horse.name }}</p>
                  </div>
                </div>
                <div>
                  <UDropdown
                    :items="[
                      [
                        {
                          label: 'Edit',
                          icon: 'i-heroicons-pencil-20-solid',
                          click: () => $emit('editFeed', feed.id),
                        },
                        {
                          label: 'Delete',
                          icon: 'i-heroicons-trash-20-solid',
                          click: () => $emit('deleteFeed', feed.id),
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

              <dl class="font-normal lg:hidden">
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
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
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
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
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
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
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
                <dd class="mt-1 truncate text-gray-500 sm:hidden">
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
