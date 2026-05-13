# SSO — Universitas Gajayana Malang

<p align="center">
  <img src="public/logo-uniga.png" alt="Logo UNIGA" width="80" />
</p>

<p align="center">
  <strong>Sistem Single Sign-On (SSO) terpusat untuk semua aplikasi internal Universitas Gajayana Malang.</strong><br>
  Login 1 kali, otomatis masuk ke semua aplikasi yang terhubung.
</p>

---

## Fitur

- **Login Terpusat** — satu halaman login untuk semua aplikasi UNIGA
- **Auto-Login** — jika sudah login di SSO, aplikasi lain langsung masuk tanpa input ulang
- **Dashboard Admin** — kelola pengguna, aplikasi terdaftar, dan monitoring sesi
- **Role per-App** — setiap pengguna bisa punya role berbeda di setiap aplikasi
- **OAuth2 Standard** — authorization code flow sesuai standar industri
- **7 Hari Sesi** — sesi SSO berlaku 7 hari sebelum perlu login ulang

## Aplikasi yang Terhubung

| Aplikasi | Domain | Fungsi |
|----------|--------|--------|
| **Persuratan** | `surat.unigamalang.ac.id` | Penomoran & arsip surat |
| **Inventarisir** | `inventaris.unigamalang.ac.id` | Inventaris barang |

## Alur SSO

```
1. User buka Persuratan → belum login → klik "Masuk dengan UNIGA SSO"
2. Redirect ke SSO Gateway → user login dengan email @unigamalang.ac.id
3. SSO buat sesi + auth code → redirect balik ke Persuratan
4. Persuratan tukar code → dapat token + info user → user masuk
5. User buka Inventarisir → klik SSO → sesi SSO masih aktif → OTOMATIS LOGIN
```

## Tech Stack

- **Next.js 14** (App Router)
- **Prisma** + PostgreSQL (Supabase)
- **jose** (JWT signing/verification)
- **bcryptjs** (password hashing)
- **Tailwind CSS** (styling)
- **Vercel** (hosting)

---

## Panduan Instalasi

### Prasyarat

- Node.js 18+ dan npm
- PostgreSQL database (bisa pakai [Supabase](https://supabase.com) gratis)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/weverxcom-hub/unigamalang-SSO.git
cd unigamalang-SSO
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# Connection string pooled (untuk runtime)
# Jika pakai Supabase, gunakan port 6543 dengan ?pgbouncer=true
DATABASE_URL="postgresql://postgres.[project-ref]:[PASSWORD]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connection string direct (untuk migration)
# Jika pakai Supabase, gunakan port 5432
DIRECT_URL="postgresql://postgres.[project-ref]:[PASSWORD]@aws-1-[region].pooler.supabase.com:5432/postgres"

# JWT secret — string acak minimal 32 karakter
SSO_JWT_SECRET="ganti-dengan-string-acak-yang-panjang-dan-aman"
```

**Cara mendapatkan connection string dari Supabase:**
1. Buka [supabase.com](https://supabase.com) → New Project
2. Buat project dengan nama `uniga-sso`
3. Setelah project dibuat, klik **Connect** → pilih tab **ORM** → pilih **Prisma**
4. Copy `DATABASE_URL` (port 6543) dan `DIRECT_URL` (port 5432)
5. Ganti `[YOUR-PASSWORD]` dengan password database

### Step 4: Migrasi Database

```bash
npx prisma migrate deploy
```

### Step 5: Seed Data Demo

```bash
npm run db:seed
```

Ini akan membuat user demo dan mendaftarkan 3 aplikasi client.

### Step 6: Jalankan

```bash
npm run dev
# Buka http://localhost:3000
```

---

## Deploy ke Vercel

### Step 1: Push ke GitHub

```bash
git push origin main
```

### Step 2: Import di Vercel

1. Buka [vercel.com](https://vercel.com) → Import Git Repository
2. Pilih repo `unigamalang-SSO`
3. Framework: **Next.js**
4. Production Branch: **main**

### Step 3: Set Environment Variables

Di Vercel dashboard → Settings → Environment Variables:

| Variable | Nilai | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://...6543/postgres?pgbouncer=true` | Connection pooled dari Supabase |
| `DIRECT_URL` | `postgresql://...5432/postgres` | Connection direct dari Supabase |
| `SSO_JWT_SECRET` | `string-acak-32-karakter` | Secret untuk JWT token |

### Step 4: Deploy & Migrasi

1. Deploy akan berjalan otomatis setelah push
2. Setelah deploy berhasil, jalankan migrasi dari terminal lokal:

```bash
# Set DIRECT_URL ke connection string Supabase
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## Konfigurasi Aplikasi Client

Untuk menghubungkan aplikasi ke SSO, set environment variables berikut di Vercel project aplikasi:

### Persuratan (`surat.unigamalang.ac.id`)

```env
SSO_BASE_URL=https://unigamalang-sso.vercel.app
SSO_CLIENT_ID=persuratan
SSO_CLIENT_SECRET=persuratan-dev-secret
SSO_REDIRECT_URI=https://surat.unigamalang.ac.id/auth/callback
```

### Inventarisir (`inventaris.unigamalang.ac.id`)

```env
SSO_BASE_URL=https://unigamalang-sso.vercel.app
SSO_CLIENT_ID=inventarisir
SSO_CLIENT_SECRET=inventarisir-dev-secret
SSO_REDIRECT_URI=https://inventaris.unigamalang.ac.id/auth/callback
NEXT_PUBLIC_SSO_LOGIN_URL=https://unigamalang-sso.vercel.app/login?client_id=inventarisir&redirect_uri=https://inventaris.unigamalang.ac.id/auth/callback
```

> **Catatan:** Inventarisir membutuhkan `NEXT_PUBLIC_SSO_LOGIN_URL` tambahan karena menggunakan client-side environment variable.

---

## Akun Demo

| Email | Password | Role |
|-------|----------|------|
| `admin@unigamalang.ac.id` | `admin123` | SUPER_ADMIN di semua app |
| `hr@unigamalang.ac.id` | `hr12345` | ADMIN_UNIT |
| `rektor@unigamalang.ac.id` | `rektor123` | ADMIN_UNIT |
| `dewi.anggraeni@unigamalang.ac.id` | `pegawai123` | USER |

---

## API Endpoints

### `GET /authorize`

Authorization endpoint. Redirect user ke sini dari client app.

| Parameter | Keterangan |
|-----------|------------|
| `client_id` | ID aplikasi terdaftar |
| `redirect_uri` | URL callback di client app |
| `state` | (opsional) random string untuk CSRF protection |

### `POST /api/token`

Tukar authorization code dengan access token.

```json
{
  "code": "authorization_code_dari_redirect",
  "client_id": "persuratan",
  "client_secret": "secret_yang_didapat_saat_registrasi"
}
```

Response:
```json
{
  "access_token": "jwt_token",
  "token_type": "Bearer",
  "user": {
    "id": "cuid",
    "email": "admin@unigamalang.ac.id",
    "name": "Administrator",
    "role": "SUPER_ADMIN"
  }
}
```

### `GET /api/userinfo`

Get user info dari access token.

- Header: `Authorization: Bearer <access_token>`
- Query: `?client_id=persuratan` (opsional, untuk include role)

---

## Menambahkan Aplikasi Baru

1. Login ke SSO Dashboard → menu **Aplikasi** → form **Daftarkan Aplikasi Baru**
2. Isi Client ID, Nama Aplikasi, dan Redirect URI
3. **Simpan Client Secret** yang muncul (hanya ditampilkan sekali!)
4. Di aplikasi baru, set env vars:
   ```env
   SSO_BASE_URL=https://unigamalang-sso.vercel.app
   SSO_CLIENT_ID=<client_id>
   SSO_CLIENT_SECRET=<client_secret>
   SSO_REDIRECT_URI=<redirect_uri>
   ```
5. Tambahkan route `/auth/callback` di aplikasi — lihat contoh di repo Persuratan atau Inventarisir

---

## Lisensi

Dibuat untuk Universitas Gajayana Malang.
