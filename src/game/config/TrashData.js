/**
 * TrashData - trash item definitions, categories, and recycle rules.
 */

export const TRASH_CATEGORIES = {
  plastic: {
    id: "plastic",
    label: "Plastik",
    color: "#57b7ff",
    icon: "P",
    category: "Anorganik",
    recyclable: true,
    stations: ["eco_center", "tps_kota", "city_tps", "sorting_bin_park"],
  },
  paper: {
    id: "paper",
    label: "Kertas",
    color: "#f2d16b",
    icon: "K",
    category: "Anorganik",
    recyclable: true,
    stations: ["eco_center", "tps_kota", "city_tps", "school_sorting", "sorting_bin_park"],
  },
  metal: {
    id: "metal",
    label: "Metal",
    color: "#c9d2dc",
    icon: "M",
    category: "Anorganik",
    recyclable: true,
    stations: ["eco_center", "tps_kota", "city_tps", "school_sorting", "beach_recycle", "sorting_bin_park", "recycling_station"],
  },
  glass: {
    id: "glass",
    label: "Kaca",
    color: "#7be3d8",
    icon: "G",
    category: "Anorganik",
    recyclable: true,
    stations: ["eco_center", "tps_kota", "city_tps", "beach_recycle", "sorting_bin_park", "recycling_station"],
  },
  organic: {
    id: "organic",
    label: "Organik",
    color: "#8cc86f",
    icon: "O",
    category: "Organik",
    recyclable: true,
    stations: ["tps_kota", "city_tps", "sorting_bin_park"],
  },
  electronic: {
    id: "electronic",
    label: "E-Waste",
    color: "#fbbf24",
    icon: "E",
    category: "Limbah Elektronik",
    recyclable: true,
    stations: ["tps_kota", "city_tps", "recycling_station"],
  },
};

export const TRASH_VARIANTS = {
  plastic_bottle: {
    id: "plastic_bottle",
    trashType: "plastic",
    label: "Botol Plastik",
    frame: 0,
    rarity: "common",
    points: 10,
  },
  plastic_bag: {
    id: "plastic_bag",
    trashType: "plastic",
    label: "Kantong Plastik",
    frame: 1,
    rarity: "common",
    points: 8,
  },
  plastic_cup: {
    id: "plastic_cup",
    trashType: "plastic",
    label: "Gelas Plastik",
    frame: 2,
    rarity: "common",
    points: 8,
  },
  plastic_straw: {
    id: "plastic_straw",
    trashType: "plastic",
    label: "Sedotan Plastik",
    frame: 3,
    rarity: "common",
    points: 6,
  },
  snack_wrapper: {
    id: "snack_wrapper",
    trashType: "plastic",
    label: "Bungkus Snack",
    frame: 4,
    rarity: "common",
    points: 8,
  },
  cardboard: {
    id: "cardboard",
    trashType: "paper",
    label: "Kardus Bekas",
    frame: 5,
    rarity: "common",
    points: 10,
  },
  soda_can: {
    id: "soda_can",
    trashType: "metal",
    label: "Kaleng Minuman",
    frame: 6,
    rarity: "common",
    points: 10,
  },
  used_battery: {
    id: "used_battery",
    trashType: "electronic",
    label: "Baterai Bekas",
    frame: 7,
    rarity: "rare",
    points: 20,
  },
  used_mask: {
    id: "used_mask",
    trashType: "plastic",
    label: "Masker Bekas",
    frame: 8,
    rarity: "uncommon",
    points: 12,
  },
  organic_waste: {
    id: "organic_waste",
    trashType: "organic",
    label: "Sampah Organik",
    frame: 9,
    rarity: "common",
    points: 8,
  },
  cigarette_butt: {
    id: "cigarette_butt",
    trashType: "organic",
    label: "Puntung Rokok",
    frame: 10,
    rarity: "uncommon",
    points: 12,
  },
  glass_bottle: {
    id: "glass_bottle",
    trashType: "glass",
    label: "Botol Kaca",
    frame: 11,
    rarity: "uncommon",
    points: 15,
  },
  styrofoam: {
    id: "styrofoam",
    trashType: "plastic",
    label: "Styrofoam",
    frame: 12,
    rarity: "uncommon",
    points: 12,
  },
  broken_cable: {
    id: "broken_cable",
    trashType: "electronic",
    label: "Kabel Rusak",
    frame: 13,
    rarity: "uncommon",
    points: 14,
  },
  broken_electronics: {
    id: "broken_electronics",
    trashType: "electronic",
    label: "Elektronik Rusak",
    frame: 14,
    rarity: "rare",
    points: 25,
  },
  scrap_metal: {
    id: "scrap_metal",
    trashType: "metal",
    label: "Besi Rongsok",
    frame: 15,
    rarity: "rare",
    points: 20,
  },
  crumpled_paper: {
    id: "crumpled_paper",
    trashType: "paper",
    label: "Kertas Kusut",
    frame: 5,
    rarity: "common",
    points: 8,
  },
  banana_peel: {
    id: "banana_peel",
    trashType: "organic",
    label: "Kulit Pisang",
    frame: 9,
    rarity: "common",
    points: 8,
  },
  old_tire: {
    id: "old_tire",
    trashType: "plastic",
    label: "Ban Bekas",
    frame: 15,
    rarity: "rare",
    points: 25,
  },
  fishing_net: {
    id: "fishing_net",
    trashType: "plastic",
    label: "Jaring Ikan",
    frame: 13,
    rarity: "rare",
    points: 20,
  },
};

export const STATION_DEFINITIONS = {
  eco_center: {
    id: "eco_center",
    label: "Eco Center",
    frame: 0,
    areaId: "taman_kota",
    accepts: ["plastic", "paper", "metal", "glass"],
    rewardMultiplier: 1.0,
  },
  tps_kota: {
    id: "tps_kota",
    label: "TPS Kota",
    frame: 1,
    areaId: "recycling_facility",
    accepts: ["organic", "plastic", "paper", "metal", "glass", "electronic"],
    rewardMultiplier: 0.8,
  },
  city_tps: {
    id: "city_tps",
    label: "TPS Kota",
    frame: 1,
    areaId: "industry",
    accepts: ["organic", "plastic", "paper", "metal", "glass", "electronic"],
    rewardMultiplier: 0.8,
  },
  school_sorting: {
    id: "school_sorting",
    label: "Tempat Pilah Sekolah",
    frame: 1,
    areaId: "school",
    accepts: ["paper", "plastic", "metal"],
    rewardMultiplier: 0.9,
  },
  beach_recycle: {
    id: "beach_recycle",
    label: "Recycle Pantai",
    frame: 0,
    areaId: "beach",
    accepts: ["plastic", "glass", "metal"],
    rewardMultiplier: 1.05,
  },
  sorting_bin_park: {
    id: "sorting_bin_park",
    label: "Tempat Sampah Terpilah",
    frame: 1,
    areaId: "taman_kota",
    accepts: ["plastic", "paper", "metal", "glass", "organic"],
    rewardMultiplier: 0.6,
  },
  recycling_station: {
    id: "recycling_station",
    label: "Recycling Station",
    frame: 0,
    areaId: "recycling_facility",
    accepts: ["plastic", "metal", "glass", "electronic"],
    rewardMultiplier: 1.2,
  },
};

export function canRecycleAt(trashType, stationId) {
  const station = STATION_DEFINITIONS[stationId];
  if (!station) return false;
  return station.accepts.includes(trashType);
}

export function calculateRecycleReward(variantId, stationId) {
  const variant = TRASH_VARIANTS[variantId];
  const station = STATION_DEFINITIONS[stationId];
  if (!variant || !station) return 0;

  const basePoints = variant.points;
  const multiplier = station.rewardMultiplier;
  const rarityBonus = variant.rarity === "rare" ? 2 : variant.rarity === "uncommon" ? 1.5 : 1;

  return Math.round(basePoints * multiplier * rarityBonus);
}
