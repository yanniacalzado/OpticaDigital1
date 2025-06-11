import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { usePrescriptions, useCreatePrescription, useUpdatePrescription, useDeletePrescription, usePatients } from "@/hooks/useApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrescriptionSchema, type Prescription, type InsertPrescription } from "@shared/schema";
import { Plus, Search, Edit2, Trash2, FileText, Download, Filter, Eye, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  
  const { data: prescriptions, isLoading } = usePrescriptions();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const deletePrescription = useDeletePrescription();
  const { toast } = useToast();

  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      patientId: undefined,
      patientName: "",
      date: new Date().toISOString().split('T')[0],
      professional: "",
      rightEyeSphere: "",
      rightEyeCylinder: "",
      rightEyeAxis: "",
      leftEyeSphere: "",
      leftEyeCylinder: "",
      leftEyeAxis: "",
      observations: "",
      recommendedProducts: "",
    },
  });

  const filteredPrescriptions = useMemo(() => {
    return prescriptions?.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.professional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.observations && prescription.observations.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPatient = patientFilter === "all" || prescription.patientName === patientFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const prescriptionDate = new Date(prescription.date);
        const today = new Date();
        const diffTime = today.getTime() - prescriptionDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            matchesDate = diffDays === 0;
            break;
          case "week":
            matchesDate = diffDays <= 7;
            break;
          case "month":
            matchesDate = diffDays <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesPatient && matchesDate;
    }) || [];
  }, [prescriptions, searchTerm, patientFilter, dateFilter]);

  const onSubmit = async (data: InsertPrescription) => {
    try {
      const selectedPatient = patients?.find(p => p.id === data.patientId);
      const prescriptionData = {
        ...data,
        patientName: selectedPatient?.name || data.patientName,
      };

      if (editingPrescription) {
        await updatePrescription.mutateAsync({ id: editingPrescription.id, ...prescriptionData });
        toast({
          title: "Receta actualizada",
          description: "La receta se ha actualizado correctamente.",
        });
      } else {
        await createPrescription.mutateAsync(prescriptionData);
        toast({
          title: "Receta registrada",
          description: "La receta se ha registrado correctamente.",
        });
      }
      setIsDialogOpen(false);
      setEditingPrescription(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la receta.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    form.reset({
      patientId: prescription.patientId || undefined,
      patientName: prescription.patientName,
      date: prescription.date,
      professional: prescription.professional,
      rightEyeSphere: prescription.rightEyeSphere || "",
      rightEyeCylinder: prescription.rightEyeCylinder || "",
      rightEyeAxis: prescription.rightEyeAxis || "",
      leftEyeSphere: prescription.leftEyeSphere || "",
      leftEyeCylinder: prescription.leftEyeCylinder || "",
      leftEyeAxis: prescription.leftEyeAxis || "",
      observations: prescription.observations || "",
      recommendedProducts: prescription.recommendedProducts || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta receta?")) {
      try {
        await deletePrescription.mutateAsync(id);
        toast({
          title: "Receta eliminada",
          description: "La receta se ha eliminado correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la receta.",
          variant: "destructive",
        });
      }
    }
  };

  const exportToExcel = () => {
    if (!filteredPrescriptions.length) {
      toast({
        title: "Sin datos",
        description: "No hay recetas para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Paciente", "Fecha", "Profesional", "OD Esfera", "OD Cilindro", "OD Eje", "OI Esfera", "OI Cilindro", "OI Eje", "Observaciones", "Productos Recomendados"];
    const csvContent = [
      headers.join(","),
      ...filteredPrescriptions.map(prescription => [
        `"${prescription.patientName}"`,
        prescription.date,
        `"${prescription.professional}"`,
        prescription.rightEyeSphere || "",
        prescription.rightEyeCylinder || "",
        prescription.rightEyeAxis || "",
        prescription.leftEyeSphere || "",
        prescription.leftEyeCylinder || "",
        prescription.leftEyeAxis || "",
        `"${prescription.observations || ""}"`,
        `"${prescription.recommendedProducts || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `recetas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${filteredPrescriptions.length} recetas.`,
    });
  };

  if (isLoading || patientsLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Recetas</h1>
          <p className="text-slate-600 mt-1">
            Registro y gestión de recetas ópticas vinculadas a pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Receta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPrescription ? "Editar Receta" : "Nueva Receta Óptica"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Patient and Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paciente *</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar paciente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients?.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.name} - {patient.email}
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
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="professional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profesional Responsable *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del optómetra u oftalmólogo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Right Eye (OD) */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Ojo Derecho (OD)
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="rightEyeSphere"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esfera</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="±0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rightEyeCylinder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cilindro</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="±0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rightEyeAxis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eje</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0-180°" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Left Eye (OI) */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Ojo Izquierdo (OI)
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="leftEyeSphere"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esfera</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="±0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leftEyeCylinder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cilindro</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="±0.00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leftEyeAxis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eje</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0-180°" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""}
                              placeholder="Observaciones adicionales sobre la receta..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recommendedProducts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Productos Recomendados</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""}
                              placeholder="Productos o lentes específicos recomendados..."
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingPrescription(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPrescription.isPending || updatePrescription.isPending}
                    >
                      {editingPrescription ? "Actualizar" : "Registrar"} Receta
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente, profesional u observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={patientFilter} onValueChange={setPatientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pacientes</SelectItem>
                {Array.from(new Set(prescriptions?.map(p => p.patientName))).map(patientName => (
                  <SelectItem key={patientName} value={patientName}>{patientName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setPatientFilter("all");
                setDateFilter("all");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Recetas</p>
                <p className="text-2xl font-bold">{filteredPrescriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Pacientes Únicos</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredPrescriptions.map(p => p.patientName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold">
                  {filteredPrescriptions.filter(p => {
                    const prescriptionDate = new Date(p.date);
                    const now = new Date();
                    return prescriptionDate.getMonth() === now.getMonth() && 
                           prescriptionDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de recetas */}
      <Card>
        <CardHeader>
          <CardTitle>Recetas Ópticas ({filteredPrescriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>OD</TableHead>
                  <TableHead>OI</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.patientName}
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {prescription.professional}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div>Esf: {prescription.rightEyeSphere || "-"}</div>
                        <div>Cil: {prescription.rightEyeCylinder || "-"}</div>
                        <div>Eje: {prescription.rightEyeAxis || "-"}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div>Esf: {prescription.leftEyeSphere || "-"}</div>
                        <div>Cil: {prescription.leftEyeCylinder || "-"}</div>
                        <div>Eje: {prescription.leftEyeAxis || "-"}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {prescription.observations || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {prescription.recommendedProducts || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prescription)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prescription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm || patientFilter !== "all" || dateFilter !== "all"
                        ? "No se encontraron recetas con los filtros aplicados"
                        : "No hay recetas registradas"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}