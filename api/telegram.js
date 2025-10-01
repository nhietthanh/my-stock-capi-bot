// pages/api/telegram.js
import analyzeStock from "./send/analyzeStock.js";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true }); // Telegram cần trả về 200 nhanh
  }

  try {
    const body = req.body;

    if (!body.message || !body.message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    if (text.startsWith("/stock")) {
      const parts = text.split(" ");
      const symbol = (parts[1] || "FPT").toUpperCase();

      const message = await analyzeStock(symbol);

      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      });
    } else {
      // Nếu không phải lệnh /stock thì chỉ gửi phản hồi đơn giản
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "Xin chào! Gõ /stock <MÃ> để xem phân tích chứng khoán.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Telegram webhook error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
