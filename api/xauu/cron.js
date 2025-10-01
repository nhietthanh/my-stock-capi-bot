import { analyzeGold } from "./analyzeGold";
import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
  });
}

export default async function handler(req, res) {
  try {
    const { rsi, macdLast, stochLast, lastClose, message } = await analyzeGold();

    let signal = "NEUTRAL";

    // RULE BUY
    let buyConditions = 0;
    if (rsi < 30) buyConditions++;
    if (stochLast.k < 20 && stochLast.d < 20) buyConditions++;
    if (macdLast.MACD > macdLast.signal) buyConditions++;
    if (buyConditions >= 2) signal = "BUY";

    // RULE SELL
    let sellConditions = 0;
    if (rsi > 70) sellConditions++;
    if (stochLast.k > 80 && stochLast.d > 80) sellConditions++;
    if (macdLast.MACD < macdLast.signal) sellConditions++;
    if (sellConditions >= 2) signal = "SELL";

    if (signal === "BUY") {
      await sendMessage(`📈 *Tín hiệu MUA Vàng XAU/USD*\n\n${message}`);
    } else if (signal === "SELL") {
      await sendMessage(`📉 *Tín hiệu BÁN Vàng XAU/USD*\n\n${message}`);
    } else {
      console.log("⏸ Không có tín hiệu rõ ràng.");
    }

    res.status(200).json({ ok: true, signal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
