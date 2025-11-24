// src/middleware.js
import { NextResponse } from "next/server";
// Kita mengimpor supabaseClient, yang seharusnya sudah berada di folder lib/
import { supabase } from "@/lib/supabaseClient";

// Halaman yang hanya boleh diakses oleh Admin
const ADMIN_PATH = "/admin";

/**
 * Middleware untuk mengamankan rute Admin berdasarkan Role Pegawai.
 * Ini berjalan di lapisan server (Edge Function) sebelum rendering.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Lewati rute yang tidak termasuk admin
  if (!pathname.startsWith(ADMIN_PATH)) {
    return NextResponse.next();
  }

  // --- Otorisasi Admin ---

  // Dapatkan token Supabase JWT dari cookie
  // Supabase menyimpan token di cookie bernama sb-access-token
  const token = request.cookies.get("sb-access-token")?.value;

  // 2. Cek Otentikasi
  if (!token) {
    // Jika tidak ada token (belum login), redirect ke halaman login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Verifikasi Token & Dapatkan User ID (Server Check)
    // Kita gunakan Supabase client untuk memverifikasi token di sisi server/edge
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      // Token tidak valid/kedaluwarsa, redirect ke login
      console.error("Middleware Auth Error:", authError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Ambil Role dari Database (Memanfaatkan RLS yang sudah diatur)
    const { data: profile, error: profileError } = await supabase
      .from("pegawai")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      // Profil tidak ditemukan di tabel pegawai (data hilang)
      console.error("Middleware Profile Error:", profileError);
      return NextResponse.redirect(
        new URL("/dashboard?error=profile_not_found", request.url)
      );
    }

    // 5. Cek Role Final
    if (profile.role === "admin") {
      // Jika admin, izinkan akses ke rute /admin/*
      return NextResponse.next();
    } else {
      // Jika bukan admin, redirect ke dashboard
      console.warn(
        `Akses ditolak untuk user ${user.id} (Role: ${profile.role})`
      );
      return NextResponse.redirect(
        new URL("/dashboard?error=admin_required", request.url)
      );
    }
  } catch (e) {
    console.error("Middleware Exception:", e);
    // Error tak terduga
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Konfigurasi Matcher: Terapkan middleware ini hanya pada rute yang dimulai dengan /admin
export const config = {
  matcher: ["/admin/:path*"],
};
