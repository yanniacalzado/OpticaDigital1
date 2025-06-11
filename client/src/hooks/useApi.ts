import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  Product, InsertProduct,
  Patient, InsertPatient,
  Appointment, InsertAppointment,
  SalesOrder, InsertSalesOrder,
  PurchaseOrder, InsertPurchaseOrder,
  Consignment, InsertConsignment,
  Prescription, InsertPrescription
} from "@shared/schema";

// Dashboard
export function useDashboardData() {
  return useQuery({
    queryKey: ["/api/dashboard"],
  });
}

// Products
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product }: { id: number; product: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

// Patients
export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: InsertPatient) => {
      const response = await apiRequest("POST", "/api/patients", patient);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
  });
}

// Appointments
export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", appointment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

// Sales Orders
export function useSalesOrders() {
  return useQuery<SalesOrder[]>({
    queryKey: ["/api/sales-orders"],
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: InsertSalesOrder) => {
      const response = await apiRequest("POST", "/api/sales-orders", order);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

// Purchase Orders
export function usePurchaseOrders() {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: InsertPurchaseOrder) => {
      const response = await apiRequest("POST", "/api/purchase-orders", order);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...order }: { id: number } & Partial<InsertPurchaseOrder>) => {
      const response = await apiRequest("PUT", `/api/purchase-orders/${id}`, order);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/purchase-orders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
  });
}

// Consignments
export function useConsignments() {
  return useQuery<Consignment[]>({
    queryKey: ["/api/consignments"],
  });
}

export function useCreateConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consignment: InsertConsignment) => {
      const response = await apiRequest("POST", "/api/consignments", consignment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

// Prescriptions
export function usePrescriptions() {
  return useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prescription: InsertPrescription) => {
      const response = await apiRequest("POST", "/api/prescriptions", prescription);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
    },
  });
}
