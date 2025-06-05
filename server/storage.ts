import {
  users,
  products,
  patients,
  appointments,
  salesOrders,
  salesOrderItems,
  purchaseOrders,
  purchaseOrderItems,
  consignments,
  prescriptions,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type SalesOrder,
  type InsertSalesOrder,
  type SalesOrderItem,
  type InsertSalesOrderItem,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type InsertPurchaseOrderItem,
  type Consignment,
  type InsertConsignment,
  type Prescription,
  type InsertPrescription,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Sales Orders
  getSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: number): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: number, order: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(id: number): Promise<boolean>;

  // Sales Order Items
  getSalesOrderItems(salesOrderId: number): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;
  deleteSalesOrderItem(id: number): Promise<boolean>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Purchase Order Items
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;

  // Consignments
  getConsignments(): Promise<Consignment[]>;
  getConsignment(id: number): Promise<Consignment | undefined>;
  createConsignment(consignment: InsertConsignment): Promise<Consignment>;
  updateConsignment(id: number, consignment: Partial<InsertConsignment>): Promise<Consignment | undefined>;
  deleteConsignment(id: number): Promise<boolean>;

  // Prescriptions
  getPrescriptions(): Promise<Prescription[]>;
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: number): Promise<boolean>;

  // Dashboard data
  getDashboardData(): Promise<{
    totalSales: number;
    pendingOrders: number;
    activeConsignments: number;
    todayAppointments: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private patients: Map<number, Patient> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private salesOrders: Map<number, SalesOrder> = new Map();
  private salesOrderItems: Map<number, SalesOrderItem> = new Map();
  private purchaseOrders: Map<number, PurchaseOrder> = new Map();
  private purchaseOrderItems: Map<number, PurchaseOrderItem> = new Map();
  private consignments: Map<number, Consignment> = new Map();
  private prescriptions: Map<number, Prescription> = new Map();
  private currentId: number = 1;

  constructor() {
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Administrador"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentId++;
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existing = this.patients.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patientUpdate };
    this.patients.set(id, updated);
    return updated;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...appointmentUpdate };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: number): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(insertSalesOrder: InsertSalesOrder): Promise<SalesOrder> {
    const id = this.currentId++;
    const salesOrder: SalesOrder = { ...insertSalesOrder, id };
    this.salesOrders.set(id, salesOrder);
    return salesOrder;
  }

  async updateSalesOrder(id: number, orderUpdate: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const existing = this.salesOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...orderUpdate };
    this.salesOrders.set(id, updated);
    return updated;
  }

  async deleteSalesOrder(id: number): Promise<boolean> {
    return this.salesOrders.delete(id);
  }

  // Sales Order Items
  async getSalesOrderItems(salesOrderId: number): Promise<SalesOrderItem[]> {
    return Array.from(this.salesOrderItems.values()).filter(item => item.salesOrderId === salesOrderId);
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const id = this.currentId++;
    const item: SalesOrderItem = { ...insertItem, id };
    this.salesOrderItems.set(id, item);
    return item;
  }

  async deleteSalesOrderItem(id: number): Promise<boolean> {
    return this.salesOrderItems.delete(id);
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertPurchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.currentId++;
    const purchaseOrder: PurchaseOrder = { ...insertPurchaseOrder, id };
    this.purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: number, orderUpdate: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const existing = this.purchaseOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...orderUpdate };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values()).filter(item => item.purchaseOrderId === purchaseOrderId);
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = this.currentId++;
    const item: PurchaseOrderItem = { ...insertItem, id };
    this.purchaseOrderItems.set(id, item);
    return item;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    return this.purchaseOrderItems.delete(id);
  }

  // Consignments
  async getConsignments(): Promise<Consignment[]> {
    return Array.from(this.consignments.values());
  }

  async getConsignment(id: number): Promise<Consignment | undefined> {
    return this.consignments.get(id);
  }

  async createConsignment(insertConsignment: InsertConsignment): Promise<Consignment> {
    const id = this.currentId++;
    const consignment: Consignment = { ...insertConsignment, id };
    this.consignments.set(id, consignment);
    return consignment;
  }

  async updateConsignment(id: number, consignmentUpdate: Partial<InsertConsignment>): Promise<Consignment | undefined> {
    const existing = this.consignments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...consignmentUpdate };
    this.consignments.set(id, updated);
    return updated;
  }

  async deleteConsignment(id: number): Promise<boolean> {
    return this.consignments.delete(id);
  }

  // Prescriptions
  async getPrescriptions(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values());
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentId++;
    const prescription: Prescription = { ...insertPrescription, id };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescription(id: number, prescriptionUpdate: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const existing = this.prescriptions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...prescriptionUpdate };
    this.prescriptions.set(id, updated);
    return updated;
  }

  async deletePrescription(id: number): Promise<boolean> {
    return this.prescriptions.delete(id);
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    totalSales: number;
    pendingOrders: number;
    activeConsignments: number;
    todayAppointments: number;
  }> {
    const salesOrders = Array.from(this.salesOrders.values());
    const consignments = Array.from(this.consignments.values());
    const appointments = Array.from(this.appointments.values());
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalSales: salesOrders.reduce((sum, order) => sum + Number(order.total), 0),
      pendingOrders: salesOrders.filter(order => order.status === 'nuevo' || order.status === 'en_proceso').length,
      activeConsignments: consignments.filter(c => c.status === 'activa').length,
      todayAppointments: appointments.filter(a => a.date === today && a.status !== 'cancelada').length,
    };
  }
}

export const storage = new MemStorage();
