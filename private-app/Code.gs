/**********************************************************************
 * Denis's Private Dashboard — Google Apps Script backend
 *
 * Features: To-Do · Reminders (with email) · Personal Vault · Notes
 * Storage:  A single Google Sheet (auto-created on first run)
 * Privacy:  Deploy as "Execute as: Me" + "Who has access: Only myself".
 *           Every request is additionally verified against OWNER_EMAIL.
 *
 * >>> SET THIS to your Google account email <<<
 **********************************************************************/
const OWNER_EMAIL = "denispatel01@gmail.com";

// Sheet tabs used as tables
const SHEETS = {
  todos: ["id", "title", "done", "priority", "created"],
  reminders: ["id", "title", "remindAt", "notified", "created"],
  vault: ["id", "label", "value", "category", "created"],
  notes: ["id", "title", "body", "updated"],
};

/* ------------------------------------------------------------------ */
/*  Web app entry point                                                */
/* ------------------------------------------------------------------ */
function doGet() {
  if (!isOwner()) {
    return HtmlService.createHtmlOutput(
      "<h2 style='font-family:sans-serif'>403 — This is a private application.</h2>"
    );
  }
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("My Private Dashboard")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setFaviconUrl("https://ssl.gstatic.com/docs/script/images/favicon.ico");
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/* ------------------------------------------------------------------ */
/*  Security                                                           */
/* ------------------------------------------------------------------ */
function isOwner() {
  const email = Session.getActiveUser().getEmail();
  return email && email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

function assertOwner() {
  if (!isOwner()) throw new Error("Unauthorized");
}

/* ------------------------------------------------------------------ */
/*  Spreadsheet bootstrap                                              */
/* ------------------------------------------------------------------ */
function getSpreadsheet() {
  const props = PropertiesService.getUserProperties();
  let id = props.getProperty("SS_ID");
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { id = null; }
  }
  if (!id) {
    ss = SpreadsheetApp.create("Private Dashboard — Data (do not delete)");
    props.setProperty("SS_ID", ss.getId());
  }
  // Ensure each tab exists with headers
  Object.keys(SHEETS).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.appendRow(SHEETS[name]);
      sh.setFrozenRows(1);
    }
  });
  const def = ss.getSheetByName("Sheet1");
  if (def) ss.deleteSheet(def);
  return ss;
}

function sheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

/* ------------------------------------------------------------------ */
/*  Generic row helpers                                                */
/* ------------------------------------------------------------------ */
function readAll(name) {
  assertOwner();
  const sh = sheet(name);
  const values = sh.getDataRange().getValues();
  const headers = SHEETS[name];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    headers.forEach(function (h, c) { obj[h] = values[i][c]; });
    if (obj.id !== "" && obj.id != null) rows.push(obj);
  }
  return rows;
}

function findRowIndex(sh, id) {
  const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (let i = 1; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 1; // 1-based sheet row
  }
  return -1;
}

function newId() {
  return Utilities.getUuid().slice(0, 8);
}

/* ------------------------------------------------------------------ */
/*  TO-DO                                                              */
/* ------------------------------------------------------------------ */
function getTodos() { return readAll("todos"); }

function addTodo(title, priority) {
  assertOwner();
  const id = newId();
  sheet("todos").appendRow([id, title, false, priority || "normal", new Date()]);
  return getTodos();
}

function toggleTodo(id) {
  assertOwner();
  const sh = sheet("todos");
  const r = findRowIndex(sh, id);
  if (r > 0) {
    const cur = sh.getRange(r, 3).getValue();
    sh.getRange(r, 3).setValue(!cur);
  }
  return getTodos();
}

function deleteTodo(id) {
  assertOwner();
  const sh = sheet("todos");
  const r = findRowIndex(sh, id);
  if (r > 0) sh.deleteRow(r);
  return getTodos();
}

/* ------------------------------------------------------------------ */
/*  REMINDERS                                                          */
/* ------------------------------------------------------------------ */
function getReminders() { return readAll("reminders"); }

function addReminder(title, remindAtISO) {
  assertOwner();
  const id = newId();
  sheet("reminders").appendRow([id, title, remindAtISO, false, new Date()]);
  return getReminders();
}

function deleteReminder(id) {
  assertOwner();
  const sh = sheet("reminders");
  const r = findRowIndex(sh, id);
  if (r > 0) sh.deleteRow(r);
  return getReminders();
}

/**
 * Run by a time-driven trigger (see setupTrigger). Emails you any
 * reminder whose time has passed and that hasn't been notified yet.
 */
function checkReminders() {
  const sh = sheet("reminders");
  const values = sh.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    const [id, title, remindAt, notified] = values[i];
    if (!id || notified) continue;
    const when = new Date(remindAt);
    if (when <= now) {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: "⏰ Reminder: " + title,
        body: "This is your reminder:\n\n" + title +
              "\n\nScheduled for: " + when.toLocaleString(),
      });
      sh.getRange(i + 1, 4).setValue(true); // mark notified
    }
  }
}

/** Run ONCE from the editor to enable reminder emails. */
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "checkReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("checkReminders").timeBased().everyMinutes(5).create();
  return "Reminder trigger installed — checks every 5 minutes.";
}

/* ------------------------------------------------------------------ */
/*  PERSONAL VAULT                                                     */
/* ------------------------------------------------------------------ */
function getVault() { return readAll("vault"); }

function addVaultItem(label, value, category) {
  assertOwner();
  const id = newId();
  sheet("vault").appendRow([id, label, value, category || "General", new Date()]);
  return getVault();
}

function deleteVaultItem(id) {
  assertOwner();
  const sh = sheet("vault");
  const r = findRowIndex(sh, id);
  if (r > 0) sh.deleteRow(r);
  return getVault();
}

/* ------------------------------------------------------------------ */
/*  NOTES                                                              */
/* ------------------------------------------------------------------ */
function getNotes() { return readAll("notes"); }

function saveNote(id, title, body) {
  assertOwner();
  const sh = sheet("notes");
  if (id) {
    const r = findRowIndex(sh, id);
    if (r > 0) {
      sh.getRange(r, 2, 1, 3).setValues([[title, body, new Date()]]);
      return getNotes();
    }
  }
  sh.appendRow([newId(), title, body, new Date()]);
  return getNotes();
}

function deleteNote(id) {
  assertOwner();
  const sh = sheet("notes");
  const r = findRowIndex(sh, id);
  if (r > 0) sh.deleteRow(r);
  return getNotes();
}

/* ------------------------------------------------------------------ */
/*  Dashboard summary                                                  */
/* ------------------------------------------------------------------ */
function getSummary() {
  assertOwner();
  const todos = getTodos();
  const reminders = getReminders();
  return {
    email: Session.getActiveUser().getEmail(),
    openTodos: todos.filter(function (t) { return !t.done; }).length,
    totalTodos: todos.length,
    upcomingReminders: reminders.filter(function (r) { return !r.notified; }).length,
    vaultItems: getVault().length,
    notes: getNotes().length,
  };
}
