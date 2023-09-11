export default defineNuxtRouteMiddleware(async (to, from) => {
  // console.log("Running the 'Require Yard Owner' Middleware!");
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const selectedYardId = useState<number | undefined>("selectedYard", () => 0);
  const role = ref(4);

  const getYard = async () => {
    if (user.value) {
      const { data } = await supabase
        .from("profiles")
        .select("selected_yard, active_role")
        .eq("id", user.value?.id)
        .single();

      if (data && data.active_role) {
        role.value = data.active_role;
        return data.selected_yard;
      } else {
        return 0;
      }
    }
  };

  selectedYardId.value = await getYard();

  console.log("here owner middleware");
  console.log(selectedYardId.value);
  console.log(role.value);

  await getYard();

  // if the user is not the owner of that yard - abort the navigation
  if (role.value !== 1) {
    return abortNavigation();
  }
});
