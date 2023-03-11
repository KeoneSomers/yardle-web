// const handler = async (req, res) => {
//   // send email reminders
//   await $fetch("/api/sendEventEmailReminders", {
//     method: "POST",
//   });

//   // TODO: generate invoices

//   res.end("Cron Job ran successfully!");
// };

// export default handler;

export default defineEventHandler(async () => {
  // send email reminders
  console.log("Sending calendar event email reminders...");
  await $fetch("/api/sendEventEmailReminders", {
    method: "POST",
  });
  console.log("Done");

  // TODO: generate invoices

  return "Cron Job ran successfully!";
});
