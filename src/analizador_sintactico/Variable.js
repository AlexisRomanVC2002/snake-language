export class Variable{

    constructor(nombre, valor, tipo){
        this.nombre = nombre;
        this.valor = valor;
        this.tipo = tipo;
    }

    getNombre(){
        return this.nombre;
    }

    getValor(){
        return this.valor;
    }

    getTipo(){
        return this.tipo;
    }

}