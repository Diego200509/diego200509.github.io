export const experience = [
  {
    id: "ambacar", icon: "briefcase",
    organization: "Ambacar S.A.",
    es: {
      title: "Prácticas de desarrollo de software y soporte TI",
      context: "22 de junio al 31 de julio de 2026",
      summary: "Trabajé en el módulo Usuarios ZEUS de AMBYSOFT, desde el diseño de pantallas hasta la integración del frontend con los servicios del backend.",
      details: [
        "Implementé el listado, la creación y la edición de usuarios, el restablecimiento de contraseñas y validaciones para cambios de estado.",
        "Desarrollé APIs y catálogos de agencias, divisiones y roles. Incorporé filtros y paginación del lado del servidor y ajusté el listado para evitar duplicados.",
        "Configuré y verifiqué microservicios en IIS. Realicé mantenimiento preventivo y validé inventarios y custodios de equipos en agencias de Guayaquil y Quito."
      ]
    },
    en: {
      title: "Software development and IT support internship",
      context: "June 22 to July 31, 2026",
      summary: "I worked on the ZEUS user management module in AMBYSOFT, from designing screens to integrating the frontend with backend services.",
      details: [
        "Implemented user listing, creation, and editing, password resets, and validation for account status changes.",
        "Built APIs and reference lists for branches, divisions, and roles. Added filters and server-side pagination and adjusted the user list to prevent duplicate entries.",
        "Configured and verified microservices in IIS. Performed preventive maintenance and checked equipment inventories and asset assignments at branches in Guayaquil and Quito."
      ]
    }
  },
  {
    id: "water", icon: "water",
    organization: "Junta Administradora de Agua Potable Miñarica San Vicente Yaculoma y Bellavista El Rosario",
    es: {
      title: "Desarrollo del módulo contable",
      context: "Prácticas comunitarias",
      summary: "Participé en el análisis, diseño e implementación del módulo contable para un sistema administrativo y financiero.",
      details: ["Registro y control de asientos contables.", "Diseño y gestión de la base de datos financiera."]
    },
    en: {
      title: "Accounting module development",
      context: "Community placement",
      summary: "I helped analyze, design, and implement the accounting module for an administrative and financial system.",
      details: ["Implemented features for recording and tracking journal entries.", "Helped design and manage the financial database."]
    }
  },
  {
    id: "insurance", icon: "shield",
    organization: "Honorable Gobierno Provincial de Tungurahua",
    es: {
      title: "Desarrollo de un sistema de control de pólizas",
      context: "Proyecto académico",
      summary: "Participé en el desarrollo de un sistema de gestión y seguimiento de pólizas y garantías institucionales.",
      details: ["Análisis de requisitos y desarrollo de módulos de registro, consulta y seguimiento.", "Desarrollo de reportes y herramientas de control."]
    },
    en: {
      title: "Insurance policy tracking system development",
      context: "Academic project",
      summary: "I helped develop a system for managing and tracking institutional insurance policies and guarantees.",
      details: ["Analyzed requirements and built modules for recording, finding, and tracking policies.", "Developed reports and tracking tools."]
    }
  }
];

export const skills = [
  { es: "Lenguajes", en: "Languages", tools: "TypeScript · JavaScript · Python · C# · PHP · Java" },
  { es: "Desarrollo web", en: "Web development", tools: "React · Next.js · Angular · Express · Laravel · .NET" },
  { es: "Bases de datos", en: "Databases", tools: "SQL Server · MySQL · PostgreSQL · MongoDB" },
  { es: "Herramientas", en: "Tools", tools: "Git · GitHub · IIS · Three.js" }
];

export function experienceMarkup(entry, language, detailsLabel = "", expanded = false) {
  const { title, context, summary, details } = entry[language];
  const list = `<ul>${details.map((detail) => `<li>${detail}</li>`).join("")}</ul>`;
  const responsibilities = detailsLabel
    ? `<details${expanded ? " open" : ""}><summary>${detailsLabel}</summary>${list}</details>`
    : list;
  return `<h3>${title}</h3><p class="resume-meta">${entry.organization} · ${context}</p>
    <p>${summary}</p>${responsibilities}`;
}
