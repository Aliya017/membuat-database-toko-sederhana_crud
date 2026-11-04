CREATE DATABASE IF NOT EXISTS senyum_media;
USE senyum_media;

CREATE TABLE IF NOT EXISTS barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_produk VARCHAR(30) NOT NULL UNIQUE,
    nama_produk VARCHAR(100) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    CHECK (harga >= 0),
    CHECK (stock >= 0)
);

INSERT INTO barang (kode_produk, nama_produk, harga, stock) VALUES
('BRG001', 'Buku Tulis', 5000, 20),
('BRG002', 'Pulpen', 3000, 30),
('BRG003', 'Penggaris', 4000, 15);
