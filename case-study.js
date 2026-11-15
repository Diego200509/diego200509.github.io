import { loadLanguage, projectPage, projects, saveLanguage, translatePage, translations } from "./content.js";
import { mountContactFooter } from "./site-footer.js";
import { mountSiteHeader } from "./site-header.js?v=section-links";
import { caseDetails, caseLabels } from "./case-content.js?v=sections";
import { caseDemos } from "./case-demos.js";

const study = document.querySelector("#case-study");
const currentPage = location.pathname.split("/").at(-1);
const project = projects.find(item => item.page === currentPage);
const detail = caseDetails[project.id];
const demoState = {};
const updateHeaderLinks = mountSiteHeader();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const sectionObserver = "IntersectionObserver" in window && "animate" in Element.prototype
  ? new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      sectionObserver.unobserve(target);
      if (reducedMotion.matches || target.matches(":target") || target.contains(document.activeElement)) continue;
      target.animate([{ opacity: .65, translate: "0 14px" }, { opacity: 1, translate: "0 0" }], {
        duration: 480,
        easing: "cubic-bezier(.22, 1, .36, 1)"
      });
    }
  }, { rootMargin: "0px 0px -7% 0px" }) : null;

function icon(name) {
  return `<svg aria-hidden="true" focusable="false"><use href="./assets/landing-icons.svg#${name}"></use></svg>`;
}

function sectionHeading(id, name, label) {
  return `<header class="case-section-heading"><span>${icon(name)}</span><h2 id="${id}">${label}</h2></header>`;
}

function evidenceLink(href, name, label) {
  return `<li><a href="${href}" target="_blank" rel="noopener noreferrer">
    <span class="case-evidence-icon">${icon(name)}</span><span>${label}</span><span class="case-external" aria-hidden="true">↗</span>
  </a></li>`;
}

function render(language) {
  const ui = translations[language];
  const labels = caseLabels[language];
  const copy = detail[language];
  const overview = project[language];
  const name = project.name[language];
  const stack = language === "en" && project.stackEn ? project.stackEn : project.stack;
  const returnPath = "./index.html?lang=" + language + "#projects";
  const sections = [
    ["contexto", "document", labels.context], ["contribucion", "briefcase", labels.contribution],
    ["sistema", "uml", labels.architecture], ["evidencia", "github", labels.evidence]
  ];

  document.title = `${name} · Diego Jijón`;
  document.querySelector('meta[name="description"]').content = overview.short;
  document.querySelector("#case-return").href = returnPath;
  sectionObserver?.disconnect();

  study.innerHTML = `
    <div class="case-hero">
      <header class="case-heading">
        <p class="case-category eyebrow"><span>${icon(detail.icon)}</span>${overview.kind}</p>
        <h1>${name}</h1>
        <p class="case-headline">${copy.headline}</p>
        <p class="case-lead">${overview.short}</p>
        <ul class="case-stack" aria-label="${labels.technologies}">${stack.split(" · ").map(tool => `<li>${tool}</li>`).join("")}</ul>
        <div class="case-actions">
          <a class="button primary" href="${project.repo}" target="_blank" rel="noopener noreferrer">${icon("github")}${ui.source}</a>
          <a class="button secondary case-demo-jump" href="#demo">${labels.demo}</a>
        </div>
      </header>
      <section class="case-visual" id="demo" aria-labelledby="case-demo-title">
        <h2 id="case-demo-title">${copy.demoTitle}</h2>
        <div id="case-demo"></div>
        <p class="case-demo-note">${copy.demoNote}</p>
      </section>
    </div>
    <nav class="case-index" aria-label="${labels.sections}">
      ${sections.map(([id, name, label]) => `<a href="#${id}">${icon(name)}<span>${label}</span></a>`).join("")}
    </nav>
    <section class="case-section" id="contexto" aria-labelledby="case-context-title">
      ${sectionHeading("case-context-title", "document", labels.context)}
      <div class="case-context">
        <div class="case-problem"><h3>${labels.problem}</h3><p>${overview.problem}</p></div>
        <div class="case-solution"><h3>${labels.solution}</h3><p>${overview.solution}</p></div>
      </div>
    </section>
    <section class="case-section" id="contribucion" aria-labelledby="case-contribution-title">
      ${sectionHeading("case-contribution-title", "briefcase", labels.contribution)}
      <ul class="case-contributions">${copy.contributions.map(text => `<li>${text}</li>`).join("")}</ul>
    </section>
    <section class="case-section" id="sistema" aria-labelledby="case-system-title">
      ${sectionHeading("case-system-title", "uml", labels.architecture)}
      <ol class="case-system">${copy.flow.map(([title, text], index) => `<li><span aria-hidden="true">0${index + 1}</span><h3>${title}</h3><p>${text}</p></li>`).join("")}</ol>
    </section>
    <section class="case-section" id="evidencia" aria-labelledby="case-evidence-title">
      ${sectionHeading("case-evidence-title", "github", labels.evidence)}
      <div>
        <ul class="case-evidence">
          ${evidenceLink(project.repo + "/commits/main/?author=Diego200509", "github", labels.commits)}
          ${copy.evidence.map(([label, path]) => evidenceLink(project.repo + "/blob/main/" + path, "document", label)).join("")}
        </ul>
        ${copy.capture ? `<figure class="case-capture"><a href="./assets/rgb-aplicacion.webp" target="_blank" rel="noopener noreferrer"><img src="./assets/rgb-aplicacion.webp" width="1480" height="760" loading="lazy" alt="${copy.capture}"></a><figcaption>${copy.capture}</figcaption></figure>` : ""}
      </div>
    </section>
    <section class="case-related" aria-labelledby="case-related-title">
      <header><h2 id="case-related-title">${labels.other}</h2><a class="text-link" href="${returnPath}">${labels.more}</a></header>
      <div class="case-related-grid">${projects.filter(item => item !== project).map(item => `<a href="${projectPage(item, language)}">
        <span>${icon(caseDetails[item.id].icon)}${item[language].kind}</span><strong>${item.name[language]} <span aria-hidden="true">→</span></strong>
      </a>`).join("")}</div>
    </section>`;

  translatePage(language);
  updateHeaderLinks(language);
  caseDemos[project.id](document.querySelector("#case-demo"), language, demoState);
  if (!reducedMotion.matches) {
    for (const section of study.querySelectorAll(".case-section, .case-related")) {
      if (section.getBoundingClientRect().top >= innerHeight) sectionObserver?.observe(section);
    }
  }
}

mountContactFooter();
for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => {
    const language = button.dataset.lang;
    saveLanguage(language);
    render(language);
  });
}
render(loadLanguage());
