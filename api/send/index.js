export default async function handler(req, res) {
  try {
    const from = Math.floor(new Date("2024-01-01").getTime() / 1000);
    const to = Math.floor(Date.now() / 1000);

    const response = await fetch(
      `https://iboard.ssi.com.vn/dchart/api/history?symbol=FPT&resolution=D&from=${from}&to=${to}`
    );
    const data = await response.json();

    const closePrices = data.c;
    const lastClose = closePrices[closePrices.length - 1]; // giá đóng cửa mới nhất

    if (!lastClose) {
      throw new Error("Không tìm thấy giá đóng cửa FPT");
    }

    // Gửi telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: `📊 Giá đóng cửa FPT hôm nay: ${lastClose}`
      })
    });

    res.status(200).json({ message: "Đã gửi báo cáo FPT" });
  } catch (err) {
    console.error("❗ Lỗi:", err.message);
    res.status(500).json({ error: `❗ Lỗi khi lấy dữ liệu FPT: ${err.message}` });
  }
}
