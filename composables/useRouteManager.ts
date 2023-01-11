export function useRouteManager() {
    const route = useRoute();
    const user = useSupabaseUser();
    const selectedYard = useState("selectedYard");
    const nonProtectedPages = ["/", "/login", "/signup"];
    const yardProtectedPages = [
        "/dashboard",
        "/horses",
        "/members",
        "/calendar",
        "/fields",
        "/report/rugs",
        "/report/feeds",
    ];

    onMounted(async () => {
        watchEffect(async () => {
            console.log(route.meta.requireNoAuth === true);

            if (
                route.path != `/join/${route.params.invite_code}` &&
                route.path != "/resetpassword"
            ) {
                // visiter is trying route access NON-AUTH pages
                if (nonProtectedPages.includes(route.path)) {
                    if (user.value) {
                        if (selectedYard.value) {
                            navigateTo("/horses");
                        } else {
                            navigateTo("/yards");
                        }
                    }
                }
                // visiter is trying to access AUTH pages
                if (!nonProtectedPages.includes(route.path)) {
                    if (!user.value) navigateTo("/");
                    if (user.value) {
                        // already have selected yard
                        if (selectedYard.value) {
                            if (route.path == "/yards") navigateTo("/horses");
                        }
                        // have not selected a yard
                        if (!selectedYard.value) {
                            if (yardProtectedPages.includes(route.path))
                                navigateTo("/yards");
                        }
                    }
                }
            }
        });
    });
}
