// Base URL for listing JSON Schema files (CSVW) in the repo's `remote/` folder via GitHub Contents API.
// Used by fetchSchemaFileList() to discover which sheets to build.
const GITHUB_API_URL = "https://api.github.com/repos/marco-bolo/csv-to-json-ld/contents/remote";

// Base URL for fetching raw JSON Schema files from the `main/remote/` branch path.
// Each schema file (e.g., Person.schema.json) is pulled from here.
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/marco-bolo/csv-to-json-ld/main/remote/";

// Direct raw URL to a YAML file containing slot (field) descriptions.
// These descriptions are parsed and later attached to header cells as Google Sheets "notes".
const SLOT_YAML_URL = "https://raw.githubusercontent.com/marco-bolo/csv-to-json-ld/main/remote/models/slots.yaml";

// Some CSVW schemas can reference a "synthetic" sheet that is realized by multiple concrete sheets in the UI.
// This map lets a single target sheet name (key) resolve to multiple actual sheet names for dropdown sources.
const syntheticSheetMap = {
  "person-or-organization": ["Person", "Organization"]
};

// --- Helpers for building header notes from CSVW + slots.yaml (+ optional hints) ---

// Pull dc:description (or description) from a CSVW column safely.
// Supports string, language map, array of strings/maps (robust to varied CSVW encodings).
function extractCsvwDescription(col) {
  // Guard: if the caller passed nothing, be graceful.
  if (!col || typeof col !== "object") return null;

  // Some CSVW encoders put description as an array; normalize to first item if so.
  let v = col["dc:description"] ?? col["description"];
  if (!v) return null;

  if (Array.isArray(v)) {
    // e.g., ["Some text"] or [{en: "Some text"}]
    if (v.length === 0) return null;
    v = v[0];
  }

  if (typeof v === "string") return v.trim();

  if (typeof v === "object") {
    // Language map: prefer 'en', then first available key.
    if (Array.isArray(v.en)) return String(v.en[0]).trim();
    if (typeof v.en === "string") return v.en.trim();
    const keys = Object.keys(v);
    if (!keys.length) return null;
    const firstVal = v[keys[0]];
    return Array.isArray(firstVal) ? String(firstVal[0]).trim() : String(firstVal).trim();
  }

  return null;
}

// Merge CSVW dc:description/description with slots.yaml description.
// CSVW text first, then a blank line, then the slots.yaml fields in order:
// description, required, multivalued, range, pattern.
function buildHeaderNote(col, slotInfoByName) {
  const fromCsvw = extractCsvwDescription(col);

  const slotKey = col?.name;
  const slotInfo = slotKey && slotInfoByName[slotKey] ? slotInfoByName[slotKey] : null;

  const lines = [];

  if (fromCsvw) {
    lines.push(fromCsvw);
  }

  if (slotInfo) {
    if (fromCsvw) lines.push(""); // blank line between CSVW text and slots.yaml block
    // Header line to make it obvious where the following fields come from.
    lines.push("from slots.yaml:");

    // Only add fields that are present; keep the requested order.
    if (slotInfo.description != null && String(slotInfo.description).trim() !== "") {
      lines.push(`description: ${String(slotInfo.description).trim()}`);
    }
    if (typeof slotInfo.required !== "undefined") {
      lines.push(`required: ${slotInfo.required}`);
    }
    if (typeof slotInfo.multivalued !== "undefined") {
      lines.push(`multivalued: ${slotInfo.multivalued}`);
    }
    if (slotInfo.range != null && String(slotInfo.range).trim() !== "") {
      lines.push(`range: ${String(slotInfo.range).trim()}`);
    }
    if (slotInfo.pattern != null && String(slotInfo.pattern).trim() !== "") {
      lines.push(`pattern: ${String(slotInfo.pattern).trim()}`);
    }
  }

  const note = lines.join("\n").trim();
  return note || null;
}


function generateSheetsFromCSVW() {
  // Discover schema files (CSVW JSON Schemas) from GitHub and sort for stable order.
  const schemaFiles = fetchSchemaFileList().sort();
  //for testing
  //const schemaFiles = ['Action.schema.json'].sort();  // Filtered to only key test sheets

  // Open the Google Spreadsheet by ID (replace with your own if needed).
  const ss = SpreadsheetApp.openById("1PBFK3LW3DAdvXdbk2v8bSdtTf87mBhabeeegwRjOBRg"); // To customize, replace Sheet ID

  // Maps "SheetName.slot" -> { targetSheet, targetColumn } for later building of data-validation dropdowns.
  const foreignKeyMap = {};

  // Tracks which foreign keys come from array-typed columns (separator set), so we can skip dropdowns for those.
  const arrayTypedFKs = {};  // for navigating array fks

  // For each sheet, stores a mapping of "slot name" -> "column title shown in header".
  // Needed because CSVW columns can have localized titles that differ from the raw `name`.
  const columnTitlesBySheet = {};

  // Parse the YAML of slot descriptions once and reuse:
  // These are the human-readable tooltips we attach as header cell "notes".
  const slotDescriptions = fetchSlotDescriptions();

  // (Unused below, but left as an example) - derives a sheet name from the first schema file.
  const firstSheetName = schemaFiles[0].replace(".schema.json", "");

  // Keep a handle to default Sheet1 if present (not strictly required).
  const sheet1 = ss.getSheetByName("Sheet1");

  // Main loop: build or update one Google Sheet per JSON Schema file.
  schemaFiles.forEach((filename, index) => {
    const sheetName = filename.replace(".schema.json", "");
    // Fetch and parse the CSVW-style JSON Schema describing columns, datatypes, foreignKeys, etc.
    const schema = JSON.parse(fetchWithRetry(GITHUB_RAW_BASE + filename));

    Logger.log(`📄 ${filename} has ${schema.foreignKeys?.length || 0} foreign keys`);

    // Create or reuse the sheet matching this schema.
    let currentSheet = ss.getSheetByName(sheetName);
    if (!currentSheet) {
      currentSheet = ss.insertSheet(sheetName);
      Logger.log(`🆕 Created new sheet: ${sheetName}`);
    } else {
      Logger.log(`✅ Found existing sheet: ${sheetName}`);
    }

    // Keep the header row visible while scrolling.
    currentSheet.setFrozenRows(1); // freeze header row

    // Build list of visible (non-virtual) columns and compute header titles.
    // `nameToTitle` maps internal slot names to user-facing titles used in the sheet header.
    const columns = schema.columns.filter((col) => !col.virtual);
    const nameToTitle = {};
    const headers = columns.map((col) => {
      // Prefer localized title (English) if provided; otherwise fall back to `name`.
      const title = Array.isArray(col.titles?.en) ? col.titles.en[0] : col.name;
      nameToTitle[col.name] = title;
      return title;
    });
    columnTitlesBySheet[sheetName] = nameToTitle;

    Logger.log(`🔍 Sheet: ${sheetName}`);
    Logger.log(`Slot-to-title mapping: ${JSON.stringify(nameToTitle, null, 2)}`);

    // Write header row once (row 1) with computed titles.
    const headerRange = currentSheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);

    // Protect the header row so only the script owner can edit the header cells.
    const protection = currentSheet.getRange(1, 1, 1, currentSheet.getMaxColumns()).protect();
    protection.setDescription(`Protect header of ${sheetName}`);
    protection.removeEditors(protection.getEditors()); // removes everyone
    protection.addEditor(Session.getEffectiveUser());  // keeps script owner

    // For each schema column, configure appearance, notes, and validation for the corresponding sheet column.
    columns.forEach((col, i) => {

      Logger.log(`🧪 sheet='${sheetName}', col.name='${col.name}', titles.en=${JSON.stringify(col.titles?.en)}`);

      const title = nameToTitle[col.name];

      // Find the 1-based column index by searching the header row for our title.
      const colIndex = currentSheet.getRange("1:1").getValues()[0].indexOf(title) + 1;
      if (colIndex < 1) {
        Logger.log(`⚠️ Column title '${title}' not found in '${sheetName}' — skipping`);
        return;
      }

      // Convenience ranges for the header cell and the entire body of that column.
      const headerCell = currentSheet.getRange(1, colIndex);
      const colRange = currentSheet.getRange(2, colIndex, currentSheet.getMaxRows() - 1);

      // Visually emphasize required columns (bold + pale yellow background).
      if (col.required) {
        headerCell.setFontWeight("bold");
        headerCell.setBackground("#fff3cd"); // pale yellow
      }

      // 🔑 THIS IS WHERE HEADER "NOTES" ARE APPLIED:
      // Look up a description for this slot (by its raw `name`) from the parsed YAML.
      // If present, attach it to the header cell via setNote() so users see helpful tooltips.
      // Merge dc:description (CSVW) + slots.yaml + optional hints
      const mergedNote = buildHeaderNote(col, slotDescriptions);
      if (mergedNote) headerCell.setNote(mergedNote);


      // If the CSVW declares a regex `format` for the column's datatype, enforce it with REGEXMATCH.
      // The validation uses R1C1 INDIRECT("RC", FALSE) to reference the current cell dynamically.
      if (col.datatype?.format) {
        const regex = col.datatype.format;
        const rule = SpreadsheetApp.newDataValidation()
          .requireFormulaSatisfied(`=REGEXMATCH(INDIRECT("RC", FALSE), "${regex}")`)
          .setAllowInvalid(true) // allow but flag invalid entries
          .build();
        colRange.setDataValidation(rule);
      }

      // Add a conditional format on the 'id' column to highlight duplicate IDs in red background.
      if (col.name === "id") {
        const colLetter = String.fromCharCode(64 + colIndex); // Convert 1->A, 2->B, ...
        const rule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied(`=COUNTIF(${colLetter}2:${colLetter}, INDIRECT(ADDRESS(ROW(), COLUMN()))) > 1`)
          .setBackground("#f8d7da")
          .setRanges([colRange])
          .build();
        const rules = currentSheet.getConditionalFormatRules();
        rules.push(rule);
        currentSheet.setConditionalFormatRules(rules);
      }
    });

    // Collect foreign key info for later creation of data-validation dropdowns.
    // Each fk defines: from (this sheet, columnReference) -> to (target resource/csv and target columnReference).
    (schema.foreignKeys || []).forEach((fk) => {
      const fromCol = fk.columnReference;
      const to = fk.reference;

      // Normalize target sheet name from CSVW resource path to a sheet tab name (strip extensions/paths).
      const toSheet = to.resource.replace(".csv", "").replace("../", "").replace("out/validation/", "");

      // Store mapping from "ThisSheet.fromCol" to { targetSheet, targetColumn } for the dropdown phase.
      foreignKeyMap[`${sheetName}.${fromCol}`] = {
        targetSheet: toSheet,
        targetColumn: to.columnReference
      };

      // Detect array-typed foreign keys: CSVW columns with a string `separator` imply arrays.
      // We skip dropdowns for array-typed FKs, because a single-cell dropdown doesn't suit multi-valued entries.
      const matchingCol = schema.columns.find(col => col.name === fromCol);
      if (matchingCol) {
        const isArrayType = typeof matchingCol.separator === "string";
        if (isArrayType) {
          Logger.log(`↪️ Marking '${sheetName}.${fromCol}' as array-typed foreign key`);
          arrayTypedFKs[`${sheetName}.${fromCol}`] = true;
        }
      }
    });

    // Gentle delay to avoid hammering Sheets/HTTP services when looping many schemas.
    Utilities.sleep(500);
  });

  // Debug logging of accumulated foreign key mappings.
  Logger.log(`🔧 Done building sheets. Total foreign keys collected: ${Object.keys(foreignKeyMap).length}`);
  Logger.log(`🔧 foreignKeyMap: ${JSON.stringify(foreignKeyMap, null, 2)}`);

  Logger.log("🔁 Starting dropdown application phase");

  // Second pass: apply data validation dropdowns for all non-array foreign-key columns.
  Object.entries(foreignKeyMap).forEach(([sourceKey, target]) => {
    const [sourceSheetName, sourceSlotName] = sourceKey.split(".");

    // Skip array-typed FK columns (see above rationale).
    if (arrayTypedFKs[sourceKey]) {
      Logger.log(`⏭️ Skipping dropdown for array-typed FK: ${sourceKey}`);
      return;
    }

    const sourceSheet = ss.getSheetByName(sourceSheetName);
    if (!sourceSheet) {
      Logger.log(`⚠️ Source sheet '${sourceSheetName}' not found.`);
      return;
    }

    // Translate source slot name -> displayed column title -> column index in header row.
    const sourceColName = columnTitlesBySheet[sourceSheetName]?.[sourceSlotName];
    if (!sourceColName) {
      Logger.log(`⚠️ Source column '${sourceSlotName}' not mapped in '${sourceSheetName}'`);
      return;
    }

    const sourceColIndex = sourceSheet.getRange("1:1").getValues()[0].indexOf(sourceColName) + 1;
    if (sourceColIndex < 1) {
      Logger.log(`⚠️ Source column '${sourceColName}' not found in header of '${sourceSheetName}'`);
      return;
    }

    // Range covering all rows under the header for this source column (data rows).
    const lastRow = Math.max(2, sourceSheet.getLastRow());
    const numRows = lastRow - 1;
    const sourceRange = sourceSheet.getRange(2, sourceColIndex, sourceSheet.getMaxRows() - 1);

    // Remove any previous validation to avoid conflicts before applying the new rule.
    sourceRange.clearDataValidations();

    // Resolve possible "synthetic" target sheets: e.g., person-or-organization -> ["Person","Organization"].
    const mappedSheets = syntheticSheetMap[target.targetSheet] || [target.targetSheet];
    let rule = null;

    // Try to build a dropdown referencing the first valid target sheet/column encountered.
    for (const sheetName of mappedSheets) {
      const targetSheet = ss.getSheetByName(sheetName);
      if (!targetSheet) {
        Logger.log(`⚠️ Target sheet '${sheetName}' not found.`);
        continue;
      }

      // Translate target slot name -> displayed column title -> target column index.
      const targetColName = columnTitlesBySheet[sheetName]?.[target.targetColumn];
      if (!targetColName) {
        Logger.log(`⚠️ Target column '${target.targetColumn}' not mapped in '${sheetName}'`);
        continue;
      }

      const headerRow = targetSheet.getRange("1:1").getValues()[0];
      const targetColIndex = headerRow.indexOf(targetColName) + 1;
      if (targetColIndex < 1) {
        Logger.log(`⚠️ Target column title '${targetColName}' not found in header of '${sheetName}'`);
        Logger.log(`🔎 Header row was: ${JSON.stringify(headerRow)}`);
        continue;
      }

      // Build an open-ended A2:A-style range reference for the target column values (skip header).
      const colLetter = String.fromCharCode(64 + targetColIndex);  // A, B, ...
      const rangeRef = `${colLetter}2:${colLetter}`;  // e.g. A2:A

      Logger.log(`🔗 Creating live dropdown link from '${sourceSheetName}.${sourceColName}' to '${sheetName}!${rangeRef}'`);

      // Create a data-validation rule that constrains entries to values present in the target range.
      // The second arg (true) means the user sees invalid entry warnings but cannot enter values outside the list.
      rule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(targetSheet.getRange(rangeRef), true)
        .setAllowInvalid(false)
        .build();

      // Stop after the first successfully resolved target sheet/column.
      break;
    }

    // Apply the constructed validation rule to the source column's data range.
    if (rule) {
      sourceRange.setDataValidation(rule);
      Logger.log(`🎯 Dropdown applied to ${sourceSheetName}!${sourceColName}`);
    } else {
      Logger.log(`⚠️ No valid dropdown range found for '${sourceSheetName}.${sourceColName}'`);
    }
  });

}

// Queries the GitHub Contents API for available *.schema.json files under `remote/`,
// filters out blacklisted schemas, and returns the file names.
function fetchSchemaFileList() {
  const blacklist = ["unioned-identifiers.schema.json"];

  // Optional GitHub token to increase rate limits / access private forks; read from script properties.
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  const headers = token ? { Authorization: "Bearer " + token } : {};

  // Call the Contents API endpoint.
  const response = UrlFetchApp.fetch(GITHUB_API_URL, { headers, muteHttpExceptions: true });

  // Fail fast if non-200.
  if (response.getResponseCode() !== 200) {
    throw new Error(`GitHub API error ${response.getResponseCode()}: ${response.getContentText()}`);
  }

  // Keep only *.schema.json and not blacklisted, return names as strings.
  return JSON.parse(response.getContentText())
    .filter(f => f.name.endsWith(".schema.json"))
    .filter(f => !blacklist.includes(f.name))
    .map(f => f.name);
}

// Fetches and parses the YAML file that holds slot descriptions.
// The parser is intentionally lightweight: it walks lines, tracks the current slot,
// and captures `description:` fields (including block scalars using `|`).
// Returns an object: { slotName: "description text", ... } used by headerCell.setNote(desc).
// Fetches and parses the YAML that holds slot metadata.
// Returns an object keyed by slot name:
// { slotName: { description, required, multivalued, range, pattern }, ... }
function fetchSlotDescriptions() {
  const yaml = fetchWithRetry(SLOT_YAML_URL);
  const result = {};

  const lines = yaml.split("\n");

  // Parsing state
  let currentSlot = null;
  let captureMultilineDesc = false;
  let multilineBuffer = [];
  let baseIndentForBlock = 0;

  // Helper to flush a pending block description into the slot record
  function flushBlockDesc() {
    if (currentSlot && captureMultilineDesc) {
      const desc = multilineBuffer.join("\n").replace(/\s+$/g, "").trim();
      result[currentSlot] = result[currentSlot] || {};
      result[currentSlot].description = desc;
      captureMultilineDesc = false;
      multilineBuffer = [];
      baseIndentForBlock = 0;
    }
  }

  // Simple, indentation-tolerant matchers
  const slotHeaderRe = /^(\s*)([A-Za-z0-9_]+):\s*$/;
  const keyValRe = /^\s*([A-Za-z0-9_]+):\s*(.*)$/;

  function parseBoolOrString(raw) {
    const v = raw.trim().replace(/^['"]|['"]$/g, "");
    const lower = v.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    if (lower === "yes") return true;
    if (lower === "no") return false;
    // leave numbers/regex/other strings intact
    return v;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      // Comments/blank lines: if we are capturing a block, keep them as content
      if (captureMultilineDesc && currentSlot) {
        // Preserve blank/comment lines inside block scalars by adding raw content (minus base indent)
        multilineBuffer.push(line.slice(baseIndentForBlock));
      }
      continue;
    }

    // If we hit a new slot header, finish any pending block description
    let m = line.match(slotHeaderRe);
    if (m) {
      flushBlockDesc();
      currentSlot = m[2];
      result[currentSlot] = result[currentSlot] || {};
      continue;
    }

    // If we're inside a description block, keep collecting lines as long as they stay indented
    if (captureMultilineDesc && currentSlot) {
      // A block scalar continues while indentation > baseIndentForBlock
      const currentIndent = line.match(/^\s*/)[0].length;
      if (currentIndent >= baseIndentForBlock) {
        multilineBuffer.push(line.slice(baseIndentForBlock));
        continue;
      } else {
        // indentation dropped: block ends, process this line in normal flow
        flushBlockDesc();
        // fall through to normal parsing of this line
      }
    }

    // Key/value lines
    m = line.match(keyValRe);
    if (!m || !currentSlot) {
      // Not a key/value under a slot; ignore
      continue;
    }

    const key = m[1];
    let val = m[2];

    // Handle description specially (inline scalar vs block scalar)
    if (key === "description") {
      if (val.trim() === "|" || val.trim() === ">|") {
        // Start block scalar; remember the indent for subsequent lines
        captureMultilineDesc = true;
        multilineBuffer = [];
        baseIndentForBlock = (lines[i + 1] || "").match(/^\s*/)[0].length; // next line's indent as baseline
      } else {
        // Inline description
        result[currentSlot] = result[currentSlot] || {};
        result[currentSlot].description = val.trim().replace(/^['"]|['"]$/g, "");
      }
      continue;
    }

    // Regular scalar values for other fields we care about
    if (["required", "multivalued", "range", "pattern"].includes(key)) {
      result[currentSlot] = result[currentSlot] || {};
      result[currentSlot][key] = parseBoolOrString(val);
      continue;
    }

    // Ignore other keys
  }

  // If the file ended while capturing a block, flush it.
  flushBlockDesc();

  return result;
}

// Fetch a URL with simple retry/backoff to tolerate transient network hiccups.
// Used for both YAML and JSON schema fetches.
function fetchWithRetry(url, retries = 5, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return UrlFetchApp.fetch(url).getContentText();
    } catch (e) {
      if (i === retries - 1) throw e;
      Utilities.sleep(delayMs + Math.floor(Math.random() * 500));
    }
  }
}