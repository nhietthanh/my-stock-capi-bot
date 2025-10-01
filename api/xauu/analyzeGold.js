import axios from "axios";
import { RSI, MACD, StochasticRSI } from "technicalindicators";

const GOLD_API_KEY = process.env.GOLD_API_KEY;

export async function analyzeGold() {
  const url = `https://www.goldapi.io/api/XAU/USD/history?period=1d&format=json&length=330`;

  const resp = await axios.get(url, {
    headers: {
      "x-access-token": GOLD_API_KEY,
    },
    timeout: 15000,
  });

  const data = resp.data;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Không có dữ liệu từ GoldAPI");
  }

  const closes = data.map((d) => Number(d.close));
  const volumes = data.map((d) => Number(d.volume || 0));

  if (closes.length < 20) {
    throw new Error("Không đủ dữ liệu để tính chỉ báo (ít hơn 20 phiên).");
  }

  // RSI
  const rsiArr = RSI.calculate({ values: closes, period: 14 });
  const rsi = rsiArr[rsiArr.length - 1];

  // MACD
  const macdArr = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const macdLast = macdArr[macdArr.length - 1];

  // Stochastic RSI
  const stochArr = StochasticRSI.calculate({
    values: closes,
    rsiPeriod: 14,
    stochasticPeriod: 14,
    kPeriod: 3,
    dPeriod: 3,
  });
  const stochLast = stochArr[stochArr.length - 1];

  // Giá
  const lastClose = closes.at(-1);
  const prevClose = closes.at(-2);
  const changePercent = ((lastClose - prevClose) / prevClose) * 100;

  // Nhận định
  const rsiComment =
    rsi > 70 ? "→ Quá mua, dễ điều chỉnh" :
    rsi < 30 ? "→ Quá bán, có thể hồi" :
    "→ Trung lập";

  const macdComment =
    macdLast.MACD > macdLast.signal ? "→ Tín hiệu tăng" : "→ Tín hiệu giảm";

  const stochComment =
    stochLast.k < 20 && stochLast.d < 20 ? "→ Quá bán" :
    stochLast.k > 80 && stochLast.d > 80 ? "→ Quá mua" :
    "→ Trung lập";

  const message = `📊 Phân tích kỹ thuật Vàng XAU/USD

- Giá đóng cửa: ${lastClose.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)
- RSI(14): ${rsi.toFixed(1)} ${rsiComment}
- MACD: ${macdLast.MACD.toFixed(2)} vs Signal ${macdLast.signal.toFixed(2)} ${macdComment}
- Stoch RSI: K=${stochLast.k.toFixed(2)}, D=${stochLast.d.toFixed(2)} ${stochComment}

⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
`;

  return message;
}
