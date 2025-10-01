// lib/analyzeStock.js
import axios from "axios";
import { RSI, MACD, StochasticRSI } from "technicalindicators";

export async function analyzeStock(symbol = "FPT") {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 365 * 24 * 60 * 60; // 1 năm trước
  const countback = 330;

  const url = `https://chart-api.mbs.com.vn/pbRltCharts/chart/v2/history?symbol=${symbol}&resolution=1D&from=${from}&to=${to}&countback=${countback}`;

  const resp = await axios.get(url, { timeout: 15000 });
  const data = resp.data;

  if (!data || data.s !== "ok" || !Array.isArray(data.c) || data.c.length === 0) {
    throw new Error("Dữ liệu không hợp lệ từ MBS API");
  }

  const closes = data.c.map(Number).filter((n) => !Number.isNaN(n));
  const volumes = Array.isArray(data.v) ? data.v.map(Number) : [];

  if (closes.length < 20) {
    throw new Error("Không đủ dữ liệu để tính chỉ báo (ít hơn 20 phiên).");
  }

  // RSI
  const rsiArr = RSI.calculate({ values: closes, period: 14 });
  const rsi = rsiArr.length ? rsiArr[rsiArr.length - 1] : null;

  // MACD
  const macdArr = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const macdLast = macdArr.length ? macdArr[macdArr.length - 1] : null;

  // Stochastic RSI
  const stochArr = StochasticRSI.calculate({
    values: closes,
    rsiPeriod: 14,
    stochasticPeriod: 14,
    kPeriod: 3,
    dPeriod: 3,
  });
  const stochLast = stochArr.length ? stochArr[stochArr.length - 1] : null;

  // Giá & Volume
  const lastClose = closes[closes.length - 1];
  const prevClose = closes.length > 1 ? closes[closes.length - 2] : lastClose;
  const changePercent = prevClose ? ((lastClose - prevClose) / prevClose) * 100 : 0;
  const lastVolume = volumes.length ? volumes[volumes.length - 1] : 0;
  const avgVolume20 =
    volumes.length >= 20
      ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
      : volumes.reduce((a, b) => a + b, 0) / Math.max(1, volumes.length);

  // Nhận định
  const rsiComment =
    rsi === null
      ? "N/A"
      : rsi > 70
      ? "→ vùng quá mua, rủi ro điều chỉnh"
      : rsi < 30
      ? "→ vùng quá bán, có thể hồi phục"
      : "→ vùng trung lập";

  const macdComment =
    macdLast === null
      ? "N/A"
      : macdLast.MACD > macdLast.signal
      ? "→ tín hiệu tăng"
      : "→ tín hiệu giảm";

  const stochComment =
    stochLast === null
      ? "N/A"
      : stochLast.k < 20 && stochLast.d < 20
      ? "→ vùng quá bán, có thể hồi kỹ thuật"
      : stochLast.k > 80 && stochLast.d > 80
      ? "→ vùng quá mua, dễ điều chỉnh"
      : "→ trung lập";

  const trendSentence =
    macdLast === null
      ? "không đủ dữ liệu để đánh giá xu hướng"
      : macdLast.MACD > macdLast.signal
      ? "có tín hiệu hồi phục"
      : "chịu áp lực bán";

  const shortForecast =
    (rsi !== null && rsi < 35) || (stochLast && stochLast.k < 20 && stochLast.d < 20)
      ? "Khả năng hồi kỹ thuật trong ngắn hạn."
      : macdLast && macdLast.MACD < macdLast.signal
      ? "Rủi ro kiểm định lại hỗ trợ."
      : "Tiếp tục quan sát.";

  // Format message
  const message = `📊 Phân tích kỹ thuật ${symbol}

- Giá đóng cửa: ${lastClose.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)
- Khối lượng: ${(lastVolume / 1_000_000).toFixed(2)}M (TB20: ${(avgVolume20 / 1_000_000).toFixed(2)}M)

🔎 Chỉ báo:
- RSI(14): ${rsi !== null ? rsi.toFixed(1) : "N/A"} ${rsiComment}
- MACD: ${macdLast ? macdLast.MACD.toFixed(2) : "N/A"} vs Signal ${
    macdLast ? macdLast.signal.toFixed(2) : "N/A"
  } ${macdComment}
- Stochastic RSI: K=${stochLast ? stochLast.k.toFixed(2) : "N/A"}, D=${
    stochLast ? stochLast.d.toFixed(2) : "N/A"
  } ${stochComment}

📈 Xu hướng:
${symbol} đang ${trendSentence}. ${shortForecast}

⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`;

  return message;
}
