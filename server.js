require('dotenv').config();
const WhatsAppBot = require('./src/bot/whatsapp-bot');
const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = ['auth_info_baileys', 'logs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
async function startApp() {
    try {
        console.log('🚀 Starting WiFi Installation Chatbot...');
        const bot = new WhatsAppBot();
        await bot.start();
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

startApp();