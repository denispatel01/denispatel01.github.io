/* ============================================================
   Shared header + footer, injected into every page.
   Each page sets  <body data-base="" >  (root) or
                    <body data-base="../">  (subpages).
   ============================================================ */
(function () {
  const B = document.body.dataset.base || "";
  const active = document.body.dataset.page || "";

  const nav = `
    <header class="nav" id="nav">
      <div class="container nav-inner">
        <a href="${B}index.html" class="brand">DP<span>.</span></a>
        <nav class="nav-links" id="navLinks">
          <a href="${B}index.html#about" class="${active === 'home' ? 'is-active' : ''}">About</a>
          <a href="${B}index.html#skills">Skills</a>
          <a href="${B}projects.html" class="${active === 'projects' ? 'is-active' : ''}">Projects</a>
          <a href="${B}articles.html" class="${active === 'articles' ? 'is-active' : ''}">Articles</a>
          <a href="${B}index.html#services">Services</a>
          <a href="${B}index.html#contact" class="btn btn-sm">Let's talk</a>
        </nav>
        <button class="nav-toggle" aria-label="Menu" id="navToggle">☰</button>
      </div>
    </header>`;

  const footer = `
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <a href="${B}index.html" class="brand">DP<span>.</span></a>
          <p>Senior .NET Developer · ASP.NET Core · Angular · SQL Server</p>
        </div>
        <div class="footer-links">
          <a href="${B}projects.html">Projects</a>
          <a href="${B}articles.html">Articles</a>
          <a href="mailto:denispatel01@gmail.com">Email</a>
          <a href="https://www.linkedin.com/in/denis-patel-395985127" target="_blank" rel="noopener">LinkedIn</a>
        </div>
        <p class="copy">© <span id="year"></span> Denis Patel · Built by hand with HTML/CSS/JS</p>
      </div>
    </footer>`;

  // Inject
  document.body.insertAdjacentHTML("afterbegin", nav);
  document.body.insertAdjacentHTML("beforeend", footer);

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Nav scroll shadow
  const navEl = document.getElementById("nav");
  window.addEventListener("scroll", () => navEl.classList.toggle("scrolled", window.scrollY > 10));

  // Mobile toggle
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

  // Reveal-on-scroll for any .reveal element.
  // Robust getBoundingClientRect approach (no IntersectionObserver timing quirks).
  // Exposed globally so dynamically-injected content re-scans (see script.js).
  function reveal() {
    const trigger = window.innerHeight * 0.92;
    document.querySelectorAll(".reveal:not(.in)").forEach(el => {
      if (el.getBoundingClientRect().top < trigger) el.classList.add("in");
    });
  }
  window.revealScan = reveal;
  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal);
  window.addEventListener("load", reveal);
  document.addEventListener("DOMContentLoaded", reveal);
  reveal();
  // Safety net: never leave content permanently hidden.
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.in)").forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  }, 1500);

  // Reading progress bar (articles/case studies)
  if (document.body.dataset.progress === "on") {
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    document.body.appendChild(bar);
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + "%";
    });
  }
})();
