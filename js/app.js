let DB;

// SELECTORES
const pacienteInput = document.querySelector('#paciente');
const propietarioInput = document.querySelector('#propietario');
const emailInput = document.querySelector('#email');
const fechaInput = document.querySelector('#fecha');
const sintomasInput = document.querySelector('#sintomas');

const formulario = document.querySelector('#formulario-cita');
const formularioSubmit = document.querySelector('#formulario-cita input[type="submit"]');
const contenedorCitas = document.querySelector('#citas');

window.onload = () => {
    eventListeners();
    crearDB();
}

// EVENTOS
function eventListeners() {
    pacienteInput.addEventListener('change', datosCita);
    propietarioInput.addEventListener('change', datosCita);
    emailInput.addEventListener('change', datosCita);
    fechaInput.addEventListener('change', datosCita);
    sintomasInput.addEventListener('change', datosCita);
    formulario.addEventListener('submit', submitCita);
}    

let editando = false;

// Objeto de Cita
const citaObj = {
    id: generarId(),
    paciente: '',
    propietario: '',
    email: '',
    fecha: '',
    sintomas: ''
}

class Notificacion {
    constructor({texto, tipo}){
        this.texto = texto;
        this.tipo = tipo;

        this.mostrar();
    }

    mostrar() {
        // Eliminar alertas duplicadas
        const alertaPrevia = document.querySelector('.alert');
        alertaPrevia?.remove(); // Encadenamiento opcional

        // Crear la notificación
        const alerta = document.createElement('DIV');
        alerta.classList.add('text-center', 'w-full', 'p-3', 'text-white', 'my-5', 'alert',
            'uppercase', 'font-bold', 'text-sm')
        // Si es de tipo error, agrega un clase
        this.tipo === 'error' ? alerta.classList.add('bg-red-500') : alerta.classList.add('bg-green-500');   
        // Mensaje de error
        alerta.textContent = this.texto;

        //Inserta en el DOM
        formulario.parentElement.insertBefore(alerta, formulario);
        
        //Quitar despues de 5 segundos
        setTimeout(() => {
            alerta.remove();
        },3000);
    }
}

class AdminCitas {

    agregar(cita) {
        // this.citas = [...this.citas, cita];
        
        // Insertar registro en indexdedDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        // Habilitar el objectStore
        const objectStore = transaction.objectStore('citas');
        //Insertar la cita en la base de datos
        objectStore.add(cita).onerror = function(e) {
            console.error('Error al agregar la cita:', e.target.error);
        };


        transaction.oncomplete = function() {
            console.log('Cita Agregada');
                new Notificacion({
                texto: 'Paciente AGREGADO correctamente',
                tipo: 'exito'
            });
        }

        transaction.onerror = function() {
            console.error('Error en la transacción:', transaction.error);
        };

        this.mostrar();
    }

    editar(citaActualizada) {
        //this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita)
        
        // Editar en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.put(citaActualizada);
        transaction.oncomplete = function() {
            console.log('Cita Actualizada');
                new Notificacion({
                texto: 'Paciente ACTUALIZADO correctamente',
                tipo: 'exito'
            });
        }

        transaction.onerror = function() {
            console.log("Ocurrio un error al intentar actualizar el paciente");
        }
        
        this.mostrar();        
    }

    eliminar(id) {
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.delete(id);

        objectStore.oncomplete = function() {
            console.log(`Cita ${id} eliminada...`)
        };

        objectStore.onerror = function() {
            console.log(`Error eliminando la cita ${id}`);
        };

        this.mostrar();
    }

    mostrar() {
        // Limpiar el HTML previo
        /*
        while(contenedorCitas.firstChild) {
            contenedorCitas.firstChild.remove();
        } */
        contenedorCitas.replaceChildren();

        // Leer el contenido de la base de datos
        const objectStore = DB.transaction(['citas'], 'readonly').objectStore('citas');

        const total = objectStore.count();
        total.onsuccess = function() {
            if(total.result === 0) {
                contenedorCitas.innerHTML ='<p class="text-xl mt-5 mb-10 text-center">No Hay Pacientes</p>';
            }
        }        
        
        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;

            if(cursor) {
                const cita = cursor.value;
                console.log(cita);

                const divCita = document.createElement('DIV');
                divCita.classList.add('mx-5', 'my-10', 'bg-white', 'shadow-md',
                    'px-5', 'py-10', 'rounded-xl');
                
                const paciente = document.createElement('P');
                paciente.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                paciente.innerHTML = `<span class="font-bold uppercase">Paciente: </span>${cita.paciente}`;

                const propietario = document.createElement('P');
                propietario.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                propietario.innerHTML = `<span class="font-bold uppercase">Propietario: </span>${cita.propietario}`;

                const email = document.createElement('P');
                email.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                email.innerHTML = `<span class="font-bold uppercase">Email: </span>${cita.email}`;

                const fecha = document.createElement('P');
                fecha.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                fecha.innerHTML = `<span class="font-bold uppercase">Fecha: </span>${cita.fecha}`;

                const sintomas = document.createElement('P');
                sintomas.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
                sintomas.innerHTML = `<span class="font-bold uppercase">Síntomas: </span>${cita.sintomas}`;

                // Botones de eliminar y editar
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('py-2', 'px-10', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2', 'btn-editar');
                btnEditar.innerHTML = 'Editar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'
                btnEditar.onclick = () => cargarEdicion(cita);

                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('py-2', 'px-10', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2');
                btnEliminar.innerHTML = 'Eliminar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'    
                btnEliminar.onclick = () => citas.eliminar(cita.id);

                const contenedorBotones = document.createElement('DIV');
                contenedorBotones.classList.add('flex', 'justify-between', 'mt-10');

                contenedorBotones.appendChild(btnEditar);
                contenedorBotones.appendChild(btnEliminar);

                // Inyectar HTML
                divCita.appendChild(paciente);
                divCita.appendChild(propietario);
                divCita.appendChild(email);
                divCita.appendChild(fecha);
                divCita.appendChild(sintomas);
                divCita.appendChild(contenedorBotones);
                contenedorCitas.appendChild(divCita);

                cursor.continue();
            }
            
        }
        
    }
}

// FUNCIONES
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
    // console.log(citaObj);
}

const citas = new AdminCitas();

function submitCita(e) {
    e.preventDefault();

    if(Object.values(citaObj).some(valor => valor.trim() === '')) {
        new Notificacion({
            texto: 'Todos los campos son obligatorios',
            tipo: 'error'
        });
        return;
    }

    const citaValidada = Object.fromEntries(Object.entries(citaObj)
                        .map(([campo, valor]) => [campo, valor.trim()]));

    if(editando) {
        citas.editar(citaValidada);                
    }else {
        citas.agregar(citaValidada);
    }
    
    formulario.reset();
    reiniciarObjetoCita();
    formularioSubmit.value = 'Registrar Paciente';  
    editando = false;
}

function reiniciarObjetoCita() {
    // Reiniciar el objeto
    /* 
    citaObjt.id = generarId();
    citaObj.paciente = '';
    citaObj.propietario = '';
    citaObj.email = '';
    citaObj.fecha = '';
    citaObj.sintomas = '';
    */

    Object.assign(citaObj, {
        id: generarId(),
        paciente: '',
        propietario: '',
        email: '',
        fecha: '',
        sintomas: ''
    });

}

function generarId() {
    return Math.random().toString(36).substring(2) + Date.now();
}

function cargarEdicion(cita) {
    Object.assign(citaObj, cita);

    pacienteInput.value = cita.paciente;
    propietarioInput.value = cita.propietario;
    emailInput.value = cita.email;
    fechaInput.value = cita.fecha;
    sintomasInput.value = cita.sintomas;

    editando = true;

    formularioSubmit.value = 'Guardar Cambios';
}

function crearDB() {
    // Crear la base de datos en version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    // Si hay error
    crearDB.onerror = function() {
        console.log('Hubo un error');
    }

    // Si todo sale bien
    crearDB.onsuccess = function() {
        console.log('Base de datos creada con éxito');
        DB = crearDB.result;
        // Mostrar citas al cargar con IndexedDB listo
        citas.mostrar();
    }

    // Definir el schema
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;
        
        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            //autoIncrement: true
        });

        // Definir todas las columnas
        objectStore.createIndex('id', 'id', {unique:true});
        objectStore.createIndex('paciente', 'paciente', {unique:false});
        objectStore.createIndex('propietario', 'propietario', {unique:false});
        objectStore.createIndex('email', 'email', {unique:false});
        objectStore.createIndex('fecha', 'fecha', {unique:false});
        objectStore.createIndex('sintomas', 'sintomas', {unique:false});
        
        console.log('Base de datos creada y lista');
    }
}
