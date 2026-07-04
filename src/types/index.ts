import type {
  UserRole,
  OrderStatus,
  PrintMode,
  PrintSide,
  PaymentStatus,
  PackType,
  User,
  Pack,
  Addon,
  Subscription,
  Order,
  OrderAddon,
  OrderPack,
  Payment,
  PickupCode,
  PickupSetting,
  UploadedFile,
  SystemSetting,
} from "@prisma/client";

export type {
  UserRole,
  OrderStatus,
  PrintMode,
  PrintSide,
  PaymentStatus,
  PackType,
  User,
  Pack,
  Addon,
  Subscription,
  Order,
  OrderAddon,
  OrderPack,
  Payment,
  PickupCode,
  PickupSetting,
  UploadedFile,
  SystemSetting,
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};
