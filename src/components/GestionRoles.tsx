import { useEffect, useState } from "react";
import { UserCog } from "lucide-react";
import {
  Accordion,
} from "@/components/ui/accordion";
import { Agente, Cliente } from "@/Model/Usuario";
import Usuario from "@/service/Usuario";
import Clientes from "@/service/Clientes";
import UserEditDialog from "./UserEditDialog";
import UserTableSection from "./UserTableSection";

const GestionRoles = () => {
  const [asesores, setAsesores] = useState<Agente[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const obtenerAgentes = async () => {
      const agentes = await Usuario.obtenerAgentes();
      setAsesores(agentes);
    }
    const obtenerClientes = async () => {
      const clientes = await Usuario.obtenerClientes();
      setClientes(clientes);
    }
    obtenerClientes();
    obtenerAgentes();
  }, [])

  const handleToggleStatus = async (id: number, type: 'asesor' | 'cliente') => {
    if (type === 'cliente') {
      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return;

      if (cliente.estado === 'Activo') {
        Clientes.desactivarCliente(id);
      } else {
        Clientes.activarCliente(id);
      }

      setClientes(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, estado: c.estado === 'Activo' ? 'Desactivado' : 'Activo' }
            : c
        )
      );
    } else if (type === 'asesor') {
      const asesor = asesores.find(a => a.id === id);
      if (!asesor) return;

      if (asesor.estado === 'Activo') {
        Usuario.desactivarAsesor(id);
      } else {
        Usuario.activarAsesor(id);
      }

      setAsesores(asesores =>
        asesores.map(a =>
          a.id === id
            ? { ...a, estado: a.estado === 'Activo' ? 'Desactivado' : 'Activo' }
            : a
        )
      );
    }
  };

  const handleEdit = (user: any, type: 'asesor' | 'cliente') => {
    setEditingUser({ ...user, type });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const { id, nombre, email, type } = editingUser;

    const rol = type === "cliente" ? 1 : 2;

    try {
      await Usuario.editarUsuario(id, {
        nombre,
        correo: email,
        tipo: rol + "",
      });

      // Actualiza localmente el usuario en el arreglo correspondiente (opcional)
      if (type === "cliente") {
        setClientes((prev) =>
          prev.map((c) => (c.id === id ? { ...c, nombre, email } : c))
        );
      } else if (type === "asesor") {
        setAsesores((prev) =>
          prev.map((a) => (a.id === id ? { ...a, nombre, email } : a))
        );
      }

      // Cierra el diálogo
      setIsEditDialogOpen(false);
      setEditingUser(null);

      // Recarga la página
      window.location.reload();

    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
    setIsEditDialogOpen(false);
    setEditingUser(null);

    // Recarga la página
    window.location.reload();

  };






  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCog className="w-6 h-6 text-salus-blue" />
        <h3 className="text-2xl font-bold text-salus-gray">Gestión de Roles y Accesos</h3>
      </div>

      <UserEditDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={editingUser}
        onChange={setEditingUser}
        onSave={handleSaveEdit}
      />
      <Accordion type="multiple" className="w-full space-y-4">
        <UserTableSection
          title="Asesores de Seguros"
          users={asesores}
          type="asesor"
          onEdit={handleEdit}
          onToggle={handleToggleStatus}
        />
        <UserTableSection
          title="Clientes"
          users={clientes}
          type="cliente"
          onEdit={handleEdit}
          onToggle={handleToggleStatus}
        />
      </Accordion>
    </div>
  );
};

export default GestionRoles;
