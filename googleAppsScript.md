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
        })).setMimeType(ContentService.MimeType