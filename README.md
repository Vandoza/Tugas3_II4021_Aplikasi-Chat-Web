# Tugas 3 II4021 : Aplikasi Chat Web dengan Kriptografi Kunci-Simetri dan Kunci-Publik

Aplikasi chat web berbasis enkripsi end-to-end sebagai tugas mata kuliah II4021 Kriptografi. Pesan dienkripsi di browser menggunakan ECDH + AES-256-GCM sehingga server tidak pernah melihat isi pesan dalam bentuk plaintext.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Autentikasi | JWT (ECDSA ES256) via HttpOnly cookie |
| Kriptografi client | Web Crypto API (browser built-in) |
| Kriptografi server | bcrypt (password hashing) |

---

## Kriptografi yang Digunakan

| Tujuan | Algoritma |
|---|---|
| Key exchange | ECDH P-256 |
| Enkripsi pesan | AES-256-GCM |
| Password → encryption key | PBKDF2 (SHA-256, 100.000 iterasi) |
| Shared secret → AES/MAC key | HKDF (SHA-256) |
| Integritas pesan (MAC) | HMAC-SHA256 |
| Signing JWT | ECDSA ES256 |
| Hash password (server) | bcrypt |

---

## Dependensi

### Backend (`backend/`)
- `express` — web framework
- `better-sqlite3` — SQLite driver
- `bcrypt` — password hashing
- `cookie-parser` — parsing HttpOnly cookie
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — environment variables

### Frontend (`client/`)
- `react`, `react-dom` — UI framework
- `react-router-dom` — client-side routing
- `vite` — build tool & dev server

> **Catatan:** Backend membutuhkan **Node.js LTS (v22)** untuk mendukung `better-sqlite3`.

---

## Cara Menjalankan

### Requirement
- Node.js v22 (LTS)
- npm

### 1. Clone repository

```bash
git clone <repo-url>
cd Tugas3_II4021_Aplikasi-Chat-Web
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Generate JWT key pair:

```bash
npm run generate:keys
```

Salin output ke file `.env` (lihat bagian konfigurasi di bawah).

Jalankan backend:

```bash
npm start
```

Backend berjalan di `http://localhost:3000`.

### Alternatif: Jalankan Backend dengan Docker

Pastikan Docker Desktop sudah terinstall dan running.

Jika belum punya file `.env`, generate JWT key pair terlebih dahulu:

```bash
cd backend
npm install
npm run generate:keys
```

Salin output ke `backend/.env` (lihat bagian konfigurasi di bawah), lalu jalankan:

```bash
docker compose up
```

Backend berjalan di `http://localhost:3000`. File `backend/.env` tetap harus ada karena berisi JWT keys.

### 3. Setup Frontend

Buka terminal baru:

```bash
cd client
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 4. Buka Aplikasi

Buka `http://localhost:5173` di browser. Register minimal 2 akun untuk bisa saling berkirim pesan.

---

## Konfigurasi Environment

Buat file `backend/.env` berdasarkan `backend/.env.example`:

```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/chat.db
BCRYPT_ROUNDS=12
JWT_ALG=ES256
JWT_EXPIRES_IN_SECONDS=86400
JWT_ISSUER=tugas3-ii4021-chat
JWT_AUDIENCE=tugas3-ii4021-client
JWT_COOKIE_NAME=jwt
JWT_PRIVATE_KEY_B64=<hasil generate:keys>
JWT_PUBLIC_KEY_B64=<hasil generate:keys>
```


---

## Struktur Repository

```
repo-root/
├── client/          ← Frontend (React + Vite)
├── backend/         ← Backend (Express + SQLite)
├── jwt/             ← JWT library from scratch (ECDSA sign/verify)
└── README.md
```

---
## Anggota Kelompok

| Nama | NIM |
|---|---|
| Vandega Arrozan Musholine | 18223010 |
| Muhammad Aymar Barkhaya | 18223051 |
| Darryl Rizqi Ramadhan | 18223084 |