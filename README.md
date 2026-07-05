# Denis Patel — Portfolio & Private Dashboard

Two separate projects, each free forever, each on the platform that fits it best.

```
Digesh-Portfolio/
├── portfolio/        ← PUBLIC site (show off on Upwork/LinkedIn)
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── private-app/      ← PRIVATE personal app (Google Apps Script)
    ├── Code.gs
    ├── Index.html
    ├── Stylesheet.html
    ├── JavaScript.html
    └── README.md     ← setup steps for the private app
```

---

## 1. Public portfolio → deploy free

A fast, self-contained static site. Pick **any one** (all free, no card):

### Option A — Vercel (recommended, prettiest URL)
1. Push the `portfolio/` folder to a GitHub repo (or drag-drop at vercel.com).
2. Go to **https://vercel.com** → sign in with GitHub → **Add New → Project**.
3. Import the repo, set **Root Directory = `portfolio`**, click **Deploy**.
4. You get `https://your-name.vercel.app` in ~30 seconds. Add a custom domain later, free.

### Option B — GitHub Pages
1. Create a repo, put the **contents of `portfolio/`** at the repo root.
2. Repo **Settings → Pages → Source: Deploy from branch → `main` / root**.
3. Live at `https://<username>.github.io/<repo>/`.

### Option C — Netlify
Drag the `portfolio/` folder onto **https://app.netlify.com/drop**. Instantly live.

### Editing your portfolio
All content lives in **`portfolio/script.js`** — edit the `SKILLS`, `EXPERIENCE`,
and `PROJECTS` arrays at the top. No build step; just save and redeploy.

---

## 2. Private dashboard → see `private-app/README.md`

To-Do · Reminders (email) · Vault · Notes. Runs on Google Apps Script + Sheets,
private to your Google account only. Full setup steps in that folder's README.

---

## Why this split?
| | Public portfolio | Private app |
|---|---|---|
| Platform | Vercel / GitHub Pages | Google Apps Script |
| Cost | Free forever | Free forever |
| Who sees it | Everyone (clients) | Only you |
| Best at | Speed, looks, SEO | Auth + database, zero cost |
