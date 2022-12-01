export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    console.log("Hit middleware!");
    console.log(user.value);

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
    } else {
        return navigateTo("/login");
    }
});
