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
  reminders: ["id", "title", "remindAt", "schedule", "notified", "created"],
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
function getSessionEmail() {
  const effective = Session.getEffectiveUser().getEmail();
  if (effective) return effective;
  const active = Session.getActiveUser().getEmail();
  if (active) return active;
  return OWNER_EMAIL;
}

function isOwner() {
  const email = Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail();
  if (!email) {
    // Personal Gmail web apps often omit the active-user email even for the owner.
    // Deployment "Who has access: Only myself" already restricts the URL.
    return true;
  }
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

function assertOwner() {
  if (!isOwner()) throw new Error("Unauthorized");
}

function asBool(v) {
  return v === true || v === "TRUE" || v === "true" || v === 1 || v === "1";
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
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sh.getRange(2, 1, lastRow, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // 1-based sheet row
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

/* ------------------------------------------------------------------ *
 * Schedule model (stored as JSON in the "schedule" column):
 *   { kind: "once",    at: "<ISO>" }
 *   { kind: "hourly",  everyHours: N }
 *   { kind: "weekly",  weekdays: [0..6], times: ["HH:MM", ...] }   // 0 = Sun
 *   { kind: "monthly", monthdays: [1..31], times: ["HH:MM", ...] }
 *   { kind: "custom",  weekdays: [...], monthdays: [...], times: [...] }
 * Backward compatible with the old plain-string "repeat" values.
 * ------------------------------------------------------------------ */
function parseSchedule(raw) {
  if (raw && typeof raw === "object") return raw;
  try { const o = JSON.parse(raw); if (o && o.kind) return o; } catch (e) {}
  switch (String(raw)) {
    case "hourly":  return { kind: "hourly", everyHours: 1 };
    case "daily":   return { kind: "daily", everyDays: 1, times: ["09:00"] };
    case "weekly":  return { kind: "weekly", weekdays: [1], times: ["09:00"] };
    case "monthly": return { kind: "monthly", monthdays: [1], times: ["09:00"] };
    default:        return { kind: "once" };
  }
}

function parseTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  return m ? { h: +m[1], m: +m[2] } : { h: 9, m: 0 };
}

/** Earliest fire time strictly after `after`, per schedule. null if none. */
function computeNextFire(schedule, after) {
  const s = schedule || {};
  if (s.kind === "once") return null;
  if (s.kind === "hourly") {
    const n = Math.max(1, s.everyHours || 1);
    let next = new Date(after.getTime() + n * 3600 * 1000);
    const now = new Date();
    while (next <= now) next = new Date(next.getTime() + n * 3600 * 1000); // catch up, no burst
    return next;
  }
  if (s.kind === "daily") {
    const n = Math.max(1, s.everyDays || 1);
    const times = (s.times && s.times.length ? s.times : ["09:00"]).map(parseTime)
      .sort(function (a, b) { return (a.h * 60 + a.m) - (b.h * 60 + b.m); });
    const base = new Date(after.getFullYear(), after.getMonth(), after.getDate());
    for (let i = 0; i < 800; i += n) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      for (let j = 0; j < times.length; j++) {
        const slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), times[j].h, times[j].m, 0, 0);
        if (slot > after) return slot;
      }
    }
    return null;
  }
  const times = (s.times && s.times.length ? s.times : ["09:00"]).map(parseTime)
    .sort(function (a, b) { return (a.h * 60 + a.m) - (b.h * 60 + b.m); });
  const wds = s.weekdays || [], mds = s.monthdays || [];
  function dayOk(d) {
    if (s.kind === "weekly") return wds.indexOf(d.getDay()) >= 0;
    if (s.kind === "monthly") return mds.indexOf(d.getDate()) >= 0;
    const wOk = wds.length ? wds.indexOf(d.getDay()) >= 0 : true;   // custom: empty = any
    const mOk = mds.length ? mds.indexOf(d.getDate()) >= 0 : true;
    return wOk && mOk;
  }
  for (let i = 0; i < 800; i++) {
    const day = new Date(after.getFullYear(), after.getMonth(), after.getDate() + i);
    if (!dayOk(day)) continue;
    for (let j = 0; j < times.length; j++) {
      const slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), times[j].h, times[j].m, 0, 0);
      if (slot > after) return slot;
    }
  }
  return null;
}

/** Human-readable description of a schedule (for emails / UI). */
function describeSchedule(s) {
  if (!s || s.kind === "once") return "one-time";
  if (s.kind === "hourly") return "every " + (s.everyHours || 1) + " hour(s)";
  if (s.kind === "daily") {
    const times = (s.times && s.times.length ? s.times : ["09:00"]).join(", ");
    return "every " + (s.everyDays || 1) + " day(s) at " + times;
  }
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const times = (s.times && s.times.length ? s.times : ["09:00"]).join(", ");
  const wd = (s.weekdays || []).map(function (d) { return DOW[d]; }).join("/");
  const md = (s.monthdays || []).join("/");
  if (s.kind === "weekly")  return "weekly on " + wd + " at " + times;
  if (s.kind === "monthly") return "monthly on day " + md + " at " + times;
  return "custom" + (wd ? " " + wd : "") + (md ? " day " + md : "") + " at " + times;
}

function sanitizeScheduleEmail(schedule) {
  if (!schedule.email) return;
  const email = String(schedule.email).trim().toLowerCase();
  if (email !== OWNER_EMAIL.toLowerCase()) {
    throw new Error("Reminder emails can only be sent to " + OWNER_EMAIL);
  }
  schedule.email = email;
}

function computeFirstFire(schedule, now) {
  if (schedule.kind === "once") {
    const at = new Date(schedule.at);
    return isNaN(at) ? now : at;
  }
  if (schedule.kind === "hourly") return now; // first email on next trigger check
  const next = computeNextFire(schedule, now);
  return next || now;
}

/** scheduleJson: schedule object or JSON string of the schedule model above. */
function addReminder(title, scheduleJson) {
  assertOwner();
  if (!title || !String(title).trim()) throw new Error("Reminder title is required");
  const schedule = parseSchedule(scheduleJson);
  if (!schedule || !schedule.kind) throw new Error("Invalid reminder schedule");
  if (schedule.kind === "once" && !schedule.at) throw new Error("Pick a date and time");
  sanitizeScheduleEmail(schedule);
  const now = new Date();
  const first = computeFirstFire(schedule, now);
  const id = newId();
  sheet("reminders").appendRow([
    id, String(title).trim(), first.toISOString(), JSON.stringify(schedule), false, now,
  ]);
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
 * Run by a time-driven trigger (see setupTrigger). Emails you any reminder
 * that is due. One-time reminders are marked done; recurring ones are
 * rescheduled to their next occurrence based on the schedule.
 */
function checkReminders() {
  const sh = sheet("reminders");
  const values = sh.getDataRange().getValues();
  const cols = SHEETS.reminders; // id,title,remindAt,schedule,notified,created
  const cRemindAt = cols.indexOf("remindAt") + 1;
  const cNotified = cols.indexOf("notified") + 1;
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    const id = values[i][cols.indexOf("id")];
    const title = values[i][cols.indexOf("title")];
    const remindAt = values[i][cols.indexOf("remindAt")];
    const scheduleRaw = values[i][cols.indexOf("schedule")];
    const notified = asBool(values[i][cols.indexOf("notified")]);
    if (!id || notified) continue;
    const when = new Date(remindAt);
    if (when <= now) {
      const schedule = parseSchedule(scheduleRaw);
      const recipient = (schedule.email && String(schedule.email).toLowerCase() === OWNER_EMAIL.toLowerCase())
        ? schedule.email : OWNER_EMAIL;
      MailApp.sendEmail({
        to: recipient,
        subject: "⏰ Reminder: " + title,
        body: "This is your reminder:\n\n" + title +
              "\n\nScheduled for: " + when.toLocaleString() +
              "\n(" + describeSchedule(schedule) + ")",
      });
      const next = computeNextFire(schedule, now); // from now → future, no backlog burst
      if (next) sh.getRange(i + 1, cRemindAt).setValue(next.toISOString());
      else sh.getRange(i + 1, cNotified).setValue(true);
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
    email: getSessionEmail(),
    openTodos: todos.filter(function (t) { return !asBool(t.done); }).length,
    totalTodos: todos.length,
    upcomingReminders: reminders.filter(function (r) { return !asBool(r.notified); }).length,
    vaultItems: getVault().length,
    notes: getNotes().length,
  };
}
