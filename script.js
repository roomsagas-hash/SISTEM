<script type="module">
  // ---------- IMPORTS ----------
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { 
    getDatabase, ref, set, get, child, onValue, update
  } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
  import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

  // ---------- CONFIG FIREBASE ----------
  const firebaseConfig = {
    apiKey: "AIzaSyDCAwnOEtcZ_v583dJWstak6ak5vkBvdks",
    authDomain: "agas-5ba41.firebaseapp.com",
    databaseURL: "https://agas-5ba41-default-rtdb.firebaseio.com",
    projectId: "agas-5ba41",
    storageBucket: "agas-5ba41.firebasestorage.app",
    messagingSenderId: "389307205431",
    appId: "1:389307205431:web:a26f89abc31c428f167cb2",
    measurementId: "G-PQ8Z6NX3VN"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);

  // ---------- VARIÁVEIS ----------
  let reservas = [];
  let userEmail = null;

  // ---------- REDEFINIR INTERFACE ----------
  function showLogin() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("mainSection").style.display = "none";
  }

  function showRegister() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
  }

  function showMain() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
    document.getElementById("statusBar").innerText = `Usuário: ${userEmail}`;
    renderTable();
  }

  // ---------- HORÁRIOS ----------
  const horarios = [];
  for (let h = 7; h <= 18; h++) {
    horarios.push((h < 10 ? "0"+h : h)+":00");
    horarios.push((h < 10 ? "0"+h : h)+":30");
  }

  const horaInicioSelect = document.getElementById('horaInicio');
  const horaFimSelect = document.getElementById('horaFim');
  horarios.forEach(h => {
    horaInicioSelect.add(new Option(h, h));
    horaFimSelect.add(new Option(h, h));
  });

  const tableBody = document.querySelector("#meetingTable tbody");

  // ---------- FUNÇÕES DE RESERVA ----------
  function listenReservas() {
    onValue(ref(db, "reservas"), (snapshot) => {
      reservas = snapshot.exists() ? snapshot.val() : [];
      renderTable();
    });
  }

  function renderTable() {
    if (!reservas) return;
    tableBody.innerHTML = "";
    reservas.forEach((r, index) => {
      const isOwner = r.organizador === userEmail;
      const row = document.createElement("tr");
      const actionBtns = isOwner
        ? `<button class="action-btn edit-btn" onclick="editar(${index})">Editar</button>
           <button class="action-btn delete-btn" onclick="excluir(${index})">Excluir</button>`
        : `<span class="view-only">Visualização</span>`;
      row.innerHTML = `
        <td>${r.titulo}</td>
        <td>${r.organizador}</td>
        <td>${r.data}</td>
        <td>${r.inicio}</td>
        <td>${r.fim}</td>
        <td>${actionBtns}</td>`;
      tableBody.appendChild(row);
    });
  }

  document.getElementById("bookBtn").addEventListener("click", async () => {
    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const inicio = horaInicioSelect.value;
    const fim = horaFimSelect.value;
    if (!titulo || !data || !inicio || !fim) return alert("Preencha todos os campos!");
    if (horarios.indexOf(inicio) >= horarios.indexOf(fim)) return alert("Fim deve ser depois do início!");
    if (reservas.some(r => r.data === data && ((inicio >= r.inicio && inicio < r.fim) || (fim > r.inicio && fim <= r.fim) || (inicio <= r.inicio && fim >= r.fim)))) {
      return alert("Já existe uma reserva nesse intervalo!");
    }

    const novaReserva = { titulo, organizador: userEmail, data, inicio, fim };
    reservas.push(novaReserva);
    await set(ref(db, "reservas"), reservas);
  });

  window.excluir = async i => {
    reservas.splice(i, 1);
    await set(ref(db, "reservas"), reservas);
  };

  window.editar = async i => {
    const r = reservas[i];
    document.getElementById("titulo").value = r.titulo;
    document.getElementById("data").value = r.data;
    horaInicioSelect.value = r.inicio;
    horaFimSelect.value = r.fim;
    reservas.splice(i, 1);
    await set(ref(db, "reservas"), reservas);
  };

  // ---------- AUTHENTICAÇÃO ----------
  // Login
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  });

  // Registro
  document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Usuário criado com sucesso!");
      showLogin();
    } catch (error) {
      alert("Erro ao registrar: " + error.message);
    }
  });

  // Logout
  document.getElementById("logoffBtn").addEventListener("click", async () => {
    await signOut(auth);
  });

  // Mudança de autenticação
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail = user.email;
      listenReservas();
      showMain();
    } else {
      userEmail = null;
      showLogin();
    }
  });
</script>
