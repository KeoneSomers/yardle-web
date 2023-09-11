export default defineNuxtRouteMiddleware((to, from) => {
  // console.log("Running the 'Require No Auth' Middleware!");
  const user = useSupabaseUser();

  // if user is logged in - send them to the yards page
  if (user.value) {
    return navigateTo("/yards");
  }
});
