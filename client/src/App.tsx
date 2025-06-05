import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Products } from "@/components/Products";
import { Patients } from "@/components/Patients";
import { Appointments } from "@/components/Appointments";
import { Sales } from "@/components/Sales";
import { Purchases } from "@/components/Purchases";
import { Consignments } from "@/components/Consignments";
import { POS } from "@/components/POS";
import { Prescriptions } from "@/components/Prescriptions";
import { Reports } from "@/components/Reports";
import { Settings } from "@/components/Settings";
import NotFound from "@/pages/not-found";
import { Menu } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/patients" component={Patients} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/sales" component={Sales} />
      <Route path="/purchases" component={Purchases} />
      <Route path="/consignments" component={Consignments} />
      <Route path="/pos" component={POS} />
      <Route path="/prescriptions" component={Prescriptions} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            {/* Top navigation bar for mobile */}
            <header className="bg-white shadow-sm border-b border-border lg:hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Menu size={24} />
                </Button>
                <h1 className="text-lg font-semibold text-foreground">OptiManager</h1>
                <div className="w-10" /> {/* Spacer for center alignment */}
              </div>
            </header>
            
            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
