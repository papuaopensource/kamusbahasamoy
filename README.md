# kamusbahasamoy

Kamus digital terbuka untuk membantu masyarakat mencari, mempelajari, dan melestarikan kosakata Bahasa Moy dari Jayapura, Papua.

[![All Contributors](https://img.shields.io/github/contributors/papuaopensource/kamusbahasamoy)](https://github.com/papuaopensource/kamusbahasamoy/graphs/contributors)
![GitHub last commit](https://img.shields.io/github/last-commit/papuaopensource/kamusbahasamoy.svg)
[![License](https://img.shields.io/github/license/papuaopensource/kamusbahasamoy.svg)](LICENSE)

- Website: [kamusbahasamoy.web.id](https://kamusbahasamoy.web.id)
- Aplikasi mobile: [kamusbahasamoy-mobile](https://github.com/papuaopensource/kamusbahasamoy-mobile)

## Fitur

- Terjemahan dua arah antara Bahasa Indonesia dan Bahasa Moy.
- Pencocokan kata tunggal maupun frasa berdasarkan entri yang tersedia.
- Pencarian dan penelusuran kosakata berdasarkan bahasa, kelas kata, serta huruf awal.
- Informasi arti, pelafalan, definisi, contoh penggunaan, dan kata terkait jika tersedia.
- Koleksi lirik lagu Bahasa Moy beserta terjemahannya.
- Halaman informasi, kontribusi, kebijakan privasi, ketentuan, dan kontak.
- Tampilan ringan, responsif, dan mudah digunakan di berbagai ukuran layar.

## Teknologi

Proyek ini menggunakan monorepo [Turborepo](https://turbo.build/) dengan [pnpm workspace](https://pnpm.io/workspaces).

- **Frontend — `apps/web`:** Astro, Tailwind CSS, Alpine.js, dan font Onest. Frontend menghasilkan situs statis yang dipublikasikan otomatis melalui integrasi Cloudflare Pages.
- **Backend — `apps/api`:** FastAPI, SQLAlchemy, Alembic, dan Uvicorn. SQLite digunakan secara default untuk pengembangan, sedangkan PostgreSQL juga didukung.
- **Tooling:** pnpm untuk workspace JavaScript dan uv untuk environment serta dependensi Python.

## Menjalankan Secara Lokal

Pastikan Node.js 22.12+, pnpm 10+, Python 3.13+, dan uv telah tersedia.

```bash
pnpm install
(cd apps/api && uv sync)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:init
pnpm dev
```

Setelah server aktif:

- Frontend: `http://localhost:4321`
- Backend API: `http://localhost:5000`
- Dokumentasi API: `http://localhost:5000/docs`

Panduan lebih lengkap tersedia di [DEVELOPMENT.md](DEVELOPMENT.md). Konfigurasi deployment backend tersedia di [DEPLOYMENT.md](DEPLOYMENT.md).

## Sumber Data

Data awal kosakata diadaptasi dari **Kamus Dwibahasa Mooi** yang diterbitkan oleh **Balai Bahasa Provinsi Papua**. Konten digital dapat terus diperbaiki ketika ditemukan kesalahan penulisan, arti, atau konteks penggunaan.

Jika Anda memahami Bahasa Moy dan menemukan data yang kurang tepat, silakan ajukan koreksi melalui issue atau halaman [Kontak](https://kamusbahasamoy.web.id/kontak/).

## Kontribusi

Kontribusi kode, dokumentasi, data kosakata, dan koreksi bahasa sangat terbuka. Baca [CONTRIBUTING.md](CONTRIBUTING.md) sebelum mengirim perubahan.

Kode sumber ini juga dapat dijadikan dasar untuk mengembangkan website kamus bahasa daerah lainnya. Pastikan sumber data bahasa yang digunakan jelas, libatkan penutur atau pemeriksa yang memahami bahasanya, dan tetap patuhi lisensi proyek.

## Lisensi

Proyek ini dikembangkan oleh [Papua Open Source](https://papuaopensource.org) dan tersedia di bawah lisensi [AGPL-3.0](LICENSE). Adaptasi dan penggunaan ulang harus mempertahankan atribusi serta menyediakan kode sumber sesuai ketentuan lisensi.
