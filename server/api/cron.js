const handler = async (req, res) => {
  // send email reminders
  await $fetch("/api/sendEventEmailReminders", {
    method: "POST",
  });

  // TODO: generate invoices

  res.end("Cron Job ran successfully!");
};

export default handler;
