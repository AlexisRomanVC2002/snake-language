export class Token{

    constructor(tipo, valor, linea){
        this.tipo = tipo;
        this.valor = valor;
        this.linea = linea
    }

    getTipo(){
        return this.tipo;
    }

    getValor(){
        return this.valor;
    }

    getLinea(){
        return this.linea;
    }

}