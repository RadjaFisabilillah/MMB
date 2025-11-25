// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- DEBUGGING KRITIS (Hapus setelah masalah teratasi) ---
// Kode ini akan mencetak status variabel di console browser
if (typeof window !== "undefined") {
  console.log(
    "DEBUG: SUPABASE URL:",
    supabaseUrl ? "TERSEDIA" : "HILANG/UNDEFINED"
  );
  console.log(
    "DEBUG: SUPABASE ANON KEY:",
    supabaseAnonKey ? "TERSEDIA" : "HILANG/UNDEFINED"
  );
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "KRITIS: Variabel lingkungan Supabase tidak dimuat. Cek konfigurasi Vercel."
    );
  }
}
// --- AKHIR DEBUGGING KRITIS ---

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
