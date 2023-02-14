import { serverSupabaseServiceRole } from "#supabase/server";
import * as _messagebird from "messagebird";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  const { userId } = await readBody(event);

  // const { data, error } = await client.auth.admin.deleteUser(userId);

  var messagebird = _messagebird.initClient("sppjiN03PTljb67QnhuIOCiGC");

  var params = {
    originator: "TestMessage",
    recipients: ["07380136620"],
    body: "This is a test message",
  };

  messagebird.messages.create(params, function (err, response) {
    if (err) {
      console.log(err);
    }
    console.log(response);
  });

  return {
    statusCode: 200,
  };
});
