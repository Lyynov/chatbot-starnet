/**
 * WiFi Installation Management - Google Apps Script
 * Handles data storage and management for WhatsApp WiFi Installation Bot
 */

// Configuration
const CONFIG = {
  SHEET_NAMES: {
    PEMASANGAN: 'Pemasangan WiFi',
    REIMBURSH: 'Reimbursh',
    LOG: 'System Log'
  },
  STATUS: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  },
  ADMIN_EMAILS: [
    'admin@yourcompany.com',
    // Add more admin emails here
  ]
};

// Google Apps Script Code untuk WiFi Installation Bot
// Copy paste kode ini ke Google Apps Script

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
      case 'getInstallationById':
        return getInstallationById(data.data.id);
      case 'deleteInstallation':
        return deleteInstallation(data.data.id);
      case 'getStats':
        return getInstallationStats();
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function saveInstallationData(data) {
  try {
    const sheet = getOrCreateSheet('Pemasangan WiFi');
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Tanggal Pemasangan', 'Nama Pelanggan', 
        'Jenis Router', 'SN Router', 'Status', 'ID', 'Catatan'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    const id = Utilities.getUuid();
    const rowData = [
      data.timestamp,
      data.tanggal_pemasangan,
      data.nama_pelanggan,
      data.jenis_router,
      data.sn_router,
      data.status || 'Pending',
      id,
      data.catatan || ''
    ];
    
    sheet.appendRow(rowData);
    
    // Auto resize columns
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: id,
      message: 'Data berhasil disimpan ke Google Sheets',
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error saving installation data:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal menyimpan data: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInstallationData(limit = 10) {
  try {
    const sheet = getOrCreateSheet('Pemasangan WiFi');
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: [],
        message: 'Tidak ada data pemasangan'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    const range = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn());
    const values = range.getValues();
    
    const data = values.map(row => ({
      timestamp: row[0],
      tanggal_pemasangan: row[1],
      nama_pelanggan: row[2],
      jenis_router: row[3],
      sn_router: row[4],
      status: row[5],
      id: row[6],
      catatan: row[7] || ''
    }));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data.reverse(), // Latest first
      total: lastRow - 1,
      message: `${data.length} data ditemukan`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error getting installation data:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal mengambil data: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateInstallationStatus(id, newStatus) {
  try {
    const sheet = getOrCreateSheet('Pemasangan WiFi');
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Tidak ada data untuk diupdate'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find row by ID (column G = 7)
    const idColumn = 7;
    const statusColumn = 6;
    
    for (let i = 2; i <= lastRow; i++) {
      const cellId = sheet.getRange(i, idColumn).getValue();
      if (cellId === id) {
        sheet.getRange(i, statusColumn).setValue(newStatus);
        
        // Add timestamp for status change
        const timestampColumn = 8; // Column H for notes
        const currentNote = sheet.getRange(i, timestampColumn).getValue() || '';
        const newNote = currentNote + `\nStatus diubah ke ${newStatus} pada ${new Date().toLocaleString('id-ID')}`;
        sheet.getRange(i, timestampColumn).setValue(newNote);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: `Status berhasil diubah ke ${newStatus}`,
          id: id
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'ID tidak ditemukan'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error updating status:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal mengupdate status: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInstallationById(id) {
  try {
    const sheet = getOrCreateSheet('Pemasangan WiFi');
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Tidak ada data'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find row by ID (column G = 7)
    const idColumn = 7;
    
    for (let i = 2; i <= lastRow; i++) {
      const cellId = sheet.getRange(i, idColumn).getValue();
      if (cellId === id) {
        const rowData = sheet.getRange(i, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        const installation = {
          timestamp: rowData[0],
          tanggal_pemasangan: rowData[1],
          nama_pelanggan: rowData[2],
          jenis_router: rowData[3],
          sn_router: rowData[4],
          status: rowData[5],
          id: rowData[6],
          catatan: rowData[7] || ''
        };
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: installation
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Data tidak ditemukan'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error getting installation by ID:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal mengambil data: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteInstallation(id) {
  try {
    // Soft delete by changing status to 'DELETED'
    return updateInstallationStatus(id, 'DELETED');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal menghapus data: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getInstallationStats() {
  try {
    const sheet = getOrCreateSheet('Pemasangan WiFi');
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        stats: {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const statusColumn = 6; // Column F
    const statusRange = sheet.getRange(2, statusColumn, lastRow - 1, 1);
    const statusValues = statusRange.getValues().flat();
    
    const stats = {
      total: statusValues.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      deleted: 0
    };
    
    statusValues.forEach(status => {
      const statusLower = status.toString().toLowerCase();
      switch(statusLower) {
        case 'pending':
          stats.pending++;
          break;
        case 'in progress':
          stats.in_progress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        case 'deleted':
          stats.deleted++;
          break;
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      stats: stats
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error getting stats:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Gagal mengambil statistik: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(name) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create spreadsheet if it doesn't exist
  if (!ss) {
    ss = SpreadsheetApp.create('WiFi Installation Data');
  }
  
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  return sheet;
}

// Fungsi untuk test script
function testSaveData() {
  const testData = {
    timestamp: new Date().toISOString(),
    tanggal_pemasangan: '2024-12-01',
    nama_pelanggan: 'Test Customer',
    jenis_router: 'TP-Link AC1200',
    sn_router: 'SN123456789',
    status: 'Pending',
    catatan: 'Test installation'
  };
  
  const result = saveInstallationData(testData);
  console.log('Test Result:', result);
  return result;
}

// Fungsi untuk test ambil data
function testGetData() {
  const result = getInstallationData(5);
  console.log('Get Data Result:', result);
  return result;
}

// Fungsi untuk test update status
function testUpdateStatus() {
  // Ganti dengan ID yang valid dari data yang ada
  const testId = 'your-test-id-here';
  const result = updateInstallationStatus(testId, 'Completed');
  console.log('Update Status Result:', result);
  return result;
}

// Fungsi untuk test statistik
function testGetStats() {
  const result = getInstallationStats();
  console.log('Stats Result:', result);
  return result;
}

// Fungsi untuk membersihkan sheet (hati-hati!)
function clearSheet() {
  const sheet = getOrCreateSheet('Pemasangan WiFi');
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
    console.log('Sheet cleared');
  }
}

// Fungsi untuk setup awal
function setupSheet() {
  const sheet = getOrCreateSheet('Pemasangan WiFi');
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp', 'Tanggal Pemasangan', 'Nama Pelanggan', 
      'Jenis Router', 'SN Router', 'Status', 'ID', 'Catatan'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    console.log('Sheet setup completed');
  } else {
    console.log('Sheet already has data');
  }
} proper formatting
 */
function initializeSheets() {
  try {
    // Initialize main installation sheet
    const installSheet = getOrCreateSheet(CONFIG.SHEET_NAMES.PEMASANGAN);
    
    // Initialize log sheet  
    const logSheet = getOrCreateSheet(CONFIG.SHEET_NAMES.LOG);
    
    // Initialize reimbursh sheet for future use
    const reimbursSheet = getOrCreateSheet(CONFIG.SHEET_NAMES.REIMBURSH);
    
    logActivity('Sheets Initialized', 'All required sheets have been created');
    
    return {
      success: true,
      message: 'Sheets initialized successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
