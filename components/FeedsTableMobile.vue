<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

const props = defineProps(["feeds"]);
const emits = defineEmits(["editFeed", "deleteFeed"]);
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
              <div class="flex justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <SupabaseImage
                    v-if="feed.horse.avatar_url"
                    class="h-6 w-6 rounded-full overflow-hidden"
                    id="horse-avatars"
                    v-model:path="feed.horse.avatar_url"
                  />
                  <div
                    v-else
                    class="rounded-full h-6 w-6 text-white flex items-center justify-center"
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
                  <Menu as="div" class="relative inline-block text-left">
                    <div>
                      <MenuButton
                        class="flex items-center p-0.5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                      >
                        <span class="sr-only">Open options</span>
                        <EllipsisVerticalIcon
                          class="h-5 w-5"
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
                              @click="$emit('editFeed', feed.id)"
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
                              @click="$emit('deleteFeed', feed.id)"
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

              <dl class="font-normal lg:hidden">
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
                        class="inline-flex items-center rounded-full bg-pink-100 py-0.5 px-2 text-xs font-medium text-pink-700 mr-1 mb-1"
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
                        class="inline-flex items-center rounded-full bg-indigo-100 py-0.5 px-2 text-xs font-medium text-indigo-700 mr-1 mb-1"
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
                        class="inline-flex items-center rounded-full bg-yellow-100 py-0.5 px-2 text-xs font-medium text-yellow-700 mr-1 mb-1"
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
