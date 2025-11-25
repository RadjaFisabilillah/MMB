// src/components/AuthProvider.js
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Memperoleh sesi dari Supabase saat inisialisasi
  const getInitialSession = useCallback(async () => {
    try {
      // Pastikan Supabase menginisialisasi sesi dari cookie/storage
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error("Error getting initial session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getInitialSession();

    // Listener untuk perubahan state autentikasi (misalnya: login, logout, refresh token)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Navigasi ke dashboard setelah login/refresh token
          router.push("/dashboard");
        } else if (event === "SIGNED_OUT") {
          // Navigasi ke halaman login setelah logout
          router.push("/");
        }
      }
    );

    // --- LOGIKA LOGOUT PAKSA SAAT MENUTUP TAB (PERMINTAAN PENGGUNA) ---
    // Peringatan: Ini tidak 100% andal di semua browser.
    const handleBeforeUnload = async () => {
      // Memanggil fungsi logout
      await supabase.auth.signOut();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    // --- AKHIR LOGIKA LOGOUT PAKSA ---

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, [router, getInitialSession]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
  };

  const value = {
    user,
    loading,
    login,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
