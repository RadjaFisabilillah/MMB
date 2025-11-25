// src/components/BottomNavBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
// Import ikon yang dibutuhkan. Pastikan Anda telah menginstal 'react-icons'.
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
  { href: "/dashboard", icon: FaHome, label: "Dashboard" },
  { href: "/stok", icon: FaBox, label: "Stok" },
  { href: "/laporan", icon: FaFileAlt, label: "Laporan" },
  { href: "/absensi", icon: FaClock, label: "Absensi" },
  { href: "/profil", icon: FaUser, label: "Profil" },
];

// Definisi item navigasi khusus Admin
const adminItems = [
  { href: "/admin/verifikasi-izin", icon: FaCheckCircle, label: "Verif. Izin" },
  { href: "/admin/add-toko", icon: FaStore, label: "Tambah Toko" },
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
      // Jika profil tidak ditemukan, anggap sebagai peran 'unknown'
      setUserRole("unknown");
    }
    setLoadingRole(false);
  }, [user]);

  useEffect(() => {
    // Jalankan fungsi pengambilan peran saat komponen dimuat atau user berubah
    fetchUserRole();
  }, [fetchUserRole]);

  // Tentukan item navigasi akhir berdasarkan peran
  let finalNavItems = navItemsPegawai;

  if (userRole === "admin" && !loadingRole) {
    // Jika Admin, susun ulang menu (mempertahankan 5 item)
    finalNavItems = [
      navItemsPegawai.find((item) => item.href === "/dashboard"), // Dashboard
      adminItems[0], // Verif. Izin
      adminItems[1], // Tambah Toko
      navItemsPegawai.find((item) => item.href === "/laporan"), // Laporan
      navItemsPegawai.find((item) => item.href === "/profil"), // Profil
    ].filter(Boolean); // Filter untuk memastikan item-item yang dicari ada
  } else if (userRole === null || loadingRole) {
    // Jika masih memuat atau tidak ada user, gunakan item default (atau kosongkan jika perlu)
    // Kita biarkan default navItemsPegawai sebagai fallback untuk menghindari FOUC.
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 text-white shadow-lg z-50">
      <div className="flex justify-around items-center h-full max-w-xl mx-auto">
        {finalNavItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 transition-colors duration-200 ${
                isActive ? "text-red-500" : "text-gray-400 hover:text-white"
              }`}
              style={{ minWidth: "18%", maxWidth: "20%" }}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs mt-1 text-center leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
