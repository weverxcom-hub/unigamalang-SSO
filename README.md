# UNIGA SSO — Single Sign-On Gateway

Sistem autentikasi terpusat (SSO) untuk semua aplikasi internal
Universitas Gajayana Malang. Login 1 kali, otomatis masuk ke semua
aplikasi yang terhubung..

## Fitur

- **Login terpusat** — satu halaman login untuk semua aplikasi
- **Auto-login** — jika sudah login di SSO, aplikasi lain langsung
  mendapat sesi tanpa input ulang
- **Dashboard admin** — kelola pengguna dan aplikasi terdaftar
- **Role per-app** — setiap pengguna bisa punya role berbeda di setiap
  aplikasi (misal: ADMIN di Persuratan, HR di KGB)
- **OAuth2 flow** — standard authorization code flow

## Alur SSO

```
User → App (belum login)
  → Redirect ke SSO /authorize?client_id=xxx&redirect_uri=xxx
  → SSO /login (jika belum ada sesi SSO)
  → User login → SSO buat sesi + auth code
  → Redirect balik ke App /auth/callback?code=xxx
  → App tukar code → dapat access_token + user info
  → App buat sesi lokal → User sudah login
```

## Tech Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL
- `jose` (JWT)
- `bcryptjs`
- Tailwind CSS

## Menjalankan Secara Lokal

```bash
# 1. Clone & install
git clone https://github.com/weverxcom-hub/uniga-sso.git
cd uniga-sso
npm install

# 2. Konfigurasi
cp .env.example .env
# Sesuaikan DATABASE_URL dan SSO_JWT_SECRET

# 3. Migrasi + seed
npx prisma migrate deploy
npm run db:seed

# 4. Jalankan
npm run dev
# Buka http://localhost:3000
```

### Akun Demo

| Email                              | Password   |
|------------------------------------|------------|
| admin@unigamalang.ac.id            | admin123   |
| hr@unigamalang.ac.id               | hr12345    |
| rektor@unigamalang.ac.id           | rektor123  |
| dewi.anggraeni@unigamalang.ac.id   | pegawai123 |

### Dev Client Secrets

| App          | Client ID      | Secret                    |
|--------------|----------------|---------------------------|
| Persuratan   | `persuratan`   | `persuratan-dev-secret`   |
| Inventarisir | `inventarisir` | `inventarisir-dev-secret` |
| KGB          | `kgb`          | `kgb-dev-secret`          |

## API Endpoints

### `GET /authorize`

Authorization endpoint. Redirect user ke sini dari client app.

Query params:
- `client_id` — ID aplikasi terdaftar
- `redirect_uri` — URL callback di client app
- `state` — (opsional) random string untuk CSRF protection

### `POST /api/token`

Token exchange. Client app kirim auth code + credentials.

Body (JSON):
```json
{
  "code": "authorization_code_dari_redirect",
  "client_id": "persuratan",
  "client_secret": "client_secret_yang_didapat_saat_registrasi"
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

Get user info from access token.

Header: `Authorization: Bearer <access_token>`
Query: `?client_id=persuratan` (opsional, untuk include role)

## Menambahkan Aplikasi Baru

1. Login ke SSO Dashboard → Aplikasi → Daftarkan Aplikasi Baru
2. Simpan `client_secret` yang ditampilkan
3. Di aplikasi baru, tambahkan:
   - Route `/auth/callback` yang menerima `?code=xxx`
   - Redirect ke SSO `/authorize` saat user belum login
   - Tukar code di `/api/token` → dapat user info → buat sesi lokal

Lihat `docs/sso-client-integration.md` untuk panduan lengkap.
