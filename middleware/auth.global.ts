export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    // variables
    const isLoggedIn = user.value != null;
    const isLoggedOut = user.value == null;
    const hasSelectedYard =
        user.value != null && user.value.user_metadata.selected_yard != null;

    const nonProtectedPages = ["/", "/login", "signup"];

    // visiter is trying to access NON-AUTH pages
    if (nonProtectedPages.includes(to.path)) {
        if (isLoggedIn) {
            if (hasSelectedYard) {
                navigateTo("/horses");
            } else {
                navigateTo("/yards");
            }
        }
    }

    // visiter is trying to access AUTH pages
    if (!nonProtectedPages.includes(to.path)) {
        if (isLoggedOut) navigateTo("/");

        if (isLoggedIn) {
            // already have selected yard
            if (hasSelectedYard) {
                if (to.path == "/yards") navigateTo("/horses");
            }

            // have not selected a yard
            if (!hasSelectedYard) {
                // TODO: use array include to get this down to 1 line
                if (to.path == "/dashboard") navigateTo("/yards");
                if (to.path == "/horses") navigateTo("/yards");
                if (to.path == "/members") navigateTo("/yards");
                if (to.path == "/calendar") navigateTo("/yards");
                if (to.path == "/fields") navigateTo("/yards");
                if (to.path == "/report/rugs") navigateTo("/yards");
                if (to.path == "/report/feeds") navigateTo("/yards");
            }
        }
    }
});
