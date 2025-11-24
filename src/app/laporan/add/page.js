// src/app/laporan/add/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { getPendingPenjualan } from "@/lib/localforage";
import { syncPenjualan } from "@/lib/syncService";
import { useRouter } from "next/navigation";

const isOnline = () => typeof navigator !== "undefined" && navigator.onLine;

const INITIAL_FORM = {
  stok_id: "", // ID dari jenis_stok
  jumlah_terjual: 1, // Volume dalam mL
  harga_satuan: 1000, // Harga per mL
  tipe_botol: "Refill 30ml",
};

export default function AddLaporanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [stokList, setStokList] = useState([]); // Daftar pilihan parfum dari DB
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Hitung data pending
    const pending = await getPendingPenjualan();
    setPendingCount(pending.length);

    // Ambil daftar parfum yang tersedia
    const { data: stokData, error: stokError } = await supabase
      .from("jenis_stok")
      .select("id, nama, kualitas")
      .order("nama", { ascending: true });

    if (stokError) {
      console.error("Gagal memuat daftar stok:", stokError);
      setMessage("Error memuat daftar parfum.");
    } else {
      setStokList(stokData);
      if (stokData.length > 0) {
        setFormData((prev) => ({ ...prev, stok_id: stokData[0].id }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading || !formData.stok_id || formData.jumlah_terjual <= 0) {
      setMessage("Lengkapi semua data penjualan.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Ambil Store ID dari profil
    const { data: pegawaiData } = await supabase
      .from("pegawai")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!pegawaiData) {
      setMessage("Error: ID Toko tidak ditemukan.");
      setLoading(false);
      return;
    }

    const saleData = {
      pegawai_id: user.id,
      store_id: pegawaiData.store_id, // KRITIS: Memastikan RLS valid
      stok_id: formData.stok_id,
      jumlah_terjual: formData.jumlah_terjual,
      harga_satuan: formData.harga_satuan,
      tipe_botol: formData.tipe_botol,
      timestamp: new Date().toISOString(),
    };

    if (isOnline()) {
      const success = await syncPenjualan([saleData]);
      if (success) {
        setMessage("Laporan penjualan dan stok berhasil diperbarui.");
        setFormData(INITIAL_FORM);
      } else {
        await addPendingPenjualan(saleData);
        setPendingCount((prev) => prev + 1);
        setMessage(
          "Gagal sinkronisasi online. Data disimpan secara lokal (Deferred Sync)."
        );
      }
    } else {
      await addPendingPenjualan(saleData);
      setPendingCount((prev) => prev + 1);
      setMessage(
        "Offline: Penjualan dicatat, menunggu koneksi untuk sinkronisasi."
      );
    }

    setLoading(false);
    // Kita tetap di halaman ini untuk input cepat transaksi berikutnya
  };

  const totalHarga = formData.jumlah_terjual * formData.harga_satuan;

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Input Laporan Penjualan
      </h1>
      <p className="mb-6 text-gray-300">
        Catat transaksi dengan keandalan *offline-first*.
      </p>

      {message && (
        <div
          className={`p-3 rounded mb-4 text-sm ${
            message.startsWith("Gagal")
              ? "bg-red-900 text-red-300"
              : "bg-green-900 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      {pendingCount > 0 && (
        <div className="p-3 bg-yellow-900 bg-opacity-50 rounded-lg text-yellow-300 mb-4">
          ⚠️ **{pendingCount}** transaksi menunggu sinkronisasi!
        </div>
      )}

      <div
        className="p-6 rounded-xl shadow-lg"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pemilihan Stok */}
          <div>
            <label
              htmlFor="stok_id"
              className="block text-sm font-medium text-white mb-1"
            >
              Parfum Terjual
            </label>
            <select
              name="stok_id"
              value={formData.stok_id}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
              disabled={stokList.length === 0}
            >
              {stokList.map((stok) => (
                <option key={stok.id} value={stok.id}>
                  {stok.nama} ({stok.kualitas})
                </option>
              ))}
            </select>
          </div>

          {/* Volume Terjual */}
          <div>
            <label
              htmlFor="jumlah_terjual"
              className="block text-sm font-medium text-white mb-1"
            >
              Volume Terjual (mL)
            </label>
            <input
              type="number"
              name="jumlah_terjual"
              value={formData.jumlah_terjual}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Tipe Botol */}
          <div>
            <label
              htmlFor="tipe_botol"
              className="block text-sm font-medium text-white mb-1"
            >
              Tipe Botol
            </label>
            <select
              name="tipe_botol"
              value={formData.tipe_botol}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            >
              <option value="Refill 30ml">Refill 30ml</option>
              <option value="Refill 50ml">Refill 50ml</option>
              <option value="Botol Baru">Botol Baru</option>
            </select>
          </div>

          {/* Harga Satuan */}
          <div>
            <label
              htmlFor="harga_satuan"
              className="block text-sm font-medium text-white mb-1"
            >
              Harga Satuan (IDR/mL)
            </label>
            <input
              type="number"
              name="harga_satuan"
              value={formData.harga_satuan}
              onChange={handleChange}
              min="100"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Total Harga Final */}
          <div className="py-4 border-t border-gray-700">
            <h3 className="text-xl font-bold flex justify-between">
              <span>Total Transaksi:</span>
              <span style={{ color: "#FA4EAB" }}>
                Rp{totalHarga.toLocaleString("id-ID")}
              </span>
            </h3>
          </div>

          <button
            type="submit"
            disabled={loading || stokList.length === 0}
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300 disabled:opacity-50"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            {loading ? "Menyimpan..." : "Catat Penjualan"}
          </button>
        </form>
      </div>
    </main>
  );
}
