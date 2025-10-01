import analyzeStock from "./analyzeStock.js";
import axios from "axios";

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  try {
    const message = await analyzeStock("FPT");

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });

    return res.status(200).json({ ok: true, message });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
