# Panduan Kontribusi untuk Website Kamus Bahasa Moy

Terima kasih telah mempertimbangkan untuk berkontribusi pada proyek Website Kamus Bahasa Moy! Kontribusi dari komunitas sangat berharga dalam upaya pelestarian bahasa daerah melalui teknologi.

## Prasyarat

Sebelum mulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) 22.12 atau lebih baru
- [pnpm](https://pnpm.io/installation) 10 atau lebih baru
- [Python](https://www.python.org/) 3.13 atau lebih baru
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — package manager Python

## Setup Environment

1. Fork repositori ini, lalu clone fork Anda:

   ```bash
   git clone https://github.com/<username-anda>/kamusbahasamoy.git
   cd kamusbahasamoy
   ```

2. Install semua dependensi frontend (dari root monorepo):

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
   cd apps/api
   uv run alembic upgrade head
   uv run python scripts/seed.py
   cd ../..
   ```

5. Jalankan semua aplikasi sekaligus:

   ```bash
   pnpm dev
   ```

   - Frontend: `http://localhost:4321`
   - Backend API: `http://localhost:5000`
   - Dokumentasi API: `http://localhost:5000/docs`

## Struktur Monorepo

Proyek ini menggunakan **Turborepo** dengan **pnpm workspaces**:

```
kamusbahasamoy/
├── apps/
│   ├── web/          # Frontend — Astro + React, deploy ke Cloudflare Pages
│   └── api/          # Backend — FastAPI + SQLite, dijalankan secara terpisah
├── turbo.json        # Konfigurasi pipeline Turborepo
├── pnpm-workspace.yaml
└── package.json      # Root workspace
```

### Menjalankan satu aplikasi saja

```bash
# Hanya frontend
pnpm --filter @kamusbahasamoy/web dev

# Hanya backend
cd apps/api && uv run uvicorn app.main:app --reload --port 5000
```

### Menambah dependensi

```bash
# Tambah dependensi ke package tertentu
pnpm --filter @kamusbahasamoy/web add <package>

# Tambah dependensi Python ke backend
cd apps/api && uv add <package>
```

## Alur Kerja Kontribusi

1. **Buat branch baru dari `main`:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b <tipe>/<deskripsi-singkat>
   ```

   Contoh nama branch:
   - `feat/tambah-fitur-pencarian`
   - `fix/perbaiki-cors-api`
   - `docs/update-readme`
   - `refactor/struktur-komponen`

2. **Lakukan perubahan** di branch Anda.

3. **Pastikan build berhasil** dari root sebelum membuat PR:

   ```bash
   pnpm build
   ```

4. **Commit perubahan** (lihat konvensi di bawah).

5. **Push branch** ke fork Anda:

   ```bash
   git push origin <nama-branch>
   ```

6. **Buat Pull Request** ke branch `main` di repositori utama.

## Konvensi Commit

Gunakan format berikut untuk pesan commit:

```
<tipe>: <deskripsi singkat dalam bahasa Indonesia>
```

Tipe yang tersedia:

| Tipe       | Digunakan untuk                                 |
| ---------- | ----------------------------------------------- |
| `feat`     | Fitur baru                                      |
| `fix`      | Perbaikan bug                                   |
| `docs`     | Perubahan dokumentasi                           |
| `refactor` | Refaktor kode tanpa perubahan fungsionalitas    |
| `style`    | Perubahan tampilan/CSS tanpa perubahan logika   |
| `test`     | Menambah atau memperbaiki pengujian             |
| `chore`    | Perubahan konfigurasi, tooling, atau dependensi |

Contoh:

```
feat: tambah fitur filter kata berdasarkan kelas kata
fix: perbaiki CORS yang memblokir akses frontend ke API
docs: perbarui README untuk struktur monorepo
```

## Panduan Pull Request

- Pastikan PR Anda merujuk ke issue terkait (gunakan `Closes #<nomor-issue>` di deskripsi PR)
- Satu PR sebaiknya fokus pada satu perubahan atau fitur
- Jalankan `pnpm build` dari root dan pastikan tidak ada error sebelum mengajukan PR
- Tambahkan deskripsi yang jelas tentang apa yang berubah dan mengapa

## Kontak

Jika Anda memiliki pertanyaan, silakan hubungi kami di:

- Email: contact@papuaopensource.org
- Website: www.papuaopensource.org

Terima kasih atas minat dan dukungan Anda terhadap pelestarian Bahasa Moy!
