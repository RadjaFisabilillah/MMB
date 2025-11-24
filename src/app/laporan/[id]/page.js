// src/app/laporan/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LaporanDetailPage({ params }) {
  const { id } = params;
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user && id) {
      fetchDetailLaporan();
    }
  }, [user, id]);

  const fetchDetailLaporan = async () => {
    setLoading(true);
    // Mengambil data detail transaksi, termasuk nama Pegawai dan Parfum
    const { data, error } = await supabase
      .from("laporan_penjualan")
      .select(
        `
        *, 
        pegawai (nama), 
        jenis_stok (nama, kualitas)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Gagal memuat detail laporan:", error);
      alert("Laporan tidak ditemukan atau Anda tidak memiliki akses.");
      router.push("/laporan");
    } else {
      setTransaksi(data);
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

  if (loading) {
    return (
      <main
        className="flex-grow p-4 pt-10 text-white"
        style={{ backgroundColor: "#323232" }}
      >
        Memuat Detail Transaksi...
      </main>
    );
  }

  if (!transaksi) {
    return (
      <main
        className="flex-grow p-4 pt-10 text-white"
        style={{ backgroundColor: "#323232" }}
      >
        Data tidak ditemukan.
      </main>
    );
  }

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Detail Transaksi #{id.substring(0, 8)}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Dicatat pada: {new Date(transaksi.dibuat_pada).toLocaleString()}
      </p>

      <div className="space-y-4">
        {/* Ringkasan Finansial */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Ringkasan
          </h2>
          <p>
            Total Penjualan:{" "}
            <span className="text-xl font-bold">
              {formatRupiah(transaksi.harga_total)}
            </span>
          </p>
          <p>
            Harga Satuan:{" "}
            {formatRupiah(transaksi.harga_total / transaksi.volume_terjual_ml)}
            /mL
          </p>
        </div>

        {/* Detail Produk */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Produk & Volume
          </h2>
          <p>
            Parfum:{" "}
            <span className="font-semibold">{transaksi.jenis_stok.nama}</span> (
            {transaksi.jenis_stok.kualitas})
          </p>
          <p>Volume Terjual: {transaksi.volume_terjual_ml} mL</p>
          <p>Tipe Botol: {transaksi.tipe_botol}</p>
        </div>

        {/* Detail Pegawai */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: "#1f1f1f" }}>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Pencatat
          </h2>
          <p>Pegawai: {transaksi.pegawai.nama}</p>
          <p>Store ID: {transaksi.store_id.substring(0, 8)}...</p>
        </div>
      </div>
    </main>
  );
}
