// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // SSG Mode for performance
  ssr: false,

  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/scripts", "@nuxt/ui", "@nuxt/fonts", "@nuxt/icon"],

  components: ["~/components/base", "~/components/game"],

  css: ["~/assets/css/main.css"],

  fonts: {
    families: [{ name: "Nunito", weights: [400, 600, 700, 800, 900] }],
  },

  icon: {
    serverBundle: "remote",
    // We use the 'flag:' prefix which maps to standard flag icons
  },

  app: {
    head: {
      title: "Flag Master",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
        },
        { name: "theme-color", content: "#58cc02" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ],
    },
  },
});
