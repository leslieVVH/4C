//let resultado = document.getElementById("resultado"); //referencia UL

function hola(){
    let elemento = document.getElementById("lista").value; //valor input
    let hola1 = document.createElement("li"); //crear elemento HTML --createElement
    hola1.innerText = elemento; //<li>--innerText--</li>
    resultado.appendChild(hola1) //appendChild inserta un valor hijo en el padre
    //resultado(<ul>(item(<li></li>))</ul>)
}

let carrito = [];
function mostrarListaCompra(){
    const lista = document.getElementById("resultado2");
    lista.innerHTML = ""; //Limpiar antes de mostrar

    for (let i = 0; i < carrito.length; i++){
        const li = document.createElement("li");
        li.className ="list-group-item d-flex justify-content-between align-items-center mb-2";
        li.textContent = `- ${carrito[i]}`;
        lista.appendChild(li)
    }
}

function agregarElemento2() {
    const input = document.getElementById("lista2");
    const valor = input.value.trim(); //guardo valor sin espacios extras
   
    if (valor === "") return;
    carrito.push(valor); //Agregar valor al final
   
    input.value = "";
    input.focus(); // agregamos foco hacia el input

    mostrarListaCompra()
}

function eliminarUltimoElemento(){
    if (carrito.length > 0){
        carrito.pop();
    }
    mostrarListaCompra()
}

let colores = []

function mostrar_lista_colores(){
    const lista = document.getElementById("resultado3");
    lista.innerHTML =""; //Limpia antes de mostrar

    for (let i = 0; i < colores.length; i++){
        const li = document.createElement("li");
        li.className ="list-group-item d-flex justify-content-between align-items-center mb-2";
        li.textContent = `- ${colores[i]}`;
        lista.appendChild(li)
    }
}

function agregar_inicio() {
    const input = document.getElementById("lista3");
    const valor = input.value.trim(); //guardo valor sin espacios extras
   
    if (valor === ""){
        return;
    };
     
    colores.unshift(valor) //Agregar valor al inicio
    input.value = "";
    input.focus(); // agregamos foco hacia el input

    mostrar_lista_colores()
}

let colores2 = []

function mostrar_lista_colores2(){
    const lista = document.getElementById("resultado4");
    lista.innerHTML =""; //Limpia antes de mostrar

    for (let i = 0; i < colores2.length; i++){
        const li = document.createElement("li");
        li.className ="list-group-item d-flex justify-content-between align-items-center mb-2";
        li.textContent = `- ${colores2[i]}`;
        lista.appendChild(li)
    }
}

function agregar_inicio2() {
    const input = document.getElementById("lista4");
    const valor = input.value.trim(); //guardo valor sin espacios extras
    if (valor === ""){
        return;
    };
    colores2.unshift(valor) //Agregar valor al inicio
    input.value = "";
    input.focus(); // agregamos foco hacia el input

    mostrar_lista_colores2()
}

function eliminar_primer_elemento(){
    if (colores2.length > 0){
        colores2.shift();
    };

    mostrar_lista_colores2()
}
