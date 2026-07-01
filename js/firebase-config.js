import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrG7tE-Nkfpv810qiDgd1t98maNjFGPac",
    authDomain: "jubileomentoria.firebaseapp.com",
      projectId: "jubileomentoria",
        storageBucket: "jubileomentoria.firebasestorage.app",
          messagingSenderId: "15593767205",
            appId: "1:15593767205:web:5146658ce9be6332209acc"
            };

            const app = initializeApp(firebaseConfig);

            export const auth = getAuth(app);
            export const db = getFirestore(app);