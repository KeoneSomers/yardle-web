// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],
    typescript: {
        shim: false,
    },
    css: ["@/assets/css/main.css"],
    app: {
        head: {
            title: "Yardle - Equestrian Yard Management",
            meta: [
                {
                    name: "description",
                    content:
                        "Digital horse yard management tool - Join multiple yards, manage horses, their feeds, rugs and medications.",
                },
                {
                    name: "keywords",
                    content:
                        "horse livery, yard managment, horse tool, equestrian yard management",
                },
                { name: "author", content: "Yardle" },
            ],
        },
    },
    runtimeConfig: {
        mySuperSecretApiKey: process.env.MY_SUPER_SECRET_API_KEY,
        public: {
            // this is where any keys i want visable on the frontend would go.
        },
    },
});
