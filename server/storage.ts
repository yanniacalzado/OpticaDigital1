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
import { db } from "./db";
import { eq, count } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(productUpdate).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db.update(patients).set(patientUpdate).where(eq(patients.id, id)).returning();
    return updated || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return result.rowCount > 0;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments).set(appointmentUpdate).where(eq(appointments.id, id)).returning();
    return updated || undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders);
  }

  async getSalesOrder(id: number): Promise<SalesOrder | undefined> {
    const [salesOrder] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return salesOrder || undefined;
  }

  async createSalesOrder(insertSalesOrder: InsertSalesOrder): Promise<SalesOrder> {
    const [salesOrder] = await db.insert(salesOrders).values(insertSalesOrder).returning();
    return salesOrder;
  }

  async updateSalesOrder(id: number, orderUpdate: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const [updated] = await db.update(salesOrders).set(orderUpdate).where(eq(salesOrders.id, id)).returning();
    return updated || undefined;
  }

  async deleteSalesOrder(id: number): Promise<boolean> {
    const result = await db.delete(salesOrders).where(eq(salesOrders.id, id));
    return result.rowCount > 0;
  }

  // Sales Order Items
  async getSalesOrderItems(salesOrderId: number): Promise<SalesOrderItem[]> {
    return await db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, salesOrderId));
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const [item] = await db.insert(salesOrderItems).values(insertItem).returning();
    return item;
  }

  async deleteSalesOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(salesOrderItems).where(eq(salesOrderItems.id, id));
    return result.rowCount > 0;
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders);
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [purchaseOrder] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return purchaseOrder || undefined;
  }

  async createPurchaseOrder(insertPurchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [purchaseOrder] = await db.insert(purchaseOrders).values(insertPurchaseOrder).returning();
    return purchaseOrder;
  }

  async updatePurchaseOrder(id: number, orderUpdate: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updated] = await db.update(purchaseOrders).set(orderUpdate).where(eq(purchaseOrders.id, id)).returning();
    return updated || undefined;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return result.rowCount > 0;
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [item] = await db.insert(purchaseOrderItems).values(insertItem).returning();
    return item;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return result.rowCount > 0;
  }

  // Consignments
  async getConsignments(): Promise<Consignment[]> {
    return await db.select().from(consignments);
  }

  async getConsignment(id: number): Promise<Consignment | undefined> {
    const [consignment] = await db.select().from(consignments).where(eq(consignments.id, id));
    return consignment || undefined;
  }

  async createConsignment(insertConsignment: InsertConsignment): Promise<Consignment> {
    const [consignment] = await db.insert(consignments).values(insertConsignment).returning();
    return consignment;
  }

  async updateConsignment(id: number, consignmentUpdate: Partial<InsertConsignment>): Promise<Consignment | undefined> {
    const [updated] = await db.update(consignments).set(consignmentUpdate).where(eq(consignments.id, id)).returning();
    return updated || undefined;
  }

  async deleteConsignment(id: number): Promise<boolean> {
    const result = await db.delete(consignments).where(eq(consignments.id, id));
    return result.rowCount > 0;
  }

  // Prescriptions
  async getPrescriptions(): Promise<Prescription[]> {
    return await db.select().from(prescriptions);
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription || undefined;
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(insertPrescription).returning();
    return prescription;
  }

  async updatePrescription(id: number, prescriptionUpdate: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updated] = await db.update(prescriptions).set(prescriptionUpdate).where(eq(prescriptions.id, id)).returning();
    return updated || undefined;
  }

  async deletePrescription(id: number): Promise<boolean> {
    const result = await db.delete(prescriptions).where(eq(prescriptions.id, id));
    return result.rowCount > 0;
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    totalSales: number;
    pendingOrders: number;
    activeConsignments: number;
    todayAppointments: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [totalSalesResult] = await db.select({ count: count() }).from(salesOrders);
    const [pendingOrdersResult] = await db.select({ count: count() }).from(salesOrders).where(eq(salesOrders.status, 'nuevo'));
    const [activeConsignmentsResult] = await db.select({ count: count() }).from(consignments).where(eq(consignments.status, 'activa'));
    const [todayAppointmentsResult] = await db.select({ count: count() }).from(appointments).where(eq(appointments.date, today));

    return {
      totalSales: totalSalesResult.count,
      pendingOrders: pendingOrdersResult.count,
      activeConsignments: activeConsignmentsResult.count,
      todayAppointments: todayAppointmentsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();