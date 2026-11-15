import { translations } from "./content.js";

const github = "https://github.com/Diego200509/";

export const archiveProjects = [
  {
    category: "web",
    icon: "nextdotjs",
    name: { es: "EduRural", en: "EduRural" },
    summary: {
      es: "Registro de asistencia escolar por curso, con historial, edición de registros y un resumen de faltas.",
      en: "Course-based school attendance tracking with a history, editable records, and absence summaries."
    },
    stack: "Next.js · NestJS · MongoDB",
    links: [["archiveCode", github + "EduRural"]]
  },
  {
    category: "web",
    icon: "document",
    name: { es: "Facturación", en: "Invoice management" },
    summary: {
      es: "Permite crear facturas con ítems, consultar el detalle y generar un reporte. La API separa los casos de uso de la persistencia.",
      en: "Creates invoices with line items, shows invoice details, and generates a report. The API separates use cases from persistence."
    },
    stack: "React · TypeScript · Fastify · TypeORM",
    links: [["archiveFrontend", github + "front-factura"], ["archiveBackend", github + "back-factura"]]
  },
  {
    category: "data",
    icon: "python",
    name: { es: "Procesamiento digital de imágenes", en: "Digital image processing" },
    summary: {
      es: "Aplica filtros espaciales y de frecuencia, detecta bordes con Sobel y calcula el área y el perímetro de un objeto.",
      en: "Applies spatial and frequency filters, detects edges with Sobel, and calculates an object’s area and perimeter."
    },
    stack: "Python · Tkinter · NumPy · Pillow",
    links: [["archiveCode", github + "Dominio_Tiempo_Frecuencia_IA"]]
  },
  {
    category: "interactive",
    icon: "threedotjs",
    name: { es: "Distrito Cero", en: "Distrito Cero" },
    summary: {
      es: "Un barrio 3D recorrible con un avatar animado, cámaras en primera y tercera persona y experiencias ligadas al portafolio.",
      en: "An explorable 3D neighborhood with an animated avatar, first- and third-person cameras, and activities tied to the portfolio."
    },
    stack: "JavaScript · Three.js · WebGL",
    links: [["archiveVisit", "./index.html#inicio"], ["archiveCode", github + "diego200509.github.io"]]
  },
  {
    category: "web",
    icon: "typescript",
    name: { es: "NovaCore", en: "NovaCore" },
    summary: {
      es: "Portafolio académico con un blog, una API con caché y almacenamiento de imágenes en Cloudinary.",
      en: "An academic portfolio with a blog, a cached API, and image storage in Cloudinary."
    },
    stack: "TypeScript · Prisma · Cloudinary",
    links: [["archiveCode", github + "NovaCore"]]
  }
];

const categoryLabels = {
  web: "archiveWeb",
  data: "archiveData",
  interactive: "archiveInteractive"
};

export function renderArchiveCards(container, language, selection, heading = "h3") {
  const words = translations[language];
  container.innerHTML = selection.map(project => `<article class="archive-card">
    <div class="archive-card-header">
      <span class="archive-icon" aria-hidden="true"><svg focusable="false"><use href="./assets/landing-icons.svg#${project.icon}"></use></svg></span>
      <small>${words[categoryLabels[project.category]]}</small>
    </div>
    <${heading}>${project.name[language]}</${heading}>
    <p>${project.summary[language]}</p>
    <p class="archive-stack">${project.stack}</p>
    <div class="archive-links">${project.links.map(([label, href]) => {
      const isExternal = href.startsWith("https://");
      const address = isExternal ? href : href.replace("#", "?lang=" + language + "#");
      const external = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="text-link" href="${address}"${external}>${words[label]}</a>`;
    }).join("")}</div>
  </article>`).join("");
}
