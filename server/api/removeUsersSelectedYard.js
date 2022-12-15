import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
    // const { supabaseServiceRoleKey } = useRuntimeConfig();

    const client = serverSupabaseServiceRole(event);

    // console.log(process.env.SUPABASE_URL);
    // console.log(supabaseServiceRoleKey);

    const { memberId } = await readBody(event);

    const { data, error: err } = await client.auth.admin.updateUserById(
        memberId,
        {
            user_metadata: { selected_yard: null },
        }
    );

    if (!err) {
        return {
            result: "success",
        };
    } else {
        return {
            result: "error",
        };
    }
});
