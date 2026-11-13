import { loadLanguage, projects, saveLanguage, translatePage } from "./content.js";

function render(language) {
  translatePage(language);
  document.querySelector("#return").href = "./index.html?lang=" + language;
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
