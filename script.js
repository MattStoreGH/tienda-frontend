const API = "https://tiendamattstore.onrender.com/api";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dw1ho2ljn/image/upload";
const CLOUDINARY_PRESET = "ml_default";

async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, password }),
  });

  const data = await res.json();

  if (res.ok) {
    sessionStorage.setItem("usuario", usuario);
    window.location.href = "panel.html";
  } else {
    document.getElementById("error").innerText = data.mensaje || "Credenciales incorrectas";
  }
}

async function mostrar(seccion) {
  const div = document.getElementById("seccion");
  div.innerHTML = `<h2>${seccion.toUpperCase()}</h2><p>Cargando datos...</p>`;

  const res = await fetch(`${API}/${seccion}`);
  const datos = await res.json();

  div.innerHTML = `
    <button onclick="abrirFormulario('${seccion}')">➕ Agregar</button>
    <input type="text" placeholder="Buscar..." oninput="buscar('${seccion}', this.value)">
<ul id="lista-${seccion}">
  ${datos.map(item => {
    let contenido = "";

    if (seccion === "productos") {
      contenido = `
        <strong>${item.nombre}</strong><br>
        ID: ${item.id}<br>
        Precio: S/.${item.precio}<br>
        Popularidad: ${item.popularidad}
      `;
    } else if (seccion === "clientes") {
      contenido = `
        <strong>Cliente ${item.numero || item.numero_cliente}</strong><br>
        Producto: ${item.compra || item.producto}<br>
        ID Producto: ${item.id || item.id_producto}<br>
        Monto: S/.${item.monto}
      `;
    } else if (seccion === "pagos") {
      contenido = `
        <strong>Pago</strong><br>
        Producto: ${item.producto}<br>
        ID: ${item.id || item.id_producto}<br>
        Monto: S/.${item.monto}<br>
        <img src="${item.imagen || item.imagen_url}" width="100">
      `;
    }

    return `
      <li>
        ${contenido}
        <br>
        <button onclick="editarItem('${seccion}', ${JSON.stringify(item)})">✏️ Editar</button>
        <button onclick="eliminarItem('${seccion}', '${item.id || item.numero || item.id_producto}')">🗑️ Eliminar</button>
      </li>
    `;
  }).join("")}
</ul>
  `;
}

function abrirFormulario(tipo) {
  const body = document.getElementById("modal-body");

  let formHtml = "";

  if (tipo === "productos") {
    formHtml = `
      <h3>Agregar producto</h3>
      <input placeholder="ID del producto" id="id">
      <input placeholder="Nombre" id="nombre">
      <input placeholder="Precio" type="number" id="precio">
      <input placeholder="Popularidad (1-5)" type="number" id="popularidad">
      <button onclick="enviarFormulario('${tipo}')">Guardar</button>
    `;
  } else if (tipo === "clientes") {
    formHtml = `
      <h3>Agregar cliente</h3>
      <input placeholder="Número de cliente" id="numero">
      <input placeholder="Producto comprado" id="compra">
      <input placeholder="ID del producto" id="id">
      <input placeholder="Monto" type="number" id="monto">
      <button onclick="enviarFormulario('${tipo}')">Guardar</button>
    `;
  } else if (tipo === "pagos") {
    formHtml = `
      <h3>Agregar pago</h3>
      <input placeholder="Monto" type="number" id="monto">
      <input placeholder="Producto" id="producto">
      <input placeholder="ID del producto" id="id">
      <input type="file" id="imagen">
      <button onclick="enviarFormulario('${tipo}')">Guardar</button>
    `;
  }

  body.innerHTML = formHtml;
  document.getElementById("modal").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

async function enviarFormulario(tipo) {
  const cerrar = () => {
    cerrarModal();
    mostrar(tipo);
  };

  let data = {};

  if (tipo === "productos") {
    data = {
      id: document.getElementById("id").value,
      nombre: document.getElementById("nombre").value,
      precio: document.getElementById("precio").value,
      popularidad: document.getElementById("popularidad").value,
    };
  } else if (tipo === "clientes") {
    data = {
      numero: document.getElementById("numero").value,
      compra: document.getElementById("compra").value,
      id: document.getElementById("id").value,
      monto: document.getElementById("monto").value,
    };
  } else if (tipo === "pagos") {
    const file = document.getElementById("imagen").files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const cloudRes = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const cloudData = await cloudRes.json();

    data = {
      monto: document.getElementById("monto").value,
      producto: document.getElementById("producto").value,
      id: document.getElementById("id").value,
      imagen: cloudData.secure_url,
    };
  }

  const res = await fetch(`${API}/${tipo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) cerrar();
}

function buscar(tipo, texto) {
  const lista = document.getElementById(`lista-${tipo}`);
  for (let item of lista.children) {
    item.style.display = item.innerText.toLowerCase().includes(texto.toLowerCase()) ? "" : "none";
  }
}

function editarItem(seccion, item) {
  abrirFormulario(seccion);

  if (seccion === "productos") {
    document.getElementById("id").value = item.id;
    document.getElementById("nombre").value = item.nombre;
    document.getElementById("precio").value = item.precio;
    document.getElementById("popularidad").value = item.popularidad;
  } else if (seccion === "clientes") {
    document.getElementById("numero").value = item.numero;
    document.getElementById("compra").value = item.compra;
    document.getElementById("id").value = item.id;
    document.getElementById("monto").value = item.monto;
  } else if (seccion === "pagos") {
    document.getElementById("monto").value = item.monto;
    document.getElementById("producto").value = item.producto;
    document.getElementById("id").value = item.id;
  }
}

async function eliminarItem(seccion, id) {
  if (!confirm("¿Seguro que deseas eliminar este elemento?")) return;

  const res = await fetch(`${API}/${seccion}/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    mostrar(seccion);
  } else {
    alert("Error al eliminar");
  }
}
