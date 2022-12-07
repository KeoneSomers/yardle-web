export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    if (
        to.path != "/" &&
        to.path != "/login" &&
        to.path != "/signup" &&
        !user.value
    ) {
        // trying to access a protected page
        // - must be logged in
        return navigateTo("/login");
    } else if (
        (to.path == "/" || to.path == "/login" || to.path == "/signup") &&
        user.value
    ) {
        // trying to access login or signup page
        // - must be logged out
        // todo - also check token has not expired! (currently set to 1 week)
        return navigateTo("/dashboard");
    }
});
