import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export function POS() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Punto de Venta</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Terminal POS en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">
            Sistema de punto de venta ágil para ventas rápidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
