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
- Node.js v22 LTS
- npm
- Docker Desktop, jika ingin menjalankan dengan Docker

### 1. Clone Repository

```bash
git clone <repo-url>
cd Tugas3_II4021_Aplikasi-Chat-Web
```

### 2. Menjalankan Sistem dengan Docker

Pastikan Docker Desktop sudah terinstall dan running. Masuk ke folder backend:

```bash
cd backend
```

Jalankan Docker Compose:

```bash
docker compose up --build
```

Docker Compose akan menjalankan dua service utama, yaitu backend dan frontend. Pada mode Docker, JWT key akan dibuat otomatis oleh script `backend/scripts/setupEnv.js`, sehingga pengguna tidak perlu membuat file `.env` atau menyalin JWT key secara manual.

Jika berhasil, terminal akan menampilkan log seperti berikut:

```txt
JWT keys generated automatically.
Server running on http://localhost:3000
VITE ready
Local: http://localhost:5173/
```

Frontend dapat diakses melalui:

```txt
http://localhost:5173
```

Backend dapat dicek melalui health check:

```txt
http://localhost:8088/health
```

Ekspektasi response:

```json
{"status":"ok","service":"tugas3-ii4021-chat-backend"}
```

### 3. Keterangan Port Docker

Pada Docker, backend berjalan pada port internal container `3000`, tetapi diekspos ke host/laptop melalui port `8088`.

```txt
Frontend host/laptop       : 5173
Frontend internal container: 5173

Backend host/laptop        : 8088
Backend internal container : 3000
```

Artinya, aplikasi frontend dibuka melalui `http://localhost:5173`, sedangkan backend dari host/laptop dapat diakses melalui `http://localhost:8088`.

Di dalam jaringan Docker Compose, frontend berkomunikasi dengan backend melalui nama service:

```txt
http://server:3000
```

### 4. Menghentikan Docker

Untuk menghentikan container, tekan `Ctrl + C`, lalu jalankan:

```bash
docker compose down
```

Jika ingin menghapus database SQLite yang tersimpan di Docker volume, jalankan:

```bash
docker compose down -v
```

Perintah tersebut akan menghapus data akun dan pesan yang tersimpan pada volume Docker.

### 5. Alternatif: Menjalankan Backend Tanpa Docker

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Generate JWT key otomatis:

```bash
npm run setup:env
```

Jalankan backend:

```bash
npm start
```

Backend berjalan di:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/health
```

### 6. Alternatif: Menjalankan Frontend Tanpa Docker

Buka terminal baru dari root project, lalu masuk ke folder client:

```bash
cd client
```

Install dependency:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:5173
```

Catatan: jika frontend dijalankan lokal tanpa Docker, pastikan konfigurasi proxy pada `client/vite.config.js` mengarah ke backend yang sedang digunakan.

## Konfigurasi Environment

Pada mode Docker, pengguna tidak wajib membuat file `.env` secara manual karena JWT key dibuat otomatis saat container backend dijalankan.

Untuk menjalankan backend secara lokal tanpa Docker, file `backend/.env` dapat dibuat otomatis dengan perintah:

```bash
cd backend
npm run setup:env
```

Script tersebut akan membuat atau memperbarui file `.env` dan mengisi JWT key secara otomatis.

Contoh isi environment yang digunakan backend:

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
JWT_PRIVATE_KEY_B64=<generated automatically>
JWT_PUBLIC_KEY_B64=<generated automatically>
```

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