import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // 1. Add this import

const firebaseConfig = {
  apiKey: "AIzaSyCWnU4WehtzBqGWTTj9cNgcbNZn4y63_fo",
  authDomain: "miittlespackes.firebaseapp.com",
  projectId: "miittlespackes",
  storageBucket: "miittlespackes.firebasestorage.app",
  messagingSenderId: "887594223206",
  appId: "1:887594223206:web:77e6eb7707776eb1e78fa7",
  measurementId: "G-7N0L93VVPD"
};

// 2. Use this check to prevent re-initialization in Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // 3. Export auth