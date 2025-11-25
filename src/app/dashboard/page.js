// src/app/dashboard/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    role: null, // ✅ Dibuat null agar BottomNavBar tahu ini sedang loading
    userName: "Pengguna",
    totalPenjualan: 0,
    statusAbsensi: "N/A",
    stokKritis: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Ambil Role Pegawai (Role & Nama)
    const { data: profile } = await supabase
      .from("pegawai")
      .select("role, nama")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "pegawai"; // Pastikan selalu ada string role
    const userName = profile?.nama || "Pengguna";

    // Cek apakah pengguna adalah Pegawai atau Admin
    const isPegawai = userRole !== "admin";

    let totalPenjualan = 0;
    let kritisCount = 0;
    let currentAbsensiStatus = "Tidak Berlaku (Admin)";

    if (isPegawai) {
      // 2-4. Logic for Pegawai... (Unchanged)
      const today = new Date().toISOString().split("T")[0];
      const { data: penjualanData } = await supabase
        .from("laporan_penjualan")
        .select("harga_total")
        .gte("tanggal_penjualan", today);

      totalPenjualan =
        penjualanData?.reduce((sum, item) => sum + item.harga_total, 0) || 0;

      currentAbsensiStatus = "Belum Check-in";
      const { data: latestAbsen } = await supabase
        .from("absensi")
        .select("check_in, check_out")
        .eq("pegawai_id", user.id)
        .order("dibuat_pada", { ascending: false })
        .limit(1)
        .single();

      if (latestAbsen && latestAbsen.check_in && !latestAbsen.check_out) {
        currentAbsensiStatus = "Sedang Check-in";
      } else if (latestAbsen && latestAbsen.check_in && latestAbsen.check_out) {
        currentAbsensiStatus = "Sudah Check-out";
      }

      const { count: countPegawai } = await supabase
        .from("stok_toko")
        .select("id", { count: "exact", head: true })
        .lte("calculated_dos", 7);

      kritisCount = countPegawai || 0;
    }

    setSummary({
      role: userRole,
      userName: userName,
      totalPenjualan: totalPenjualan,
      statusAbsensi: currentAbsensiStatus,
      stokKritis: kritisCount,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <main
      className="flex-grow p-4 pt-10 mb-16 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        👋 Selamat Datang, {summary.userName}!
      </h1>
      <p className="text-lg mt-2">
        Dashboard **MMB** ({loading ? "Memuat..." : summary.role})
      </p>

      <div className="mt-8 space-y-4">
        {/* Ringkasan Hari Ini */}
        <section
          className="p-4 rounded-lg"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "#FA4EAB" }}
          >
            Ringkasan Hari Ini
          </h2>
          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : (
            <>
              <p className="mt-2 text-lg">
                Total Penjualan:{" "}
                <span className="font-bold">
                  {formatRupiah(summary.totalPenjualan)}
                </span>
              </p>
              <p className="text-lg">
                Status Absensi:{" "}
                <span
                  className={`font-bold ${
                    summary.statusAbsensi.includes("Check-in")
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {summary.statusAbsensi}
                </span>
              </p>
            </>
          )}
        </section>

        {/* Peringatan Stok Kritis */}
        <section
          className={`p-4 rounded-lg border-2 ${
            summary.stokKritis > 0 ? "border-red-600" : "border-gray-700"
          }`}
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: summary.stokKritis > 0 ? "red" : "#FA4EAB" }}
          >
            🚨 Peringatan Stok Kritis
          </h2>
          {loading ? (
            <p className="text-gray-400">Memuat...</p>
          ) : (
            <p className="text-lg">
              Item Kritis (DoS ≤ 7 hari):
              <span
                className="font-bold text-2xl"
                style={{ color: summary.stokKritis > 0 ? "red" : "green" }}
              >
                {" "}
                {summary.stokKritis}
              </span>{" "}
              item.
              {summary.stokKritis > 0 && (
                <Link
                  href="/stok"
                  className="text-sm ml-2 underline"
                  style={{ color: "#FA4EAB" }}
                >
                  (Lihat Stok)
                </Link>
              )}
            </p>
          )}
        </section>
      </div>

      <p className="mt-10 text-sm text-gray-400">
        Peran Anda:{" "}
        <span className="font-semibold uppercase">{summary.role}</span>
      </p>

      {/* Mengirim role dan status loading ke BottomNavBar */}
      <BottomNavBar userRole={summary.role} loadingRole={loading} />
    </main>
  );
}
