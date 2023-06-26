import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const { resendApiKey } = useRuntimeConfig();
  const resend = new Resend(resendApiKey);
  const { recipients, subject, html, text } = await readBody(event);

  await resend.emails.send({
    from: "updates@yardle.app",
    to: recipients,
    subject: subject,
    html: html,
    text: text,
  });

  return {
    statusCode: 200,
  };
});
