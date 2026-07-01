
import {
  createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
      signOut,
        onAuthStateChanged
        } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

        import {
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
                          import { auth, db } from "./firebase-config.js";


                          const ADMIN_EMAIL = "kerenelias670@gmail.com";



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
                                            const email = $("registerEmail").value.trim().toLowerCase();
                                              const password = $("registerPassword").value.trim();

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

                                                                                                                                                                                                                                       if (profile.role === "admin" || profile.role === "pastor") {
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

if (profile.role === "admin" || profile.role === "pastor") {
    listenPendingUsers(profile);
}
                                                                                                                                                                                                                                                                                           

                                                                                                                                                                                                                                                                                          


                                                                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                                             });

                                                                                                                                                                                                                                                                                             $("registerBtn").addEventListener("click", createAccount);
                                                                                                                                                                                                                                                                                             $("loginBtn").addEventListener("click", login);
                                                                                                                                                                                                                                                                                             $("logoutBtn").addEventListener("click", logout);
                                                                                                                                                                                                                                                                                             $("logoutPending").addEventListener("click", logout);
                                                                                                                                                                                                                                                                                             $("openRegisterBtn").addEventListener("click", () => {
                                                                                                                                                                                                                                                                                               $("registerModal").classList.remove("hidden");
                                                                                                                                                                                                                                                                                               });

                                                                                                                                                                                                                                                                                               $("closeRegisterBtn").addEventListener("click", () => {
                                                                                                                                                                                                                                                                                                 $("registerModal").classList.add("hidden");

                                                                                                                                                                                                                                                                                                 });
                                                                                                                                                                                                                                                                                                 function canLead(profile) {
                                                                                                                                                                                                                                                                                                   return profile.role === "admin" || profile.role === "pastor";
                                                                                                                                                                                                                                                                                                   }

                                                                                                                                                                                                                                                                                                   function listenPendingUsers(profile) {
                                                                                                                                                                                                                                                                                                     if (!canLead(profile)) return;

                                                                                                                                                                                                                                                                                                       const q = query(collection(db, "users"), where("status", "==", "pending"));

                                                                                                                                                                                                                                                                                                         onSnapshot(q, (snapshot) => {
                                                                                                                                                                                                                                                                                                             const box = $("pendingUsers");

                                                                                                                                                                                                                                                                                                                 if (snapshot.empty) {
                                                                                                                                                                                                                                                                                                                       box.innerHTML = "<p>No hay solicitudes pendientes.</p>";
                                                                                                                                                                                                                                                                                                                             return;
                                                                                                                                                                                                                                                                                                                                 }

                                                                                                                                                                                                                                                                                                                                     box.innerHTML = "";

                                                                                                                                                                                                                                                                                                                                         snapshot.forEach((docSnap) => {
                                                                                                                                                                                                                                                                                                                                               const user = docSnap.data();

                                                                                                                                                                                                                                                                                                                                                     const card = document.createElement("div");
                                                                                                                                                                                                                                                                                                                                                           card.className = "user-request";
                                                                                                                                                                                                                                                                                                                                                                 card.innerHTML = `
                                                                                                                                                                                                                                                                                                                                                                         <p><strong>${user.fullName}</strong></p>
                                                                                                                                                                                                                                                                                                                                                                                 <p>${user.email}</p>
                                                                                                                                                                                                                                                                                                                                                                                         <p>${user.gender === "male" ? "Hombre" : "Mujer"}</p>
                                                                                                                                                                                                                                                                                                                                                                                                 <button data-id="${docSnap.id}" data-role="participant">Aprobar participante</button>
                                                                                                                                                                                                                                                                                                                                                                                                         <button data-id="${docSnap.id}" data-role="pastor">Aprobar pastor(a)</button>
                                                                                                                                                                                                                                                                                                                                                                                                                 <button data-id="${docSnap.id}" data-role="rejected" class="danger">Rechazar</button>
                                                                                                                                                                                                                                                                                                                                                                                                                       `;

                                                                                                                                                                                                                                                                                                                                                                                                                             card.querySelectorAll("button").forEach((btn) => {
                                                                                                                                                                                                                                                                                                                                                                                                                                     btn.addEventListener("click", async () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                               if (btn.dataset.role === "rejected") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                           await updateDoc(doc(db, "users", btn.dataset.id), {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                         status: "rejected"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           await updateDoc(doc(db, "users", btn.dataset.id), {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         status: "approved",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       role: btn.dataset.role
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           });

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 box.appendChild(card);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       }