import { loadLanguage, projects, saveLanguage, translatePage } from "./content.js";
import { experience, experienceMarkup, skills } from "./experience.js";

function render(language) {
  translatePage(language);
  document.querySelector("#return").href = "./index.html?lang=" + language;
  document.querySelector("#cv-experience").innerHTML = experience.map((entry) =>
    `<article>${experienceMarkup(entry, language)}</article>`).join("");
  document.querySelector("#cv-skills").innerHTML = skills.map((skill) =>
    `<li><strong>${skill[language]}</strong> · ${skill.tools}</li>`).join("");
  document.querySelector("#cv-projects").replaceChildren(...projects.map((project) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const summary = document.createElement("p");
    link.href = project.repo;
    link.className = "text-link";
    link.textContent = project.name[language];
    summary.textContent = project[language].short;
    item.append(link, summary);
    return item;
  }));
}

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => {
    saveLanguage(button.dataset.lang);
    render(button.dataset.lang);
  });
}
document.querySelector("#print").addEventListener("click", () => window.print());
render(loadLanguage());
