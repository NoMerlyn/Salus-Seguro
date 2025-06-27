import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import { CalendarIcon, Upload, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UsuarioLocal } from "@/Model/Usuario";
import { Label } from "@/components/ui/label";
import { SegurosUsuario } from "@/Model/Seguro";
import SegurosApi from "@/service/Seguros";

const formSchema = z.object({
  fechaGasto: z.date({ required_error: "La fecha del gasto es requerida" }).refine((date) => date <= new Date(), {
    message: "La fecha no puede ser futura",
  }),
  tipoGasto: z.string().min(1, "Seleccione el tipo de gasto"),
  monto: z.string()
    .min(1, "El monto es requerido")
    .refine((val) => {
      const num = parseFloat(val);
      return num === 69 || num === 120;
    }, "El monto debe ser 69 o 120 USD")
    .refine((val) => parseFloat(val) >= 0, "El monto no puede ser negativo"),
  comprobante: z.any().optional(),
  descripcion: z.string().optional(),
  seguroSeleccionado: z.string()
});

const tiposGasto = [
  "Consulta médica",
  "Medicamentos",
  "Exámenes de laboratorio",
  "Radiografías",
  "Hospitalización",
  "Cirugía",
  "Fisioterapia",
  "Otro"
];

const FormularioReembolso = () => {
  // Estado para el archivo y base64
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>(""); const { toast } = useToast();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [seguros, setSeguros] = useState<SegurosUsuario[]>([]);
  useEffect(() => {
    const fetchPagos = async () => {
      const data = await SegurosApi.getSeguros();
      setSeguros(data)
    };
    fetchPagos();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Convierte archivo a base64
  const convertirArchivoABase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Maneja selección del archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
      setArchivo(file);
      const base64 = await convertirArchivoABase64(file);
      setPdfBase64(base64);
    } else {
      alert("Por favor, selecciona un archivo válido (PDF o imagen)");
      setArchivo(null);
      setPdfBase64("");
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    const idSeguro = values.seguroSeleccionado;
    formData.append("id_usuario_seguro_per", "1");
    formData.append("fecha_gasto", values.fechaGasto.toISOString().split("T")[0]);
    formData.append("tipoGasto", values.tipoGasto);
    formData.append("monto", values.monto);
    formData.append("descripcion", values.descripcion || "");
    if (archivo) {
      formData.append("comprobantes", archivo);
    }
    formData.append("seguroSeleccionado", values.seguroSeleccionado || "");

    try {
      const res = await fetch(`${import.meta.env.VITE_URL_API_BACK_END}reembolsos/${idSeguro}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha_gasto: values.fechaGasto.toISOString().split("T")[0],
          tipo_gasto: values.tipoGasto,
          monto: values.monto,
          descripcion: values.descripcion,
          comprobante: pdfBase64
        }),
      });

      if (res.ok) {
        toast({
          title: "Solicitud enviada",
          description: "Su solicitud de reembolso ha sido registrada exitosamente.",
        });
        form.reset();
        setArchivo(null);
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Error al guardar el reembolso.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Reembolso</CardTitle>
        <CardDescription>Complete el formulario para solicitar el reembolso de gastos médicos</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fechaGasto"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Gasto</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Seleccione una fecha</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoGasto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Gasto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de gasto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposGasto.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Solicitado (USD)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el monto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="69">$69.00</SelectItem>
                      <SelectItem value="120">$120.00</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Comprobante (PDF o imagen)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Subir comprobante
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, PNG, JPG hasta 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="comprobantes"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                {archivo && (
                  <div className="mt-2 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-600">{archivo.name}</span>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Adicional (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explique el motivo del reembolso..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seguroSeleccionado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seguro</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un seguro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seguros.map((seguro) => (
                        <SelectItem key={seguro.id_seguro} value={seguro.id_seguro.toString()}>
                          {seguro.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full">
              Enviar Solicitud de Reembolso
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FormularioReembolso;
