const STORAGE_KEY = "ema-budget-builder-v6";
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

const phaseOrder = ["Site Work & Foundation", "Framing", "MEP", "Finish Work"];

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
  projectName: "7 Jennifer Sub & Cost Planner",
  contractValue: 332350,
  hiddenColumns: [],
  expanded: {},
  rows: [
    row("Site Work & Foundation", "Foundation Dig", "Chris", 8000, 0, "Estimated", "Medium", "Based on Chris's 40k."),
    row("Site Work & Foundation", "Electric Trench", "Chris", 1000, 0, "Estimated", "Medium", "Based on Chris's 40k."),
    row("Site Work & Foundation", "Water Line Trench", "Chris", 1000, 0, "Estimated", "Medium", "Based on Chris's 40k."),
    row("Site Work & Foundation", "Septic", "Chris", 25000, 0, "Estimated", "Medium", "Based on Chris's 40k."),
    row("Site Work & Foundation", "Landscape", "Chris", 5000, 0, "Estimated", "Medium", "Based on Chris's 40k."),
    row("Site Work & Foundation", "Foundation Penetration", "Core Drill guy - Rich Bradley", 1000, 0, "Estimated", "Medium", "Based on 600 dollar price."),
    row("Site Work & Foundation", "Foundation", "Ourselves", 10000, 0, "Estimated", "Medium", "Basement cost is at 22.5k.", [
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
        item("Site Work & Foundation", "ICF straight walls", 66, "pieces", 75.77, "material"),
        item("Site Work & Foundation", "ICF Corners", 18, "pieces", 40.01, "material"),
        item("Site Work & Foundation", "Form Lock", 14, "sections", 15.02, "material", "10 foot lengths"),
        item("Site Work & Foundation", "Joint clips", 1, "box", 205, "material"),
        item("Site Work & Foundation", "Waterproof membrane", 4, "rolls", 243, "material", "1 roll covers 210 square feet"),
        item("Site Work & Foundation", "Spray foam cans", 3, "cans", 16.88, "material"),
        manual("Site Work & Foundation", "7% surcharge", 0, 501, "material"),
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
      manual("Site Work & Foundation", "Foundation material buffer", 0, 3249.72, "material", "Keeps basement detail tied to the sheet's $25,000 foundation material budget."),
    ]),
    row("Site Work & Foundation", "Lally Columns", "Ourselves", 0, 300, "Estimated", "Low", "Based on BFS Quote."),
    row("Site Work & Foundation", "Foundation Finish", "Ourselves", 1000, 0, "Estimated", "Medium", "Need to review this.", [
      item("Site Work & Foundation", "Metal Lathe", 16, "each", 17, "material"),
      item("Site Work & Foundation", "Cementhol", 15, "each", 30, "material"),
      item("Site Work & Foundation", "Concrete mixer", 1, "each", 249, "material"),
      item("Site Work & Foundation", "Mixer", 1, "each", 11, "material"),
      manual("Site Work & Foundation", "Foundation finish material buffer", 0, 18, "material"),
    ]),
    row("Site Work & Foundation", "Dumpster", "Rental", 0, 3000, "Estimated", "Low"),
    row("Site Work & Foundation", "Toilet", "Rental", 0, 1000, "Estimated", "Low"),

    row("Framing", "Framing", "BPI", 16530, 16100, "Quoted", "Low", "Based on BFS and BPI Quote."),
    row("Framing", "Decking and Railings", "Supplies", 0, 0, "Estimated", "Medium", "Need to confirm Home Depot pricing."),
    row("Framing", "Roofing", "BPI", 1380, 3500, "Quoted", "Low", "Based on BFS and BPI Quote."),
    row("Framing", "Siding", "BPI", 3980, 4000, "Quoted", "Low", "Based on BFS and BPI Quote."),
    row("Framing", "Gutters", "BPI?", 1000, 1000, "Placeholder", "Medium", "This is not included in BPI Quote."),
    row("Framing", "Windows (9)", "BPI", 0, 4000, "Estimated", "Medium", "Windows part of BPI Quote."),
    row("Framing", "Exterior Doors", "BPI", 0, 1000, "Estimated", "Low", "Doors part of BPI Quote - includes doors and hardware."),
    row("Framing", "Fasteners", "", 0, 1000, "Estimated", "Medium"),

    row("MEP", "Water Connection", "", 0, 0, "Placeholder", "High"),
    row("MEP", "Electrical Connection", "", 0, 0, "Placeholder", "High"),
    row("MEP", "Plumbing", "Scott", 15000, 4500, "Estimated", "Medium", "Need labor from Scott: 320 single vanity + mirror, 1.2k double vanity, 220 toilets, 1050 shower, 270 fan."),
    row("MEP", "Electrical", "Raven", 20000, 1000, "Estimated", "Medium", "Need price from Raven, 1k is misc."),
    row("MEP", "HVAC", "Scott?", 10000, 10000, "Placeholder", "Medium"),
    row("MEP", "ERV", "?", 1000, 1000, "Placeholder", "High"),

    row("Finish Work", "Insulation", "RDP Insulation", 7000, 0, "Quoted", "Low"),
    row("Finish Work", "Drywall", "Wesley", 6000, 1500, "Quoted", "Low"),
    row("Finish Work", "Flooring", "Wesley", 4000, 3600, "Estimated", "Medium"),
    row("Finish Work", "Interior Doors", "", 2000, 0, "Placeholder", "High"),
    row("Finish Work", "Finish Carpentry", "Wesley", 12000, 3000, "Estimated", "Medium"),
    row("Finish Work", "Kitchen", "Supplies", 0, 13210, "Estimated", "Medium", "5.2k cabinets, 3010 counters, 240 sink and faucet, appliances with range, 3.1k, 1.6k washer and dryer."),
    row("Finish Work", "Paint", "Wesley", 8000, 1000, "Estimated", "Medium"),
    row("Finish Work", "Punch List", "David & Yosef", 5000, 0, "Estimated", "Low"),
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
  if (!saved) return { ...deepCopy(starterState), rows: groupPhaseRows(starterState.rows) };
  try {
    return revive(JSON.parse(saved));
  } catch {
    return { ...deepCopy(starterState), rows: groupPhaseRows(starterState.rows) };
  }
}

function revive(nextState) {
  const starter = deepCopy(starterState);
  const rows = groupPhaseRows(normalizePhases(nextState.rows?.length ? nextState.rows : starter.rows));
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

function groupPhaseRows(rows) {
  const cleanRows = rows.filter((node) => node.phase !== "Preconstruction");
  const alreadyGrouped = cleanRows.length === phaseOrder.length && cleanRows.every((node) => phaseOrder.includes(node.phase) && node.scope === node.phase && node.children?.length);
  if (alreadyGrouped) return cleanRows;

  return phaseOrder.map((phase) =>
    row(
      phase,
      phase,
      "",
      0,
      0,
      "Estimated",
      "Low",
      "",
      cleanRows.filter((node) => node.phase === phase),
    ),
  );
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
    const open = state.expanded[node.id] ?? false;
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
