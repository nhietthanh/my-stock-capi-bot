// api/fpt-history.js
export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  try {
    // Lấy thời gian hiện tại (Unix timestamp giây)
    const to = Math.floor(Date.now() / 1000);
    const from = to - 365 * 24 * 60 * 60; // 1 năm trước
    const countback = 330;

    const url = `https://chart-api.mbs.com.vn/pbRltCharts/chart/v2/history?symbol=FPT&resolution=1D&from=${from}&to=${to}&countback=${countback}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (!data || data.s !== "ok" || !Array.isArray(data.c) || data.c.length === 0) {
      throw new Error("Dữ liệu không hợp lệ từ MBS API");
    }

    const closeArr = data.c;
    const lastClose = closeArr[closeArr.length - 1];

    const nowVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const message = `📊 Báo cáo cuối phiên FPT  
Giá đóng cửa: ${lastClose}  
⏰ ${nowVN}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    return res.status(200).json({ ok: true, lastClose, message });
  } catch (err) {
    console.error("❗ Lỗi khi lấy từ MBS API:", err.message || err);
    return res.status(500).json({
      error: `❗ Lỗi khi lấy dữ liệu FPT: ${err.message || "unknown"}`
    });
  }
}
