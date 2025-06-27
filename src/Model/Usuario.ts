
export interface UsuarioLocal {
    id_usuario: number;
    correo: string;
    username: string;
    cedula: string;
    nombre: string;
    apellido: string;
    rol: string
}

export interface UsuarioRequestBody {
    nombre: string;
    apellido: string;
    correo: string;
    username: string;
    password: string;
    tipo: string;
    cedula: string;
    telefono: string;
}

export interface Agente {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    estado: string;
    fechaIngreso: string;

}

export interface Cliente {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    estado: string;
    seguro: string;
    fechaRegistro: string;

}
