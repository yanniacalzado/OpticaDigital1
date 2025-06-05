import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export function Reports() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Reportes y Análisis</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <PieChart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Sistema de reportes en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">
            Reportes de ventas, compras, consignaciones y análisis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
