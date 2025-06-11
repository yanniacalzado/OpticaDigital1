import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useConsignments, useCreateConsignment, useUpdateConsignment, useDeleteConsignment } from "@/hooks/useApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConsignmentSchema, type Consignment, type InsertConsignment } from "@shared/schema";
import { Plus, Search, Edit2, Trash2, RefreshCw, Download, Filter, Package, TrendingUp, CheckCircle, ArrowLeft, RotateCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Consignments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConsignment, setEditingConsignment] = useState<Consignment | null>(null);
  
  const { data: consignments, isLoading } = useConsignments();
  const createConsignment = useCreateConsignment();
  const updateConsignment = useUpdateConsignment();
  const deleteConsignment = useDeleteConsignment();
  const { toast } = useToast();

  const form = useForm<InsertConsignment>({
    resolver: zodResolver(insertConsignmentSchema),
    defaultValues: {
      supplier: "",
      product: "",
      category: "armazones",
      quantity: 0,
      consignmentDate: new Date().toISOString().split('T')[0],
      status: "activa",
      notes: "",
    },
  });

  // Obtener listas únicas para filtros
  const uniqueSuppliers = useMemo(() => {
    const suppliers = consignments?.map(c => c.supplier).filter(Boolean) || [];
    return Array.from(new Set(suppliers)).sort();
  }, [consignments]);

  const filteredConsignments = useMemo(() => {
    return consignments?.filter(consignment => {
      const matchesSearch = 
        consignment.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consignment.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consignment.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || consignment.status === statusFilter;
      const matchesSupplier = supplierFilter === "all" || consignment.supplier === supplierFilter;
      const matchesCategory = categoryFilter === "all" || consignment.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesSupplier && matchesCategory;
    }) || [];
  }, [consignments, searchTerm, statusFilter, supplierFilter, categoryFilter]);

  const onSubmit = async (data: InsertConsignment) => {
    try {
      if (editingConsignment) {
        await updateConsignment.mutateAsync({ id: editingConsignment.id, ...data });
        toast({
          title: "Consignación actualizada",
          description: "La consignación se ha actualizado correctamente.",
        });
      } else {
        await createConsignment.mutateAsync(data);
        toast({
          title: "Consignación registrada",
          description: "La consignación se ha registrado correctamente.",
        });
      }
      setIsDialogOpen(false);
      setEditingConsignment(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la consignación.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (consignment: Consignment) => {
    setEditingConsignment(consignment);
    form.reset({
      supplier: consignment.supplier,
      product: consignment.product,
      category: consignment.category,
      quantity: consignment.quantity,
      consignmentDate: consignment.consignmentDate,
      status: consignment.status,
      notes: consignment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta consignación?")) {
      try {
        await deleteConsignment.mutateAsync(id);
        toast({
          title: "Consignación eliminada",
          description: "La consignación se ha eliminado correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la consignación.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSyncTelko = () => {
    toast({
      title: "Sincronización con Telko",
      description: "Función preparada para integración futura con API de Telko.",
    });
  };

  const exportToExcel = () => {
    if (!filteredConsignments.length) {
      toast({
        title: "Sin datos",
        description: "No hay consignaciones para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Proveedor", "Producto", "Categoría", "Cantidad", "Fecha Consignación", "Estado", "Observaciones"];
    const csvContent = [
      headers.join(","),
      ...filteredConsignments.map(consignment => [
        `"${consignment.supplier}"`,
        `"${consignment.product}"`,
        consignment.category,
        consignment.quantity,
        consignment.consignmentDate,
        consignment.status,
        `"${consignment.notes || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `consignaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${filteredConsignments.length} consignaciones.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vendida":
        return <Badge variant="default" className="bg-green-600">Vendida</Badge>;
      case "devuelta":
        return <Badge variant="secondary">Devuelta</Badge>;
      case "activa":
        return <Badge variant="outline" className="border-blue-600 text-blue-600">Activa</Badge>;
      default:
        return <Badge variant="outline">Sin Estado</Badge>;
    }
  };

  // Calcular métricas
  const totalConsignments = filteredConsignments.length;
  const activeConsignments = filteredConsignments.filter(c => c.status === 'activa').length;
  const soldConsignments = filteredConsignments.filter(c => c.status === 'vendida').length;
  const returnedConsignments = filteredConsignments.filter(c => c.status === 'devuelta').length;

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-slate-900">Consignaciones</h1>
          <p className="text-slate-600 mt-1">
            Gestión de productos en consignación - Registro manual e integración Telko
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSyncTelko} variant="outline" className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50">
            <Sync className="h-4 w-4" />
            Sync Telko
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Consignación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingConsignment ? "Editar Consignación" : "Nueva Consignación"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre del proveedor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Producto *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre del producto" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="armazones">Armazones</SelectItem>
                              <SelectItem value="lentes">Lentes</SelectItem>
                              <SelectItem value="lentes_contacto">Lentes de Contacto</SelectItem>
                              <SelectItem value="accesorios">Accesorios</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="consignmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Consignación *</FormLabel>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Consignación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="activa">Activa</SelectItem>
                            <SelectItem value="vendida">Vendida</SelectItem>
                            <SelectItem value="devuelta">Devuelta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Observaciones adicionales..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingConsignment(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createConsignment.isPending || updateConsignment.isPending}
                    >
                      {editingConsignment ? "Actualizar" : "Registrar"} Consignación
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por producto, proveedor o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="vendida">Vendida</SelectItem>
                <SelectItem value="devuelta">Devuelta</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {uniqueSuppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="armazones">Armazones</SelectItem>
                <SelectItem value="lentes">Lentes</SelectItem>
                <SelectItem value="lentes_contacto">Lentes de Contacto</SelectItem>
                <SelectItem value="accesorios">Accesorios</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSupplierFilter("all");
                setCategoryFilter("all");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{totalConsignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{activeConsignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Vendidas</p>
                <p className="text-2xl font-bold">{soldConsignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Devueltas</p>
                <p className="text-2xl font-bold">{returnedConsignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de consignaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Consignaciones ({filteredConsignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha Consignación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignments.length > 0 ? (
                  filteredConsignments.map((consignment) => (
                    <TableRow key={consignment.id}>
                      <TableCell className="font-medium">
                        {consignment.supplier}
                      </TableCell>
                      <TableCell>
                        {consignment.product}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {consignment.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {consignment.quantity}
                      </TableCell>
                      <TableCell>
                        {new Date(consignment.consignmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(consignment.status)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {consignment.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(consignment)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(consignment.id)}
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
                      {searchTerm || statusFilter !== "all" || supplierFilter !== "all" || categoryFilter !== "all"
                        ? "No se encontraron consignaciones con los filtros aplicados"
                        : "No hay consignaciones registradas"}
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