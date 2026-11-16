import { createDesktop } from "./desktop.js?v=interiors";

const fields = ["branch", "division", "role"];
const solution = { branch: "quito", division: "service", role: "support" };

const translations = {
  es: {
    title: "Primer día en la agencia",
    label: "Estación de trabajo · Ambacar",
    users: "Usuarios",
    ticket: "Solicitud de acceso",
    panel: "Nuevo usuario",
    savedPanel: "Usuario registrado",
    pending: "Pendiente",
    registered: "Registrado",
    request: "Lucía Torres se incorpora al equipo de posventa en Quito. Necesita un perfil de soporte para consultar y gestionar las solicitudes del taller.",
    note: "Simulación con datos ficticios.",
    placeholder: "Seleccionar",
    branch: ["Agencia", [["ambato", "Ambato"], ["quito", "Quito"], ["guayaquil", "Guayaquil"]]],
    division: ["División", [["sales", "Ventas"], ["service", "Posventa"], ["finance", "Finanzas"]]],
    role: ["Rol", [["support", "Soporte"], ["supervisor", "Supervisor"], ["billing", "Facturación"]]],
    submit: "Validar y registrar",
    success: "Acceso registrado. El casillero y la salida se desbloquearon.",
    rapid: "Emisor de recarga rápida concedido.",
    basic: "Emisor básico concedido.",
    incomplete: "Completa estos campos",
    result: "Ver proyecto",
    feedback: {
      branch: "Revisa la agencia donde trabajará Lucía.",
      division: "Revisa el equipo al que se incorpora.",
      role: "Elige el rol que corresponde a las tareas de soporte del taller."
    }
  },
  en: {
    title: "First day at the branch",
    label: "Workstation · Ambacar",
    users: "Users",
    ticket: "Access request",
    panel: "New user",
    savedPanel: "User registered",
    pending: "Pending",
    registered: "Registered",
    request: "Lucía Torres is joining the after-sales team in Quito. She needs a support profile to view and manage workshop requests.",
    note: "Simulation with fictional data.",
    placeholder: "Select",
    branch: ["Branch", [["ambato", "Ambato"], ["quito", "Quito"], ["guayaquil", "Guayaquil"]]],
    division: ["Division", [["sales", "Sales"], ["service", "After-sales"], ["finance", "Finance"]]],
    role: ["Role", [["support", "Support"], ["supervisor", "Supervisor"], ["billing", "Billing"]]],
    submit: "Validate and register",
    success: "Access registered. The locker and exit are unlocked.",
    rapid: "Rapid-recharge emitter awarded.",
    basic: "Basic emitter awarded.",
    incomplete: "Complete these fields",
    result: "View project",
    feedback: {
      branch: "Check which branch Lucía will be working at.",
      division: "Check which team she’s joining.",
      role: "Choose the role that matches her workshop support duties."
    }
  }
};

export function setupMission(dialog, getLanguage, { onComplete, onFailed, onProject }) {
  const desktop = createDesktop(dialog, getLanguage);
  const get = (name) => dialog.querySelector("[data-mission=" + name + "]");
  const form = dialog.querySelector("#mission-form");
  const record = get("record");
  const result = get("result");
  let emitter = null;

  function render() {
    const copy = translations[getLanguage()];
    const complete = Boolean(emitter);
    for (const key of ["title", "label", "request", "note", "submit", "result", "ticket"]) get(key).textContent = copy[key];
    for (const label of dialog.querySelectorAll('[data-mission="users"]')) label.textContent = copy.users;
    get("panel").textContent = complete ? copy.savedPanel : copy.panel;
    get("status").textContent = complete ? copy.registered : copy.pending;
    dialog.dataset.complete = String(complete);
    get("feedback").textContent = complete ? `${copy.success} ${copy[emitter]}` : "";
    get("feedback").classList.toggle("success", complete);
    form.hidden = complete;
    result.hidden = !complete;
    record.hidden = !complete;
    record.replaceChildren();
    for (const key of fields) {
      const select = form.elements.namedItem(key);
      const value = select.value;
      get(key).textContent = copy[key][0];
      select.replaceChildren(new Option(copy.placeholder, ""), ...copy[key][1].map(([id, label]) => new Option(label, id)));
      select.value = value;
      select.removeAttribute("aria-invalid");
      if (complete) {
        const item = document.createElement("div");
        const term = document.createElement("dt");
        const savedValue = document.createElement("dd");
        term.textContent = copy[key][0];
        savedValue.textContent = copy[key][1].find(([id]) => id === solution[key])[1];
        item.append(term, savedValue);
        record.append(item);
      }
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (emitter) return;
    const copy = translations[getLanguage()];
    const missing = fields.filter(key => !form.elements.namedItem(key).value);
    const errors = missing.length ? missing : fields.filter(key => form.elements.namedItem(key).value !== solution[key]);
    for (const key of fields) {
      const select = form.elements.namedItem(key);
      if (errors.includes(key)) select.setAttribute("aria-invalid", "true");
      else select.removeAttribute("aria-invalid");
    }
    if (errors.length) {
      if (!missing.length) onFailed();
      get("feedback").textContent = missing.length ? `${copy.incomplete} · ${missing.map(key => copy[key][0]).join(", ")}` :
        errors.map(key => copy.feedback[key]).join(" ");
      form.elements.namedItem(errors[0]).focus();
      return;
    }
    emitter = onComplete();
    render();
    result.focus();
  });

  form.addEventListener("change", () => {
    for (const key of fields) form.elements.namedItem(key).removeAttribute("aria-invalid");
    get("feedback").textContent = "";
  });
  result.addEventListener("click", () => {
    dialog.close();
    onProject();
  });

  return {
    open(variant) {
      emitter = variant;
      render();
      desktop.open();
    }
  };
}
