// src/middleware.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const req = request;

  // --- LOGIKA OTENTIKASI (Middleware Fix) ---

  // 1. Ambil JWT secara manual dari cookies (PENTING: Gunakan nama cookie yang benar)
  // Nama default cookie sesi Supabase adalah sb-access-token
  const jwt = request.cookies.get("sb-access-token")?.value;

  let user = null;
  if (jwt) {
    // Coba verifikasi JWT dengan me-pass raw token string.
    try {
      const { data } = await supabase.auth.getUser(jwt);
      user = data.user;
    } catch (e) {
      // console.error("Middleware JWT verification failed:", e.message); // Hilangkan komentar jika ingin debugging
    }
  }

  // --- END LOGIKA OTENTIKASI ---

  // 2. Cek apakah pengguna terautentikasi (redirect ke '/' jika gagal)
  if (!user) {
    // Rute yang memerlukan autentikasi
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/absensi") ||
      pathname.startsWith("/stok") ||
      pathname.startsWith("/laporan") ||
      pathname.startsWith("/izin") ||
      pathname.startsWith("/profil") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Cek rute login
  if (pathname === "/" || pathname.startsWith("/login")) {
    // Jika sudah login, redirect ke dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Ambil Role dari DB (Hanya untuk rute Admin)
  if (pathname.startsWith("/admin")) {
    // Menggunakan ID user yang sudah berhasil di ambil di langkah 1/2
    const { data: profile } = await supabase
      .from("pegawai")
      .select("role")
      .eq("id", user.id)
      .single();

    // 5. Cek Role Final
    const profileRole = profile?.role;

    if (profileRole === "admin") {
      // Jika admin, izinkan akses ke rute /admin/*
      return NextResponse.next();
    } else {
      // Jika bukan admin, redirect ke dashboard
      return NextResponse.redirect(
        new URL("/dashboard?error=admin_required", request.url)
      );
    }
  }

  // 6. Rute lainnya (stok, laporan, dll.)
  return NextResponse.next();
}
