// src/components/BottomNavBar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// ✅ PERUBAHAN: Menerima userRole dan loadingRole sebagai props
export default function BottomNavBar({ userRole, loadingRole }) {
  const pathname = usePathname();

  // Tentukan item navigasi akhir berdasarkan peran yang diterima
  const finalNavItems = userRole === "admin" ? navItemsAdmin : navItemsPegawai;

  // Jangan merender apapun jika masih memuat data peran
  if (loadingRole || !userRole) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 shadow-lg flex justify-around items-center z-50"
      style={{ backgroundColor: "#323232" }}
    >
      {finalNavItems.map((item) => {
        // Logika untuk menentukan tombol aktif
        const isActive =
          pathname.startsWith(item.href) &&
          (item.href !== "/dashboard" || pathname === "/dashboard");
        const IconComponent = item.icon;

        // Pemeriksaan defensif masih diperlukan, meskipun crash seharusnya hilang
        if (typeof IconComponent !== "function") return null;

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
