# WiFi Installation Chatbot

WhatsApp Bot untuk manajemen pemasangan WiFi dengan integrasi Google Apps Script untuk penyimpanan data otomatis ke Excel.

## 🚀 Features

- ✅ WhatsApp Bot menggunakan Baileys
- ✅ Menu interaktif untuk pemasangan WiFi
- ✅ Form pemasangan dengan validasi
- ✅ Integrasi Google Apps Script
- ✅ Notifikasi otomatis ke admin
- ✅ Session management
- ✅ Auto-cleanup expired sessions
- ✅ Error handling dan logging

## 📋 Menu Features

### 1. Pemasangan
- Input tanggal pemasangan
- Input nama pelanggan  
- Input jenis router
- Input serial number router
- Auto-save ke Google Sheets
- Notifikasi ke admin

### 2. Reimbursh
- Coming soon...

### 3. Exit
- Keluar dari sistem

## 🛠️ Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/wifi-installation-chatbot.git
cd wifi-installation-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file:
```bash
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NODE_ENV=production
LOG_LEVEL=info
```

5. Run the bot:
```bash
npm start
```

Untuk development:
```bash
npm run dev
```

## 📱 WhatsApp Setup

1. Jalankan bot dengan `npm start`
2. Scan QR Code yang muncul dengan WhatsApp
3. Bot siap digunakan!

## 🔗 Google Apps Script Setup

### 1. Buat Google Apps Script Project

1. Buka [Google Apps Script](https://script.google.com)
2. Buat project baru
3. Copy paste kode berikut:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch(data.action) {
      case 'saveInstallation':
        return saveInstallationData(data.data);
      case 'getInstallations':  
        return getInstallationData(data.data.limit);
      case 'updateStatus':
        return updateInstallationStatus(data.data.id, data.data.status);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function saveInstallationData(data) {
  const sheet = getOrCreateSheet('Pemasangan WiFi');
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Timestamp', 'Tanggal Pemasangan', 'Nama Pelanggan', 
      'Jenis Router', 'SN Router', 'Status', 'ID'
    ]]);
  }
  
  const id = Utilities.getUuid();
  sheet.appendRow([
    data.timestamp,
    data.tanggal_pemasangan,
    data.nama_pelanggan,
    data.jenis_router,
    data.sn_router,
    data.status || 'Pending',
    id
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    id: id,
    message: 'Data saved successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('WiFi Installation Data');
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  return sheet;
}
```

### 2. Deploy Apps Script

1. Klik "Deploy" > "New deployment"
2. Pilih type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Copy URL dan masukkan ke `.env`

## 📞 Admin Numbers

Edit nomor admin di `src/config/constants.js`:

```javascript
const ADMIN_NUMBERS = [
    '+62 813-1490-3003',
    '+62 896-1693-2030', 
    '+62 831-1177-9520'
];
```

## 🗂️ Project Structure

```
wifi-chatbot/
├── server.js              # Entry point
├── src/
│   ├── bot/
│   │   ├── whatsapp-bot.js    # Core bot
│   │   ├── message-handler.js  # Message processing
│   │   └── session-manager.js  # Session management
│   ├── services/
│   │   ├── apps-script.js     # Google Apps Script integration
│   │   └── notification.js    # Admin notifications
│   ├── utils/
│   │   ├── validation.js      # Input validation
│   │   └── formatter.js       # Message formatting
│   └── config/
│       └── constants.js       # Configuration
└── docs/
    └── setup.md
```

## 📊 Data Flow

1. User mengirim pesan ke WhatsApp Bot
2. Bot memproses pesan dan mengelola session
3. Data pemasangan disimpan ke Google Sheets via Apps Script
4. Admin mendapat notifikasi otomatis
5. Data tersimpan dalam Excel yang dapat diakses real-time

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Environment Variables
- `APPS_SCRIPT_URL`: URL Google Apps Script
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (info/debug/error)

### Session Management
- Session timeout: 30 menit
- Auto cleanup expired sessions
- Persistent data storage

## 🚨 Error Handling

- Automatic reconnection pada disconnect
- Session timeout handling
- Input validation
- Error logging
- Graceful error messages untuk user

## 📈 Monitoring

- Console logging dengan timestamps
- Session count monitoring
- Error tracking
- Success/failure notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk support dan pertanyaan:
- WhatsApp: +62 813-1490-3003
- Email: admin@yourcompany.com

## 🔄 Updates

### v1.0.0
- ✅ Basic WhatsApp Bot
- ✅ Installation form
- ✅ Google Apps Script integration
- ✅ Admin notifications

### Upcoming Features
- 🔄 Reimbursh management
- 🔄 Installation status tracking
- 🔄 Report generation
- 🔄 Multiple language support