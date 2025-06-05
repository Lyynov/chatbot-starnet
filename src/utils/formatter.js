const moment = require('moment');
const { formatDateForDisplay } = require('./validation');

class Formatter {
    static formatMainMenu() {
        return `🏠 *SELAMAT DATANG DI LAYANAN WiFi*\n\n` +
               `Silakan pilih menu di bawah ini:\n\n` +
               `1️⃣ *Pemasangan* - Daftar pemasangan WiFi baru\n` +
               `2️⃣ *Reimbursh* - Pengajuan penggantian biaya\n` +
               `3️⃣ *Exit* - Keluar dari sistem\n\n` +
               `💡 Ketik nomor pilihan (1/2/3) atau nama menu\n` +
               `📞 Untuk bantuan, hubungi admin kami`;
    }

    static formatInstallationForm(data) {
        return `📋 *KONFIRMASI DATA PEMASANGAN*\n\n` +
               `📅 Tanggal Pemasangan: ${formatDateForDisplay(data.tanggal_pemasangan)}\n` +
               `👤 Nama Pelanggan: ${data.nama_pelanggan}\n` +
               `📡 Jenis Router: ${data.jenis_router}\n` +
               `🏷️ Serial Number: ${data.sn_router}\n` +
               `⏰ Waktu Input: ${moment().format('DD/MM/YYYY HH:mm')}\n\n` +
               `✅ Data akan disimpan dan admin akan segera menghubungi Anda.\n\n` +
               `Pastikan semua data sudah benar!`;
    }

    static formatAdminNotification(data) {
        return `🔔 *PEMASANGAN BARU - NOTIFIKASI ADMIN*\n\n` +
               `📋 *Detail Pemasangan:*\n` +
               `📅 Tanggal: ${formatDateForDisplay(data.tanggal_pemasangan)}\n` +
               `👤 Pelanggan: ${data.nama_pelanggan}\n` +
               `📡 Router: ${data.jenis_router}\n` +
               `🏷️ SN: ${data.sn_router}\n` +
               `⏰ Waktu Input: ${moment().format('DD/MM/YYYY HH:mm')}\n\n` +
               `📊 Status: 🟡 PENDING\n\n` +
               `⚡ Mohon segera ditindaklanjuti!`;
    }

    static formatErrorMessage(errorType) {
        const errors = {
            'invalid_date': '❌ Format tanggal salah. Gunakan format DD/MM/YYYY (contoh: 25/12/2024)',
            'past_date': '❌ Tanggal tidak boleh kurang dari hari ini',
            'future_date': '❌ Tanggal terlalu jauh di masa depan (maksimal 1 tahun)',
            'invalid_name': '❌ Nama tidak valid. Minimal 2 karakter, hanya huruf dan spasi',
            'invalid_router': '❌ Jenis router tidak valid. Minimal 2 karakter',
            'invalid_sn': '❌ Serial Number tidak valid. Minimal 3 karakter alphanumeric',
            'invalid_phone': '❌ Nomor telepon tidak valid. Gunakan format Indonesia (08xx, 628xx)',
            'session_expired': '⏰ Sesi Anda telah berakhir. Ketik "menu" untuk memulai kembali',
            'unknown_command': '❓ Perintah tidak dikenali. Ketik "menu" untuk melihat pilihan yang tersedia',
            'server_error': '🔧 Terjadi kesalahan server. Silakan coba lagi dalam beberapa saat'
        };

        return errors[errorType] || errors['unknown_command'];
    }

    static formatSuccessMessage(type, data = {}) {
        const messages = {
            'data_saved': '✅ Data berhasil disimpan! Admin akan menghubungi Anda segera.',
            'notification_sent': '📤 Notifikasi berhasil dikirim ke admin.',
            'session_cleared': '🔄 Sesi berhasil direset.',
            'installation_completed': `✅ Pemasangan untuk ${data.nama_pelanggan} berhasil diselesaikan!`
        };

        return messages[type] || '✅ Operasi berhasil!';
    }

    static formatInstallationStatus(status) {
        const statusMap = {
            'pending': '🟡 PENDING',
            'in_progress': '🔵 SEDANG PROSES',
            'completed': '✅ SELESAI',
            'cancelled': '❌ DIBATALKAN',
            'rescheduled': '📅 DIJADWAL ULANG'
        };

        return statusMap[status.toLowerCase()] || '❓ STATUS TIDAK DIKENAL';
    }

    static formatReportSummary(installations) {
        if (!installations || installations.length === 0) {
            return '📊 *LAPORAN PEMASANGAN*\n\nTidak ada data pemasangan.';
        }

        let summary = `📊 *LAPORAN PEMASANGAN*\n\n`;
        summary += `📈 Total: ${installations.length} pemasangan\n\n`;

        // Group by status
        const statusCounts = {};
        installations.forEach(install => {
            const status = install.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        summary += `📋 *Status Summary:*\n`;
        Object.entries(statusCounts).forEach(([status, count]) => {
            summary += `${this.formatInstallationStatus(status)}: ${count}\n`;
        });

        return summary;
    }

    static formatPhoneNumber(phone) {
        // Format phone number for WhatsApp
        let cleanPhone = phone.replace(/\D/g, '');
        
        if (cleanPhone.startsWith('08')) {
            cleanPhone = '628' + cleanPhone.substring(2);
        } else if (cleanPhone.startsWith('+628')) {
            cleanPhone = cleanPhone.substring(1);
        }
        
        return cleanPhone + '@s.whatsapp.net';
    }

    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
}

module.exports = {
    formatMainMenu: Formatter.formatMainMenu,
    formatInstallationForm: Formatter.formatInstallationForm,
    formatAdminNotification: Formatter.formatAdminNotification,
    formatErrorMessage: Formatter.formatErrorMessage,
    formatSuccessMessage: Formatter.formatSuccessMessage,
    formatInstallationStatus: Formatter.formatInstallationStatus,
    formatReportSummary: Formatter.formatReportSummary,
    formatPhoneNumber: Formatter.formatPhoneNumber,
    truncateText: Formatter.truncateText
};