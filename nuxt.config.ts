// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/supabase",
    "@sidebase/nuxt-pdf",
    "@nuxt/ui",
    "nuxt-vercel-analytics",
    "@nuxt/image",
  ],
  supabase: {
    redirect: false,
  },
  devtools: true,
  colorMode: { preference: "light" },
  typescript: {
    shim: false,
  },
  build: {
    transpile: ["@vuepic/vue-datepicker"],
  },
  css: ["@/assets/css/main.css"],
  app: {
    head: {
      title: "Yardle - Equestrian Yard Management",
      htmlAttrs: {
        lang: "en",
      },
      script: [
        {
          id: "cookieyes",
          type: "text/javascript",
          src: "https://cdn-cookieyes.com/client_data/8c30fb1d750709f9ef9d0730/script.js",
          defer: true,
        },
      ],
      meta: [
        {
          name: "og:site_name",
          content: "Yardle",
        },
        {
          name: "og:title",
          content: "Yardle",
        },
        {
          name: "description",
          content:
            "Horse yard management tool - Join multiple yards, manage horses, their feeds, rugs and medications.",
        },
        {
          name: "og:description",
          content:
            "Horse yard management tool - Join multiple yards, manage horses, their feeds, rugs and medications.",
        },
        {
          name: "keywords",
          content:
            "livery yard billing, horse yard app, horse yard, horse yard management platform, horse management app, horseback riding, horse breeding, Equine Veterinarian, horse boarding near me, horse stables near me, Horse Training, Leasing, horse rescue, horse blanket, stable management app, liberty horse training, horse training app, horse apps, equilab, ridely, secretary, equestfile, horse livery, yard managment, horse tool, equestrian yard management, equestrian, horse management website, horse, equestrian yard manager",
        },
        { name: "author", content: "Yardle" },
      ],
    },
  },
  runtimeConfig: {
    mySuperSecretApiKey: process.env.MY_SUPER_SECRET_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      // this is where any keys i want visable on the frontend would go.
    },
  },
});
