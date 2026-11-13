export const experience = [
  {
    id: "ambacar",
    organization: "Ambacar S.A. · Matriz Indoamérica",
    es: {
      title: "Prácticas en auditoría de sistemas",
      context: "Área Comercial",
      summary: "Participé en una auditoría física e informática para evaluar recursos tecnológicos, controles internos y gestión de activos.",
      details: ["Verificación de equipos y validación del inventario.", "Revisión de software, licencias y controles de acceso.", "Evaluación del cumplimiento de políticas informáticas."]
    },
    en: {
      title: "Systems audit internship",
      context: "Commercial department",
      summary: "I took part in a physical and IT audit covering technology resources, internal controls, and asset management.",
      details: ["Checked equipment and validated inventory records.", "Reviewed software, licensing, and access controls.", "Assessed compliance with IT policies."]
    }
  },
  {
    id: "water",
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
    id: "insurance",
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
  { es: "Lenguajes", en: "Languages", tools: "Java · JavaScript · TypeScript · PHP · Python · C#" },
  { es: "Desarrollo web", en: "Web development", tools: "HTML · CSS · Bootstrap · Laravel · Angular · .NET" },
  { es: "Bases de datos", en: "Databases", tools: "MySQL · SQL Server · PostgreSQL" },
  { es: "Análisis y control de versiones", en: "Analysis and version control", tools: "UML · Git · GitHub" }
];

export function experienceMarkup(entry, language) {
  const { title, context, summary, details } = entry[language];
  return `<h3>${title}</h3><p class="resume-meta">${entry.organization} · ${context}</p>
    <p>${summary}</p><ul>${details.map((detail) => `<li>${detail}</li>`).join("")}</ul>`;
}
