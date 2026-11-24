const email = "diegojijon2005@gmail.com";
const profiles = [
  { name: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/diegojijon/" },
  { name: "GitHub", icon: "github", url: "https://github.com/Diego200509" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/diegojijon09/" }
];

function icon(name) {
  const sprite = name === "email" || name === "instagram" ? "contact-icons" : "landing-icons";
  return `<svg aria-hidden="true" focusable="false"><use href="./assets/${sprite}.svg#${name}"></use></svg>`;
}

function profileLink(profile) {
  return `<a href="${profile.url}" target="_blank" rel="noopener noreferrer">
    ${icon(profile.icon)}<span>${profile.name}</span><span aria-hidden="true">↗</span>
  </a>`;
}

export function mountContactFooter() {
  const footer = document.querySelector("#contact");
  footer.innerHTML = `
    <div class="content contact-panel">
      <div class="contact-intro">
        <p class="eyebrow" data-t="contactLabel">CONTACTO</p>
        <h2 data-t="talk">Hablemos.</h2>
        <p class="contact-description" data-t="contactIntro">Si tienes un proyecto en mente o una oportunidad en desarrollo de software, escríbeme.</p>
        <p class="contact-availability" data-t="profileRemote">Abierto a oportunidades remotas</p>
      </div>
      <div class="contact-actions">
        <a class="contact-email" href="mailto:${email}">
          <span class="contact-email-icon">${icon("email")}</span>
          <span><span class="contact-email-label" data-t="contactEmail">Escríbeme un correo</span><strong>${email}</strong></span>
          <span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <div class="contact-profiles">${profiles.map(profileLink).join("")}</div>
      </div>
    </div>`;
}
