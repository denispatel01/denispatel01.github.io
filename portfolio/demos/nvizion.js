/* nVizion — loan processing demo. Simulated KYC + credit decision. */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let app = {};

  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); }

  function setStep(n) {
    $$("#steps .s").forEach((s, i) => {
      s.classList.toggle("active", i === n - 1);
      s.classList.toggle("done", i < n - 1);
    });
    [1, 2, 3, 4].forEach(i => $("#w" + i).style.display = i === n ? "block" : "none");
  }

  // Deterministic "credit score" from inputs so the demo is repeatable
  function computeScore() {
    const income = +$("#fIncome").value || 0;
    const amount = +$("#fAmount").value || 1;
    const debt = +$("#fDebt").value || 0;
    const dti = (debt * 12) / Math.max(income, 1);           // debt-to-income
    const ratio = amount / Math.max(income, 1);              // loan-to-income
    let score = 760 - dti * 320 - ratio * 90 + (income > 90000 ? 25 : 0);
    score = Math.max(520, Math.min(820, Math.round(score)));
    return { score, dti: Math.round(dti * 100), ratio: Math.round(ratio * 100) };
  }

  const wiz = {
    next(step) {
      if (step === 1) {
        if (!$("#fName").value.trim() || $("#fSSN").value.length < 4) { toast("Enter name + 4-digit SSN"); return; }
        app.name = $("#fName").value; app.state = $("#fState").value; app.income = +$("#fIncome").value;
        setStep(2);
      } else if (step === 2) {
        app.amount = +$("#fAmount").value; app.term = $("#fTerm").value;
        app.purpose = $("#fPurpose").value; app.debt = +$("#fDebt").value;
        setStep(3); runVerification();
      }
    },
    back(step) { setStep(step - 1); },
    reset() { app = {}; $("#fName").value = "Michael Carter"; setStep(1); },
  };
  window.wiz = wiz;

  function runVerification() {
    const providers = [
      { name: "IDology", label: "Identity (KYC)", key: "idology" },
      { name: "Experian", label: "Credit bureau", key: "experian" },
      { name: "Equifax", label: "Credit bureau", key: "equifax" },
      { name: "FlashSpread", label: "Income / financials", key: "flash" },
    ];
    $("#checks").innerHTML = providers.map(p =>
      `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span class="bdg gray" id="p-${p.key}" style="min-width:92px;text-align:center">⏳ Pending</span>
        <div><b>${p.name}</b> <span class="sub">— ${p.label}</span></div>
        <span style="flex:1"></span>
        <span class="sub" id="pr-${p.key}"></span>
      </div>`).join("");
    const log = $("#verifyLog"); log.innerHTML = '<span class="info">↻</span> Authenticating with providers (API keys / tokens)…<br>';
    const result = computeScore();
    app.score = result.score;

    let t = 500;
    providers.forEach((p, i) => {
      setTimeout(() => {
        const badge = $("#p-" + p.key), res = $("#pr-" + p.key);
        badge.className = "bdg green"; badge.textContent = "✓ Cleared";
        if (p.key === "idology") res.textContent = "SSN ✓ · Address ✓ · No watchlist hit";
        if (p.key === "experian") res.textContent = "Score " + (result.score - 4);
        if (p.key === "equifax") res.textContent = "Score " + (result.score + 4);
        if (p.key === "flash") res.textContent = "Income verified · DTI " + result.dti + "%";
        log.innerHTML += `<span class="ok">✓</span> ${p.name} responded (200 OK)<br>`;
      }, t);
      t += 700;
    });
    setTimeout(() => {
      log.innerHTML += `<span class="ok">✓</span> All checks complete — composite score <b>${result.score}</b><br>`;
      setStep(4); renderDecision(result);
    }, t + 300);
  }

  function renderDecision(r) {
    const approved = r.score >= 660 && r.dti < 43;
    const apr = approved ? (6.5 + (740 - r.score) * 0.03).toFixed(2) : null;
    const monthly = approved ? Math.round(app.amount * (1 + apr / 100 * (app.term / 12)) / app.term) : 0;
    PIPELINE.unshift({ name: app.name, amount: app.amount, purpose: app.purpose, score: r.score, status: approved ? "Approved" : "Declined" });

    $("#decisionBox").innerHTML = `
      <h3>${approved ? "✅ Loan Approved" : "❌ Loan Declined"}</h3>
      <div class="stat-row" style="margin-top:14px">
        <div class="stat"><div class="v">${r.score}</div><div class="k">Composite credit score</div></div>
        <div class="stat"><div class="v">${r.dti}%</div><div class="k">Debt-to-income</div></div>
        ${approved
          ? `<div class="stat"><div class="v">${apr}%</div><div class="k">Offered APR</div></div>
             <div class="stat"><div class="v">$${monthly.toLocaleString()}</div><div class="k">Est. monthly payment</div></div>`
          : `<div class="stat"><div class="v" style="font-size:1.1rem">Threshold</div><div class="k">Needs score ≥ 660 &amp; DTI &lt; 43%</div></div>`}
      </div>
      <div class="callout" style="margin-top:6px">
        <h4>${approved ? "Automated decision" : "Referred for manual review"}</h4>
        <p>${approved
          ? `Applicant <b>${app.name}</b> qualifies for $${app.amount.toLocaleString()} over ${app.term} months. Documents and disbursement instructions have been generated.`
          : `Score or DTI is outside auto-approval policy. The application is flagged for a loan officer's manual review — not an outright rejection.`}</p>
      </div>`;
    toast(approved ? "Application approved ✓" : "Sent to manual review");
  }

  const PIPELINE = [
    { name: "Sarah Nguyen", amount: 18000, purpose: "Auto", score: 712, status: "Approved" },
    { name: "David Okafor", amount: 40000, purpose: "Business", score: 638, status: "Manual review" },
    { name: "Elena Rossi", amount: 12000, purpose: "Debt consolidation", score: 690, status: "Approved" },
    { name: "James Park", amount: 55000, purpose: "Home improvement", score: 604, status: "Declined" },
  ];

  function renderPipeline() {
    const approved = PIPELINE.filter(p => p.status === "Approved").length;
    const review = PIPELINE.filter(p => p.status.includes("review")).length;
    const vol = PIPELINE.filter(p => p.status === "Approved").reduce((a, p) => a + p.amount, 0);
    $("#pipeStats").innerHTML = [
      ["Applications", PIPELINE.length], ["Approved", approved],
      ["In review", review], ["Approved volume", "$" + vol.toLocaleString()],
    ].map(([k, v]) => `<div class="stat"><div class="v" style="font-size:1.4rem">${v}</div><div class="k">${k}</div></div>`).join("");
    $("#pipeBody").innerHTML = PIPELINE.map(p => {
      const cls = p.status === "Approved" ? "green" : p.status === "Declined" ? "red" : "amber";
      return `<tr><td>${p.name}</td><td>$${p.amount.toLocaleString()}</td><td>${p.purpose}</td>
        <td>${p.score}</td><td><span class="bdg ${cls}">${p.status}</span></td></tr>`;
    }).join("");
  }

  // Nav
  $("#appNav").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$(".demo-view").forEach(v => v.classList.remove("active"));
    $("#v-" + b.dataset.v).classList.add("active");
    $$("#appNav button").forEach(x => x.classList.toggle("active", x === b));
    if (b.dataset.v === "pipeline") renderPipeline();
  });

  setStep(1);
})();
