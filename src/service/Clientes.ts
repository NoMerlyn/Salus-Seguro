export default class Clientes {

    static async obtenerClientes() {
        const usuarios = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/usuarios`);
        const data = await usuarios.json();
        return data;

    }
    static async desactivarCliente(id: number) {
        const usuarios = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/${id}/desactivar`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH'
        });
        const data = await usuarios.json();
        return data;

    }

    static async activarCliente(id: number) {
        const usuarios = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}usuario/${id}/activar`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH'
        });
        const data = await usuarios.json();
        return data;

    }
}