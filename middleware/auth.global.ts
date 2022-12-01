export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    if (to.path != "/login" && to.path != "/signup") {
        // trying to access a protected page
        // - must be logged in
        if (!user.value) {
            return navigateTo("/login");
        }
    } else if (to.path == "/login" || to.path == "/signup") {
        // trying to access login or signup page
        // - must be logged out
        if (user.value) {
            return navigateTo("/");
        }
    }
});
