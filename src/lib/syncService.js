// src/lib/syncService.js
import {
  getPendingAbsensi,
  clearPendingAbsensi,
  getPendingPenjualan,
  clearPendingPenjualan,
} from "./localforage";
import { supabase } from "./supabaseClient";

// --- SINKRONISASI ABSENSI ---

/**
 * Mencoba menyinkronkan data absensi yang tertunda ke Supabase.
 */
export async function syncAbsensi() {
  const pendingAbsensi = await getPendingAbsensi();

  if (pendingAbsensi.length === 0) {
    console.log("Tidak ada data absensi tertunda untuk disinkronkan.");
    return true;
  }

  const { error } = await supabase.from("absensi").insert(
    pendingAbsensi.map((item) => ({
      pegawai_id: item.pegawai_id,
      store_id: item.store_id,
      check_in: item.check_in,
      check_out: item.check_out,
    }))
  );

  if (error) {
    console.error("Gagal menyinkronkan data absensi ke Supabase:", error);
    return false;
  }

  await clearPendingAbsensi();
  console.log("Sinkronisasi absensi berhasil! Data lokal dikosongkan.");
  return true;
}

// --- SINKRONISASI PENJUALAN (KRITIS) ---

/**
 * Mencoba menyinkronkan data penjualan yang tertunda ke Supabase.
 * @param {Array} newSales - Opsional: Data penjualan baru yang langsung ingin disinkronkan.
 */
export async function syncPenjualan(newSales = []) {
  const pendingPenjualan = await getPendingPenjualan();
  const allSalesToSync = [...pendingPenjualan, ...newSales];

  if (allSalesToSync.length === 0) {
    console.log("Tidak ada data penjualan untuk disinkronkan.");
    return true;
  }

  // 1. Insert Penjualan
  const { error: insertError } = await supabase
    .from("laporan_penjualan") // Menggunakan nama tabel yang telah disepakati
    .insert(
      allSalesToSync.map((item) => ({
        pegawai_id: item.pegawai_id,
        store_id: item.store_id, // Penting untuk RLS!
        jenis_stok_id: item.stok_id,
        volume_terjual_ml: item.jumlah_terjual, // Sesuaikan nama kolom
        harga_total: item.jumlah_terjual * item.harga_satuan, // Hitung total harga
        dibuat_pada: item.timestamp,
        tanggal_penjualan: item.timestamp.split("T")[0], // Ambil tanggal saja
      }))
    );

  if (insertError) {
    console.error(
      "Gagal INSERT penjualan ke Supabase. Data disimpan lokal kembali.",
      insertError
    );
    // Jika insert gagal, data baru/pending akan diurus oleh localforage jika dipanggil dari form.
    return false;
  }

  // 2. Update Stok (Dekomposisi dan Panggil RPC)
  const stockDeductions = allSalesToSync.reduce((acc, item) => {
    // Kurangi volume_saat_ini_ml
    acc[item.stok_id] = (acc[item.stok_id] || 0) + item.jumlah_terjual;
    return acc;
  }, {});

  let allStockUpdatesSuccessful = true;
  for (const [stokId, totalDeduction] of Object.entries(stockDeductions)) {
    // Memanggil fungsi SQL RPC Supabase (decrement_stok, pastikan dibuat)
    const { error: updateError } = await supabase.rpc("decrement_stok", {
      stok_id_param: stokId,
      kuantitas_kurang: totalDeduction,
    });

    if (updateError) {
      console.error(`Gagal RPC mengupdate stok ID ${stokId}.`, updateError);
      allStockUpdatesSuccessful = false;
      // JANGAN return false di sini, agar loop terus berjalan.
    }
  }

  // 3. Clear Local Data
  if (!allStockUpdatesSuccessful) {
    console.warn(
      "Peringatan: Penjualan berhasil dicatat, tetapi sebagian update stok gagal. Cek log Supabase."
    );
    // Meskipun sebagian update stok gagal, kita TIDAK MENGHAPUS penjualan yang sudah ter-insert!
    // Kita hanya menghapus antrian lokal jika semua penjualan sukses di INSERT.
  }

  if (pendingPenjualan.length > 0) {
    await clearPendingPenjualan();
  }

  console.log("Sinkronisasi penjualan dan pembaruan stok selesai.");
  return true;
}
