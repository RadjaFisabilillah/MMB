// src/app/izin/page.js
"use client";

import { useState, useEffect } from "react";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const INITIAL_FORM = {
  tipe: "Cuti Tahunan",
  tanggal_mulai: "",
  tanggal_selesai: "",
  alasan: "",
};

export default function IzinPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [riwayatIzin, setRiwayatIzin] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetchRiwayatIzin();
    }
  }, [user]);

  // Mengambil riwayat izin, RLS akan memfilter hanya milik user ini
  const fetchRiwayatIzin = async () => {
    const { data, error } = await supabase
      .from("izin")
      .select("*")
      .eq("pegawai_id", user.id) // Walaupun RLS memfilter, ini memperjelas intent query
      .order("tanggal_mulai", { ascending: false });

    if (error) {
      console.error("Gagal memuat riwayat izin:", error);
    } else {
      setRiwayatIzin(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Anda harus login.");
      return;
    }

    // Ambil store_id dari tabel pegawai (simulasi)
    const { data: pegawaiData, error: profileError } = await supabase
      .from("pegawai")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (profileError || !pegawaiData) {
      setMessage("Error: Gagal mendapatkan ID toko Anda.");
      return;
    }

    const newIzin = {
      ...formData,
      pegawai_id: user.id,
      store_id: pegawaiData.store_id, // KRITIS: Memastikan RLS valid
      status: "pending",
    };

    const { error } = await supabase.from("izin").insert([newIzin]);

    if (error) {
      setMessage(`Gagal mengajukan izin: ${error.message}`);
    } else {
      setMessage("Pengajuan izin berhasil! Menunggu verifikasi Admin.");
      setFormData(INITIAL_FORM);
      fetchRiwayatIzin(); // Muat ulang daftar
    }
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "text-green-500";
    if (status === "rejected") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <main
      className="flex-grow p-4 pt-10 mb-16 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Pengajuan Izin
      </h1>

      {/* Form Pengajuan Izin */}
      <div
        className="p-6 rounded-xl shadow-lg mt-6"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h2 className="text-xl font-semibold mb-4">Ajukan Izin Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Izin */}
          <div>
            <label htmlFor="tipe" className="block text-sm text-gray-300 mb-1">
              Tipe Izin
            </label>
            <select
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
            >
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin Lain">Izin Lain</option>
            </select>
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="tanggal_mulai"
                className="block text-sm text-gray-300 mb-1"
              >
                Mulai
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="tanggal_selesai"
                className="block text-sm text-gray-300 mb-1"
              >
                Selesai
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label
              htmlFor="alasan"
              className="block text-sm text-gray-300 mb-1"
            >
              Alasan
            </label>
            <textarea
              name="alasan"
              value={formData.alasan}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 h-20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-white"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            Kirim Pengajuan
          </button>
          {message && (
            <p
              className="text-center text-sm mt-2"
              style={{ color: "#FA4EAB" }}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Riwayat Izin */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Riwayat Izin Anda</h2>
      <div className="space-y-3">
        {riwayatIzin.length === 0 ? (
          <p className="text-gray-400">Belum ada riwayat pengajuan izin.</p>
        ) : (
          riwayatIzin.map((izin) => (
            <div
              key={izin.id}
              className="p-4 rounded-lg flex justify-between items-center"
              style={{ backgroundColor: "#1f1f1f" }}
            >
              <div>
                <p className="font-semibold">{izin.tipe}</p>
                <p className="text-sm text-gray-400">
                  {izin.tanggal_mulai} s/d {izin.tanggal_selesai}
                </p>
              </div>
              <span
                className={`font-bold ${getStatusColor(
                  izin.status
                )} uppercase text-sm`}
              >
                {izin.status}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNavBar />
    </main>
  );
}
