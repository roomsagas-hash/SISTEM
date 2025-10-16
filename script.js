// ---------- DADOS ----------
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedUser = localStorage.getItem("loggedUser") || null;

// Cria admin padrão caso não exista
if (!users.some(u => u.username === "adm")) {
  users.push({ username: "adm", password: "1234", question: "Padrão", answer: "1234", isAdmin: true });
  localStorage.setItem("users", JSON.stringify(users));
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
function saveData() {
  localStorage.setItem("reservas", JSON.stringify(reservas));
  localStorage.setItem("users", JSON.stringify(users));
}

function renderTable() {
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
document.getElementById("bookBtn").addEventListener("click", () => {
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
  saveData(); renderTable();
});

window.excluir = i => { reservas.splice(i, 1); saveData(); renderTable(); };
window.editar = i => {
  const r = reservas[i];
  document.getElementById("titulo").value = r.titulo;
  document.getElementById("data").value = r.data;
  horaInicioSelect.value = r.inicio;
  horaFimSelect.value = r.fim;
  reservas.splice(i, 1);
  saveData(); renderTable();
};

// ---------- LOGIN ----------
function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!user) return alert("Usuário ou senha incorretos!");
  loggedUser = user.username;
  localStorage.setItem("loggedUser", loggedUser);
  showMain();
}

// Enter permite login
document.getElementById("loginUsername").addEventListener("keyup", e => { if(e.key==="Enter") login(); });
document.getElementById("loginPassword").addEventListener("keyup", e => { if(e.key==="Enter") login(); });

// ---------- REGISTRO ----------
function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const question = document.getElementById("regQuestion").value.trim();
  const answer = document.getElementById("regAnswer").value.trim();
  if (!username || !password || !question || !answer) return alert("Preencha todos os campos!");
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return alert("Usuário já existe!");
  users.push({ username, password, question, answer, isAdmin: false });
  saveData(); alert("Usuário registrado com sucesso!"); showLogin();
}

// ---------- RECUPERAÇÃO DE SENHA ----------
function askQuestion() {
  const username = document.getElementById("recUsername").value.trim();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return alert("Usuário não encontrado!");
  const div = document.getElementById("securityQuestion");
  div.style.display = "block";
  div.innerHTML = `
    <p>${user.question}</p>
    <input type="text" id="recAnswer" placeholder="Resposta"><br><br>
    <input type="password" id="newPassword" placeholder="Nova senha"><br><br>
    <button class="book-btn" onclick="resetPassword('${user.username}')">Redefinir Senha</button>
  `;
}

function resetPassword(username) {
  const user = users.find(u => u.username === username);
  const answer = document.getElementById("recAnswer").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();
  if (answer !== user.answer) return alert("Resposta incorreta!");
  if (!newPass) return alert("Digite uma nova senha!");
  user.password = newPass; saveData(); alert("Senha redefinida!"); showLogin();
}

// ---------- LOGOFF ----------
function logoff() { loggedUser=null; localStorage.removeItem("loggedUser"); showLogin(); }

// ---------- TELA PRINCIPAL ----------
function showMain() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("registerSection").style.display = "none";
  document.getElementById("recoverySection").style.display = "none";
  document.getElementById("mainSection").style.display = "block";
  document.getElementById("logoffBtn").style.display = "inline-block";
  const userObj = users.find(u => u.username === loggedUser);
  document.getElementById("statusBar").innerText = `Usuário: ${loggedUser} ${userObj?.isAdmin ? "(ADM)" : ""}`;
  if (userObj?.isAdmin) document.getElementById("usuariosTabBtn").style.display = "inline-block";
  else document.getElementById("usuariosTabBtn").style.display = "none";
  renderTable(); renderUsersTable();
}

function showLogin() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("registerSection").style.display = "none";
  document.getElementById("recoverySection").style.display = "none";
  document.getElementById("mainSection").style.display = "none";
  document.getElementById("logoffBtn").style.display = "none";
}

function showRegister() { document.getElementById("loginSection").style.display="none"; document.getElementById("registerSection").style.display="block"; }
function showRecovery() { document.getElementById("loginSection").style.display="none"; document.getElementById("recoverySection").style.display="block"; document.getElementById("securityQuestion").style.display="none"; }

// ---------- ABAS ----------
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(btn=>btn.classList.remove("active"));
  if(tab==="horarios"){ 
    document.querySelector("#tabHorarios").style.display="block"; 
    document.querySelector("#tabUsuarios").style.display="none"; 
    document.querySelectorAll(".tab")[0].classList.add("active"); 
  } else { 
    document.querySelector("#tabHorarios").style.display="none"; 
    document.querySelector("#tabUsuarios").style.display="block"; 
    document.querySelectorAll(".tab")[1].classList.add("active"); 
  }
}

// ---------- USUÁRIOS ----------
function renderUsersTable() {
  const userObj = users.find(u=>u.username===loggedUser);
  if(!userObj||!userObj.isAdmin) return;
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML="";
  users.forEach(u=>{
    tbody.innerHTML+=`
      <tr>
        <td>${u.username}</td>
        <td>${u.isAdmin?"ADM":"Usuário"}</td>
        <td>
          ${u.username!=="adm"?`
            <button class="action-btn delete-btn" onclick="deleteUser('${u.username}')">Excluir</button>
            <button class="action-btn reset-btn" onclick="forceReset('${u.username}')">Redefinir Senha</button>
            <button class="action-btn promote-btn" onclick="toggleAdmin('${u.username}')">${u.isAdmin?"Rebaixar":"Promover"} ADM</button>
            <button class="action-btn edit-btn" onclick="editUserName('${u.username}')">Ajustar</button>
          `:`<span class="view-only">Protegido</span>`}
        </td>
      </tr>
    `;
  });
}

window.deleteUser=function(username){ if(!confirm("Excluir usuário "+username+"?")) return; users=users.filter(u=>u.username!==username); reservas=reservas.filter(r=>r.organizador!==username); saveData(); renderUsersTable(); renderTable(); }
window.forceReset=function(username){ const newPass=prompt("Digite a nova senha para "+username+":"); if(!newPass) return; const user=users.find(u=>u.username===username); if(user){ user.password=newPass; saveData(); alert("Senha redefinida!"); } }
window.toggleAdmin=function(username){ const user=users.find(u=>u.username===username); if(user){ user.isAdmin=!user.isAdmin; saveData(); renderUsersTable(); } }
window.editUserName=function(username){ const newName=prompt("Digite o novo nome de usuário:",username); if(!newName) return; if(users.some(u=>u.username.toLowerCase()===newName.toLowerCase())){ alert("Esse nome já está em uso!"); return; } const user=users.find(u=>u.username===username); if(user){ reservas.forEach(r=>{ if(r.organizador===user.username) r.organizador=newName; }); user.username=newName; saveData(); renderUsersTable(); renderTable(); alert("Nome de usuário atualizado com sucesso!"); } }

document.getElementById("logoffBtn").addEventListener("click", logoff);

// ---------- INICIALIZAÇÃO ----------
if(loggedUser && users.some(u=>u.username===loggedUser)) showMain(); else showLogin();
