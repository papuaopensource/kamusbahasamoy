# Panduan Development

## Struktur Proyek

Proyek ini menggunakan struktur monorepo dengan [Turborepo](https://turbo.build/) dan [pnpm workspaces](https://pnpm.io/workspaces).

```sh
kamusbahasamoy/
├── apps/
│   ├── web/          # Frontend Astro + React (Cloudflare Pages)
│   └── api/          # Backend FastAPI + SQLite
├── turbo.json        # Konfigurasi pipeline Turborepo
├── pnpm-workspace.yaml
└── package.json      # Root workspace
```

## Prasyarat

- [Node.js](https://nodejs.org/) 22.12 atau lebih baru
- [pnpm](https://pnpm.io/installation) 10 atau lebih baru
- [Python](https://www.python.org/) 3.13 atau lebih baru
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — package manager Python

## Setup

1. Clone repositori:

   ```bash
   git clone https://github.com/papuaopensource/kamusbahasamoy.git
   cd kamusbahasamoy
   ```

2. Install semua dependensi:

   ```bash
   pnpm install
   ```

3. Salin file environment:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. Jalankan migrasi database dan isi data awal:

   ```bash
   pnpm db:init
   ```

5. Jalankan semua aplikasi sekaligus:

   ```bash
   pnpm dev
   ```

   - Frontend: `http://localhost:4321`
   - Backend API: `http://localhost:5000`
   - Dokumentasi API: `http://localhost:5000/docs`

## Menjalankan Satu Aplikasi Saja

```bash
# Hanya frontend
pnpm --filter @kamusbahasamoy/web dev

# Hanya backend
pnpm --filter @kamusbahasamoy/api dev
```

### Database

Secara default, API menggunakan **SQLite**. Data disimpan di `apps/api/kamus.db` dan konfigurasi berada di `apps/api/.env`.

Jika ingin menggunakan **PostgreSQL**:

Ubah `DATABASE_URL` di `apps/api/.env`, misalnya:

```sh
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/kamus
```

## Build untuk Production

```bash
pnpm build
```

Hasil build frontend tersedia di `apps/web/dist/`.

## Migrasi Database

```bash
cd apps/api

# Terapkan semua migrasi
uv run alembic upgrade head

# Buat migrasi baru
uv run alembic revision --autogenerate -m "deskripsi perubahan"

# Rollback satu langkah
uv run alembic downgrade -1
```

## Linting dan Formatting

### Menjalankan secara manual

```bash
pnpm run lint

pnpm run format

# Atau gunakan command check:all untuk menjalankan linter dan format

pnpm run check:all
```

### Menjalankan Test

```bash
# Menjalankan semua test di monorepo
pnpm test

# Menjalankan test di backend
cd apps/api && pnpm test
```

## Menambah Dependensi

```bash
# Tambah dependensi ke package tertentu
pnpm --filter @kamusbahasamoy/web add <package>

# Tambah dependensi Python ke backend
cd apps/api && uv add <package>
```
