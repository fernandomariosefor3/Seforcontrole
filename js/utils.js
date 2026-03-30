/* ============================================
   Utils — helpers globais
   ============================================ */

const Utils = {
  // Toast
  toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    t.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },

  // Modal
  openModal(title, bodyHtml, footerHtml = '', large = false) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    const box = document.getElementById('modalBox');
    box.className = large ? 'modal-box modal-lg' : 'modal-box';
    document.getElementById('modalOverlay').classList.add('open');
  },
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  },

  // Format
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },
  formatNum(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('pt-BR');
  },
  pct(n) {
    if (n === null || n === undefined) return '—';
    return `${Number(n).toFixed(0)}%`;
  },

  // Semáforo por frequência
  semaforoFreq(val) {
    if (val >= 85) return 'verde';
    if (val >= 75) return 'amarelo';
    return 'vermelho';
  },
  semaforoNotas(val) {
    if (val >= 80) return 'verde';
    if (val >= 60) return 'amarelo';
    return 'vermelho';
  },

  // Badge de status
  badgeStatus(status) {
    const map = {
      'Realizada': 'success', 'Ativo': 'success', 'Aprovado': 'success',
      'Agendada': 'info', 'Em andamento': 'info',
      'Cancelada': 'neutral', 'Suspenso': 'neutral', 'Concluído': 'neutral',
      'Crítico': 'danger', 'Atrasado': 'danger',
    };
    return `<span class="badge badge-${map[status] || 'neutral'}">${status}</span>`;
  },

  // Barra de progresso colorida
  progressBar(val, max = 100) {
    const pct = Math.min(100, Math.max(0, (val / max) * 100));
    let cls = 'verde';
    if (pct < 60) cls = 'vermelho';
    else if (pct < 80) cls = 'laranja';
    return `
      <div style="display:flex;align-items:center;gap:8px">
        <div class="progress-bar" style="flex:1">
          <div class="progress-fill ${cls}" style="width:${pct}%"></div>
        </div>
        <span style="font-size:12px;font-weight:600;color:var(--text-secondary);min-width:36px">${pct.toFixed(0)}%</span>
      </div>`;
  },

  // Mês por número
  mesNome(n) {
    return ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][n] || '';
  },

  // Abreviar nome longo
  abrev(str, max = 28) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '…' : str;
  },

  // Confirmar ação
  confirm(msg, callback) {
    Utils.openModal('Confirmar ação',
      `<div style="display:flex;align-items:center;gap:16px;padding:8px 0">
        <div style="width:48px;height:48px;background:#fee2e2;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#b91c1c;flex-shrink:0">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p style="font-size:14px;color:var(--text-primary)">${msg}</p>
      </div>`,
      `<button class="btn btn-secondary" onclick="Utils.closeModal()">Cancelar</button>
       <button class="btn btn-danger" id="confirmBtn">Confirmar</button>`
    );
    setTimeout(() => {
      const btn = document.getElementById('confirmBtn');
      if (btn) btn.onclick = () => { Utils.closeModal(); callback(); };
    }, 50);
  },

  // Data atual formatada
  dataAtual() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  },

  // Gerar cor para categoria
  catColors: {
    'Científico': { bg: '#ccfbf1', color: '#0f766e' },
    'Cultural': { bg: '#ede9fe', color: '#6d28d9' },
    'Esportivo': { bg: '#dbeafe', color: '#1d4ed8' },
    'Social': { bg: '#dcfce7', color: '#15803d' },
    'Ambiental': { bg: '#d1fae5', color: '#065f46' },
    'ENEM/Vestibular': { bg: '#ffedd5', color: '#c2410c' },
    'Leitura': { bg: '#fef3c7', color: '#b45309' },
    'Digital': { bg: '#e0f2fe', color: '#0369a1' },
  },
  catIcon: {
    'Científico': 'flask', 'Cultural': 'music', 'Esportivo': 'futbol',
    'Social': 'hands-helping', 'Ambiental': 'leaf', 'ENEM/Vestibular': 'pen-nib',
    'Leitura': 'book-open', 'Digital': 'laptop-code',
  },
};

// Fechar modal ao clicar fora
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) Utils.closeModal();
});
document.getElementById('modalClose').addEventListener('click', () => Utils.closeModal());
