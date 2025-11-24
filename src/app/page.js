// src/app/page.js
import { redirect } from "next/navigation";

// Halaman root (/) ini akan langsung mengalihkan pengguna ke /dashboard
// Ini adalah Server Component Next.js
export default function HomePage() {
  // Mengarahkan pengguna ke halaman utama aplikasi yang sesungguhnya.
  // Idealnya, rute /dashboard kemudian akan mengecek status Auth
  // dan mengarahkan ke /login jika pengguna belum login.
  redirect("/dashboard");

  // Secara teknis, kode di bawah redirect tidak akan pernah dijalankan,
  // tetapi Anda bisa mengembalikannya sebagai fallback.
  return null;
}
