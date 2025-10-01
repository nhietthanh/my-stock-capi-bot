import axios from "axios";
import { analyzeGold } from "./analyzeGold.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendMessage(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN hoặc CHAT_ID chưa set trong env");
    return;
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text,
    parse_mode: "Markdown",
  });
}

export default async function handler(req, res) {
  try {
    const { signal, message, lastClose, prevClose, changePercent } =
      await analyzeGold();

    if (signal === "BUY" || signal === "SELL") {
      await sendMessage(message);
    } else {
      console.log("⏸ Không có tín hiệu rõ ràng → không gửi Telegram.");
    }

    res.status(200).json({
      ok: true,
      signal,
      lastClose,
      prevClose,
      changePercent,
    });
  } catch (err) {
    console.error("cron handler error:", err?.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
}
