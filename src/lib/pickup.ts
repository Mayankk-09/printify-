import { prisma } from "./prisma";

export type PickupSlot = {
  value: string;
  label: string;
  start: string;
  end: string;
};

export function getDefaultSlots(): PickupSlot[] {
  return [
    { value: "09:00-10:40", label: "09:00 AM - 10:40 AM", start: "09:00", end: "10:40" },
    { value: "10:40-12:20", label: "10:40 AM - 12:20 PM", start: "10:40", end: "12:20" },
    { value: "12:20-14:00", label: "12:20 PM - 02:00 PM", start: "12:20", end: "14:00" },
    { value: "14:00-15:40", label: "02:00 PM - 03:40 PM", start: "14:00", end: "15:40" },
    { value: "15:40-17:20", label: "03:40 PM - 05:20 PM", start: "15:40", end: "17:20" },
  ];
}

export function parseSlots(slotsStr: string): PickupSlot[] {
  return slotsStr.split(",").map((s) => {
    const trimmed = s.trim();
    const [start, end] = trimmed.split("-");
    const format12 = (t: string) => {
      const [h, m] = t.split(":");
      const hNum = parseInt(h, 10);
      const ampm = hNum >= 12 ? "PM" : "AM";
      const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
      return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
    };
    return {
      value: trimmed,
      label: `${format12(start)} - ${format12(end)}`,
      start,
      end,
    };
  });
}

export function getSlotLabel(slots: PickupSlot[], value: string): string {
  return slots.find((s) => s.value === value)?.label || value;
}

export function isValidSlot(slots: PickupSlot[], value: string): boolean {
  return slots.some((s) => s.value === value);
}

export function getWorkingDays(workingDaysStr: string): number[] {
  return workingDaysStr.split(",").map((d) => parseInt(d.trim(), 10)).filter((n) => !isNaN(n));
}

export function getEarliestPickupDate(cutoffTime: string, now: Date = new Date()): Date {
  const earliest = new Date(now);
  // Pickup is always available starting tomorrow, regardless of cutoff time
  earliest.setDate(earliest.getDate() + 1);
  earliest.setHours(0, 0, 0, 0);
  return earliest;
}

export function getAvailableDates(
  earliestDate: Date,
  maxAdvanceDays: number,
  workingDays: number[],
  maxDays: number = 14
): Date[] {
  const dates: Date[] = [];
  const current = new Date(earliestDate);
  
  for (let i = 0; i < maxDays && dates.length < maxAdvanceDays; i++) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ...
    if (workingDays.includes(dayOfWeek)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export async function getPickupSettings() {
  const settings = await prisma.pickupSetting.findFirst();
  if (!settings) {
    return {
      cutoffTime: "14:00",
      maxAdvanceDays: 7,
      workingDays: [1, 2, 3, 4, 5, 6],
      slots: getDefaultSlots(),
    };
  }
  return {
    cutoffTime: settings.cutoffTime,
    maxAdvanceDays: settings.maxAdvanceDays,
    workingDays: getWorkingDays(settings.workingDays),
    slots: parseSlots(settings.slots),
  };
}

export function formatDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatDateFull(date: Date): string {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
