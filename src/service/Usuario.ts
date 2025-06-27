import { UsuarioRequestBody } from "@/Model/Usuario";

class Usuario {

    static async crearUsuario(data: UsuarioRequestBody) {
        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const statu = await response.json();
        return statu;
    }
    static async obtenerAgentes() {
        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/agentes`);
        const statu = await response.json();
        return statu;
    }

    static async obtenerClientes() {
        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/usuarios`);
        const statu = await response.json();
        return statu;
    }

    static async activarAsesor(id: number) {
        return fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/${id}/activar`, { method: "PATCH" });
    }

    static async desactivarAsesor(id: number) {
        return fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/${id}/desactivar`, { method: "PATCH" });
    }

    static async editarUsuario(id: number, body: {
        nombre?: string;
        apellido?: string;
        correo?: string;
        username?: string;
        tipo?: string;
        cedula?: string;
        telefono?: string;
    }) {
        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Error al editar el usuario');
        }

        return await response.json(); 
    }

}
export default Usuario