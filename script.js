<script type="module">
  // ---------- FIREBASE ----------
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import {
    getFirestore, collection, getDocs, setDoc, getDoc, doc, addDoc, updateDoc, deleteDoc
  } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDCAwnOEtcZ_v583dJWstak6ak5vkBvdks",
    authDomain: "agas-5ba41.firebaseapp.com",
    projectId: "agas-5ba41",
    storageBucket: "agas-5ba41.firebasestorage.app",
    messagingSenderId: "389307205431",
    appId: "1:389307205431:web:a26f89abc31c428f167cb2",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // ---------- LOGIN ----------
  window.login = async function () {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    if (!username || !password) return alert("Preencha usuário e senha!");

    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return alert("Usuário não encontrado!");
      const userData = userSnap.data();

      if (userData.password !== password) return alert("Senha incorreta!");
      alert(`Bem-vindo, ${username}!`);
      localStorage.setItem("loggedUser", username);
      // Aqui você chama showMain() se quiser mostrar o painel principal
    } catch (e) {
      console.error("Erro ao fazer login:", e);
      alert("Erro de conexão com o servidor!");
    }
  };

  // ---------- REGISTRO ----------
  window.register = async function () {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const question = document.getElementById("regQuestion").value.trim();
    const answer = document.getElementById("regAnswer").value.trim();

    if (!username || !password || !question || !answer)
      return alert("Preencha todos os campos!");

    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) return alert("Usuário já existe!");

      await setDoc(userRef, {
        username,
        password,
        question,
        answer,
        isAdmin: false,
      });

      alert("Usuário registrado com sucesso!");
    } catch (e) {
      console.error("Erro ao registrar usuário:", e);
      alert("Erro ao salvar no servidor!");
    }
  };

  // ---------- SALVAR RESERVA ----------
  window.salvarReserva = async function (reserva) {
    try {
      await addDoc(collection(db, "reservas"), reserva);
      alert("Reserva salva no banco!");
    } catch (e) {
      console.error("Erro ao salvar reserva:", e);
      alert("Erro ao conectar com o banco!");
    }
  };

  // ---------- CARREGAR RESERVAS ----------
  window.carregarReservas = async function () {
    try {
      const querySnapshot = await getDocs(collection(db, "reservas"));
      const reservas = [];
      querySnapshot.forEach(doc => reservas.push(doc.data()));
      console.log("Reservas carregadas:", reservas);
      return reservas;
    } catch (e) {
      console.error("Erro ao carregar reservas:", e);
      alert("Erro ao buscar dados!");
    }
  };
</script>
