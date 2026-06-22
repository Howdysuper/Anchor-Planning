import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// The config provides databaseId, use initializeFirestore to ensure it passes through
export const app = initializeApp(config);

export const db = initializeFirestore(app, {}, (config as any).firestoreDatabaseId ? (config as any).firestoreDatabaseId : undefined);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed", error);
  }
};

export const logout = async () => {
  await signOut(auth);
};
