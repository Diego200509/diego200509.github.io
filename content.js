const repo = "https://github.com/Diego200509/";

export const projects = [
  {
    id: "asotema", name: { es: "ASOTEMA", en: "ASOTEMA" }, accent: "#f0b769",
    repo: repo + "asotema", stack: "Laravel · React · MySQL",
    icon: '<path d="M5 17 24 7l19 10M8 20h32M10 38h28M6 42h36M13 21v17m11-17v17m11-17v17"/>',
    es: {
      kind: "Gestión asociativa", location: "Casa de socios",
      short: "Ahorros, préstamos y movimientos contables de una asociación.",
      problem: "Gestionar aportes de socios, cuotas y pagos exige mantener trazabilidad entre cuentas individuales y fondos de la asociación.",
      solution: "El sistema registra socios, aportes mensuales, préstamos y pagos parciales. La documentación describe movimientos de partida doble, cronogramas de cuotas y reportes."
    },
    en: {
      kind: "Association management", location: "Members’ hall",
      short: "An association’s savings, loans and accounting records.",
      problem: "Tracking member contributions, installments and payments requires a clear record across individual and association accounts.",
      solution: "The system records members, monthly contributions, loans and partial payments. Its documentation describes double-entry accounting, installment schedules and reports."
    }
  },
  {
    id: "edurural", name: { es: "EduRural", en: "EduRural" }, accent: "#9cd6ad",
    repo: repo + "EduRural", stack: "Next.js · NestJS · TypeScript · MongoDB",
    icon: '<path d="m6 23 18-13 18 13M9 21v18h30V21M20 39V28h8v11m-15-12h3m16 0h3M24 10V4h11l-3 3 3 3H24"/>',
    es: {
      kind: "Educación rural", location: "Escuela",
      short: "Registro de estudiantes y seguimiento de asistencia en escuelas rurales.",
      problem: "Sin un registro organizado de estudiantes y asistencia, es más difícil detectar a tiempo ausencias recurrentes en contextos rurales.",
      solution: "Los hitos del proyecto documentan el registro de estudiantes y un módulo básico de asistencia. La detección de riesgo de deserción forma parte del objetivo del proyecto."
    },
    en: {
      kind: "Rural education", location: "School",
      short: "Student records and attendance tracking for rural schools.",
      problem: "Without organized student and attendance records, recurring absences are harder to identify early in rural communities.",
      solution: "The project milestones document student registration and a basic attendance module. Identifying students at risk of dropping out is one of the project’s goals."
    }
  },
  {
    id: "traffic", name: { es: "Semáforo IA", en: "AI Traffic Light" }, accent: "#f0a38e",
    repo: repo + "Semaforo_IA", stack: "Python · Pygame · Lógica difusa · Algoritmos genéticos",
    stackEn: "Python · Pygame · Fuzzy logic · Genetic algorithms",
    icon: '<rect x="15" y="4" width="18" height="40" rx="5"/><circle cx="24" cy="13" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="24" cy="35" r="3"/>',
    es: {
      kind: "Simulación de tráfico", location: "Cruce inteligente",
      short: "Comparación de control adaptativo y tiempos fijos en cruces simulados.",
      problem: "Los ciclos de tiempo fijo pueden asignar el mismo tiempo de paso a vías con demandas distintas.",
      solution: "El simulador compara tiempos fijos con un controlador difuso y permite probar parámetros ajustados con algoritmos genéticos en escenarios de tráfico."
    },
    en: {
      kind: "Traffic simulation", location: "Smart crossing",
      short: "Adaptive and fixed-time control at simulated intersections.",
      problem: "Fixed cycles can give the same green time to roads with very different levels of demand.",
      solution: "The simulator compares fixed timing with a fuzzy controller and can test parameters tuned by genetic algorithms across traffic scenarios."
    }
  },
  {
    id: "rgb", name: { es: "Laboratorio RGB", en: "RGB Lab" }, accent: "#a9baf6",
    repo: repo + "Lab_imagenes_rgb", stack: "Python · Procesamiento de imágenes",
    stackEn: "Python · Image processing",
    icon: '<circle cx="18" cy="18" r="10"/><circle cx="30" cy="18" r="10"/><circle cx="24" cy="30" r="10"/>',
    es: {
      kind: "Procesamiento de imágenes", location: "Laboratorio de color",
      short: "Una aplicación de escritorio para ajustar y recombinar canales de color.",
      problem: "Para analizar o ajustar una imagen, conviene poder inspeccionar cada canal y ver cómo afecta al resultado final.",
      solution: "La aplicación separa canales RGB, calcula histogramas, permite ajustar rangos tonales y reconstruye la imagen. También exporta versiones reducidas o en blanco y negro."
    },
    en: {
      kind: "Image processing", location: "Color lab",
      short: "A desktop app for adjusting and recombining color channels.",
      problem: "Analyzing or correcting an image is easier when you can inspect each color channel and see how it affects the final image.",
      solution: "The app separates RGB channels, calculates histograms, adjusts tonal ranges and reconstructs the image. It can also export resized or black-and-white versions."
    }
  }
];

export const translations = {
  es: {
    skip: "Ir a proyectos", nav: "Principal", home: "Distrito Cero · Inicio",
    projects: "Proyectos", profile: "Perfil", contact: "Contacto",
    intro: "DIEGO JIJÓN / PORTAFOLIO",
    lead: "Explora un barrio 3D inspirado en los Andes ecuatorianos. Cada lugar te lleva a un proyecto.",
    enter: "Explorar en 3D", viewProjects: "Ver proyectos ↓",
    concept: "Arte conceptual · Laboratorio RGB", selected: "Proyectos seleccionados", allRepos: "Todos en GitHub ↗",
    about: "SOBRE MÍ", education: "Formación", degree: "Ingeniería en Software · Universidad Técnica de Ambato",
    bio: "Estudio Ingeniería en Software en la Universidad Técnica de Ambato. Me interesa desarrollar aplicaciones, trabajar con bases de datos y aplicar IA y automatización a problemas concretos.",
    cv: "Ver CV", cvSummary: "CV breve", print: "Imprimir / Guardar PDF", backSite: "← Portafolio",
    contactLabel: "CONTACTO", talk: "Hablemos de software.", githubProfile: "Mi perfil de GitHub ↗",
    exit: "← Salir", district: "DISTRITO CERO", map: "Mapa", mapTitle: "Mapa del distrito",
    loading: "Preparando el distrito…", interact: "Interactuar", close: "Cerrar", movement: "Movimiento",
    forward: "Avanzar", left: "Izquierda", right: "Derecha", back: "Atrás",
    source: "Ver repositorio ↗", detail: "Ver ficha ↗", problem: "El problema", solution: "La solución",
    gameError: "No se pudo iniciar el 3D en este navegador. Las fichas de los proyectos siguen disponibles.",
    controls: "WASD · Arrastra para mirar · E para interactuar",
    touchControls: "Usa las flechas · Arrastra para mirar",
    explore: "Explora el barrio o elige un destino en el mapa.",
    use: "Interactúa para conocer el proyecto.", lab: "Interactúa con los prismas para restaurar el mural",
    aimed: "Pulsa para encajar el prisma", red: "rojo", green: "verde", blue: "azul",
    labDone: "Mural restaurado. Abre la ficha del laboratorio.", seen: "Visitado", unseen: "Sin visitar",
    visited: (total) => total + " de 4 lugares visitados",
    switchLanguage: "Switch to English", focusGame: "Vista del mundo 3D",
    nextPrism: "Siguiente prisma", plaza: "Plaza"
  },
  en: {
    skip: "Skip to projects", nav: "Main navigation", home: "Distrito Cero · Home",
    projects: "Projects", profile: "Profile", contact: "Contact",
    intro: "DIEGO JIJÓN / PORTFOLIO",
    lead: "Explore a 3D neighborhood inspired by the Ecuadorian Andes. Every location leads to a project.",
    enter: "Explore in 3D", viewProjects: "View projects ↓",
    concept: "Concept art · RGB Lab", selected: "Selected projects", allRepos: "All on GitHub ↗",
    about: "ABOUT ME", education: "Education", degree: "Software Engineering · Technical University of Ambato",
    bio: "I study Software Engineering at the Technical University of Ambato. I’m interested in building applications, working with databases, and applying AI and automation to practical problems.",
    cv: "View résumé", cvSummary: "Résumé summary", print: "Print / Save PDF", backSite: "← Portfolio",
    contactLabel: "CONTACT", talk: "Let’s talk software.", githubProfile: "My GitHub profile ↗",
    exit: "← Exit", district: "DISTRITO CERO", map: "Map", mapTitle: "District map",
    loading: "Preparing the district…", interact: "Interact", close: "Close", movement: "Movement",
    forward: "Move forward", left: "Move left", right: "Move right", back: "Move backward",
    source: "View repository ↗", detail: "View project ↗", problem: "The problem", solution: "The solution",
    gameError: "The 3D world could not start in this browser. You can still browse the projects.",
    controls: "WASD · Drag to look · E to interact",
    touchControls: "Use the arrows · Drag to look",
    explore: "Explore the neighborhood or choose a destination on the map.",
    use: "Interact to read about this project.", lab: "Interact with the prisms to restore the mural",
    aimed: "Press to slot the prism into place", red: "red", green: "green", blue: "blue",
    labDone: "Mural restored. Open the lab’s project details.", seen: "Visited", unseen: "Unvisited",
    visited: (total) => total + " of 4 locations visited",
    switchLanguage: "Cambiar a español", focusGame: "3D world view",
    nextPrism: "Next prism", plaza: "Plaza"
  }
};

export function loadLanguage() {
  const requested = new URLSearchParams(location.search).get("lang");
  if (requested === "es" || requested === "en") return requested;
  try { return localStorage.getItem("district-language") === "en" ? "en" : "es"; }
  catch { return "es"; }
}

export function saveLanguage(language) {
  try { localStorage.setItem("district-language", language); } catch {}
  const url = new URL(location.href);
  url.searchParams.set("lang", language);
  history.replaceState(null, "", url);
}

export function translatePage(language) {
  document.documentElement.lang = language;
  const words = translations[language];
  for (const item of document.querySelectorAll("[data-t]")) item.textContent = words[item.dataset.t];
  for (const item of document.querySelectorAll("[data-aria]")) item.setAttribute("aria-label", words[item.dataset.aria]);
  for (const item of document.querySelectorAll("[data-lang]")) item.setAttribute("aria-pressed", item.dataset.lang === language);
}
