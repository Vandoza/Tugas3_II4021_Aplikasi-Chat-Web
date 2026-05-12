# Cara Menjalankan Aplikasi

Aplikasi ini dapat dijalankan menggunakan Docker Compose. Docker Compose akan menjalankan dua service utama, yaitu `server` sebagai backend Express dan `client` sebagai frontend Vite React. Pada mode Docker, JWT key akan dibuat otomatis saat container backend dijalankan, sehingga pengguna tidak perlu membuat file `.env` atau menyalin JWT key secara manual.

## 1. Menjalankan Aplikasi dengan Docker

Masuk ke folder `backend` dari root project:

```bash
cd backend
```

Pastikan Docker Desktop sudah berjalan, lalu jalankan:

```bash
docker compose up --build
```

Jika berhasil, terminal akan menampilkan log seperti berikut:

```txt
JWT keys generated automatically.
Server running on http://localhost:3000
VITE ready
Local: http://localhost:5173/
```

Keterangan:

- `JWT keys generated automatically.` menandakan JWT key berhasil dibuat otomatis oleh backend.
- `Server running on http://localhost:3000` menandakan backend berjalan di dalam container.
- `Local: http://localhost:5173/` menandakan frontend dapat diakses dari browser.

## 2. Akses Aplikasi

Frontend dapat dibuka melalui browser pada alamat:

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

Untuk PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:8088/health" -Method GET -UseBasicParsing
```

## 3. Keterangan Port Docker

Pada Docker, terdapat beberapa port yang perlu dibedakan:

```txt
Frontend host/laptop       : 5173
Frontend internal container: 5173

Backend host/laptop        : 8088
Backend internal container : 3000
```

Artinya, frontend diakses dari browser melalui `http://localhost:5173`, backend di dalam container tetap berjalan pada port `3000`, dan backend dari host/laptop dapat diakses melalui port `8088`.

## 4. Menghentikan Docker

Untuk menghentikan container, tekan `Ctrl + C` pada terminal yang menjalankan Docker Compose, lalu jalankan:

```bash
docker compose down
```

Jika ingin sekaligus menghapus volume database agar data akun dan pesan terhapus, jalankan:

```bash
docker compose down -v
```

Perintah `down -v` akan menghapus volume SQLite yang digunakan oleh backend, sehingga aplikasi kembali ke kondisi kosong saat dijalankan ulang.

## 5. Catatan JWT Key pada Docker

Pada mode Docker, JWT key dibuat otomatis oleh script:

```txt
backend/scripts/setupEnv.js
```

Script tersebut dijalankan sebelum backend server aktif melalui script:

```bash
npm run docker:start
```

Alur saat Docker dijalankan:

```txt
docker compose up --build
        ↓
container backend berjalan
        ↓
setupEnv.js dijalankan
        ↓
JWT key dibuat otomatis jika belum tersedia
        ↓
backend server dijalankan
```

Dengan mekanisme ini, pengguna tidak perlu menjalankan:

```bash
npm run generate:keys
```

dan tidak perlu menyalin `JWT_PRIVATE_KEY_B64` maupun `JWT_PUBLIC_KEY_B64` secara manual ke file `.env`.

## 6. Alternatif: Menjalankan Backend Tanpa Docker

Jika ingin menjalankan backend secara lokal tanpa Docker, masuk ke folder backend:

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

Jalankan server:

```bash
npm start
```

Jika berhasil, backend berjalan langsung di port `3000`:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/health
```