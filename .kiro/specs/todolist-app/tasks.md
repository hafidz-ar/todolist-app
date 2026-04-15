# Implementation Plan: todolist-app

## Overview

Implementasi aplikasi todolist berbasis Vanilla JS (HTML/CSS/JavaScript murni) dengan arsitektur MVC sederhana. Semua logika diorganisasi dalam satu file `app.js` dengan fungsi-fungsi yang dikelompokkan berdasarkan tanggung jawab (Model, View, Controller). Data disimpan di `localStorage` tanpa dependensi eksternal.

## Tasks

- [x] 1. Setup struktur proyek dan konfigurasi testing
  - Buat file `index.html` dengan struktur HTML dasar (input area, task list, filter bar, summary)
  - Buat file `style.css` dengan styling dasar dan kelas `.completed` untuk task selesai
  - Buat file `app.js` kosong dengan komentar pengelompokan (Model / View / Controller)
  - Buat file `package.json` dengan devDependencies `fast-check` dan `vitest`
  - Buat file `tests/unit.test.js` dan `tests/property.test.js` sebagai placeholder
  - _Requirements: 1.1, 2.3, 3.2, 5.1_

- [x] 2. Implementasi Visual Design — Neobrutalism CSS di `style.css`
  - Definisikan CSS custom properties (variabel) di `:root`: `--color-bg`, `--color-surface`, `--color-border`, `--color-primary`, `--color-danger`, `--color-accent`, `--color-text`, `--color-text-muted`, `--color-completed`
  - Terapkan styling `body` dan `.container` dengan border hitam tebal, hard shadow (`box-shadow` tanpa blur), dan `border-radius: 2px`
  - Styling `h1`: `font-size: 2.5rem`, `font-weight: 900`, `text-transform: uppercase`, `border-bottom: 4px solid var(--color-border)`
  - Styling `.input-task`: border tebal, hard shadow, background `var(--color-bg)`, efek focus (shadow membesar)
  - Styling `.btn-add`: background `var(--color-primary)` (kuning), border tebal, hard shadow, efek hover (`translate(-2px, -2px)` + shadow membesar) dan active (`translate(2px, 2px)` + shadow mengecil)
  - Styling `.task-item`: border, hard shadow, class `.completed .task-text` dengan `text-decoration: line-through` dan `color: var(--color-completed)`
  - Styling `.btn-delete`: background `var(--color-danger)` (merah), border, hard shadow, efek hover
  - Styling `.filter-btn`: border, hard shadow, state `.active` dengan background `var(--color-primary)`
  - Semua transisi menggunakan `0.1s ease` — cepat dan mekanis, tanpa animasi fade/blur
  - _Requirements: 2.3, 3.2 — lihat design.md bagian "Visual Design: Neobrutalism"_

- [x] 3. Implementasi Model — fungsi state management
  - [x] 3.1 Implementasi konstanta dan struktur data dasar
    - Definisikan konstanta `FILTERS` (`all`, `active`, `completed`) dan `STORAGE_KEY`
    - Definisikan `initialState` (`tasks: [], filter: 'all'`)
    - _Requirements: 5.1, 5.5_

  - [x] 3.2 Implementasi fungsi `addTask(state, text)`
    - Validasi: trim teks, tolak jika kosong atau panjang > 200 karakter (kembalikan state semula)
    - Buat task baru dengan `id` (format `Date.now()-random`), `text` (trimmed), `completed: false`, `createdAt: Date.now()`
    - Kembalikan state baru dengan task ditambahkan ke array `tasks`
    - _Requirements: 1.2, 1.4, 1.5_

  - [ ]* 3.3 Tulis property test untuk `addTask`
    - **Property 1: Penambahan task yang valid selalu masuk ke list dengan status belum selesai**
    - **Validates: Requirements 1.2**
    - **Property 2: Input whitespace-only dan teks terlalu panjang ditolak**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 3.4 Implementasi fungsi `toggleTask(state, id)`
    - Temukan task berdasarkan `id`, balik nilai `completed`-nya
    - Kembalikan state baru (pure function, tidak mutasi langsung)
    - _Requirements: 3.1, 3.3_

  - [ ]* 3.5 Tulis property test untuk `toggleTask`
    - **Property 3: Toggle adalah involution (round-trip)**
    - **Validates: Requirements 3.1, 3.3**

  - [x] 3.6 Implementasi fungsi `deleteTask(state, id)`
    - Filter array `tasks` untuk menghapus task dengan `id` yang sesuai
    - Kembalikan state baru (pure function)
    - _Requirements: 4.2_

  - [ ]* 3.7 Tulis property test untuk `deleteTask`
    - **Property 4: Penghapusan task bersifat permanen dan tepat sasaran**
    - **Validates: Requirements 4.2**

  - [x] 3.8 Implementasi fungsi `setFilter(state, filter)`
    - Kembalikan state baru dengan `filter` diperbarui
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 4. Implementasi Model — persistensi localStorage
  - [ ] 4.1 Implementasi fungsi `saveState(state)`
    - Simpan state ke `localStorage` dengan key `STORAGE_KEY` dalam format JSON
    - Tangkap exception `QuotaExceededError` — lanjutkan tanpa menyimpan
    - _Requirements: 6.1_

  - [ ] 4.2 Implementasi fungsi `loadState()`
    - Baca dan parse JSON dari `localStorage`
    - Validasi struktur: harus objek dengan `tasks` berupa array; jika tidak valid kembalikan `initialState`
    - Tangkap exception jika `localStorage` tidak tersedia atau JSON rusak — kembalikan `initialState`
    - _Requirements: 6.2, 6.3_

  - [ ]* 4.3 Tulis property test untuk `saveState` dan `loadState`
    - **Property 7: Persistensi data adalah round-trip yang lossless**
    - **Validates: Requirements 6.2**
    - **Property 8: Data localStorage yang tidak valid menghasilkan state awal yang bersih**
    - **Validates: Requirements 6.3**

- [ ] 5. Checkpoint — Pastikan semua tests Model lulus
  - Jalankan `npx vitest --run` dan pastikan semua property test dan unit test untuk Model lulus.
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum melanjutkan.

- [ ] 6. Implementasi View — fungsi rendering
  - [ ] 6.1 Implementasi fungsi `getFilteredTasks(tasks, filter)`
    - Kembalikan subset tasks sesuai nilai filter (`all` → semua, `active` → belum selesai, `completed` → selesai)
    - Urutkan berdasarkan `createdAt` ascending (terlama di atas, terbaru di bawah)
    - _Requirements: 2.1, 5.2, 5.3, 5.4_

  - [ ]* 6.2 Tulis property test untuk `getFilteredTasks`
    - **Property 5: Filter mengembalikan subset yang tepat**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - **Property 6: Urutan tampilan task sesuai waktu penambahan**
    - **Validates: Requirements 2.1**

  - [ ] 6.3 Implementasi fungsi `renderTaskList(tasks, filter)`
    - Render elemen `<ul>` dengan `<li>` untuk setiap task hasil `getFilteredTasks`
    - Setiap `<li>` berisi: checkbox (dengan status `checked` sesuai `completed`), teks task, tombol hapus
    - Tambahkan class CSS `completed` pada `<li>` jika task selesai (teks dicoret)
    - Jika tidak ada task yang ditampilkan, render pesan empty state
    - _Requirements: 2.2, 2.3, 3.2, 4.1_

  - [ ]* 6.4 Tulis unit test untuk `renderTaskList`
    - Verifikasi DOM mengandung input field dan tombol tambah (Requirements 1.1)
    - Verifikasi render dengan `tasks = []` menampilkan pesan empty state (Requirements 2.2)
    - Verifikasi setiap task item memiliki tombol hapus (Requirements 4.1)
    - _Requirements: 1.1, 2.2, 4.1_

  - [ ]* 6.5 Tulis property test untuk render task item
    - **Property 10: Rendering task item selalu mengandung teks dan indikator status**
    - **Validates: Requirements 2.3, 3.2**

  - [ ] 6.6 Implementasi fungsi `renderSummary(tasks)`
    - Hitung jumlah task dengan `completed = false`
    - Render teks ringkasan (misal: "2 dari 5 tugas belum selesai")
    - _Requirements: 7.1, 7.2_

  - [ ]* 6.7 Tulis property test untuk `renderSummary`
    - **Property 9: Ringkasan selalu akurat untuk semua state**
    - **Validates: Requirements 7.1, 7.2**

  - [ ] 6.8 Implementasi fungsi `renderFilters(activeFilter)`
    - Render tiga tombol filter: "Semua", "Belum Selesai", "Selesai"
    - Tandai tombol aktif dengan class CSS yang sesuai
    - _Requirements: 5.1, 5.5_

  - [ ]* 6.9 Tulis unit test untuk `renderFilters`
    - Verifikasi filter bar mengandung tiga tombol dengan label yang benar (Requirements 5.1)
    - Verifikasi filter default "Semua" aktif saat pertama kali dibuka (Requirements 5.5)
    - _Requirements: 5.1, 5.5_

  - [ ] 6.10 Implementasi fungsi `render(state)`
    - Panggil `renderTaskList`, `renderSummary`, dan `renderFilters` dengan data dari state
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 7.1_

- [ ] 7. Implementasi Controller — event handling dan inisialisasi
  - [ ] 7.1 Implementasi fungsi `handleAddTask(state)`
    - Baca nilai dari input field, panggil `addTask`, simpan state baru via `saveState`, kosongkan input, panggil `render`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ] 7.2 Implementasi fungsi `handleToggleTask(state, id)`
    - Panggil `toggleTask`, simpan state baru via `saveState`, panggil `render`
    - _Requirements: 3.1, 3.3, 6.1_

  - [ ] 7.3 Implementasi fungsi `handleDeleteTask(state, id)`
    - Panggil `deleteTask`, simpan state baru via `saveState`, panggil `render`
    - _Requirements: 4.2, 6.1_

  - [ ] 7.4 Implementasi fungsi `handleFilterChange(state, filter)`
    - Panggil `setFilter`, simpan state baru via `saveState`, panggil `render`
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ] 7.5 Implementasi fungsi `init()`
    - Panggil `loadState()` untuk mendapatkan state awal
    - Bind event listener: tombol tambah (klik), input field (keydown Enter), filter buttons (klik)
    - Gunakan event delegation pada task list untuk menangani klik checkbox dan tombol hapus
    - Panggil `render(state)` untuk tampilan awal
    - _Requirements: 1.1, 1.2, 2.1, 5.5, 6.2_

  - [ ] 7.6 Panggil `init()` saat DOM siap (`DOMContentLoaded`)
    - Tambahkan event listener `DOMContentLoaded` di bagian bawah `app.js`
    - _Requirements: 6.2_

- [ ] 8. Checkpoint akhir — Pastikan semua tests lulus
  - Jalankan `npx vitest --run` dan pastikan semua unit test dan property test lulus.
  - Verifikasi semua requirements tercakup.
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum dianggap selesai.

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk keterlacakan
- Semua fungsi Model adalah pure function — mudah diuji tanpa DOM
- Property tests menggunakan library `fast-check` dengan minimum 100 iterasi per property
- Jalankan tests dengan: `npx vitest --run`
