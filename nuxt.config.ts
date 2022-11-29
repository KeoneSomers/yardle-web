// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxtjs/tailwindcss"],
    typescript: {
        shim: false,
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
});
