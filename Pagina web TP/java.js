const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const LS_KEY = "registro_cosas_v1";

const leer = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; }
  catch { return []; }
};
const escribir = datos => localStorage.setItem(LS_KEY, JSON.stringify(datos));

const form = $("#form");
const tbody = $("#tbody");
const contador = $("#contador");
const buscar = $("#buscar");
const fileCsv = $("#file-csv");

// ====== RENDER TABLA ======
function render(filtro = "") {
  const datos = leer();
  let lista = datos;

  if (filtro.trim() !== "") {
    const q = filtro.toLowerCase();
    lista = datos.filter(d =>
      (d.nombre||"").toLowerCase().includes(q) ||
      (d.categoria||"").toLowerCase().includes(q)
    );
  }

  tbody.innerHTML = "";

  if (lista.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty";
    td.textContent = "Sin resultados.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    lista.forEach((d, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHTML(d.nombre)}</td>
        <td>${escapeHTML(d.categoria || "")}</td>
        <td>${Number(d.cantidad ?? "").toString()}</td>
        <td>${d.fecha || ""}</td>
        <td>${escapeHTML(d.nota || "")}</td>
        <td>
          <button class="btn-secondary btn-editar" data-id="${d.id}">Editar</button>
          <button class="btn-danger btn-eliminar" data-id="${d.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  contador.textContent = `${lista.length} ${lista.length===1?"ítem":"ítems"}`;

  $$(".btn-editar").forEach(b => b.addEventListener("click", () => cargarEnFormulario(b.dataset.id)));
  $$(".btn-eliminar").forEach(b => b.addEventListener("click", () => eliminar(b.dataset.id)));
}

function escapeHTML(str) {
  return (str ?? "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

// ====== CRUD ======
form.addEventListener("submit", e => {
  e.preventDefault();
  const idxHidden = $("#idx").value;

  const item = {
    id: idxHidden || crypto.randomUUID(),
    nombre: $("#nombre").value.trim(),
    categoria: $("#categoria").value.trim(),
    cantidad: $("#cantidad").value === "" ? null : Number($("#cantidad").value),
    fecha: $("#fecha").value || "",
    nota: $("#nota").value.trim()
  };

  if (!item.nombre) {
    alert("El nombre es obligatorio.");
    $("#nombre").focus();
    return;
  }

  const datos = leer();

  if (idxHidden) {
    const pos = datos.findIndex(x => x.id === idxHidden);
    if (pos >= 0) datos[pos] = item;
  } else {
    datos.push(item);
  }

  escribir(datos);
  limpiarFormulario();
  render(buscar.value);
});

function cargarEnFormulario(id){
  const datos = leer();
  const item = datos.find(x => x.id === id);
  if (!item) return;
  $("#idx").value = item.id;
  $("#nombre").value = item.nombre || "";
  $("#categoria").value = item.categoria || "";
  $("#cantidad").value = item.cantidad ?? "";
  $("#fecha").value = item.fecha || "";
  $("#nota").value = item.nota || "";
  $("#btn-guardar").textContent = "Guardar cambios";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminar(id){
  if (!confirm("¿Eliminar este ítem?")) return;
  const datos = leer().filter(x => x.id !== id);
  escribir(datos);
  render(buscar.value);
}

function limpiarFormulario(){
  form.reset();
  $("#idx").value = "";
  $("#btn-guardar").textContent = "Guardar";
}
$("#btn-limpiar").addEventListener("click", limpiarFormulario);

// ====== BUSCAR ======
let buscarDebounce;
buscar.addEventListener("input", () => {
  clearTimeout(buscarDebounce);
  buscarDebounce = setTimeout(() => render(buscar.value), 200);
});

// ====== EXPORTAR CSV ======
$("#btn-exportar").addEventListener("click", () => {
  const datos = leer();
  const encabezados = ["id","nombre","categoria","cantidad","fecha","nota"];
  const filas = [encabezados.join(",")].concat(
    datos.map(d => encabezados.map(k => csvCell(d[k])).join(","))
  );
  const blob = new Blob([filas.join("\n")], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registro.csv";
  a.click();
  URL.revokeObjectURL(url);
});

function csvCell(val){
  if (val === null || val === undefined) val = "";
  val = String(val).replaceAll('"','""');
  return `"${val}"`;
}

// ====== IMPORTAR CSV ======
$("#btn-importar").addEventListener("click", ()=> fileCsv.click());
fileCsv.addEventListener("change", async () => {
  const file = fileCsv.files[0];
  if (!file) return;
  const text = await file.text();
  const rows = text.split(/\r?\n/).filter(Boolean);
  const headers = rows.shift().split(",").map(h=>h.replaceAll('"','').trim().toLowerCase());

  const required = ["id","nombre","categoria","cantidad","fecha","nota"];
  const ok = required.every(r => headers.includes(r));
  if (!ok) { alert("El CSV no tiene los encabezados esperados."); return; }

  const idxOf = h => headers.indexOf(h);
  const nuevos = rows.map(line => {
    const cols = parseCsvLine(line);
    return {
      id: cols[idxOf("id")] || crypto.randomUUID(),
      nombre: cols[idxOf("nombre")] || "",
      categoria: cols[idxOf("categoria")] || "",
      cantidad: cols[idxOf("cantidad")] ? Number(cols[idxOf("cantidad")]) : null,
      fecha: cols[idxOf("fecha")] || "",
      nota: cols[idxOf("nota")] || ""
    };
  });

  const actuales = leer();
  const mapa = new Map(actuales.map(x => [x.id, x]));
  nuevos.forEach(n => mapa.set(n.id, n));
  escribir(Array.from(mapa.values()));
  render(buscar.value);
  fileCsv.value = "";
  alert("Importación completada.");
});

function parseCsvLine(line){
  const out = []; let cur = ""; let quoted = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"' ){
      if (quoted && line[i+1] === '"'){ cur += '"'; i++; }
      else { quoted = !quoted; }
    } else if (ch === "," && !quoted){
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// ====== BORRAR TODO ======
$("#btn-borrar-todo").addEventListener("click", ()=>{
  if (confirm("¿Seguro que quieres borrar TODOS los ítems?")){
    localStorage.removeItem(LS_KEY);
    render(buscar.value);
  }
});

// ====== INICIO ======
(function init(){
  const hoy = new Date().toISOString().slice(0,10);
  $("#fecha").value = hoy;
  render();
})();
