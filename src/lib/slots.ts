export interface PickupSlot {
  value: string;
  label: string;
  start: string;
  end: string;
}

export const PICKUP_SLOTS: PickupSlot[] = [
  { value: "09:00-10:40", label: "09:00 AM - 10:40 AM", start: "09:00", end: "10:40" },
  { value: "10:40-12:20", label: "10:40 AM - 12:20 PM", start: "10:40", end: "12:20" },
  { value: "12:20-14:00", label: "12:20 PM - 02:00 PM", start: "12:20", end: "14:00" },
  { value: "14:00-15:40", label: "02:00 PM - 03:40 PM", start: "14:00", end: "15:40" },
  { value: "15:40-17:20", label: "03:40 PM - 05:20 PM", start: "15:40", end: "17:20" },
];

export const PICKUP_SLOT_VALUES = PICKUP_SLOTS.map((s) => s.value);
export const PICKUP_SLOT_LABELS = PICKUP_SLOTS.map((s) => s.label);

export function getSlotLabel(value: string): string {
  return PICKUP_SLOTS.find((s) => s.value === value)?.label || value;
}

export function isValidSlot(value: string): boolean {
  return PICKUP_SLOT_VALUES.includes(value);
}

export function getSlotOptions() {
  return PICKUP_SLOTS.map((s) => ({ value: s.value, label: s.label }));
}
