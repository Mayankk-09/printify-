import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const packSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().int().min(0, "Price cannot be negative"),
  pages: z.number().int().positive("Pages must be positive"),
  packType: z.enum(["BW_ONLY", "BW_AND_COLOR"]),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const addonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().int().min(0, "Price cannot be negative"),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const orderSchema = z.object({
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().optional(),
  pages: z.number().int().positive(),
  copies: z.number().int().min(1).max(10),
  printablePages: z.number().int().positive(),
  printMode: z.enum(["BW", "COLOR"]),
  printSide: z.enum(["SINGLE", "DOUBLE"]),
  addonIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupSlot: z.string().optional(),
});

export const paymentVerificationSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const pickupSettingsSchema = z.object({
  cutoffTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  maxAdvanceDays: z.number().int().min(1).max(30),
  workingDays: z.array(z.number().int().min(0).max(6)).min(1),
  slots: z.array(z.string()).min(1),
});
