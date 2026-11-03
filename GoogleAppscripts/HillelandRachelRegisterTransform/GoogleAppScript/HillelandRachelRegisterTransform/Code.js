function compareSheetHeaders() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  
  // List excluded sheet names in lowercase and trimmed
  var excludedSheets = ["debt list", "regular payments", "header_comparison_report"];
  
  var baselineHeader = null;
  var baselineSheetName = "";
  var reportData = [["Sheet Name", "Column Letter", "Column Index", "Baseline Value (" + baselineSheetName + ")", "Current Sheet Value"]];
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var rawSheetName = sheet.getName();
    var cleanSheetName = rawSheetName.trim().toLowerCase();
    
    // Skip excluded sheets
    if (excludedSheets.indexOf(cleanSheetName) !== -1) {
      continue;
    }
    
    // Read header row (Row 1)
    var lastColumn = sheet.getLastColumn();
    var currentHeader = [];
    if (lastColumn > 0) {
      currentHeader = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    }
    
    // Set the first non-excluded sheet as the baseline standard
    if (baselineHeader === null) {
      baselineHeader = currentHeader;
      baselineSheetName = rawSheetName;
      reportData[0][3] = "Baseline Value ('" + baselineSheetName + "')";
      continue;
    }
    
    // Compare current sheet header against the baseline header
    var maxCols = Math.max(baselineHeader.length, currentHeader.length);
    
    for (var col = 0; col < maxCols; col++) {
      var baseVal = (baselineHeader[col] !== undefined && baselineHeader[col] !== "") ? String(baselineHeader[col]).trim() : "[Missing/Empty]";
      var currVal = (currentHeader[col] !== undefined && currentHeader[col] !== "") ? String(currentHeader[col]).trim() : "[Missing/Empty]";
      
      if (baseVal !== currVal) {
        var colLetter = getColumnLetter(col + 1);
        reportData.push([rawSheetName, colLetter, col + 1, baseVal, currVal]);
      }
    }
  }
  
  // Write output to a dedicated report tab
  var reportSheetName = "Header_Comparison_Report";
  var reportSheet = ss.getSheetByName(reportSheetName);
  if (!reportSheet) {
    reportSheet = ss.insertSheet(reportSheetName);
  } else {
    reportSheet.clear();
  }
  
  reportSheet.getRange(1, 1, reportData.length, reportData[0].length).setValues(reportData);
  reportSheet.getRange(1, 1, 1, reportData[0].length).setFontWeight("bold").setBackground("#EFEFEF");
  reportSheet.autoResizeColumns(1, reportData[0].length);
  
  var ui = SpreadsheetApp.getUi();
  if (reportData.length === 1) {
    ui.alert("Comparison Complete", "All checked sheet headers match perfectly with '" + baselineSheetName + "'.", ui.ButtonSet.OK);
  } else {
    ui.alert("Comparison Complete", "Differences found! Results have been written to the tab: '" + reportSheetName + "'.", ui.ButtonSet.OK);
  }
}

/**
 * Helper function to convert column numbers (1-based) to A1 notation letters
 */
function getColumnLetter(columnNumber) {
  var temp, letter = '';
  while (columnNumber > 0) {
    temp = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    columnNumber = (columnNumber - temp) / 26 | 0;
  }
  return letter;
}


function combineTabsToAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  // Source tabs to combine
  // Duplicate tab name removed.
  var sourceTabNames = [
    "Cash",
    "USB H&R C",
    "USB H&R S",
    "USB CC 2575",
    "United Credit Card",
    "Cap One (H CC) 2115",
    "USB Reserve Line",
    "Dick's Sporting Good Credit Card",
    "Amazon Rewards",
    "USB William Savings",
    "Target RedCard",
    "Kohls Card"
  ];

  var rawCombinedData = [];
  var headerFound = false;

  // Collect data from source tabs.
  // Display values preserve the visible formatting of dates and amounts.
  sourceTabNames.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet || sheet.getLastRow() === 0) {
      return;
    }

    var data = sheet.getDataRange().getDisplayValues();

    if (data.length === 0) {
      return;
    }

    // Use the first available source tab's header.
    if (!headerFound) {
      var headerRow = data[0].slice();
      headerRow.unshift("Account");
      rawCombinedData.push(headerRow);
      headerFound = true;
    }

    // Append non-empty data rows.
    for (var r = 1; r < data.length; r++) {
      var row = data[r].slice();

      var hasData = row.some(function(cell) {
        return cell !== "" && cell !== null && cell !== undefined;
      });

      if (hasData) {
        row.unshift(sheetName);
        rawCombinedData.push(row);
      }
    }
  });

  // Remove the existing All tab, if present.
  // This script no longer creates an All tab.
  var allSheet = ss.getSheetByName("All");

  if (allSheet) {
    if (ss.getSheets().length <= 1) {
      ui.alert("Cannot delete the All tab because it is the only sheet.");
      return;
    }

    ss.deleteSheet(allSheet);
  }

  if (rawCombinedData.length === 0) {
    ui.alert(
      "No data found in the specified source tabs.\n\n" +
      "The All tab has been removed, if it existed."
    );
    return;
  }

  // Identify Balance columns using the first header row.
  var headerRow = rawCombinedData[0];
  var balanceIndices = [];

  for (var c = 0; c < headerRow.length; c++) {
    if (
      String(headerRow[c]).trim().toLowerCase() === "balance"
    ) {
      balanceIndices.push(c);
    }
  }

  // Remove Balance columns and standardize row lengths.
  var finalData = rawCombinedData.map(function(row) {
    return row.filter(function(_, index) {
      return balanceIndices.indexOf(index) === -1;
    });
  });

  var maxColumns = Math.max.apply(
    null,
    finalData.map(function(row) {
      return row.length;
    })
  );

  finalData.forEach(function(row) {
    while (row.length < maxColumns) {
      row.push("");
    }
  });

  // Convert values to properly escaped CSV.
  function escapeCsvValue(value) {
    var text = value === null || value === undefined
      ? ""
      : String(value);

    // Double embedded quotes and wrap fields containing CSV delimiters.
    if (/[",\r\n]/.test(text)) {
      text = '"' + text.replace(/"/g, '""') + '"';
    }

    return text;
  }

  var csv = finalData.map(function(row) {
    return row.map(escapeCsvValue).join(",");
  }).join("\r\n");

  // Add a UTF-8 BOM for better compatibility with Excel.
  csv = "\uFEFF" + csv;

  // Create a downloadable CSV dialog.
  var fileName = "Combined_Accounts_" +
    Utilities.formatDate(
      new Date(),
      ss.getSpreadsheetTimeZone(),
      "yyyy-MM-dd_HHmmss"
    ) + ".csv";

  var template = HtmlService.createTemplate(
    '<!DOCTYPE html>' +
    '<html><head><base target="_top">' +
    '<meta charset="UTF-8"></head>' +
    '<body style="font-family:Arial,sans-serif;padding:20px;">' +
    '<h3>CSV export ready</h3>' +
    '<p>Your combined account data has been prepared.</p>' +
    '<p>The All tab has been removed.</p>' +
    '<button onclick="downloadCsv()" ' +
    'style="padding:10px 16px;cursor:pointer;">' +
    'Download CSV</button>' +
    '<p id="status"></p>' +
    '<script>' +
    'var csvBase64 = "<?= csvBase64 ?>";' +
    'var fileName = "<?= fileName ?>";' +
    'function downloadCsv() {' +
    '  var binary = atob(csvBase64);' +
    '  var bytes = new Uint8Array(binary.length);' +
    '  for (var i = 0; i < binary.length; i++) {' +
    '    bytes[i] = binary.charCodeAt(i);' +
    '  }' +
    '  var blob = new Blob([bytes], {' +
    '    type: "text/csv;charset=utf-8;"' +
    '  });' +
    '  var url = URL.createObjectURL(blob);' +
    '  var link = document.createElement("a");' +
    '  link.href = url;' +
    '  link.download = fileName;' +
    '  document.body.appendChild(link);' +
    '  link.click();' +
    '  link.remove();' +
    '  setTimeout(function() {' +
    '    URL.revokeObjectURL(url);' +
    '  }, 1000);' +
    '  document.getElementById("status").textContent =' +
    '    "Download initiated. Check your Downloads folder.";' +
    '}' +
    '</script></body></html>'
  );

  template.csvBase64 = Utilities.base64Encode(
    csv,
    Utilities.Charset.UTF_8
  );
  template.fileName = fileName;

  var html = template.evaluate()
    .setWidth(420)
    .setHeight(250);

  ui.showModalDialog(html, "Download Combined Accounts CSV");
}
