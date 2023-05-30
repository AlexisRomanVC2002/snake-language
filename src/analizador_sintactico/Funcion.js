export class Funcion{

    constructor(nombre, parametros, cuerpo){
        this.nombre = nombre;
        this.parametros = parametros;
        this.cuerpo = cuerpo;
    }

    getNombre(){
        return this.nombre;
    }

    getParametros(){
        return this.parametros;
    }

    getCuerpo(){
        return this.cuerpo;
    }

}