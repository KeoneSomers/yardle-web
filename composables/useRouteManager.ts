export function useRouteManager() {
    const route = useRoute();
    const user = useSupabaseUser();
    const selectedYard = useState("selectedYard");

    // const requireAuth = route.meta.requireAuth === true;
    // const requireNoAuth = route.meta.requireNoAuth === true;
    // const requireYard = route.meta.requireYard === true;
    // const requireNoYard = route.meta.requireNoYard === true;

    watchEffect(async () => {
        const requireAuth = route.meta.guards.includes("requireAuth");
        const requireNoAuth = route.meta.guards.includes("requireNoAuth");
        const requireYard = route.meta.guards.includes("requireYard");
        const requireNoYard = route.meta.guards.includes("requireNoYard");

        if (user.value) {
            if (requireNoAuth) {
                if (selectedYard.value) {
                    navigateTo("/horses");
                } else {
                    navigateTo("/yards");
                }
            }
            if (requireYard) {
                if (!selectedYard.value) {
                    navigateTo("/yards");
                }
            }
            if (requireNoYard) {
                if (selectedYard.value) {
                    navigateTo("/horses");
                }
            }
        } else {
            if (requireAuth) {
                navigateTo("/");
            }
        }
    });
}
