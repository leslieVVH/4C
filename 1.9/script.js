let participantes = [];

function agregarParticipante() {
let input = document.getElementById("nombreInput");
let nombre = input.value.trim();

if (nombre.toLowerCase() === "salir") {
    terminarRegistro();
    return;
}

if (nombre !== "") {
    participantes.push(nombre);
    mostrarMensaje("Ingrese un nombre: " + nombre);
    input.value = "";
    input.focus();
}
}

function terminarRegistro() {
mostrarMensaje("\nTotal de participantes: " + participantes.length);
mostrarMensaje("Lista: " + participantes.join(", "));

if (participantes.length > 5) {
mostrarMensaje("¡Hay más de 5 participantes!");
}
}

function mostrarMensaje(mensaje) {
const salida = document.getElementById("salida");
salida.textContent += mensaje + "\n";
}
