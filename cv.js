import { loadLanguage, projects, saveLanguage, translatePage } from "./content.js";
import { experience, experienceMarkup, skills } from "./experience.js";
import { mountContactFooter } from "./site-footer.js";
import { mountSiteHeader } from "./site-header.js?v=section-links";

mountContactFooter();
const updateHeaderLinks = mountSiteHeader();

function render(language) {
  translatePage(language);
  updateHeaderLinks(language);
  document.querySelector("#return").href = "./index.html?lang=" + language;
  document.querySelector("#cv-portfolio").href = "./index.html?lang=" + language + "#inicio";
  document.querySelector("#cv-download").href = "./assets/diego-jijon-cv-" + language + ".pdf";
  document.title = "Diego Jijón · " + (language === "es" ? "CV" : "Résumé");
  document.querySelector("#cv-experience").innerHTML = experience.map((entry) =>
    `<article>${experienceMarkup(entry, language)}</article>`).join("");
  document.querySelector("#cv-skills").innerHTML = skills.map((skill) =>
    `<li><strong>${skill[language]}</strong><span>${skill.tools}</span></li>`).join("");
  document.querySelector("#cv-projects").replaceChildren(...projects.map((project) => {
    const item = document.createElement("li");
    const name = document.createElement(project.repo ? "a" : "strong");
    const summary = document.createElement("p");
    if (project.repo) {
      name.href = project.repo;
      name.className = "text-link";
    }
    name.textContent = project.name[language];
    summary.textContent = project[language].short;
    item.append(name, summary);
    return item;
  }));
}

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => {
    saveLanguage(button.dataset.lang);
    render(button.dataset.lang);
  });
}
render(loadLanguage());
