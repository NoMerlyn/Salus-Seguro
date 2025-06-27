// components/UserTableSection.tsx
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Power, PowerOff, UserCog } from "lucide-react";

export default function UserTableSection({ title, users, type, onEdit, onToggle }) {
  return (
    <AccordionItem value={type} className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <UserCog className="w-5 h-5 text-salus-blue" />
          <span className="text-lg font-semibold text-salus-gray">{title}</span>
          <span className="bg-salus-blue text-white px-2 py-1 rounded-full text-xs">{users.length}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                {type === "cliente" && <TableHead>Seguro</TableHead>}
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telefono}</TableCell>
                  {type === "cliente" && <TableCell>{user.seguro}</TableCell>}
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.estado === 'Activo'
                        ? 'bg-green-100 text-green-800'
                        : user.estado === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {user.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(user, type)}>
                        <Edit className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button
                        variant={user.estado === "Activo" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => onToggle(user.id, type)}
                      >
                        {user.estado === "Activo" ? (
                          <>
                            <PowerOff className="w-3 h-3 mr-1" /> Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3 mr-1" /> Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
