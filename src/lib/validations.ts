import { z } from "zod";
import { PICKUP_SLOT_VALUES } from "./slots";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  course: z.string().optional(),
  year: z.string().optional(),
});

export const planSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  monthlyPrice: z.number().int().positive(),
  pagesIncluded: z.number().int().positive(),
  supportsColor: z.boolean().default(false),
  validityDays: z.number().int().positive().default(30),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const orderSchema = z.object({
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().optional(),
  pages: z.number().int().positive(),
  copies: z.number().int().min(1).max(10),
  printMode: z.enum(["BW", "COLOR"]),
  printSide: z.enum(["SINGLE", "DOUBLE"]),
  addons: z.record(z.boolean()).default({}),
  notes: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupSlot: z.enum(PICKUP_SLOT_VALUES as [string, ...string[]]).optional(),
});

export const paymentSchema = z.object({
  planId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
