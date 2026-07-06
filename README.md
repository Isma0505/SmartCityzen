# SmartCityzen Wonosobo

**Platform Aspirasi & Pelaporan Kota Cerdas**

SmartCityzen adalah platform digital untuk mewujudkan kota Wonosobo yang cerdas, partisipatif, dan berkelanjutan. Warga dapat melaporkan masalah infrastruktur dan pelayanan publik, yang kemudian dianalisis secara otomatis oleh AI untuk membantu pemerintah menangani dengan cepat dan tepat.

---

## Fitur Utama

### 1. Landing Page
- Penjelasan platform SmartCityzen Wonosobo
- Tujuan SDGs (SDG 9, SDG 11, SDG 16)
- Statistik laporan kota
- Panduan cara kerja

### 2. Login & Register
- Login warga dan admin/pemerintah
- Registrasi akun baru dengan validasi
- Sistem autentikasi sederhana

### 3. Dashboard Warga
- Jumlah laporan dan statusnya
- Riwayat laporan terbaru
- Aksi cepat: buat laporan & lihat peta
- Notifikasi
- Sistem poin partisipasi

### 4. Buat Laporan
- Form lengkap: judul, deskripsi, upload foto
- Pilih kategori masalah
- Lokasi otomatis (Kota Wonosobo)
- **AI menganalisis secara otomatis** setelah laporan dikirim

### 5. Hasil Analisis AI
- Kategori masalah (otomatis)
- Prioritas (Rendah/Sedang/Tinggi)
- Estimasi dampak
- Instansi tujuan
- Prediksi dampak jika tidak ditangani
- Deteksi laporan duplikat
- Skor prioritas otomatis (1-100)

### 6. Peta Kota Interaktif
- Peta OpenStreetMap centered on Wonosobo
- Marker berwarna berdasarkan status:
  - 🔴 Merah: Belum ditangani
  - 🟡 Kuning: Diproses
  - 🟠 Oranye: Dalam perbaikan
  - 🟢 Hijau: Selesai
- Filter berdasarkan status
- Detail laporan pada popup marker

### 7. Dashboard Pemerintah
- Melihat semua laporan
- Filter berdasarkan kategori & status
- Pencarian laporan
- Mengubah status laporan
- Grafik laporan per kategori & status
- Tabel laporan lengkap

### 8. Tracking Laporan
- Timeline status: Diterima → Diproses → Dalam Perbaikan → Selesai
- Riwayat perubahan status
- Komentar petugas

### 9. Statistik
- Jumlah laporan per bulan
- Kategori terbanyak
- Distribusi prioritas
- Waktu penyelesaian rata-rata
- Wilayah dengan laporan terbanyak
- Top reporter

### 10. Profil Pengguna
- Data pengguna
- Pengaturan akun (edit nama, telepon)
- Badge partisipasi (Pemula, Aktif, Peduli Kota, Pahlawan Kota)
- Sistem poin

---

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | SQLite + Prisma ORM |
| **State Management** | Zustand (persist) |
| **AI Analysis** | z-ai-web-dev-sdk (LLM) |
| **Peta** | React-Leaflet + OpenStreetMap |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Animasi** | Framer Motion |
| **Form Handling** | React Hook Form |

---

## Prasyarat

- **Node.js** >= 18.x
- **Bun** >= 1.x (disarankan) atau npm/yarn
- **Git**

---

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd smartcityzen-wonosobo
```

### 2. Install Dependencies

```bash
bun install
# atau menggunakan npm:
# npm install
```

### 3. Setup Environment

File `.env` sudah tersedia dengan konfigurasi default untuk SQLite:

```env
DATABASE_URL="file:./db/custom.db"
```

### 4. Setup Database

```bash
# Push schema ke database
bun run db:push

# Generate Prisma Client
bun run db:generate
```

### 5. Jalankan Development Server

```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Akun Demo

Data sampel akan otomatis di-seed saat pertama kali membuka aplikasi.

| Role | Email | Password |
|------|-------|----------|
| **Admin/Pemerintah** | admin@wonosobo.go.id | admin123 |
| **Warga** | budi@email.com | warga123 |
| **Warga** | siti@email.com | warga123 |
| **Warga** | ahmad@email.com | warga123 |

---

## Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Login API
│   │   │   ├── register/route.ts   # Register API
│   │   │   └── me/route.ts         # Get user info
│   │   ├── reports/
│   │   │   ├── route.ts            # CRUD reports
│   │   │   ├── analyze/route.ts    # AI analysis
│   │   │   ├── upload/route.ts     # Image upload
│   │   │   ├── stats/route.ts      # Statistics
│   │   │   └── [id]/
│   │   │       ├── route.ts        # Report detail
│   │   │       ├── status/route.ts # Change status
│   │   │       ├── comments/route.ts # Comments
│   │   │       └── support/route.ts  # Support/endorse
│   │   ├── notifications/
│   │   │   ├── route.ts           # Notifications
│   │   │   └── [id]/route.ts      # Mark as read
│   │   ├── profile/route.ts       # User profile
│   │   └── seed/route.ts          # Seed data
│   ├── layout.tsx
│   ├── page.tsx                   # Main page (client router)
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── WargaDashboard.tsx
│   ├── government/
│   │   └── GovernmentDashboard.tsx
│   ├── landing/
│   │   └── LandingPage.tsx
│   ├── map/
│   │   └── CityMap.tsx
│   ├── profile/
│   │   └── ProfilePage.tsx
│   ├── reports/
│   │   ├── CreateReportForm.tsx
│   │   ├── AIAnalysisResult.tsx
│   │   └── ReportDetail.tsx
│   ├── statistics/
│   │   └── StatisticsPage.tsx
│   ├── tracking/
│   │   └── TrackingPage.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                        # shadcn/ui components
├── store/
│   └── useStore.ts                # Zustand store
└── lib/
    ├── db.ts                      # Prisma client
    └── utils.ts
```

---

## Perintah yang Tersedia

```bash
# Development
bun run dev              # Jalankan development server

# Database
bun run db:push          # Push schema ke database
bun run db:generate      # Generate Prisma Client
bun run db:migrate       # Run migrations
bun run db:reset         # Reset database

# Linting
bun run lint             # Cek kualitas kode
```

---

## Kategori Laporan

- Jalan Rusak
- Penerangan Jalan
- Sampah & Kebersihan
- Drainase
- Fasilitas Umum
- Lalu Lintas
- Lingkungan
- Parkir
- Lainnya

## Status Laporan

| Status | Deskripsi | Warna |
|--------|-----------|-------|
| DITERIMA | Laporan baru masuk | 🔴 Merah |
| DIPROSES | Sedang ditinjau petugas | 🟡 Kuning |
| DALAM_PERBAIKAN | Sedang diperbaiki | 🟠 Oranye |
| SELESAI | Penanganan selesai | 🟢 Hijau |

---

## AI Features

- **Analisis otomatis**: Setiap laporan dianalisis AI untuk menentukan kategori, prioritas, dan instansi tujuan
- **Prediksi dampak**: AI memprediksi apa yang terjadi jika laporan tidak segera ditangani
- **Skor prioritas**: Skor 1-100 berdasarkan tingkat bahaya, lokasi, dan dampak
- **Deteksi duplikat**: AI mendeteksi laporan yang sama agar petugas tidak menangani berkali-kali
- **Instansi tujuan**: AI menentukan dinas/instansi yang bertanggung jawab

---

## Lisensi

© 2025 SmartCityzen Wonosobo. Dibuat untuk masyarakat Wonosobo.