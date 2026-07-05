/* Attendance Analytics — daily report generator demo.
   Faithful recreation of the real "Attd. Summary" email, seeded by date. */
(function () {
  const $ = s => document.querySelector(s);

  // Fixed enrolment per grade (sums to 2615, like the real school)
  const GRADES = [
    ["Junior KG", 192], ["Senior KG", 192], ["Grade 1", 203], ["Grade 2", 198],
    ["Grade 3", 200], ["Grade 4", 193], ["Grade 5", 205], ["Grade 6", 188],
    ["Grade 7", 200], ["Grade 8", 192], ["Grade 9", 183], ["Grade 10", 155],
    ["Grade 11", 169], ["Grade 12", 145],
  ];

  // Small deterministic hash → 0..1
  function rng(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  }
  const pctStr = n => n.toFixed(2) + "%";
  const fmtDate = d => {
    const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    return String(d.getDate()).padStart(2,"0") + "-" + mo + "-" + String(d.getFullYear()).slice(2);
  };
  const key = d => d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();

  // YTD averages are stable per grade
  function ytdFor(name) { return Math.round((87 + rng("ytd" + name) * 8) * 100) / 100; }

  // Compute the whole report for a given date
  function compute(date) {
    const k = key(date);
    // pick 0-2 grades to have an event/field-trip today
    const eventGrades = {};
    GRADES.forEach(([n]) => { if (rng("ev" + k + n) > 0.9) eventGrades[n] = 1 + Math.floor(rng("evc" + k + n) * 2); });

    const rows = GRADES.map(([name, total]) => {
      const ytd = ytdFor(name);
      // today's present % wobbles around the grade's ytd
      const pPct = Math.max(86, Math.min(98, ytd + (rng("p" + k + name) - 0.45) * 6));
      const event = eventGrades[name] || 0;
      const fieldTrip = rng("ft" + k + name) > 0.94 ? 1 : 0;
      let present = Math.round(total * pPct / 100);
      let absent = total - present - event - fieldTrip;
      if (absent < 0) { present += absent; absent = 0; }
      const presentPctReal = present / total * 100;
      return {
        name, total, ytd,
        present, absent, event, fieldTrip, holiday: 0, unmarked: 0,
        presentPct: presentPctReal,
        up: presentPctReal >= ytd,
      };
    });

    const sum = (f) => rows.reduce((a, r) => a + f(r), 0);
    const totalStu = sum(r => r.total);
    const totPresent = sum(r => r.present), totAbsent = sum(r => r.absent);
    const totEvent = sum(r => r.event), totField = sum(r => r.fieldTrip);
    const todayPct = (totPresent + totEvent + totField) / totalStu * 100;
    const ytdAvg = Math.round((92 + (rng("y" + k) - 0.5) * 1.2) * 100) / 100;
    return { rows, totalStu, totPresent, totAbsent, totEvent, totField, todayPct, ytdAvg };
  }

  function face(up) { return up ? '😊 <span class="up">▲</span>' : '😟 <span class="down">▼</span>'; }

  function render(date) {
    const r = compute(date);
    // 5-day trend (previous days incl. today)
    const trend = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(date); d.setDate(d.getDate() - i);
      const c = compute(d);
      trend.push({ d, today: c.todayPct, ytd: c.ytdAvg });
    }

    const gradeRows = r.rows.map(g => `
      <tr>
        <td class="l">${g.name}</td>
        <td>${g.total}</td>
        <td class="up">${pctStr(g.ytd)}</td>
        <td>${g.present} (${g.presentPct.toFixed(2)}%) ${g.up ? '😊 <span class="up">▲</span>' : '😟 <span class="down">▼</span>'}</td>
        <td class="down">${g.absent} (${(g.absent/g.total*100).toFixed(2)}%)</td>
        <td>${g.event || ""}</td>
        <td>${g.fieldTrip || ""}</td>
        <td></td><td></td>
      </tr>`).join("");

    const trendRows = trend.map((t, i) => {
      const prev = trend[i + 1];
      const up = !prev || t.today >= prev.today;
      return `<tr>
        <td class="l">${fmtDate(t.d)}-${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][t.d.getDay()]}</td>
        <td>${pctStr(t.ytd)}</td>
        <td>${t.today.toFixed(2)}% ${face(up)}</td></tr>`;
    }).join("");

    // Top / bottom by YTD
    const byYtd = [...r.rows].sort((a, b) => b.ytd - a.ytd);
    const top = byYtd.slice(0, 6), bot = byYtd.slice(-6).reverse();
    const listRows = arr => arr.map(g => `<tr><td class="l">${g.name}</td><td style="text-align:right">${pctStr(g.ytd)}</td></tr>`).join("");

    const absPct = r.totAbsent / r.totalStu * 100;
    const evPct = r.totEvent / r.totalStu * 100;
    const prPct = r.totPresent / r.totalStu * 100;

    $("#report").innerHTML = `
      <h1>Attd. Summary: ${fmtDate(date)}. Today: ${r.todayPct.toFixed(2)}% | AY 2026-27: ${pctStr(r.ytdAvg)}</h1>
      <div class="rgrid">
        <div>
          <div class="datebox">Report Date: ${fmtDate(date)}</div>
          <div class="rcards">
            <div class="rcard blue"><div class="lbl">AY 2026-27 YTD Avg. Attendance</div><div class="big" style="color:#4338ca">${pctStr(r.ytdAvg)}</div></div>
            <div class="rcard green"><div class="lbl">Today's Present Attendance (%)</div><div class="big" style="color:#047857">${r.todayPct.toFixed(2)}% 😊 ▲</div></div>
          </div>

          <div class="trend-box">
            <h2>📊 Trend (Last 5 Days)</h2>
            <table class="rtable">
              <thead><tr><th>Date</th><th>YTD Avg. Attendance</th><th>Day's Present Attendance</th></tr></thead>
              <tbody>${trendRows}</tbody>
            </table>
          </div>

          <h2 style="color:#b91c1c">Attendance Summary (Total : ${r.totalStu})</h2>
          <table class="rtable">
            <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
            <tbody>
              <tr style="background:#f0fdf4"><td class="l up">Present</td><td class="up">${r.totPresent}</td><td class="up">${prPct.toFixed(2)}%</td></tr>
              <tr style="background:#f0fdf4"><td class="l" style="color:#2563eb">Event</td><td>${r.totEvent}</td><td>${evPct.toFixed(2)}%</td></tr>
              <tr style="background:#f0fdf4"><td class="l" style="color:#2563eb">Field Trip</td><td>${r.totField}</td><td>${(r.totField/r.totalStu*100).toFixed(2)}%</td></tr>
              <tr style="background:#fef2f2"><td class="l down">Absent</td><td class="down">${r.totAbsent}</td><td class="down">${absPct.toFixed(2)}%</td></tr>
              <tr style="background:#fef2f2"><td class="l muted2">Unmarked</td><td>0</td><td>0%</td></tr>
              <tr style="background:#faf5ff"><td class="l" style="color:#7c3aed">Holiday</td><td>0</td><td>-</td></tr>
              <tr style="font-weight:800"><td class="l">Total Count</td><td>${r.totalStu}</td><td>100%</td></tr>
            </tbody>
          </table>

          <div class="two-col">
            <div class="col-top"><h3>Top 6 Grades (YTD Highest)</h3><table class="rtable">${listRows(top)}</table></div>
            <div class="col-bot"><h3>Bottom 6 Grades (YTD Lowest)</h3><table class="rtable">${listRows(bot)}</table></div>
          </div>
        </div>

        <div>
          <h2>Grade-wise Attendance Summary</h2>
          <div class="note"><b>Note: Present %</b> is calculated based on students present + participating in events + on field trips.</div>
          <table class="rtable">
            <thead><tr><th>Grade</th><th>Total</th><th>YTD Avg (%)</th><th>Present</th><th>Absent</th><th>Event</th><th>Field Trip</th><th>Holiday</th><th>Unmarked</th></tr></thead>
            <tbody>
              ${gradeRows}
              <tr style="font-weight:800;background:#f3f4f6"><td class="l">TOTAL</td><td>${r.totalStu}</td><td>-</td><td>${r.totPresent}</td><td>${r.totAbsent}</td><td>${r.totEvent}</td><td>${r.totField}</td><td>0</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;

    $("#genInfo").textContent = "Generated " + r.totalStu + " students · " + r.todayPct.toFixed(2) + "% present";
  }

  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); }

  function currentDate() {
    const v = $("#repDate").value;
    return v ? new Date(v + "T00:00:00") : new Date(2026, 6, 3);
  }

  $("#regen").addEventListener("click", () => { render(currentDate()); toast("Report regenerated ✓"); });
  $("#repDate").addEventListener("change", () => render(currentDate()));
  $("#send").addEventListener("click", () => {
    const log = $("#sendLog"); log.style.display = "block"; log.innerHTML = "";
    const steps = [
      ['<span class="info">↻</span> Aggregating attendance across 14 grades…', 300],
      ['<span class="info">↻</span> Computing YTD, grade-wise &amp; 5-day trend…', 500],
      ['<span class="info">↻</span> Rendering dynamic HTML email…', 400],
      ['<span class="ok">✓</span> Emailed to: sspc, jspc, principals, vice.principals (+3 more)', 400],
    ];
    let t = 0; steps.forEach(([m, d]) => { t += d; setTimeout(() => log.innerHTML += m + "<br>", t); });
    toast("Report sent ✓");
  });

  // Boot — default to 03-Jul-2026 like the sample
  $("#repDate").value = "2026-07-03";
  render(new Date(2026, 6, 3));
})();
