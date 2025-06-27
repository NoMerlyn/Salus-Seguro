import { PagoCliente } from "@/Model/PagoCliente";
import { PagosSegurosUsuario } from "@/Model/Seguro";
import { UsuarioLocal } from "@/Model/Usuario";

export default class Pagos {

    static async getPagosSegurosUsuarioLogeado() {
        const usuario: UsuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        const id = usuario.id_usuario;
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/pago/usuario/${id}`)
        const response: PagosSegurosUsuario[] = await data.json();
        return response;
    }
    static async enviarPagoSeguro(Createdata: { comprobanteBase64: string, fecha: Date, monto: number }, idContrato: string) {
        const usuario: UsuarioLocal = JSON.parse(localStorage.getItem("usuario") || "{}");
        const id = usuario.id_usuario;

        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/pago/usuario/${idContrato}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fecha_pago: Createdata.fecha,
                cantidad: Createdata.monto,
                comprobante_pago: Createdata.comprobanteBase64
            }),
        });

        if (!response.ok) {
            throw new Error("Error al enviar el pago");
        }

        const data: any = await response.json();
        return data;
    }

    static async getPagosSeguros() {
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/pago/obtenerTodos`)
        const response: PagoCliente[] = await data.json();
        return response;
    }

    static async aprobarPago(id: string) {
        const aprobar = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/pago/aprobar/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH'
        });
        const data = await aprobar.json()
    }
}