import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData, useProducts, useAppointments, useSalesOrders } from "@/hooks/useApi";
import { DollarSign, ShoppingCart, RefreshCw, Calendar, Clock, Eye, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: salesOrders, isLoading: salesLoading } = useSalesOrders();

  const isLoading = dashboardLoading || productsLoading || appointmentsLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Panel de Control - Óptica</h2>
          <p className="text-slate-600 mt-2">Acceso rápido a funcionalidades clave</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calcular métricas específicas de la óptica
  const lowStockProducts = products?.filter(p => p.stockStatus === 'bajo' || p.stockStatus === 'critico') || [];
  const totalProducts = products?.length || 0;
  const monthlyRevenue = salesOrders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments?.filter(a => a.date === todayDate) || [];
  const recentOrders = salesOrders?.slice(0, 5) || [];

  const metricCards = [
    {
      title: "Ventas del Mes",
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      description: "Total facturado"
    },
    {
      title: "Pedidos Pendientes", 
      value: dashboardData?.pendingOrders?.toString() ?? '0',
      icon: ShoppingCart,
      color: "blue",
      description: "Por procesar"
    },
    {
      title: "Consignaciones Activas",
      value: dashboardData?.activeConsignments?.toString() ?? '0',
      icon: RefreshCw,
      color: "amber",
      description: "En inventario"
    },
    {
      title: "Citas Hoy",
      value: dashboardData?.todayAppointments?.toString() ?? '0',
      icon: Calendar,
      color: "purple",
      description: "Programadas"
    },
    {
      title: "Productos en Catálogo",
      value: totalProducts.toString(),
      icon: Package,
      color: "indigo",
      description: "Total registrados"
    },
    {
      title: "Stock Crítico",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: lowStockProducts.length > 0 ? "red" : "green",
      description: "Requieren reposición"
    },
    {
      title: "Exámenes Visuales",
      value: appointments?.filter(a => a.type === 'examen_visual').length.toString() ?? '0',
      icon: Eye,
      color: "cyan",
      description: "Total programados"
    },
    {
      title: "Análisis de Ventas",
      value: `${((salesOrders?.filter(s => s.status === 'entregado').length || 0) / Math.max(salesOrders?.length || 1, 1) * 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: "emerald",
      description: "Tasa de conversión"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Panel de Control - Óptica</h2>
        <p className="text-slate-600 mt-2">Acceso rápido a funcionalidades clave (Exámenes visuales, catálogo de productos, análisis de ventas)</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="border border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 bg-${metric.color}-100 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <p className="text-xs text-slate-500">{metric.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ventas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'entregado' ? 'default' :
                      order.status === 'en_proceso' ? 'secondary' :
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-semibold text-slate-900 mt-1">${order.total}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay ventas registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Citas del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length > 0 ? todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                      appointment.type === 'examen_visual' ? 'bg-purple-100' :
                      appointment.type === 'control' ? 'bg-blue-100' :
                      'bg-green-100'
                    }`}>
                      {appointment.type === 'examen_visual' ? (
                        <Eye className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{appointment.patientName}</p>
                      <p className="text-sm text-slate-600 capitalize">{appointment.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">{appointment.time}</span>
                    <Badge variant={appointment.status === 'confirmada' ? 'default' : 'outline'} className="ml-2">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay citas programadas para hoy</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600 capitalize">{product.category.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={product.stockStatus === 'critico' ? 'destructive' : 'secondary'}>
                      {product.stock} en stock
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <Card className="border border-slate-200 mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/products" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-center">Catálogo de Productos</span>
            </a>
            <a href="/appointments" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Eye className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-center">Exámenes Visuales</span>
            </a>
            <a href="/sales" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-center">Análisis de Ventas</span>
            </a>
            <a href="/patients" className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <DollarSign className="h-8 w-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-center">Gestión de Pacientes</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
