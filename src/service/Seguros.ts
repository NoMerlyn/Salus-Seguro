import { ContratoRequestBody, ListaSeguros, PagosSegurosUsuario, SegurosUsuario } from "@/Model/Seguro";
import Usuario from "./Usuario";
import { UsuarioLocal } from "@/Model/Usuario";
class SegurosApi {

    static async getSeguros() {
        const usuario: UsuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        const id = usuario.id_usuario;
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/usuario/${id}`)
        const response: SegurosUsuario[] = await data.json();
        return response;
    }


    static async obtenerListaSeguros() {
        const response = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}seguros/obtenerSeguros`)
        const data: ListaSeguros[] = await response.json();
        return data;
    }

    static async crearContratoSeguro(contrato: ContratoRequestBody, pdf: File) {
        const usuario = await Usuario.crearUsuario(contrato.id_usuario);
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}contratos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...contrato, id_usuario: usuario.id })
        });
        const response = await data.json();
        await Promise.all(contrato.documento.map(doc =>
            this.subirDocumentoUsuario({
                idContrato: response.id,
                documento: doc,
                tipoDocumento: 'cedula'
            })
        ));

        const formData = new FormData();
        formData.append("file", pdf);
        formData.append("id", usuario.id);
        formData.append("nombre", contrato.id_usuario.nombre);
        formData.append("email", contrato.id_usuario.correo);
        console.log(formData)
        const email = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}documentos/enviar-pdf`, {
            method: 'POST',
            body: formData
        });
        const respose = await email.json();
        console.log("se envia el correo: " + response)
    }

    static async subirDocumentoUsuario(documento) {
        const data = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}documentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(documento)
        })

    }
}

export default SegurosApi;
