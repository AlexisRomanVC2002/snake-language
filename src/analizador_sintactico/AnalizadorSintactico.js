// El analizador sintáctico verifica si sigue las reglas de la gramática del lenguaje.
// Es decir, verifica si una función está declarada correctamente.
// Si una expresión está correctamente escrita como a = 5 + 6, etc.

// Análisis Sintáctico Descendente Recursivo -> Forma de nuestro analizador sintáctico.

import { TIPOS_TOKEN } from "../TiposToken.js";
import { Funcion } from "./Funcion.js"
import { Variable } from "./Variable.js";

export let MENSAJES_ERROR = [];
export let MAPA_FUNCIONES = new Map();

let PILA_SIMBOLOS = [];
let LINEA_INICIO = 0;

let TOKENS_BLOQUE = [];
let VARIABLES_BLOQUE = new Map();

export function Parser(tokens) {

    // Limpiamos los mensajes de error anteriores.
    MENSAJES_ERROR = [];
    MAPA_FUNCIONES.clear();
    PILA_SIMBOLOS = [];

    let snake = false;

    let bloqueCodigo = '';
    let headerToken = "";
    LINEA_INICIO = 0;

    for (let i = 0; i < tokens.length; i++) {

        let token = tokens[i];

        if (token.tipo === TIPOS_TOKEN.COMENTARIO_LINEA) continue;

        if ((token.valor != "func" && token.valor != "snake") && bloqueCodigo === "") {
            MENSAJES_ERROR.push(`Error sintactico: No puede haber codigo fuera de los bloques de 'snake' o 'func'.`);
            break;
        }

        if (token.valor === "snake") {
            if (snake) {
                MENSAJES_ERROR.push("Error sintáctico: No puede haber más de un punto de entrada 'snake'.");
                break;
            }

            snake = !snake;
        }

        if (headerToken != "") {
            TOKENS_BLOQUE.push(token);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////
        // COMPROBANDO APERTURA Y CIERRE DE SIMBOLOS
        ////////////////////////////////////////////////////////////////////////////////////////////


        if (token.valor === "(" || token.valor === "{" || token.valor === "[" || token.valor === "%") {
            PILA_SIMBOLOS.push(token);

        } else if (token.valor === ")" || token.valor === "}" || token.valor === "]" || token.valor === "%%") {

            let pop_simbolo = PILA_SIMBOLOS.pop();

            if (!pop_simbolo) MENSAJES_ERROR.push(`Error sintactico: No se ha abierto correctamente el simbolo '${token.valor}' en la linea '${token.linea}'.`);
            else if ((token.valor === ")" && pop_simbolo.valor != "(") || (token.valor === "}" && pop_simbolo.valor != "{") || (token.valor === "]" && pop_simbolo.valor != "[") || (token.valor === "%%" && pop_simbolo.valor != "%")) MENSAJES_ERROR.push(`Error sintactico: No se ha cerrado correctamente el simbolo '${pop_simbolo.valor}' de la linea '${pop_simbolo.linea}'`);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////////
        // COMPROBANDO EL PUNTO Y COMA.
        ////////////////////////////////////////////////////////////////////////////////////////////

        if ((!tokens[i + 1] || tokens[i + 1].linea > token.linea) && token.valor != ";" && token.valor != "%" && token.valor != "%%" && token.valor != "#" && token.valor != "{" && token.valor != "}") {
            MENSAJES_ERROR.push(`Error sintáctico: Falta el punto y coma en la línea '${token.linea}'`);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        // Si encontramos una definicion de una funcion o un metodo snake dentro de una funcion o metodo snake
        // entonces mandamos un error y rompemos la ejecucion del programa debido a que esto no es permitido.
        if ((token.valor === "func" || token.valor === "snake") && bloqueCodigo != "") {
            MENSAJES_ERROR.push(`Error sintáctico: No puede abrir el token '${token.valor}' dentro de un bloque '${headerToken}'`);
            break;
        }

        // Verificando cual es nodo padre.

        if (token.valor === "func") {
            LINEA_INICIO = token.linea;
            headerToken = "func";
        } else if (token.valor === "snake") {
            headerToken = "snake";
            LINEA_INICIO = token.linea;
        }

        bloqueCodigo += token.valor + " ";

        if (token.valor === "%%") {

            if (headerToken === "func") {
                validarFuncion(bloqueCodigo.trim())
            } else if (headerToken === "snake") {
                validarSnake(bloqueCodigo);
            }

            bloqueCodigo = '';
            TOKENS_BLOQUE = [];
        }
    }

    
    if (!snake) {
        MENSAJES_ERROR.push("Error sintáctico: Falta el punto de entrada 'snake' en el programa.");
        return;
    }

    if (PILA_SIMBOLOS.length > 0) {
        PILA_SIMBOLOS.forEach(token => {
            MENSAJES_ERROR.push(`Error sintactico: No se ha cerrado correctamente el simbolo '${token.valor}' en la linea '${token.linea}'.`);
        });
    }
}

function validarFuncion(bloque) {

    const IDENTIFICADOR = /^\$[A-Za-z_$][A-Za-z_$]*$/;
    let REGEX = /^func \$[A-Za-z_$][A-Za-z_$]*\s*\(\s*(?:\$[A-Za-z_$][A-Za-z_$]*(?:\s*,\s*\$[A-Za-z_$][A-Za-z_$]*)*)?\s*\)\s*%\s*[\s\S]*?%\s*$/;

    let palabras = bloque.split(" ");
    let nombreFuncion = "";
    let parametros = [];
    let cuerpo = "";
    VARIABLES_BLOQUE.clear();

    if (!bloque.match(REGEX)) {
        MENSAJES_ERROR.push(`Error sintactico: La estructura de la funcion es incorrecta en la linea '${LINEA_INICIO}'`);
        return false;
    }

    if (!palabras[1].match(IDENTIFICADOR)) {
        MENSAJES_ERROR.push(`Error sintactico: Se esperaba un nombre en la funcion ubicado en la linea '${LINEA_INICIO}'`);
        return false;
    }

    nombreFuncion = palabras[1];

    if (MAPA_FUNCIONES.get(nombreFuncion)) {
        MENSAJES_ERROR.push(`Error sintactico: Ya se encuentra una funcion definida con el nombre '${nombreFuncion}'.`);
        return false;
    }

    // La funcion no tiene argumentod.
    if (palabras[2] === "(" && palabras[3] === ")") {

        parametros = null;

        let indexApertura = bloque.indexOf("%");
        let indexCerradura = bloque.indexOf("%%");
        cuerpo = bloque.substring(indexApertura + 1, indexCerradura);

    }
    // La funcion contiene argumentos.
    else {

        let parentesisAbierto = palabras.indexOf("(");
        let parentesisCerrado = palabras.indexOf(")");

        let argumentos_no_formateado = palabras.slice(parentesisAbierto + 1, parentesisCerrado);

        argumentos_no_formateado.forEach(argumento => {
            if (argumento.match(IDENTIFICADOR)) parametros.push({
                "nombre": argumento,
                "valor": null
            });
            else if (argumento != ",") {
                MENSAJES_ERROR.push(`Error sintactico: La funcion '${nombreFuncion}' en la linea '${LINEA_INICIO}' no esta sintacticamente correcta.`);
                return false;
            }
        });

        let indexApertura = bloque.indexOf("%");
        let indexCerradura = bloque.indexOf("%%");
        cuerpo = bloque.substring(indexApertura + 1, indexCerradura);
    }

    /*for (let i = 0; i < TOKENS_BLOQUE.length; i++) {

        let token = TOKENS_BLOQUE[i];

        if (token.tipo === TIPOS_TOKEN.IDENTIFICADOR) {
            if (!validarVariable(TOKENS_BLOQUE[i - 1], token, TOKENS_BLOQUE[i + 1])) break;
        }

    }*/

    let funcion = new Funcion(nombreFuncion, parametros, cuerpo);
    MAPA_FUNCIONES.set(nombreFuncion, funcion);

    return true;

}

function validarSnake(bloque) {
    //console.log(bloque);
}

function validarVariable(tokenAnterior, tokenActual, tokenSiguiente) {



    // Verificar si la variable ya ha sido declarada
    const variableExistente = VARIABLES_BLOQUE.get(tokenActual.valor);
    const funcionExistente = MAPA_FUNCIONES.get(tokenActual.valor);
    if (variableExistente) {
        MENSAJES_ERROR.push(`Error semántico: La variable '${nombreVariable}' ya ha sido declarada.`);
        return false;
    } else if (funcionExistente) {
        MENSAJES_ERROR.push(`Error semántico: La funcion '${nombreVariable}' ya ha sido declarada.`);
        return false;
    }

    if (tokenAnterior && tokenAnterior.tipo === TIPOS_TOKEN.PALABRA_RESERVADA && (tokenAnterior.valor === "var" || tokenSiguiente.valor === "val")) {
        // Es una declaracion de variable.
        let variable = new Variable(tokenActual.valor);
        return true;
    }

    // Obtener el nombre de la variable del token actual
    const nombreVariable = tokenActual.valor;

    return true;
}
