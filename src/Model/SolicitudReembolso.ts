export interface SolicitudReembolso {
  id: string;
  nombrePaciente: string;
  fechaAtencion: string;
  montoSolicitado: number;
  descripcion: string;
  comprobante: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  fechaSolicitud: string;
}