import { serverSupabaseServiceRole } from "#supabase/server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// Endpoint for sending emails with MailerSend.com

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const { mailerSendAPIKey } = useRuntimeConfig();

  console.log(mailerSendAPIKey);

  // props
  const { recipients, subject, html, text } = await readBody(event);

  console.log(recipients);

  // logic
  const mailerSend = new MailerSend({
    apiKey: mailerSendAPIKey,
  });

  const sentFrom = new Sender("info@yardle.app", "Yardle");

  const _recipients = [];

  recipients.forEach((recipient) => {
    _recipients.push(new Recipient(recipient.email, recipient.name));
  });

  console.log(_recipients);

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(_recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(html)
    .setText(text);

  await mailerSend.email.send(emailParams);

  return {
    statusCode: 200,
  };
});
