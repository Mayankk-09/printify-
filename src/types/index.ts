import { UserRole, OrderStatus, PrintMode, PrintSide, PaymentStatus } from "@prisma/client";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};

export type OrderWithUser = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  fileName: string;
  filePath: string;
  pages: number;
  copies: number;
  printMode: PrintMode;
  printSide: PrintSide;
  addons: Record<string, boolean>;
  addonCost: number;
  pickupDate: Date | null;
  pickupSlot: string | null;
  submittedAt: Date;
  readyAt: Date | null;
  collectedAt: Date | null;
  createdAt: Date;
  user: { name: string; email: string; phone: string | null };
  pickupCode?: { code: string } | null;
};

export type DashboardMetrics = {
  activeSubscribers: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  ordersToday: number;
  pagesPrintedToday: number;
  totalPagesPrinted: number;
  totalStudents: number;
  revenueBreakdown: { subscription: number; addons: number };
  costBreakdown: { printing: number; stationery: number };
  ordersByStatus: Record<string, number>;
};

export type PlanWithStatus = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  pagesIncluded: number;
  supportsColor: boolean;
  validityDays: number;
  active: boolean;
  displayOrder: number;
  isCurrentPlan?: boolean;
};

import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
