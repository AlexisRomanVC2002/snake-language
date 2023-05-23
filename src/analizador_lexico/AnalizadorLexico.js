// El analizador lexico solamente verificara que todo lo escrito
// se encuentre en nuestro alfabeto , se encargara de eliminar los comentarios,
// de limpiar espacios en blanco y retornar un arreglo de tokens para la siguiente etapa.

import { Token } from "../Token.js";
import { TIPOS_TOKEN } from '../TiposToken.js'

// Expresion regular para identificar el nombre de variables o funciones
// las cuales deben de empezar con una letra mayuscula o minuscula
// y puede ser separado por el '_' ---> nombre_completo o Nombre_Completo
const IDENTIFICADOR = /^\$[A-Za-z_$][A-Za-z_$]*$/; ///^[A-Za-z][A-Za-z_]*$/;

// Expresion regular para identificar un literal numerico en nuestro analizador.
const LITERAL_NUMERCIO = /^-?\d+(\.\d+)?$/;

// Expresion regular para identificar una cadena de texto entre comillas.
const CADENA_TEXT = /^"[^"]*"$/;

// if(NOT (5 + 3 == 2))
const OPERADORES = ["+", "-", "*", "=", ">", "<", "&&", "||", "/", ">=", "<=", "==", "!=", "NOT"];

const COMENTARIO_LINEA = ["#"];

const DELIMITADORES = [
    ";",
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    ",",
    "\\'"
];

const PALABRAS_RESERVADAS = [
    "printter",
    "var",
    "val",
    "func",
    "if",
    "cycle",
    "stop",
    "fort",
    "next",
    "return",
    "true",
    "false",
    "null",
    "snake",
    "arry"
];

export let PILA_ERRORES = [];

function limpiarInstruccionLinea(linea) {

    let linea_sin_espacios = linea.trim();

    return linea_sin_espacios.replace(/("[^"]*")|\s/g, function (match, group1) {
        if (group1) {
            return group1; // Conservar la palabra entre comillas sin eliminar los espacios
        } else {
            return '';
        }
    });
}

export function Scanner(entrada_codigo) {

    let tokens = [];
    PILA_ERRORES = [];

    const lineas_codigo = entrada_codigo.split("\n");
    let lineas_limpias = [];

    lineas_codigo.forEach(linea => {
        // Se encarga de limpiar los espacios en blanco.
        lineas_limpias.push(limpiarInstruccionLinea(linea));
    });

    let palabra = "";

    for (let i = 0; i < lineas_limpias.length; i++) {

        let linea = lineas_limpias[i];
        if (palabra != "") {

            let error = {
                linea : i,
                contenido: lineas_codigo[i - 1]
            }

            PILA_ERRORES.push(error);
        };

        palabra = "";

        if (linea === "") continue; // Si la linea esta vacia entonces no la necesitamos

        for (let index_caracter = 0; index_caracter < linea.length; index_caracter++) {

            let caracter = linea[index_caracter];
            palabra += caracter;


            // Se verifica que es una palabra reservada.
            if (PALABRAS_RESERVADAS.includes(palabra)) {
                let token = new Token(TIPOS_TOKEN.RESERVADO, palabra, i + 1);
                //console.log("Palabra reservada: " + token.getLinea());
                tokens.push(token);
                palabra = "";
            }

            // Se verifica que es un delimitador.
            else if (DELIMITADORES.includes(palabra)) {
                //console.log("Delimitador: " + palabra);
                let token = new Token(TIPOS_TOKEN.DELIMITADOR, palabra, i + 1);
                tokens.push(token);
                palabra = ""; // Una vez que se encuentra un delimitador empieza una nueva palabra
            }

            // Identificando comentario y saltando la linea
            else if (COMENTARIO_LINEA.includes(palabra)) {
                let token = new Token(TIPOS_TOKEN.COMENTARIO_LINEA, palabra, i + 1);
                tokens.push(token);
                palabra = "";
                break;
            }
            // Identificamos si la palabra creada es una cadena de texto --> "texto"
            else if (palabra.match(CADENA_TEXT)) {
                //console.log("Cadena Texto:" + palabra);
                let token = new Token(TIPOS_TOKEN.CADENA, palabra, i + 1);
                tokens.push(token);
                palabra = "";
            }

            // Identificamos si la palabra creada es un numero.
            else if (palabra.match(LITERAL_NUMERCIO) && linea[index_caracter + 1] && (linea[index_caracter + 1] != ".") && (!linea[index_caracter + 1].match(LITERAL_NUMERCIO))) {
                //console.log("Literal Numerico: " + palabra);
                let token = new Token(TIPOS_TOKEN.NUMERO, palabra, i + 1);
                tokens.push(token);
                palabra = "";
            }

            // Se verifica si la palabra es un operador.
            else if (OPERADORES.includes(palabra)) {
                //console.log("Operador: " + palabra);
                let token = null;
                switch (palabra) {
                    case "+": token = new Token(TIPOS_TOKEN.OPERADOR_SUMA, palabra, i + 1);
                        break;

                    case "-": token = new Token(TIPOS_TOKEN.OPERADOR_RESTA, palabra, i + 1);
                        break;

                    case "*": token = new Token(TIPOS_TOKEN.OPERADOR_MULT, palabra, i + 1);
                        break;

                    case "/": token = new Token(TIPOS_TOKEN.OPERADOR_DIV, palabra, i + 1);
                        break;

                    case "=": token = new Token(TIPOS_TOKEN.OPERADOR_ASIGNACION, palabra, i + 1);
                        break;

                    case ">": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    case ">=": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    case "<": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    case "<=": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    case "==": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    case "!=": token = new Token(TIPOS_TOKEN.OPERADOR_RACIONAL, palabra, i + 1);
                        break;

                    default: token = new Token(TIPOS_TOKEN.OPERADOR_LOGICO, palabra, i + 1);

                }

                tokens.push(token);
                palabra = "";
            }

            // Identificamos si la palabra generada hasta el momento es un "identificador"
            // donde debe empezar con $ y debe terminar con un delimitador o un operador
            // por ejemplo:
            // $numero = 5 ---> si la palabra hasta ahora es $n si se cumple la condicion
            // palabra.match(IDENTIFICADOR) porque empiza con $ y le sigue una letra, pero
            // no es el nombre completo del identificador, sino que el nombre se terminara
            // hasta cuando encuentre un operador o en cuyo caso un operador, en el cual
            // en este caso encuentra = entonces el nombre es --> "$numero"
            // pero en una funcion seria --> func $sumar_numeros(){} ---> encuentra un delimitador
            // "(" entonces el nombre completo es ----> "$sumar_numeros"
            else if (palabra.match(IDENTIFICADOR) && (OPERADORES.includes(linea[index_caracter + 1]) || DELIMITADORES.includes(linea[index_caracter + 1]))) {
                //console.log("Identificador: " + palabra);
                let token = new Token(TIPOS_TOKEN.IDENTIFICADOR, palabra, i + 1);
                tokens.push(token);
                palabra = "";
            }

        }
    }

    return tokens;
}
