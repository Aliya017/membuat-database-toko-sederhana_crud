SENYUM MEDIA - PETUNJUK MENJALANKAN

ISI FOLDER
- database.sql       : membuat database, tabel barang, dan data contoh
- server.js          : backend Node.js + Express + API
- public/index.html  : halaman sisi penjual dan pembeli
- public/style.css   : tampilan website
- public/app.js      : Fetch API, CRUD, dan transaksi pembelian
- package.json       : dependency dan perintah menjalankan

PERSIAPAN
1. Install Node.js.
2. Jalankan MySQL melalui XAMPP.
3. Buka phpMyAdmin, pilih Import, lalu impor database.sql.
4. Pastikan database senyum_media dan tabel barang sudah terbentuk.
5. Buka folder proyek ini di VS Code.
6. Buka Terminal, jalankan: npm install
7. Jalankan server: npm start
8. Buka browser: http://localhost:3000

JIKA MYSQL MEMAKAI PASSWORD
Buka server.js dan sesuaikan nilai password pada konfigurasi koneksi MySQL.

ENDPOINT API
GET     /api/barang       mengambil seluruh data barang
POST    /api/barang       menambahkan barang
PUT     /api/barang/:id   memperbarui data barang dan stok
DELETE  /api/barang/:id   menghapus barang

ALUR SISI PEMBELI (SESUAI INSTRUKSI PADA GAMBAR)
1. Pembeli memilih barang dari dropdown.
2. Frontend menggunakan GET /api/barang untuk mengambil data dan memeriksa stok.
3. Stok barang yang dipilih ditampilkan pada kolom Stok Tersedia.
4. Pembeli mengisi jumlah barang yang ingin dibeli.
5. Saat tombol Beli ditekan, sistem mengambil data terbaru dengan GET /api/barang.
6. Sistem memeriksa apakah stok mencukupi. Jika tidak, pembelian ditolak dan stok tidak berubah.
7. Jika cukup, sistem menghitung stock_baru = stock - jumlah_beli.
8. Frontend mengirim data barang dengan stok baru melalui PUT /api/barang/:id.
9. Data tabel penjual dan informasi stok pembeli dimuat ulang sehingga stok terbaru terlihat.

CONTOH
Stok awal 10, jumlah yang dibeli 3, maka stock_baru = 10 - 3 = 7.
Jika pembeli memasukkan jumlah lebih besar daripada stok tersedia, transaksi ditolak.

CARA MENGUJI
- Tambahkan barang dari sisi penjual, misalnya stok 10.
- Pada sisi pembeli pilih barang tersebut.
- Pastikan stok tersedia menunjukkan 10 unit.
- Masukkan jumlah 3 lalu tekan Beli.
- Pastikan muncul pesan berhasil dan stok pada tabel berubah menjadi 7.
- Coba beli melebihi stok; sistem harus menolak pembelian.

Catatan: transaksi pembeli ini merupakan simulasi sederhana pengurangan stok, belum mencakup pembayaran, login, atau riwayat transaksi.
