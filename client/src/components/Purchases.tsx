import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export function Purchases() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Órdenes de Compra</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Truck className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Gestión de compras en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">
            Este módulo permitirá gestionar órdenes de compra a proveedores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
