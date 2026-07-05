/* TiaLupe — appointment booking demo. Simulated Web API. */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const DOCTORS = [
    { id: "d1", name: "Dr. Amara Okoye", spec: "Pediatrics", ic: "🧸" },
    { id: "d2", name: "Dr. Ravi Menon", spec: "Cardiology", ic: "❤️" },
    { id: "d3", name: "Dr. Lena Fischer", spec: "Dermatology", ic: "🩺" },
    { id: "d4", name: "Dr. Sofia Marín", spec: "General", ic: "🩹" },
  ];
  const DAYS = ["Mon 8", "Tue 9", "Wed 10", "Thu 11", "Fri 12"];
  const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"];

  // Seeded availability per doctor+day so it's stable
  function taken(docId, day, time) {
    let h = 0, str = docId + day + time;
    for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return h % 10 < 3; // ~30% taken
  }

  let sel = { doc: null, day: DAYS[0], time: null };
  const mine = [];

  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); }

  function renderDoctors() {
    $("#docList").innerHTML = DOCTORS.map(d =>
      `<div class="stat" style="cursor:pointer" data-doc="${d.id}">
        <div class="v" style="font-size:1.5rem">${d.ic}</div>
        <div style="font-weight:600;margin-top:4px">${d.name}</div>
        <div class="k">${d.spec}</div></div>`).join("");
    $$("#docList .stat").forEach(el => el.addEventListener("click", () => {
      sel.doc = DOCTORS.find(d => d.id === el.dataset.doc); sel.time = null;
      $$("#docList .stat").forEach(x => x.style.borderColor = "var(--border)");
      el.style.borderColor = "var(--accent)";
      $("#docName").textContent = sel.doc.name + " · " + sel.doc.spec;
      $("#slotPanel").style.display = "block";
      $("#confirmPanel").style.display = "none";
      renderDays(); renderSlots();
    }));
  }

  function renderDays() {
    $("#daySel").innerHTML = DAYS.map(d => `<option>${d}</option>`).join("");
    $("#daySel").value = sel.day;
  }

  function renderSlots() {
    $("#slots").innerHTML = TIMES.map(t => {
      const isTaken = taken(sel.doc.id, sel.day, t);
      const isSel = sel.time === t;
      return `<div class="slot ${isTaken ? "taken" : ""} ${isSel ? "sel" : ""}" data-t="${t}">${t}</div>`;
    }).join("");
    $$("#slots .slot").forEach(el => {
      if (el.classList.contains("taken")) return;
      el.addEventListener("click", () => {
        sel.time = el.dataset.t; renderSlots();
        $("#confirmPanel").style.display = "block";
        $("#bookSummary").innerHTML =
          `<span class="info">📋</span> <b>${sel.doc.name}</b> (${sel.doc.spec})<br>` +
          `<span class="dim">Day:</span> ${sel.day} &nbsp; <span class="dim">Time:</span> ${sel.time}`;
        $("#confirmPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  $("#daySel") && document.addEventListener("change", e => {
    if (e.target.id === "daySel") { sel.day = e.target.value; sel.time = null; renderSlots(); $("#confirmPanel").style.display = "none"; }
  });

  document.addEventListener("click", e => {
    if (e.target.id === "confirmBtn") {
      const btn = e.target; btn.disabled = true; btn.textContent = "Booking…";
      $("#bookSummary").innerHTML += `<br><span class="info">↻</span> POST /api/appointments …`;
      setTimeout(() => {
        mine.push({ doc: sel.doc.name, spec: sel.doc.spec, day: sel.day, time: sel.time });
        $("#bookSummary").innerHTML += `<br><span class="ok">✓</span> 201 Created — appointment confirmed`;
        btn.textContent = "✓ Booked"; toast("Appointment confirmed ✓");
        renderMine();
        setTimeout(() => { btn.disabled = false; btn.textContent = "Confirm booking"; }, 1200);
      }, 900);
    }
  });

  function renderMine() {
    if (!mine.length) return;
    $("#mineBody").innerHTML = mine.map(a =>
      `<tr><td>${a.doc}</td><td>${a.spec}</td><td>${a.day}</td><td>${a.time}</td>
       <td><span class="bdg green">Confirmed</span></td></tr>`).join("");
  }

  $("#appNav").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$(".demo-view").forEach(v => v.classList.remove("active"));
    $("#v-" + b.dataset.v).classList.add("active");
    $$("#appNav button").forEach(x => x.classList.toggle("active", x === b));
  });

  renderDoctors();
})();
