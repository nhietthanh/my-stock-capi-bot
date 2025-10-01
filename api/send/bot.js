// bot.js
import TelegramBot from "node-telegram-bot-api";
import { analyzeStock } from "./analyzeStock";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/stock (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1].toUpperCase();

  try {
    const message = await analyzeStock(symbol);
    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    bot.sendMessage(chatId, `Không lấy được dữ liệu cho ${symbol}`);
  }
});
