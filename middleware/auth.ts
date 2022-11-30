export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser();

    const client = useSupabaseAuthClient();
    const { data, error } = await client.auth.getSession();

    console.log("session is: ");
    console.log(data.session);

    if (to.path != "/login" && to.path != "/signup") {
        // trying to access a protected page
        // - must be logged in
        if (!data.session) {
            return navigateTo("/login");
        }
    } else if (to.path == "/login" || to.path == "/signup") {
        // trying to access login or signup page
        // - must be logged out
        if (data.session) {
            return navigateTo("/");
        }
    }
});
