// src/lib/localforage.js
import localforage from "localforage";

// ⚠️ FIX KRITIS: Pastikan kode ini hanya berjalan di browser
if (typeof window !== "undefined") {
  // Konfigurasi LocalForage (IndexedDB) hanya jika di browser
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: "MMB_PWA_Store",
    version: 1.0,
    storeName: "mmb_offline_data",
    description:
      "Penyimpanan data absensi dan penjualan yang tertunda sinkronisasi",
  });
}

const ABSENSI_KEY = "pending_absensi";
const PENJUALAN_KEY = "pending_penjualan";

// --- FUNGSI ABSENSI ---

/**
 * Mendapatkan daftar semua data absensi yang tertunda.
 */
export async function getPendingAbsensi() {
  try {
    // localforage akan menjadi undefined di server, tetapi ini hanya dipanggil
    // dari client component, sehingga aman.
    return (await localforage.getItem(ABSENSI_KEY)) || [];
  } catch (error) {
    console.error("Gagal mengambil absensi tertunda:", error);
    return [];
  }
}

/**
 * Menambahkan data absensi baru ke antrian tertunda.
 */
export async function addPendingAbsensi(absensiData) {
  const pendingList = await getPendingAbsensi();
  pendingList.push({
    ...absensiData,
    localId: Date.now(),
    timestamp: new Date().toISOString(),
  });
  await localforage.setItem(ABSENSI_KEY, pendingList);
  console.log("Absensi disimpan secara lokal. Status: Pending.");
}

/**
 * Mengosongkan antrian absensi tertunda setelah sinkronisasi berhasil.
 */
export async function clearPendingAbsensi() {
  await localforage.setItem(ABSENSI_KEY, []);
  console.log("Antrian absensi tertunda berhasil dikosongkan.");
}

// --- FUNGSI PENJUALAN ---

/**
 * Mendapatkan daftar semua data penjualan yang tertunda.
 */
export async function getPendingPenjualan() {
  try {
    return (await localforage.getItem(PENJUALAN_KEY)) || [];
  } catch (error) {
    console.error("Gagal mengambil penjualan tertunda:", error);
    return [];
  }
}

/**
 * Menambahkan data penjualan baru ke antrian tertunda.
 */
export async function addPendingPenjualan(saleData) {
  const pendingList = await getPendingPenjualan();
  pendingList.push({
    ...saleData,
    localId: Date.now(),
    timestamp: new Date().toISOString(),
  });
  await localforage.setItem(PENJUALAN_KEY, pendingList);
  console.log("Penjualan disimpan secara lokal. Status: Pending.");
}

/**
 * Mengosongkan antrian penjualan tertunda setelah sinkronisasi berhasil.
 */
export async function clearPendingPenjualan() {
  await localforage.setItem(PENJUALAN_KEY, []);
  console.log("Antrian penjualan tertunda berhasil dikosongkan.");
}
