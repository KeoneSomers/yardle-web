import { defineNuxtPlugin } from "#app";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

// TODO: created this plugin since the floating-vue default setup is bugged currently for nuxt 3

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(FloatingVue);
});
