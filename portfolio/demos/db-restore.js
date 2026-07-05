/* DB Restore Tool — one-click restore simulation. */
(function () {
  const $ = s => document.querySelector(s);
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); }

  $("#runBtn").addEventListener("click", () => {
    const src = $("#src").value, tgt = $("#tgt").value, verify = $("#verify").checked;
    const btn = $("#runBtn"), log = $("#log"), bar = $("#bar");
    btn.disabled = true; log.innerHTML = ""; bar.style.width = "0";

    const steps = [
      ['<span class="info">→</span> Locating backup <b>' + src + '</b> on file share…', 12, 500],
      ['<span class="ok">✓</span> Backup found (4.2 GB). Verifying header (RESTORE HEADERONLY)…', 24, 700],
      ['<span class="info">→</span> Setting <b>' + tgt + '</b> to SINGLE_USER (killing active connections)…', 38, 800],
      ['<span class="info">→</span> RESTORE DATABASE [' + tgt + '] WITH REPLACE, MOVE …', 68, 1400],
      ['<span class="ok">✓</span> Data + log files relocated to target paths.', 80, 500],
      ['<span class="info">→</span> Setting <b>' + tgt + '</b> back to MULTI_USER…', 90, 500],
    ];
    if (verify) steps.push(
      ['<span class="info">→</span> Verification: DBCC CHECKDB + row-count reconciliation…', 97, 900],
      ['<span class="ok">✓</span> Integrity OK · 2,615 students · 48 tables matched.', 100, 400]);
    else steps.push(['<span class="ok">✓</span> Restore complete.', 100, 300]);

    let t = 0;
    steps.forEach(([msg, pct, d]) => {
      t += d;
      setTimeout(() => {
        log.innerHTML += msg + "<br>";
        bar.style.width = pct + "%";
        log.scrollTop = log.scrollHeight;
      }, t);
    });
    setTimeout(() => {
      log.innerHTML += '<span class="ok">✓✓ DONE</span> — <b>' + tgt + '</b> restored from ' + src + ' in one click. <span class="dim">(manual process: ~8 steps)</span><br>';
      btn.disabled = false; toast("✓ Restore complete");
    }, t + 300);
  });
})();
