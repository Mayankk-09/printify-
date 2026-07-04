import { getDefaultSlots, parseSlots, getSlotLabel as getSlotLabelFromPickup, isValidSlot as isValidSlotFromPickup, getPickupSettings, getAvailableDates, getEarliestPickupDate, formatDate, formatDateFull } from "./pickup";
export type { PickupSlot } from "./pickup";

// Re-export for advanced usage
export { getDefaultSlots as getPickupSlots, parseSlots, getPickupSettings, getAvailableDates, getEarliestPickupDate, formatDate, formatDateFull };

// Convenience functions using default slots (backward compatible with old codebase)

const defaultSlots = getDefaultSlots();

export function getSlotOptions() {
  return defaultSlots.map((s) => ({ value: s.value, label: s.label }));
}

export function getSlotLabel(value: string): string {
  return getSlotLabelFromPickup(defaultSlots, value);
}

export function isValidSlot(value: string): boolean {
  return isValidSlotFromPickup(defaultSlots, value);
}
