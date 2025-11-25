# 🎓 CampusReport

**Sistem Pelaporan Kampus Modern dengan AI-Powered Chatbot & Admin Management**

CampusReport adalah aplikasi web full-stack yang memungkinkan mahasiswa dan staf kampus untuk melaporkan berbagai kejadian, fasilitas rusak, atau event kampus dengan mudah dan transparan. Dilengkapi dengan AI chatbot berbasis Gemini untuk membantu pengguna mendapatkan informasi, analisis gambar otomatis untuk mempercepat proses pelaporan, dan sistem manajemen admin yang komprehensif.

---

## 🎯 Problem Statement

Kampus sering menghadapi tantangan dalam mengelola laporan dari mahasiswa dan staf, seperti:
- **Kurangnya transparansi** dalam status penanganan laporan
- **Proses pelaporan yang rumit** dan memakan waktu
- **Sulit melacak** laporan yang sudah dibuat
- **Tidak ada sistem terpusat** untuk berbagai jenis laporan (fasilitas, insiden, event)
- **Kurangnya feedback** kepada pelapor tentang progress penanganan
- **Tidak ada komunikasi** antara admin dan pelapor
- **Sulit mencari** laporan spesifik dari banyak data

---

## ✨ Solution Overview

CampusReport menyediakan platform terpusat dengan fitur-fitur modern:

### 🔑 Fitur Utama

#### Untuk User (Mahasiswa/Staf):
- 📝 **Pelaporan Mudah** - Form intuitif dengan upload foto dan lokasi Google Maps
- 💬 **Autamatic Dscriptive** - Auto-fill form dengan deskripsi detail
- 🤖 **AI Chatbot** - Asisten virtual untuk menjawab pertanyaan tentang sistem dan statistik
- 📊 **Dashboard Transparan** - Lihat semua laporan kampus dan status penanganan
- 🔍 **Tracking Laporan** - Pantau status laporan pribadi (Pending, In Progress, Done)
- ✏️ **Edit Laporan** - Ubah laporan yang sudah dibuat sebelum diproses
- 🔎 **Search & Filter** - Cari laporan berdasarkan keyword, kategori, atau status
- 💬 **Admin Feedback** - Lihat komentar dan catatan dari admin
- 🌓 **Dark/Light Mode** - Tema yang dapat disesuaikan dengan preferensi

#### Untuk Admin:
- 👥 **Admin Dashboard** - Kelola semua laporan dari satu tempat
- 📈 **Statistik Real-time** - Lihat metrics dan analytics laporan
- ✅ **Update Status** - Ubah status laporan dengan dropdown (Pending → In Progress → Done)
- � **Add Comments** - Berikan feedback dan catatan pada setiap laporan
- �🗑️ **Manajemen Laporan** - Hapus laporan yang tidak valid
- � **Filter Laporan** - Filter berdasarkan status untuk fokus pada prioritas
- 📊 **User Management** - Kelola users dan ubah role (admin/user)

---

### Website
### Login
<img width="1919" height="1070" alt="image" src="https://github.com/user-attachments/assets/1f5bab4f-8a5b-42fb-9e59-5ca14155d1ec" />

### Register
<img width="1919" height="1066" alt="image" src="https://github.com/user-attachments/assets/d5492372-48d9-4d95-9aa1-8a964d217edd" />

### User
#### Dashboard
<img width="1919" height="1065" alt="image" src="https://github.com/user-attachments/assets/c486069e-c723-47ad-9952-1d5385010935" />
<img width="1919" height="1067" alt="image" src="https://github.com/user-attachments/assets/59d3390b-12a1-4385-ae61-84ee60a33598" />

#### Submit Report
<img width="1919" height="1066" alt="image" src="https://github.com/user-attachments/assets/b4b8abb1-98e3-40c2-96cb-f69498144153" />
<img width="1908" height="1043" alt="image" src="https://github.com/user-attachments/assets/f380944e-e9ca-4490-8b1a-50b5d384c548" />

#### My Report
<img width="1919" height="1068" alt="image" src="https://github.com/user-attachments/assets/ddc349fb-9f47-4535-a56d-708949f007cc" />

#### ChatBot
<img width="1918" height="997" alt="image" src="https://github.com/user-attachments/assets/18dacd40-19c7-4e7c-a6ba-500dcaba9ab5" />

### Admin
#### Dashboard
<img width="1917" height="1062" alt="image" src="https://github.com/user-attachments/assets/27c478f7-2f60-4fe9-b0d8-8181d3b08689" />
<img width="1919" height="1069" alt="image" src="https://github.com/user-attachments/assets/5ad77730-4dff-49c4-a314-b2b3286ae6f9" />

#### Submit Report
<img width="1918" height="1067" alt="image" src="https://github.com/user-attachments/assets/b1768059-9ffd-455e-9d57-63655d5ce8c9" />
<img width="1919" height="1066" alt="image" src="https://github.com/user-attachments/assets/5a4f8183-0edc-4767-a49c-bdb32a7eacea" />

#### My Report
<img width="1913" height="1063" alt="image" src="https://github.com/user-attachments/assets/11fbecd5-eefd-4f06-a93e-8fddcd08922b" />

#### Admin
<img width="1919" height="1062" alt="image" src="https://github.com/user-attachments/assets/fb6c0365-5605-4d6c-813a-07b8c07f6a01" />
<img width="1919" height="1068" alt="image" src="https://github.com/user-attachments/assets/af09dda5-9f04-4e35-81c9-e3bb67728012" />

#### Chatbot
<img width="1919" height="1069" alt="image" src="https://github.com/user-attachments/assets/e3970d80-e293-4658-9772-72924ab9d492" />

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - UI framework modern dengan type safety
- **Vite** - Build tool yang cepat dan efisien
- **React Router** - Navigation dan routing
- **Axios** - HTTP client untuk API calls
- **Lucide React** - Icon library yang modern dan lightweight
- **React Toastify** - Notifikasi yang elegan
- **React Dropzone** - Drag & drop file upload

### Backend
- **Node.js** + **Express** - Server framework
- **TypeScript** - Type-safe backend development
- **MongoDB** + **Mongoose** - NoSQL database dengan schema validation
- **JWT** - Authentication & authorization
- **Multer** - File upload handling
- **Google Gemini AI** - Image analysis dan chatbot
- **bcryptjs** - Password hashing untuk keamanan

### Additional Features
- 🗺️ **Google Maps Integration** - Embed maps dan location tracking
- 🎨 **Responsive Design** - Mobile-friendly interface
- 🔐 **Secure Authentication** - JWT-based auth system
- 📸 **Image Upload** - Support untuk foto laporan
- 🎨 **Custom Font** - Sen font untuk konsistensi UI

---

## 📋 Fitur Detail

### 1. **Multi-Category Reporting**
   - 🏢 **Facility** - Fasilitas rusak (AC, lampu, kursi, dll)
   - ⚠️ **Incident** - Kejadian/insiden (kecelakaan, kehilangan, dll)
   - 🎉 **Event** - Acara kampus (seminar, lomba, dll)
   - 📌 **Other** - Lainnya

### 2. **AI-Powered Features**
   
   #### 🖼️ Image Analysis
   - Upload foto, AI akan menganalisis dan memberikan deskripsi detail
   - Deskripsi mencakup:
     - Identifikasi masalah utama
     - Kondisi dan tingkat kerusakan
     - Safety concerns
     - Konteks (waktu, cuaca, orang yang terlibat)
     - Bahasa professional untuk dokumentasi resmi
   - Output 150-200 kata yang komprehensif
   
   #### 💬 Smart Chatbot
   - Tanya tentang statistik laporan
   - Cara menggunakan sistem
   - Info tentang laporan tertentu
   - Powered by Gemini AI

### 3. **Real-time Status Tracking**
   - 🟡 **Pending** - Laporan baru menunggu review
   - 🔵 **In Progress** - Sedang ditangani oleh admin
   - 🟢 **Done** - Selesai ditangani

### 4. **Search & Filter System**
   - 🔍 **Search Bar** - Cari berdasarkan title atau description
   - 📁 **Category Filter** - Filter by Incident, Event, Facility, Other
   - 📊 **Status Filter** - Filter by Pending, In Progress, Done
   - 🧹 **Clear Filters** - Reset semua filter dengan satu klik
   - 📈 **Results Counter** - Lihat "X of Y reports" secara real-time

### 5. **Admin Comment System**
   - 💬 **Add Comments** - Admin dapat memberikan catatan pada laporan
   - 👤 **Admin Name** - Setiap comment menampilkan nama admin
   - ⏰ **Timestamp** - Waktu comment ditambahkan
   - 📝 **Multiple Comments** - Bisa ada banyak comment per laporan
   - 👁️ **User Visibility** - User dapat melihat semua admin feedback

### 6. **User Experience**
   - ⚡ Fast loading dengan Vite
   - 🎨 Modern UI dengan smooth animations
   - 📱 Fully responsive untuk semua device
   - 🌙 Dark mode support
   - ✏️ Edit report functionality
   - 🔔 Toast notifications untuk feedback

---

## 🚀 Cara Menjalankan Project

### Prerequisites
Pastikan sudah terinstall:
- **Node.js** (v16 atau lebih baru)
- **MongoDB** (local atau MongoDB Atlas)
- **npm** atau **yarn**
- **Google Gemini API Key** (gratis dari Google AI Studio)

### 1. Clone Repository
```bash
git clone <repository-url>
cd CampusReport
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend` (copy dari `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campusreport
JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your-gemini-api-key-here
```

> **Dapatkan Gemini API Key**: 
> 1. Kunjungi https://makersuite.google.com/app/apikey
> 2. Login dengan Google Account
> 3. Klik "Create API Key"
> 4. Copy API key ke `.env`

Jalankan backend:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env` di folder `frontend` (copy dari `.env.example`):
```env
VITE_API_URL=http://localhost:3000
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

Jalankan frontend:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Akses Aplikasi

- **User Interface**: http://localhost:5173
- **Login/Register**: http://localhost:5173/login
- **Admin Dashboard**: http://localhost:5173/admin (setelah login sebagai admin)

### 5. Create Admin Account

Untuk membuat akun admin:

1. Register akun baru melalui UI
2. Update role di MongoDB:

```javascript
// Di MongoDB shell atau MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. Logout dan login kembali
4. Menu "Admin" akan muncul di navbar

---

## 📁 Struktur Project

```
CampusReport/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── image-analysis.controller.ts
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── user.model.ts
│   │   │   ├── report.model.ts
│   │   │   └── message.model.ts
│   │   ├── routes/               # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   └── chat.routes.ts
│   │   ├── middleware/           # Auth, upload, etc.
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   └── index.ts              # Entry point
│   ├── uploads/                  # Uploaded images
│   ├── .env.example              # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   └── AdminChat.tsx
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Report.tsx
│   │   │   ├── ReportList.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── context/              # React context (Auth)
│   │   │   ├── AuthContext.tsx
│   │   │   └── useAuth.ts
│   │   ├── services/             # API services
│   │   │   └── api.ts
│   │   ├── index.css             # Global styles
│   │   └── App.tsx               # Main app
│   ├── .env.example              # Environment template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Authorization

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Routes
Semua route yang memerlukan authentication menggunakan JWT token di header:
```http
Authorization: Bearer <token>
```

---

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login dan dapatkan JWT token
- `GET /auth/me` - Get current user info

### Reports
- `GET /reports` - Get all reports (admin)
- `GET /reports/my-reports` - Get user's own reports
- `GET /reports/:id` - Get single report by ID
- `POST /reports` - Create new report (with image upload)
- `PUT /reports/:id` - Update report (owner only)
- `DELETE /reports/:id` - Delete report (admin only)
- `GET /reports/stats` - Get statistics
- `PATCH /reports/:id/status` - Update status (admin only)
- `POST /reports/:id/comment` - Add admin comment (admin only)

### Image Analysis
- `POST /reports/analyze-image` - Analyze image with Gemini AI

### Chatbot
- `POST /chatbot/chat` - Send message to AI chatbot
- `GET /chatbot/history` - Get chat history

---

## 💡 Cara Menggunakan

### Untuk User:

1. **Register/Login**
   - Buka http://localhost:5173
   - Klik "Register" untuk buat akun baru
   - Atau "Login" jika sudah punya akun

2. **Submit Report**
   - Klik "Submit Report" di navbar
   - Pilih kategori (Facility, Incident, Event, Other)
   - Isi title
   - Upload foto (optional)
   - Klik "Analyze with AI" untuk auto-fill description
   - Paste Google Maps link (optional)
   - Edit description jika perlu
   - Klik "Submit Report"

3. **Track Reports**
   - Klik "My Reports" untuk lihat laporan Anda
   - Gunakan search untuk cari laporan tertentu
   - Filter by category atau status
   - Klik report card untuk lihat detail
   - Lihat admin comments jika ada

4. **Edit Report**
   - Di "My Reports", klik tombol "Edit"
   - Ubah informasi yang diperlukan
   - Klik "Update Report"

5. **Use Chatbot**
   - Klik icon robot di kanan bawah
   - Tanya tentang statistik atau cara pakai sistem
   - AI akan menjawab pertanyaan Anda

### Untuk Admin:

1. **Access Admin Dashboard**
   - Login sebagai admin
   - Klik "Admin" di navbar
   - Lihat semua laporan dan statistik

2. **Manage Reports**
   - Filter laporan by status
   - Update status dengan dropdown
   - Add comment untuk memberikan feedback
   - Delete laporan jika tidak valid

3. **Manage Users**
   - Lihat daftar semua users
   - Ubah role user (admin/user)
   - Lihat laporan per user
   - Delete user jika perlu

---

## 🎨 Design Features

### Color Scheme
- **Primary**: `#2c5f7d` - Professional blue
- **Accent**: `#5dade2` - Bright blue
- **Success**: `#27ae60` - Green
- **Warning**: `#f39c12` - Orange
- **Error**: `#e74c3c` - Red

### Typography
- **Font Family**: Sen (Google Fonts)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

### UI/UX
- **Glassmorphism** - Transparent cards with blur
- **Smooth Animations** - Hover effects, transitions
- **Responsive Grid** - Auto-fit columns
- **Dark Mode** - Full dark theme support
- **Toast Notifications** - User feedback

---

## 🔒 Security Features

- **Password Hashing** - bcryptjs dengan salt
- **JWT Authentication** - Secure token-based auth
- **Protected Routes** - Middleware untuk auth check
- **Role-Based Access** - Admin vs User permissions
- **Input Validation** - Server-side validation
- **CORS Configuration** - Controlled access
- **Environment Variables** - Sensitive data protection

---

## 📈 Future Enhancements

### Planned Features:
- [ ] Email notifications untuk status changes
- [ ] Export reports to PDF/Excel
- [ ] Advanced analytics dashboard
- [ ] Report categories customization
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Report voting system
- [ ] Attachment multiple images
- [ ] Report templates
- [ ] Scheduled reports

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards:
- Use TypeScript untuk type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments untuk complex logic
- Test before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developer

**Arya Refman**

- GitHub: [@aryarefman](https://github.com/aryarefman)
- Email: arya.refman@example.com
- LinkedIn: [Arya Refman](https://linkedin.com/in/aryarefman)

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI capabilities
- **React Community** - For amazing tools and libraries
- **MongoDB** - For flexible database solution
- **Vite** - For blazing fast build tool
- **Lucide Icons** - For beautiful icon set

---

## 📞 Support & Contact

Jika ada pertanyaan, masalah, atau saran:

- **Create an Issue**: [GitHub Issues](https://github.com/aryarefman/CampusReport/issues)
- **Email**: arya.refman@example.com
- **Documentation**: Lihat README ini untuk panduan lengkap

---

## 🐛 Known Issues

- Edit report form validation perlu improvement
- Dark mode pada beberapa component perlu penyesuaian
- Mobile responsiveness bisa ditingkatkan

---

## 📚 Documentation

### Environment Variables

#### Backend (.env)
```env
PORT=3000                          # Server port
MONGODB_URI=mongodb://...          # MongoDB connection string
JWT_SECRET=your-secret-key         # JWT signing secret
GEMINI_API_KEY=your-api-key        # Google Gemini API key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000    # Backend API URL
VITE_GEMINI_API_KEY=your-api-key      # Google Gemini API key
```

### Database Schema

#### User Model
```typescript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

#### Report Model
```typescript
{
  title: String,
  description: String,
  category: 'incident' | 'event' | 'facility' | 'other',
  photoUrl: String (optional),
  location: {
    lat: Number,
    lng: Number
  },
  mapsLink: String (optional),
  date: Date,
  status: 'pending' | 'in progress' | 'done',
  userId: String,
  adminComments: [{
    comment: String,
    adminName: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

**Made with ❤️ for better campus management**

*CampusReport v1.0.0 - 2024*
