// src/app/stok/add/page.js
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const INITIAL_FORM = {
  nama: "",
  kualitas: "Premium",
  volumeAwal: 0,
  kapasitasPenuh: 1000, // Default kapasitas 1000 mL
};

export default function AddStokPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;

    setMessage("");
    setLoading(true);

    try {
      // 1. AMBIL STORE_ID PEGAWAI
      const { data: pegawaiData, error: profileError } = await supabase
        .from("pegawai")
        .select("store_id")
        .eq("id", user.id)
        .single();

      if (profileError || !pegawaiData) {
        throw new Error(
          "Gagal mendapatkan ID toko. Pastikan Anda terdaftar sebagai pegawai."
        );
      }
      const storeId = pegawaiData.store_id;

      // 2. INSERT JENIS STOK (Parfum & Kualitas)
      const { data: jenisStokData, error: jenisStokError } = await supabase
        .from("jenis_stok")
        .insert({
          nama: formData.nama,
          kualitas: formData.kualitas,
        })
        .select("id") // Ambil ID yang baru dibuat
        .single();

      if (jenisStokError || !jenisStokData) {
        throw new Error(
          `Gagal membuat jenis stok: ${
            jenisStokError?.message || "Data kosong."
          }`
        );
      }
      const jenisStokId = jenisStokData.id;

      // 3. INSERT STOK AWAL DI TOKO (Menggunakan ID dan Store ID)
      const { error: stokTokoError } = await supabase.from("stok_toko").insert({
        store_id: storeId, // KRITIS untuk RLS
        jenis_stok_id: jenisStokId,
        volume_saat_ini_ml: formData.volumeAwal,
        kapasitas_penuh_ml: formData.kapasitasPenuh,
        // calculated_dos akan diisi oleh trigger/view di DB
      });

      if (stokTokoError) {
        throw new Error(`Gagal memasukkan stok awal: ${stokTokoError.message}`);
      }

      // 4. SUKSES & REDIRECT
      setMessage("Stok parfum baru berhasil ditambahkan!");
      router.push("/stok");
    } catch (e) {
      setMessage(`ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Tambah Stok Baru
      </h1>
      <p className="mb-6 text-gray-300">
        Masukkan detail parfum dan volume awal inventaris.
      </p>

      {message && (
        <div
          className={`p-3 rounded mb-4 text-sm ${
            message.startsWith("ERROR")
              ? "bg-red-900 text-red-300"
              : "bg-green-900 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      <div
        className="p-6 rounded-xl shadow-lg"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Parfum */}
          <div>
            <label
              htmlFor="nama"
              className="block text-sm font-medium text-white mb-1"
            >
              Nama Parfum (Contoh: Baccarat Rouge 540)
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Kualitas */}
          <div>
            <label
              htmlFor="kualitas"
              className="block text-sm font-medium text-white mb-1"
            >
              Kualitas
            </label>
            <select
              name="kualitas"
              value={formData.kualitas}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            >
              <option value="Premium">Premium</option>
              <option value="Standar">Standar</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          {/* Kapasitas Penuh */}
          <div>
            <label
              htmlFor="kapasitasPenuh"
              className="block text-sm font-medium text-white mb-1"
            >
              Kapasitas Penuh (mL)
            </label>
            <input
              type="number"
              name="kapasitasPenuh"
              value={formData.kapasitasPenuh}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Volume Awal */}
          <div>
            <label
              htmlFor="volumeAwal"
              className="block text-sm font-medium text-white mb-1"
            >
              Volume Stok Awal (mL)
            </label>
            <input
              type="number"
              name="volumeAwal"
              value={formData.volumeAwal}
              onChange={handleChange}
              min="0"
              max={formData.kapasitasPenuh}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300 disabled:opacity-50"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            {loading ? "Menyimpan..." : "Simpan Stok Baru"}
          </button>
        </form>
      </div>
    </main>
  );
}
