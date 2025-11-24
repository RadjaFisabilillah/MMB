// src/app/admin/verifikasi-izin/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function VerifikasiIzinPage() {
  const { user } = useAuth();
  const [izinList, setIzinList] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Note: Anda harus menambahkan pengecekan user role:
    // if (user && user.user_metadata.role !== 'admin') router.push('/dashboard');
    fetchIzinPending();
  }, [user]);

  // Mengambil semua izin dari toko ini (RLS dijamin)
  const fetchIzinPending = async () => {
    // Kita ambil nama pegawai dari tabel 'pegawai' menggunakan JOIN
    const { data, error } = await supabase
      .from("izin")
      .select(
        `
        *,
        pegawai (nama) 
      `
      )
      .order("dibuat_pada", { ascending: true });

    if (error) {
      console.error("Gagal memuat daftar izin:", error);
    } else {
      setIzinList(data);
    }
  };

  const handleUpdateStatus = async (izinId, status) => {
    setMessage(`Memproses persetujuan ${izinId}...`);

    const { error } = await supabase
      .from("izin")
      .update({ status: status, disetujui_oleh: user.id })
      .eq("id", izinId);

    if (error) {
      setMessage(`Gagal memperbarui status: ${error.message}`);
    } else {
      setMessage(`Izin berhasil diubah menjadi ${status}.`);
      fetchIzinPending(); // Muat ulang daftar
    }
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "text-green-500";
    if (status === "rejected") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <main
      className="flex-grow p-4 pt-10 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Verifikasi Izin Pegawai
      </h1>
      <p className="mb-6 text-gray-300">
        Tindakan hanya untuk Admin. Semua data izin di toko Anda.
      </p>

      {message && (
        <p
          className="p-3 bg-gray-700 rounded-lg mb-4 text-sm"
          style={{ color: "#FA4EAB" }}
        >
          {message}
        </p>
      )}

      <div className="space-y-4">
        {izinList.length === 0 ? (
          <p className="text-gray-400">
            Tidak ada pengajuan izin yang perlu diverifikasi.
          </p>
        ) : (
          izinList.map((izin) => (
            <div
              key={izin.id}
              className="p-4 rounded-lg shadow-md"
              style={{ backgroundColor: "#1f1f1f" }}
            >
              <div className="flex justify-between items-start mb-2 border-b border-gray-700 pb-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {izin.pegawai.nama} - {izin.tipe}
                  </h2>
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
              <p className="text-sm italic mb-3">Alasan: {izin.alasan}</p>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus(izin.id, "approved")}
                  disabled={izin.status !== "pending"}
                  className="flex-1 py-2 rounded-lg text-sm font-bold bg-green-600 disabled:opacity-50"
                >
                  Setujui
                </button>
                <button
                  onClick={() => handleUpdateStatus(izin.id, "rejected")}
                  disabled={izin.status !== "pending"}
                  className="flex-1 py-2 rounded-lg text-sm font-bold bg-red-600 disabled:opacity-50"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
