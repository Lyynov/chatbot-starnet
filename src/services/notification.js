const { ADMIN_NUMBERS } = require('../config/constants');
const { formatAdminNotification } = require('../utils/formatter');

class NotificationService {
    constructor() {
        this.adminNumbers = ADMIN_NUMBERS;
    }

    async notifyAdmins(installationData, sock) {
        const notificationMessage = formatAdminNotification(installationData);
        
        const promises = this.adminNumbers.map(async (adminNumber) => {
            try {
                await sock.sendMessage(adminNumber, { text: notificationMessage });
                console.log(`✅ Notification sent to admin: ${adminNumber}`);
            } catch (error) {
                console.error(`❌ Failed to send notification to ${adminNumber}:`, error);
                // Don't throw error, just log it so other notifications can still be sent
            }
        });

        await Promise.allSettled(promises);
    }

    async sendBulkMessage(sock, message, recipients = null) {
        const targets = recipients || this.adminNumbers;
        
        const promises = targets.map(async (number) => {
            try {
                await sock.sendMessage(number, { text: message });
                console.log(`✅ Bulk message sent to: ${number}`);
            } catch (error) {
                console.error(`❌ Failed to send bulk message to ${number}:`, error);
            }
        });

        await Promise.allSettled(promises);
    }

    async notifyInstallationComplete(installationData, sock) {
        const message = `✅ *PEMASANGAN SELESAI*\n\n` +
                       `📅 Tanggal: ${installationData.tanggal_pemasangan}\n` +
                       `👤 Pelanggan: ${installationData.nama_pelanggan}\n` +
                       `📡 Router: ${installationData.jenis_router}\n` +
                       `🏷️ SN: ${installationData.sn_router}\n` +
                       `⏰ Waktu Selesai: ${new Date().toLocaleString('id-ID')}\n\n` +
                       `Status: ✅ COMPLETED`;

        await this.notifyAdmins({ ...installationData, message }, sock);
    }

    async notifyInstallationCancelled(installationData, reason, sock) {
        const message = `❌ *PEMASANGAN DIBATALKAN*\n\n` +
                       `📅 Tanggal: ${installationData.tanggal_pemasangan}\n` +
                       `👤 Pelanggan: ${installationData.nama_pelanggan}\n` +
                       `📡 Router: ${installationData.jenis_router}\n` +
                       `🏷️ SN: ${installationData.sn_router}\n` +
                       `❌ Alasan: ${reason}\n` +
                       `⏰ Waktu Batal: ${new Date().toLocaleString('id-ID')}\n\n` +
                       `Status: ❌ CANCELLED`;

        await this.notifyAdmins({ ...installationData, message }, sock);
    }

    async sendMaintenanceNotification(message, sock) {
        const fullMessage = `🔧 *NOTIFIKASI MAINTENANCE*\n\n${message}\n\n⏰ ${new Date().toLocaleString('id-ID')}`;
        await this.sendBulkMessage(sock, fullMessage);
    }
}

module.exports = NotificationService;