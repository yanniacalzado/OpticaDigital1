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
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder, useDeletePurchaseOrder } from "@/hooks/useApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, type PurchaseOrder, type InsertPurchaseOrder } from "@shared/schema";
import { Plus, Search, Edit2, Trash2, ShoppingCart, Download, Calendar, Filter, TrendingUp, Package, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Purchases() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  
  const { data: purchaseOrders, isLoading } = usePurchaseOrders();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder();
  const deletePurchaseOrder = useDeletePurchaseOrder();
  const { toast } = useToast();

  const form = useForm<InsertPurchaseOrder>({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      orderNumber: "",
      supplier: "",
      total: "0",
      status: "pendiente",
      notes: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Obtener listas únicas para filtros
  const uniqueSuppliers = useMemo(() => {
    const suppliers = purchaseOrders?.map(p => p.supplier).filter(Boolean) || [];
    return Array.from(new Set(suppliers)).sort();
  }, [purchaseOrders]);

  const filteredOrders = useMemo(() => {
    return purchaseOrders?.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSupplier = supplierFilter === "all" || order.supplier === supplierFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const orderDate = new Date(order.date);
        const today = new Date();
        const diffTime = today.getTime() - orderDate.getTime();
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
      
      return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
    }) || [];
  }, [purchaseOrders, searchTerm, statusFilter, supplierFilter, dateFilter]);

  const onSubmit = async (data: InsertPurchaseOrder) => {
    try {
      if (editingOrder) {
        await updatePurchaseOrder.mutateAsync({ id: editingOrder.id, ...data });
        toast({
          title: "Orden actualizada",
          description: "La orden de compra se ha actualizado correctamente.",
        });
      } else {
        await createPurchaseOrder.mutateAsync(data);
        toast({
          title: "Orden creada",
          description: "La orden de compra se ha registrado correctamente.",
        });
      }
      setIsDialogOpen(false);
      setEditingOrder(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la orden de compra.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    form.reset({
      orderNumber: order.orderNumber,
      supplier: order.supplier,
      total: order.total,
      status: order.status,
      notes: order.notes || "",
      date: order.date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta orden de compra?")) {
      try {
        await deletePurchaseOrder.mutateAsync(id);
        toast({
          title: "Orden eliminada",
          description: "La orden de compra se ha eliminado correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la orden de compra.",
          variant: "destructive",
        });
      }
    }
  };

  const exportToExcel = () => {
    if (!filteredOrders.length) {
      toast({
        title: "Sin datos",
        description: "No hay órdenes de compra para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Identificador", "Fecha", "Proveedor", "Productos", "Valor Total", "Estado", "Nota"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.date,
        `"${order.supplier}"`,
        "Productos en consignación", // Placeholder for products
        order.total,
        order.status,
        `"${order.notes || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `compras_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${filteredOrders.length} órdenes de compra.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completada":
        return <Badge variant="default">Completada</Badge>;
      case "en_proceso":
        return <Badge variant="secondary">En Proceso</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  // Calcular métricas
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = filteredOrders.filter(order => order.status === 'pendiente').length;
  const completedOrders = filteredOrders.filter(order => order.status === 'completada').length;

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
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de Compra</h1>
          <p className="text-slate-600 mt-1">
            Gestión de compras generadas a partir de ventas de productos en consignación
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
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOrder ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identificador *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="OC-2024-001" />
                          </FormControl>
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
                      name="total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              placeholder="0.00"
                            />
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
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_proceso">En Proceso</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
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
                        <FormLabel>Nota</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones o notas adicionales..."
                            rows={3}
                            value={field.value || ""}
                            onChange={field.onChange}
                            name={field.name}
                            ref={field.ref}
                          />
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
                        setEditingOrder(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}
                    >
                      {editingOrder ? "Actualizar" : "Crear"} Orden
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
                placeholder="Buscar por identificador, proveedor o notas..."
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
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
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
                setStatusFilter("all");
                setSupplierFilter("all");
                setDateFilter("all");
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
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">{completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.supplier}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Productos en consignación
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${parseFloat(order.total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
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
                      {searchTerm || statusFilter !== "all" || supplierFilter !== "all" || dateFilter !== "all"
                        ? "No se encontraron órdenes de compra con los filtros aplicados"
                        : "No hay órdenes de compra registradas"}
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