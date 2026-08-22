# Deployment Backend

Workflow `.github/workflows/deploy.yml` hanya melakukan deployment backend FastAPI ke server Debian. Frontend dipublikasikan otomatis melalui integrasi Cloudflare Pages dan tidak membutuhkan konfigurasi Cloudflare pada workflow ini.

Deployment backend berjalan ketika file di `apps/api` atau workflow deployment berubah pada branch `main`. Deployment juga dapat dijalankan manual melalui GitHub Actions.

## Konfigurasi GitHub

Buat environment GitHub bernama `production`, kemudian tambahkan secrets berikut.

| Secret            | Isi                                      |
| ----------------- | ---------------------------------------- |
| `SERVER_HOST`     | Host atau alamat IP server Debian        |
| `SERVER_PORT`     | Port SSH server                          |
| `SERVER_USERNAME` | Pengguna deployment pada server          |
| `SSH_PRIVATE_KEY` | Private key untuk masuk ke server Debian |

## Persiapan Satu Kali pada Debian

Seluruh konfigurasi service tetap disiapkan di luar workflow. Sebelum deployment dijalankan, server harus sudah memiliki:

- akses tulis ke `/var/www/kamusbahasamoy` atau `/var/www` untuk clone pertama;
- deploy key GitHub pada `~/.ssh/kamusbahasamoy`;
- file environment production pada `/var/www/kamusbahasamoy/apps/api/.env` sebelum aplikasi dijalankan;
- Git, curl, dan uv yang dapat dipanggil oleh pengguna deployment;
- service Supervisor bernama `kamusbahasamoy` yang sudah dikonfigurasi;
- izin untuk menjalankan `sudo supervisorctl restart kamusbahasamoy` tanpa prompt interaktif.

Workflow melakukan clone awal jika `/var/www/kamusbahasamoy/.git` belum tersedia. Workflow tidak menulis `.env` atau mengubah konfigurasi Supervisor.

Workflow menggunakan tiga job berurutan:

1. **Pull Latest Commit on Server** melakukan clone jika diperlukan, lalu mengambil commit terbaru.
2. **Install Dependencies and Prepare Database** menyinkronkan dependensi production, menjalankan migrasi Alembic, lalu memuat ulang data awal.
3. **Restart and Verify FastAPI** me-restart service Supervisor yang sudah tersedia, lalu memeriksa endpoint health.

Job berikutnya hanya berjalan jika job sebelumnya berhasil, sehingga kegagalan sinkronisasi, migrasi, atau restart dapat terlihat secara terpisah di GitHub Actions.

FastAPI berjalan melalui Uvicorn pada `127.0.0.1:5000` dengan dua worker. Gunakan Nginx atau reverse proxy lain untuk meneruskan domain API publik ke alamat tersebut dan menangani HTTPS.

Deployment baru dinyatakan berhasil jika `http://127.0.0.1:5000/health` mengembalikan respons sehat.

## Frontend Cloudflare Pages

Hubungkan repository ke Cloudflare Pages menggunakan integrasi Git. Atur `PUBLIC_API_URL` pada environment build Cloudflare agar mengarah ke domain backend publik, misalnya:

```dotenv
PUBLIC_API_URL=https://api.kamusbahasamoy.web.id
```

Konfigurasi build frontend mengikuti aplikasi Astro di `apps/web`; GitHub Actions tidak menjalankan build atau deployment frontend.
