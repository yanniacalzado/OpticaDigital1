import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Configuración del Sistema</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <SettingsIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Panel de configuración en desarrollo</p>
          <p className="text-sm text-slate-500 mt-2">
            Gestión de usuarios, roles y configuración general
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
