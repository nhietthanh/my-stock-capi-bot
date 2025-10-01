import axios from "axios";

const API_KEY = process.env.GOLD_API_KEY;

export async function analyzeGold() {
  const url = "https://www.goldapi.io/api/XAU/USD";
  const resp = await axios.get(url, {
    headers: { "x-access-token": API_KEY },
    timeout: 10000,
  });

  const data = resp.data;

  if (!data || !data.price || !data.prev_close_price) {
    throw new Error("Không lấy được dữ liệu từ GoldAPI");
  }

  const lastClose = Number(data.price);
  const prevClose = Number(data.prev_close_price);
  const changePercent = ((lastClose - prevClose) / prevClose) * 100;

  // Logic BUY/SELL đơn giản
  let signal = "NEUTRAL";
  if (changePercent > 1) signal = "BUY";
  else if (changePercent < -1) signal = "SELL";

  // Format message
  const message = `📊 *Giá vàng XAU/USD*\n
- Giá hiện tại: ${lastClose} USD
- Giá hôm qua: ${prevClose} USD
- Biến động: ${changePercent.toFixed(2)}%
- Tín hiệu: *${signal}*

⏰ ${new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  })}`;

  return { lastClose, prevClose, changePercent, signal, message };
}
