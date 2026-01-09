import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const secondaryApp =
  getApps().find(app => app.name === "Secondary")
    ?? initializeApp(
        {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        },
        "Secondary"
      );

export const secondaryAuth = getAuth(secondaryApp);
