import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrG7tE-Nkfpv810qiDgd1t98maNjFGPac",
  authDomain: "jubileomentoria.firebaseapp.com",
  projectId: "jubileomentoria",
  storageBucket: "jubileomentoria.firebasestorage.app",
  messagingSenderId: "15593767205",
  appId: "1:15593767205:web:5146658ce9be6332209acc"
};

const ADMIN_EMAIL = "kerenelias670@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

function showOnly(sectionId) {
  ["authBox", "pendingBox", "dashboard"].forEach(id => {
    $(id).classList.add("hidden");
  });
  $(sectionId).classList.remove("hidden");
}

function message(text) {
  $("authMessage").textContent = text;
}

async function createAccount() {
  const fullName = $("fullName").value.trim();
  const gender = $("gender").value;
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value.trim();

  if (!fullName || !gender || !email || !password) {
    message("Por favor completa todos los campos.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const role = email === ADMIN_EMAIL ? "admin" : "participant";
    const status = email === ADMIN_EMAIL ? "approved" : "pending";

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      gender,
      email,
      role,
      status,
      createdAt: serverTimestamp()
    });

    if (status === "pending") {
      showOnly("pendingBox");
    } else {
      showDashboard({ fullName, gender, email, role, status });
    }
  } catch (error) {
    message(error.message);
  }
}

async function login() {
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value.trim();

  if (!email || !password) {
    message("Escribe tu correo y contraseña.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    message("Correo o contraseña incorrectos.");
  }
}

async function logout() {
  await signOut(auth);
}

async function getProfile(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}

function showDashboard(profile) {
  showOnly("dashboard");

  const welcome = profile.gender === "male" ? "Bienvenido" : "Bienvenida";
  $("welcomeTitle").textContent = `${welcome}, ${profile.fullName}`;
  $("roleText").textContent =
    profile.role === "admin"
      ? "Rol: Administradora"
      : profile.role === "pastor"
      ? "Rol: Pastor(a)"
      : "Rol: Participante";

  if (profile.role === "admin") {
    $("adminPanel").classList.remove("hidden");
  } else {
    $("adminPanel").classList.add("hidden");
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showOnly("authBox");
    return;
  }

  const profile = await getProfile(user);

  if (!profile) {
    showOnly("pendingBox");
    return;
  }

  if (profile.status !== "approved") {
    showOnly("pendingBox");
    return;
  }

  showDashboard(profile);
});

$("registerBtn").addEventListener("click", createAccount);
$("loginBtn").addEventListener("click", login);
$("logoutBtn").addEventListener("click", logout);
$("logoutPending").addEventListener("click", logout);$("openRegisterBtn").addEventListener("click", () => {
  $("registerModal").classList.remove("hidden");
});

$("closeRegisterBtn").addEventListener("click", () => {
  $("registerModal").classList.add("hidden");
});