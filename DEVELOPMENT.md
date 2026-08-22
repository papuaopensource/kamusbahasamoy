# Panduan Development

Dokumen ini menjelaskan setup lokal dan pola pengembangan untuk frontend Astro serta backend FastAPI di monorepo kamusbahasamoy.

## Struktur Proyek

```text
kamusbahasamoy/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── components/   # Komponen antarmuka Astro
│   │       ├── layouts/      # Layout bersama
│   │       ├── lib/          # Client API dan utilitas
│   │       ├── pages/        # Halaman dan route Astro
│   │       ├── styles/       # Styling global Tailwind CSS
│   │       └── alpine.ts     # State dan interaksi Alpine.js
│   └── api/
│       ├── alembic/          # Migrasi database
│       ├── app/              # Aplikasi, model, schema, dan router FastAPI
│       ├── data/             # Data sumber kosakata dan lagu
│       ├── scripts/          # Script seed database
│       └── tests/            # Test backend
├── .github/workflows/        # Otomatisasi deployment backend
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Prasyarat

- [Node.js](https://nodejs.org/) 22.12 atau lebih baru
- [pnpm](https://pnpm.io/installation) 10 atau lebih baru
- [Python](https://www.python.org/) 3.13 atau lebih baru
- [uv](https://docs.astral.sh/uv/getting-started/installation/) untuk environment dan dependensi Python

SQLite digunakan secara default dan tidak membutuhkan server database terpisah. PostgreSQL dapat digunakan jika diperlukan.

## Setup Lokal

1. Clone repository dan masuk ke direktorinya:

   ```bash
   git clone https://github.com/papuaopensource/kamusbahasamoy.git
   cd kamusbahasamoy
   ```

2. Install dependensi workspace dan backend:

   ```bash
   pnpm install
   (cd apps/api && uv sync)
   ```

3. Buat file environment lokal:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. Terapkan migrasi dan isi database dengan data awal:

   ```bash
   pnpm db:init
   ```

5. Jalankan frontend dan backend:

   ```bash
   pnpm dev
   ```

Layanan development tersedia di:

- Frontend: `http://localhost:4321`
- Backend API: `http://localhost:5000`
- OpenAPI/Swagger: `http://localhost:5000/docs`
- Health check API: `http://localhost:5000/health`

## Environment

| File            | Variabel         | Kegunaan                               |
| --------------- | ---------------- | -------------------------------------- |
| `apps/api/.env` | `DATABASE_URL`   | URL koneksi SQLite atau PostgreSQL     |
| `apps/web/.env` | `PUBLIC_API_URL` | Base URL backend yang diakses frontend |

Konfigurasi lokal bawaan:

```dotenv
# apps/api/.env
DATABASE_URL=sqlite:///./kamus.db

# apps/web/.env
PUBLIC_API_URL=http://localhost:5000
```

Jangan commit file `.env` atau kredensial produksi.

Untuk PostgreSQL, gunakan URL seperti berikut pada `apps/api/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/kamus
```

## Perintah Workspace

Jalankan perintah berikut dari root repository.

| Perintah                              | Fungsi                                                 |
| ------------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                            | Menjalankan frontend dan backend melalui Turborepo     |
| `pnpm build`                          | Membuat build production semua aplikasi                |
| `pnpm lint`                           | Menjalankan linter semua workspace                     |
| `pnpm lint:fix`                       | Memperbaiki temuan lint yang dapat diperbaiki otomatis |
| `pnpm format`                         | Memformat dan menulis ulang file yang didukung         |
| `pnpm test`                           | Menjalankan test semua workspace                       |
| `pnpm check:all`                      | Menjalankan lint, format, lalu test                    |
| `pnpm db:migrate`                     | Menerapkan seluruh migrasi database                    |
| `pnpm db:migration:create -- "pesan"` | Membuat migrasi Alembic baru                           |
| `pnpm db:seed`                        | Memuat ulang data kosakata dan lagu                    |
| `pnpm db:init`                        | Menjalankan migrasi lalu seed                          |

`pnpm format` dan `pnpm check:all` dapat mengubah file. Periksa diff setelah menjalankannya.

Untuk menjalankan satu aplikasi saja:

```bash
pnpm --filter @kamusbahasamoy/web dev
pnpm --filter @kamusbahasamoy/api dev
```

## Pengembangan Frontend

Frontend menggunakan Astro dengan output statis, Tailwind CSS, Alpine.js, dan font Onest.

- Buat halaman pada `apps/web/src/pages` menggunakan file `.astro`.
- Gunakan komponen `.astro` untuk antarmuka yang digunakan ulang.
- Letakkan state dan interaksi browser pada `apps/web/src/alpine.ts` dengan Alpine.js.
- Gunakan utility Tailwind CSS dan token global di `apps/web/src/styles/global.css`.
- Gunakan `apps/web/src/lib/api.ts` sebagai client untuk berkomunikasi dengan FastAPI.
- Jangan menambahkan React, TSX, shadcn/ui, atau library komponen lain tanpa kebutuhan dan pembahasan yang jelas.

Periksa build frontend setelah mengubah halaman, komponen, konfigurasi, atau interaksi:

```bash
pnpm --filter @kamusbahasamoy/web build
```

Karena `PUBLIC_API_URL` dimasukkan saat proses build, pastikan nilainya sudah benar pada environment Cloudflare Pages. Deployment frontend berjalan otomatis melalui integrasi Cloudflare dan tidak ditangani oleh `.github/workflows/deploy.yml`.

## Pengembangan Backend

Kode utama FastAPI berada di `apps/api/app`:

- `main.py` menginisialisasi aplikasi, CORS, router, dan health check.
- `routers/` mendefinisikan endpoint kamus dan lagu.
- `models/` mendefinisikan model SQLAlchemy.
- `schemas/` mendefinisikan schema request dan response.
- `database.py` mengatur engine serta session database.

Jalankan pemeriksaan backend secara langsung dari `apps/api`:

```bash
uv run ruff check .
uv run pytest
```

### Migrasi Database

```bash
cd apps/api

uv run alembic upgrade head
uv run alembic revision --autogenerate -m "deskripsi perubahan"
uv run alembic downgrade -1
```

Selalu periksa isi migrasi hasil autogenerate sebelum menerapkannya.

### Data Awal

Data sumber berada di:

- `apps/api/data/dictionary.json`
- `apps/api/data/songs.json`

Jalankan `pnpm db:seed` setelah memperbarui data. Script seed menghapus data kamus dan lagu yang sudah ada, lalu memuat ulang seluruh isi dari kedua file JSON tersebut.

## Menambah Dependensi

```bash
# Dependensi frontend
pnpm --filter @kamusbahasamoy/web add <package>

# Dev dependency frontend
pnpm --filter @kamusbahasamoy/web add -D <package>

# Dependensi backend
cd apps/api && uv add <package>

# Dev dependency backend
cd apps/api && uv add --dev <package>
```

Commit perubahan lockfile yang dihasilkan bersama perubahan dependensinya.

## Deployment

Frontend dipublikasikan otomatis oleh Cloudflare Pages. Workflow `.github/workflows/deploy.yml` hanya melakukan deployment FastAPI ke server Debian ketika file backend atau workflow berubah di branch `main`.

Persyaratan server, secrets GitHub, dan alur health check dijelaskan di [DEPLOYMENT.md](DEPLOYMENT.md). Konfigurasi server dan Supervisor dikelola langsung pada server, bukan oleh workflow.
