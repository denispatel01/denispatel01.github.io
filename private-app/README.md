# 🔒 Private Dashboard — Google Apps Script

Your **private** personal app: To-Do, Reminders (with email), Personal Vault, and Notes.
Data lives in a Google Sheet that only you own. Only your Google account can open the app.

**100% free, forever. No credit card, ever.**

---

## One-time setup (~10 minutes)

### 1. Create the Apps Script project
1. Go to **https://script.google.com** → **New project**.
2. Rename it (top-left) to `Private Dashboard`.

### 2. Add the files
The editor starts with one file called `Code.gs`. Recreate these **4 files** exactly
(use the `+` next to *Files*; choose **Script** for `.gs`, **HTML** for the others):

| File in editor | Type   | Paste from this folder |
|----------------|--------|------------------------|
| `Code.gs`      | Script | `Code.gs`              |
| `Index`        | HTML   | `Index.html`           |
| `Stylesheet`   | HTML   | `Stylesheet.html`      |
| `JavaScript`   | HTML   | `JavaScript.html`      |

> ⚠️ Names must match **exactly** (no `.html` shown in the editor — Apps Script adds it).

### 3. Set your email
In `Code.gs`, line 12, confirm:
```js
const OWNER_EMAIL = "denispatel01@gmail.com";
```
Use the **exact** Google account you'll sign in with. Save (Ctrl+S).

### 4. Deploy as a private web app
1. Click **Deploy → New deployment**.
2. Gear icon ⚙️ → **Web app**.
3. Set:
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Only myself`  ← *this is what makes it private*
4. **Deploy** → authorize when prompted (choose your account → *Advanced* → *Go to project (unsafe)* → *Allow*). This "unsafe" warning is normal for your own scripts.
5. Copy the **Web app URL** — that's your private dashboard. Bookmark it.

### 5. Turn on reminder emails (recommended)
1. In the editor, open the function dropdown (top toolbar), pick **`setupTrigger`**.
2. Click **Run**. Authorize if asked.
3. Done — every 5 minutes the app checks for due reminders and emails you.

**Recurring reminders:** when adding a reminder you can choose a repeat —
**One-time, Every hour, Every day, Every week, or Every month**. One-time reminders
fire once and are marked done; recurring ones automatically reschedule to their next
occurrence after each email, so they keep going forever until you delete them.
(The 5-minute trigger means an email arrives within ~5 minutes of the due time.)

---

## Daily use
Just open your bookmarked Web app URL on any device, signed into your Google account.
Anyone else who opens it sees **“403 — private application.”**

## Where's my data?
A Google Sheet named **“Private Dashboard — Data (do not delete)”** in your Drive,
auto-created on first run. You can open it directly to back up or bulk-edit. Don't delete it.

## Updating the app later
Edit the files in the Apps Script editor, then **Deploy → Manage deployments →
edit (pencil) → Version: New version → Deploy**. Same URL stays valid.

## A note on the Vault
Values are stored in your private Google Sheet and blurred in the UI until clicked.
This is fine for personal info. Do **not** store your most critical secrets
(e.g. banking passwords) here — use a dedicated password manager for those.
