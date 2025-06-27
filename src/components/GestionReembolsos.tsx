
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, FileText, Check, X } from "lucide-react";
import { SolicitudReembolso } from "@/Model/SolicitudReembolso";
import Reembolso from "@/service/Reembolso";

const GestionReembolsos = () => {
  const [reembolsos, setReembolsos] = useState<SolicitudReembolso[]>([]);

  useEffect(() => {
    const obtenerReembolsos = async () => {
      const reembolsos = await Reembolso.obtenerReembolsos();
      setReembolsos(reembolsos)
    }
    obtenerReembolsos();
  }, [])

  const handleAprobar = (id: string) => {
    Reembolso.aprobarReembolso(id);
    setReembolsos(prev =>
      prev.map(r => r.id === id ? { ...r, estado: 'Aprobado' as const } : r)
    );
  };

  const handleRechazar = (id: string) => {
    Reembolso.rechazarReembolso(id);
    setReembolsos(prev =>
      prev.map(r => r.id === id ? { ...r, estado: 'Rechazado' as const } : r)
    );
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'Rechazado':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
  };
  const abrirPDF = (dataUrl) => {
    // Convertir dataURL a Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const blobUrl = URL.createObjectURL(blob);

    // Abrir PDF en nueva pestaña
    window.open(blobUrl, '_blank');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-salus-blue" />
        <h3 className="text-2xl font-bold text-salus-gray">Gestión de Reembolsos</h3>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-salus-blue">{reembolsos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reembolsos.filter(r => r.estado === 'Pendiente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reembolsos.filter(r => r.estado === 'Aprobado').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Solicitudes de Reembolso
          </CardTitle>
          <CardDescription>
            Gestión de solicitudes de reembolso médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha Atención</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reembolsos.map((reembolso) => (
                  <TableRow key={reembolso.id}>
                    <TableCell className="font-medium">{reembolso.id}</TableCell>
                    <TableCell>{reembolso.nombrePaciente}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {reembolso.fechaAtencion}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${reembolso.montoSolicitado.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{reembolso.descripcion}</TableCell>
                    <TableCell>
                      {reembolso.comprobante ? (
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-green-500" />

                          {/* Ver PDF en nueva pestaña */}

                          <button
                            onClick={() => abrirPDF(reembolso.comprobante)}
                            className="text-blue-600 hover:underline text-sm"
                            title="Ver PDF"
                          >
                            Ver
                          </button>

                          {/* Descargar PDF */}
                          <a
                            href={`${reembolso.comprobante}`}
                            download={`comprobante_pago_${reembolso.id}.pdf`}
                            className="text-sm text-gray-600 hover:text-black"
                            title="Descargar PDF"
                          >
                            Descargar
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin comprobante</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(reembolso.estado)}
                    </TableCell>
                    <TableCell>
                      {reembolso.estado === 'Pendiente' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAprobar(reembolso.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRechazar(reembolso.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionReembolsos;
