// cron.js  (Next.js API route: pages/api/cron.js hoặc api/cron.js trên Vercel)
import axios from "axios";
import { analyzeGold } from "./analyzeGold.js"; // nếu để ở vị trí khác, chỉnh path tương ứng

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendMessage(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn("TELEGRAM_BOT_TOKEN hoặc CHAT_ID chưa được set");
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
  // accept GET or POST (cron-job.org thường dùng GET)
  try {
    const { rsi, macdLast, stochLast, lastClose, message } = await analyzeGold();

    // safe checks
    const rsiNum = typeof rsi === "number" ? rsi : null;
    const macdOk = macdLast && typeof macdLast.MACD === "number" && typeof macdLast.signal === "number";
    const stochOk = stochLast && typeof stochLast.k === "number" && typeof stochLast.d === "number";

    let signal = "NEUTRAL";

    // BUY rule: >=2/3
    let buyConditions = 0;
    if (rsiNum !== null && rsiNum < 30) buyConditions++;
    if (stochOk && stochLast.k < 20 && stochLast.d < 20) buyConditions++;
    if (macdOk && macdLast.MACD > macdLast.signal) buyConditions++;
    if (buyConditions >= 2) signal = "BUY";

    // SELL rule
    let sellConditions = 0;
    if (rsiNum !== null && rsiNum > 70) sellConditions++;
    if (stochOk && stochLast.k > 80 && stochLast.d > 80) sellConditions++;
    if (macdOk && macdLast.MACD < macdLast.signal) sellConditions++;
    if (sellConditions >= 2) signal = "SELL";

    if (signal === "BUY") {
      await sendMessage(`📈 *Tín hiệu MUA Vàng XAU/USD*\n\n${message}`);
    } else if (signal === "SELL") {
      await sendMessage(`📉 *Tín hiệu BÁN Vàng XAU/USD*\n\n${message}`);
    } else {
      console.log("⏸ Không có tín hiệu rõ ràng — không gửi tin.");
    }

    return res.status(200).json({ ok: true, signal, buyConditions, sellConditions });
  } catch (err) {
    console.error("cron handler error:", err?.message || err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
