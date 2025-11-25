// src/components/AuthProvider.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ambil sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Dengarkan perubahan auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const value = {
    user,
    loading,
    // --- FUNGSI LOGIN DENGAN DEBUGGING KRITIS ---
    login: async (email, password) => {
      // Menggunakan nama 'login' agar sesuai dengan panggilan di src/app/page.js
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Logging error yang spesifik ke konsol browser
        console.error("SUPABASE SIGN-IN ERROR:", error.message);
        return { error };
      }

      // Jika berhasil, redirect
      if (data.user) {
        router.push("/dashboard");
        return {};
      }

      // Kasus respons tidak terduga
      return {
        error: {
          message: "Respons Auth tidak terduga atau perlu konfirmasi email.",
        },
      };
    },
    // --- AKHIR DEBUGGING ---

    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
