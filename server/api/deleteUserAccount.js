import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  const { userId } = await readBody(event);

  const { data, error } = await client.auth.admin.deleteUser(userId);

  if (!error) {
    return {
      result: "success",
    };
  } else {
    console.log(error);
    return {
      result: "error",
    };
  }
});
