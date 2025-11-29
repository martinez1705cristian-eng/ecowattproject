// =======================================================
// 1. ACTUALIZAR PRECIO SEGÚN LA REGIÓN
// =======================================================

const regionSelect = document.getElementById("options-region");
const priceInput = document.getElementById("priceKw");

regionSelect.addEventListener("change", () => {
  priceInput.value = regionSelect.value;
  actualizarTodosLosDispositivos();
});

priceInput.addEventListener("change", () =>{
  actualizarTodosLosDispositivos();
});

// =======================================================
// 2. CALCULAR CONSUMO INDIVIDUAL (CON QTY + MENSUAL)
// =======================================================

function calcularConsumo(device) {
  const qty = parseFloat(device.querySelector(".qty")?.value) || 1;
  const w = parseFloat(device.querySelector(".watt").value) || 0;
  const h = parseFloat(device.querySelector(".hours").value) || 0;
  const precio = parseFloat(priceInput.value) || 0;

  // CALCULO NUEVO: Watts × Horas × Cantidad
  const kwh = (w * h * qty) / 1000;
  const costo = kwh * precio;
  const costoMensual = costo * 30;

  device.querySelector(".device-item-name-text").textContent = `${kwh.toFixed(
    2
  )} kWh -- $ ${Math.round(costo).toLocaleString("es-CO")} /día`;

  return { kwh, costo };
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("device-item-name-title")) {
    const maxLength = 20;
    if (e.target.value.length > maxLength) {
      e.target.value = e.target.value.substring(0, maxLength);
    }
  }
});
// =======================================================
// 4. RECALCULAR TODOS LOS DISPOSITIVOS (CON TOTAL MENSUAL)
// =======================================================

function actualizarTodosLosDispositivos() {
  let totalKwh = 0;
  let totalCosto = 0;
  let totalCostoMensual = 0;

  document.querySelectorAll(".device-item").forEach((device) => {
    const { kwh, costo } = calcularConsumo(device);
    totalKwh += kwh;
    totalCosto += costo;
    totalCostoMensual += costo * 30;
  });

  document.querySelector(".report-kw").textContent = totalKwh.toFixed(2);
  document.querySelector(
    ".report-cost"
  ).textContent = `$ ${totalCosto.toLocaleString("es-CO")} COP`;
  document.querySelector(
    ".report-month"
  ).textContent = `$ ${totalCostoMensual.toLocaleString("es-CO")} COP`;
}

// =======================================================
// 6. DETECTAR CAMBIOS EN WATTS, HORAS Y QTY
// =======================================================
document.addEventListener("input", (e) => {
  const device = e.target.closest(".device-item"); // el device correspondiente

  if (
    e.target.classList.contains("watt") ||
    e.target.classList.contains("hours") ||
    e.target.classList.contains("qty")
  ) {
    let val = parseFloat(e.target.value);

    // Si no es número, poner 0 por defecto
    if (isNaN(val)) val = 0;

    // === Validar watts ===
    if (e.target.classList.contains("watt")) {
      const maxWatts = 3500; // puedes cambiar según el dispositivo
      if (val < 0) val = 0;
      if (val > maxWatts) val = maxWatts;
    }

    // === Validar horas ===
    if (e.target.classList.contains("hours")) {
      if (val < 0) val = 0;
      if (val > 24) val = 24;
    }

    // === Validar cantidad (qty) ===
    if (e.target.classList.contains("qty")) {
      if (val < 1) val = 1;
      if (val > 10) val = 10;
    }

    // Actualizar el input con el valor corregido
    e.target.value = val;

    // === Actualizar cálculo y reportes ===
    actualizarTodosLosDispositivos();
    actualizarReporteCO2();
  }
});

// =======================================================
// 7. ELIMINAR EQUIPOS
// =======================================================

// Modal
const modal = document.getElementById("modal-info");
const modalClose = document.getElementById("modal-close");
const modalEdit = document.getElementById("modal-edit");

let currentDevice = null; // para guardar el device que intentó eliminar

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("device-item-remove-btn")) {
    const devices = document.querySelectorAll(".device-item");

    currentDevice = e.target.closest(".device-item"); // guardamos el device

    if (devices.length <= 3) {
      // Mostrar modal
      modal.style.display = "flex";
      return; // no eliminar
    }

    // Si hay más de 3, eliminar
    currentDevice.remove();
    actualizarTodosLosDispositivos();
    actualizarReporteCO2();
  }
});

// Cerrar modal
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
  currentDevice = null;
});

// Botón Editar nombre
modalEdit.addEventListener("click", () => {
  if (currentDevice) {
    const inputNombre = currentDevice.querySelector(".device-item-name-title");
    inputNombre.focus();
    inputNombre.setSelectionRange(0, inputNombre.value.length);
  }
  modal.style.display = "none";
});

// =======================================================
// 8. AÑADIR NUEVO EQUIPO (editable y arriba)
// =======================================================

const btnAgregar = document.getElementById("add-device");
const contenedorEquipos = document.querySelector(".devices");

btnAgregar.addEventListener("click", () => {
  agregarEquipo();
});

function agregarEquipo() {
  const nuevo = document.createElement("div");
  nuevo.classList.add("device-item");

  nuevo.innerHTML = `
    <div class="device-item-name">
      <input 
        type="text"
        class="device-item-name-title"
        value=""
        placeholder="Nuevo equipo"
        style="width:150px;"
      />
      <p class="device-item-name-text">0.00 kWh/día — $0/día — $0/mes</p>
    </div>

    <div class="device-inputs">
      <input type="number" class="qty" value="1" min="1" max="10" />
      <label>und</label>

      <input type="number" class="watt" value="0" placeholder="w" />
      <label>w</label>

      <input type="number" class="hours" value="1" min="1" max="24"/>
      <label>hrs/dia</label>

      <div class="device-item-remove">
        <button class="device-item-remove-btn">&#x2573;</button>
      </div>
    </div>
  `;

  const primerItem = contenedorEquipos.querySelector(".device-item");
  contenedorEquipos.insertBefore(nuevo, primerItem);

  const inputNombre = nuevo.querySelector(".device-item-name-title");

  // Poner el cursor en el input
  inputNombre.focus();
  inputNombre.setSelectionRange(0, 0);

  // Crear tooltip
  const tooltip = document.createElement("span");
  tooltip.classList.add("device-tooltip");
  tooltip.textContent = "Escribe el nombre del equipo";
  inputNombre.parentElement.appendChild(tooltip);

  // Listener específico para este input
  inputNombre.addEventListener("input", () => {
    // Limitar longitud a 20 caracteres
    if (inputNombre.value.length > 20) {
      inputNombre.value = inputNombre.value.substring(0, 20);
    }

    // Ocultar tooltip al escribir
    tooltip.classList.add("hide");

    // Actualizar listado de CO2 en tiempo real
    actualizarListadoCO2();
  });

  // También ocultar tooltip al perder foco
  inputNombre.addEventListener("blur", () => tooltip.classList.add("hide"));

  // Actualizar consumo y listado de CO2
  actualizarTodosLosDispositivos();
  actualizarReporteCO2();
  actualizarListadoCO2();
}
 
// === CALCULO DE CO2 POR DEVICE ===
function calcularCO2Device(device) {
  const qty = parseFloat(device.querySelector(".qty").value) || 1;
  const watts = parseFloat(device.querySelector(".watt").value) || 0;
  const hours = parseFloat(device.querySelector(".hours").value) || 0;

  const kwhDiario = (watts * hours * qty) / 1000;
  const kwhMensual = kwhDiario * 30;
  const co2Mensual = kwhMensual * 0.17; // kg CO2 / kWh

  return { kwhDiario, kwhMensual, co2Mensual };
}

// === TOTAL DE CO2 ===
function calcularTotalCO2() {
  const devices = document.querySelectorAll(".device-item");
  let totalCO2 = 0;

  devices.forEach((device) => {
    const { co2Mensual } = calcularCO2Device(device);
    totalCO2 += co2Mensual;
  });

  return totalCO2;
}

// === LISTADO DETALLADO DE CADA DEVICE ===
function actualizarListadoCO2() {
  const chartList = document.getElementById("chart-list");
  chartList.innerHTML = ""; // Limpiar lista

  //  Crear array con info de cada device
  const devicesArray = Array.from(
    document.querySelectorAll(".device-item")
  ).map((device) => {
    const nombre =
      device.querySelector(".device-item-name-title").value || "Sin nombre";
    const { co2Mensual, kwhMensual } = calcularCO2Device(device);
    return { device, nombre, co2Mensual, kwhMensual };
  });

  if (devicesArray.length === 0) return;

  // Ordenar de mayor a menor CO2
  devicesArray.sort((a, b) => b.co2Mensual - a.co2Mensual);

  const co2Max = devicesArray[0].co2Mensual; // Para calcular proporción y color

  //  Crear cada item con color según nivel
  devicesArray.forEach((itemData) => {
    const { nombre, co2Mensual, kwhMensual } = itemData;

    const chartItem = document.createElement("div");
    chartItem.classList.add("chart-item");

    // Color según proporción de CO2 respecto al máximo
    const ratio = co2Mensual / co2Max;
    let bgColor, textColor;

    if (co2Mensual > 20) {
      // alto CO2
      bgColor = "#f44336"; // rojo
      textColor = "#fff";
    } else if (co2Mensual > 10) {
      // medio CO2
      bgColor = "#ffeb3b"; // amarillo
      textColor = "#333";
    } else {
      // bajo CO2
      bgColor = "#4caf50"; // verde
      textColor = "#fff";
    }

    chartItem.style.backgroundColor = bgColor;
    chartItem.style.color = textColor;

    // Contenido del item
    chartItem.innerHTML = `
      <strong>${nombre}</strong><br>
      ${kwhMensual.toFixed(2)} kWh / mes — ${co2Mensual.toFixed(2)} kg CO₂ / mes
    `;

    chartList.appendChild(chartItem);
  });
}

// === ACTUALIZAR REPORTE CO2 COMPLETO ===
function actualizarReporteCO2() {
  const totalCO2 = calcularTotalCO2();
  document.getElementById("chart-co2-total").textContent = `${totalCO2.toFixed(
    2
  )} kg / mes`;

  // Listado de cada device
  actualizarListadoCO2();
}

// =======================================================
// 9. Actualizar todo
// =======================================================

window.addEventListener("load", () => {
  actualizarTodosLosDispositivos();
  actualizarReporteCO2();
  actualizarListadoCO2();
});
