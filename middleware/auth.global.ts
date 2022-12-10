export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    // variables
    const isLoggedIn = user.value != null;
    const isLoggedOut = user.value == null;
    const hasSelectedYard =
        user.value != null && user.value.user_metadata.selected_yard != null;

    const nonProtectedPages = ["/", "/login", "signup"];

    // visiter is trying to access non auth pages
    if (nonProtectedPages.includes(to.path)) {
        if (isLoggedIn) {
            if (hasSelectedYard) {
                navigateTo("/horses");
            } else {
                navigateTo("/yards");
            }
        }
    }

    // TODO: visiter is trying to access auth pages
});
