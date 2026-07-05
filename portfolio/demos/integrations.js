/* Integration Hub — simulated integration triggers with call logs. */
(function () {
  const $ = s => document.querySelector(s);

  const INTEGRATIONS = [
    { key: "erpnext", ic: "🔄", name: "ERPNext CRM", desc: "Sync admission leads to the CRM.", btn: "Sync 3 new leads",
      steps: [
        ['<span class="info">POST</span> /api/erpnext/leads (token auth)', 500],
        ['<span class="ok">201</span> Lead created — Patel family (Grade 5)', 400],
        ['<span class="ok">201</span> Lead created — Shah family (Grade 1)', 400],
        ['<span class="ok">201</span> Lead created — Mehta family (Grade 9)', 400],
        ['<span class="ok">✓</span> 3 leads synced · 0 duplicates', 300],
      ] },
    { key: "whatsapp", ic: "💬", name: "WhatsApp Business API", desc: "Send transport route alerts to parents.", btn: "Send route alert",
      steps: [
        ['<span class="info">POST</span> /interakt/messages (template: bus_delay)', 500],
        ['<span class="ok">200</span> Queued for 42 recipients', 500],
        ['<span class="ok">✓</span> 42 delivered · 0 failed', 400],
      ] },
    { key: "oauth", ic: "🔑", name: "Google OAuth", desc: "Sign in with a school Google account.", btn: "Simulate login",
      steps: [
        ['<span class="info">GET</span> accounts.google.com/o/oauth2/auth', 500],
        ['<span class="ok">✓</span> Consent granted · id_token received', 500],
        ['<span class="info">→</span> Verifying token signature + audience…', 400],
        ['<span class="ok">✓</span> Signed in as staff@fountainhead.edu', 300],
      ] },
    { key: "s3", ic: "☁️", name: "AWS S3 Upload", desc: "Store a student document in S3.", btn: "Upload document",
      steps: [
        ['<span class="info">PUT</span> s3://nucleus-docs/students/DT1042/report.pdf', 600],
        ['<span class="info">→</span> Multipart upload (1.4 MB)…', 700],
        ['<span class="ok">200</span> ETag confirmed · stored (AES-256)', 400],
        ['<span class="ok">✓</span> Signed URL generated (expires 15 min)', 300],
      ] },
  ];

  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); }
  const log = $("#log");
  function write(html) { if (log.querySelector(".dim")) log.innerHTML = ""; log.innerHTML += html + "<br>"; log.scrollTop = log.scrollHeight; }

  $("#cards").innerHTML = INTEGRATIONS.map(x => `
    <div class="panel" style="margin-bottom:0">
      <h3>${x.ic} ${x.name} <span class="bdg green" id="st-${x.key}" style="margin-left:auto">● connected</span></h3>
      <p class="sub" style="margin:-6px 0 12px">${x.desc}</p>
      <button class="dbtn sm" data-k="${x.key}">${x.btn}</button>
    </div>`).join("");

  $("#cards").addEventListener("click", e => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    const x = INTEGRATIONS.find(i => i.key === b.dataset.k);
    b.disabled = true;
    write(`<span class="dim">— ${x.name} —</span>`);
    let t = 0;
    x.steps.forEach(([msg, d]) => { t += d; setTimeout(() => write(msg), t); });
    setTimeout(() => { b.disabled = false; toast(x.name + " ✓"); }, t + 200);
  });

  $("#clear").addEventListener("click", () => { log.innerHTML = '<span class="dim">Cleared. Trigger an integration above…</span>'; });
})();
