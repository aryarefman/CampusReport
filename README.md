<div align="center">
  
  # CampusReport
  
  **Sistem Pelaporan Fasilitas Kampus Berbasis Web**
  
  Platform digital yang mempermudah mahasiswa melaporkan kerusakan fasilitas kampus dan membantu admin melakukan manajemen perbaikan secara real-time.

  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)](https://www.mongodb.com/)
  
  [Demo](https://campusreport.vercel.app) · [Report Bug](https://github.com/user/repo/issues) · [Request Feature](https://github.com/user/repo/issues)
</div>

## Problem Statement

### Masalah yang Dihadapi

Di kampus, fasilitas rusak sering tidak dilaporkan dengan baik karena:

- Proses pelaporan manual memakan waktu (harus datang ke bagian maintenance)
- Mahasiswa tidak tahu ke siapa harus melapor
- Tidak ada transparansi status perbaikan
- Pihak kampus kesulitan memprioritaskan perbaikan

**Dampak:**
- Fasilitas rusak berlarut-larut tidak diperbaiki
- Mengganggu proses belajar mengajar
- Pemborosan anggaran karena tidak ada data historis

### Solusi yang Ditawarkan

CampusReport adalah platform web yang memungkinkan:

- Mahasiswa melaporkan kerusakan dalam 2 menit dengan foto & lokasi
- Tracking real-time status perbaikan (Pending → In Progress → Done)
- Dashboard admin untuk manajemen & prioritas laporan
- Data historis untuk analisis dan perencanaan maintenance

**Target Dampak:**
- Mengurangi waktu respon perbaikan hingga 60%
- Meningkatkan transparansi proses maintenance
- Efisiensi anggaran dengan data-driven decision

---

## Fitur Utama

### Untuk Mahasiswa

| Fitur | Deskripsi |
|-------|-----------|
| Submit Laporan | Upload foto, lokasi, kategori, dan deskripsi kerusakan |
| Pilih Lokasi | Dropdown gedung & ruangan untuk mempermudah identifikasi |
| Tracking Status | Real-time update: Pending → In Progress → Done |
| Riwayat Laporan | Lihat semua laporan yang pernah disubmit |
| Notifikasi | Update otomatis saat status berubah |

### Untuk Admin Kampus

| Fitur | Deskripsi |
|-------|-----------|
| Dashboard Analytics | Grafik laporan per kategori, lokasi, dan status |
| Verifikasi Laporan | Approve/reject laporan yang masuk |
| Update Status | Ubah status dan tambahkan catatan perbaikan |
| Filter & Search | Cari laporan berdasarkan lokasi, kategori, tanggal |
| Export Data | Download laporan dalam format CSV/Excel |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shadcn/UI
- **State Management:** React Hooks (useState, useContext)
- **HTTP Client:** Axios

### Backend
- **API:** Next.js API Routes
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt
- **File Upload:** Multer + Cloudinary

### DevOps
- **Version Control:** Git & GitHub
- **Deployment:** Vercel (Frontend + API)
- **Database Hosting:** MongoDB Atlas
- **Image Storage:** Cloudinary

---

## Instalasi & Setup

### Prerequisites
Pastikan sudah terinstall:
- Node.js >= 18.0.0
- npm atau yarn
- MongoDB (local atau Atlas account)

### 1. Clone Repository
```bash
git clone https://github.com/username/campusreport.git
cd campusreport
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root folder:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campusreport

# JWT Secret
JWT_SECRET=your_super_secret_key_here

# Cloudinary (untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Config
NEXT_PUBLIC_APP_NAME=CampusReport
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Seed Database (Opsional)

Untuk data dummy testing:
```bash
npm run seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## Struktur Project
```
campusreport/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/          # Dashboard admin
│   │   ├── reports/            # List semua laporan
│   │   ├── my-reports/         # Laporan user
│   │   └── settings/
│   ├── api/
│   │   ├── auth/               # Login, register, logout
│   │   ├── reports/            # CRUD laporan
│   │   ├── upload/             # Upload gambar
│   │   └── admin/              # Admin endpoints
│   ├── layout.tsx
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Shadcn components
│   ├── forms/
│   │   ├── ReportForm.tsx
│   │   └── LoginForm.tsx
│   ├── cards/
│   │   └── ReportCard.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── db.ts                   # MongoDB connection
│   ├── auth.ts                 # JWT helpers
│   └── utils.ts
├── models/
│   ├── User.ts
│   ├── Report.ts
│   └── Category.ts
├── types/
│   └── index.ts
├── public/
│   ├── images/
│   └── icons/
├── docs/                       # Screenshots
├── .env.local
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string (hashed),
  role: "student" | "admin",
  nim: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Report Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  category: "AC" | "Proyektor" | "Toilet" | "Furniture" | "Lainnya",
  location: {
    building: string,
    room: string,
    floor: string
  },
  images: [string],
  status: "pending" | "in_progress" | "done" | "rejected",
  priority: "low" | "medium" | "high",
  userId: ObjectId (ref: User),
  adminNotes: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@student.edu",
  "password": "password123",
  "nim": "123456789"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@student.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@student.edu",
    "role": "student"
  }
}
```

### Reports

#### Create Report
```http
POST /api/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "AC Rusak di Lab Komputer",
  "description": "AC tidak dingin sejak 2 hari lalu",
  "category": "AC",
  "location": {
    "building": "Gedung A",
    "room": "Lab 301",
    "floor": "3"
  },
  "images": [File]
}
```

#### Get All Reports (Admin)
```http
GET /api/reports?status=pending&category=AC
Authorization: Bearer {token}
```

#### Update Report Status (Admin)
```http
PATCH /api/reports/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "adminNotes": "Teknisi sudah ditugaskan"
}
```

---

## Design System

### Color Palette
```css
--primary: #2563eb (Blue)
--secondary: #64748b (Slate)
--success: #22c55e (Green)
--warning: #f59e0b (Amber)
--danger: #ef4444 (Red)
--pending: #f59e0b
--in-progress: #3b82f6
--done: #10b981
```

### Typography

- **Font Family:** Inter (Google Fonts)
- **Heading:** Bold, 32px - 14px
- **Body:** Regular, 16px - 14px

---

## Deployment

### Deploy ke Vercel

1. **Push ke GitHub**
```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
```

2. **Import di Vercel**
   - Login ke [vercel.com](https://vercel.com)
   - Klik "New Project"
   - Import dari GitHub
   - Pilih repository

3. **Setup Environment Variables**
   - Tambahkan semua variable dari `.env.local`
   - Deploy

4. **Setup MongoDB Atlas**
   - Whitelist IP Vercel di MongoDB Atlas
   - Gunakan connection string yang benar

### Custom Domain (Opsional)
```bash
# Vercel CLI
vercel domains add campusreport.com
```

---

## Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| MongoDB connection failed | Pastikan IP address sudah diwhitelist di MongoDB Atlas |
| Image upload error | Cek konfigurasi Cloudinary di `.env.local` |
| JWT token invalid | Clear localStorage dan login ulang |
| CSS not loading | Pastikan `tailwind.config.ts` sudah benar |
| API 404 | Cek route di `app/api/` folder |

---

## Roadmap

### Phase 1 (Current)
- [x] Authentication system
- [x] Submit & view reports
- [x] Admin dashboard
- [x] Status tracking

### Phase 2 (Next)
- [ ] Push notification
- [ ] Email notification
- [ ] Mobile app (React Native)
- [ ] QR code untuk cek lokasi

### Phase 3 (Future)
- [ ] AI untuk auto-categorize laporan
- [ ] Chatbot untuk FAQ
- [ ] Integration dengan sistem kampus
- [ ] Analitik prediktif untuk maintenance

---

## Contributing

Contributions are welcome! Jika ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## Team

| Role | Name | Contact |
|------|------|---------|
| Full Stack Developer | [Nama Kamu] | [@github](https://github.com/username) |
| UI/UX Designer | [Nama Designer] | [@github](https://github.com/username) |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Vercel Deployment Guides](https://vercel.com/docs)

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk kampus yang lebih baik</p>
  
  **Star this repo jika bermanfaat!**
  
  [⬆ Back to Top](#campusreport)
</div>
