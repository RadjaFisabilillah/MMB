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

  const getInitialSession = useCallback(async () => {
    try {
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        // Hanya tangani SIGNED_OUT
        if (event === "SIGNED_OUT") {
          router.push("/");
        }
      }
    );

    // --- LOGIKA LOGOUT PAKSA SAAT MENUTUP TAB ---
    const handleBeforeUnload = async () => {
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
    // Mengambil user setelah sign in, jika berhasil
    const { data: userData } = await supabase.auth.getUser();
    return { data: { user: userData.user }, error };
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
