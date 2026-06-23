import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// The config provides databaseId, use initializeFirestore to ensure it passes through
export const app = initializeApp(config);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, (config as any).firestoreDatabaseId ? (config as any).firestoreDatabaseId : undefined);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const registerEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logout = async () => {
  await signOut(auth);
};
