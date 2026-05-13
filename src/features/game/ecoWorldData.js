import { resolveGameAssets } from "@/features/game/config/resolveGameAssets";

export const GAME_ASSETS = resolveGameAssets();

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;
export const INVENTORY_CAPACITY = 40;

export const AREA_AUDIO_PROFILES = {
  forest: { ambientVolume: 0.24, footstepVolume: 0.1 },
  lake: { ambientVolume: 0.22, footstepVolume: 0.08 },
  recycling: { ambientVolume: 0.16, footstepVolume: 0.12 },
  garden: { ambientVolume: 0.2, footstepVolume: 0.1 },
  school: { ambientVolume: 0.14, footstepVolume: 0.11 },
  city: { ambientVolume: 0.13, footstepVolume: 0.12 },
  beach: { ambientVolume: 0.25, footstepVolume: 0.07 },
  river: { ambientVolume: 0.23, footstepVolume: 0.08 },
  camping: { ambientVolume: 0.21, footstepVolume: 0.09 },
  industry: { ambientVolume: 0.12, footstepVolume: 0.13 },
  starter_park: { ambientVolume: 0.18, footstepVolume: 0.1 },
};

export function getAreaAudioProfile(areaId) {
  return AREA_AUDIO_PROFILES[areaId] || AREA_AUDIO_PROFILES.starter_park;
}

export const TRASH_META = {
  plastic: { label: "Plastik", icon: "P", color: "#57b7ff", category: "Anorganik" },
  paper: { label: "Kertas", icon: "K", color: "#f2d16b", category: "Anorganik" },
  organic: { label: "Organik", icon: "O", color: "#8cc86f", category: "Organik" },
  glass: { label: "Kaca", icon: "G", color: "#7be3d8", category: "Anorganik" },
  metal: { label: "Kaleng", icon: "M", color: "#c9d2dc", category: "Anorganik" },
};

export const TRASH_VARIANTS = {
  plastic_bottle: { trashType: "plastic", label: "Botol Plastik", frame: 0 },
  plastic_bag: { trashType: "plastic", label: "Kantong Plastik", frame: 1 },
  plastic_cup: { trashType: "plastic", label: "Gelas Plastik", frame: 2 },
  plastic_straw: { trashType: "plastic", label: "Sedotan Plastik", frame: 3 },
  snack_wrapper: { trashType: "plastic", label: "Bungkus Snack", frame: 4 },
  cardboard: { trashType: "paper", label: "Kardus Bekas", frame: 5 },
  soda_can: { trashType: "metal", label: "Kaleng Minuman", frame: 6 },
  used_battery: { trashType: "metal", label: "Baterai Bekas", frame: 7 },
  used_mask: { trashType: "plastic", label: "Masker Bekas", frame: 8 },
  organic_waste: { trashType: "organic", label: "Sampah Organik", frame: 9 },
  cigarette_butt: { trashType: "organic", label: "Puntung Rokok", frame: 10 },
  glass_bottle: { trashType: "glass", label: "Botol Kaca", frame: 11 },
  styrofoam: { trashType: "plastic", label: "Styrofoam", frame: 12 },
  broken_cable: { trashType: "plastic", label: "Kabel Rusak", frame: 13 },
  broken_electronics: { trashType: "metal", label: "Elektronik Rusak", frame: 14 },
  scrap_metal: { trashType: "metal", label: "Besi Rongsok", frame: 15 },
  crumpled_paper: { trashType: "paper", label: "Kertas Kusut", frame: 5 },
  banana_peel: { trashType: "organic", label: "Kulit Pisang", frame: 9 },
  old_tire: { trashType: "plastic", label: "Ban Bekas", frame: 15 },
  fishing_net: { trashType: "plastic", label: "Jaring Ikan", frame: 13 },
};

export const NPC_DIALOGS = {
  prof_eco: {
    role: "Peneliti lingkungan",
    portrait: "PE",
    message: "Selamat datang, EcoWarrior. Dekati sampah atau NPC, lalu tekan E untuk beraksi.",
    quest: "Quest: Bersihkan taman kota dan coba recycle item pertama di Eco Center.",
  },
  guru_maya: {
    role: "Guru sekolah",
    portrait: "GM",
    message: "Sekolah kami sedang belajar memilah kertas dan botol. Bantu anak-anak melihat contohnya.",
    quest: "Quest: Kumpulkan sampah kertas di area sekolah.",
  },
  ranger_adi: {
    role: "Penjaga hutan",
    portrait: "RA",
    message: "Hutan terasa lebih hidup saat tanah bersih. Sampah organik bisa diproses lewat TPS.",
    quest: "Quest: Kurangi sampah di area hutan.",
  },
  nelayan_jaya: {
    role: "Nelayan",
    portrait: "NJ",
    message: "Jaring dan plastik membuat pantai berbahaya untuk biota laut. Tolong bersihkan bibir pantai.",
    quest: "Quest: Bersihkan plastik di pantai.",
  },
  lina: {
    role: "Anak sekolah",
    portrait: "L",
    message: "Aku melihat botol dan kaleng di dekat sekolah. Ayo kumpulkan sebelum hujan turun.",
    quest: "Quest: Ambil satu kaleng atau botol.",
  },
  park_guard: {
    role: "Penjaga taman",
    portrait: "PT",
    message: "Tekan E saat prompt muncul. Kalau prompt tidak muncul, mendekat sedikit lagi.",
    quest: "Quest: Bicara dengan NPC lain di kota.",
  },
  cleaner_bima: {
    role: "Petugas kebersihan",
    portrait: "PB",
    message: "TPS Kota menerima sampah organik dan material recycle. Eco Center fokus pada bahan daur ulang.",
    quest: "Quest: Coba sorting sampah di TPS Kota.",
  },
  vendor_sari: {
    role: "Penjual minuman",
    portrait: "BS",
    message: "Aku mulai memberi diskon untuk warga yang membawa tumbler. Botol sekali pakai harus berkurang.",
    quest: "Quest: Recycle botol plastik di Eco Center.",
  },
  dr_nara: {
    role: "Peneliti lingkungan",
    portrait: "DN",
    message: "Kualitas air sungai naik setiap kali sampah plastik dan kaca dipindahkan dari bantaran sungai.",
    quest: "Quest: Bersihkan area sungai sampai status dunia meningkat.",
  },
};

export const DEFAULT_DIALOG = {
  role: "Warga PixelTerra",
  portrait: "EQ",
  message: "Terima kasih sudah menjaga lingkungan ini.",
  quest: "Quest: Lanjutkan eksplorasi.",
};

export function normalizeInventory(inventory) {
  const quantities = Object.fromEntries(Object.keys(TRASH_META).map((key) => [key, 0]));
  inventory.forEach((item) => {
    const type = item.trashType || item.itemId?.replace("trash_", "");
    if (type && Object.prototype.hasOwnProperty.call(quantities, type)) {
      quantities[type] += item.quantity || 0;
    }
  });
  return quantities;
}

export function getTotalItems(inventory) {
  return Object.values(normalizeInventory(inventory)).reduce((sum, quantity) => sum + quantity, 0);
}

export function getWorldAverage(areas) {
  if (!areas?.length) return 0;
  const sum = areas.reduce((total, area) => total + (area.cleanlinessScore || 0), 0);
  return Math.round(sum / areas.length);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
