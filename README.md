# Vibe Coding Backend API

## Tentang Aplikasi
Aplikasi ini adalah RESTful API backend yang dirancang secara modern dan cepat menggunakan **ElysiaJS**. Aplikasi ini menyediakan fitur manajemen pengguna dasar seperti Registrasi, Autentikasi (Login/Logout), dan pengambilan profil pengguna (Get Current User) dengan pendekatan keamanan menggunakan *Bearer Token* yang persisten di dalam database (Session-based).

## Technology Stack & Libraries
- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Web Framework for Bun)
- **Database**: MySQL 9.7 (via Docker)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit` (Tipe data yang aman / Type-safe database connection)
- **Security**: `bcrypt` (Hashing Password)
- **Containerization**: Docker & Docker Compose
- **Testing**: `bun test`

## Arsitektur & Struktur Folder
Aplikasi ini menggunakan pola arsitektur modular yang rapi dengan memisahkan antara *routing* (handler HTTP) dan *business logic* (service).

```text
src/
├── app.ts                  # Deklarasi instansi ElysiaJS dan Error Handler Global
├── index.ts                # Entry point aplikasi (menjalankan port listener)
├── db/                     
│   ├── index.ts            # Konfigurasi koneksi database (Drizzle + mysql2)
│   └── schema.ts           # Definisi tabel (Skema Database)
├── exceptions/
│   └── response-error.ts   # Custom error class untuk penanganan HTTP Status
├── routes/
│   └── users-route.ts      # Definisi HTTP endpoint (Elysia routing & validation schema)
└── services/
    └── users-service.ts    # Logika bisnis (Kueri DB, komparasi password, pembentukan token)
tests/
└── users.test.ts           # Unit test menyeluruh untuk semua endpoint
```

**Konvensi Penamaan**:
- Folder menggunakan huruf kecil plural (contoh: `routes`, `services`).
- Nama file menggunakan *kebab-case* dan mencantumkan sufiks perannya untuk memperjelas konteks (contoh: `users-route.ts`, `users-service.ts`).

## Database Schema
Sistem ini menyimpan data ke dalam 2 relasi tabel:

1. **`users`** (Tabel Pengguna)
   - `id`: serial (Primary Key)
   - `name`: varchar(255), Not Null
   - `email`: varchar(255), Not Null, Unique
   - `password`: varchar(255), Not Null (Tersimpan dalam bentuk Hash)
   - `created_at`: timestamp, Default Current Time

2. **`sessions`** (Tabel Sesi Login)
   - `id`: serial (Primary Key)
   - `token`: varchar(255), Not Null (Bearer Token bertipe UUID)
   - `name`: varchar(255), Not Null (Deskripsi sesi)
   - `user_id`: bigint, Not Null (Foreign Key merujuk pada `users.id`)
   - `created_at`: timestamp, Default Current Time

## Daftar API yang Tersedia

### 1. Register User
- **Method & Endpoint**: `POST /api/users/`
- **Request Body** (`application/json`):
  ```json
  {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Password": "secretpassword"
  }
  ```
- **Validasi**: Terdapat validasi *schema* di mana panjang setiap input dibatasi maksimal 255 karakter.
- **Response Sukses**: `200 OK` `{"Data": "OK"}`

### 2. Login User
- **Method & Endpoint**: `POST /api/users/login`
- **Request Body** (`application/json`):
  ```json
  {
    "Email": "john@example.com",
    "Password": "secretpassword"
  }
  ```
- **Response Sukses**: `200 OK` `{"Data": "<uuid-token>"}`

### 3. Get Current User
- **Method & Endpoint**: `GET /api/users/current`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sukses**: `200 OK`
  ```json
  {
    "Data": {
      "id": 1,
      "Name": "John Doe",
      "Email": "john@example.com",
      "Created_at": "2026-05-07T..."
    }
  }
  ```
  *(Catatan: Password tidak pernah diekspos pada response).*

### 4. Logout User
- **Method & Endpoint**: `DELETE /api/users/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Deskripsi**: Menghapus sesi / token yang valid secara permanen dari database.
- **Response Sukses**: `200 OK` `{"Data": "OK"}`

## Dokumentasi API (Swagger UI)
Aplikasi ini sudah dilengkapi dengan dokumentasi interaktif menggunakan Swagger UI. Developer dapat melihat skema request/response, tipe data, serta melakukan uji coba endpoint secara langsung dari browser.

**Cara Mengakses:**
1. Jalankan aplikasi (`bun run dev`).
2. Buka browser dan akses alamat: **[http://localhost:3000/swagger](http://localhost:3000/swagger)**.

## Cara Setup Project
1. Lakukan kloning repositori ke komputer Anda.
2. Pastikan file variabel lingkungan (`.env`) sudah diatur dengan benar (sesuaikan dengan isi `.env.example` jika ada, dan pastikan `DATABASE_URL` mengarah pada instance database lokal).
3. Lakukan instalasi semua *dependencies* (paket):
   ```bash
   bun install
   ```

## Cara Menjalankan Aplikasi
1. Nyalakan layanan database MySQL menggunakan Docker Compose:
   ```bash
   docker compose up -d
   ```
2. Lakukan sinkronisasi/migrasi skema ke tabel database sungguhan menggunakan Drizzle:
   ```bash
   bun run db:push
   ```
3. Jalankan server aplikasi pada mode *development* (dilengkapi *hot-reload*):
   ```bash
   bun run dev
   ```
   Aplikasi API akan dapat diakses pada alamat `http://localhost:3000`.

## Cara Menjalankan Test
Aplikasi telah dilengkapi dengan *Unit Test Case* lengkap untuk memvalidasi alur skenario sukses maupun antisipasi kesalahan (*error handling* / validasi masukan).

Untuk menjalankan pengujian, eksekusi perintah:
```bash
bun test
```
*Catatan: Test suite secara otomatis akan membersihkan seluruh data (Truncate) dari tabel `users` dan `sessions` sebelum dan selama masa pengujian berlangsung demi menjaga konsistensi dari state hasil tes.*
