# Todolist App

Aplikasi daftar tugas berbasis web yang sederhana. Dibuat dengan HTML, CSS, dan JavaScript murni — tanpa framework, tanpa build tool.

## Fitur

- Tambah tugas baru (maks. 200 karakter)
- Tandai tugas sebagai selesai
- Hapus tugas
- Filter tugas: Semua / Belum Selesai / Selesai
- Ringkasan jumlah tugas yang belum selesai
- Data tersimpan otomatis di `localStorage`

## Cara Menjalankan

Buka file `todolist-app/index.html` langsung di browser, atau gunakan local server:

```bash
npx serve todolist-app
```

Lalu buka `http://localhost:3000` di browser.

## Menjalankan Tes

```bash
cd todolist-app
npm install
npx vitest --run
```

## Teknologi

- Vanilla JS (ES6 modules)
- HTML5 / CSS3
- localStorage
- [Vitest](https://vitest.dev/) — test runner
- [fast-check](https://fast-check.io/) — property-based testing
