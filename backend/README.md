# Cara Menjalankan Backend

## 1. Masuk ke Folder Backend

Jalankan perintah berikut dari root project:

```bash
cd backend
```

## 2. Buat File Environment

Salin file `.env.example` menjadi `.env`.

Untuk Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Untuk Git Bash/Linux/macOS:

```bash
cp .env.example .env
```

## 3. Generate JWT Key

Jalankan:

```bash
npm run generate:keys
```

Copy hasil `JWT_PRIVATE_KEY_B64` dan `JWT_PUBLIC_KEY_B64` ke file `.env`.

## 4. Jalankan dengan Docker

Pastikan Docker Desktop sudah berjalan, lalu jalankan:

```bash
docker compose up --build
```

Jika berhasil, terminal akan menampilkan:

```txt
Server running on http://localhost:3000
```

## 5. Keterangan Port Docker

Pada Docker, terdapat dua port yang perlu dibedakan:

```txt
Port internal container : 3000
Port host/laptop       : 8088
```

Artinya, aplikasi Node.js di dalam container tetap berjalan pada port `3000`, tetapi dari browser, PowerShell, Postman, atau frontend di laptop, backend diakses melalui port `8088`.

Jadi URL backend ketika dijalankan dengan Docker adalah:

```txt
http://localhost:8088
```

Contoh health check:

```txt
http://localhost:8088/health
```

Untuk PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:8088/health" -Method GET -UseBasicParsing
```

Ekspektasi response:

```json
{"status":"ok","service":"tugas3-ii4021-chat-backend"}
```

Port `8088` digunakan sebagai port host karena pada perangkat pengujian port `3000` dan `3001` tidak dapat digunakan oleh konfigurasi Windows. Di dalam container, backend tetap berjalan pada port `3000`.

## 6. Menghentikan Docker

Tekan `Ctrl + C` pada terminal Docker, lalu jalankan:

```bash
docker compose down
```

## 7. Alternatif: Menjalankan Tanpa Docker

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
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