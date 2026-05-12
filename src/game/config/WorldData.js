/**
 * WorldData — Area definitions and world status utilities
 */

import { TRASH_CATEGORIES } from "./TrashData";

export const AREA_DEFINITIONS = {
  taman_kota: {
    id: "taman_kota",
    name: "Taman Kota",
    description: "Taman hijau di pusat kota dengan bangku dan air mancur",
    baseClean: 45,
    color: "#3a6b32",
  },
  kota: {
    id: "kota",
    name: "Kota Kecil",
    description: "Pusat kota dengan rumah-rumah dan toko",
    baseClean: 50,
    color: "#8b7355",
  },
  sekolah: {
    id: "sekolah",
    name: "Sekolah",
    description: "Sekolah dasar dengan halaman bermain",
    baseClean: 55,
    color: "#4a6fa5",
  },
  hutan: {
    id: "hutan",
    name: "Hutan",
    description: "Hutan rimbun dengan pepohonan besar",
    baseClean: 35,
    color: "#1a5c1a",
  },
  danau: {
    id: "danau",
    name: "Danau",
    description: "Danau jernih dikelilingi pohon willow",
    baseClean: 40,
    color: "#3498db",
  },
  sungai: {
    id: "sungai",
    name: "Sungai",
    description: "Sungai mengalir dari danau ke pantai",
    baseClean: 38,
    color: "#2980b9",
  },
  pantai: {
    id: "pantai",
    name: "Pantai",
    description: "Pantai berpasir dengan ombak kecil",
    baseClean: 30,
    color: "#f0d78c",
  },
  kebun: {
    id: "kebun",
    name: "Kebun",
    description: "Kebun warga dengan sayuran dan bunga",
    baseClean: 60,
    color: "#66a832",
  },
  camping_ground: {
    id: "camping_ground",
    name: "Camping Ground",
    description: "Area camping di dekat hutan",
    baseClean: 42,
    color: "#6d5c3a",
  },
  recycling_facility: {
    id: "recycling_facility",
    name: "Recycling Facility",
    description: "Fasilitas daur ulang dan TPS",
    baseClean: 65,
    color: "#2ecc71",
  },
  area_industri: {
    id: "area_industri",
    name: "Area Industri",
    description: "Pabrik kecil dan gudang",
    baseClean: 25,
    color: "#7f8c8d",
  },
  jembatan: {
    id: "jembatan",
    name: "Jembatan",
    description: "Jembatan kayu melintasi sungai",
    baseClean: 50,
    color: "#8b6914",
  },
};

/**
 * Get world cleanliness average from area data array.
 */
export function getWorldAverage(areas) {
  if (!areas?.length) return 0;
  const sum = areas.reduce((t, a) => t + (a.cleanlinessScore || 0), 0);
  return Math.round(sum / areas.length);
}

/**
 * Normalize inventory from API response to { trashType: quantity } map.
 */
export function normalizeInventory(inventory) {
  const quantities = {};
  Object.keys(TRASH_CATEGORIES).forEach((k) => {
    quantities[k] = 0;
  });
  (inventory || []).forEach((item) => {
    const type = item.trashType || item.itemId?.replace("trash_", "");
    if (type && Object.prototype.hasOwnProperty.call(quantities, type)) {
      quantities[type] += item.quantity || 0;
    }
  });
  return quantities;
}

export function getTotalItems(inventory) {
  return Object.values(normalizeInventory(inventory)).reduce((s, q) => s + q, 0);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
