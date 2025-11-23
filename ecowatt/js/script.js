// =======================================================
// 1. ACTUALIZAR PRECIO SEGÚN LA REGIÓN
// =======================================================

const regionSelect = document.getElementById("options-region");
const priceInput = document.getElementById("priceKw");

regionSelect.addEventListener("change", () => {
  priceInput.value = regionSelect.value;
  actualizarTodosLosDispositivos();
});

// =======================================================
// 2. BARRA DE AHORRO
// =======================================================

const barra = document.getElementById("ahorro-bar");
const textoPorcentaje = document.getElementById("valor");

barra.addEventListener("input", () => {
  textoPorcentaje.textContent = barra.value;
  actualizarAhorroTotal();
});

// =======================================================
// 3. CALCULAR CONSUMO INDIVIDUAL
// =======================================================

function calcularConsumo(device) {
  const w = parseFloat(device.querySelector(".watt").value) || 0;
  const h = parseFloat(device.querySelector(".hours").value) || 0;
  const precio = parseFloat(priceInput.value) || 0;

  const kwh = (w * h) / 1000;
  const costo = kwh * precio;

  device.querySelector(".device-item-name-text").textContent = `${kwh.toFixed(
    2
  )} kWh/día — $${Math.round(costo)}/día`;

  return { kwh, costo };
}

// =======================================================
// 4. RECALCULAR TODOS LOS DISPOSITIVOS
// =======================================================

function actualizarTodosLosDispositivos() {
  let totalKwh = 0;
  let totalCosto = 0;

  document.querySelectorAll(".device-item").forEach((device) => {
    const { kwh, costo } = calcularConsumo(device);
    totalKwh += kwh;
    totalCosto += costo;
  });

  // Mostrar totales
  document.querySelector(".report-kw").textContent = totalKwh.toFixed(2);
  document.querySelector(".report-cost").textContent = `$${totalCosto.toFixed(0)}/día`;

  actualizarAhorroTotal();
}

// =======================================================
// 5. AHORRO ESTIMADO
// =======================================================

function actualizarAhorroTotal() {
  const porcentaje = parseFloat(barra.value);
  const totalCosto =
    parseFloat(document.querySelector(".report-kw").textContent) *
    (parseFloat(priceInput.value) || 0);

  const ahorro = totalCosto * (porcentaje / 100);

  document.querySelector(
    ".report-ahorro strong"
  ).textContent = `$${ahorro.toFixed(0)}/día`;
}

// =======================================================
// 6. DETECTAR CAMBIOS EN WATTS Y HORAS
// =======================================================

document.addEventListener("input", (e) => {
  if (
    e.target.classList.contains("watt") ||
    e.target.classList.contains("hours")
  ) {
    actualizarTodosLosDispositivos();
  }
});

// =======================================================
// 7. ELIMINAR EQUIPOS
// =======================================================

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("device-item-remove-btn")) {
    const device = e.target.closest(".device-item");
    device.remove();
    actualizarTodosLosDispositivos();
  }
});

// =======================================================
// 8. ACTUALIZAR AL CARGAR
// =======================================================

window.onload = actualizarTodosLosDispositivos;

// =======================================================
// 9. AÑADIR NUEVO EQUIPO (editable y arriba)
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
        value="Nuevo equipo"
        style="border:none; outline:none; font-size:1rem; width:150px;"
      />
      <p class="device-item-name-text">0.00 kWh/día — $0/día</p>
    </div>

    <div class="device-inputs">
      <input type="number" class="watt" value="0" placeholder="w" />
      <label>w</label>

      <input type="number" class="hours" value="1" />
      <label>hrs/dia</label>

      <div class="device-item-remove">
        <button class="device-item-remove-btn">&#x2573;</button>
      </div>
    </div>
  `;

  // Insertar ARRIBA (antes del primer equipo)
  const primerItem = contenedorEquipos.querySelector(".device-item");
  contenedorEquipos.insertBefore(nuevo, primerItem);

  actualizarTodosLosDispositivos();
}
