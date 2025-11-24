// src/app/stok/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNavBar from "@/components/BottomNavBar";
import { supabase } from "@/lib/supabaseClient";
import { calculateDoS, getDoSStatus } from "@/lib/stockService";

export default function StokListPage() {
  const [stokData, setStokData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStok();
  }, []);

  // Ambil data stok yang sudah dilindungi RLS
  const fetchStok = async () => {
    setLoading(true);
    // Kita SELECT data stok, dan asumsikan 'calculated_dos' sudah dihitung
    // oleh VIEW/TRIGGER di Supabase (seperti yang kita sepakati)
    const { data, error } = await supabase
      .from("stok_toko")
      .select(
        `
        id, 
        volume_saat_ini_ml, 
        kapasitas_penuh_ml, 
        calculated_dos, 
        jenis_stok (nama)
      `
      )
      .order("calculated_dos", { ascending: true }); // Prioritaskan yang kritis

    if (error) {
      console.error("Gagal memuat stok:", error);
      // Di PWA yang benar, kita akan coba memuat dari cache/localforage
    } else {
      setStokData(data);
    }
    setLoading(false);
  };

  const getStatusColorClass = (status) => {
    if (status === "Kritis") return "bg-red-600";
    if (status === "Peringatan") return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <main
      className="flex-grow p-4 pt-10 mb-16 text-white"
      style={{ backgroundColor: "#323232" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#FA4EAB" }}>
        Inventaris Stok (DoS)
      </h1>
      <p className="mb-6 text-gray-300">
        Stok kritis ditentukan oleh **Days of Supply (DoS)**.
      </p>

      {loading ? (
        <p className="text-center text-gray-400">Memuat data stok...</p>
      ) : (
        <div className="space-y-4">
          {stokData.map((item) => {
            const itemName = item.jenis_stok?.nama || "Produk Tidak Dikenal";
            const dosStatus = getDoSStatus(item.calculated_dos);

            return (
              <Link href={`/stok/${item.id}`} key={item.id}>
                <div
                  className="p-4 rounded-lg flex justify-between items-center transition-shadow duration-300 hover:shadow-2xl"
                  style={{ backgroundColor: "#1f1f1f" }}
                >
                  <div>
                    <h2 className="text-lg font-semibold">{itemName}</h2>
                    <p className="text-sm text-gray-400">
                      Volume: {item.volume_saat_ini_ml} /{" "}
                      {item.kapasitas_penuh_ml} mL
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColorClass(
                      dosStatus
                    )}`}
                  >
                    DoS: {item.calculated_dos} hari ({dosStatus})
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* --- TOMBOL TAMBAH STOK BARU (BARU) --- */}
      <div className="mt-8">
        {/* Tombol ini mengarahkan ke halaman form penambahan stok baru */}
        <Link href="/stok/add">
          <button
            className="w-full py-3 rounded-lg font-bold text-white transition-opacity duration-300"
            style={{ backgroundColor: "#FA4EAB" }}
          >
            + Tambah Stok Parfum Baru
          </button>
        </Link>
      </div>

      <BottomNavBar />
    </main>
  );
}
