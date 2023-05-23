import { Scanner } from './src/analizador_lexico/AnalizadorLexico.js'
import { PILA_ERRORES } from './src/analizador_lexico/AnalizadorLexico.js';

window.addEventListener("DOMContentLoaded", () => {

    const editor = document.querySelector("#entrada_codigo");
    const numero_linea = document.querySelector("#numero_linea");

    const tabla_tokens = document.querySelector("#tabla_tokens");
    let tbody = tabla_tokens.tBodies[0];

    let seccion_tabla = document.querySelector("#seccion_tabla");

    const boton_analizar = document.querySelector("#button_analizar");

    // Indice para las lineas de codigo
    let index = 0;

    function actualizarLineaCodigo() {
        const lineas = editor.value.split("\n");
        const lineNumbersHTML = lineas.map((_, index) => `<span>${index + 1}</span>`).join('');
        numero_linea.innerHTML = lineNumbersHTML;
    }

    function sincronizarScroll() {
        const proporcion = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        const desplazamiento = proporcion * (numero_linea.scrollHeight - numero_linea.clientHeight);
        numero_linea.scrollTop = desplazamiento;
    }


    editor.addEventListener("input", () => {
        actualizarLineaCodigo();
    });

    editor.addEventListener('scroll', () => {
        sincronizarScroll();
    });


    // Agregnado funcionalidad en el textarea al momento de tabular
    editor.addEventListener("keydown", (e) => {

        if (e.key == 'Tab') {
            e.preventDefault();
            let start = editor.selectionStart;
            let end = editor.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            editor.value = editor.value.substring(0, start) +
                "\t" + editor.value.substring(end);

            // put caret at right position again
            editor.selectionStart = editor.selectionEnd = start + 1;
        }
    });

    // Funcionalidad del boton analizar
    boton_analizar.addEventListener("click", () => {

        const tokens = Scanner(editor.value);

        if (PILA_ERRORES.length > 0) {
            console.log("Errores en el analizador lexico...");
            return;
        }

        let index = 0;
        tbody.innerHTML = "";

        tokens.forEach( token => {

            index += 1;

            let datosHTML = 
            `
            <tr>
                <td>${index}</td>
                <td>${token.getTipo()}</td>
                <td>${token.getValor()}</td>
                <td>${token.getLinea()}</td>

            </tr>
            `;
            let nuevaFila = tbody.insertRow();
            nuevaFila.innerHTML = datosHTML;
        } );

        seccion_tabla.scrollIntoView({ behavior: 'smooth' });

    });

});