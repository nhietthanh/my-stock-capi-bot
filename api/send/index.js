// api/analysis.js
import axios from "axios";
import { RSI, MACD, StochasticRSI } from "technicalindicators";

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Missing BOT_TOKEN or CHAT_ID env vars" });
  }

  try {
    // Lấy query params
    const { symbol = "FPT", window = 330, chart = "false" } = req.query;

    const to = Math.floor(Date.now() / 1000);
    const from = to - 365 * 24 * 60 * 60; // 1 năm trước

    const url = `https://chart-api.mbs.com.vn/pbRltCharts/chart/v2/history?symbol=${symbol}&resolution=1D&from=${from}&to=${to}&countback=${window}`;

    const resp = await axios.get(url, { timeout: 15000 });
    const data = resp.data;

    if (!data || data.s !== "ok" || !Array.isArray(data.c) || data.c.length === 0) {
      throw new Error("Dữ liệu không hợp lệ từ MBS API");
    }

    // Chuẩn hoá
    const closes = data.c.map(Number);
    const volumes = Array.isArray(data.v) ? data.v.map(Number) : [];

    if (closes.length < 20) throw new Error("Không đủ dữ liệu");

    // Tính chỉ báo
    const rsi = RSI.calculate({ values: closes, period: 14 }).slice(-1)[0];
    const macdLast = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    }).slice(-1)[0];
    const stochLast = StochasticRSI.calculate({
      values: closes,
      rsiPeriod: 14,
      stochasticPeriod: 14,
      kPeriod: 3,
      dPeriod: 3,
    }).slice(-1)[0];

    const lastClose = closes.at(-1);
    const prevClose = closes.at(-2);
    const changePercent = ((lastClose - prevClose) / prevClose) * 100;
    const lastVolume = volumes.at(-1);
    const avgVolume20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

    // Comment ngắn
    const rsiComment =
      rsi > 70 ? "→ quá mua" : rsi < 30 ? "→ quá bán" : "→ trung lập";
    const macdComment = macdLast.MACD > macdLast.signal ? "→ tín hiệu tăng" : "→ tín hiệu giảm";
    const stochComment =
      stochLast.k < 20 && stochLast.d < 20
        ? "→ quá bán"
        : stochLast.k > 80 && stochLast.d > 80
        ? "→ quá mua"
        : "→ trung lập";

    const chartLink =
      chart === "true"
        ? `📈 Xem chart: https://vn.tradingview.com/chart/?symbol=HOSE:${symbol}`
        : "";

    // Tạo báo cáo
    const message = `📊 Phân tích kỹ thuật ${symbol}

- Giá đóng cửa: ${lastClose.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)
- Khối lượng: ${(lastVolume / 1_000_000).toFixed(2)}M (TB20: ${(avgVolume20 / 1_000_000).toFixed(2)}M)

🔎 Chỉ báo:
- RSI(14): ${rsi.toFixed(1)} ${rsiComment}
- MACD: ${macdLast.MACD.toFixed(2)} vs Signal ${macdLast.signal.toFixed(2)} ${macdComment}
- Stochastic RSI: K=${stochLast.k.toFixed(2)}, D=${stochLast.d.toFixed(2)} ${stochComment}

⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
${chartLink}`;

    // Gửi sang Telegram
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });

    res.status(200).json({ ok: true, messageSent: message });
  } catch (err) {
    console.error("❗ Error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
