import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// Include databaseURL from config, env or default project URL to ensure proper reference
const firebaseConfig = {
  ...config,
  databaseURL: (config as any).databaseURL || (import.meta as any).env.VITE_FIREBASE_DATABASE_URL || "https://shaurya-anchor-project-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);

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

export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible'
    });
  }
  return (window as any).recaptchaVerifier;
};

export const loginWithPhone = async (phoneNumber: string, appVerifier: any) => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const logout = async () => {
  await signOut(auth);
};
