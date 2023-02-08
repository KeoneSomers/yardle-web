// Due to Vercel serverless function crashing - i've decided to disable the middleware at this time

export default defineNuxtRouteMiddleware(async (to) => {
  // const user = useSupabaseUser();
  // const client = useSupabaseClient();
  // const selectedYard = useState("selectedYard");
  // // on cold page load - get the users selected yard directly from the db since it will be undefined in the store at this point.
  // if (user.value && !selectedYard.value) {
  //     const { data } = await client
  //         .from("profiles")
  //         .select("selected_yard")
  //         .eq("id", user.value?.id)
  //         .single();
  //     if (data) {
  //         selectedYard.value = data.selected_yard;
  //     }
  // }
  // // TODO: middleware overhaul. split-out into multiple files and then define each middleware on each page
  // if (
  //     to.path != `/join/${to.params.invite_code}` &&
  //     to.path != "/resetpassword"
  // ) {
  //     // variables
  //     const hasSelectedYard = selectedYard.value;
  //     const nonProtectedPages = ["/", "/login", "/signup"];
  //     // visiter is trying to access NON-AUTH pages
  //     if (nonProtectedPages.includes(to.path)) {
  //         if (user.value) {
  //             if (hasSelectedYard) {
  //                 navigateTo("/horses");
  //             } else {
  //                 navigateTo("/yards");
  //             }
  //         }
  //     }
  //     // visiter is trying to access AUTH pages
  //     if (!nonProtectedPages.includes(to.path)) {
  //         if (!user.value) navigateTo("/");
  //         if (user.value) {
  //             // already have selected yard
  //             if (hasSelectedYard) {
  //                 if (to.path == "/yards") navigateTo("/horses");
  //             }
  //             // have not selected a yard
  //             if (!hasSelectedYard) {
  //                 const yardProtectedPages = [
  //                     "/dashboard",
  //                     "/horses",
  //                     "/members",
  //                     "/yard/calendar",
  //                     "/fields",
  //                     "/yard/rugs",
  //                     "/yard/feeds",
  //                 ];
  //                 if (yardProtectedPages.includes(to.path))
  //                     navigateTo("/yards");
  //             }
  //         }
  //     }
  // }
});
