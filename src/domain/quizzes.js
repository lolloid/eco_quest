function makeQuiz(articleId, title, questions, reward = { ecoPoints: 30, xp: 30 }) {
  return {
    id: `quiz_${articleId.replace(/^article_/, "")}`,
    articleId,
    title,
    passScore: Math.max(1, Math.ceil(questions.length * 0.7)),
    reward,
    questions,
  };
}

export const DEFAULT_QUIZZES = {
  article_plastic_ocean: makeQuiz("article_plastic_ocean", "Ocean Plastic Scanner", [
    {
      id: "q1",
      question: "Apa salah satu cara mengurangi sampah plastik?",
      options: ["Membakar plastik", "Memakai botol reusable", "Membuang plastik ke sungai"],
      answerIndex: 1,
      explanation: "Botol reusable mengurangi plastik sekali pakai dan menekan sampah yang masuk ke laut.",
    },
    {
      id: "q2",
      question: "Mengapa plastik laut berbahaya bagi hewan?",
      options: ["Dapat tertelan dan melukai hewan", "Membuat air lebih jernih", "Menjadi makanan utama ikan"],
      answerIndex: 0,
      explanation: "Hewan laut dapat mengira plastik sebagai makanan atau tersangkut di sampah plastik.",
    },
  ]),

  article_composting_home: makeQuiz("article_composting_home", "Compost Core", [
    {
      id: "q1",
      question: "Bahan apa yang cocok untuk kompos?",
      options: ["Sisa sayur", "Baterai", "Cat tembok"],
      answerIndex: 0,
      explanation: "Sisa sayur adalah sampah organik yang dapat terurai menjadi kompos.",
    },
    {
      id: "q2",
      question: "Apa yang perlu dijaga dalam proses kompos?",
      options: ["Kelembaban dan campuran bahan", "Memasukkan plastik", "Menyimpan minyak goreng"],
      answerIndex: 0,
      explanation: "Kompos yang sehat butuh keseimbangan bahan hijau, bahan coklat, udara, dan kelembaban.",
    },
  ]),

  article_energy_saving: makeQuiz("article_energy_saving", "Energy Saver", [
    {
      id: "q1",
      question: "Kebiasaan mana yang menghemat energi?",
      options: ["Membiarkan charger menancap", "Mematikan lampu yang tidak dipakai", "Membuka kulkas terus-menerus"],
      answerIndex: 1,
      explanation: "Mematikan lampu yang tidak digunakan mengurangi konsumsi listrik harian.",
    },
    {
      id: "q2",
      question: "Lampu yang lebih hemat energi biasanya adalah...",
      options: ["Lampu LED", "Lampu rusak", "Lampu menyala 24 jam"],
      answerIndex: 0,
      explanation: "LED memakai energi lebih rendah dan umumnya lebih tahan lama.",
    },
  ]),

  article_zero_waste: makeQuiz("article_zero_waste", "Zero Waste Route", [
    {
      id: "q1",
      question: "Zero waste yang realistis berarti...",
      options: ["Tidak pernah menghasilkan sampah sama sekali", "Mengurangi sampah secara bertahap", "Membuang semua barang lama"],
      answerIndex: 1,
      explanation: "Zero waste adalah perjalanan bertahap untuk menolak, mengurangi, menggunakan ulang, mendaur ulang, dan mengomposkan.",
    },
    {
      id: "q2",
      question: "Prinsip 'reuse' artinya...",
      options: ["Menggunakan kembali barang", "Membakar barang", "Membeli barang baru setiap hari"],
      answerIndex: 0,
      explanation: "Reuse memperpanjang umur barang sehingga sampah berkurang.",
    },
  ], { ecoPoints: 34, xp: 34 }),

  article_air_clean: makeQuiz("article_air_clean", "Clean Air Pulse", [
    {
      id: "q1",
      question: "Sumber polusi udara kota antara lain...",
      options: ["Ruang hijau", "Kendaraan dan pembakaran sampah", "Kompos rumah"],
      answerIndex: 1,
      explanation: "Emisi kendaraan dan pembakaran sampah adalah penyumbang polusi udara yang umum.",
    },
    {
      id: "q2",
      question: "Solusi kota yang membantu udara bersih adalah...",
      options: ["Transportasi publik dan ruang hijau", "Membakar sampah", "Menutup semua taman"],
      answerIndex: 0,
      explanation: "Transportasi publik dan ruang hijau membantu menurunkan emisi dan menyaring polutan.",
    },
  ], { ecoPoints: 34, xp: 34 }),

  article_forest_guardian: makeQuiz("article_forest_guardian", "Forest Guardian", [
    {
      id: "q1",
      question: "Hutan membantu iklim karena...",
      options: ["Menyerap karbon", "Menghasilkan plastik", "Meningkatkan limbah"],
      answerIndex: 0,
      explanation: "Pohon dan tanah hutan menyimpan karbon serta menjaga siklus air.",
    },
    {
      id: "q2",
      question: "Selain iklim, hutan penting untuk...",
      options: ["Habitat satwa dan menjaga air", "Tempat membuang baterai", "Menghilangkan sungai"],
      answerIndex: 0,
      explanation: "Hutan menjadi rumah keanekaragaman hayati dan membantu menjaga ketersediaan air.",
    },
  ], { ecoPoints: 34, xp: 34 }),

  article_climate_basics: makeQuiz("article_climate_basics", "Climate Signal", [
    {
      id: "q1",
      question: "Perubahan iklim berkaitan dengan...",
      options: ["Gas rumah kaca berlebih", "Sampah yang otomatis hilang", "Lampu hemat energi saja"],
      answerIndex: 0,
      explanation: "Gas rumah kaca menahan panas berlebih di atmosfer dan mengubah pola iklim.",
    },
    {
      id: "q2",
      question: "Aksi harian yang membantu mitigasi iklim adalah...",
      options: ["Hemat energi dan kurangi sampah", "Membuang sampah ke sungai", "Membakar plastik"],
      answerIndex: 0,
      explanation: "Aksi kecil yang dilakukan banyak orang dapat menurunkan emisi dan limbah.",
    },
  ], { ecoPoints: 40, xp: 40 }),

  article_clean_water: makeQuiz("article_clean_water", "Water Shield", [
    {
      id: "q1",
      question: "Air bersih dapat rusak karena...",
      options: ["Sampah dan limbah masuk saluran air", "Menanam pohon", "Menghemat air"],
      answerIndex: 0,
      explanation: "Sampah, minyak, dan limbah kimia dapat mencemari sungai dan tanah.",
    },
    {
      id: "q2",
      question: "Langkah awal menjaga air bersih adalah...",
      options: ["Tidak membuang sampah ke selokan", "Membuang oli ke sungai", "Menutup semua drainase"],
      answerIndex: 0,
      explanation: "Selokan yang bersih membantu mencegah banjir dan pencemaran air.",
    },
  ]),

  article_wildlife_protection: makeQuiz("article_wildlife_protection", "Wildlife Friend", [
    {
      id: "q1",
      question: "Satwa lokal terbantu oleh...",
      options: ["Taman dengan tanaman lokal", "Sungai penuh sampah", "Pestisida berlebihan"],
      answerIndex: 0,
      explanation: "Tanaman lokal memberi makanan dan tempat berlindung bagi satwa kecil.",
    },
    {
      id: "q2",
      question: "Sungai bersih membantu...",
      options: ["Ikan dan ekosistem air", "Mikroplastik bertambah", "Sampah menumpuk"],
      answerIndex: 0,
      explanation: "Sungai bersih memberi habitat yang lebih aman untuk ikan dan organisme air.",
    },
  ]),

  article_green_tech: makeQuiz("article_green_tech", "Green Tech Lab", [
    {
      id: "q1",
      question: "Contoh green technology adalah...",
      options: ["Panel surya", "Membakar sampah", "Boros listrik"],
      answerIndex: 0,
      explanation: "Panel surya menghasilkan energi terbarukan dari cahaya matahari.",
    },
    {
      id: "q2",
      question: "Sensor sampah pintar dapat membantu...",
      options: ["Mengelola pemilahan dan pengangkutan", "Membuat sampah tak terlihat", "Menghapus kebutuhan edukasi"],
      answerIndex: 0,
      explanation: "Sensor bisa membantu mengetahui kapasitas tempat sampah dan mengatur pengelolaan lebih efisien.",
    },
  ], { ecoPoints: 42, xp: 42 }),

  article_recycle_sorting: makeQuiz("article_recycle_sorting", "Sorting Station", [
    {
      id: "q1",
      question: "Baterai bekas sebaiknya masuk kategori...",
      options: ["Electronic waste", "Organik", "Kertas"],
      answerIndex: 0,
      explanation: "Baterai mengandung bahan berbahaya dan perlu jalur pengolahan khusus.",
    },
    {
      id: "q2",
      question: "Sampah daur ulang lebih baik jika...",
      options: ["Bersih dan kering", "Tercampur makanan basah", "Dilempar ke sungai"],
      answerIndex: 0,
      explanation: "Material bersih dan kering lebih mudah diproses ulang.",
    },
  ]),

  article_ocean_microplastic: makeQuiz("article_ocean_microplastic", "Microplastic Alert", [
    {
      id: "q1",
      question: "Mikroplastik adalah...",
      options: ["Partikel plastik kecil", "Pohon laut", "Jenis ikan baru"],
      answerIndex: 0,
      explanation: "Mikroplastik berasal dari pecahan plastik besar atau serat sintetis yang sangat kecil.",
    },
    {
      id: "q2",
      question: "Mengurangi plastik sekali pakai membantu karena...",
      options: ["Sumber mikroplastik berkurang", "Laut menjadi tempat sampah", "Ikan makan lebih banyak plastik"],
      answerIndex: 0,
      explanation: "Semakin sedikit plastik terbuang, semakin kecil risiko pecah menjadi mikroplastik.",
    },
  ], { ecoPoints: 42, xp: 42 }),
};
