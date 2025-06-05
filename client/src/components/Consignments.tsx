import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";

export function Consignments() {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Consignaciones</h2>
          <p className="text-slate-600 mt-2">Gestión de productos en consignación</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Telko
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Consignación
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Sistema de consignaciones en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">Incluirá integración con API de Telko</p>
        </CardContent>
      </Card>
    </div>
  );
}
