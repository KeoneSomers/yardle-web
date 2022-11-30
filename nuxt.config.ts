// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase"],
    typescript: {
        shim: false,
    },
    supabase: {
        client: {
            auth: {
                persistSession: true,
            },
        },
    },
    app: {
        head: {
            title: "Yardle - Yard Management App",
            meta: [
                {
                    name: "description",
                    content: "A website to help you with your yard.",
                },
                { name: "author", content: "Keone Somers" },
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
