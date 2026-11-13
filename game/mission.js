const fields = ["branch", "division", "role"];
const solution = { branch: "quito", division: "service", role: "support" };

const translations = {
  es: {
    title: "Primer día en la agencia",
    label: "TERMINAL · AMBACAR",
    request: "Lucía Torres se incorpora al equipo de posventa en Quito. Necesita un perfil de soporte para consultar y gestionar las solicitudes del taller.",
    note: "Simulación con datos ficticios.",
    placeholder: "Selecciona una opción",
    branch: ["Agencia", [["ambato", "Ambato"], ["quito", "Quito"], ["guayaquil", "Guayaquil"]]],
    division: ["División", [["sales", "Ventas"], ["service", "Posventa"], ["finance", "Finanzas"]]],
    role: ["Rol", [["support", "Soporte"], ["supervisor", "Supervisor"], ["billing", "Facturación"]]],
    submit: "Validar y registrar",
    success: "Acceso registrado. El letrero del taller ya está encendido.",
    result: "Mis prácticas en Ambacar",
    feedback: {
      branch: "Revisa la agencia donde trabajará Lucía.",
      division: "Revisa el equipo al que se incorpora.",
      role: "Elige el rol que corresponde a las tareas de soporte del taller."
    }
  },
  en: {
    title: "First day at the branch",
    label: "TERMINAL · AMBACAR",
    request: "Lucía Torres is joining the after-sales team in Quito. She needs a support profile to view and manage workshop requests.",
    note: "Simulation with fictional data.",
    placeholder: "Select an option",
    branch: ["Branch", [["ambato", "Ambato"], ["quito", "Quito"], ["guayaquil", "Guayaquil"]]],
    division: ["Division", [["sales", "Sales"], ["service", "After-sales"], ["finance", "Finance"]]],
    role: ["Role", [["support", "Support"], ["supervisor", "Supervisor"], ["billing", "Billing"]]],
    submit: "Validate and register",
    success: "Access registered. The workshop sign is now lit.",
    result: "My internship at Ambacar",
    feedback: {
      branch: "Check which branch Lucía will be working at.",
      division: "Check which team she’s joining.",
      role: "Choose the role that matches her workshop support duties."
    }
  }
};

export function setupMission(dialog, getLanguage, onComplete, onProject) {
  const get = (name) => dialog.querySelector("[data-mission=" + name + "]");
  const form = dialog.querySelector("#mission-form");
  const result = get("result");
  let complete = false;

  function render() {
    const copy = translations[getLanguage()];
    for (const key of ["title", "label", "request", "note", "submit", "result"]) get(key).textContent = copy[key];
    get("feedback").textContent = complete ? copy.success : "";
    get("feedback").classList.toggle("success", complete);
    form.hidden = complete;
    result.hidden = !complete;
    for (const key of fields) {
      const select = form.elements.namedItem(key);
      const value = select.value;
      get(key).textContent = copy[key][0];
      select.replaceChildren(new Option(copy.placeholder, ""), ...copy[key][1].map(([id, label]) => new Option(label, id)));
      select.value = value;
      select.removeAttribute("aria-invalid");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const copy = translations[getLanguage()];
    const errors = fields.filter((key) => form.elements.namedItem(key).value !== solution[key]);
    for (const key of fields) {
      const select = form.elements.namedItem(key);
      if (errors.includes(key)) select.setAttribute("aria-invalid", "true");
      else select.removeAttribute("aria-invalid");
    }
    if (errors.length) {
      get("feedback").textContent = errors.map((key) => copy.feedback[key]).join(" ");
      form.elements.namedItem(errors[0]).focus();
      return;
    }
    complete = true;
    onComplete();
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
    open(completed) {
      complete = completed;
      render();
      dialog.showModal();
    }
  };
}
