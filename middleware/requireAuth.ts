export default defineNuxtRouteMiddleware((to, from) => {
  // console.log("Running the 'Require Auth' Middleware!");
  const user = useSupabaseUser();

  // if user is not logged in - send them to the login page
  if (!user.value) {
    return navigateTo("/auth/login");
  }
});
