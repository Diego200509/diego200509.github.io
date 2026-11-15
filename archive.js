import { loadLanguage, saveLanguage, translatePage, translations } from "./content.js";
import { archiveProjects, renderArchiveCards } from "./project-archive.js";
import { mountContactFooter } from "./site-footer.js";

mountContactFooter();
const buttons = document.querySelectorAll("[data-category]");
const container = document.querySelector("#archive-projects");
const result = document.querySelector("#archive-count");
let language = loadLanguage();
let category = "all";

function render() {
  translatePage(language);
  document.querySelector("#archive-return").href = "./index.html?lang=" + language + "#projects";
  document.title = "Diego Jijón · " + translations[language].archiveTitle;
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  }
  const selection = category === "all" ? archiveProjects : archiveProjects.filter(project => project.category === category);
  renderArchiveCards(container, language, selection);
  result.textContent = translations[language].archiveCount(selection.length);
}

for (const button of buttons) {
  button.addEventListener("click", () => {
    category = button.dataset.category;
    render();
  });
}
for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => {
    language = button.dataset.lang;
    saveLanguage(language);
    render();
  });
}
render();
