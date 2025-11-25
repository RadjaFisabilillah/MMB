// src/app/admin/verifikasi-izin/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function VerifikasiIzinPage() {
  const { user } = useAuth();
  const [izinList, setIzinList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchIzinPending = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Mengambil semua izin dari toko ini (RLS dijamin)
    // Jika user adalah Admin Global, RLS yang baru akan mengembalikan SEMUA izin di semua toko.
    const { data, error } = await supabase
      .from("izin")
      .select(
        `
        id, 
        tipe,
        tanggal_mulai,
        tanggal_selesai,
        alasan,
        status,
        pegawai (nama) 
      `
      )
      .order("dibuat_pada", { ascending: true }); // Tampilkan yang paling lama dulu

    if (error) {
      console.error("Gagal memuat daftar izin:", error);
      setMessage("Error memuat izin: " + error.message);
    } else {
      setIzinList(data);
      setMessage("");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchIzinPending();
  }, [fetchIzinPending]);

  const handleUpdateStatus = async (izinId, status) => {
    if (!user) return;
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

      {loading ? (
        <p className="text-center text-gray-400 mt-10">
          Memuat pengajuan izin...
        </p>
      ) : (
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
                      {izin.pegawai?.nama || "N/A"} - {izin.tipe}
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

                {/* Tombol hanya muncul jika status masih 'pending' */}
                {izin.status === "pending" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(izin.id, "approved")}
                      className="flex-1 py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(izin.id, "rejected")}
                      className="flex-1 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
