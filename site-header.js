const sections = ["projects", "profile", "technologies", "experience", "certificates", "contact"];

export function mountSiteHeader() {
  const header = document.querySelector(".site-header");
  const inner = header.querySelector(".site-header-inner");
  const actions = header.querySelector(".site-header-actions");
  const landing = header.id === "top";
  const wide = matchMedia("(min-width: 1100px)");

  actions.insertAdjacentHTML("beforeend", `<button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Menú" data-aria="menu">
    <span class="site-menu-label" data-t="menu">Menú</span>
    <span class="site-menu-glyph" aria-hidden="true"><span></span><span></span><span></span></span>
  </button>`);
  inner.insertAdjacentHTML("beforeend", `<nav class="site-menu" id="site-menu" aria-label="Principal" data-aria="nav" inert>
    <div class="site-menu-sections">${sections.map(section =>
      `<a href="${landing || section === "contact" ? "" : "./index.html"}#${section}" data-section="${section}" data-t="${section}">${section}</a>`).join("")}</div>
    <div class="site-menu-pages">
      <a href="./archive.html" data-page="archive.html" data-t="archiveTitle">Archivo de proyectos</a>
      <a href="./cv.html" data-page="cv.html" data-t="cv">Ver CV</a>
    </div>
  </nav>`);

  const toggle = actions.querySelector(".site-menu-toggle");
  const menu = inner.querySelector("#site-menu");
  const links = [...menu.querySelectorAll("a")];
  const currentPage = location.pathname.split("/").at(-1);
  for (const link of links) {
    if (link.dataset.page === currentPage) link.setAttribute("aria-current", "page");
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.inert = !wide.matches && !open;
  }

  function updateLayout() {
    const focus = document.activeElement;
    const focusWasInMenu = menu.contains(focus);
    header.toggleAttribute("data-compact", !wide.matches);
    if (wide.matches) actions.before(menu);
    else inner.append(menu);
    setOpen(false);
    if (wide.matches && focus === toggle) links[0].focus({ preventScroll: true });
    else if (focusWasInMenu) (wide.matches ? focus : toggle).focus({ preventScroll: true });
  }

  wide.addEventListener("change", updateLayout);
  updateLayout();

  toggle.addEventListener("click", () => setOpen(menu.inert));
  document.addEventListener("click", event => {
    if (!wide.matches && !menu.inert && !header.contains(event.target)) setOpen(false);
  });
  header.addEventListener("focusout", event => {
    if (!wide.matches && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || wide.matches || menu.inert) return;
    event.preventDefault();
    toggle.focus({ preventScroll: true });
    setOpen(false);
  });
  menu.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    if (link.getAttribute("href").startsWith("#") && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      const heading = document.getElementById(link.dataset.section)?.querySelector("h1, h2");
      if (heading) {
        heading.tabIndex = -1;
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    }
    setOpen(false);
  });

  return language => {
    for (const link of links) {
      const { page, section } = link.dataset;
      if (page) link.href = "./" + page + "?lang=" + language;
      else if (!landing && section !== "contact") link.href = "./index.html?lang=" + language + "#" + section;
    }
  };
}
