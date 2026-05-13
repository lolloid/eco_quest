# PixelTerra

PixelTerra adalah platform edukasi lingkungan berbasis gamifikasi dengan nuansa modern eco pixel RPG. Aplikasi ini menggabungkan landing page interaktif, autentikasi Firebase, dashboard pemain, gameplay Phaser, quest, leaderboard, Education Hub, recycle system, dan EcoAssistant AI.

## Tech Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Phaser 3
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK
- OpenRouter AI API
- Framer Motion

## Fitur Utama

- Landing page pixel-art eco RPG dengan public navbar.
- Login, register, session cookie, dan demo auth untuk development.
- Dashboard pemain dengan HUD style, level, XP, EcoPoints, mission board, leaderboard, dan AI Assistant.
- Gameplay top-down Phaser dengan tilemap, player movement, NPC, trash collection, inventory, recycle station, world cleanliness, reward popup, minimap, dan mobile controls.
- Education Hub dengan kategori artikel, bookmark, reading progress, quiz, XP reward, dan badge-style feedback.
- Admin routes untuk users, quests, articles, quizzes, NPCs, analytics, dan suspicious players.
- Firestore rules dan seed script untuk data awal.

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- Firebase CLI
- Firebase project dengan Authentication dan Firestore aktif
- Service account Firebase untuk API server/seed
- OpenRouter API key untuk EcoAssistant AI

## Instalasi

```bash
npm install
```

## Environment Variables

Buat file `.env.local` di root project. Jangan commit file ini.

```env
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
# Bisa berupa path file JSON atau JSON string service account.
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-120b

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_PROFESSIONAL_GAME_ASSETS=true

# Demo auth development
NEXT_PUBLIC_DISABLE_DEMO_AUTH=false
```

Catatan keamanan:
- `serviceAccountKey.json` dan `.env.local` tidak boleh masuk Git.
- API key yang pernah terlanjur terekspos sebaiknya segera di-rotate di dashboard penyedia.

## Menjalankan Development Server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Jika tampilan berubah menjadi putih/raw HTML setelah banyak perubahan CSS, hentikan dev server, hapus cache `.next`, lalu jalankan ulang:

```powershell
Remove-Item .next -Recurse -Force
npm run dev
```

## Build Production

```bash
npm run build
npm run start
```

## Seed Database

Seed utama:

```bash
npm run seed
```

Seed arsitektur terbaru:

```bash
npm run seed:architecture
```

Data yang disiapkan mencakup contoh quest, NPC, artikel, quiz, dan data pendukung lain sesuai script seed.

## Deploy Firestore Rules

Pastikan Firebase CLI sudah login dan project sudah benar.

```bash
firebase login
firebase use <project-id>
npm run deploy:rules
```

Contoh:

```bash
firebase use testing-677ee
npm run deploy:rules
```

## Validasi Asset Game

```bash
npm run validate:game-assets
```

Jika perlu generate/import asset:

```bash
npm run generate:game-assets
npm run scaffold:professional-assets
npm run import:professional-assets
npm run install:cc0-professional-assets
```

## Script Penting

| Script | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan production build |
| `npm run test` | Menjalankan smoke dan unit architecture tests |
| `npm run seed` | Seed Firestore lama/awal |
| `npm run seed:architecture` | Seed data arsitektur terbaru |
| `npm run admin:set-role -- <email-or-uid> admin` | Menjadikan akun Firebase sebagai admin |
| `npm run deploy:rules` | Deploy Firestore security rules |
| `npm run validate:game-assets` | Validasi asset pixel profesional |
| `npm run generate:tilemap` | Generate tilemap |

## Admin Access

User baru otomatis dibuat dengan `role: "user"`. Untuk membuka panel admin, akun harus memiliki `role: "admin"` di dokumen `users/{uid}` Firestore.

```bash
npm run admin:set-role -- admin@email.com admin
```

Untuk mengembalikan akun menjadi user biasa:

```bash
npm run admin:set-role -- admin@email.com user
```

Panel `/admin` memiliki guard terpisah. Akun non-admin akan diarahkan ke halaman akses ditolak, sementara API admin tetap dilindungi oleh validasi token dan pengecekan role server-side.

Alur login:

- Akun `role: "admin"` otomatis diarahkan ke `/admin`.
- Akun `role: "user"` otomatis diarahkan ke `/dashboard`.
- Logout dari admin console menghapus session Firebase/cookie dan kembali ke homepage `/`.

Admin console memakai layout sendiri, terpisah dari navbar public dan user dashboard. Modul admin yang tersedia:

| Route | Fungsi |
|---|---|
| `/admin` | Overview, total user, EcoPoints, trash collected, suspicious users, top players |
| `/admin/users` | Melihat daftar user, role, level, EcoPoints, trash, dan risk score |
| `/admin/quests` | Membuat, edit, dan menonaktifkan quest |
| `/admin/articles` | Mengelola artikel Education Hub |
| `/admin/npcs` | Mengelola NPC, role, dialog, dan quest NPC |
| `/admin/quizzes` | Mengelola quiz artikel |
| `/admin/analytics` | Melihat active users estimate, quest completion, trash, dan artikel dibaca |
| `/admin/suspicious` | Melihat pemain dengan suspicious score |

## Akun Demo / Dummy

PixelTerra tidak menyimpan password dummy hardcoded di repository. Untuk testing cepat, gunakan **Mode Demo** di halaman login.

### Mode Demo Development

| Field | Nilai |
|---|---|
| Nama profil | `Demo EcoWarrior` |
| Email profil | `demo@pixelterra.local` |
| Role | `user` |
| Cara masuk | Klik tombol `Masuk Mode Demo` di halaman `/login` |
| Password | Tidak ada, mode demo memakai session development lokal |

Mode demo hanya aktif saat development dan akan nonaktif jika:

```env
NEXT_PUBLIC_DISABLE_DEMO_AUTH=true
```

### Data Seed Firestore

Script `npm run seed` membuat dokumen user contoh di Firestore:

| Field | Nilai |
|---|---|
| UID | `demo_user_001` |
| Display name | `DemoWarrior` |
| Email | `demo@pixelterra.id` |
| Role | user/default |

Catatan penting: data ini **bukan akun Firebase Authentication**, jadi tidak bisa login langsung memakai email tersebut. Ini hanya dokumen contoh untuk leaderboard/profile/testing data.

### Akun Admin Testing

Untuk akun admin, buat akun lewat `/register`, lalu ubah role akun tersebut:

```bash
npm run admin:set-role -- email-admin-kamu@example.com admin
```

Setelah login ulang:

- Admin akan diarahkan otomatis ke `/admin`.
- User biasa akan diarahkan ke `/dashboard`.
- Akun non-admin yang membuka `/admin` akan diarahkan ke `/unauthorized`.

## Struktur Folder

```text
ecoquest/
├── public/
│   └── assets/
│       └── pixel/
│           ├── ecoquest-pro/
│           └── professional/
├── scripts/
│   ├── seedFirestore.js
│   ├── seedArchitecture.js
│   ├── validateProfessionalGameAssets.js
│   └── ...
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── education/
│   │   ├── game/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.tsx
│   ├── components/
│   │   ├── game/
│   │   ├── ui/
│   │   ├── DailyMission.jsx
│   │   ├── EcoAssistant.jsx
│   │   └── Leaderboard.jsx
│   ├── domain/
│   ├── game/
│   │   ├── config/
│   │   ├── entities/
│   │   ├── events/
│   │   ├── scenes/
│   │   └── systems/
│   ├── lib/
│   └── server/
├── firestore.rules
├── firebase.json
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Route Utama

| Route | Deskripsi |
|---|---|
| `/` | Landing page public |
| `/login` | Login user |
| `/register` | Register user |
| `/dashboard` | Dashboard pemain |
| `/game` | Gameplay PixelTerra |
| `/education` | Education Hub |
| `/admin` | Admin control console, hanya untuk role admin |
| `/unauthorized` | Halaman akses ditolak untuk user non-admin |

## Gameplay Controls

Desktop:

| Input | Aksi |
|---|---|
| `W A S D` | Movement |
| Arrow keys | Movement |
| `E` | Interact / pickup / talk |
| `R` | Recycle di recycle station |
| `TAB` | Buka inventory |

Mobile:

- Virtual joystick untuk movement.
- Tombol interact.
- Tombol recycle.
- Shortcut inventory.

## Gameplay Loop

```text
Eksplorasi
→ temukan sampah
→ ambil sampah
→ inventory bertambah
→ pergi ke recycle station
→ pilah/recycle
→ dapat XP dan EcoPoints
→ world cleanliness meningkat
→ quest progress bertambah
```

## Firestore Collections

Struktur utama yang digunakan/dirancang:

```text
users
quests
articles
quizzes
npcs
achievements
inventory
leaderboard
analytics
world
```

Subcollection penting:

```text
users/{uid}/conversations
users/{uid}/conversations/{conversationId}/messages
users/{uid}/questProgress
```

## AI Assistant

EcoAssistant menggunakan endpoint:

```text
POST /api/ai
```

Model default:

```text
openai/gpt-oss-120b
```

AI dibatasi untuk topik:

- lingkungan
- recycle
- sustainability
- climate change
- energi
- eco lifestyle
- gameplay hint PixelTerra

Jika `OPENROUTER_API_KEY` tidak tersedia, sistem akan memakai fallback response lokal.

## Firebase Setup Singkat

1. Aktifkan Email/Password di Firebase Authentication.
2. Aktifkan Cloud Firestore.
3. Generate service account key dari Firebase Console.
4. Simpan sebagai `serviceAccountKey.json` atau masukkan JSON ke `FIREBASE_SERVICE_ACCOUNT_KEY`.
5. Jalankan seed.
6. Deploy rules.

## Production Checklist

- Rotate semua key yang pernah terekspos.
- Pastikan `.env.local` dan `serviceAccountKey.json` masuk `.gitignore`.
- Jalankan `npm run build`.
- Jalankan `npm run validate:game-assets`.
- Deploy Firestore rules.
- Uji register, login user, login admin, logout admin, dashboard, education, game, recycle, dan AI.
- Pastikan minimal satu akun admin dibuat dengan `npm run admin:set-role -- <email> admin`.
- Matikan demo auth di production:

```env
NEXT_PUBLIC_DISABLE_DEMO_AUTH=true
```

## Troubleshooting

### Tampilan jadi putih / link biru default

Biasanya CSS dev cache Next.js rusak atau file CSS di `.next` stale.

Solusi:

```powershell
Remove-Item .next -Recurse -Force
npm run dev
```

### Firebase project invalid saat `firebase use`

Pastikan:

```bash
firebase login
firebase projects:list
firebase use <project-id-yang-benar>
```

### AI tidak menjawab dari OpenRouter

Pastikan:

- `OPENROUTER_API_KEY` benar.
- `OPENROUTER_MODEL` tersedia.
- Server sudah di-restart setelah mengubah `.env.local`.

### Game asset error

Jalankan:

```bash
npm run validate:game-assets
```

Pastikan file penting ada:

```text
public/assets/pixel/professional/maps/eco_world.json
public/assets/pixel/professional/tilesets/ecoquest_tiles.png
public/assets/pixel/professional/characters/hero.png
public/assets/pixel/professional/characters/npcs.png
public/assets/pixel/professional/objects/trash_items.png
public/assets/pixel/professional/objects/stations.png
```

## Catatan Pengembangan

PixelTerra sudah memiliki basis MVP yang cukup lengkap untuk lomba/prototype production-ready. Untuk kualitas game komersial penuh, area yang masih bisa ditingkatkan:

- remap manual di Tiled untuk kualitas map lebih natural
- sprite karakter/NPC custom original
- variasi animasi collect/interact
- soundscape lebih lengkap
- balancing quest dan reward
- audit security rules berkala

## License

Private project / educational MVP. Sesuaikan lisensi sebelum dipublikasikan.
