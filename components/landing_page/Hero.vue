<script setup>
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
</script>

<template>
  <div class="relative isolate overflow-hidden bg-white">
    <svg
      class="opacity-0 lg:opacity-100 absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
          width="200"
          height="200"
          x="50%"
          y="-1"
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        stroke-width="0"
        fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
      />
    </svg>
    <div
      class="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:py-40 lg:px-8"
    >
      <div
        class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
      >
        <Logo class="h-11 w-12" />
        <div class="mt-24 sm:mt-32 lg:mt-16">
          <a
            href="https://vagabond-gander-621.notion.site/Yardle-V1-0-38737fb5f72e47cdaa45d2371f98da64"
            target="_blank"
            class="inline-flex space-x-6"
          >
            <span
              class="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10"
              >What's new</span
            >
            <span
              class="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600"
            >
              <span>Just shipped v1.0</span>
              <ChevronRightIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </a>
        </div>
        <h1
          class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
        >
          The yard management platform
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Whether you're a horse owner, breeder, trainer, or a yard owner,
          Yardle is the perfect tool for you.
        </p>
        <div class="mt-10 flex items-center gap-x-6">
          <NuxtLink
            to="/signup"
            class="rounded-md bg-indigo-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >Get started</NuxtLink
          >
          <NuxtLink
            to="/login"
            class="text-base font-semibold leading-7 text-gray-900"
            >Login <span aria-hidden="true">→</span></NuxtLink
          >
        </div>
      </div>
      <div
        class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32"
      >
        <div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <div
            class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4"
          >
            <img
              src="@/assets/hero_screenshot.webp"
              alt="App screenshot"
              width="2432"
              height="1442"
              class="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
