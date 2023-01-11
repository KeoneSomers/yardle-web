export function useRouteManager() {
    const router = useRouter();
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
            let to = router.currentRoute.value;

            if (
                to.path != `/join/${to.params.invite_code}` &&
                to.path != "/resetpassword"
            ) {
                // visiter is trying to access NON-AUTH pages
                if (nonProtectedPages.includes(to.path)) {
                    if (user.value) {
                        if (selectedYard.value) {
                            navigateTo("/horses");
                        } else {
                            navigateTo("/yards");
                        }
                    }
                }
                // visiter is trying to access AUTH pages
                if (!nonProtectedPages.includes(to.path)) {
                    if (!user.value) navigateTo("/");
                    if (user.value) {
                        // already have selected yard
                        if (selectedYard.value) {
                            if (to.path == "/yards") navigateTo("/horses");
                        }
                        // have not selected a yard
                        if (!selectedYard.value) {
                            if (yardProtectedPages.includes(to.path))
                                navigateTo("/yards");
                        }
                    }
                }
            }
        });
    });
}
