const axios = require('axios');
const moment = require('moment');

class AppsScriptService {
    constructor() {
        this.scriptUrl = process.env.APPS_SCRIPT_URL;
        
        if (!this.scriptUrl) {
            console.warn('⚠️  APPS_SCRIPT_URL not found in environment variables');
        }
    }

    async saveInstallationData(data) {
        if (!this.scriptUrl) {
            throw new Error('Apps Script URL not configured');
        }

        const payload = {
            action: 'saveInstallation',
            data: {
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                tanggal_pemasangan: data.tanggal_pemasangan,
                nama_pelanggan: data.nama_pelanggan,
                jenis_router: data.jenis_router,
                sn_router: data.sn_router,
                status: 'Pending'
            }
        };

        try {
            const response = await axios.post(this.scriptUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 seconds timeout
            });

            if (response.data.success) {
                console.log('✅ Data successfully saved to Google Sheets');
                return response.data;
            } else {
                throw new Error(response.data.error || 'Unknown error from Apps Script');
            }
        } catch (error) {
            console.error('❌ Error saving to Apps Script:', error);
            throw error;
        }
    }

    async getInstallationData(limit = 10) {
        if (!this.scriptUrl) {
            throw new Error('Apps Script URL not configured');
        }

        const payload = {
            action: 'getInstallations',
            data: { limit }
        };

        try {
            const response = await axios.post(this.scriptUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Unknown error from Apps Script');
            }
        } catch (error) {
            console.error('❌ Error fetching from Apps Script:', error);
            throw error;
        }
    }

    async updateInstallationStatus(id, status) {
        if (!this.scriptUrl) {
            throw new Error('Apps Script URL not configured');
        }

        const payload = {
            action: 'updateStatus',
            data: { id, status }
        };

        try {
            const response = await axios.post(this.scriptUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.data.success) {
                console.log(`✅ Status updated for ID: ${id}`);
                return response.data;
            } else {
                throw new Error(response.data.error || 'Unknown error from Apps Script');
            }
        } catch (error) {
            console.error('❌ Error updating status:', error);
            throw error;
        }
    }
}

module.exports = AppsScriptService;