export function useRouteManager() {
  const user = useSupabaseUser();
  const authClient = useSupabaseAuthClient();
  const sidebarOpen = useState("sidebarOpen");

  authClient.auth.onAuthStateChange((event, session) => {
    if (!session) {
      user.value = null;
    }
  });

  const route = useRoute();
  const selectedYard = useState("selectedYard");
  // invite code if there is one (could also be undefined or null)

  watchEffect(async () => {
    sidebarOpen.value = false;

    const { invite_code } = route.query;
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
      if (invite_code) {
        navigateTo("/join/" + invite_code);
        return;
      }

      if (selectedYard.value) {
        navigateTo("/yard/horses");
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
        navigateTo("/yard/horses");
      }
      return;
    }
  });
}
