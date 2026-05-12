/**
 * NPCData — NPC definitions, dialogs, and quest data
 */

export const NPC_DEFINITIONS = {
  prof_eco: {
    id: "prof_eco",
    name: "Prof. Eco",
    role: "Peneliti Lingkungan",
    frame: 0,
    areaId: "taman_kota",
    portrait: "🔬",
    dialog: [
      {
        message: "Selamat datang di EcoQuest, penjaga lingkungan! Dunia ini butuh bantuanmu.",
        quest: null,
      },
      {
        message: "Sampah plastik butuh 450 tahun untuk terurai. Ayo kumpulkan dan daur ulang!",
        quest: {
          id: "q_collect_plastic",
          title: "Kumpulkan 5 Sampah Plastik",
          type: "collect",
          target: "plastic",
          count: 5,
          reward: 50,
        },
      },
    ],
  },
  guru_maya: {
    id: "guru_maya",
    name: "Guru Maya",
    role: "Guru Sekolah",
    frame: 1,
    areaId: "sekolah",
    portrait: "📚",
    dialog: [
      {
        message: "Anak-anak sedang belajar memilah sampah. Bisa bantu carikan contoh kertas dan botol?",
        quest: {
          id: "q_school_sort",
          title: "Bantu Sekolah: Kumpulkan Kertas",
          type: "collect",
          target: "paper",
          count: 3,
          reward: 30,
        },
      },
    ],
  },
  ranger_hadi: {
    id: "ranger_hadi",
    name: "Ranger Hadi",
    role: "Penjaga Hutan",
    frame: 2,
    areaId: "hutan",
    portrait: "🌲",
    dialog: [
      {
        message: "Hutan ini mulai tercemar. Sampah organik bisa diproses di TPS. Bantu bersihkan area ini!",
        quest: {
          id: "q_forest_clean",
          title: "Bersihkan Hutan",
          type: "area_clean",
          target: "hutan",
          count: 10,
          reward: 80,
        },
      },
    ],
  },
  nelayan_jaya: {
    id: "nelayan_jaya",
    name: "Nelayan Jaya",
    role: "Nelayan",
    frame: 3,
    areaId: "pantai",
    portrait: "🎣",
    dialog: [
      {
        message: "Jaring dan plastik membuat pantai berbahaya untuk biota laut. Tolong bersihkan bibir pantai!",
        quest: {
          id: "q_beach_clean",
          title: "Bersihkan Pantai",
          type: "area_clean",
          target: "pantai",
          count: 8,
          reward: 60,
        },
      },
    ],
  },
  lina: {
    id: "lina",
    name: "Lina",
    role: "Anak Sekolah",
    frame: 4,
    areaId: "sekolah",
    portrait: "🎒",
    dialog: [
      {
        message: "Aku melihat botol dan kaleng di dekat sekolah. Ayo kumpulkan sebelum hujan turun!",
        quest: {
          id: "q_school_pickup",
          title: "Ambil Kaleng di Sekolah",
          type: "collect",
          target: "metal",
          count: 2,
          reward: 20,
        },
      },
    ],
  },
  park_guard: {
    id: "park_guard",
    name: "Pak Agus",
    role: "Penjaga Taman",
    frame: 5,
    areaId: "taman_kota",
    portrait: "🛡️",
    dialog: [
      {
        message: "Dekati sampah atau NPC, lalu tekan E untuk berinteraksi. Selamat menjelajah!",
        quest: null,
      },
    ],
  },
  cleaner_bima: {
    id: "cleaner_bima",
    name: "Bima",
    role: "Petugas Kebersihan",
    frame: 6,
    areaId: "recycling_facility",
    portrait: "🧹",
    dialog: [
      {
        message: "TPS menerima sampah organik. Eco Center fokus pada plastik, kertas, kaleng, dan kaca.",
        quest: {
          id: "q_recycle_first",
          title: "Recycle Item Pertamamu",
          type: "recycle",
          target: "any",
          count: 1,
          reward: 40,
        },
      },
    ],
  },
  penjual_rina: {
    id: "penjual_rina",
    name: "Rina",
    role: "Penjual Minuman",
    frame: 7,
    areaId: "kota",
    portrait: "🧃",
    dialog: [
      {
        message: "Jangan buang botol sembarangan ya! Bawa ke Eco Center untuk didaur ulang.",
        quest: null,
      },
    ],
  },
};

export const DEFAULT_DIALOG = {
  name: "Warga",
  role: "Warga EcoQuest",
  portrait: "🏘️",
  dialog: [
    {
      message: "Terima kasih sudah menjaga lingkungan ini. Lanjutkan eksplorasimu!",
      quest: null,
    },
  ],
};
