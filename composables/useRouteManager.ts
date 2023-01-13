export function useRouteManager() {
    const route = useRoute();
    const user = useSupabaseUser();
    const selectedYard = useState("selectedYard");

    watchEffect(async () => {
        const requireAuth = route.meta.guards.includes("requireAuth");
        const requireNoAuth = route.meta.guards.includes("requireNoAuth");
        const requireYard = route.meta.guards.includes("requireYard");
        const requireNoYard = route.meta.guards.includes("requireNoYard");

        // This code first checks if the user is not authenticated, and if they are not and requireAuth is true, it navigates to the homepage and exits the function.
        if (!user.value) {
            if (requireAuth) {
                navigateTo("/");
            }
            return;
        }

        // Then, it checks the value of requireNoAuth. If it's true, it checks if there's a selectedYard and navigates to the appropriate page.
        if (requireNoAuth) {
            if (selectedYard.value) {
                navigateTo("/horses");
            } else {
                navigateTo("/yards");
            }
            return;
        }

        // Then, it checks the value of requireYard. If it's true, it checks if there's no selectedYard and navigates to the appropriate page.
        if (requireYard) {
            if (!selectedYard.value) {
                navigateTo("/yards");
            }
            return;
        }

        // Then, it checks the value of requireNoYard. If it's true, it checks if there's a selectedYard and navigates to the appropriate page.
        if (requireNoYard) {
            if (selectedYard.value) {
                navigateTo("/horses");
            }
            return;
        }

        // Note: By putting the return statements at the end of each of the conditions, it makes the code more readable and easier to understand.
    });
}
