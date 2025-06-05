import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("vendedor"), // admin, vendedor
  name: text("name").notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // cristal, montura, lente_contacto, liquido
  description: text("description"),
  buyPrice: decimal("buy_price", { precision: 10, scale: 2 }).notNull(),
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  supplier: text("supplier"),
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  birthDate: text("birth_date"),
  notes: text("notes"),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(), // consulta, entrega, revision
  status: text("status").notNull().default("pendiente"), // pendiente, confirmada, cancelada
  notes: text("notes"),
});

// Sales orders table
export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  patientId: integer("patient_id").references(() => patients.id),
  customerName: text("customer_name").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("nuevo"), // nuevo, en_proceso, entregado, cancelado
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

// Sales order items table
export const salesOrderItems = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  salesOrderId: integer("sales_order_id").references(() => salesOrders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  supplier: text("supplier").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("creada"), // creada, enviada, recibida
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

// Purchase order items table
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Consignments table
export const consignments = pgTable("consignments", {
  id: serial("id").primaryKey(),
  supplier: text("supplier").notNull(),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  receivedDate: text("received_date").notNull(),
  returnDate: text("return_date"),
  status: text("status").notNull().default("activa"), // activa, devuelta, vendida
  notes: text("notes"),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  date: text("date").notNull(),
  professional: text("professional").notNull(),
  rightEye: text("right_eye"),
  leftEye: text("left_eye"),
  observations: text("observations"),
  recommendedProducts: text("recommended_products"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({ id: true });
export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({ id: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export const insertConsignmentSchema = createInsertSchema(consignments).omit({ id: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export type Consignment = typeof consignments.$inferSelect;
export type InsertConsignment = z.infer<typeof insertConsignmentSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
