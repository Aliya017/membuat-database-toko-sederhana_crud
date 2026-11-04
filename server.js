const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // Isi jika MySQL kamu memakai password
    database: "senyum_media",
    waitForConnections: true,
    connectionLimit: 10
});

// GET: mengambil semua barang
app.get("/api/barang", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM barang ORDER BY id DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data barang." });
    }
});

// POST: menambahkan barang baru
app.post("/api/barang", async (req, res) => {
    try {
        const { kode_produk, nama_produk, harga, stock } = req.body;
        if (!kode_produk || !nama_produk || harga === undefined || stock === undefined ||
            Number(harga) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({ message: "Data barang belum valid." });
        }

        const [result] = await db.execute(
            "INSERT INTO barang (kode_produk, nama_produk, harga, stock) VALUES (?, ?, ?, ?)",
            [kode_produk.trim(), nama_produk.trim(), Number(harga), Number(stock)]
        );
        res.status(201).json({ message: "Barang berhasil ditambahkan.", id: result.insertId });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Kode produk sudah digunakan." });
        }
        res.status(500).json({ message: "Gagal menambahkan barang." });
    }
});

// PUT: mengubah data barang, termasuk stok setelah pembelian
app.put("/api/barang/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { kode_produk, nama_produk, harga, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID barang tidak valid." });
    }
    if (typeof kode_produk !== "string" || !kode_produk.trim() ||
        typeof nama_produk !== "string" || !nama_produk.trim() ||
        !Number.isFinite(Number(harga)) || Number(harga) < 0 ||
        !Number.isInteger(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({ message: "Data barang atau stok tidak valid." });
    }

    try {
        const [result] = await db.execute(
            `UPDATE barang
             SET kode_produk = ?, nama_produk = ?, harga = ?, stock = ?
             WHERE id = ?`,
            [kode_produk.trim(), nama_produk.trim(), Number(harga), Number(stock), id]
        );
        if (result.affectedRows === 0) {
            const [rows] = await db.execute("SELECT id FROM barang WHERE id = ?", [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Barang tidak ditemukan." });
            }
        }
        res.json({ message: "Data barang berhasil diperbarui." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Kode produk sudah digunakan." });
        }
        res.status(500).json({ message: "Gagal memperbarui barang." });
    }
});

// DELETE: menghapus barang
app.delete("/api/barang/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM barang WHERE id = ?",
            [Number(req.params.id)]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Barang tidak ditemukan." });
        }
        res.json({ message: "Barang berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus barang." });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
