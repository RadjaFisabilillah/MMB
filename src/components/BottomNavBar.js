// src/components/BottomNavBar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Simulasi ikon dan path
const navItems = [
  { name: "Dash", path: "/dashboard", icon: "🏠" },
  { name: "Absen", path: "/absensi", icon: "⏰" },
  { name: "Stok", path: "/stok", icon: "🧪" },
  { name: "Laporan", path: "/laporan", icon: "💰" },
  { name: "Profil", path: "/profil", icon: "👤" },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 shadow-lg flex justify-around items-center z-10"
      style={{ backgroundColor: "#323232" }}
    >
      {navItems.map((item) => (
        <Link href={item.path} key={item.name} className="flex-1 text-center">
          <div
            className={`flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
              pathname === item.path ? "text-white border-b-2" : "text-gray-400"
            }`}
            style={{
              borderColor: pathname === item.path ? "#FA4EAB" : "transparent",
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: pathname === item.path ? "#FA4EAB" : "#FFFFFF" }}
            >
              {item.name}
            </span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
