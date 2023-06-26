import { Resend } from "resend";

// Endpoint for sending emails with Resend.com

export default defineEventHandler(async (event) => {
  const { resendApiKey } = useRuntimeConfig();
  const resend = new Resend(resendApiKey);

  // props
  const { recipients, subject, html, text } = await readBody(event);

  await resend.emails.send({
    from: "info@yardle.app",
    to: recipients,
    subject: subject,
    html: html,
    text: text,
  });

  return {
    statusCode: 200,
  };
});
