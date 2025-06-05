class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        
        // Auto cleanup expired sessions every 10 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 10 * 60 * 1000);
    }

    setSession(chatId, sessionData) {
        this.sessions.set(chatId, {
            ...sessionData,
            timestamp: Date.now()
        });
    }

    getSession(chatId) {
        const session = this.sessions.get(chatId);
        
        if (!session) {
            return null;
        }

        // Check if session is expired
        if (Date.now() - session.timestamp > this.sessionTimeout) {
            this.sessions.delete(chatId);
            return null;
        }

        // Update timestamp
        session.timestamp = Date.now();
        this.sessions.set(chatId, session);
        
        return session;
    }

    clearSession(chatId) {
        this.sessions.delete(chatId);
    }

    cleanupExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];

        for (const [chatId, session] of this.sessions.entries()) {
            if (now - session.timestamp > this.sessionTimeout) {
                expiredSessions.push(chatId);
            }
        }

        expiredSessions.forEach(chatId => {
            this.sessions.delete(chatId);
        });

        if (expiredSessions.length > 0) {
            console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
        }
    }

    getAllActiveSessions() {
        return Array.from(this.sessions.keys());
    }

    getSessionCount() {
        return this.sessions.size;
    }
}

module.exports = SessionManager;