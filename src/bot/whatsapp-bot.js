const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const MessageHandler = require('./message-handler');
const SessionManager = require('./session-manager');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.messageHandler = new MessageHandler();
        this.sessionManager = new SessionManager();
        this.logger = pino({
            level: 'info',
            transport: {
                target: 'pino-pretty'
            }
        });
    }

    async start() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
            
            this.sock = makeWASocket({
                logger: pino({ level: 'silent' }),
                printQRInTerminal: true,
                auth: state,
                browser: ['WiFi Bot', 'Chrome', '1.0.0']
            });

            this.setupEventHandlers(saveCreds);
            
        } catch (error) {
            this.logger.error('Failed to start WhatsApp bot:', error);
            throw error;
        }
    }

    setupEventHandlers(saveCreds) {
        // Save credentials
        this.sock.ev.on('creds.update', saveCreds);

        // Connection updates
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                this.logger.info('Connection closed:', lastDisconnect?.error?.message);
                
                if (shouldReconnect) {
                    this.logger.info('Attempting to reconnect...');
                    setTimeout(() => this.start(), 3000);
                }
            } else if (connection === 'open') {
                this.logger.info('✅ WhatsApp Bot Connected Successfully!');
            }
        });

        // Message handler
        this.sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            
            if (!msg.key.fromMe && msg.message) {
                const chatId = msg.key.remoteJid;
                const messageText = this.extractMessageText(msg);
                
                if (messageText) {
                    await this.messageHandler.handleMessage(this.sock, chatId, messageText, this.sessionManager);
                }
            }
        });
    }

    extractMessageText(msg) {
        return msg.message.conversation || 
               msg.message.extendedTextMessage?.text || 
               msg.message.imageMessage?.caption ||
               msg.message.videoMessage?.caption || '';
    }

    async sendMessage(chatId, message) {
        try {
            await this.sock.sendMessage(chatId, { text: message });
        } catch (error) {
            this.logger.error('Failed to send message:', error);
        }
    }
}

module.exports = WhatsAppBot;