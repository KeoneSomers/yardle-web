<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

const faqs = [
  {
    question: "What is Yardle?",
    answer:
      "Yardle is a comprehensive yard management platform for horse owners and equestrian enthusiasts.",
  },
  {
    question: "Can multiple people manage horses through Yardle?",
    answer:
      "Yes, Yardle allows multiple people to manage horses and collaborate on horse care.",
  },
  {
    question: "Does Yardle have a calendar feature?",
    answer:
      "Yes, Yardle features a calendar to keep track of horse events such as farrier visits and worming appointments.",
  },
  {
    question: "How does Yardle help with organization and horse care?",
    answer:
      "Yardle provides a clear and concise overview of upcoming horse events through its calendar, making it easy to stay organized and on top of horse care.",
  },
  {
    question: "Who can benefit from using Yardle?",
    answer:
      "Both experienced yard managers and new horse owners can benefit from using Yardle.",
  },
  {
    question: "Are there plans for future updates and new features for Yardle?",
    answer:
      "Yes, there are plans for exciting updates and new features for Yardle in the future.",
  },
  {
    question: "What is the purpose of Yardle?",
    answer:
      "The purpose of Yardle is to simplify and streamline horse management for horse owners and equestrian enthusiasts.",
  },
];
</script>

<template>
  <div class="bg-gray-900">
    <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40 lg:px-8">
      <div class="mx-auto max-w-4xl divide-y divide-white/10">
        <h2 class="text-2xl font-bold leading-10 tracking-tight text-white">
          Frequently asked questions
        </h2>
        <dl class="mt-10 space-y-6 divide-y divide-white/10">
          <Disclosure
            as="div"
            v-for="faq in faqs"
            :key="faq.question"
            class="pt-6"
            v-slot="{ open }"
          >
            <dt>
              <DisclosureButton
                class="flex w-full items-start justify-between text-left text-white"
              >
                <span class="text-base font-semibold leading-7">{{
                  faq.question
                }}</span>
                <span class="ml-6 flex h-7 items-center">
                  <icon
                    name="heroicons:minus-small"
                    v-if="!open"
                    class="h-6 w-6"
                    aria-hidden="true"
                  />
                  <icon
                    name="heroicons:plus-small"
                    v-else
                    class="h-6 w-6"
                    aria-hidden="true"
                  />
                </span>
              </DisclosureButton>
            </dt>
            <DisclosurePanel as="dd" class="mt-2 pr-12">
              <p class="text-base leading-7 text-gray-300">{{ faq.answer }}</p>
            </DisclosurePanel>
          </Disclosure>
        </dl>
      </div>
    </div>
  </div>
</template>
