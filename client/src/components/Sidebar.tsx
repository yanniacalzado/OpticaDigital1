import { useState } from "react";
import { Link, useLocation } from "wouter";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  id: string;
  name: string;
  icon: keyof typeof LucideIcons;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'BarChart3', path: '/' },
  { id: 'products', name: 'Productos', icon: 'Package', path: '/products' },
  { id: 'patients', name: 'Pacientes', icon: 'Users', path: '/patients' },
  { id: 'appointments', name: 'Citas', icon: 'Calendar', path: '/appointments' },
  { id: 'sales', name: 'Ventas', icon: 'ShoppingCart', path: '/sales' },
  { id: 'purchases', name: 'Compras', icon: 'Truck', path: '/purchases' },
  { id: 'consignments', name: 'Consignaciones', icon: 'RefreshCw', path: '/consignments' },
  { id: 'pos', name: 'POS', icon: 'CreditCard', path: '/pos' },
  { id: 'prescriptions', name: 'Recetas', icon: 'FileText', path: '/prescriptions' },
  { id: 'reports', name: 'Reportes', icon: 'PieChart', path: '/reports' },
  { id: 'settings', name: 'Ajustes', icon: 'Settings', path: '/settings' }
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <h1 className="text-xl font-bold text-primary-foreground">OptiManager</h1>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item) => {
            const IconComponent = LucideIcons[item.icon] as any;
            const isActive = location === item.path;
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-6 py-3 h-auto transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent size={20} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
