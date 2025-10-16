<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

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
  const analytics = getAnalytics(app);

  // ---------- VARIÁVEIS ----------
  let reservas = [];
  let users = [];
  let loggedUser = null;

  // ---------- FUNÇÕES FIREBASE ----------
  async function loadData() {
    try {
      const snapshotUsers = await get(child(ref(db), "users"));
      const snapshotReservas = await get(child(ref(db), "reservas"));
      if (snapshotUsers.exists()) users = snapshotUsers.val();
      if (snapshotReservas.exists()) reservas = snapshotReservas.val();
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    }
  }

  async function saveData() {
    try {
      await set(ref(db, "users"), users);
      await set(ref(db, "reservas"), reservas);
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
    }
  }

  async function saveLoggedUser(user) {
    loggedUser = user;
    await set(ref(db, "loggedUser"), user || null);
  }

  async function loadLoggedUser() {
    const snapshot = await get(child(ref(db), "loggedUser"));
    if (snapshot.exists()) loggedUser = snapshot.val();
  }

  // ---------- INICIALIZAÇÃO ----------
  await loadData();
  await loadLoggedUser();

  // Cria admin padrão caso não exista
  if (!users || !Array.isArray(users)) users = [];
  if (!users.some(u => u.username === "adm")) {
    users.push({ username: "adm", password: "1234", question: "Padrão", answer: "1234", isAdmin: true });
    await saveData();
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

  // ---------- FUNÇÕES ----------
  async function renderTable() {
    tableBody.innerHTML = "";
    const userObj = users.find(u => u.username === loggedUser);
    reservas.forEach((r, index) => {
      const row = document.createElement("tr");
      let actionBtns = "";
      if (userObj?.isAdmin || r.organizador === loggedUser) {
        actionBtns = `
          <button class="action-btn edit-btn" onclick="editar(${index})">Editar</button>
          <button class="action-btn delete-btn" onclick="excluir(${index})">Excluir</button>
        `;
      } else {
        actionBtns = `<span class="view-only">Visualização</span>`;
      }
      row.innerHTML = `
        <td>${r.titulo}</td>
        <td>${r.organizador}</td>
        <td>${r.data}</td>
        <td>${r.inicio}</td>
        <td>${r.fim}</td>
        <td>${actionBtns}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // ---------- RESERVAS ----------
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
    reservas.push({ titulo, organizador: loggedUser, data, inicio, fim });
    await saveData();
    renderTable();
  });

  window.excluir = async i => { reservas.splice(i, 1); await saveData(); renderTable(); };
  window.editar = async i => {
    const r = reservas[i];
    document.getElementById("titulo").value = r.titulo;
    document.getElementById("data").value = r.data;
    horaInicioSelect.value = r.inicio;
    horaFimSelect.value = r.fim;
    reservas.splice(i, 1);
    await saveData(); renderTable();
  };

  // ---------- LOGIN ----------
  async function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return alert("Usuário ou senha incorretos!");
    await saveLoggedUser(user.username);
    showMain();
  }

  document.getElementById("loginUsername").addEventListener("keyup", e => { if(e.key==="Enter") login(); });
  document.getElementById("loginPassword").addEventListener("keyup", e => { if(e.key==="Enter") login(); });

  // ---------- REGISTRO ----------
  async function register() {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const question = document.getElementById("regQuestion").value.trim();
    const answer = document.getElementById("regAnswer").value.trim();
    if (!username || !password || !question || !answer) return alert("Preencha todos os campos!");
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return alert("Usuário já existe!");
    users.push({ username, password, question, answer, isAdmin: false });
    await saveData(); alert("Usuário registrado com sucesso!"); showLogin();
  }

  // ---------- LOGOFF ----------
  async function logoff() { await saveLoggedUser(null); showLogin(); }

  document.getElementById("logoffBtn").addEventListener("click", logoff);

  // ---------- INÍCIO ----------
  if (loggedUser && users.some(u => u.username === loggedUser)) showMain(); else showLogin();
</script>

