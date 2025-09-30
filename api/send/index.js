import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(text) {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text,
    parse_mode: "Markdown",
  });
}

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split("T")[0]; // ví dụ "2025-09-30"
    const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:FPT~date:gte:${today}~date:lte:${today}&size=1`;
    const resp = await axios.get(url, { timeout: 5000 });
    const d = resp.data;
    if (d && Array.isArray(d.data) && d.data.length > 0) {
      const st = d.data[0];
      const closePrice = st.closePrice ?? st.close_price ?? st.close ?? "N/A";
      const msg = `📈 Báo cáo cuối phiên FPT  
Giá đóng cửa: ${closePrice}  
⏰ ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`;
      await sendTelegram(msg);
      res.status(200).json({ ok: true, message: msg });
    } else {
      await sendTelegram(`⚠️ Không có dữ liệu FPT cho ngày ${today}`);
      res.status(404).json({ ok: false, error: "No data" });
    }
  } catch (err) {
    console.error("Error:", err.message || err);
    await sendTelegram(`❗ Lỗi khi lấy dữ liệu FPT: ${err.message ?? 'unknown'}`);
    res.status(500).json({ error: err.message });
  }
}
