# Requirements Document

## Introduction

Aplikasi frontend sederhana untuk mengelola daftar tugas (todo list). Pengguna dapat menambahkan, menyelesaikan, dan menghapus tugas melalui antarmuka web yang responsif. Aplikasi berjalan sepenuhnya di sisi klien (browser) tanpa memerlukan backend server.

## Glossary

- **App**: Aplikasi frontend todolist yang berjalan di browser
- **Task**: Sebuah item tugas yang memiliki teks deskripsi dan status (selesai/belum selesai)
- **Task_List**: Kumpulan semua Task yang dikelola oleh App
- **Filter**: Mekanisme untuk menampilkan subset dari Task_List berdasarkan status
- **Local_Storage**: Penyimpanan data di browser yang digunakan untuk menyimpan Task_List secara persisten

## Requirements

### Requirement 1: Menambahkan Tugas

**User Story:** Sebagai pengguna, saya ingin menambahkan tugas baru ke daftar, sehingga saya dapat mencatat hal-hal yang perlu dikerjakan.

#### Acceptance Criteria

1. THE App SHALL menampilkan input field dan tombol untuk menambahkan Task baru.
2. WHEN pengguna memasukkan teks dan menekan tombol tambah atau menekan tombol Enter, THE App SHALL menambahkan Task baru ke Task_List dengan status belum selesai.
3. WHEN Task baru berhasil ditambahkan, THE App SHALL mengosongkan input field.
4. IF pengguna mencoba menambahkan Task dengan input field kosong atau hanya berisi spasi, THEN THE App SHALL mengabaikan aksi tersebut dan tidak menambahkan Task ke Task_List.
5. THE App SHALL membatasi panjang teks Task maksimal 200 karakter.

---

### Requirement 2: Menampilkan Daftar Tugas

**User Story:** Sebagai pengguna, saya ingin melihat semua tugas saya dalam satu daftar, sehingga saya dapat memantau apa yang perlu dikerjakan.

#### Acceptance Criteria

1. THE App SHALL menampilkan semua Task dalam Task_List secara berurutan berdasarkan waktu penambahan (terbaru di bawah).
2. WHEN Task_List kosong, THE App SHALL menampilkan pesan informasi bahwa belum ada tugas.
3. THE App SHALL menampilkan teks deskripsi dan status selesai/belum selesai untuk setiap Task.

---

### Requirement 3: Menyelesaikan Tugas

**User Story:** Sebagai pengguna, saya ingin menandai tugas sebagai selesai, sehingga saya dapat melacak progres pekerjaan saya.

#### Acceptance Criteria

1. WHEN pengguna mengklik checkbox pada sebuah Task, THE App SHALL mengubah status Task tersebut menjadi selesai.
2. WHEN sebuah Task berstatus selesai, THE App SHALL menampilkan teks Task dengan tampilan visual yang berbeda (misalnya, teks dicoret).
3. WHEN pengguna mengklik checkbox pada Task yang sudah selesai, THE App SHALL mengubah status Task tersebut kembali menjadi belum selesai.

---

### Requirement 4: Menghapus Tugas

**User Story:** Sebagai pengguna, saya ingin menghapus tugas yang tidak relevan, sehingga daftar saya tetap bersih dan terorganisir.

#### Acceptance Criteria

1. THE App SHALL menampilkan tombol hapus untuk setiap Task dalam Task_List.
2. WHEN pengguna mengklik tombol hapus pada sebuah Task, THE App SHALL menghapus Task tersebut dari Task_List secara permanen.

---

### Requirement 5: Filter Tugas

**User Story:** Sebagai pengguna, saya ingin memfilter daftar tugas berdasarkan statusnya, sehingga saya dapat fokus pada tugas yang relevan.

#### Acceptance Criteria

1. THE App SHALL menyediakan tiga pilihan Filter: "Semua", "Belum Selesai", dan "Selesai".
2. WHEN pengguna memilih Filter "Semua", THE App SHALL menampilkan seluruh Task dalam Task_List.
3. WHEN pengguna memilih Filter "Belum Selesai", THE App SHALL menampilkan hanya Task dengan status belum selesai.
4. WHEN pengguna memilih Filter "Selesai", THE App SHALL menampilkan hanya Task dengan status selesai.
5. THE App SHALL menampilkan Filter "Semua" sebagai pilihan aktif secara default saat pertama kali dibuka.

---

### Requirement 6: Persistensi Data

**User Story:** Sebagai pengguna, saya ingin data tugas saya tersimpan secara otomatis, sehingga tugas tidak hilang ketika saya menutup atau me-refresh browser.

#### Acceptance Criteria

1. WHEN pengguna menambahkan, menyelesaikan, atau menghapus Task, THE App SHALL menyimpan Task_List terbaru ke Local_Storage secara otomatis.
2. WHEN App pertama kali dimuat di browser, THE App SHALL memuat Task_List dari Local_Storage jika data tersedia.
3. IF data di Local_Storage tidak valid atau rusak, THEN THE App SHALL memulai dengan Task_List kosong tanpa menampilkan error kepada pengguna.

---

### Requirement 7: Ringkasan Tugas

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan jumlah tugas, sehingga saya dapat mengetahui progres keseluruhan dengan cepat.

#### Acceptance Criteria

1. THE App SHALL menampilkan jumlah Task yang belum selesai dari total keseluruhan Task.
2. WHEN Task_List berubah, THE App SHALL memperbarui ringkasan secara otomatis.
