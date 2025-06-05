const AppsScriptService = require('../services/apps-script');
const NotificationService = require('../services/notification');
const { validateDate, validatePhoneNumber } = require('../utils/validation');
const { formatMainMenu, formatInstallationForm } = require('../utils/formatter');
const { INSTALLATION_STATUS } = require('../config/constants');

class MessageHandler {
    constructor() {
        this.appsScript = new AppsScriptService();
        this.notification = new NotificationService();
    }

    async handleMessage(sock, chatId, messageText, sessionManager) {
        const userSession = sessionManager.getSession(chatId);
        const cleanMessage = messageText.toLowerCase().trim();

        try {
            // Jika user belum ada session atau memilih menu utama
            if (!userSession || cleanMessage === 'menu' || cleanMessage === 'start') {
                await this.sendMainMenu(sock, chatId);
                sessionManager.clearSession(chatId);
                return;
            }

            // Handle berdasarkan status session
            switch (userSession.status) {
                case 'main_menu':
                    await this.handleMainMenuSelection(sock, chatId, cleanMessage, sessionManager);
                    break;
                
                case INSTALLATION_STATUS.WAITING_DATE:
                    await this.handleDateInput(sock, chatId, cleanMessage, sessionManager);
                    break;
                
                case INSTALLATION_STATUS.WAITING_NAME:
                    await this.handleNameInput(sock, chatId, messageText, sessionManager);
                    break;
                
                case INSTALLATION_STATUS.WAITING_ROUTER_TYPE:
                    await this.handleRouterTypeInput(sock, chatId, messageText, sessionManager);
                    break;
                
                case INSTALLATION_STATUS.WAITING_SN:
                    await this.handleSnInput(sock, chatId, messageText, sessionManager);
                    break;
                
                default:
                    await this.sendMainMenu(sock, chatId);
                    sessionManager.clearSession(chatId);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await sock.sendMessage(chatId, { text: '❌ Terjadi kesalahan. Silakan coba lagi atau ketik "menu" untuk kembali ke menu utama.' });
        }
    }

    async sendMainMenu(sock, chatId) {
        const menuMessage = formatMainMenu();
        await sock.sendMessage(chatId, { text: menuMessage });
        
        // Set session ke main menu
        const sessionManager = require('./session-manager');
        sessionManager.setSession(chatId, { status: 'main_menu' });
    }

    async handleMainMenuSelection(sock, chatId, selection, sessionManager) {
        switch (selection) {
            case '1':
            case 'pemasangan':
                await this.startInstallationProcess(sock, chatId, sessionManager);
                break;
            
            case '2':
            case 'reimbursh':
                await sock.sendMessage(chatId, { text: '🚧 Fitur Reimbursh sedang dalam pengembangan. Silakan hubungi admin secara langsung.' });
                await this.sendMainMenu(sock, chatId);
                break;
            
            case '3':
            case 'exit':
                await sock.sendMessage(chatId, { text: '👋 Terima kasih telah menggunakan layanan kami. Sampai jumpa!' });
                sessionManager.clearSession(chatId);
                break;
            
            default:
                await sock.sendMessage(chatId, { text: '❌ Pilihan tidak valid. Silakan pilih 1, 2, atau 3.' });
                await this.sendMainMenu(sock, chatId);
        }
    }

    async startInstallationProcess(sock, chatId, sessionManager) {
        const message = `📋 *FORM PEMASANGAN WiFi*\n\n` +
                       `Silakan isi data berikut secara berurutan:\n\n` +
                       `1️⃣ Masukkan tanggal pemasangan (format: DD/MM/YYYY)\n` +
                       `Contoh: 25/12/2024`;
        
        await sock.sendMessage(chatId, { text: message });
        
        sessionManager.setSession(chatId, {
            status: INSTALLATION_STATUS.WAITING_DATE,
            data: {}
        });
    }

    async handleDateInput(sock, chatId, dateInput, sessionManager) {
        if (!validateDate(dateInput)) {
            await sock.sendMessage(chatId, { 
                text: '❌ Format tanggal tidak valid. Silakan masukkan dengan format DD/MM/YYYY\nContoh: 25/12/2024' 
            });
            return;
        }

        const session = sessionManager.getSession(chatId);
        session.data.tanggal_pemasangan = dateInput;
        session.status = INSTALLATION_STATUS.WAITING_NAME;
        sessionManager.setSession(chatId, session);

        await sock.sendMessage(chatId, { 
            text: `✅ Tanggal pemasangan: ${dateInput}\n\n2️⃣ Masukkan nama pelanggan:` 
        });
    }

    async handleNameInput(sock, chatId, nameInput, sessionManager) {
        if (nameInput.length < 2) {
            await sock.sendMessage(chatId, { 
                text: '❌ Nama pelanggan terlalu pendek. Silakan masukkan nama yang valid.' 
            });
            return;
        }

        const session = sessionManager.getSession(chatId);
        session.data.nama_pelanggan = nameInput;
        session.status = INSTALLATION_STATUS.WAITING_ROUTER_TYPE;
        sessionManager.setSession(chatId, session);

        await sock.sendMessage(chatId, { 
            text: `✅ Nama pelanggan: ${nameInput}\n\n3️⃣ Masukkan jenis router yang dipakai:` 
        });
    }

    async handleRouterTypeInput(sock, chatId, routerInput, sessionManager) {
        if (routerInput.length < 2) {
            await sock.sendMessage(chatId, { 
                text: '❌ Jenis router tidak valid. Silakan masukkan jenis router yang benar.' 
            });
            return;
        }

        const session = sessionManager.getSession(chatId);
        session.data.jenis_router = routerInput;
        session.status = INSTALLATION_STATUS.WAITING_SN;
        sessionManager.setSession(chatId, session);

        await sock.sendMessage(chatId, { 
            text: `✅ Jenis router: ${routerInput}\n\n4️⃣ Masukkan SN (Serial Number) router:` 
        });
    }

    async handleSnInput(sock, chatId, snInput, sessionManager) {
        if (snInput.length < 3) {
            await sock.sendMessage(chatId, { 
                text: '❌ Serial Number tidak valid. Silakan masukkan SN yang benar.' 
            });
            return;
        }

        const session = sessionManager.getSession(chatId);
        session.data.sn_router = snInput;
        session.status = INSTALLATION_STATUS.COMPLETED;
        sessionManager.setSession(chatId, session);

        // Kirim konfirmasi ke user
        const confirmationMessage = formatInstallationForm(session.data);
        await sock.sendMessage(chatId, { text: confirmationMessage });

        // Simpan ke Google Apps Script
        try {
            await this.appsScript.saveInstallationData(session.data);
            
            // Kirim notifikasi ke admin
            await this.notification.notifyAdmins(session.data, sock);
            
            await sock.sendMessage(chatId, { 
                text: '✅ Data berhasil disimpan! Admin akan segera menghubungi Anda.\n\nKetik "menu" untuk kembali ke menu utama.' 
            });
            
        } catch (error) {
            console.error('Error saving data:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Terjadi kesalahan saat menyimpan data. Silakan coba lagi atau hubungi admin.' 
            });
        }

        // Clear session
        sessionManager.clearSession(chatId);
    }
}

module.exports = MessageHandler;