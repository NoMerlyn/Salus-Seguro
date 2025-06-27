import { UsuarioLocal } from "@/Model/Usuario";

export default class Reembolso {

    static async obtenerReembolsos() {
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}reembolsos`);
        const reembolsos = await data.json()
        return reembolsos;
    }
    static async aprobarReembolso(id: string) {
        const aprobar = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}reembolsos/aprobar/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH'
        });
        const data = await aprobar.json()
    }
    static async rechazarReembolso(id: string) {
        const aprobar = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}reembolsos/rechazar/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH'
        });
        const data = await aprobar.json()
    }
    static async obtenerReembolsosUsuarioLogeado() {
        const usuario: UsuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        const id = usuario.id_usuario;
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}reembolsos/${id}`);
        const reembolsos = await data.json()
        return reembolsos;
    }
}