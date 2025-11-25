// src/components/BottomNavBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
// Import ikon yang dibutuhkan
import {
  FaHome,
  FaBox,
  FaFileAlt,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

// Definisi item navigasi dasar untuk Pegawai
const navItemsPegawai = [
  { href: "/dashboard", icon: FaHome, label: "Dash" },
  { href: "/absensi", icon: FaClock, label: "Absen" },
  { href: "/stok", icon: FaBox, label: "Stok" },
  { href: "/laporan", icon: FaFileAlt, label: "Laporan" },
  { href: "/profil", icon: FaUser, label: "Profil" },
];

// Definisi item navigasi khusus Admin (mengganti Absen dan Stok)
const navItemsAdmin = [
  { href: "/dashboard", icon: FaHome, label: "Dash" },
  { href: "/admin/verifikasi-izin", icon: FaCheckCircle, label: "Verif. Izin" },
  { href: "/admin/add-toko", icon: FaStore, label: "Tambah Toko" },
  { href: "/laporan", icon: FaFileAlt, label: "Laporan" },
  { href: "/profil", icon: FaUser, label: "Profil" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Fungsi untuk mengambil peran pengguna
  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null);
      setLoadingRole(false);
      return;
    }

    const { data: profile } = await supabase
      .from("pegawai")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserRole(profile.role);
    } else {
      // Fallback defensif: Jika profil tidak ditemukan, anggap sebagai Pegawai default
      // Ini mencegah crash saat navigasi Admin dimuat
      setUserRole("pegawai");
    }
    setLoadingRole(false);
  }, [user]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  // Tentukan item navigasi akhir berdasarkan peran
  const finalNavItems = userRole === "admin" ? navItemsAdmin : navItemsPegawai;

  // Jangan merender apapun jika masih memuat data peran
  if (loadingRole) {
    return null;
  }

  // Jangan merender jika tidak ada user
  if (!user) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 shadow-lg flex justify-around items-center z-50"
      style={{ backgroundColor: "#323232" }}
    >
      {finalNavItems.map((item) => {
        // Logika untuk menentukan tombol aktif
        // Menggunakan pathname.startsWith untuk rute Admin/verifikasi-izin/page.js
        const isActive =
          pathname.startsWith(item.href) &&
          (item.href !== "/dashboard" || pathname === "/dashboard");
        const IconComponent = item.icon;

        // ✅ PERBAIKAN KRITIS: Check defensif untuk mencegah React Error #300
        if (typeof IconComponent !== "function") {
          console.error(
            `Ikon untuk rute ${item.href} tidak ditemukan atau bukan komponen React.`
          );
          return null; // Hindari crash dengan merender null
        }

        return (
          <Link href={item.href} key={item.href} className="flex-1 text-center">
            <div
              className={`flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
                isActive ? "text-white border-b-2" : "text-gray-400"
              }`}
              style={{
                borderColor: isActive ? "#FA4EAB" : "transparent",
              }}
            >
              {/* Render komponen ikon */}
              <IconComponent className="text-2xl" />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? "#FA4EAB" : "#FFFFFF" }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
