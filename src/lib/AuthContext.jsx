"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import {
  DEMO_PROFILE,
  DEMO_STORAGE_KEY,
  DEMO_USER,
  isDemoAuthEnabled,
  isDemoUser,
} from "@/lib/demoAuth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      isDemoAuthEnabled() &&
      typeof window !== "undefined" &&
      window.localStorage.getItem(DEMO_STORAGE_KEY) === "true"
    ) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (isDemoUser(user)) {
      setProfile(DEMO_PROFILE);
      return DEMO_PROFILE;
    }

    if (user) {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      return userProfile;
    }

    return null;
  };

  const startDemoSession = () => {
    if (!isDemoAuthEnabled() || typeof window === "undefined") return false;
    window.localStorage.setItem(DEMO_STORAGE_KEY, "true");
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setLoading(false);
    return true;
  };

  const endDemoSession = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        startDemoSession,
        endDemoSession,
        isDemo: isDemoUser(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
