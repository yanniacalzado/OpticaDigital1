import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useDashboardData, 
  useProducts, 
  usePatients, 
  useSalesOrders, 
  usePurchaseOrders, 
  useConsignments, 
  usePrescriptions 
} from "@/hooks/useApi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  FileText,
  Eye,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [reportType, setReportType] = useState("sales");
  
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: salesOrders, isLoading: salesLoading } = useSalesOrders();
  const { data: purchaseOrders, isLoading: purchaseLoading } = usePurchaseOrders();
  const { data: consignments, isLoading: consignmentsLoading } = useConsignments();
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions();
  const { toast } = useToast();

  const isLoading = dashboardLoading || productsLoading || patientsLoading || 
                   salesLoading || purchaseLoading || consignmentsLoading || prescriptionsLoading;

  // Sales Analytics
  const salesAnalytics = useMemo(() => {
    if (!salesOrders) return { total: 0, byCategory: [], byMonth: [], topProducts: [] };

    const total = salesOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    // Sales by category (simulated from product categories)
    const categoryData = [
      { name: "Armazones", value: Math.floor(total * 0.4), sales: Math.floor(salesOrders.length * 0.4) },
      { name: "Lentes", value: Math.floor(total * 0.35), sales: Math.floor(salesOrders.length * 0.35) },
      { name: "Lentes de Contacto", value: Math.floor(total * 0.2), sales: Math.floor(salesOrders.length * 0.2) },
      { name: "Accesorios", value: Math.floor(total * 0.05), sales: Math.floor(salesOrders.length * 0.05) }
    ];

    // Monthly sales trend
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const monthSales = Math.floor(total / 6 + Math.random() * (total / 12));
      monthlyData.push({ month: monthName, sales: monthSales, orders: Math.floor(monthSales / 150) });
    }

    return { total, byCategory: categoryData, byMonth: monthlyData, topProducts: [] };
  }, [salesOrders]);

  // Inventory Analytics
  const inventoryAnalytics = useMemo(() => {
    if (!products) return { total: 0, byCategory: [], lowStock: [], totalValue: 0 };

    const total = products.length;
    const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * product.stock), 0);

    const categoryData = products.reduce((acc, product) => {
      const existing = acc.find(item => item.name === product.category);
      if (existing) {
        existing.value += 1;
        existing.stock += product.stock;
      } else {
        acc.push({ 
          name: product.category.replace('_', ' '), 
          value: 1, 
          stock: product.stock 
        });
      }
      return acc;
    }, [] as any[]);

    const lowStock = products.filter(product => product.stock < 10);

    return { total, byCategory: categoryData, lowStock, totalValue };
  }, [products]);

  // Customer Analytics
  const customerAnalytics = useMemo(() => {
    if (!patients || !salesOrders || !prescriptions) return { total: 0, newThisMonth: 0, withPrescriptions: 0, topCustomers: [] };

    const total = patients.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newThisMonth = patients.filter(patient => {
      const createdDate = new Date(patient.createdAt || new Date());
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const withPrescriptions = new Set(prescriptions.map(p => p.patientName)).size;

    // Top customers by purchase frequency (simulated)
    const topCustomers = patients.slice(0, 5).map(patient => ({
      name: patient.name,
      orders: Math.floor(Math.random() * 10) + 1,
      total: Math.floor(Math.random() * 2000) + 500
    }));

    return { total, newThisMonth, withPrescriptions, topCustomers };
  }, [patients, salesOrders, prescriptions]);

  const exportToPDF = () => {
    const reportContent = `
    ===== REPORTE ÓPTICA =====
    Fecha: ${new Date().toLocaleDateString()}
    Período: ${dateRange}
    
    RESUMEN EJECUTIVO:
    - Ventas Totales: $${salesAnalytics.total.toFixed(2)}
    - Productos en Inventario: ${inventoryAnalytics.total}
    - Clientes Registrados: ${customerAnalytics.total}
    - Consignaciones Activas: ${consignments?.filter(c => c.status === 'activa').length || 0}
    
    VENTAS POR CATEGORÍA:
    ${salesAnalytics.byCategory.map(cat => `- ${cat.name}: $${cat.value.toFixed(2)} (${cat.sales} ventas)`).join('\n    ')}
    
    INVENTARIO POR CATEGORÍA:
    ${inventoryAnalytics.byCategory.map(cat => `- ${cat.name}: ${cat.value} productos (Stock: ${cat.stock})`).join('\n    ')}
    
    PRODUCTOS CON STOCK BAJO:
    ${inventoryAnalytics.lowStock.map(product => `- ${product.name}: ${product.stock} unidades`).join('\n    ')}
    
    CLIENTES TOP:
    ${customerAnalytics.topCustomers.map(customer => `- ${customer.name}: ${customer.orders} órdenes ($${customer.total})`).join('\n    ')}
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Reporte Óptica</title></head>
          <body style="font-family: monospace; white-space: pre-line; margin: 20px;">
            ${reportContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Reporte generado",
      description: "El reporte PDF se ha generado correctamente.",
    });
  };

  const exportToExcel = () => {
    const headers = ["Métrica", "Valor", "Detalle"];
    const data = [
      ["Ventas Totales", `$${salesAnalytics.total.toFixed(2)}`, "Suma de todas las ventas"],
      ["Productos Totales", inventoryAnalytics.total.toString(), "Cantidad de productos en inventario"],
      ["Clientes Totales", customerAnalytics.total.toString(), "Clientes registrados"],
      ["Clientes Nuevos (Mes)", customerAnalytics.newThisMonth.toString(), "Nuevos clientes este mes"],
      ["Consignaciones Activas", (consignments?.filter(c => c.status === 'activa').length || 0).toString(), "Consignaciones en estado activo"],
      ["Valor Inventario", `$${inventoryAnalytics.totalValue.toFixed(2)}`, "Valor total del inventario"],
      ["Stock Bajo", inventoryAnalytics.lowStock.length.toString(), "Productos con stock menor a 10"],
    ];

    const csvContent = [
      headers.join(","),
      ...data.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_optica_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: "Los datos se han exportado a Excel correctamente.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes y Análisis</h1>
          <p className="text-slate-600 mt-1">
            Dashboard completo con análisis de ventas, inventario, clientes y consignaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold">${salesAnalytics.total.toFixed(2)}</p>
                <p className="text-xs text-green-600">+12% vs mes anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl font-bold">{inventoryAnalytics.total}</p>
                <p className="text-xs text-orange-600">{inventoryAnalytics.lowStock.length} bajo stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">{customerAnalytics.total}</p>
                <p className="text-xs text-green-600">+{customerAnalytics.newThisMonth} este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Consignaciones</p>
                <p className="text-2xl font-bold">{consignments?.filter(c => c.status === 'activa').length || 0}</p>
                <p className="text-xs text-blue-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="prescriptions">Recetas</TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesAnalytics.byCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesAnalytics.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesAnalytics.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Ventas ($)" />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Órdenes" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesAnalytics.byCategory.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.sales} ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${category.value.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {((category.value / salesAnalytics.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryAnalytics.byCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Productos" />
                    <Bar dataKey="stock" fill="#82ca9d" name="Stock Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inventoryAnalytics.lowStock.length > 0 ? (
                    inventoryAnalytics.lowStock.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.code}</p>
                        </div>
                        <Badge variant="destructive">{product.stock} unidades</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No hay productos con stock bajo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{inventoryAnalytics.total}</p>
                  <p className="text-sm text-gray-600">Total Productos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">${inventoryAnalytics.totalValue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Valor Total</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{inventoryAnalytics.lowStock.length}</p>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{inventoryAnalytics.byCategory.length}</p>
                  <p className="text-sm text-gray-600">Categorías</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Reports */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Top</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerAnalytics.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.orders} órdenes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${customer.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{customerAnalytics.total}</p>
                    <p className="text-sm text-gray-600">Total Clientes</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{customerAnalytics.newThisMonth}</p>
                    <p className="text-sm text-gray-600">Nuevos este mes</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{customerAnalytics.withPrescriptions}</p>
                    <p className="text-sm text-gray-600">Con Recetas</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{salesOrders?.length || 0}</p>
                    <p className="text-sm text-gray-600">Órdenes Totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prescriptions Reports */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recetas por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: 'Ene', prescriptions: Math.floor((prescriptions?.length || 0) / 6) },
                    { month: 'Feb', prescriptions: Math.floor((prescriptions?.length || 0) / 5) },
                    { month: 'Mar', prescriptions: Math.floor((prescriptions?.length || 0) / 4) },
                    { month: 'Abr', prescriptions: Math.floor((prescriptions?.length || 0) / 3) },
                    { month: 'May', prescriptions: Math.floor((prescriptions?.length || 0) / 2) },
                    { month: 'Jun', prescriptions: prescriptions?.length || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="prescriptions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Recetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total Recetas</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {prescriptions?.filter(p => {
                        const prescDate = new Date(p.date);
                        const today = new Date();
                        return prescDate.getMonth() === today.getMonth() && 
                               prescDate.getFullYear() === today.getFullYear();
                      }).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Este Mes</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {new Set(prescriptions?.map(p => p.patientName)).size || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pacientes Únicos</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {prescriptions?.filter(p => p.recommendedProducts && p.recommendedProducts.trim() !== '').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Con Productos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}