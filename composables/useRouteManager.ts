export function useRouteManager() {
    const route = useRoute();
    const user = useSupabaseUser();
    const selectedYard = useState("selectedYard");

    const requireAuth = route.meta.requireAuth === true;
    const requireNoAuth = route.meta.requireNoAuth === true;
    const requireYard = route.meta.requireYard === true;
    const requireNoYard = route.meta.requireNoYard === true;

    onMounted(async () => {
        watchEffect(async () => {
            if (requireAuth && !user.value) {
                navigateTo("/");
            }
            if (requireNoAuth && user.value) {
                navigateTo("/");
            }
            if (requireNoAuth && user.value && selectedYard.value) {
                navigateTo("/horses");
            }
            if (requireNoAuth && user.value && !selectedYard.value) {
                navigateTo("/yards");
            }
            if (requireYard && user.value && !selectedYard.value) {
                navigateTo("/yards");
            }
            if (requireNoYard && user.value && selectedYard.value) {
                navigateTo("/horses");
            }
        });
    });
}
