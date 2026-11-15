const repo = "https://github.com/Diego200509/";

export const projects = [
  {
    id: "asotema", page: "asotema.html", name: { es: "ASOTEMA", en: "ASOTEMA" },
    repo: repo + "asotema", stack: "Laravel · React · MySQL",
    demoNote: "asotemaDemoNote",
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
    id: "talkapp", page: "talkapp.html", name: { es: "TalkApp", en: "TalkApp" },
    repo: repo + "talk-app", stack: "Next.js · TypeScript · Express · MongoDB · Socket.IO · WebRTC",
    es: {
      kind: "Mensajería web", location: "Estación de radio",
      short: "Chats individuales y grupales en tiempo real, con videollamadas.",
      problem: "Cuando un equipo coordina por chat y se reúne por videollamada en otra aplicación, la conversación queda repartida entre herramientas.",
      solution: "TalkApp reúne conversaciones individuales, grupos y videollamadas en una aplicación web. Usa Socket.IO para entregar mensajes en tiempo real, MongoDB para conservar el historial y WebRTC para las llamadas.",
      features: [
        "Adjuntos, notas de voz e indicadores de entrega y lectura.",
        "Gestión de miembros y permisos de administrador en grupos.",
        "Controles de cámara y micrófono durante las videollamadas."
      ]
    },
    en: {
      kind: "Web messaging", location: "Radio station",
      short: "Real-time direct and group chats with video calls.",
      problem: "When a team coordinates by chat and meets by video in another app, the conversation gets split across tools.",
      solution: "TalkApp brings direct messages, group chats, and video calls into one web app. It uses Socket.IO for real-time messaging, MongoDB for conversation history, and WebRTC for calls.",
      features: [
        "Attachments, voice messages, and delivery and read receipts.",
        "Group member management and admin permissions.",
        "Camera and microphone controls during video calls."
      ]
    }
  },
  {
    id: "traffic", page: "semaforo-ia.html", name: { es: "Semáforo IA", en: "AI Traffic Light" },
    repo: repo + "Semaforo_IA", stack: "Python · Pygame · Lógica difusa · Algoritmos genéticos",
    stackEn: "Python · Pygame · Fuzzy logic · Genetic algorithms",
    demoNote: "trafficDemoNote",
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
    id: "rgb", page: "laboratorio-rgb.html", name: { es: "Laboratorio RGB", en: "RGB Lab" },
    repo: repo + "Lab_imagenes_rgb", stack: "Python · Procesamiento de imágenes",
    stackEn: "Python · Image processing",
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

export function projectPage(project, language) {
  return "./" + project.page + "?lang=" + language;
}

export const translations = {
  es: {
    skip: "Ir a proyectos", nav: "Principal", menu: "Menú", home: "Distrito Cero · Inicio",
    projects: "Proyectos", profile: "Sobre mí", contact: "Contacto", caseView: "Ver ficha →",
    technologies: "Tecnologías", certificates: "Certificados",
    intro: "PORTAFOLIO · AMBATO, ECUADOR",
    role: "Estudiante de Ingeniería en Software",
    lead: "Desarrollo aplicaciones web y experiencias interactivas para problemas de gestión y comunicación.",
    professionalLinks: "Redes profesionales",
    personalEmail: "Correo personal",
    moreProjects: "Más proyectos", archiveLink: "Ver archivo completo ↗",
    archiveTitle: "Archivo de proyectos",
    archiveIntroduction: "Aplicaciones web, asistentes de IA y experiencias interactivas que he construido.",
    archiveFilterLabel: "Filtrar por área", archiveAll: "Todos", archiveWeb: "Desarrollo web",
    archiveData: "Imágenes y datos", archiveAI: "Inteligencia artificial", archiveInteractive: "Experiencias 3D",
    archiveCode: "Código ↗", archiveFrontend: "Frontend ↗", archiveBackend: "API ↗", archiveVisit: "Ver portafolio ↗",
    archiveCount: count => count === 1 ? "1 proyecto" : `${count} proyectos`,
    enter: "Explorar en 3D", viewProjects: "Ver proyectos ↓",
    avatarAlt: "Retrato 3D del rostro de Diego Jijón",
    openingLabel: "Intro de Distrito Cero", skipOpening: "Saltar",
    showTrailer: "Ver tráiler", hideTrailer: "Cerrar tráiler", trailerLabel: "Tráiler de Distrito Cero",
    trailerDescription: "Diego recorre la plaza. Una vista aérea muestra el distrito y, frente al Laboratorio RGB, los prismas devuelven el color al mural.",
    trailerError: "No se pudo reproducir el tráiler.",
    asotemaSimulation: "Simulación", asotemaReset: "Reiniciar simulación",
    asotemaSavings: "Ahorros", asotemaPrincipal: "Capital",
    asotemaActions: "Operaciones de ejemplo", asotemaDeposit: "Aportar", asotemaPay: "Pagar cuota",
    asotemaDemoNote: "La tarjeta usa datos ficticios. Puedes registrar un aporte de $20 y pagar hasta tres cuotas. De cada cuota de $21, $20 reducen el capital pendiente y $1 corresponde a intereses.",
    talkPreview: "Chat de ejemplo", talkDirect: "Directo", talkGroup: "Grupo",
    talkDirectFirst: "¿Listo para la llamada?", talkDirectReply: "Sí, ya me conecto.",
    talkGroupFirst: "¿Probamos la demo?", talkGroupReply: "Equipo listo.",
    trafficMode: "Modo del semáforo", trafficFixed: "Fijo", trafficAdaptive: "Adaptativo",
    trafficAdaptiveLabel: "Adaptativo (Auto)",
    trafficDemand: "+ Tráfico N–S", trafficDemandLabel: "Más tráfico norte-sur",
    trafficPlay: "Iniciar", trafficPause: "Pausar", trafficResume: "Continuar",
    trafficQueues: "Vehículos en espera", trafficWaiting: "Colas", trafficEastWest: "E–O",
    trafficGreenNorth: "Verde norte–sur", trafficGreenEast: "Verde este–oeste", trafficAllRed: "Rojo en ambas vías",
    trafficDemoNote: "La tarjeta muestra una simulación simplificada. Al cambiar el modo, la prueba reinicia con la misma secuencia de llegadas. El modo adaptativo ajusta el tiempo en verde según las colas.",
    rgbTitle: "Laboratorio RGB", rgbSettings: "Ajustes ↗", rgbSettingsLabel: "Ajustes y captura", rgbAdvanced: "Ajustes de contraste",
    rgbSampleAlt: "Frutas de varios colores en cestas",
    rgbBefore: "Original", rgbAfter: "Resultado", rgbCompare: "Porcentaje visible de la imagen original",
    rgbInstructions: "Arrastra la línea o usa las flechas del teclado para comparar.",
    rgbChannels: "Canales de color",
    rgbRed: "Rojo", rgbGreen: "Verde", rgbBlue: "Azul",
    rgbRedTone: "Contraste del canal rojo", rgbGreenTone: "Contraste del canal verde", rgbBlueTone: "Contraste del canal azul",
    rgbReset: "Restaurar imagen", rgbError: "La comparación no pudo cargar.",
    rgbDesktop: "La aplicación en Python", rgbViewCapture: "Ampliar captura ↗",
    rgbDesktopAlt: "Captura de Laboratorio RGB en Python con matrices e histogramas",
    rgbDesktopCopy: "El programa separa la imagen en tres matrices, aplica una transformación tonal a cada una y las vuelve a unir. En la pestaña Canales puedes comparar las matrices y sus histogramas antes y después del ajuste.",
    featured: "CASO DESTACADO · AMBACAR", featuredTitle: "Gestión de usuarios ZEUS",
    featuredCopy: "En mis prácticas trabajé en el módulo de AMBYSOFT para crear y editar usuarios y asignarles agencias, divisiones y roles. Diseñé pantallas y las conecté con los servicios del backend.",
    featuredDetail: "Ver mi aporte ↗", flowTitle: "Registro de un usuario",
    flowUser: "Ingresar los datos del usuario", flowAssignment: "Asignar agencia, división y rol",
    flowValidation: "Validar los datos y registrar el usuario", flowNote: "Flujo ilustrativo del módulo",
    flowUserDetail: "El formulario reúne los datos necesarios para crear el registro.",
    flowAssignmentDetail: "Los catálogos conectados al backend ofrecen las opciones que corresponden a cada campo.",
    flowValidationDetail: "El backend comprueba los datos antes de guardar el registro.",
    selected: "Proyectos seleccionados", allRepos: "Todos en GitHub ↗",
    about: "SOBRE MÍ", education: "Formación", degree: "Ingeniería en Software · Universidad Técnica de Ambato",
    experience: "Experiencia", skills: "Habilidades", languages: "Idiomas", languageLevels: "Español nativo · Inglés B1",
    garage: "Taller de TI", readExperience: "Ver experiencia ↗", readCv: "Ver CV completo ↗",
    bio: "Estudio Ingeniería en Software en la Universidad Técnica de Ambato. Me interesa desarrollar aplicaciones, trabajar con bases de datos y aplicar IA y automatización a problemas concretos.",
    profilePhotoAlt: "Retrato de Diego Jijón", profileLocation: "Ambato, Ecuador",
    profileIntro: "Estudio Ingeniería en Software en la Universidad Técnica de Ambato. Me gusta conectar interfaces con APIs y bases de datos.",
    profileWork: "En Ambacar diseñé pantallas y desarrollé filtros y paginación para el módulo de usuarios de AMBYSOFT. En TalkApp trabajé con mensajería en tiempo real.",
    profileAI: "Me interesa la IA aplicada al análisis de datos y a la toma de decisiones. En Semáforo IA exploré cómo la lógica difusa y los algoritmos genéticos pueden adaptar un cruce al volumen de tráfico.",
    profileRemote: "Abierto a oportunidades remotas", profileStudyStage: "Avance académico", profileSemester: "8.º semestre",
    profileStack: "Tecnologías con las que más trabajo",
    profileStats: "Cifras de mi trabajo", profileRepos: "Repos públicos", profileDemos: "Demos interactivas", profilePulls: "Pull requests fusionados",
    personal: "Me gustan los videojuegos como Valorant. Esa afición inspiró Distrito Cero, un barrio que puedes recorrer para descubrir lo que he construido.",
    techLanguages: "Lenguajes", techDatabases: "Bases de datos", techGraphics: "Gráficos y simulación", techTools: "Herramientas",
    certDataTitle: "Fundamentos de ciencia de datos con Python", certDataDate: "28 de septiembre de 2026",
    certDataCopy: "Análisis y visualización de datos con Python, Pandas y Matplotlib.",
    certDataPdf: "Ver PDF de Fundamentos de ciencia de datos con Python",
    certNetworkTitle: "Soporte y Seguridad de Red", certNetworkDate: "21 de diciembre de 2024",
    certNetworkCopy: "Diagnóstico de redes, control de acceso y soporte a usuarios.",
    certIotDate: "10 de junio de 2024", certIotCopy: "Fundamentos del internet de las cosas y de los dispositivos conectados.",
    certPdf: "Ver PDF ↗", certBadge: "Insignia en Credly ↗",
    githubAchievements: "Logros de GitHub", viewAchievements: "Ver perfil de logros ↗",
    pullShark: "Nivel bronce · 16+ pull requests fusionados",
    quickdraw: "Cierre en menos de 5 minutos", yolo: "Pull request fusionado sin revisión",
    workshopPreview: "Taller de Ambacar en Distrito Cero", workshopPreviewAlt: "Entrada abierta del taller de Ambacar en el mundo 3D",
    experienceDetails: "Ver responsabilidades",
    certNetworkPdf: "Ver PDF de Soporte y Seguridad de Red",
    certIotPdf: "Ver PDF de Introduction to IoT",
    cv: "Ver CV", cvSummary: "CV breve", cvDownload: "Descargar PDF", backSite: "← Portafolio",
    cvRole: "Estudiante de Ingeniería en Software · 8.º semestre", cvProfile: "Perfil",
    cvOverview: "Estudio Ingeniería en Software en la Universidad Técnica de Ambato y me gusta desarrollar aplicaciones de principio a fin, desde la interfaz hasta la API y la base de datos. En Ambacar trabajé en la administración de usuarios de AMBYSOFT, donde implementé filtros y paginación del lado del servidor.",
    cvInterests: "Con TalkApp trabajé en mensajería en tiempo real. Me interesa aplicar la inteligencia artificial al análisis de datos y a problemas cotidianos, como la gestión del tráfico, un tema que exploré mediante simulación en Semáforo IA.",
    contactLabel: "CONTACTO", talk: "Hablemos.", githubProfile: "Mi perfil de GitHub ↗",
    contactIntro: "Si tienes un proyecto en mente o una oportunidad en desarrollo de software, escríbeme.",
    contactEmail: "Escríbeme un correo",
    exit: "← Salir", district: "DISTRITO CERO", map: "Mapa", mapTitle: "Mapa del distrito",
    loadingStages: ["Abriendo el plano…", "Construyendo el barrio…", "Preparando la primera vista…", "Distrito listo"],
    loadingProgress: "Carga del distrito", camera: "Cámara", firstPerson: "Primera persona", thirdPerson: "Tercera persona",
    interact: "Interactuar", close: "Cerrar", movement: "Movimiento",
    forward: "Avanzar", left: "Izquierda", right: "Derecha", back: "Atrás",
    source: "Ver repositorio ↗", detail: "Ver ficha ↗", problem: "El problema", solution: "La solución",
    projectFeatures: "Funciones principales",
    gameError: "No se pudo iniciar el 3D en este navegador. Las fichas de los proyectos siguen disponibles.",
    controls: "WASD para moverte · Mueve el mouse para mirar · E para interactuar · M para abrir el mapa · Esc libera el mouse · V o Ctrl + rueda cambia la cámara",
    touchControls: "Usa las flechas · Arrastra para mirar",
    help: "Mostrar u ocultar controles",
    workshopDoor: "Abrir taller", workshopEnter: "Entrar al taller",
    workshopInside: "Acércate a la terminal del banco de trabajo.",
    workshopTerminal: "Usar terminal", workshopDone: "Misión completada · Acceso registrado",
    use: "Interactúa para conocer el proyecto.", lab: "Interactúa con los prismas para restaurar el mural",
    aimed: "Pulsa para encajar el prisma", red: "rojo", green: "verde", blue: "azul",
    labDone: "Mural restaurado. Abre la ficha del laboratorio.", seen: "Visitado", unseen: "Sin visitar",
    visited: (total, count) => `${total} de ${count} lugares visitados`,
    switchLanguage: "Switch to English", focusGame: "Vista del mundo 3D",
    nextPrism: "Siguiente prisma", plaza: "Plaza"
  },
  en: {
    skip: "Skip to projects", nav: "Main navigation", menu: "Menu", home: "Distrito Cero · Home",
    projects: "Projects", profile: "About me", contact: "Contact", caseView: "View case study →",
    technologies: "Technologies", certificates: "Certificates",
    intro: "PORTFOLIO · AMBATO, ECUADOR",
    role: "Software Engineering student",
    lead: "I build web applications and interactive experiences for operations and communication.",
    professionalLinks: "Professional profiles",
    personalEmail: "Personal email",
    moreProjects: "More projects", archiveLink: "View full archive ↗",
    archiveTitle: "Project archive",
    archiveIntroduction: "Web applications, AI assistants, and interactive experiences I’ve built.",
    archiveFilterLabel: "Filter by area", archiveAll: "All", archiveWeb: "Web development",
    archiveData: "Images and data", archiveAI: "Artificial intelligence", archiveInteractive: "3D experiences",
    archiveCode: "Code ↗", archiveFrontend: "Frontend ↗", archiveBackend: "API ↗", archiveVisit: "View portfolio ↗",
    archiveCount: count => count === 1 ? "1 project" : `${count} projects`,
    enter: "Explore in 3D", viewProjects: "View projects ↓",
    avatarAlt: "3D portrait of Diego Jijón",
    openingLabel: "Distrito Cero intro", skipOpening: "Skip",
    showTrailer: "Watch trailer", hideTrailer: "Close trailer", trailerLabel: "Distrito Cero trailer",
    trailerDescription: "Diego walks across the plaza. An aerial view shows the district, and outside the RGB Lab, the prisms restore color to the mural.",
    trailerError: "The trailer could not be played.",
    asotemaSimulation: "Simulation", asotemaReset: "Reset simulation",
    asotemaSavings: "Savings", asotemaPrincipal: "Principal",
    asotemaActions: "Sample transactions", asotemaDeposit: "Deposit", asotemaPay: "Pay installment",
    asotemaDemoNote: "The card uses sample data. You can make a $20 deposit and pay up to three installments. Of each $21 installment, $20 goes toward the outstanding principal and $1 goes toward interest.",
    talkPreview: "Sample chat", talkDirect: "Direct", talkGroup: "Group",
    talkDirectFirst: "Ready for the call?", talkDirectReply: "Yes, joining now.",
    talkGroupFirst: "Shall we test the demo?", talkGroupReply: "The team is ready.",
    trafficMode: "Signal mode", trafficFixed: "Fixed", trafficAdaptive: "Adaptive",
    trafficAdaptiveLabel: "Adaptive (Auto)",
    trafficDemand: "+ N–S traffic", trafficDemandLabel: "More north–south traffic",
    trafficPlay: "Start", trafficPause: "Pause", trafficResume: "Resume",
    trafficQueues: "Vehicles waiting", trafficWaiting: "Queues", trafficEastWest: "E–W",
    trafficGreenNorth: "North–south green", trafficGreenEast: "East–west green", trafficAllRed: "All red",
    trafficDemoNote: "The card shows a simplified simulation. Switching modes restarts the test with the same sequence of arrivals. Adaptive mode adjusts green time based on the queues.",
    rgbTitle: "RGB Lab", rgbSettings: "Adjustments ↗", rgbSettingsLabel: "Adjustments and screenshot", rgbAdvanced: "Contrast adjustments",
    rgbSampleAlt: "Baskets of fruit in several colors",
    rgbBefore: "Original", rgbAfter: "Result", rgbCompare: "Visible percentage of the original image",
    rgbInstructions: "Drag the divider or use the arrow keys to compare.",
    rgbChannels: "Color channels",
    rgbRed: "Red", rgbGreen: "Green", rgbBlue: "Blue",
    rgbRedTone: "Red channel contrast", rgbGreenTone: "Green channel contrast", rgbBlueTone: "Blue channel contrast",
    rgbReset: "Restore image", rgbError: "The comparison could not load.",
    rgbDesktop: "The Python application", rgbViewCapture: "Enlarge screenshot ↗",
    rgbDesktopAlt: "Screenshot of the Python RGB Lab showing channel matrices and histograms",
    rgbDesktopCopy: "The app separates an image into three matrices, applies a tonal adjustment to each, and combines them again. The Channels tab shows the matrices and their histograms before and after adjustment.",
    featured: "FEATURED CASE · AMBACAR", featuredTitle: "ZEUS user management",
    featuredCopy: "During my internship, I worked on the AMBYSOFT module for creating and editing users and assigning branches, divisions, and roles. I designed screens and connected them to backend services.",
    featuredDetail: "View my contribution ↗", flowTitle: "Registering a user",
    flowUser: "Enter the user’s details", flowAssignment: "Assign a branch, division, and role",
    flowValidation: "Validate and register the user", flowNote: "Illustrative module workflow",
    flowUserDetail: "The form collects the information needed to create the record.",
    flowAssignmentDetail: "Reference lists connected to the backend provide options for each field.",
    flowValidationDetail: "The backend checks the information before saving the record.",
    selected: "Selected projects", allRepos: "All on GitHub ↗",
    about: "ABOUT ME", education: "Education", degree: "Software Engineering · Technical University of Ambato",
    experience: "Experience", skills: "Skills", languages: "Languages", languageLevels: "Native Spanish · English B1",
    garage: "IT workshop", readExperience: "View experience ↗", readCv: "View full résumé ↗",
    bio: "I study Software Engineering at the Technical University of Ambato. I’m interested in building applications, working with databases, and applying AI and automation to practical problems.",
    profilePhotoAlt: "Portrait of Diego Jijón", profileLocation: "Ambato, Ecuador",
    profileIntro: "I study Software Engineering at the Technical University of Ambato. I enjoy connecting interfaces to APIs and databases.",
    profileWork: "At Ambacar, I designed screens and built filters and pagination for the AMBYSOFT user management module. In TalkApp, I worked with real-time messaging.",
    profileAI: "I’m interested in AI for data analysis and decision-making. In AI Traffic Light, I explored how fuzzy logic and genetic algorithms can adapt a junction to changes in traffic volume.",
    profileRemote: "Open to remote opportunities", profileStudyStage: "Academic progress", profileSemester: "8th semester",
    profileStack: "Technologies I use most",
    profileStats: "My work in numbers", profileRepos: "Public repos", profileDemos: "Interactive demos", profilePulls: "Merged pull requests",
    personal: "I enjoy games like Valorant. That interest inspired Distrito Cero, a neighborhood you can explore to discover what I’ve built.",
    techLanguages: "Languages", techDatabases: "Databases", techGraphics: "Graphics and simulation", techTools: "Tools",
    certDataTitle: "Data Science Essentials with Python", certDataDate: "September 28, 2026",
    certDataCopy: "Data analysis and visualization with Python, Pandas, and Matplotlib.",
    certDataPdf: "View PDF for Data Science Essentials with Python",
    certNetworkTitle: "Network Support and Security", certNetworkDate: "December 21, 2024",
    certNetworkCopy: "Network troubleshooting, access control, and user support.",
    certIotDate: "June 10, 2024", certIotCopy: "Fundamentals of the Internet of Things and connected devices.",
    certPdf: "View PDF ↗", certBadge: "Credly badge ↗",
    githubAchievements: "GitHub achievements", viewAchievements: "View achievements profile ↗",
    pullShark: "Bronze level · 16+ pull requests merged",
    quickdraw: "Closed in under 5 minutes", yolo: "Merged a pull request without review",
    workshopPreview: "Ambacar workshop in Distrito Cero", workshopPreviewAlt: "Open entrance to the Ambacar workshop in the 3D world",
    experienceDetails: "View responsibilities",
    certNetworkPdf: "View PDF for Network Support and Security",
    certIotPdf: "View PDF for Introduction to IoT",
    cv: "View résumé", cvSummary: "Résumé summary", cvDownload: "Download PDF", backSite: "← Portfolio",
    cvRole: "Software Engineering student · 8th semester", cvProfile: "Profile",
    cvOverview: "I study Software Engineering at the Technical University of Ambato and enjoy building applications end to end, from the interface to the API and database. At Ambacar, I worked on AMBYSOFT's user management module, where I implemented server-side filtering and pagination.",
    cvInterests: "I worked on real-time messaging in TalkApp. I’m interested in applying AI to data analysis and everyday problems such as traffic management, which I explored through simulation in the AI Traffic Light project.",
    contactLabel: "CONTACT", talk: "Let’s talk.", githubProfile: "My GitHub profile ↗",
    contactIntro: "If you have a project in mind or a software development opportunity, get in touch.",
    contactEmail: "Send me an email",
    exit: "← Exit", district: "DISTRITO CERO", map: "Map", mapTitle: "District map",
    loadingStages: ["Opening the blueprint…", "Building the neighborhood…", "Preparing the first view…", "District ready"],
    loadingProgress: "District loading progress", camera: "Camera", firstPerson: "First person", thirdPerson: "Third person",
    interact: "Interact", close: "Close", movement: "Movement",
    forward: "Move forward", left: "Move left", right: "Move right", back: "Move backward",
    source: "View repository ↗", detail: "View project ↗", problem: "The problem", solution: "The solution",
    projectFeatures: "Key features",
    gameError: "The 3D world could not start in this browser. You can still browse the projects.",
    controls: "WASD to move · Move the mouse to look · E to interact · M for the map · Esc releases the mouse · V or Ctrl + wheel switches views",
    touchControls: "Use the arrows · Drag to look",
    help: "Show or hide controls",
    workshopDoor: "Open workshop", workshopEnter: "Enter workshop",
    workshopInside: "Walk up to the workbench terminal.",
    workshopTerminal: "Use terminal", workshopDone: "Mission complete · Access registered",
    use: "Interact to read about this project.", lab: "Interact with the prisms to restore the mural",
    aimed: "Press to slot the prism into place", red: "red", green: "green", blue: "blue",
    labDone: "Mural restored. Open the lab’s project details.", seen: "Visited", unseen: "Unvisited",
    visited: (total, count) => `${total} of ${count} locations visited`,
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
  for (const item of document.querySelectorAll("[data-alt]")) item.alt = words[item.dataset.alt];
  for (const item of document.querySelectorAll("[data-lang]")) item.setAttribute("aria-pressed", item.dataset.lang === language);
}
