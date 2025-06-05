import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useApi";
import { DollarSign, ShoppingCart, RefreshCw, Calendar, Clock, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-2">Resumen general de tu óptica</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
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

  const metricCards = [
    {
      title: "Ventas del Mes",
      value: `$${dashboardData?.totalSales?.toLocaleString() ?? '0'}`,
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Pedidos Pendientes",
      value: dashboardData?.pendingOrders?.toString() ?? '0',
      icon: ShoppingCart,
      color: "blue"
    },
    {
      title: "Consignaciones Activas",
      value: dashboardData?.activeConsignments?.toString() ?? '0',
      icon: RefreshCw,
      color: "amber"
    },
    {
      title: "Citas Hoy",
      value: dashboardData?.todayAppointments?.toString() ?? '0',
      icon: Calendar,
      color: "purple"
    }
  ];

  // Mock recent activity data - in real app this would come from API
  const recentOrders = [
    { id: 'PED-001', client: 'María González', status: 'En Proceso', amount: '$450' },
    { id: 'PED-002', client: 'Juan Pérez', status: 'Entregado', amount: '$280' },
    { id: 'PED-003', client: 'Ana Martín', status: 'Nuevo', amount: '$690' }
  ];

  const todayAppointments = [
    { time: '09:00', patient: 'Carlos López', type: 'Consulta' },
    { time: '10:30', patient: 'Laura Silva', type: 'Entrega' },
    { time: '14:00', patient: 'Roberto Díaz', type: 'Revisión' },
    { time: '16:30', patient: 'Carmen Ruiz', type: 'Consulta' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-2">Resumen general de tu óptica</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 bg-${metric.color}-100 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{order.id}</p>
                    <p className="text-sm text-slate-600">{order.client}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                      order.status === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Citas del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{appointment.patient}</p>
                      <p className="text-sm text-slate-600">{appointment.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{appointment.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
