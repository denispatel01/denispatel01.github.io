/* Nucleus EDU — interactive demo. All client-side, seeded per campus. */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // --- Seeded RNG so each campus has stable, distinct data ---
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }
  const CAMPUS = {
    downtown:  { name: "Downtown",  seed: 101, students: 820, collect: 94 },
    riverside: { name: "Riverside", seed: 233, students: 560, collect: 88 },
    hilltop:   { name: "Hilltop",   seed: 377, students: 410, collect: 91 },
  };
  const FIRST = ["Aarav","Isha","Vivaan","Anaya","Kabir","Diya","Reyansh","Myra","Arjun","Sara","Ved","Kiara","Neil","Zara","Ansh","Riya","Dev","Aisha","Yug","Tara"];
  const LAST = ["Patel","Shah","Mehta","Desai","Iyer","Nair","Rao","Kapoor","Reddy","Joshi","Gupta","Sharma","Bose","Menon"];
  const GRADES = ["Grade 1","Grade 3","Grade 5","Grade 7","Grade 9","Grade 11"];
  const SOURCES = ["Website","Walk-in","Referral","Google Ad","Event"];

  let campus = "downtown";
  let students = [], fees = [], admissions = [], trend = [];
  let stuPage = 1, stuQuery = "", feeFilterVal = "all";
  const PAGE = 8;

  function build() {
    const c = CAMPUS[campus];
    const rnd = seeded(c.seed);
    const pick = arr => arr[Math.floor(rnd() * arr.length)];

    students = Array.from({ length: c.students }, (_, i) => {
      const name = pick(FIRST) + " " + pick(LAST);
      return {
        id: c.name.slice(0,2).toUpperCase() + String(1000 + i),
        name, grade: pick(GRADES),
        guardian: pick(LAST) + " family",
        status: rnd() > 0.06 ? "Active" : "On leave",
      };
    });

    // Fees for a sample of students
    fees = students.slice(0, 60).map(s => {
      const fee = 25000 + Math.floor(rnd() * 15000);
      const r = rnd();
      let paid, status;
      if (r > 0.45) { paid = fee; status = "Paid"; }
      else if (r > 0.2) { paid = Math.floor(fee * 0.5); status = "Pending"; }
      else { paid = 0; status = "Overdue"; }
      return { name: s.name, grade: s.grade, fee, paid, status };
    });

    admissions = Array.from({ length: 6 }, (_, i) => ({
      id: "INQ-" + (c.seed + i),
      parent: pick(LAST) + " family",
      grade: pick(GRADES),
      source: pick(SOURCES),
      synced: false,
    }));

    // 30-day attendance trend (85–98%)
    trend = Array.from({ length: 30 }, () => Math.round((88 + rnd() * 9) * 10) / 10);
    stuPage = 1; stuQuery = ""; if ($("#stuSearch")) $("#stuSearch").value = "";
  }

  /* ---------- Rendering ---------- */
  const money = n => "₹" + n.toLocaleString("en-IN");

  function renderDashboard() {
    const c = CAMPUS[campus];
    const active = students.filter(s => s.status === "Active").length;
    const collected = fees.reduce((a, f) => a + f.paid, 0);
    const billed = fees.reduce((a, f) => a + f.fee, 0);
    const pct = Math.round(collected / billed * 100);
    $("#statRow").innerHTML = [
      ["🎓", students.length, "Total students", ""],
      ["✅", active, "Active today", "up"],
      ["💳", pct + "%", "Fees collected", pct >= 90 ? "up" : "down"],
      ["📝", admissions.length, "Open inquiries", ""],
    ].map(([ic, v, k, d]) => `<div class="stat"><div class="v">${ic} ${v}</div><div class="k">${k}</div>${d ? `<div class="d ${d}">${d==='up'?'▲ on track':'▼ needs attention'}</div>` : ""}</div>`).join("");

    // Fee collection bars (6 months)
    const rnd = seeded(c.seed + 7);
    const months = ["Jan","Feb","Mar","Apr","May","Jun"];
    const feeVals = months.map(() => Math.round(60 + rnd() * 40));
    $("#feeChart").innerHTML = barChart(months, feeVals, v => v + "%");

    // Attendance by grade
    const rnd2 = seeded(c.seed + 13);
    const attVals = GRADES.map(() => Math.round(85 + rnd2() * 13));
    $("#attChart").innerHTML = barChart(GRADES.map(g => g.replace("Grade ", "G")), attVals, v => v + "%");

    $("#activityLog").innerHTML = [
      `<span class="dim">10:24</span> <span class="ok">✓</span> Fee payment received — ${students[3].name} (${money(fees[3]?.fee||30000)})`,
      `<span class="dim">10:11</span> <span class="info">↻</span> WhatsApp transport alert sent to 42 parents`,
      `<span class="dim">09:52</span> <span class="ok">✓</span> Admission inquiry synced to ERPNext CRM`,
      `<span class="dim">09:30</span> <span class="warn">!</span> 3 fee payments overdue — reminders queued`,
    ].join("<br>");
  }

  function barChart(labels, vals, fmt) {
    const max = Math.max(...vals, 1);
    return labels.map((l, i) =>
      `<div class="bar-col"><span class="bv">${fmt(vals[i])}</span>
       <div class="bar" style="height:${vals[i] / max * 100}%"></div>
       <span class="bl">${l}</span></div>`).join("");
  }

  function renderStudents() {
    const q = stuQuery.toLowerCase();
    const filtered = q ? students.filter(s =>
      s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) : students;
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
    if (stuPage > pages) stuPage = pages;
    const start = (stuPage - 1) * PAGE;
    const rows = filtered.slice(start, start + PAGE);
    $("#stuBody").innerHTML = rows.map(s => `<tr>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--muted)">${s.id}</td>
      <td>${s.name}</td><td>${s.grade}</td><td>${s.guardian}</td>
      <td><span class="bdg ${s.status === 'Active' ? 'green' : 'amber'}">${s.status}</span></td></tr>`).join("")
      || `<tr><td colspan="5" style="color:var(--muted)">No students match "${stuQuery}".</td></tr>`;
    $("#stuCount").textContent = filtered.length + " students";
    $("#stuRange").textContent = filtered.length ? `${start + 1}–${Math.min(start + PAGE, filtered.length)} of ${filtered.length}` : "0 results";
    $("#stuPrev").disabled = stuPage <= 1;
    $("#stuNext").disabled = stuPage >= pages;
  }

  function renderFees() {
    const collected = fees.reduce((a, f) => a + f.paid, 0);
    const billed = fees.reduce((a, f) => a + f.fee, 0);
    const overdue = fees.filter(f => f.status === "Overdue").length;
    $("#feeStats").innerHTML = [
      ["Collected", money(collected), "up"],
      ["Outstanding", money(billed - collected), "down"],
      ["Overdue accounts", overdue, ""],
    ].map(([k, v, d]) => `<div class="stat"><div class="v" style="font-size:1.4rem">${v}</div><div class="k">${k}</div></div>`).join("");

    const list = feeFilterVal === "all" ? fees : fees.filter(f => f.status === feeFilterVal);
    $("#feeBody").innerHTML = list.slice(0, 15).map(f => {
      const cls = f.status === "Paid" ? "green" : f.status === "Pending" ? "amber" : "red";
      return `<tr><td>${f.name}</td><td>${f.grade}</td><td>${money(f.fee)}</td><td>${money(f.paid)}</td>
        <td><span class="bdg ${cls}">${f.status}</span></td>
        <td>${f.status !== "Paid" ? '<button class="dbtn sm ghost" onclick="this.textContent=\'✓ Recorded\';this.disabled=true">Record payment</button>' : ""}</td></tr>`;
    }).join("");
  }

  function renderAttendance() {
    const avg = Math.round(trend.reduce((a, b) => a + b, 0) / trend.length * 10) / 10;
    const today = trend[trend.length - 1];
    const low = Math.min(...trend);
    $("#attStats").innerHTML = [
      ["Today", today + "%"], ["30-day average", avg + "%"], ["Lowest day", low + "%"],
    ].map(([k, v]) => `<div class="stat"><div class="v">${v}</div><div class="k">${k}</div></div>`).join("");
    $("#trendChart").innerHTML = lineChart(trend);
  }

  function lineChart(vals) {
    const W = 640, H = 200, pad = 30;
    const min = Math.floor(Math.min(...vals) - 2), max = Math.ceil(Math.max(...vals) + 1);
    const x = i => pad + i / (vals.length - 1) * (W - pad * 2);
    const y = v => H - pad - (v - min) / (max - min) * (H - pad * 2);
    const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const area = `M ${x(0)},${H - pad} L ` + vals.map((v, i) => `${x(i)},${y(v)}`).join(" L ") + ` L ${x(vals.length - 1)},${H - pad} Z`;
    const grid = [min, Math.round((min + max) / 2), max].map(g =>
      `<line x1="${pad}" y1="${y(g)}" x2="${W - pad}" y2="${y(g)}" stroke="#2a3140" stroke-width="1"/>
       <text x="4" y="${y(g) + 4}" fill="#8b93a7" font-size="10">${g}%</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:520px">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6ea8fe" stop-opacity=".35"/><stop offset="1" stop-color="#6ea8fe" stop-opacity="0"/></linearGradient></defs>
      ${grid}
      <path d="${area}" fill="url(#lg)"/>
      <polyline points="${pts}" fill="none" stroke="#6ea8fe" stroke-width="2.5" stroke-linejoin="round"/>
      ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="#a78bfa"/>`).join("")}
    </svg>`;
  }

  function renderAdmissions() {
    $("#admBody").innerHTML = admissions.map(a => `<tr>
      <td style="font-family:'JetBrains Mono',monospace;color:var(--muted)">${a.id}</td>
      <td>${a.parent}</td><td>${a.grade}</td><td>${a.source}</td>
      <td><span class="bdg ${a.synced ? 'green' : 'gray'}" id="crm-${a.id}">${a.synced ? '✓ Synced' : 'Not synced'}</span></td></tr>`).join("");
  }

  /* ---------- Interactions ---------- */
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); }

  const TITLES = {
    dashboard: ["Dashboard", "Overview for the selected campus"],
    students: ["Students", "Searchable, paginated student directory"],
    fees: ["Fees", "Fee ledger and collection tracking"],
    attendance: ["Attendance", "Whole-school trends and daily report"],
    admissions: ["Admissions", "Inquiries and ERPNext CRM sync"],
  };

  function show(view) {
    $$(".demo-view").forEach(v => v.classList.remove("active"));
    $("#v-" + view).classList.add("active");
    $$("#appNav button").forEach(b => b.classList.toggle("active", b.dataset.v === view));
    $("#viewTitle").textContent = TITLES[view][0];
    $("#viewSub").textContent = TITLES[view][1];
    if (view === "dashboard") renderDashboard();
    if (view === "students") renderStudents();
    if (view === "fees") renderFees();
    if (view === "attendance") renderAttendance();
    if (view === "admissions") renderAdmissions();
  }

  function reloadCampus() {
    build();
    $("#tenantLabel").textContent = "Campus: " + CAMPUS[campus].name;
    const active = $("#appNav button.active")?.dataset.v || "dashboard";
    show(active);
    toast("🔄 Loaded " + CAMPUS[campus].name + " campus (tenant switched)");
  }

  // Nav
  $("#appNav").addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.v); });
  $("#campusSel").addEventListener("change", e => { campus = e.target.value; reloadCampus(); });

  // Students search + pager
  $("#stuSearch").addEventListener("input", e => { stuQuery = e.target.value; stuPage = 1; renderStudents(); });
  $("#stuPrev").addEventListener("click", () => { stuPage--; renderStudents(); });
  $("#stuNext").addEventListener("click", () => { stuPage++; renderStudents(); });

  // Fees filter
  $("#feeFilter").addEventListener("change", e => { feeFilterVal = e.target.value; renderFees(); });

  // Attendance report simulation
  $("#sendReport").addEventListener("click", () => {
    const log = $("#reportLog"); log.innerHTML = "";
    const steps = [
      ['<span class="info">↻</span> Aggregating attendance across the school…', 300],
      ['<span class="info">↻</span> Computing grade-wise + trend analytics…', 600],
      ['<span class="info">↻</span> Rendering dynamic HTML report…', 500],
      [`<span class="ok">✓</span> Report emailed to 6 stakeholders — school avg ${trend[trend.length-1]}%`, 400],
    ];
    let t = 0;
    steps.forEach(([msg, d]) => { t += d; setTimeout(() => { log.innerHTML += msg + "<br>"; }, t); });
  });

  // Admissions CRM sync simulation
  $("#syncCrm").addEventListener("click", () => {
    const btn = $("#syncCrm"), log = $("#syncLog");
    const pending = admissions.filter(a => !a.synced);
    if (!pending.length) { toast("All leads already synced ✓"); return; }
    btn.disabled = true; log.innerHTML = `<span class="info">↻</span> Connecting to ERPNext CRM API…<br>`;
    let t = 400;
    pending.forEach(a => {
      setTimeout(() => {
        a.synced = true;
        const badge = $("#crm-" + a.id);
        if (badge) { badge.className = "bdg green"; badge.textContent = "✓ Synced"; }
        log.innerHTML += `<span class="ok">✓</span> ${a.id} → Lead created in CRM (${a.parent})<br>`;
      }, t);
      t += 350;
    });
    setTimeout(() => {
      log.innerHTML += `<span class="ok">✓</span> Done — ${pending.length} leads synced, 0 duplicates.<br>`;
      btn.disabled = false; toast("Synced " + pending.length + " leads to CRM ✓");
    }, t);
  });

  // Boot
  build();
  $("#tenantLabel").textContent = "Campus: " + CAMPUS[campus].name;
  show("dashboard");
})();
