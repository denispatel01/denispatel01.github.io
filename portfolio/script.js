/* ============================================================
   Denis Patel — Portfolio data + interactions
   Edit the arrays below to update your site. No build step.
   ============================================================ */

const SKILLS = [
  { icon: "🧠", title: "Languages", items: ["C#", "SQL", "TypeScript", "JavaScript", "VB.NET"] },
  { icon: "⚙️", title: "Backend", items: ["ASP.NET Core 6", "ASP.NET MVC", "Web API", "EF Core", "Dapper", "REST API Design", "Multi-tenant", "Swagger/OpenAPI", "Webhooks", "Localization"] },
  { icon: "🔐", title: "Security", items: ["JWT Auth", "API-key / token auth", "Role-based authorization", "Data encryption"] },
  { icon: "🎨", title: "Frontend", items: ["Angular 14", "jQuery", "DataTables", "Bootstrap", "HTML5", "CSS3", "Telerik", "Toastr"] },
  { icon: "🗄️", title: "Databases", items: ["SQL Server", "Stored Procedures", "Query Optimization", "Indexing", "Server-side pagination", "RavenDB", "MySQL"] },
  { icon: "☁️", title: "Cloud & Deployment", items: ["AWS EC2", "AWS S3", "Azure Functions", "Azure App Service", "IIS / SSL", "Dev/Staging/UAT/Prod", "Task Scheduler / CRON"] },
  { icon: "🛠️", title: "DevOps & Tools", items: ["Azure DevOps", "Git", "Bitbucket", "SVN", "PowerShell", "VS 2022", "SSMS", "Postman", "Bruno", "ngrok"] },
  { icon: "🔌", title: "Integrations", items: ["IDology", "Experian", "Equifax", "FlashSpread", "Google APIs (OAuth, Drive)", "WhatsApp Business API", "SMS gateways", "ERPNext", "Payment gateways"] },
  { icon: "🤖", title: "AI-Assisted Dev", items: ["Claude", "Cursor", "GitHub Copilot", "Antigravity"] },
];

const EXPERIENCE = [
  {
    role: "Senior Software Developer",
    company: "Fountainhead School",
    location: "Surat, India",
    date: "Apr 2022 – Present",
    ctx: "Leading IB Board school in Surat, founded by IIT-Mumbai & IIM-Ahmedabad graduates, serving Pre-K to Grade 12.",
    projects: [
      {
        name: "Nucleus EDU — School ERP Platform",
        stack: "ASP.NET Core 6 + Angular 14 + SQL Server",
        points: [
          "Architected and led the ground-up rewrite into a modular, multi-tenant, API-first architecture with tenant-based connection resolution, serving 2,200+ students, staff & parents across multiple campuses.",
          "Designed a RESTful API layer with JWT auth and role-based authorization securing 10+ modules (Admissions, HRIS, Assessments, Portfolio, Transport, Fees, Wellbeing, Inventory, Ticketing).",
          "Improved responsiveness on high-volume modules via SP rewrites, index tuning, and server-side pagination — kept the platform performant past 2,000 daily users.",
          "Built an ERPNext Lead sync for Admissions, integrated Google OAuth, WhatsApp Transport notifications, AWS S3 document storage, and bank-statement CSV import for fee reconciliation.",
          "Led technical delivery for a 4-developer team — structured code reviews, KT sessions, and backlog management in Azure DevOps.",
        ],
      },
      {
        name: "Nucleus Web App",
        stack: "ASP.NET Framework + SQL Server",
        points: [
          "Built and maintained 12+ school data-management modules used daily by staff.",
          "Integrated calendar & notification services, cutting manual scheduling effort ~40%.",
          "Built the Student Attendance Summary reporting module end-to-end — dynamic HTML report, scheduled daily email delivery, and whole-school / grade-wise / trend analytics.",
        ],
      },
      {
        name: "Alumni Connect Web App",
        stack: "Role-based access control",
        points: [
          "Developed alumni networking module, onboarding 500+ users in the first month.",
          "Shipped event management & news features driving repeat platform visits.",
        ],
      },
    ],
  },
  {
    role: "Software Developer",
    company: "Trimantra Software Solution LLP",
    location: "Remote (Maryland, USA client)",
    date: "May 2021 – Apr 2022",
    ctx: "Microsoft Silver Partner offshore development company specialising in ASP.NET, SharePoint, and WordPress.",
    projects: [
      {
        name: "nVizion — US Bank Loan Processing Platform",
        stack: "ASP.NET Core + SQL Server",
        points: [
          "Delivered the end-to-end loan-processing workflow, enabling loan officers to manage the full lifecycle from application to approval in a single interface.",
          "Implemented secure document upload, automated status tracking, and role-based dashboards.",
          "Debugged and maintained payment-gateway integrations (Payze, HDFC, Paytm), resolving production payment-flow issues.",
          "Integrated Experian, Equifax, IDology, and FlashSpread APIs for US borrower KYC & credit assessment with API-key and token-based auth.",
        ],
      },
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Differenz System Pvt Ltd",
    location: "Surat, India",
    date: "Oct 2019 – Dec 2020",
    ctx: "ISO 27001:2013 certified IT agency with operations in India, USA, and Australia.",
    projects: [
      {
        name: "Multi-environment Deployment & Support",
        stack: "AWS EC2 · IIS · RDP",
        points: [
          "Deployed and supported applications across Dev/Staging/UAT/Production — AWS EC2 with security groups, IIS SSL setup with HTTPS redirects, and RDP-based client deployments.",
        ],
      },
      {
        name: "Playwaze / TiaLupe / LA WeightLoss",
        stack: "ASP.NET · RavenDB · Web API",
        points: [
          "Playwaze (UK sports platform): competition management, leaderboards, tiered team sign-ups, fixtures with RavenDB & LINQ.",
          "TiaLupe (Children's Hospital LA): built Web API endpoints for a doctor-appointment app serving thousands of patient-facing users.",
          "LA WeightLoss: product/plan/support modules, payment & notification integrations, CRON jobs, dynamic admin UI.",
        ],
      },
    ],
  },
];

const PROJECTS = [
  {
    tag: "FLAGSHIP · EDUCATION",
    name: "Nucleus EDU",
    desc: "Multi-tenant, API-first school ERP rewrite serving 2,200+ users across campuses. 10+ modules, JWT security, and heavy SQL Server performance work.",
    stack: ["ASP.NET Core 6", "Angular 14", "SQL Server", "AWS S3", "JWT"],
  },
  {
    tag: "FINTECH · US BANKING",
    name: "nVizion Loan Platform",
    desc: "End-to-end US bank loan-processing workflow with KYC & credit checks via Experian, Equifax, IDology & FlashSpread, plus payment-gateway integrations.",
    stack: ["ASP.NET Core", "SQL Server", "KYC APIs", "Payments"],
  },
  {
    tag: "HEALTHCARE",
    name: "TiaLupe — CHLA App API",
    desc: "Web API powering a doctor-appointment booking app deployed for Children's Hospital Los Angeles, serving thousands of patient-facing users.",
    stack: ["ASP.NET", "Web API", "SQL Server"],
  },
  {
    tag: "REPORTING",
    name: "Attendance Analytics",
    desc: "Student Attendance Summary module — dynamic HTML report, scheduled daily email delivery, and whole-school / grade-wise / trend analytics.",
    stack: ["ASP.NET", "SQL Server", "Scheduled Jobs"],
  },
  {
    tag: "INTEGRATION",
    name: "ERPNext Lead Sync",
    desc: "Automated inquiry hand-off between the school ERP and CRM, eliminating duplicate manual data entry in the Admissions module.",
    stack: ["REST", "Webhooks", "ASP.NET Core"],
  },
  {
    tag: "INTERNAL TOOLING",
    name: "DB Restore Automation",
    desc: "PowerShell/WinForms GUI tool automating SQL Server restore operations across environments — reduced a manual multi-step DBA process to one click.",
    stack: ["PowerShell", "WinForms", "SQL Server"],
  },
];

/* ---------- Render ---------- */
function render() {
  document.getElementById("skillsGrid").innerHTML = SKILLS.map(s => `
    <div class="skill-card reveal">
      <h3>${s.icon} ${s.title}</h3>
      <div class="chips">${s.items.map(i => `<span class="chip">${i}</span>`).join("")}</div>
    </div>`).join("");

  document.getElementById("timeline").innerHTML = EXPERIENCE.map(j => `
    <div class="job reveal">
      <div class="meta">
        <h3>${j.role}</h3>
        <span class="date">${j.date}</span>
      </div>
      <p><span class="company">${j.company}</span> · ${j.location}</p>
      <p class="ctx">${j.ctx}</p>
      ${j.projects.map(p => `
        <div class="project">
          <h4>${p.name} <span>— ${p.stack}</span></h4>
          <ul>${p.points.map(pt => `<li>${pt}</li>`).join("")}</ul>
        </div>`).join("")}
    </div>`).join("");

  document.getElementById("projectsGrid").innerHTML = PROJECTS.map(p => `
    <div class="project-card reveal">
      <span class="tag">${p.tag}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="stack">${p.stack.map(s => `<span class="chip">${s}</span>`).join("")}</div>
    </div>`).join("");
}

/* ---------- Interactions ---------- */
function init() {
  render();
  document.getElementById("year").textContent = new Date().getFullYear();

  // Nav scroll shadow
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 10));

  // Mobile menu
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

document.addEventListener("DOMContentLoaded", init);
