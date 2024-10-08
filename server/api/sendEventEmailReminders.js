import { serverSupabaseServiceRole } from "#supabase/server";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  // email keone to notify him this is running
  await $fetch("/api/sendEmail", {
    method: "POST",
    body: {
      recipients: ["Keone.somers@outlook.com"],
      subject: "Yardle - Sending Event Reminders!",
      text: "This is an update email for your daily cron job within Yardle.",
      html: "",
    },
  });

  const supabase = serverSupabaseServiceRole(event);

  // get events that are happening tomorrow
  const tomorrow = DateTime.now().plus({ days: 1 });
  const { data: events, error: eventsError } = await supabase
    .from("calendar_events")
    .select(
      "*, created_by!inner(id, first_name, last_name, email, calendar_event_reminder_emails), type(type), yard_id(name)"
    )
    .gte(
      "date_time",
      tomorrow.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
    .lte(
      "date_time",
      tomorrow
        .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
        .toISO()
    )
    .eq("created_by.calendar_event_reminder_emails", true);

  if (!events || events.length === 0 || eventsError) {
    return;
  }

  // group the events by user
  const eventsGroupedByCreatedBy = events.reduce((acc, cur) => {
    const createdById = cur.created_by.id;
    acc[createdById] = acc[createdById] || [];
    acc[createdById].push(cur);
    return acc;
  }, {});

  // BONUS TODO: get the horses that are involved in the event

  // foreach user send an email containing all the events they have tomorrow
  for (const userId in eventsGroupedByCreatedBy) {
    const usersEvents = eventsGroupedByCreatedBy[userId];
    const user = usersEvents[0].created_by;

    let eventList = usersEvents
      .map(
        (event) =>
          `<li>${event.title} at ${event.yard_id.name} - ${
            event.all_day
              ? "All Day"
              : "Starting at " + DateTime.fromISO(event.date_time).toFormat("t")
          }</li>`
      )
      .join("");

    let emailMessage = `
     <p>Hey ${user.first_name},</p>
     <p>You have ${usersEvents.length} event${
       usersEvents.length === 1 ? "" : "s"
     } scheduled for tomorrow:</p><ul>${eventList}</ul>
      <br>
      <p>More details regarding ${
        usersEvents.length === 1 ? "this event" : "these events"
      } are available to view on yardle.app</p>
      <br/>
      <small>To unsubscribe from these types of emails, please visit yardle.app/auth/accountSettings</small>
     `;

    // send email
    await $fetch("/api/sendEmail", {
      method: "POST",
      body: {
        recipients: [user.email],
        subject: `${usersEvents.length} upcoming event${
          usersEvents.length === 1 ? "" : "s"
        }`,
        text: ``,
        html: emailMessage,
      },
    });
  }

  return { result: "ok" };
});
