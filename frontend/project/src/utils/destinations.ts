import { destinations as defaultDestinations } from "@/data";
import { DESTINATIONS_STORAGE_KEY } from "@/constants/storage";
import type { Destination } from "@/interfaces";

export const getAllDestinations = (): Destination[] => {
  try {
    const stored = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    if (!stored) return defaultDestinations;
    const custom: Destination[] = JSON.parse(stored);
    
    // Merge: custom destinations replace default ones with the same ID, or add new ones
    const merged = [...defaultDestinations];
    custom.forEach(c => {
      const idx = merged.findIndex(m => String(m.id) === String(c.id));
      if (idx !== -1) {
        merged[idx] = c;
      } else {
        merged.push(c);
      }
    });
    return merged;
  } catch {
    return defaultDestinations;
  }
};

export const saveDestination = (dest: Destination) => {
  try {
    const stored = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    let custom: Destination[] = stored ? JSON.parse(stored) : [];
    const idx = custom.findIndex(c => String(c.id) === String(dest.id));
    if (idx !== -1) {
      custom[idx] = dest;
    } else {
      custom.push(dest);
    }
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error("Failed to save destination", e);
  }
};

export const deleteDestination = (id: string | number) => {
  try {
    const stored = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    if (!stored) return;
    let custom: Destination[] = JSON.parse(stored);
    custom = custom.filter(c => String(c.id) !== String(id));
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error("Failed to delete destination", e);
  }
};
