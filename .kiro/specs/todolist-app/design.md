# Design Document: todolist-app

## Overview

Aplikasi todolist-app adalah aplikasi frontend berbasis web yang berjalan sepenuhnya di sisi klien (browser). Tidak ada backend server — semua data disimpan di `localStorage` browser. Pengguna dapat menambahkan, menyelesaikan, memfilter, dan menghapus tugas melalui antarmuka yang responsif.

Teknologi yang digunakan:
- **HTML/CSS/JavaScript** murni (Vanilla JS) — tanpa framework, agar ringan dan mudah di-deploy sebagai file statis
- **localStorage** sebagai mekanisme persistensi data
- Tidak ada dependensi eksternal (zero-dependency)

Keputusan desain utama:
- Arsitektur berbasis modul ES6 untuk pemisahan tanggung jawab yang jelas
- State management sederhana berbasis objek tunggal (`AppState`) yang menjadi sumber kebenaran tunggal
- Rendering ulang UI dilakukan secara reaktif setiap kali state berubah

---

## Architecture

Aplikasi menggunakan pola **MVC sederhana** yang disesuaikan untuk lingkungan browser tanpa framework:

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   View   │◄───│  Controller  │───►│   Model   │  │
│  │ (render) │    │  (handlers)  │    │  (state)  │  │
│  └──────────┘    └──────────────┘    └─────┬─────┘  │
│                                            │        │
│                                     ┌──────▼──────┐ │
│                                     │localStorage │ │
│                                     └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Alur data (unidirectional):**
1. Pengguna berinteraksi dengan View (klik, input)
2. Controller menangkap event dan memanggil fungsi Model
3. Model memperbarui AppState dan menyinkronkan ke localStorage
4. Controller memanggil fungsi render View dengan state terbaru

**Struktur file:**
```
todolist-app/
├── index.html          # Entry point, struktur HTML
├── style.css           # Styling dan responsivitas
└── app.js              # Logika aplikasi (Model + Controller + View)
```

Karena aplikasi ini kecil dan tidak memerlukan build tool, semua logika JS diorganisasi dalam satu file `app.js` dengan fungsi-fungsi yang dikelompokkan berdasarkan tanggung jawab (model, view, controller).

---

## Components and Interfaces

### 1. Model (State Management)

Bertanggung jawab atas semua mutasi state dan persistensi data.

```javascript
// Fungsi-fungsi Model
function loadState()           // Memuat state dari localStorage
function saveState(state)      // Menyimpan state ke localStorage
function addTask(state, text)  // Menambahkan task baru, return state baru
function toggleTask(state, id) // Toggle status selesai/belum, return state baru
function deleteTask(state, id) // Menghapus task, return state baru
function setFilter(state, filter) // Mengubah filter aktif, return state baru
```

Semua fungsi model bersifat **pure function** — menerima state lama dan parameter, mengembalikan state baru tanpa mutasi langsung. Ini memudahkan pengujian.

### 2. View (Rendering)

Bertanggung jawab atas rendering DOM berdasarkan state.

```javascript
function render(state)              // Entry point rendering, memanggil sub-render
function renderTaskList(tasks, filter) // Render daftar task yang difilter
function renderSummary(tasks)       // Render ringkasan jumlah task
function renderFilters(activeFilter) // Render tombol filter dengan state aktif
function getFilteredTasks(tasks, filter) // Mengembalikan tasks sesuai filter aktif
```

### 3. Controller (Event Handling)

Menghubungkan interaksi pengguna dengan Model dan View.

```javascript
function init()                    // Inisialisasi app: load state, bind events, render
function handleAddTask(state)      // Handler untuk tambah task
function handleToggleTask(state, id) // Handler untuk toggle task
function handleDeleteTask(state, id) // Handler untuk hapus task
function handleFilterChange(state, filter) // Handler untuk ganti filter
```

### 4. Komponen UI

| Komponen | Elemen HTML | Deskripsi |
|---|---|---|
| Input Area | `<input>` + `<button>` | Input teks dan tombol tambah |
| Task List | `<ul>` + `<li>` | Daftar semua task |
| Task Item | `<li>` dengan checkbox + teks + tombol hapus | Satu item task |
| Filter Bar | Tiga `<button>` | Tombol filter Semua/Belum Selesai/Selesai |
| Summary | `<p>` atau `<span>` | Ringkasan jumlah task |
| Empty State | `<p>` | Pesan saat task list kosong |

---

## Visual Design: Neobrutalism

Aplikasi menggunakan gaya **Neobrutalism** — estetika desain yang menonjolkan kejujuran struktural, kontras tinggi, dan elemen UI yang terasa "nyata" dan berat.

### Prinsip Utama

- **Border hitam tebal** (`border: 3px solid #000` atau lebih tebal) pada semua elemen interaktif dan kartu
- **Hard shadow** (box-shadow offset tanpa blur): `4px 4px 0px #000` — bayangan tajam yang memberi kesan dimensi
- **Palet warna kontras tinggi** dengan latar putih/krem dan aksen warna cerah
- **Tipografi bold** dan ukuran besar untuk heading
- Tidak ada border-radius besar — sudut kotak atau sedikit rounded (`border-radius: 2px`)

### Palet Warna

| Token | Nilai | Penggunaan |
|---|---|---|
| `--color-bg` | `#FFFBF0` | Background halaman (krem hangat) |
| `--color-surface` | `#FFFFFF` | Background kartu/container |
| `--color-border` | `#000000` | Semua border dan shadow |
| `--color-primary` | `#FFE600` | Tombol utama (Tambah), filter aktif — kuning terang |
| `--color-danger` | `#FF3B3B` | Tombol hapus — merah terang |
| `--color-accent` | `#FF90E8` | Aksen sekunder — merah muda |
| `--color-text` | `#000000` | Teks utama |
| `--color-text-muted` | `#555555` | Teks sekunder (summary, placeholder) |
| `--color-completed` | `#AAAAAA` | Teks task yang sudah selesai (strikethrough) |

### Spesifikasi Per Komponen

#### Container Utama
```css
.container {
  background: var(--color-surface);
  border: 3px solid var(--color-border);
  box-shadow: 6px 6px 0px var(--color-border);
  border-radius: 2px;
  padding: 2rem;
}
```

#### Tombol Tambah (Primary Button)
```css
.btn-add {
  background: var(--color-primary);   /* kuning terang */
  border: 3px solid var(--color-border);
  box-shadow: 4px 4px 0px var(--color-border);
  font-weight: 700;
  border-radius: 2px;
  transition: transform 0.1s, box-shadow 0.1s;
}
.btn-add:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px var(--color-border);
}
.btn-add:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px var(--color-border);
}
```

#### Input Teks
```css
.input-task {
  border: 3px solid var(--color-border);
  box-shadow: 3px 3px 0px var(--color-border);
  border-radius: 2px;
  background: var(--color-bg);
  font-weight: 500;
}
.input-task:focus {
  outline: none;
  box-shadow: 5px 5px 0px var(--color-border);
}
```

#### Task Item
```css
.task-item {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: 3px 3px 0px var(--color-border);
  border-radius: 2px;
  margin-bottom: 0.5rem;
}
.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--color-completed);
}
```

#### Tombol Hapus
```css
.btn-delete {
  background: var(--color-danger);    /* merah terang */
  border: 2px solid var(--color-border);
  box-shadow: 2px 2px 0px var(--color-border);
  font-weight: 700;
  border-radius: 2px;
}
.btn-delete:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--color-border);
}
```

#### Filter Bar
```css
.filter-btn {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: 2px 2px 0px var(--color-border);
  font-weight: 600;
  border-radius: 2px;
}
.filter-btn.active {
  background: var(--color-primary);   /* kuning terang saat aktif */
  box-shadow: 3px 3px 0px var(--color-border);
}
```

#### Heading Aplikasi
```css
h1 {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  border-bottom: 4px solid var(--color-border);
  padding-bottom: 0.5rem;
}
```

### Interaksi & Animasi

- **Hover**: Elemen bergeser sedikit ke kiri-atas (`translate(-2px, -2px)`) dan shadow membesar — efek "terangkat"
- **Active/Click**: Elemen bergeser ke kanan-bawah (`translate(2px, 2px)`) dan shadow mengecil — efek "ditekan"
- Tidak ada animasi fade atau blur — semua transisi bersifat cepat dan mekanis (`0.1s ease`)

---

## Data Models

### AppState

Objek tunggal yang merepresentasikan seluruh state aplikasi:

```javascript
/**
 * @typedef {Object} AppState
 * @property {Task[]} tasks       - Array semua task
 * @property {string} filter      - Filter aktif: 'all' | 'active' | 'completed'
 */

const initialState = {
  tasks: [],
  filter: 'all'
};
```

### Task

```javascript
/**
 * @typedef {Object} Task
 * @property {string}  id          - ID unik (timestamp + random, e.g. "1700000000000-abc")
 * @property {string}  text        - Deskripsi tugas (1–200 karakter, sudah di-trim)
 * @property {boolean} completed   - Status selesai (true) atau belum selesai (false)
 * @property {number}  createdAt   - Unix timestamp saat task dibuat (ms)
 */
```

### Filter Values

```javascript
const FILTERS = {
  ALL: 'all',           // Tampilkan semua task
  ACTIVE: 'active',     // Tampilkan hanya task belum selesai
  COMPLETED: 'completed' // Tampilkan hanya task selesai
};
```

### localStorage Schema

Data disimpan dengan key `'todolist-app-state'` dalam format JSON:

```json
{
  "tasks": [
    {
      "id": "1700000000000-abc",
      "text": "Belajar JavaScript",
      "completed": false,
      "createdAt": 1700000000000
    }
  ],
  "filter": "all"
}
```

Validasi saat load: jika parsing JSON gagal atau struktur tidak valid (bukan objek, `tasks` bukan array), aplikasi memulai dengan `initialState` tanpa menampilkan error.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Penambahan task yang valid selalu masuk ke list dengan status belum selesai

*For any* teks yang valid (non-kosong setelah di-trim, panjang ≤200 karakter), memanggil `addTask(state, text)` harus menghasilkan state baru di mana task dengan teks tersebut ada di `state.tasks` dengan `completed = false`.

**Validates: Requirements 1.2**

---

### Property 2: Input whitespace-only dan teks terlalu panjang ditolak

*For any* string yang terdiri sepenuhnya dari whitespace, atau string dengan panjang lebih dari 200 karakter, memanggil `addTask(state, text)` harus mengembalikan state yang identik dengan state semula (tidak ada task baru ditambahkan).

**Validates: Requirements 1.4, 1.5**

---

### Property 3: Toggle adalah involution (round-trip)

*For any* task dalam task list, memanggil `toggleTask` dua kali berturut-turut pada task yang sama harus mengembalikan task ke status semula. Selain itu, satu kali toggle harus membalik status `completed` (false→true atau true→false).

**Validates: Requirements 3.1, 3.3**

---

### Property 4: Penghapusan task bersifat permanen dan tepat sasaran

*For any* task list dengan setidaknya satu task, memanggil `deleteTask(state, id)` harus menghasilkan state baru di mana task dengan `id` tersebut tidak ada lagi, dan semua task lain tetap ada (panjang list berkurang tepat 1).

**Validates: Requirements 4.2**

---

### Property 5: Filter mengembalikan subset yang tepat

*For any* task list dan filter value ('all', 'active', 'completed'), `getFilteredTasks(tasks, filter)` harus mengembalikan:
- Untuk 'all': semua task tanpa pengecualian
- Untuk 'active': hanya task dengan `completed = false`
- Untuk 'completed': hanya task dengan `completed = true`

Tidak ada task yang seharusnya tampil yang hilang, dan tidak ada task yang tidak seharusnya tampil yang muncul.

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 6: Urutan tampilan task sesuai waktu penambahan

*For any* task list dengan dua atau lebih task, `getFilteredTasks` harus mengembalikan task dalam urutan `createdAt` ascending (task yang lebih lama di atas, task terbaru di bawah).

**Validates: Requirements 2.1**

---

### Property 7: Persistensi data adalah round-trip yang lossless

*For any* AppState yang valid, memanggil `saveState(state)` kemudian `loadState()` harus menghasilkan state yang ekuivalen dengan state yang disimpan (semua task dengan semua field-nya, dan nilai filter).

**Validates: Requirements 6.2**

---

### Property 8: Data localStorage yang tidak valid menghasilkan state awal yang bersih

*For any* string yang bukan JSON valid, atau JSON yang tidak memiliki struktur AppState yang benar (misalnya `tasks` bukan array), memanggil `loadState()` harus mengembalikan `initialState` (`tasks = []`, `filter = 'all'`).

**Validates: Requirements 6.3**

---

### Property 9: Ringkasan selalu akurat untuk semua state

*For any* task list, fungsi yang menghitung ringkasan harus mengembalikan jumlah task dengan `completed = false` yang tepat sama dengan hasil penghitungan manual atas array tasks.

**Validates: Requirements 7.1, 7.2**

---

### Property 10: Rendering task item selalu mengandung teks dan indikator status

*For any* task (dengan teks dan status apapun), fungsi render task item harus menghasilkan output yang mengandung teks task tersebut dan representasi visual status (class CSS 'completed' untuk task selesai, tidak ada class tersebut untuk task belum selesai).

**Validates: Requirements 2.3, 3.2**

---

## Error Handling

### Validasi Input Task

| Kondisi | Penanganan |
|---|---|
| Input kosong (setelah trim) | Abaikan aksi, tidak ada perubahan state |
| Input hanya whitespace | Abaikan aksi, tidak ada perubahan state |
| Input melebihi 200 karakter | Abaikan aksi, tidak ada perubahan state |

Validasi dilakukan di fungsi `addTask` sebelum mutasi state. Tidak ada pesan error yang ditampilkan — UI cukup tidak bereaksi.

### Persistensi Data

| Kondisi | Penanganan |
|---|---|
| localStorage tidak tersedia (private mode, dll) | Tangkap exception, gunakan in-memory state saja |
| JSON di localStorage rusak/tidak valid | Tangkap `JSON.parse` exception, kembalikan `initialState` |
| Struktur data tidak sesuai skema | Validasi tipe, kembalikan `initialState` jika tidak valid |
| localStorage penuh (QuotaExceededError) | Tangkap exception, lanjutkan tanpa menyimpan (data tetap di memory) |

### ID Generation

ID task dibuat dari kombinasi `Date.now()` dan string random pendek untuk menghindari collision. Format: `"${Date.now()}-${Math.random().toString(36).slice(2, 7)}"`.

---

## Testing Strategy

### Pendekatan Pengujian

Aplikasi ini menggunakan **dual testing approach**:
1. **Unit tests (example-based)**: Untuk kasus spesifik, edge case, dan pemeriksaan UI
2. **Property-based tests**: Untuk memverifikasi properti universal di atas berbagai input acak

Library property-based testing yang digunakan: **[fast-check](https://github.com/dubzzz/fast-check)** (JavaScript, zero-config, berjalan di Node.js dan browser).

### Unit Tests (Example-Based)

Fokus pada kasus spesifik yang tidak tercakup oleh property tests:

- **1.1**: Verifikasi DOM mengandung input field dan tombol tambah
- **2.2**: Render dengan `tasks = []` menampilkan pesan empty state
- **5.1**: Filter bar mengandung tiga tombol dengan label "Semua", "Belum Selesai", "Selesai"
- **5.5**: `loadState()` dengan localStorage kosong mengembalikan `filter = 'all'`
- **4.1**: Setiap task item yang dirender memiliki tombol hapus

### Property-Based Tests

Setiap property test dikonfigurasi dengan **minimum 100 iterasi**. Setiap test diberi tag komentar yang mereferensikan property di design document.

```javascript
// Tag format: Feature: todolist-app, Property {N}: {deskripsi singkat}
```

| Property | Arbitraries (Generator) | Verifikasi |
|---|---|---|
| P1: Penambahan task valid | `fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)` | Task ada di list, `completed=false` |
| P2: Input tidak valid ditolak | `fc.string().filter(s => s.trim() === '')` + `fc.string({ minLength: 201 })` | State tidak berubah |
| P3: Toggle adalah involution | `fc.array(taskArbitrary, { minLength: 1 })` + index acak | Toggle 2x = state semula |
| P4: Penghapusan tepat sasaran | `fc.array(taskArbitrary, { minLength: 1 })` + index acak | Task hilang, sisanya utuh |
| P5: Filter akurat | `fc.array(taskArbitrary)` + `fc.constantFrom('all', 'active', 'completed')` | Subset sesuai filter |
| P6: Urutan ascending | `fc.array(taskArbitrary, { minLength: 2 })` | `createdAt[i] <= createdAt[i+1]` |
| P7: Persistensi round-trip | `appStateArbitrary` | `loadState(saveState(s)) ≡ s` |
| P8: Data rusak → initialState | `fc.string()` (non-valid JSON) + invalid objects | Mengembalikan `initialState` |
| P9: Ringkasan akurat | `fc.array(taskArbitrary)` | Count manual = count fungsi |
| P10: Render task item lengkap | `taskArbitrary` | Output mengandung teks + class status |

### Struktur Test File

```
todolist-app/
├── index.html
├── style.css
├── app.js
└── tests/
    ├── unit.test.js       # Example-based tests
    └── property.test.js   # Property-based tests (fast-check)
```

### Menjalankan Tests

```bash
# Install dependencies
npm install --save-dev fast-check vitest

# Jalankan semua tests (single run, tanpa watch mode)
npx vitest --run
```
