const producto = document.querySelector(".producto");
const sidebar = document.querySelector(".sidebar");
let formulario = document.getElementById("idForm");
let botonMostrarUsuarios = document.getElementById("idbotonMostrarUsers");
let divUsers = document.getElementById("divUsuarios");
let botonMostrarCarrito = document.getElementById("botonMostrarCarrito");
let divCarrito = document.getElementById("carrito");
let productoSeleccionado;

//Usuarios
class User {
  constructor(user, email, password) {
    this.user = user;
    this.email = email;
    this.password = password;
  }

  loguearse() {
    console.log(`${this.user} esta logeado correctamente.`);
  }
}

let arrayUsuarios = [];

if (localStorage.getItem(`usuarios`)) {
  arrayUsuarios = JSON.parse(localStorage.getItem(`usuarios`));
} else {
  localStorage.setItem(`usuarios`, JSON.stringify(arrayUsuarios));
}

formulario.addEventListener(`submit`, (e) => {
  e.preventDefault();

  let user = document.getElementById("idUser").value;
  let email = document.getElementById("idEmail").value;
  let password = document.getElementById("idPassword").value;

  if (!arrayUsuarios.some((usuarioEnArray) => usuarioEnArray.email == email)) {
    const usuario = new User(user, email, password);
    arrayUsuarios.push(usuario);
    localStorage.setItem(`usuarios`, JSON.stringify(arrayUsuarios));
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Usuario creado correctamente",
      showConfirmButton: false,
      timer: 1500,
    });
    formulario.reset();
  } else {
    Swal.fire({
      icon: "error",
      title: "El usuario ya existe.",
    });
  }
});

//Productos
class Producto {
  constructor(id, nombre, precio, stock) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }
}

let productos = [];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const usuario = document.getElementById("usuario");

/*--------------------------------------------------------------*/
//Con Fetch Consigo los datos del JSON
async function obtenerProductos() {
  const response = await fetch("productos.json");
  return await response.json();
}

let arrayProductos = obtenerProductos();
//Agrego productos del JSON al array de productos (falta agregarle los métodos o transformar cada uno en un new Producto)
arrayProductos.then((el) => {
  el.forEach((el) => {
    let productosJson = new Producto(
      el["id"],
      el["nombre"],
      el["precio"],
      el["stock"]
    );
    productos.push(productosJson);
  });
});
//MOSTRAR PRODUCTOS EN HTML
let divProducto = document.getElementById("producto");
//Con Fetch
obtenerProductos().then((productos) => {
  productos.forEach((producto) => {
    if (producto.stock > 0) {
      setTimeout(() => {
        divProducto.innerHTML += `
          <div id="${producto.id}" class="card bg-light mb-3" style="max-width: 18rem;">
        <img src="${producto.img}" class="card-img-top img-thumbnail" alt="${producto.nombre}">
        <div class="nombre card-header">${producto.nombre}</div>
        <div class="card-body">
          <p class="precio card-text">Precio: $<span>${producto.precio}</span>.</p>
          <button data-id="${producto.id}" class="botonAgregar btn btn-info">Agregar al carrito</button>
        </div>
      </div>
          `;
        //Btn agregar al carrito
        const btnAgregar = document.querySelectorAll(".botonAgregar");
        btnAgregar.forEach((e) =>
          e.addEventListener("click", (e) => {
            let cardPadre = e.target.parentElement.parentElement;
            agregarAlCarrito(cardPadre);
          })
        );
      }, 500);
    }
  });
});

const swalToast = (texto, color, fondo, posicion) => {
  Swal.fire({
    toast: true,
    text: texto,
    color: color,
    background: fondo,
    showConfirmButton: false,
    position: posicion,
    timer: 2000,
    timerProgressBar: true,
  });
};

//Agregar al carrito
const agregarAlCarrito = (cardPadre) => {
  swalToast("Producto agregado al carrito.", "", "#00ff00", "bottom-end");

  let producto = {
    nombre: cardPadre.querySelector(".nombre").textContent,
    precio: Number(cardPadre.querySelector(".precio span").textContent),
    cantidad: 1,
    id: Number(cardPadre.querySelector("button").getAttribute("data-id")),
  };

  let productoEncontrado = carrito.find(
    (element) => element.id === producto.id
  );
  //Operador ternario
  productoEncontrado ? productoEncontrado.cantidad++ : carrito.push(producto);

  mostrarCarrito();
};
//Mostrar carrito
botonMostrarCarrito.addEventListener(`click`, () => {
  sidebar.classList.toggle("active");
  if (carrito.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "",
      icon: "warning",
    });
    cerrarCarrito();
  }
});

const cerrarCarrito = () => {
  if (carrito.length === 0) {
    sidebar.classList.toggle("active");
  }
};
//Mostrar Carrito en html
const mostrarCarrito = () => {
  sidebar.innerHTML = "";
  carrito.forEach((element) => {
    let { nombre, precio, id, stock, cantidad } = element;
    sidebar.innerHTML += `
      <div class="card" id="producto${id}" style="width: 18rem;">        
          <div class="card-body">
            <h5 class="card-title">Nombre: ${nombre}</h5>
            <p class="card-text">Cantidad:${cantidad}</p>            
            <p class="card-text">Precio: $${precio}</p>
            <p class="card-text">Subtotal:${precio * cantidad}</p>
            <button data-id="${id}" class="btn-restar btn btn-danger">-</button>
            <button data-id="${id}" class="btn-borrar btn btn-danger">Borrar</button>
          </div>
    </div>
    `;
  });
  localStorage.setItem("carrito", JSON.stringify(carrito));
  calcularTotal();
};

const restarProducto = (productoRestar) => {
  swalToast("Producto retirado.", "white", "#ff4000", "bottom-end");

  let productoEncontrado = carrito.find(
    (element) => element.id === Number(productoRestar)
  );
  if (productoEncontrado) {
    productoEncontrado.cantidad--;
    if (productoEncontrado.cantidad === 0) {
      borrarProducto(productoRestar);
    }
  }
  mostrarCarrito();
  cerrarCarrito();
};

const borrarProducto = (productoBorrar) => {
  swalToast("Producto retirado.", "white", "#ff4000", "bottom-end");

  carrito = carrito.filter((element) => element.id !== Number(productoBorrar));
  mostrarCarrito();
  cerrarCarrito();
};

const escucharBotonesSidebar = () => {
  sidebar.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-restar")) {
      restarProducto(e.target.getAttribute("data-id"));
    }
    if (e.target.classList.contains("btn-borrar")) {
      borrarProducto(e.target.getAttribute("data-id"));
    }
  });
};

const calcularTotal = () => {
  if (carrito.length !== 0) {
    let total = carrito.reduce(
      (acc, ite) => acc + ite.precio * ite.cantidad,
      0
    );

    let divTotal = document.createElement("div");

    divTotal.innerHTML = `<div class="total-compra card" id="total-compra" style="width: 18rem;">        
          <div class="card-body">
            <h5 class="card-title">Total $${total}</h5>            
            <button data-id="" class="btn btn-success">Finalizar Compra</button>
          </div>
    </div>
    `;
    sidebar.appendChild(divTotal);

    let botonFinalizar = document.querySelector("#total-compra");
    botonFinalizar.onclick = () => {
      const mixin = Swal.mixin({});

      mixin
        .fire({
          title: "Complete con sus datos:",
          html: ` <input id="datos-personales-nombre" type="text" class="swal2-input" placeholder="Nombre/s" required>
                <br>
                <input id="datos-personales-apellido" type="text" class="swal2-input" placeholder="Apellido" required>
                <br>
                <input id="num-tarjeta" type="number" class="swal2-input" placeholder="Nro Tarjeta" required>
                <br>
                <input id="domicilio" class="swal2-input" placeholder="Domicilio" required>
                <br>
                <p class="">Total: $${total} </p>
                `,

          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonText: "Comprar",
          allowOutsideClick: false,

          preConfirm: () => {
            let datosNombre = Swal.getPopup().querySelector(
              "#datos-personales-nombre"
            ).value;
            let datosApellido = Swal.getPopup().querySelector(
              "#datos-personales-apellido"
            ).value;
            let numTarjeta =
              Swal.getPopup().querySelector("#num-tarjeta").value;
            let domicilio = Swal.getPopup().querySelector("#domicilio").value;
            if (!domicilio || !datosNombre || !datosApellido || !numTarjeta) {
              Swal.showValidationMessage("Por favor, complete todos los datos");
            }
            return domicilio;
          },
        })
        .then((result) => {
          if (result.isConfirmed) {
            mixin.fire(
              "Compra realizada",
              "El pedido será enviado a: " + result.value,
              "success"
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            mixin.fire("", "Su compra ha sido cancelada", "error");
          }

          carrito = [];
          sidebar.classList.toggle("active");
          mostrarCarrito();
        });
    };
  }
};

mostrarCarrito();
escucharBotonesSidebar();
