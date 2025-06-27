import { useEffect, useState } from "react";
import { Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from "@/components/ui/card";

import { ClientData } from "@/Model/ClienteData";
import Clientes from "@/service/Clientes";
import Usuario from "@/service/Usuario";

// Componente principal
const GestionClientes = () => {
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [editingCliente, setEditingCliente] = useState<ClientData | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    seguro: "Salud",
    valorMensual: 69,
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      cedula: "",
      seguro: "Salud",
      valorMensual: 69,
    });
    setEditingCliente(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'seguro' && {
        valorMensual: value === 'Vida' ? 420 : 69,
      }),
    }));
  };

  const handleEditCliente = (cliente: ClientData) => {
    const [nombre, ...apellidoParts] = (cliente.nombre || "").split(" ");
    const apellido = apellidoParts.join(" ");

    setEditingCliente(cliente);
    setFormData({
      nombre: nombre || "",
      apellido: apellido || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      cedula: cliente.cedula || "",
      seguro: cliente.seguro || "Salud",
      valorMensual: cliente.valorMensual || 69,
    });
  };

  const handleUpdateCliente = async () => {
    if (!editingCliente) return;

    try {
      const body: { [key: string]: string } = {};

      const [nombreOriginal, ...apellidoOriginalParts] = (editingCliente.nombre || "").split(" ");
      const apellidoOriginal = apellidoOriginalParts.join(" ");

      if (formData.nombre && formData.nombre !== nombreOriginal) {
        body.nombre = formData.nombre;
      }

      if (formData.apellido && formData.apellido !== apellidoOriginal) {
        body.apellido = formData.apellido;
      }

      if (formData.email && formData.email !== editingCliente.email) {
        body.correo = formData.email;
      }

      if (formData.telefono && formData.telefono !== editingCliente.telefono) {
        body.telefono = formData.telefono;
      }

      if (formData.cedula && formData.cedula !== editingCliente.cedula) {
        body.cedula = formData.cedula;
      }

      if (Object.keys(body).length === 0) {
        console.log("No hay cambios para actualizar");
        return;
      }

      await Usuario.editarUsuario(editingCliente.id, body);

      // Opcional: actualizar localmente (podrías omitir si vas a recargar la página)
      setClientes(prev =>
        prev.map(cliente =>
          cliente.id === editingCliente.id
            ? {
              ...cliente,
              nombre: `${formData.nombre} ${formData.apellido}`.trim(),
              email: formData.email,
              telefono: formData.telefono,
              cedula: formData.cedula,
            }
            : cliente
        )
      );

      // Cerrar el diálogo
      setEditingCliente(null);
      resetForm();

      // Recargar la página
      window.location.reload();

    } catch (error) {
      console.error("Error actualizando cliente:", error);
    }
    // Cerrar el diálogo
    setEditingCliente(null);
    resetForm();

    // Recargar la página
    window.location.reload();
  };


  const handleToggleEstado = async (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    try {
      if (cliente.estado === "Activo") {
        await Usuario.desactivarAsesor(clienteId);
      } else {
        await Usuario.activarAsesor(clienteId);
      }

      setClientes(prev =>
        prev.map(c =>
          c.id === clienteId
            ? { ...c, estado: c.estado === "Activo" ? "Desactivado" : "Activo" }
            : c
        )
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Hubo un error al cambiar el estado.");
    }
  };

  const ClienteForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre"
          />
        </div>
        <div>
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            placeholder="Ingrese el apellido"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="+57 300 123 4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seguro">Tipo de Seguro</Label>
          <select
            id="seguro"
            name="seguro"
            value={formData.seguro}
            onChange={handleInputChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="Salud">Seguro de Salud ($69/mes)</option>
            <option value="Vida">Seguro de Vida ($420/mes)</option>
          </select>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await Clientes.obtenerClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
        alert("No se pudieron cargar los clientes.");
      }
    };
    fetchClientes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-salus-blue" />
          <h3 className="text-2xl font-bold text-salus-gray">Clientes</h3>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {["Total Clientes", "Clientes Activos", "Desactivados"].map((titulo, idx) => {
          const valor = idx === 0 ? clientes.length :
            idx === 1 ? clientes.filter(c => c.estado === "Activo").length :
              clientes.filter(c => c.estado === "Desactivado").length;

          const color = idx === 1 ? "text-green-600" :
            idx === 2 ? "text-yellow-600" : "text-salus-blue";

          return (
            <Card key={titulo}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-salus-gray-light">{titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{valor}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla de clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Seguro</TableHead>
                  <TableHead>Valor Mensual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map(cliente => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.seguro}</TableCell>
                    <TableCell className="text-salus-blue font-semibold">${cliente.valorMensual}/mes</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cliente.estado === "Activo" ? "bg-green-100 text-green-800" :
                        cliente.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                        {cliente.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={editingCliente?.id === cliente.id} onOpenChange={(open) => !open && resetForm()}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditCliente(cliente)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Cliente</DialogTitle>
                              <DialogDescription>Modifique la información del cliente.</DialogDescription>
                            </DialogHeader>
                            <ClienteForm />
                            <DialogFooter>
                              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                              <Button onClick={handleUpdateCliente} className="bg-salus-blue hover:bg-salus-blue-dark">Actualizar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant={cliente.estado === "Activo" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleEstado(cliente.id)}
                        >
                          {cliente.estado === "Activo" ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
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

export default GestionClientes;
