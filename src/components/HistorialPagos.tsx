
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Check, Clock } from "lucide-react";
import { PagoCliente } from "@/Model/PagoCliente";
import Pagos from "@/service/Pagos";

const HistorialPagos = () => {
  const [pagos, setPagos] = useState<PagoCliente[]>([]);

  useEffect(() => {
    const obtenerPagos = async () => {
      const pagos = await Pagos.getPagosSeguros();
      setPagos(pagos);
    }
    obtenerPagos();
  }, [])

  const handleAprobar = (id: string) => {
    Pagos.aprobarPago(id);
    setPagos(prev =>
      prev.map(p => p.id === id ? {
        ...p,
        estado: 'Aprobado' as const,
        fechaAprobacion: new Date().toISOString().split('T')[0]
      } : p)
    );
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'Aprobado' ? (
      <Badge className="bg-green-100 text-green-800">
        <Check className="w-3 h-3 mr-1" />
        Aprobado
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pendiente
      </Badge>
    );
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
        <CreditCard className="w-6 h-6 text-salus-blue" />
        <h3 className="text-2xl font-bold text-salus-gray">Historial de Pagos</h3>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-salus-blue">{pagos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pagos.filter(p => p.estado === 'Pendiente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pagos.filter(p => p.estado === 'Aprobado').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagos de Clientes
          </CardTitle>
          <CardDescription>
            Gestión y aprobación de pagos realizados por clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pago</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead>Monto (USD)</TableHead>
                  <TableHead>Tipo Seguro</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">PG00{pago.id}</TableCell>
                    <TableCell>{pago.cliente}</TableCell>
                    <TableCell>{pago.fechaPago}</TableCell>
                    <TableCell className="font-medium">${pago.monto.toFixed(2)}</TableCell>
                    <TableCell>{pago.tipoSeguro}</TableCell>

                    <TableCell>
                      {pago.comprobante ? (
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-green-500" />

                          {/* Ver PDF en nueva pestaña */}

                          <button
                            onClick={() => abrirPDF(pago.comprobante)}
                            className="text-blue-600 hover:underline text-sm"
                            title="Ver PDF"
                          >
                            Ver
                          </button>

                          {/* Descargar PDF */}
                          <a
                            href={`${pago.comprobante}`}
                            download={`comprobante_pago_${pago.id}.pdf`}
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
                      {getEstadoBadge(pago.estado)}
                    </TableCell>
                    <TableCell>
                      {pago.estado === 'Pendiente' && (
                        <Button
                          size="sm"
                          onClick={() => handleAprobar(pago.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aprobar
                        </Button>
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

export default HistorialPagos;
