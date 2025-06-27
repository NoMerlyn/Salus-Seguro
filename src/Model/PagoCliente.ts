export interface PagoCliente {
    id: string;
    cliente: string;
    fechaPago: string;
    monto: number;
    tipoSeguro: string;
    comprobante: string;
    estado: 'Pendiente' | 'Aprobado';
    fechaAprobacion?: string;
}