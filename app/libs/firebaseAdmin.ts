// app/libs/firebaseAdmin.ts
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app =
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
      })
    : getApps()[0];

export const adminDb = getFirestore(app);
