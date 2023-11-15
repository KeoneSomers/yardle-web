import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // const supabase = serverSupabaseServiceRole(event);
  console.log(supabase);
  const now = DateTime.utc();

  const { data, error } = await supabase.from("horses").insert({
    name: "Test Horse" + now.day,
    yard_id: 133,
    created_by: "ddc8533d-0773-4211-adaf-74db9b448a02",
    avatar_background: "bg-indigo-500",
  });

  await $fetch("/api/sendEmail", {
    method: "POST",
    body: {
      recipients: ["Keone.somers@outlook.com"],
      subject: error
        ? "Yardle CRON Job Failed"
        : "Yardle CRON Job ran Successfully!",
      text: "This is an update email for your daily cron job within Yardle.",
      html: "",
    },
  });
});
