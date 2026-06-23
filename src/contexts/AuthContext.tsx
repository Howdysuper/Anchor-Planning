import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  profileData: any;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, hasProfile: false, profileData: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const withTimeout = <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), ms)
        )
      ]);
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          // Race the Firestore profile lookup with a 10-second timeout
          const docSnap = await withTimeout(getDoc(docRef), 10000);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data);
            setHasProfile(true);
          } else {
            setProfileData(null);
            setHasProfile(false);
            localStorage.setItem(`anchor_onboarded_${currentUser.uid}`, 'false');
          }
        } catch (e) {
          console.warn("Firestore profile load timed out or failed. Falling back to offline client cache.", e);
          setHasProfile(false);
          setProfileData(null);
        }
      } else {
        setUser(null);
        setHasProfile(false);
        setProfileData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasProfile, profileData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
