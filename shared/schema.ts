import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("vendedor"), // admin, vendedor
  name: text("name").notNull(),
  status: text("status").notNull().default("activo"), // activo, inactivo
});

// Products table - Maestro de productos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Código único de producto
  name: text("name").notNull(),
  category: text("category").notNull(), // armazones, lentes, lentes_contacto, accesorios
  supplier: text("supplier").notNull(),
  stock: integer("stock").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockStatus: text("stock_status").notNull().default("normal"), // normal, bajo, critico
  type: text("type").notNull().default("propio"), // propio, consignacion
  status: text("status").notNull().default("activo"), // activo, inactivo
});

// Patients table - Registro y gestión de pacientes
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("activo"), // activo, inactivo
  notes: text("notes"),
});

// Appointments table - Agenda de citas
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  patientName: text("patient_name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(), // examen_visual, consulta, control, entrega
  doctorName: text("doctor_name"),
  status: text("status").notNull().default("pendiente"), // pendiente, confirmada, cancelada
  notes: text("notes"),
});

// Sales orders table - Gestión de Pedidos
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
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Purchase orders table - Órdenes de Compra
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
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Consignments table - Consignaciones MVP Manual
export const consignments = pgTable("consignments", {
  id: serial("id").primaryKey(),
  supplier: text("supplier").notNull(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(), // armazones, lentes, lentes_contacto, accesorios
  quantity: integer("quantity").notNull(),
  receivedDate: text("received_date").notNull(),
  returnDate: text("return_date"),
  expirationDate: text("expiration_date"),
  status: text("status").notNull().default("activa"), // activa, devuelta, vendida
  notes: text("notes"),
});

// Prescriptions table - Recetas ópticas
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id),
  patientName: text("patient_name").notNull(),
  date: text("date").notNull(),
  professional: text("professional").notNull(),
  rightEyeSphere: text("right_eye_sphere"),
  rightEyeCylinder: text("right_eye_cylinder"),
  rightEyeAxis: text("right_eye_axis"),
  leftEyeSphere: text("left_eye_sphere"),
  leftEyeCylinder: text("left_eye_cylinder"),
  leftEyeAxis: text("left_eye_axis"),
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
