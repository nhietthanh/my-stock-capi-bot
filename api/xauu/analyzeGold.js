import axios from "axios";
import { RSI, MACD, StochasticRSI } from "technicalindicators";

const API_KEY = process.env.GOLD_API_KEY;

export async function analyzeGold() {
  // 👉 gọi API history (nếu plan support)
  const url = "https://www.goldapi.io/api/XAU/USD/history?period=1d&length=200";
  const resp = await axios.get(url, {
    headers: { "x-access-token": API_KEY },
    timeout: 10000,
  });

  const data = resp.data;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Không có dữ liệu history từ GoldAPI (cần plan trả phí).");
  }

  // lấy danh sách giá đóng cửa
  const closes = data.map((item) => Number(item.price_close)).filter(Boolean);

  if (closes.length < 30) {
    throw new Error("Không đủ dữ liệu để tính chỉ báo (cần >=30 phiên).");
  }

  // RSI
  const rsiArr = RSI.calculate({ values: closes, period: 14 });
  const rsi = rsiArr.at(-1);

  // MACD
  const macdArr = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const macdLast = macdArr.at(-1);

  // Stochastic RSI
  const stochArr = StochasticRSI.calculate({
    values: closes,
    rsiPeriod: 14,
    stochasticPeriod: 14,
    kPeriod: 3,
    dPeriod: 3,
  });
  const stochLast = stochArr.at(-1);

  // Giá
  const lastClose = closes.at(-1);
  const prevClose = closes.at(-2);
  const changePercent = ((lastClose - prevClose) / prevClose) * 100;

  // Nhận định
  const rsiComment =
    rsi > 70 ? "→ quá mua" : rsi < 30 ? "→ quá bán" : "→ trung lập";
  const macdComment =
    macdLast.MACD > macdLast.signal ? "→ tín hiệu tăng" : "→ tín hiệu giảm";
  const stochComment =
    stochLast.k > 80 && stochLast.d > 80
      ? "→ quá mua"
      : stochLast.k < 20 && stochLast.d < 20
      ? "→ quá bán"
      : "→ trung lập";

  const trend =
    macdLast.MACD > macdLast.signal
      ? "có tín hiệu hồi phục"
      : "chịu áp lực bán";

  const shortForecast =
    rsi < 35 || (stochLast.k < 20 && stochLast.d < 20)
      ? "Khả năng hồi kỹ thuật ngắn hạn."
      : macdLast.MACD < macdLast.signal
      ? "Rủi ro kiểm định hỗ trợ."
      : "Tiếp tục quan sát.";

  // format message
  const message = `📊 Phân tích kỹ thuật XAU/USD

- Giá đóng cửa: ${lastClose.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)

🔎 Chỉ báo:
- RSI(14): ${rsi.toFixed(1)} ${rsiComment}
- MACD: ${macdLast.MACD.toFixed(2)} vs Signal ${macdLast.signal.toFixed(2)} ${macdComment}
- Stoch RSI: K=${stochLast.k.toFixed(2)}, D=${stochLast.d.toFixed(2)} ${stochComment}

📈 Xu hướng:
XAU/USD đang ${trend}. ${shortForecast}

⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`;

  return { rsi, macdLast, stochLast, lastClose, message };
}
