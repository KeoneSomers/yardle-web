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
  console.log("Reminders Done!");

  // generate invoices
  // console.log("Generating invoices...");
  // await $fetch("/api/generateInvoces", {
  //   method: "POST",
  // });
  // console.log("Invoices Done!");

  return "Cron Job ran successfully!";
});
