export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser();

    console.log("Hit middleware!");

    if (to.path != "/login" && to.path != "/signup") {
        // trying to access a protected page
        // - must be logged in
        console.log("trying to access a protected page: " + to.path);
        console.log(user.value);
        if (!user.value) {
            return navigateTo("/login");
        }
    } else if (to.path == "/login" || to.path == "/signup") {
        // trying to access login or signup page
        // - must be logged out
        console.log("trying to access login or signup page: " + to.path);
        console.log(user.value);
        if (user.value) {
            return navigateTo("/");
        }
    }
});
