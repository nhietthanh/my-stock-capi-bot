export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  const text = "⏰ Bot báo cáo định kỳ từ cron-job.org!";

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
    }),
  });

  if (!response.ok) {
    return res.status(500).json({ error: "Failed to send message" });
  }

  return res.status(200).json({ success: true });
}
