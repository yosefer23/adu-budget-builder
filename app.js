const STORAGE_KEY = "ema-budget-builder-v3";
const TEMPLATE_KEY = "ema-budget-templates-v1";
const TARGET_MARGIN = 0.25;
const AUTH_KEY = "ema-budget-auth-v1";
const PASSWORD_HASH = "1f486ca655a0e21976283fa390b88097259ba393cd7cd6145c20cdd3986b97af";

const phaseMap = {
  Sitework: "Site Work & Foundation",
  Foundation: "Site Work & Foundation",
  Shell: "Framing",
  "MEP Rough-In": "MEP",
  Interior: "Finish Work",
  "General Conditions": "Site Work & Foundation",
};

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function deepCopy(value) {
  if (globalThis.structuredClone) return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

const columns = [
  { key: "scope", label: "Trade / Scope", required: true },
  { key: "phase", label: "Phase" },
  { key: "sub", label: "Sub / Vendor" },
  { key: "labor", label: "Labor" },
  { key: "material", label: "Material" },
  { key: "total", label: "Total", required: true },
  { key: "status", label: "Status" },
  { key: "risk", label: "Risk" },
  { key: "notes", label: "Notes" },
  { key: "actions", label: "Actions", required: true },
];

const statusBySub = {
  unknown: ["Placeholder", "High"],
  "?": ["Placeholder", "High"],
  "BPI?": ["Placeholder", "Medium"],
  "Scott?": ["Placeholder", "Medium"],
  Supplies: ["Estimated", "Medium"],
  rental: ["Estimated", "Low"],
};

const starterState = {
  projectName: "Cost Estimator_7 Jennifer",
  contractValue: 293920,
  hiddenColumns: [],
  expanded: {},
  rows: [
    row("Preconstruction", "Plan Design", "Yosef", 0, 0, "Quoted", "Low", "Source: Based on Quote. If we dont charge for our plans."),
    row("Preconstruction", "Plot Plan", "Surveyor", 0, 0, "Placeholder", "Medium", "Sheet lists $1,800, but marks this as not in quote. Quote based on cost of 111."),
    row("Preconstruction", "HERs Rating", "Hers rater", 0, 0, "Placeholder", "Medium", "Sheet lists $1,500, but marks this as not in quote. Quote based on cost of 111."),
    row("Preconstruction", "Permit Cost", "Town", 0, 0, "Placeholder", "Medium", "Sheet lists $3,000, but marks this as not in quote. This equals a percent of contract cost, will code later."),

    row("Site Work & Foundation", "Site Work", "Excavation Contractor", 8000, 0, "Estimated", "Medium", "Cost depends on site level and how much material needs to move away."),
    row("Site Work & Foundation", "Rough Plumbing", "Plumber", 0, 0, "Estimated", "Medium", "Included in plumbing. Cost should depend on square footage, but should be pretty consistent with washer/dryer, kitchen, and 1 bath."),
    row("Site Work & Foundation", "Septic Connection", "Excavation Contractor", 100, 0, "Estimated", "Medium", "Will depend on how far away the septic is and what angle it is."),
    row("Site Work & Foundation", "Electrical Utility Work", "Excavation Contractor", 1000, 0, "Estimated", "Medium", "Will depend on how far we have to trench and what system they have in the house."),
    row("Site Work & Foundation", "Water Utility Work", "Plumber", 1000, 0, "Estimated", "Medium", "Will depend on how far we have to trench and what system they have in the house."),
    row("Site Work & Foundation", "Basement", "Concrete guy", 1000, 0, "Quoted", "Low", "Will depend on the foundation type and how much concrete we need to use.", [
      group("Site Work & Foundation", "Footing", [
        item("Site Work & Foundation", "2x4x16ft form boards", 15, "board", 12.68, "material"),
        item("Site Work & Foundation", "Fastfoot membrane", 2, "100 foot rolls", 144.2, "material"),
        item("Site Work & Foundation", "Fastfoot membrane corners", 4, "corners", 12.84, "material"),
        item("Site Work & Foundation", "Rebar chairs", 45, "pieces", 1.2, "material"),
        item("Site Work & Foundation", "Rebar", 26, "20 foot sticks", 9.89, "material", "two horizontals"),
        item("Site Work & Foundation", "Line pump", 1, "per use", 750, "material"),
        item("Site Work & Foundation", "Concrete", 6, "yards", 200, "material", "124 CF"),
      ]),
      group("Site Work & Foundation", "Walls", [
        item("Site Work & Foundation", "ICF straight walls", 65, "pieces", 73.76, "material"),
        item("Site Work & Foundation", "ICF Corners", 22, "pieces", 36.9, "material"),
        item("Site Work & Foundation", "Form Lock", 22, "sections", 12.88, "material", "10 foot lengths"),
        item("Site Work & Foundation", "Joint clips", 1, "box", 199.41, "material"),
        item("Site Work & Foundation", "Waterproof membrane", 6, "rolls", 212.76, "material", "1 roll covers 210 square feet"),
        item("Site Work & Foundation", "Spray foam cans", 8, "cans", 16.88, "material"),
        item("Site Work & Foundation", "J bolts", 30, "bolts", 2.13, "material"),
        item("Site Work & Foundation", "Rebar", 58, "20 foot sticks", 9.89, "material", "16 for top and bottom horizontal, 15 for 60, 4.5 foot verticals"),
        manual("Site Work & Foundation", "Pump Truck", 0, 1000, "material"),
        item("Site Work & Foundation", "U Haul", 1, "20 foot truck rental", 350, "material"),
        item("Site Work & Foundation", "Concrete", 17, "yards", 200, "material", "571 cubic feet"),
      ]),
      group("Site Work & Foundation", "Slab", [
        item("Site Work & Foundation", "Gravel", 30, "cubic yards", 25, "material"),
        item("Site Work & Foundation", "Vapor barrier", 1, "roll", 173.9, "material", "10 ft by 100 ft 14 mil"),
        item("Site Work & Foundation", "Vapor barrier tape", 3, "rolls", 12.88, "material"),
        item("Site Work & Foundation", "Rebar mesh", 40, "sheets", 19.98, "material"),
        item("Site Work & Foundation", "Finishing Labor & pump", 1, "day", 2500, "material"),
        item("Site Work & Foundation", "Concrete", 12, "yards", 200, "material"),
      ]),
      manual("Site Work & Foundation", "Basement material buffer", 0, 1659.07, "material", "Keeps basement detail tied to the sheet's $25,000 basement budget."),
    ]),
    row("Site Work & Foundation", "Landscaping", "Landscaper", 2000, 2000, "Estimated", "Medium", "Will have a standard landscaping package."),
    row("Site Work & Foundation", "Dumpster", "Rental", 0, 2000, "Estimated", "Low"),
    row("Site Work & Foundation", "Toilet", "Rental", 0, 2000, "Estimated", "Low"),

    row("Framing", "Framing & Sheeting", "Framer", 19600, 13155.8, "Quoted", "Low", "Will depend on simplicity of build, square footage, amount of windows, and doors."),
    row("Framing", "Roofing", "Roofer", 5000, 5218.04, "Quoted", "Low", "This should be square footage of roof; trusses and plywood are in framing."),
    row("Framing", "Siding", "Roofer", 5000, 7780, "Quoted", "Low", "Depends on square footage of walls and type of siding."),
    row("Framing", "Doors", "Framer", 2000, 4000, "Quoted", "Low", "Depends on amount of exterior and interior doors."),
    row("Framing", "Windows", "Framer", 3000, 6000, "Quoted", "Low", "Depends on amount of windows and size."),

    row("MEP", "Plumbing", "Plumber", 15000, 0, "Quoted", "Low", "Material included in kitchen. Cost should depend on square footage, but should be pretty consistent with washer/dryer, kitchen, and 1 bath."),
    row("MEP", "Electrical", "Electrician", 20000, 0, "Quoted", "Low", "Cost should depend on square footage but should not vary much; would also include smaller electric heater installs."),
    row("MEP", "HVAC", "HVAC", 5000, 5000, "Quoted", "Low", "Pretty simple install cost for 1 or 2 minisplits."),

    row("Finish Work", "Insulation", "Spray foam guy", 5600, 0, "Quoted", "Low", "Included in quote. SF calc."),
    row("Finish Work", "Drywall", "Drywaller", 5000, 1685.92, "Quoted", "Low", "SF calc."),
    row("Finish Work", "Bathroom Finish", "Plumber", 6000, 6390, "Quoted", "Low", "See plumber."),
    row("Finish Work", "Paint", "Painter", 10000, 840, "Quoted", "Low", "Included in wall."),
    row("Finish Work", "Kitchen", "Carpenter", 5000, 9950, "Quoted", "Low", "Includes more than just kitchen."),
    row("Finish Work", "Flooring", "Floor guy", 10000, 3600, "Quoted", "Low", "SF calc."),
    row("Finish Work", "Trim", "Trim guy", 4000, 2000, "Estimated", "Medium"),
    row("Finish Work", "Punch List", "David & Yosef", 5000, 0, "Quoted", "Low"),
  ],
};

let state = loadState();
let activeId = null;

const els = {
  gate: document.getElementById("passwordGate"),
  passwordForm: document.getElementById("passwordForm"),
  passwordInput: document.getElementById("passwordInput"),
  passwordError: document.getElementById("passwordError"),
  rows: document.getElementById("budgetRows"),
  header: document.getElementById("tableHeader"),
  toggles: document.getElementById("columnToggles"),
  contractValue: document.getElementById("contractValue"),
  projectName: document.getElementById("projectName"),
  totalCost: document.getElementById("totalCost"),
  profit: document.getElementById("profit"),
  margin: document.getElementById("margin"),
  targetGap: document.getElementById("targetGap"),
  viewFilter: document.getElementById("viewFilter"),
  dialog: document.getElementById("editorDialog"),
  form: document.getElementById("editorForm"),
};

document.body.classList.toggle("is-locked", sessionStorage.getItem(AUTH_KEY) !== "ok");

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlockBudget() {
  sessionStorage.setItem(AUTH_KEY, "ok");
  document.body.classList.remove("is-locked");
  els.gate.classList.add("is-unlocked");
}

async function checkPassword(event) {
  event.preventDefault();
  const hash = await sha256(els.passwordInput.value);
  if (hash === PASSWORD_HASH) {
    unlockBudget();
    els.passwordInput.value = "";
    return;
  }
  els.passwordError.hidden = false;
  els.passwordInput.select();
}

function row(phase, scope, sub, labor = 0, material = 0, status = "Estimated", risk = "Low", notes = "", children = []) {
  const [fallbackStatus, fallbackRisk] = statusBySub[sub] || [];
  return {
    id: uid(),
    phase,
    scope,
    sub,
    labor,
    material,
    status: fallbackStatus || status,
    risk: fallbackRisk || risk,
    notes,
    costType: "split",
    qty: null,
    unit: "",
    unitCost: null,
    children,
  };
}

function group(phase, scope, children = []) {
  return row(phase, scope, "", 0, 0, "Estimated", "Low", "", children);
}

function item(phase, scope, qty, unit, unitCost, costType, notes = "") {
  return {
    id: uid(),
    phase,
    scope,
    sub: "",
    labor: 0,
    material: 0,
    status: "Estimated",
    risk: "Low",
    notes,
    costType,
    qty,
    unit,
    unitCost,
    children: [],
  };
}

function manual(phase, scope, labor, material, costType = "split", notes = "") {
  return {
    id: uid(),
    phase,
    scope,
    sub: "",
    labor,
    material,
    status: "Estimated",
    risk: "Low",
    notes,
    costType,
    qty: null,
    unit: "",
    unitCost: null,
    children: [],
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return deepCopy(starterState);
  try {
    return revive(JSON.parse(saved));
  } catch {
    return deepCopy(starterState);
  }
}

function revive(nextState) {
  const starter = deepCopy(starterState);
  const rows = ensurePreconstructionRows(normalizePhases(nextState.rows?.length ? nextState.rows : starter.rows));
  return {
    ...starter,
    ...nextState,
    rows,
    hiddenColumns: nextState.hiddenColumns || [],
    expanded: nextState.expanded || {},
  };
}

function normalizePhases(rows) {
  return rows.map((node) => ({
    ...node,
    phase: phaseMap[node.phase] || node.phase,
    children: normalizePhases(node.children || []),
  }));
}

function ensurePreconstructionRows(rows) {
  if (rows.some((node) => node.phase === "Preconstruction")) return rows;
  return [
    row("Preconstruction", "Design / Engineering", "", 0, 0, "Placeholder", "High", "Add design, engineering, survey, and permitting costs here."),
    row("Preconstruction", "Permits and Fees", "", 0, 0, "Placeholder", "High", "Track town, utility, and application fees here."),
    ...rows,
  ];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.abs(value) % 1 ? 2 : 0,
  }).format(value || 0);
}

function percent(value) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function calculate(node) {
  if (node.children?.length) {
    const childTotals = node.children.map(calculate);
    const childLabor = childTotals.reduce((sum, itemTotal) => sum + itemTotal.labor, 0);
    const childMaterial = childTotals.reduce((sum, itemTotal) => sum + itemTotal.material, 0);
    return {
      labor: Number(node.labor || 0) + childLabor,
      material: Number(node.material || 0) + childMaterial,
    };
  }

  if (node.qty !== null && node.qty !== "" && node.unitCost !== null && node.unitCost !== "") {
    const lineTotal = Number(node.qty || 0) * Number(node.unitCost || 0);
    if (node.costType === "labor") return { labor: lineTotal, material: 0 };
    if (node.costType === "material") return { labor: 0, material: lineTotal };
  }

  return {
    labor: Number(node.labor || 0),
    material: Number(node.material || 0),
  };
}

function flatten(rows, depth = 0, parentOpen = true, list = []) {
  rows.forEach((node, index) => {
    const hasChildren = Boolean(node.children?.length);
    const open = state.expanded[node.id] ?? depth < 1;
    list.push({ node, depth, hasChildren, open, visible: parentOpen, index });
    if (hasChildren) {
      flatten(node.children, depth + 1, parentOpen && open, list);
    }
  });
  return list;
}

function findNode(id, rows = state.rows, parent = null) {
  for (const node of rows) {
    if (node.id === id) return { node, parent, siblings: rows };
    const found = findNode(id, node.children || [], node);
    if (found) return found;
  }
  return null;
}

function filterAllows(node, totals) {
  const mode = els.viewFilter.value;
  if (mode === "all") return true;
  if (mode === "risk") return node.risk === "High" || node.status === "Placeholder";
  if (mode === "quoted") return ["Quoted", "Selected", "Locked", "Ordered"].includes(node.status);
  if (mode === "materials") return totals.material > 0;
  if (mode === "labor") return totals.labor > 0;
  return true;
}

function render() {
  saveState();
  renderHeader();
  renderToggles();
  renderRows();
  renderSummary();
  els.contractValue.value = state.contractValue;
  els.projectName.value = state.projectName;
}

function renderHeader() {
  els.header.innerHTML = "";
  columns.forEach((column) => {
    const div = document.createElement("div");
    div.textContent = column.label;
    div.dataset.col = column.key;
    if (state.hiddenColumns.includes(column.key)) div.classList.add("is-hidden-col");
    els.header.append(div);
  });
}

function renderToggles() {
  els.toggles.innerHTML = "";
  columns
    .filter((column) => !column.required)
    .forEach((column) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !state.hiddenColumns.includes(column.key);
      checkbox.addEventListener("change", () => {
        state.hiddenColumns = checkbox.checked
          ? state.hiddenColumns.filter((key) => key !== column.key)
          : [...state.hiddenColumns, column.key];
        render();
      });
      label.append(checkbox, column.label);
      els.toggles.append(label);
    });
}

function renderRows() {
  els.rows.innerHTML = "";
  let lastPhase = "";
  flatten(state.rows).forEach(({ node, depth, hasChildren, open, visible }) => {
    const totals = calculate(node);
    const total = totals.labor + totals.material;
    const show = visible && filterAllows(node, totals);
    const rowEl = document.createElement("div");
    rowEl.className = `budget-row ${hasChildren ? "group" : ""} ${lastPhase !== node.phase && depth === 0 ? "phase-start" : ""}`;
    if (!show) rowEl.classList.add("hidden");
    rowEl.dataset.id = node.id;
    if (depth === 0) lastPhase = node.phase;

    rowEl.append(
      cell("scope", scopeContent(node, depth, hasChildren, open)),
      cell("phase", node.phase),
      cell("sub", node.sub),
      cell("labor money", money(totals.labor)),
      cell("material money", money(totals.material)),
      cell("total money", money(total)),
      cell("status", statusPill(node.status)),
      cell("risk", riskText(node.risk)),
      cell("notes", detailNote(node)),
      cell("actions", actions(node)),
    );
    els.rows.append(rowEl);
  });
}

function cell(keyAndClass, content) {
  const [key, ...classes] = keyAndClass.split(" ");
  const div = document.createElement("div");
  div.className = ["cell", ...classes].join(" ");
  div.dataset.col = key;
  div.dataset.label = columns.find((column) => column.key === key)?.label || "";
  if (state.hiddenColumns.includes(key)) div.classList.add("is-hidden-col");
  if (typeof content === "string") div.textContent = content;
  else div.append(content);
  return div;
}

function scopeContent(node, depth, hasChildren, open) {
  const wrap = document.createElement("div");
  wrap.className = "scope-cell";

  const indent = document.createElement("span");
  indent.className = "indent";
  indent.style.setProperty("--indent", `${depth * 22}px`);

  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.className = `chevron ${hasChildren ? "" : "empty"}`;
  chevron.textContent = open ? "−" : "+";
  chevron.title = open ? "Collapse row" : "Expand row";
  chevron.addEventListener("click", (event) => {
    event.stopPropagation();
    state.expanded[node.id] = !open;
    render();
  });

  const label = document.createElement("span");
  label.className = "row-title";
  const strong = document.createElement("strong");
  strong.textContent = node.scope;
  label.append(strong);
  if (node.qty !== null && node.qty !== "") {
    const small = document.createElement("small");
    small.textContent = `${node.qty} ${node.unit || ""} × ${money(node.unitCost)}`.trim();
    label.append(small);
  }

  wrap.append(indent, chevron, label);
  return wrap;
}

function statusPill(status) {
  const span = document.createElement("span");
  span.className = `status ${status}`;
  span.textContent = status || "Estimated";
  return span;
}

function riskText(risk) {
  const span = document.createElement("span");
  span.className = `risk ${risk}`;
  span.textContent = risk || "Low";
  return span;
}

function detailNote(node) {
  const parts = [];
  if (node.children?.length) parts.push(`${node.children.length} detail ${node.children.length === 1 ? "line" : "lines"}`);
  if (node.notes) parts.push(node.notes);
  return parts.join(" · ");
}

function actions(node) {
  const wrap = document.createElement("div");
  wrap.className = "actions";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "✎";
  edit.title = "Edit row";
  edit.addEventListener("click", () => openEditor(node.id));
  const add = document.createElement("button");
  add.type = "button";
  add.textContent = "+";
  add.title = "Add detail under this row";
  add.addEventListener("click", () => addChild(node.id, "item"));
  wrap.append(edit, add);
  return wrap;
}

function renderSummary() {
  const totals = state.rows.map(calculate).reduce(
    (sum, itemTotal) => ({
      labor: sum.labor + itemTotal.labor,
      material: sum.material + itemTotal.material,
    }),
    { labor: 0, material: 0 },
  );
  const total = totals.labor + totals.material;
  const contract = Number(state.contractValue || 0);
  const profit = contract - total;
  const margin = contract ? profit / contract : 0;
  const targetProfit = contract * TARGET_MARGIN;
  const targetGap = profit - targetProfit;

  els.totalCost.textContent = money(total);
  els.profit.textContent = money(profit);
  els.margin.textContent = percent(margin);
  els.targetGap.textContent = money(targetGap);
  els.targetGap.style.color = targetGap >= 0 ? "var(--accent)" : "var(--danger)";
  els.margin.style.color = margin >= TARGET_MARGIN ? "var(--accent)" : "var(--danger)";
}

function openEditor(id) {
  activeId = id;
  const found = findNode(id);
  if (!found) return;
  const { node } = found;
  const form = els.form;
  form.phase.value = node.phase || "";
  form.scope.value = node.scope || "";
  form.sub.value = node.sub || "";
  form.status.value = node.status || "Estimated";
  form.risk.value = node.risk || "Low";
  form.costType.value = node.costType || "split";
  form.qty.value = node.qty ?? "";
  form.unit.value = node.unit || "";
  form.unitCost.value = node.unitCost ?? "";
  form.labor.value = node.labor || "";
  form.material.value = node.material || "";
  form.notes.value = node.notes || "";
  document.getElementById("editorTitle").textContent = `Edit ${node.scope}`;
  els.dialog.showModal();
}

function saveEditor(event) {
  event.preventDefault();
  const found = findNode(activeId);
  if (!found) return;
  const { node } = found;
  const data = new FormData(els.form);
  node.phase = data.get("phase").trim();
  node.scope = data.get("scope").trim();
  node.sub = data.get("sub").trim();
  node.status = data.get("status");
  node.risk = data.get("risk");
  node.costType = data.get("costType");
  node.qty = data.get("qty") === "" ? null : Number(data.get("qty"));
  node.unit = data.get("unit").trim();
  node.unitCost = data.get("unitCost") === "" ? null : Number(data.get("unitCost"));
  node.labor = Number(data.get("labor") || 0);
  node.material = Number(data.get("material") || 0);
  node.notes = data.get("notes").trim();
  els.dialog.close();
  render();
}

function addChild(parentId, kind) {
  const found = findNode(parentId);
  if (!found) return;
  const { node } = found;
  const child =
    kind === "group"
      ? group(node.phase, "New detail group", [])
      : {
          id: uid(),
          phase: node.phase,
          scope: "New item",
          sub: "",
          labor: 0,
          material: 0,
          status: "Estimated",
          risk: "Low",
          notes: "",
          costType: "material",
          qty: 1,
          unit: "each",
          unitCost: 0,
          children: [],
        };
  node.children = node.children || [];
  node.children.push(child);
  state.expanded[node.id] = true;
  render();
  openEditor(child.id);
}

function deleteActive() {
  const found = findNode(activeId);
  if (!found) return;
  if (!confirm("Delete this row and any detail under it?")) return;
  const index = found.siblings.findIndex((node) => node.id === activeId);
  found.siblings.splice(index, 1);
  els.dialog.close();
  render();
}

function setAllExpanded(value) {
  flatten(state.rows).forEach(({ node, hasChildren }) => {
    if (hasChildren) state.expanded[node.id] = value;
  });
  render();
}

function copyBudget() {
  const stamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  state = {
    ...deepCopy(state),
    projectName: `${state.projectName} Copy ${stamp}`,
    expanded: {},
  };
  state.rows = assignNewIds(state.rows);
  render();
}

function assignNewIds(rows) {
  return rows.map((node) => ({
    ...node,
    id: uid(),
    children: assignNewIds(node.children || []),
  }));
}

function saveTemplate() {
  const templates = JSON.parse(localStorage.getItem(TEMPLATE_KEY) || "[]");
  templates.push({
    id: uid(),
    name: state.projectName,
    savedAt: new Date().toISOString(),
    rows: state.rows,
  });
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
  alert("Template saved in this browser.");
}

function resetDemo() {
  if (!confirm("Reset this browser back to the starter ADU budget?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = deepCopy(starterState);
  render();
}

els.contractValue.addEventListener("input", () => {
  state.contractValue = Number(els.contractValue.value || 0);
  renderSummary();
  saveState();
});

els.projectName.addEventListener("input", () => {
  state.projectName = els.projectName.value;
  saveState();
});

els.viewFilter.addEventListener("change", render);
els.form.addEventListener("submit", saveEditor);
document.getElementById("closeDialog").addEventListener("click", () => els.dialog.close());
document.getElementById("cancelEdit").addEventListener("click", () => els.dialog.close());
document.getElementById("deleteRow").addEventListener("click", deleteActive);
document.getElementById("addGroup").addEventListener("click", () => addChild(activeId, "group"));
document.getElementById("addItem").addEventListener("click", () => addChild(activeId, "item"));
document.getElementById("expandAll").addEventListener("click", () => setAllExpanded(true));
document.getElementById("collapseAll").addEventListener("click", () => setAllExpanded(false));
document.getElementById("copyBudget").addEventListener("click", copyBudget);
document.getElementById("saveTemplate").addEventListener("click", saveTemplate);
document.getElementById("resetDemo").addEventListener("click", resetDemo);
els.passwordForm.addEventListener("submit", checkPassword);
if (sessionStorage.getItem(AUTH_KEY) === "ok") unlockBudget();

render();
