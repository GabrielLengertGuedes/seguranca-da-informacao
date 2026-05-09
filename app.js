let USERS = [
  {
    id: 1,
    name: "Ana Souza",
    email: "aluno@faculdade.local",
    password: "123456",
    role: "ALUNO",
    studentId: "202400001"
  },
  {
    id: 2,
    name: "Prof. Carlos Lima",
    email: "professor@faculdade.local",
    password: "123456",
    role: "PROFESSOR"
  },
  {
    id: 3,
    name: "Administrador Geral",
    email: "admin@faculdade.local",
    password: "admin",
    role: "ADMIN"
  }
];

const STORAGE_KEYS = {
  session: "ocorrencias_sessao",
  occurrences: "ocorrencias_registros",
  audit: "ocorrencias_logs",
  users: "ocorrencias_usuarios"
};

const INITIAL_OCCURRENCES = [
  {
    id: "OC-1001",
    studentName: "Marina Alves",
    studentId: "202300145",
    category: "Nota",
    priority: "Média",
    description: "Solicitação de revisão de nota da avaliação bimestral.",
    internalNote: "Verificar com a coordenação antes de responder.",
    status: "Aberta",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:40:00.000Z"
  },
  {
    id: "OC-1002",
    studentName: "Rafael Martins",
    studentId: "202200771",
    category: "Frequência",
    priority: "Alta",
    description: "Aluno contesta lançamento de falta em aula prática.",
    internalNote: "Conferir chamada manual.",
    status: "Em análise",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:50:00.000Z"
  },
  {
    id: "OC-1003",
    studentName: "Beatriz Costa",
    studentId: "202100441",
    category: "Solicitação administrativa",
    priority: "Crítica",
    description: "Solicitação envolvendo documentação acadêmica e prazo de matrícula.",
    internalNote: "Priorizar atendimento.",
    status: "Aberta",
    createdBy: "admin@faculdade.local",
    createdAt: "2026-05-05T19:00:00.000Z"
  },
  {
    id: "OC-1004",
    studentName: "Ana Souza",
    studentId: "202400001",
    category: "Frequência",
    priority: "Baixa",
    description: "Solicitação de justificativa de ausência por motivo de saúde.",
    internalNote: "Aguarda documentação médica.",
    status: "Aberta",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-06T10:00:00.000Z"
  }
];

const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const occurrenceForm = document.querySelector("#occurrenceForm");
const logoutBtn = document.querySelector("#logoutBtn");
const searchInput = document.querySelector("#search");
const roleSelect = document.querySelector("#roleSelect");
const sessionBadge = document.querySelector("#sessionBadge");
const currentUserName = document.querySelector("#currentUserName");
const currentUserDetails = document.querySelector("#currentUserDetails");
const occurrencesTable = document.querySelector("#occurrencesTable");
const studentOccurrencesTable = document.querySelector("#studentOccurrencesTable");
const auditLog = document.querySelector("#auditLog");
const totalOccurrences = document.querySelector("#totalOccurrences");
const criticalOccurrences = document.querySelector("#criticalOccurrences");
const lastUpdate = document.querySelector("#lastUpdate");

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "null") || USERS;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  USERS = users;
}

function getOccurrences() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.occurrences) || "[]");
}

function saveOccurrences(occurrences) {
  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(occurrences));
}

function getAuditLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.audit) || "[]");
}

function saveAuditLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify(logs));
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
}

function saveSession(user) {
  const { password, ...sessionData } = user;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
}

function writeLog(action, detail) {
  const session = getSession();
  const logs = getAuditLogs();

  logs.unshift({
    when: new Date().toISOString(),
    user: session ? session.email : "anonimo",
    role: session ? session.role : "SEM_SESSAO",
    action,
    detail
  });

  saveAuditLogs(logs);
}

function boot() {
  if (!localStorage.getItem(STORAGE_KEYS.occurrences)) {
    localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(INITIAL_OCCURRENCES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.audit)) {
    localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify([
      {
        when: new Date().toISOString(),
        user: "sistema",
        action: "BASE_INICIAL_CRIADA",
        detail: "Dados fictícios carregados no armazenamento local."
      }
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(USERS));
  } else {
    USERS = getUsers();
  }

  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.classList.remove("hidden");
  appView.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  sessionBadge.textContent = "Sessão não iniciada";
  sessionBadge.classList.add("muted");
}

function showApp(user) {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");

  sessionBadge.textContent = `${user.name} — ${user.role}`;
  sessionBadge.classList.remove("muted");

  currentUserName.textContent = user.name;
  currentUserDetails.textContent = `${user.email} | Perfil: ${user.role}`;

  const roleLabels = { ALUNO: "Aluno", PROFESSOR: "Professor", ADMIN: "Administrador" };
  document.querySelector("#roleBadgeWrap").innerHTML =
    `<span class="role-tag role-${user.role}">${roleLabels[user.role] || user.role}</span>`;

  const roleSwitchSection = document.querySelector("#roleSwitchSection");
  if (user.role === "ADMIN") {
    roleSwitchSection.classList.remove("hidden");
    roleSelect.value = user.role;
  } else {
    roleSwitchSection.classList.add("hidden");
  }

  applyRolePermissions(user.role);
  render();
}

function applyRolePermissions(role) {
  const studentView = document.querySelector("#studentView");
  const staffView = document.querySelector("#staffView");
  const auditSection = document.querySelector("#auditSection");
  const adminPanel = document.querySelector("#adminPanel");
  const quickActions = document.querySelector("#quickActions");

  studentView.classList.add("hidden");
  staffView.classList.add("hidden");
  auditSection.classList.add("hidden");
  adminPanel.classList.add("hidden");

  if (role === "ALUNO") {
    studentView.classList.remove("hidden");
    quickActions.innerHTML = `
      <p class="muted-text" style="font-size:0.85rem;">
        Nenhuma ação administrativa disponível para este perfil.
      </p>`;

  } else if (role === "PROFESSOR") {
    staffView.classList.remove("hidden");
    quickActions.innerHTML = `
      <p class="muted-text" style="font-size:0.85rem;">
        Ações de exportação, logs e restauração são exclusivas do administrador.
      </p>`;

  } else if (role === "ADMIN") {
    staffView.classList.remove("hidden");
    auditSection.classList.remove("hidden");
    adminPanel.classList.remove("hidden");
    quickActions.innerHTML = `
      <button id="exportBtn" class="btn secondary" type="button">Exportar dados</button>
      <button id="clearLogsBtn" class="btn secondary" type="button">Limpar logs</button>
      <button id="resetBtn" class="btn danger" type="button">Restaurar dados iniciais</button>
    `;
    document.querySelector("#exportBtn").addEventListener("click", exportEverything);
    document.querySelector("#clearLogsBtn").addEventListener("click", clearLogs);
    document.querySelector("#resetBtn").addEventListener("click", resetData);

    renderAdminPanel();
  }
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Usuário ou senha inválidos.");
    writeLog("LOGIN_FALHOU", `Tentativa de acesso para ${email}`);
    return;
  }

  saveSession(user);
  writeLog("LOGIN_OK", `${user.email} (${user.role}) entrou no sistema.`);
  showApp(user);
}

function logout() {
  const session = getSession();
  writeLog("LOGOUT", session ? `${session.email} encerrou a sessão.` : "Sessão encerrada.");
  localStorage.removeItem(STORAGE_KEYS.session);
  showLogin();
}

function changeRole(newRole) {
  const session = getSession();

  if (!session || session.role !== "ADMIN") {
    alert("Apenas administradores podem alterar perfis.");
    return;
  }

  session.role = newRole;
  saveSession(session);
  writeLog("PERFIL_SIMULADO", `Administrador simulou perfil: ${newRole}`);
  showApp(session);
}

function changeUserRole(userId, newRole) {
  const session = getSession();

  if (!session || session.role !== "ADMIN") {
    alert("Apenas administradores podem alterar perfis de usuários.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return;

  const oldRole = user.role;
  user.role = newRole;
  saveUsers(users);

  writeLog("USUARIO_PERFIL_ALTERADO", `Admin alterou perfil de ${user.email}: ${oldRole} → ${newRole}`);
  renderAdminPanel();
}

function createOccurrence(event) {
  event.preventDefault();

  const session = getSession();

  if (!session || session.role === "ALUNO") {
    alert("Você não tem permissão para registrar ocorrências.");
    return;
  }

  const studentName = document.querySelector("#studentName").value.trim();
  const studentId = document.querySelector("#studentId").value.trim();

  if (!studentName || !studentId) {
    alert("Nome do aluno e matrícula são obrigatórios.");
    return;
  }

  const occurrence = {
    id: `OC-${Math.floor(Math.random() * 9000) + 1000}`,
    studentName,
    studentId,
    category: document.querySelector("#category").value,
    priority: document.querySelector("#priority").value,
    description: document.querySelector("#description").value.trim(),
    internalNote: document.querySelector("#internalNote").value.trim(),
    status: "Aberta",
    createdBy: session.email,
    createdAt: new Date().toISOString()
  };

  const occurrences = getOccurrences();
  occurrences.unshift(occurrence);
  saveOccurrences(occurrences);

  writeLog(
    "OCORRENCIA_CRIADA",
    `${session.email} criou ${occurrence.id} para matrícula ${occurrence.studentId} (${occurrence.category})`
  );

  occurrenceForm.reset();
  render();
}

function deleteOccurrence(id) {
  const session = getSession();

  if (!session || session.role !== "ADMIN") {
    alert("Apenas administradores podem excluir ocorrências.");
    return;
  }

  if (!confirm(`Confirma a exclusão da ocorrência ${id}? Esta ação não pode ser desfeita.`)) return;

  const occurrences = getOccurrences();
  const updated = occurrences.filter(item => item.id !== id);

  saveOccurrences(updated);
  writeLog("OCORRENCIA_EXCLUIDA", `Admin excluiu a ocorrência ${id}.`);
  render();
}

function changeStatus(id, status) {
  const session = getSession();

  if (!session || session.role === "ALUNO") {
    alert("Você não tem permissão para alterar o status de ocorrências.");
    return;
  }

  const occurrences = getOccurrences();
  const occurrence = occurrences.find(item => item.id === id);
  if (!occurrence) return;

  const oldStatus = occurrence.status;
  occurrence.status = status;
  occurrence.updatedAt = new Date().toISOString();

  saveOccurrences(occurrences);
  writeLog("STATUS_ALTERADO", `${session.email} alterou ${id}: "${oldStatus}" → "${status}"`);
  render();
}

function exportEverything() {
  const session = getSession();

  if (!session || session.role !== "ADMIN") {
    alert("Apenas administradores podem exportar dados.");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: { name: session.name, email: session.email, role: session.role },
    occurrences: getOccurrences(),
    audit: getAuditLogs()
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `backup-ocorrencias-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
  writeLog("EXPORTACAO_REALIZADA", "Administrador exportou ocorrências e logs.");
}

function clearLogs() {
  const session = getSession();
  if (!session || session.role !== "ADMIN") return;
  if (!confirm("Limpar todos os logs de auditoria?")) return;

  saveAuditLogs([]);
  writeLog("LOGS_LIMPOS", "Administrador limpou os registros de auditoria.");
  render();
}

function resetData() {
  const session = getSession();
  if (!session || session.role !== "ADMIN") return;
  if (!confirm("Restaurar dados iniciais? Todas as ocorrências atuais serão substituídas.")) return;

  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(INITIAL_OCCURRENCES));
  localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.session);
  boot();
}

function renderAdminPanel() {
  const userManagementList = document.querySelector("#userManagementList");
  if (!userManagementList) return;

  const users = getUsers();
  const roleLabels = { ALUNO: "Aluno", PROFESSOR: "Professor", ADMIN: "Administrador" };

  userManagementList.innerHTML = users.map(user => `
    <div class="user-item">
      <div class="user-info">
        <strong>${user.name}</strong>
        <span class="muted-text">${user.email}</span>
      </div>
      <div class="user-role-control">
        <select class="role-select-admin" onchange="changeUserRole(${user.id}, this.value)">
          <option value="ALUNO" ${user.role === "ALUNO" ? "selected" : ""}>Aluno</option>
          <option value="PROFESSOR" ${user.role === "PROFESSOR" ? "selected" : ""}>Professor</option>
          <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>Administrador</option>
        </select>
        <span class="role-tag role-${user.role}">${roleLabels[user.role] || user.role}</span>
      </div>
    </div>
  `).join("");
}

function renderStudentOccurrences(session) {
  if (!studentOccurrencesTable) return;

  const studentId = session.studentId || "";
  const studentName = session.name || "";
  const occurrences = getOccurrences();
  const own = occurrences.filter(item =>
    item.studentId === studentId ||
    item.studentName.toLowerCase() === studentName.toLowerCase()
  );

  if (own.length === 0) {
    studentOccurrencesTable.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">
          Nenhuma ocorrência encontrada para sua matrícula (${studentId || "não definida"}).
        </td>
      </tr>`;
    return;
  }

  studentOccurrencesTable.innerHTML = own.map(item => `
    <tr>
      <td><code style="font-size:0.82rem;">${item.id}</code></td>
      <td>${item.category}</td>
      <td><span class="priority ${item.priority}">${item.priority}</span></td>
      <td><span class="status-badge status-${item.status.replace(/\s+/g, "-")}">${item.status}</span></td>
      <td>${item.description || "—"}</td>
      <td><span class="muted-text">${new Date(item.createdAt).toLocaleDateString("pt-BR")}</span></td>
    </tr>
  `).join("");
}

function render() {
  const session = getSession();
  if (!session) return;

  if (session.role === "ALUNO") {
    renderStudentOccurrences(session);
    return;
  }

  const term = searchInput ? searchInput.value.toLowerCase() : "";
  const occurrences = getOccurrences();

  const filtered = occurrences.filter(item => {
    const searchable = `${item.studentName} ${item.studentId} ${item.category} ${item.description} ${item.status}`.toLowerCase();
    return searchable.includes(term);
  });

  if (totalOccurrences) totalOccurrences.textContent = occurrences.length;
  if (criticalOccurrences) criticalOccurrences.textContent = occurrences.filter(i => i.priority === "Crítica").length;
  if (lastUpdate) lastUpdate.textContent = `Atualizado em ${new Date().toLocaleTimeString("pt-BR")}`;

  const isAdmin = session.role === "ADMIN";

  if (occurrencesTable) {
    if (filtered.length === 0) {
      occurrencesTable.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:var(--muted);padding:2rem;">
            Nenhuma ocorrência encontrada.
          </td>
        </tr>`;
    } else {
      occurrencesTable.innerHTML = filtered.map(item => `
        <tr>
          <td>
            <strong>${item.studentName}</strong><br/>
            <span class="muted-text">Matr.: ${item.studentId}</span>
          </td>
          <td>${item.category}</td>
          <td><span class="priority ${item.priority}">${item.priority}</span></td>
          <td><span class="status-badge status-${item.status.replace(/\s+/g, "-")}">${item.status}</span></td>
          <td>
            <div>${item.description || "—"}</div>
            ${isAdmin && item.internalNote
              ? `<div class="internal-note"><strong>Obs. interna:</strong> ${item.internalNote}</div>`
              : ""}
          </td>
          <td><span class="muted-text" style="font-size:0.8rem;">${item.createdBy}</span></td>
          <td>
            <div class="row-actions">
              <button class="btn secondary" onclick="changeStatus('${item.id}', 'Em análise')">Em análise</button>
              <button class="btn secondary" onclick="changeStatus('${item.id}', 'Resolvida')">Resolver</button>
              ${isAdmin ? `<button class="btn danger" onclick="deleteOccurrence('${item.id}')">Excluir</button>` : ""}
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  if (isAdmin && auditLog) {
    const logs = getAuditLogs();
    if (logs.length === 0) {
      auditLog.innerHTML = `<div class="notice">Nenhum log registrado.</div>`;
    } else {
      auditLog.innerHTML = logs.map(log => `
        <div class="log-item">
          <strong>${log.when}</strong><br/>
          usuário=${log.user || "—"} | perfil=${log.role || "—"} | ação=${log.action}<br/>
          detalhe=${log.detail}
        </div>
      `).join("");
    }
  }
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  login(
    document.querySelector("#email").value,
    document.querySelector("#password").value
  );
});

if (occurrenceForm) occurrenceForm.addEventListener("submit", createOccurrence);
logoutBtn.addEventListener("click", logout);
if (searchInput) searchInput.addEventListener("input", render);
if (roleSelect) roleSelect.addEventListener("change", event => changeRole(event.target.value));

window.deleteOccurrence = deleteOccurrence;
window.changeStatus = changeStatus;
window.changeUserRole = changeUserRole;

boot();
