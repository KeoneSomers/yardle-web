import TawkMessengerVue from "@tawk.to/tawk-messenger-vue-3";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(TawkMessengerVue, {
    propertyId: "63ea5213c2f1ac1e203305ab",
    widgetId: "1gp5l17pf",
  });
});
