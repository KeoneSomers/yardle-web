<script setup>
import { ref } from "vue";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import { XMarkIcon } from "@heroicons/vue/20/solid";

const alerts = useState("alerts", () => []);
const show = ref(true);

watchEffect(() => {
  if (alerts.value.length > 0) {
    setTimeout(() => {
      alerts.value.pop();
    }, 5000);
  }
});
</script>

<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
  >
    <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
    <TransitionGroup
      name="fade"
      tag="div"
      class="relative flex w-full flex-col space-y-4 sm:items-end"
    >
      <div
        v-for="(alert, index) in alerts"
        :key="alert"
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon
                v-if="alert.type === 'success'"
                class="h-6 w-6 text-green-400"
                aria-hidden="true"
              />
              <XCircleIcon
                v-if="alert.type === 'error'"
                class="h-6 w-6 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ alert.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ alert.message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                @click="alerts.splice(index, 1)"
                class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
  <button
    @click="
      alerts.push({
        title: 'Horse Added!',
        message: 'You have added a horse to the yard.',
        type: 'error',
      })
    "
    class="cursor-pointer z-50 fixed bottom-10 left-20"
  >
    Add Alert
  </button>
</template>

<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
  /* transform: translateX(100%); */
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
