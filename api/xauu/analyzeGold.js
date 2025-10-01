// lib/analyzeGold.js
import axios from "axios";
import { RSI, MACD, StochasticRSI } from "technicalindicators";

export async function analyzeGold() {
  const API_KEY = process.env.GOLD_API_KEY;
  if (!API_KEY) throw new Error("GOLD_API_KEY chưa được set");

  const historyUrl = `https://www.goldapi.io/api/XAU/USD/history?period=1d&format=json&length=330`;

  // Try history first, if fails -> fallback realtime
  try {
    const resp = await axios.get(historyUrl, {
      headers: { "x-access-token": API_KEY },
      timeout: 20000,
    });
    const data = resp.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("history-empty");
    }

    const closes = data.map((d) => Number(d.close)).filter((n) => Number.isFinite(n));
    const volumes = data.map((d) => Number(d.volume || 0)).map((v) => Number.isFinite(v) ? v : 0);

    if (closes.length < 30) {
      throw new Error("not-enough-history");
    }

    // compute indicators
    const rsiArr = RSI.calculate({ values: closes, period: 14 });
    const rsi = rsiArr.length ? rsiArr[rsiArr.length - 1] : null;

    const macdArr = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const macdLast = macdArr.length ? macdArr[macdArr.length - 1] : null;

    const stochArr = StochasticRSI.calculate({
      values: closes,
      rsiPeriod: 14,
      stochasticPeriod: 14,
      kPeriod: 3,
      dPeriod: 3,
    });
    const stochLast = stochArr.length ? stochArr[stochArr.length - 1] : null;

    const lastClose = closes[closes.length - 1];
    const prevClose = closes.length > 1 ? closes[closes.length - 2] : lastClose;
    const changePercent = prevClose ? ((lastClose - prevClose) / prevClose) * 100 : 0;
    const lastVolume = volumes.length ? volumes[volumes.length - 1] : 0;
    const avgVolume20 =
      volumes.length >= 20
        ? volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
        : volumes.length
        ? volumes.reduce((a, b) => a + b, 0) / volumes.length
        : 0;

    const rsiComment =
      rsi === null ? "N/A" : rsi > 70 ? "→ Quá mua, dễ điều chỉnh" : rsi < 30 ? "→ Quá bán, có thể hồi" : "→ Trung lập";
    const macdComment = macdLast === null ? "N/A" : macdLast.MACD > macdLast.signal ? "→ Tín hiệu tăng" : "→ Tín hiệu giảm";
    const stochComment =
      stochLast === null
        ? "N/A"
        : stochLast.k < 20 && stochLast.d < 20
        ? "→ Quá bán"
        : stochLast.k > 80 && stochLast.d > 80
        ? "→ Quá mua"
        : "→ Trung lập";

    const trendSentence =
      macdLast === null ? "không đủ dữ liệu để đánh giá xu hướng" : macdLast.MACD > macdLast.signal ? "có tín hiệu hồi phục" : "chịu áp lực bán";

    const shortForecast =
      (rsi !== null && rsi < 35) || (stochLast && stochLast.k < 20 && stochLast.d < 20)
        ? "Khả năng hồi kỹ thuật trong ngắn hạn."
        : macdLast && macdLast.MACD < macdLast.signal
        ? "Rủi ro kiểm định lại hỗ trợ."
        : "Tiếp tục quan sát.";

    const message = `📊 Phân tích kỹ thuật Vàng XAU/USD

- Giá đóng cửa: ${lastClose.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)
- Khối lượng: ${(lastVolume / 1_000_000).toFixed(2)}M (TB20: ${(avgVolume20 / 1_000_000).toFixed(2)}M)

🔎 Chỉ báo:
- RSI(14): ${rsi !== null ? rsi.toFixed(1) : "N/A"} ${rsiComment}
- MACD: ${macdLast ? macdLast.MACD.toFixed(2) : "N/A"} vs Signal ${macdLast ? macdLast.signal.toFixed(2) : "N/A"} ${macdComment}
- Stochastic RSI: K=${stochLast ? stochLast.k.toFixed(2) : "N/A"}, D=${stochLast ? stochLast.d.toFixed(2) : "N/A"} ${stochComment}

📈 Xu hướng:
Vàng đang ${trendSentence}. ${shortForecast}

⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
`;

    console.log("analyzeGold: history OK, candles:", closes.length);
    return { rsi, macdLast, stochLast, lastClose, message, raw: { nCandles: closes.length } };
  } catch (err) {
    // history failed => try realtime as fallback
    console.warn("analyzeGold: history fetch failed:", err?.message || err);
    try {
      const resp2 = await axios.get("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": API_KEY },
        timeout: 15000,
      });
      const lastClose = Number(resp2.data.price);
      if (!Number.isFinite(lastClose)) throw new Error("realtime-no-price");

      const message = `📊 Giá vàng realtime: ${lastClose}\n(Chỉ báo lịch sử không khả dụng với API key hiện tại)`;
      console.log("analyzeGold: realtime OK, price:", lastClose);
      return { rsi: null, macdLast: null, stochLast: null, lastClose, message, raw: { realtime: resp2.data } };
    } catch (err2) {
      // enrich error with responses for easier debugging
      const combined = new Error("analyzeGold: both history & realtime fetch failed");
      combined.details = {
        history: { message: err?.message, status: err?.response?.status, body: err?.response?.data },
        realtime: { message: err2?.message, status: err2?.response?.status, body: err2?.response?.data },
      };
      throw combined;
    }
  }
}
