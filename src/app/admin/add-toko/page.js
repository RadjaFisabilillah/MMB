// src/app/admin/add-toko/page.js
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AddTokoPage() {
  const { user } = useAuth(); // Digunakan untuk memastikan user terautentikasi (meski Middleware sudah melindungi)
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    const newStore = {
      nama: nama,
      alamat: alamat,
    };

    // Memasukkan data ke tabel 'toko'
    const { error } = await supabase.from("toko").insert([newStore]);

    if (error) {
      setMessage(`Gagal menambah toko: ${error.message}`);
    } else {
      setMessage(`Toko ${nama} berhasil ditambahkan!`);
      setNama("");
      setAlamat("");
    }
    setLoading(false);
  };

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Tambah Data Toko Baru
      </h1>
      <p className="mb-6 text-gray-300">
        Masukkan detail toko baru untuk memperluas jaringan MMB.
      </p>

      <div
        className="p-6 rounded-xl shadow-lg"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Toko */}
          <div>
            <label
              htmlFor="nama"
              className="block text-sm font-medium text-white mb-1"
            >
              Nama Toko
            </label>
            <input
              type="text"
              name="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
          </div>

          {/* Alamat Toko */}
          <div>
            <label
              htmlFor="alamat"
              className="block text-sm font-medium text-white mb-1"
            >
              Alamat
            </label>
            <textarea
              name="alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 h-20 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300 disabled:opacity-50"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            {loading ? "Menyimpan..." : "Simpan Toko Baru"}
          </button>
        </form>
      </div>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.startsWith("Gagal") ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
