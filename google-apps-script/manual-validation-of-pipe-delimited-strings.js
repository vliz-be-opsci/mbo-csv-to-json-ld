//add function as menu item
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🧪 Metadata Tools")
    .addItem("Validate Pipe-Delimited FKs", "validatePipeDelimitedFKs")
    .addToUi();
}

function validatePipeDelimitedFKs() {
  const ui = SpreadsheetApp.getUi();
  const log = [];
  const logMsg = msg => {
    log.push(msg);
    Logger.log(msg);
  };

  const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/marco-bolo/csv-to-json-ld/google_sheets/remote/";
  const schemaFiles = fetchSchemaFileList().sort();
  const ss = SpreadsheetApp.openById("1PBFK3LW3DAdvXdbk2v8bSdtTf87mBhabeeegwRjOBRg");

  const VALIDATORS = {};
  const DELIMITED_COLUMNS = [];
  const BLACKLIST = new Set(["unioned-identifiers.schema.json"]);
  const syntheticSheetMap = {
    "person-or-organization": ["Person", "Organization"]
  };

  schemaFiles.forEach(file => {
    if (BLACKLIST.has(file)) {
      logMsg(`⛔ Skipping blacklisted schema file: ${file}`);
      return;
    }

    let schema;
    try {
      const raw = fetchWithRetry(GITHUB_RAW_BASE + file);
      schema = JSON.parse(raw);
      logMsg(`✅ Parsed schema file: ${file}`);
    } catch (err) {
      logMsg(`❌ Failed to parse schema file: ${file} — ${err}`);
      return;
    }

    if (!schema.columns || !Array.isArray(schema.columns)) {
      logMsg(`⚠️ Skipping schema with no columns array: ${file}`);
      return;
    }

    const titleMap = {};
    schema.columns.forEach(col => {
      const name = col.name;
      const title = col.titles?.en?.[0] || name;
      titleMap[name] = title;
    });

    const sheetName = file.replace(".schema.json", "");
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      logMsg(`⚠️ Sheet not found: ${sheetName}`);
      return;
    }

    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    schema.columns.forEach((col, colIndex) => {
      const isArray = typeof col.separator === "string";
      const fk = (schema.foreignKeys || []).find(fk => fk.columnReference === col.name);
      
      if (!isArray || !fk) return;

      const rawTargetName = fk.reference.resource.replace(".csv", "").replace("../", "").replace("out/validation/", "");
      const targetColumnName = fk.reference.columnReference;
      const targetSheets = syntheticSheetMap[rawTargetName] || [rawTargetName];

      const allowed = new Set();
      let anySheetFound = false;

      targetSheets.forEach(targetSheetName => {
        const targetSheet = ss.getSheetByName(targetSheetName);
        if (!targetSheet) {
          logMsg(`⚠️ Sheet not found: ${targetSheetName}`);
          return;
        }
        anySheetFound = true;

        const targetHeader = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
        const targetTitle = titleMap[fk.reference.columnReference] || fk.reference.columnReference;
        const targetIndex = targetHeader.indexOf(targetTitle);
        if (targetIndex === -1) {
          logMsg(`⚠️ Column '${targetTitle}' not found in ${targetSheetName}`);
          return;
        }

        const numRows = targetSheet.getLastRow() - 1;
        if (numRows < 1) {
          logMsg(`⚠️ No data rows in ${targetSheetName}!${targetTitle}`);
          return;
        }

        const values = targetSheet
          .getRange(2, targetIndex + 1, numRows)
          .getValues()
          .flat()
          .map(v => v && v.toString().trim())
          .filter(Boolean);


        values.forEach(v => allowed.add(v));
      });

      if (!anySheetFound) return;

      VALIDATORS[`${sheetName}.${col.name}`] = allowed;
      DELIMITED_COLUMNS.push({
        sheet,
        columnIndex: colIndex,
        title: header[colIndex],
        allowed,
        sheetName,
        colName: col.name
      });
    });
  });

  logMsg(`🔍 Validating ${DELIMITED_COLUMNS.length} delimited foreign key columns...`);

  // 🧼 Clear highlights and notes
  DELIMITED_COLUMNS.forEach(({ sheet, columnIndex, sheetName, title }) => {
    const numRows = sheet.getLastRow() - 1;
      if (numRows < 1) {
        logMsg(`⚠️ No data rows in ${sheetName}!${title}`);
        return;
      }

    const range = sheet.getRange(2, columnIndex + 1, numRows);
    range.setBackground(null);
    range.clearNote();
    logMsg(`🧽 Cleared highlights and notes in ${sheetName} → ${title}`);
  });

  const highlightColor = "#f4cccc";
  let totalInvalid = 0;

  DELIMITED_COLUMNS.forEach(({ sheet, columnIndex, title, allowed, sheetName, colName }) => {
    logMsg(`➡️ Checking ${sheetName} → ${title} (${colName})`);

    const numRows = sheet.getLastRow() - 1;
      if (numRows < 1) {
        logMsg(`⚠️ No data rows in ${sheetName}!${title}`);
        return;
      }
   const range = sheet.getRange(2, columnIndex + 1, numRows);
    const rows = range.getValues();

    rows.forEach((row, i) => {
      const cellValue = row[0];
      if (!cellValue) return;

      const values = cellValue
        .split("|")
        .map(v => v.trim())
        .filter(Boolean);

      const invalid = values.filter(v => !allowed.has(v));
      if (invalid.length > 0) {
        try {
          const cell = range.getCell(i + 1, 1);
          cell.setBackground(highlightColor);
          cell.setNote(`Invalid values: ${invalid.join(", ")}`);
        } catch (err) {
          logMsg(`💥 Error setting note on ${sheetName}!${title} row ${i + 2}: ${err}`);
        }
      }
    });
  });

  logMsg(`✅ Validation complete. ${totalInvalid} invalid values found.`);

  // 📋 Show summary message on screen
  const summary = log.slice(0, 30).join('\n') + (log.length > 30 ? '\n…(truncated)…' : '');
    showValidationLog(log.join("\n"));

}

function showValidationLog(logText) {
  const html = HtmlService.createHtmlOutput(
    `
    <div style="font-family: monospace; white-space: pre-wrap; max-height: 500px; overflow-y: auto;">
      ${logText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(✅|❌|⚠️|🔎|➡️|⛔|🧽|🔍)/g, '<span style="font-weight:bold;">$1</span>')}
    </div>
    `
  )
  .setWidth(700)
  .setHeight(600)
  .setTitle("Pipe-Delimited Foreign Key Validation Log");

  SpreadsheetApp.getUi().showModalDialog(html, "Validation Log");
}
