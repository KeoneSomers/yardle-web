export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    const isLoggedIn = user.value != null;
    const isLoggedOut = user.value == null;
    const hasSelectedYard =
        user.value != null && user.value.user_metadata.selected_yard != null;

    // SCENARIO: Trying to access a protected page - must be logged in
    // if (
    //     to.path != "/" &&
    //     to.path != "/login" &&
    //     to.path != "/signup" &&
    //     isLoggedOut
    // ) {
    //     return navigateTo("/");
    // }
    // } else if (
    //     // SCENARIO: Trying to access login or signup page - must be logged out
    //     (to.path == "/" || to.path == "/login" || to.path == "/signup") &&
    //     isLoggedIn
    // ) {
    //     // todo - also check token has not expired! (currently set to 1 week)
    //     return navigateTo("/horses");
    // }

    // SCENARIO: User is logged in but has not selected a yard
    // if (!hasSelectedYard && to.path != "/yards") {
    //     return navigateTo("/yards");
    // }
});
