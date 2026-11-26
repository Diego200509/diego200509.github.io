export const caseLabels = {
  es: {
    demo: "Ver demostración ↓", sections: "En esta ficha", context: "Contexto", contribution: "Mi contribución",
    architecture: "Cómo funciona", evidence: "Código y evidencia", problem: "El problema", solution: "La solución",
    technologies: "Tecnologías", commits: "Ver mis contribuciones en GitHub", other: "Explorar otros proyectos",
    more: "Ver los proyectos seleccionados →"
  },
  en: {
    demo: "See the demo ↓", sections: "On this page", context: "Context", contribution: "My contribution",
    architecture: "How it works", evidence: "Code and evidence", problem: "The problem", solution: "The solution",
    technologies: "Technologies", commits: "See my contributions on GitHub", other: "Explore other projects",
    more: "See selected projects →"
  }
};

export const caseDetails = {
  asotema: {
    icon: "document",
    capture: { src: "./assets/asotema-aplicacion.webp", width: 1296, height: 650 },
    es: {
      headline: "Del aporte del socio al registro contable",
      demoTitle: "Un recorrido por la cuenta del socio",
      demoNote: "Ejemplo con datos ficticios. El préstamo es de $60 y la cuota de $21 incluye $20 de capital y $1 de interés.",
      contributions: [
        "Desarrollé reportes por socio para consultar ahorros, gastos y préstamos, y añadí el reporte de cuentas de ASOTEMA.",
        "Trabajé en el módulo de eventos, incluyendo el registro de ingresos y gastos, su contabilización y la asistencia."
      ],
      flow: [
        ["React", "La interfaz registra socios y operaciones, consulta cronogramas y presenta reportes."],
        ["Laravel", "La API guarda el préstamo, calcula las cuotas y registra los movimientos de partida doble."],
        ["MySQL", "Los movimientos se vinculan con la cuenta y la operación que los originó."]
      ],
      evidence: [["Documentación de préstamos y asientos", "SISTEMA_PRESTAMOS.md"], ["Servicio de préstamos en Laravel", "api/app/Services/PrestamoService.php"]],
      capture: "Estado de cuenta en la aplicación de ASOTEMA con depósitos y retiros de un socio ficticio."
    },
    en: {
      headline: "From member contributions to the ledger",
      demoTitle: "A walkthrough of a member account",
      demoNote: "Illustrative data. The loan is $60, and the $21 payment includes $20 in principal and $1 in interest.",
      contributions: [
        "I developed member reports for savings, expenses, and loans, and added the association’s account report.",
        "I worked on the events module, covering income and expense tracking, accounting entries, and attendance."
      ],
      flow: [
        ["React", "The interface records members and transactions, displays payment schedules, and presents reports."],
        ["Laravel", "The API saves loans, calculates installments, and posts double-entry transactions."],
        ["MySQL", "Each ledger entry is linked to its account and the transaction that created it."]
      ],
      evidence: [["Loan and ledger documentation", "SISTEMA_PRESTAMOS.md"], ["Laravel loan service", "api/app/Services/PrestamoService.php"]],
      capture: "An account statement in the ASOTEMA app showing deposits and withdrawals for a fictional member."
    }
  },
  talkapp: {
    icon: "socketdotio",
    capture: { src: "./assets/talkapp-aplicacion.webp", width: 1296, height: 720 },
    es: {
      headline: "Del primer mensaje a la videollamada",
      demoTitle: "Sigue el recorrido de un mensaje o llamada",
      demoNote: "Diagrama de los flujos de la aplicación. Las videollamadas se realizan entre dos participantes.",
      contributions: [
        "Trabajé en módulos de acceso y chat, incorporé el envío de notas de voz y desarrollé la videollamada individual.",
        "La mensajería guarda un historial y distribuye eventos en tiempo real. En la llamada, la señalización pasa por el servidor y WebRTC gestiona la conexión de audio y video."
      ],
      flow: [
        ["Next.js", "La interfaz reúne chats individuales, conversaciones grupales y controles de llamada."],
        ["Express y Socket.IO", "El servidor valida el acceso y distribuye mensajes, estados y eventos de señalización."],
        ["MongoDB y WebRTC", "MongoDB conserva el historial. WebRTC negocia el intercambio de audio y video."]
      ],
      evidence: [["Eventos del chat", "back/socket/chat.handlers.js"], ["Señalización de videollamadas", "back/socket/call.handlers.js"]],
      capture: "Conversación entre dos cuentas de prueba en la aplicación web de TalkApp."
    },
    en: {
      headline: "From the first message to the video call",
      demoTitle: "Follow a message or call through the app",
      demoNote: "A diagram of the app’s flows. Video calls take place between two participants.",
      contributions: [
        "I worked on sign-in and chat modules, added voice messages, and built one-to-one video calling.",
        "Messaging stores a history and broadcasts real-time events. For calls, the server handles signaling while WebRTC manages the audio and video connection."
      ],
      flow: [
        ["Next.js", "The interface brings together direct chat, group conversations, and call controls."],
        ["Express and Socket.IO", "The server validates access and distributes messages, status updates, and signaling events."],
        ["MongoDB and WebRTC", "MongoDB stores history. WebRTC negotiates the exchange of audio and video."]
      ],
      evidence: [["Chat events", "back/socket/chat.handlers.js"], ["Video call signaling", "back/socket/call.handlers.js"]],
      capture: "A conversation between two test accounts in the TalkApp web application."
    }
  },
  traffic: {
    icon: "python",
    es: {
      headline: "Cómo cambia una cola cuando el verde se adapta",
      demoTitle: "Dos semáforos, las mismas llegadas",
      demoNote: "Esta demo usa el modelo web simplificado. Cada prueba parte con 3 vehículos N–S y 2 E–O y dura 24 pasos, con las mismas llegadas para ambos modos.",
      contributions: [
        "Ajusté la medición de colas antes de la fase verde y el cambio de fase para tomar en cuenta los carriles de cada eje.",
        "En el algoritmo genético, añadí elitismo para conservar los mejores individuos y ajusté la evaluación para penalizar esperas y colas extremas."
      ],
      flow: [
        ["Simulación", "El cruce genera vehículos y registra densidad, espera y longitud de cola por eje."],
        ["Control difuso", "Una base de reglas combina las entradas para proponer la duración de la fase verde."],
        ["Algoritmo genético", "La evaluación usa métricas de espera y cola para comparar configuraciones del controlador."]
      ],
      evidence: [["Controlador difuso", "difuso/controlador.py"], ["Función de evaluación genética", "genetico/fitness.py"]]
    },
    en: {
      headline: "What happens to a queue when green time adapts?",
      demoTitle: "Two traffic lights, the same arrivals",
      demoNote: "This demo uses the simplified web model. Each run starts with 3 N–S vehicles and 2 E–W vehicles, then runs for 24 steps with identical arrivals in both modes.",
      contributions: [
        "I refined how queues are measured before a green phase and how the phase changes account for the lanes on each axis.",
        "I added elitism to preserve the best individuals in the genetic algorithm and adjusted its evaluation to penalize extreme waits and queues."
      ],
      flow: [
        ["Simulation", "The intersection generates vehicles and records density, waiting times, and queue length on each axis."],
        ["Fuzzy control", "A rule base combines the inputs to propose how long the green phase should last."],
        ["Genetic algorithm", "The fitness function uses waiting and queue metrics to compare controller configurations."]
      ],
      evidence: [["Fuzzy controller", "difuso/controlador.py"], ["Genetic fitness function", "genetico/fitness.py"]]
    }
  },
  rgb: {
    icon: "canvas-api",
    capture: { src: "./assets/rgb-aplicacion.webp", width: 1480, height: 760 },
    es: {
      headline: "Tres canales, una imagen",
      demoTitle: "Del píxel al histograma",
      demoNote: "Elige un canal y modifica su contraste. El histograma compara cómo se distribuyen sus intensidades de 0 a 255.",
      contributions: [
        "Implementé el procesamiento manual de los canales RGB, desde la separación en matrices hasta el cálculo de histogramas y la reconstrucción.",
        "Añadí una ventana para inspeccionar los histogramas por separado y ver cómo los controles tonales cambian la distribución de intensidades."
      ],
      flow: [
        ["Separar", "La aplicación convierte la imagen RGB en tres matrices de intensidades."],
        ["Transformar", "Una tabla por canal comprime los tonos o amplía el contraste con una curva en S."],
        ["Reconstruir", "Las matrices vuelven a formar una imagen RGB y los histogramas muestran el cambio."]
      ],
      evidence: [["Procesamiento de imágenes en Python", "laboratorio_rgb/nucleo/procesamiento_imagen.py"], ["Documentación y uso", "README.md"]],
      capture: "Captura de la aplicación de escritorio con sus vistas de canales e histogramas."
    },
    en: {
      headline: "Three channels, one image",
      demoTitle: "From pixel to histogram",
      demoNote: "Pick a channel and adjust its contrast. The histogram compares how its intensities are distributed from 0 to 255.",
      contributions: [
        "I implemented manual RGB channel processing, from splitting the image into matrices to calculating histograms and rebuilding the image.",
        "I added a separate histogram window to inspect each channel and see how tonal adjustments change the distribution of intensities."
      ],
      flow: [
        ["Split", "The app converts an RGB image into three intensity matrices."],
        ["Transform", "A lookup table for each channel compresses tones or expands contrast with an S-curve."],
        ["Recombine", "The matrices are recombined into an RGB image, and the histograms show what changed."]
      ],
      evidence: [["Python image processing", "laboratorio_rgb/nucleo/procesamiento_imagen.py"], ["Documentation and usage", "README.md"]],
      capture: "Screenshot of the desktop app showing channel views and histograms."
    }
  }
};
