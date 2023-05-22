// export default defineNuxtRouteMiddleware(async (to, _from) => {
//   const supabase = useSupabaseClient();
//   const user = useSupabaseUser();
//   const selectedYardId = useState<number | undefined>("selectedYard", () => 0);
//   const isFirstLoad = useState<boolean>("firstLoad", () => true);
//   const role = ref(4);

//   const getYard = async () => {
//     if (user.value) {
//       const { data } = await supabase
//         .from("profiles")
//         .select("selected_yard, active_role")
//         .eq("id", user.value?.id)
//         .single();

//       if (data && data.active_role) {
//         role.value = data.active_role;
//         return data.selected_yard;
//       } else {
//         return 0;
//       }
//     }
//   };

//   // only run this once on first load on the server
//   if (isFirstLoad.value === true) {
//     selectedYardId.value = await getYard();
//     isFirstLoad.value = false;
//   }

//   const _guards = to.meta.guards as string[];
//   const guards = {
//     requireAuth: _guards ? _guards.includes("requireAuth") : false,
//     requireNoAuth: _guards ? _guards.includes("requireNoAuth") : false,
//     requireYard: _guards ? _guards.includes("requireYard") : false,
//     requireNoYard: _guards ? _guards.includes("requireNoYard") : false,
//   };

//   // Logged out
//   if (!user.value) {
//     console.log("User logged out, Redirecting to login page");
//     if (guards.requireAuth) return navigateTo("/auth/login");
//   }

//   // TODO: this if statement is a hack, need to find a better way to do this (just for yard settings and invoices pages)
//   if (
//     to.path === "/yard/settings" ||
//     to.path === "/yard/invoices" ||
//     to.path === "/yard/dashboard" ||
//     to.path.includes("/yard/servicerequests")
//   ) {
//     if (!user.value || !selectedYardId.value || selectedYardId.value === 0) {
//       return abortNavigation();
//     }
//     await getYard();
//     if (role.value !== 1) {
//       return abortNavigation();
//     }
//   }
//   // end of hack

//   // Logged in
//   if (user.value) {
//     if (guards.requireNoAuth) {
//       console.log(
//         "User logged in but trying to access an NoAuth page, Redirecting to yards page"
//       );
//       return navigateTo("/yards");
//     }

//     // ...without a yard
//     if (!selectedYardId.value || selectedYardId.value === 0) {
//       console.log("User logged in without a yard, Redirecting to yards page");
//       if (guards.requireYard) return navigateTo("/yards");
//     }

//     // ...with a yard
//     if (selectedYardId.value && selectedYardId.value > 0) {
//       if (guards.requireNoYard && to.path !== "/yard/horses") {
//         console.log("User logged in with a yard, Redirecting to horses page");
//         return navigateTo("/yard/horses");
//       }
//     }
//   }
// });

export default defineNuxtRouteMiddleware((to, _from) => {
  // const user = useSupabaseUser();
  // if (!user.value) {
  //   // return navigateTo("/login");
  // }
});
