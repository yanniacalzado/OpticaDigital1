import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProducts, usePatients, useCreateSalesOrder } from "@/hooks/useApi";
import { Search, ShoppingCart, Plus, Trash2, CreditCard, Receipt, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const createSalesOrder = useCreateSalesOrder();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    return products?.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [products, searchTerm]);

  const filteredCustomers = useMemo(() => {
    return patients?.filter(patient => 
      patient.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      patient.email.toLowerCase().includes(customerSearch.toLowerCase())
    ) || [];
  }, [patients, customerSearch]);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        code: product.code,
        price: parseFloat(product.price),
        quantity: 1,
        subtotal: parseFloat(product.price)
      }]);
    }

    toast({
      title: "Producto agregado",
      description: `${product.name} añadido al carrito`,
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agregue productos al carrito antes de procesar la venta",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Cliente requerido",
        description: "Seleccione un cliente para procesar la venta",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderNumber = `POS-${Date.now()}`;
      const selectedPatient = patients?.find(p => p.id.toString() === selectedCustomer);
      
      await createSalesOrder.mutateAsync({
        orderNumber,
        patientId: parseInt(selectedCustomer),
        customerName: selectedPatient?.name || "Cliente",
        total: calculateTotal().toString(),
        status: "completada",
        date: new Date().toISOString().split('T')[0],
        notes: `Venta POS - ${cart.length} productos`,
      });

      // Print receipt (simulation)
      printReceipt();

      // Clear cart and customer
      setCart([]);
      setSelectedCustomer("");
      setCustomerSearch("");

      toast({
        title: "Venta procesada",
        description: `Orden ${orderNumber} completada exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la venta",
        variant: "destructive",
      });
    }
  };

  const printReceipt = () => {
    const receiptContent = `
    ===== TICKET DE VENTA =====
    
    Cliente: ${patients?.find(p => p.id.toString() === selectedCustomer)?.name || "Cliente"}
    Fecha: ${new Date().toLocaleString()}
    
    PRODUCTOS:
    ${cart.map(item => 
      `${item.name} (${item.code})
       Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}`
    ).join('\n    ')}
    
    ------------------------
    TOTAL: $${calculateTotal().toFixed(2)}
    ========================
    
    ¡Gracias por su compra!
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Ticket de Venta</title></head>
          <body style="font-family: monospace; white-space: pre-line; margin: 20px;">
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (productsLoading || patientsLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Punto de Venta</h1>
          <p className="text-slate-600 mt-1">
            Sistema ágil para ventas rápidas con impresión de tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Seleccionar Productos
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.code}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 capitalize">
                        {product.category.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-blue-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge 
                        variant={product.stock > 10 ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout Section */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} - {patient.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Carrito ({cart.length})</span>
                <Calculator className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.code}</p>
                        <p className="text-sm font-bold text-blue-600">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    El carrito está vacío
                  </p>
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={handleCheckout}
                      disabled={createSalesOrder.isPending || cart.length === 0 || !selectedCustomer}
                      className="w-full"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Procesar Venta
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCart([])}
                      className="w-full"
                    >
                      Limpiar Carrito
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}