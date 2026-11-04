const API = "/api/barang";
const $ = (id) => document.getElementById(id);

const formBarang = $("formBarang");
const dataBarang = $("dataBarang");
const pesanPenjual = $("pesanPenjual");
const formBeli = $("formBeli");
const pilihBarang = $("pilihBarang");
const stokTersedia = $("stokTersedia");
const jumlahBeli = $("jumlahBeli");
const btnBeli = $("btnBeli");
const pesanPembeli = $("pesanPembeli");

let barangEditId = null;

function tampilPesan(elemen, teks, error = false) {
    elemen.textContent = teks;
    elemen.classList.toggle("error", error);
}

function rupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(nilai);
}

// GET: mengambil data barang dari API
async function muatBarang() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Gagal mengambil data barang.");
        const barang = await response.json();
        tampilkanTabel(barang);
        tampilkanPilihanBarang(barang);
    } catch (error) {
        tampilPesan(pesanPenjual, error.message, true);
    }
}

// Menampilkan daftar barang pada tabel penjual
function tampilkanTabel(barang) {
    dataBarang.replaceChildren();

    if (barang.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Belum ada barang.";
        row.appendChild(cell);
        dataBarang.appendChild(row);
        return;
    }

    barang.forEach((item) => {
        const row = document.createElement("tr");
        const values = [
            item.kode_produk,
            item.nama_produk,
            rupiah(item.harga),
            item.stock
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const aksi = document.createElement("td");

        const tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.className = "small";
        tombolEdit.addEventListener("click", () => mulaiEdit(item));

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.className = "small danger";
        tombolHapus.addEventListener("click", () => hapusBarang(item.id));

        aksi.append(tombolEdit, tombolHapus);
        row.appendChild(aksi);
        dataBarang.appendChild(row);
    });
}

// Menampilkan barang yang stoknya masih tersedia untuk pembeli
function tampilkanPilihanBarang(barang) {
    pilihBarang.replaceChildren();

    const pilihanAwal = document.createElement("option");
    pilihanAwal.value = "";
    pilihanAwal.textContent = "Pilih barang";
    pilihBarang.appendChild(pilihanAwal);

    barang.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.nama_produk} - ${rupiah(item.harga)} (stok: ${item.stock})`;
        pilihBarang.appendChild(option);
    });

    if (pilihBarang.options.length === 1) {
        pilihanAwal.textContent = "Belum ada barang";
    }
    perbaruiInfoStok(barang);
}

// Menampilkan stok sesuai barang yang dipilih pembeli
function perbaruiInfoStok(daftarBarang) {
    const item = daftarBarang.find((barang) => barang.id === Number(pilihBarang.value));
    if (!item) {
        stokTersedia.value = "Pilih barang terlebih dahulu";
        jumlahBeli.max = "";
        return;
    }
    stokTersedia.value = item.stock > 0 ? `${item.stock} unit tersedia` : "Stok habis";
    jumlahBeli.max = item.stock;
    if (Number(jumlahBeli.value) > item.stock) {
        jumlahBeli.value = item.stock > 0 ? item.stock : 1;
    }
}

// POST: menambahkan barang baru; PUT: memperbarui barang
formBarang.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        kode_produk: $("kodeProduk").value.trim(),
        nama_produk: $("namaBarang").value.trim(),
        harga: Number($("harga").value),
        stock: Number($("stock").value)
    };

    if (data.harga < 0 || !Number.isInteger(data.stock) || data.stock < 0) {
        tampilPesan(pesanPenjual, "Harga atau stok tidak valid.", true);
        return;
    }

    const url = barangEditId ? `${API}/${barangEditId}` : API;
    const method = barangEditId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const hasil = await response.json();
        if (!response.ok) throw new Error(hasil.message || "Gagal menyimpan barang.");

        batalEdit();
        tampilPesan(pesanPenjual, hasil.message);
        await muatBarang();
    } catch (error) {
        tampilPesan(pesanPenjual, error.message, true);
    }
});

function mulaiEdit(item) {
    barangEditId = item.id;
    $("kodeProduk").value = item.kode_produk;
    $("namaBarang").value = item.nama_produk;
    $("harga").value = item.harga;
    $("stock").value = item.stock;
    $("btnSimpan").textContent = "Perbarui Barang";
    $("btnBatal").hidden = false;
    $("kodeProduk").focus();
}

function batalEdit() {
    barangEditId = null;
    formBarang.reset();
    $("btnSimpan").textContent = "Tambah Barang";
    $("btnBatal").hidden = true;
}

$("btnBatal").addEventListener("click", batalEdit);

// DELETE: menghapus barang
async function hapusBarang(id) {
    if (!confirm("Yakin ingin menghapus barang ini?")) return;

    try {
        const response = await fetch(`${API}/${id}`, { method: "DELETE" });
        const hasil = await response.json();
        if (!response.ok) throw new Error(hasil.message || "Gagal menghapus barang.");

        if (barangEditId === id) batalEdit();
        tampilPesan(pesanPenjual, hasil.message);
        await muatBarang();
    } catch (error) {
        tampilPesan(pesanPenjual, error.message, true);
    }
}

// Perbarui informasi stok saat pembeli memilih barang
pilihBarang.addEventListener("change", async () => {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Tidak dapat mengambil informasi stok.");
        const barang = await response.json();
        perbaruiInfoStok(barang);
        tampilPesan(pesanPembeli, "");
    } catch (error) {
        tampilPesan(pesanPembeli, error.message, true);
    }
});

// Sisi pembeli: GET untuk cek stok, lalu PUT untuk mengurangi stok sesuai jumlah pembelian
formBeli.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = Number(pilihBarang.value);
    const jumlah = Number(jumlahBeli.value);

    if (!id) {
        tampilPesan(pesanPembeli, "Pilih barang terlebih dahulu.", true);
        return;
    }
    if (!Number.isInteger(jumlah) || jumlah <= 0) {
        tampilPesan(pesanPembeli, "Jumlah pembelian harus berupa bilangan bulat lebih dari 0.", true);
        return;
    }

    btnBeli.disabled = true;
    try {
        // 1. GET /api/barang: ambil data terbaru dan cek stok barang yang dipilih
        const cekResponse = await fetch(API);
        if (!cekResponse.ok) throw new Error("Tidak dapat memeriksa stok barang.");

        const semuaBarang = await cekResponse.json();
        const barangDipilih = semuaBarang.find((item) => item.id === id);

        if (!barangDipilih) throw new Error("Barang tidak ditemukan.");
        if (barangDipilih.stock <= 0) throw new Error("Stok barang habis.");
        if (jumlah > barangDipilih.stock) {
            throw new Error(`Jumlah pembelian melebihi stok. Stok tersedia: ${barangDipilih.stock}.`);
        }

        // 2. Hitung stok baru berdasarkan jumlah yang dimasukkan pembeli
        const stockBaru = barangDipilih.stock - jumlah;

        // 3. PUT /api/barang/:id: perbarui stok barang di database
        const dataBaru = {
            kode_produk: barangDipilih.kode_produk,
            nama_produk: barangDipilih.nama_produk,
            harga: Number(barangDipilih.harga),
            stock: stockBaru
        };

        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataBaru)
        });

        const hasil = await response.json();
        if (!response.ok) throw new Error(hasil.message || "Pembelian gagal.");

        tampilPesan(
            pesanPembeli,
            `Pembelian berhasil: ${jumlah} ${barangDipilih.nama_produk}. Stok tersisa: ${stockBaru}.`
        );
        jumlahBeli.value = 1;
        await muatBarang();
    } catch (error) {
        tampilPesan(pesanPembeli, error.message, true);
        await muatBarang();
    } finally {
        btnBeli.disabled = false;
    }
});

// Saat halaman dibuka, tampilkan data dari database
muatBarang();
