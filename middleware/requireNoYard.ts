export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("Running the 'Require No Yard' Middleware!");
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

  // if user has a yard selected - send them to the horses page of that yard
  if (selectedYardId.value && selectedYardId.value > 0) {
    return navigateTo("/yard/horses");
  }
});
