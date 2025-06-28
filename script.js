const API = "https://tiendamattstore.onrender.com/api";

// LOGIN
async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem("usuario", usuario);
      window.location.href = "panel.html";
    } else {
      document.getElementById("error").innerText = data.message;
    }
  } catch (err) {
    document.getElementById("error").innerText = "Error de conexión";
  }
}

// MOSTRAR SECCIONES DEL PANEL
async function mostrar(seccion) {
  const div = document.getElementById("seccion");
  div.innerHTML = `<h2>${seccion.toUpperCase()}</h2><p>Cargando datos...</p>`;

  const url = `${API}/${seccion}`;
  const res = await fetch(url);
  const datos = await res.json();

  div.innerHTML = `
    <button onclick="abrirFormulario('${seccion}')">➕ Agregar</button>
    <input type="text" placeholder="Buscar..." oninput="buscar('${seccion}', this.value)">
    <ul id="lista-${seccion}">
      ${datos.map(item => `<li>${JSON.stringify(item)}</li>`).join('')}
    </ul>
  `;
}

function abrirFormulario(tipo) {
  alert("Aquí irá un formulario emergente para agregar a " + tipo);
}

function buscar(tipo, texto) {
  const lista = document.getElementById(`lista-${tipo}`);
  for (let item of lista.children) {
    item.style.display = item.innerText.toLowerCase().includes(texto.toLowerCase()) ? "" : "none";
  }
}
