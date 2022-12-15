export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    // TODO: middleware overhaul. splip out into multiple files and then define each middleware on each page

    if (to.path != `/join/${to.params.invite_code}`) {
        // variables
        const isLoggedIn = user.value != null;
        const isLoggedOut = user.value == null;
        const hasSelectedYard =
            user.value != null &&
            user.value.user_metadata.selected_yard != null;

        const nonProtectedPages = ["/", "/login", "/signup"];

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
                    const yardProtectedPages = [
                        "/dashboard",
                        "/horses",
                        "/members",
                        "/calendar",
                        "/fields",
                        "/report/rugs",
                        "/report/feeds",
                    ];

                    if (yardProtectedPages.includes(to.path))
                        navigateTo("/yards");
                }
            }
        }
    }
});
