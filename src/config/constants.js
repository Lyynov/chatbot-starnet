// Nomor admin yang akan menerima notifikasi
const ADMIN_NUMBERS = [
    '6281314903003@s.whatsapp.net',
    '6289616932030@s.whatsapp.net',
    '6283111779520@s.whatsapp.net'
];

// Status untuk proses pemasangan
const INSTALLATION_STATUS = {
    WAITING_DATE: 'waiting_date',
    WAITING_NAME: 'waiting_name',
    WAITING_ROUTER_TYPE: 'waiting_router_type',  
    WAITING_SN: 'waiting_sn',
    COMPLETED: 'completed'
};

// Menu utama
const MAIN_MENU_OPTIONS = {
    INSTALLATION: '1',
    REIMBURSH: '2',
    EXIT: '3'
};

// Timeout untuk session (dalam milidetik)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit

// Maksimal panjang input
const MAX_INPUT_LENGTH = {
    NAME: 50,
    ROUTER_TYPE: 50,
    SERIAL_NUMBER: 30
};

// Pesan sistem
const SYSTEM_MESSAGES = {
    WELCOME: '🏠 Selamat datang di sistem pemasangan WiFi!',
    SESSION_EXPIRED: '⏰ Sesi Anda telah berakhir. Ketik "menu" untuk memulai kembali.',
    INVALID_INPUT: '❌ Input tidak valid. Silakan coba lagi.',
    SERVER_ERROR: '🔧 Terjadi kesalahan server. Silakan coba lagi.',
    SUCCESS: '✅ Operasi berhasil!',
    GOODBYE: '👋 Terima kasih telah menggunakan layanan kami!'
};

// Status pemasangan untuk database
const DB_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
};

// Regex patterns
const REGEX_PATTERNS = {
    DATE: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    PHONE: /^(08\d{8,11}|628\d{8,11}|\+628\d{8,11})$/,
    NAME: /^[a-zA-Z\s]{2,50}$/,
    SERIAL_NUMBER: /^[a-zA-Z0-9]{3,30}$/
};

// Bot configuration
const BOT_CONFIG = {
    RECONNECT_DELAY: 3000, // 3 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
    MESSAGE_DELAY: 1000, // 1 second delay between messages
    CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutes
};

module.exports = {
    ADMIN_NUMBERS,
    INSTALLATION_STATUS,
    MAIN_MENU_OPTIONS,
    SESSION_TIMEOUT,
    MAX_INPUT_LENGTH,
    SYSTEM_MESSAGES,
    DB_STATUS,
    REGEX_PATTERNS,
    BOT_CONFIG
};