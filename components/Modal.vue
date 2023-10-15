<script setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const mobileMode = breakpoints.smaller("lg");

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <UModal v-model="value" :fullscreen="mobileMode">
    <slot />
  </UModal>
</template>
