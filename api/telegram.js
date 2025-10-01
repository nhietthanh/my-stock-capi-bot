// pages/api/stock-analysis.js
import { analyzeStock } from "./send/analyzeStock";
import axios from "axios";

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  const symbol = (req.query.symbol || req.body.symbol || "FPT").toUpperCase();

  try {
    const message = await analyzeStock(symbol);

    // Gửi Telegram
    if (BOT_TOKEN && CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      });
    }

    return res.status(200).json({ ok: true, symbol, message });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
