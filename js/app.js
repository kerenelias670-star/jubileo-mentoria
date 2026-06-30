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
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
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
let currentUser = null;
let currentProfile = null;

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function showOnly(section) {
  hide($("authBox"));
  hide($("pendingBox"));
  hide($("dashboard"));
  show(section);
}

function setMessage(text) {
  $("authMessage").textContent = text || "";
}async function registerUser() {
  setMessage("");

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value.trim();

  if (!email || !password) {
    setMessage("Por favor completa todos los campos.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const role = email === ADMIN_EMAIL ? "admin" : "participant";
    const status = email === ADMIN_EMAIL ? "approved" : "pending";

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      role,
      status,
      createdAt: serverTimestamp()
    });

    if (status === "pending") {
      showOnly($("pendingBox"));
    }

  } catch (err) {
    setMessage(err.message);
  }
}

async function loginUser() {
  setMessage("");

  try {
    await signInWithEmailAndPassword(
      auth,
      $("email").value.trim(),
      $("password").value.trim()
    );
  } catch (err) {
    setMessage("Correo o contraseña incorrectos.");
  }
}async function logoutUser() {
  await signOut(auth);
}

async function loadUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const email = user.email.toLowerCase();
    const role = email === ADMIN_EMAIL ? "admin" : "participant";
    const status = role === "admin" ? "approved" : "pending";

    await setDoc(ref, {
      uid: user.uid,
      email,
      role,
      status,
      createdAt: serverTimestamp()
    });

    return { uid: user.uid, email, role, status };
  }

  return snap.data();
}

function renderDashboard() {
  showOnly($("dashboard"));

  const roleLabel =
    currentProfile.role === "admin"
      ? "Administradora"
      : currentProfile.role === "pastor"
      ? "Pastor(a)"
      : "Participante";

  $("welcomeTitle").textContent = `Bienvenido(a), ${currentProfile.email}`;
  $("roleText").textContent = `Rol: ${roleLabel}`;

  if (currentProfile.role === "admin") {
    show($("adminPanel"));
  } else {
    hide($("adminPanel"));
  }
}onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    currentProfile = null;
    showOnly($("authBox"));
    return;
  }

  currentProfile = await loadUserProfile(user);

  if (currentProfile.status !== "approved") {
    showOnly($("pendingBox"));
    return;
  }

  renderDashboard();
});

$("registerBtn").addEventListener("click", registerUser);
$("loginBtn").addEventListener("click", loginUser);
$("logoutBtn").addEventListener("click", logoutUser);
$("logoutPending").addEventListener("click", logoutUser);