// src/app/absensi/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { addPendingAbsensi, getPendingAbsensi } from "@/lib/localforage";
import { syncAbsensi } from "@/lib/syncService";

// Fungsi untuk memeriksa status koneksi (Browser API)
const isOnline = () => typeof navigator !== "undefined" && navigator.onLine;

export default function AbsensiPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [status, setStatus] = useState("unknown");
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState("");
  const [loadingRole, setLoadingRole] = useState(true);

  // 1. Ambil status absensi saat ini & hitung data pending
  const loadInitialData = useCallback(async () => {
    if (!user) return;
    setLoadingRole(true);

    // --- Ambil Role Pengguna ---
    const { data: profile } = await supabase
      .from("pegawai")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    setUserRole(role);
    setLoadingRole(false);

    // Jika Admin, hentikan logika absensi untuk pegawai
    if (role === "admin") {
      setStatus("out");
      return;
    }
    // -------------------------

    // Hitung data pending
    const pending = await getPendingAbsensi();
    setPendingCount(pending.length);

    // Cek status absensi terakhir dari Supabase (Hanya jika online)
    if (isOnline()) {
      const { data: latestAbsen } = await supabase
        .from("absensi")
        .select("check_in, check_out")
        .eq("pegawai_id", user.id)
        .order("dibuat_pada", { ascending: false })
        .limit(1)
        .single();

      if (latestAbsen && latestAbsen.check_in && !latestAbsen.check_out) {
        setStatus("in"); // Sudah Check-in
      } else {
        setStatus("out"); // Siap Check-in
      }
    } else {
      setMessage("Anda sedang offline. Status mungkin tidak akurat.");
      setStatus("out"); // Asumsi siap untuk Check-in/Out jika offline
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();

    // Listener untuk koneksi (Trigger Sync saat online)
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [loadInitialData]);

  // 2. Handler untuk saat koneksi kembali
  const handleOnline = async () => {
    setMessage("Koneksi pulih. Mencoba sinkronisasi data tertunda...");
    const success = await syncAbsensi();
    if (success) {
      setMessage("Sinkronisasi berhasil! Anda online.");
      loadInitialData(); // Muat ulang data setelah sync
    } else {
      setMessage("Gagal sinkronisasi. Coba lagi atau periksa koneksi.");
    }
  };

  // 3. Logika Check-in/Check-out (Offline-First)
  const handleAbsensi = async (type) => {
    // type: 'in' atau 'out'
    if (!user || userRole === "admin") {
      // Cegah jika admin
      setMessage("Operasi absensi dibatasi untuk Admin.");
      return;
    }

    // --- KRITIS FIX: Ambil store_id dari tabel pegawai secara dinamis ---
    const { data: pegawaiData, error: pegawaiError } = await supabase
      .from("pegawai")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (pegawaiError || !pegawaiData) {
      // Ini akan terjadi jika Pegawai tidak memiliki entri di tabel pegawai (DB error)
      setMessage("Error: Gagal mendapatkan ID Toko dari profil.");
      return;
    }
    const storeId = pegawaiData.store_id;
    // ------------------------------------------------------------------

    const absenData = {
      pegawai_id: user.id,
      store_id: storeId, // Menggunakan store_id ASLI dari DB (Fix RLS)
    };

    if (type === "in") {
      absenData.check_in = new Date().toISOString();
      setStatus("in");
      setMessage("Check-in berhasil diproses.");
    } else {
      // type === 'out'
      // Untuk Sederhana: Buat entri Check-out baru (idealnya update baris Check-in)
      absenData.check_out = new Date().toISOString();
      setStatus("out");
      setMessage("Check-out berhasil diproses.");
    }

    if (isOnline()) {
      // Coba kirim langsung
      const { error: insertError } = await supabase
        .from("absensi")
        .insert([absenData]);
      if (insertError) {
        console.warn("Gagal kirim ke Supabase, menyimpan lokal:", insertError);
        await addPendingAbsensi(absenData); // Gagal: Simpan lokal
        setPendingCount((prev) => prev + 1);
        setMessage(`Gagal sinkronisasi online. Data disimpan lokal.`);
      } else {
        setMessage(
          `Absensi ${type === "in" ? "masuk" : "keluar"} berhasil disinkronkan.`
        );
      }
    } else {
      // Offline: Simpan lokal
      await addPendingAbsensi(absenData);
      setPendingCount((prev) => prev + 1);
      setMessage(
        "Offline: Absensi dicatat, menunggu koneksi untuk sinkronisasi."
      );
    }
  };

  if (loadingRole) {
    return (
      <main
        className="flex-grow p-4 pt-10 mb-16 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <p className="text-xl mt-10">Memuat data peran...</p>
        <BottomNavBar />
      </main>
    );
  }

  // --- CONDITIONAL RENDERING UNTUK ADMIN ---
  if (userRole === "admin") {
    // Logika Admin tidak perlu Check-in/Check-out
    return (
      <main
        className="flex-grow p-4 pt-10 mb-16 text-white text-center"
        style={{ backgroundColor: "#323232" }}
      >
        <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
          Terminal Absensi
        </h1>
        <div
          className="p-6 rounded-xl shadow-lg space-y-4 mt-8"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <h2 className="text-xl font-semibold text-white">Akses Dibatasi</h2>
          <p className="text-gray-400">
            Sebagai **ADMIN**, Anda tidak diwajibkan untuk melakukan
            Check-in/Check-out harian.
          </p>
          <p className="text-sm text-gray-500">
            Anda dapat melihat dan memverifikasi data absensi Pegawai melalui
            halaman Admin.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg text-yellow-300">
            ⚠️ **{pendingCount}** data absensi menunggu sinkronisasi (Offline).
          </div>
        )}
        <BottomNavBar />
      </main>
    );
  }

  // --- RENDERING UNTUK PEGAWAI ---
  const buttonAction = status === "out" ? "Check-in" : "Check-out";
  const buttonColor = status === "out" ? "#FA4EAB" : "#3c4043";

  return (
    <main
      className="flex-grow p-4 pt-10 mb-16 text-white text-center"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Terminal Absensi
      </h1>
      <p className="mb-6 text-gray-300">
        Keandalan Absensi (Offline-First) Aktif.
      </p>

      <div
        className="p-6 rounded-xl shadow-lg space-y-4"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <h2 className="text-xl font-semibold">Status Saat Ini:</h2>
        <p className="text-4xl font-extrabold uppercase">
          {status === "in"
            ? "Masuk"
            : status === "out"
            ? "Keluar"
            : "Memuat..."}
        </p>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="mt-8">
        <button
          onClick={() => handleAbsensi(status === "out" ? "in" : "out")}
          className="w-full py-4 rounded-lg font-bold text-white transition-opacity duration-300"
          style={{ backgroundColor: buttonColor }}
          disabled={status === "loading"}
        >
          {buttonAction} Sekarang
        </button>
      </div>

      <p className="mt-4 text-sm font-medium" style={{ color: "#FA4EAB" }}>
        {message || "Siap mencatat jam kerja Anda."}
      </p>

      {pendingCount > 0 && (
        <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg text-yellow-300">
          ⚠️ **{pendingCount}** data absensi menunggu sinkronisasi (Offline).
        </div>
      )}

      <BottomNavBar />
    </main>
  );
}
