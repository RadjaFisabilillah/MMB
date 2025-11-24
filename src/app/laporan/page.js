// src/app/laporan/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNavBar from "@/components/BottomNavBar";
import { supabase } from "@/lib/supabaseClient";

// Ini adalah halaman List-Detail kedua (Halaman List)
export default function LaporanListPage() {
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    // Mengambil laporan penjualan untuk toko saat ini (dilindungi RLS)
    const { data, error } = await supabase
      .from("laporan_penjualan")
      .select(
        `
        id, 
        tanggal_penjualan, 
        harga_total, 
        volume_terjual_ml, 
        pegawai (nama)
      `
      )
      .order("tanggal_penjualan", { ascending: false })
      .limit(10); // Ambil 10 laporan terbaru

    if (error) {
      console.error("Gagal memuat laporan:", error);
    } else {
      setLaporanList(data);
    }
    setLoading(false);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <main className="flex-grow p-4 pt-10 mb-16 text-white">
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Laporan Penjualan
      </h1>
      <p className="mb-6 text-gray-300">
        Data penjualan toko Anda (dilindungi RLS).
      </p>

      {/* --- Tombol Tambah Penjualan --- */}
      <div className="mb-6">
        <Link href="/laporan/add">
          <button
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            + Catat Penjualan Baru
          </button>
        </Link>
      </div>

      {/* --- Daftar Laporan --- */}
      <h2 className="text-xl font-semibold mb-4" style={{ color: "#FFFFFF" }}>
        Riwayat Transaksi Terakhir
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Memuat data laporan...</p>
      ) : (
        <div className="space-y-4">
          {laporanList.map((laporan) => (
            // Kita belum membuat halaman detail, jadi ini hanya link dummy
            <Link href={`/laporan/${laporan.id}`} key={laporan.id}>
              <div
                className="p-4 rounded-lg flex justify-between items-center transition-shadow duration-300"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {laporan.tanggal_penjualan}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Oleh: {laporan.pegawai?.nama || "N/A"} (
                    {laporan.volume_terjual_ml} mL)
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xl font-bold"
                    style={{ color: "#FA4EAB" }}
                  >
                    {formatRupiah(laporan.harga_total)}
                  </span>
                  <p className="text-xs text-gray-400">Lihat Detail &rarr;</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <BottomNavBar />
    </main>
  );
}
