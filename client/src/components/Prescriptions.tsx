import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function Prescriptions() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Gestión de Recetas</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Sistema de recetas ópticas en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">
            Gestión de recetas vinculadas a pacientes y productos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
