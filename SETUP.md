# 🔧 Benerin — Setup Guide

## Cara Setup Firebase

### 1. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** → masukkan nama `benerin`
3. Ikuti wizard, nonaktifkan Google Analytics (opsional)

### 2. Aktifkan Layanan Firebase

#### Authentication
- Firebase Console → **Authentication** → **Get started**
- Tab **Sign-in method** → aktifkan:
  - ✅ **Email/Password**
  - ✅ **Google** (masukkan email support)

#### Firestore Database
- Firebase Console → **Firestore Database** → **Create database**
- Pilih mode **production** atau **test**
- Pilih region terdekat (e.g., `asia-southeast2` untuk Jakarta)

#### Storage
- Firebase Console → **Storage** → **Get started**
- Ikuti wizard setup

### 3. Copy Firebase Config
1. Firebase Console → **Project Settings** (ikon gear)
2. Scroll ke bawah → **Your apps** → klik ikon `</>`  (Web)
3. Register app dengan nama `benerin-web`
4. Copy config object

### 4. Setup .env File
```
# Rename .env.example menjadi .env lalu isi:
cp .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=benerin-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=benerin-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=benerin-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_GEMINI_API_KEY=AIza...  # Optional - untuk Chat AI
```

### 5. Setup Firestore Security Rules
- Firebase Console → **Firestore** → **Rules**
- Copy-paste isi dari file `firestore.rules`

### 6. Jalankan Aplikasi
```bash
npm install
npm run dev
```

Buka: http://localhost:5173

---

## Cara Mendapatkan Gemini API Key (untuk Chat AI)
1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Klik **"Get API key"**
3. Copy key dan paste di `.env` → `VITE_GEMINI_API_KEY`

> Tanpa Gemini API key, Chat AI tetap berfungsi dengan respons simulasi.

---

## Fitur Aplikasi

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Auth | `/auth` | Login & Register |
| Beranda | `/` | Hero + kategori layanan |
| Pesan | `/pesan` | Buat pesanan baru |
| Matching | `/matching` | Animasi pencarian tukang |
| Pilih Tukang | `/pilih-tukang` | Daftar tukang + hire |
| Aktivitas | `/aktivitas` | Semua pesanan |
| Chat AI | `/chat` | Diagnosis + chat tukang |
| Profil | `/profile` | Pengaturan akun |

## Build untuk Production
```bash
npm run build
# Output di folder dist/
```
