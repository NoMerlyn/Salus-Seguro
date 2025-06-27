import { useEffect, useState } from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, Clock } from "lucide-react";
import Reembolso from "@/service/Reembolso";

type ReembolsoUsuario = {
    fecha: string;
    tipo: string;
    descripcion?: string;
    estado: "Pendiente" | "Aprobado";
    archivos?: string; // base64
};

const HistorialReembolsos = () => {
    const [reembolsos, setReembolsos] = useState<ReembolsoUsuario[]>([]);

    useEffect(() => {
        const obtenerReembolsos = async () => {
            const data = await Reembolso.obtenerReembolsosUsuarioLogeado();
            setReembolsos(data);
        };
        obtenerReembolsos();
    }, []);

    const abrirPDF = (dataUrl: string) => {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    };

    const getEstadoBadge = (estado: "Pendiente" | "Aprobado") => {
        return estado === "Aprobado" ? (
            <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Aprobado
            </Badge>
        ) : (
            <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pendiente
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-salus-blue" />
                <h3 className="text-2xl font-bold text-salus-gray">Mis Solicitudes de Reembolso</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Historial</CardTitle>
                    <CardDescription>Visualiza tus reembolsos enviados</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo de Gasto</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Comprobante</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reembolsos.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.tipo}</TableCell>
                                        <TableCell>{item.descripcion || "—"}</TableCell>
                                        <TableCell>
                                            {item.archivos ? (
                                                <button
                                                    onClick={() => abrirPDF(item.archivos!)}
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Ver PDF
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-400">Sin comprobante</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getEstadoBadge(item.estado)}</TableCell>
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

export default HistorialReembolsos;
