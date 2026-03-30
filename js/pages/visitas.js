/* PAGE: Visitas da Superintendência — CRUD */
const VisitasPage = {
  data: [],
  escolas: [],

  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    await this.loadData();
    this.renderPage();
  },

  async loadData() {
    const [vRes, eRes] = await Promise.all([API.getAll('visitas'), API.getAll('escolas')]);
    this.data = (vRes.data || []).sort((a,b) => new Date(b.data_visita) - new Date(a.data_visita));
    this.escolas = (eRes.data || []).sort((a,b) => a.nome?.localeCompare(b.nome));
  },

  renderPage() {
    const content = document.getElementById('pageContent');
    const realizadas = this.data.filter(v => v.status === 'Realizada').length;
    const agendadas = this.data.filter(v => v.status === 'Agendada').length;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-map-marker-alt" style="color:var(--turquesa);margin-right:8px"></i>Visitas da Superintendência</h1>
          <p>Registre e acompanhe as visitas técnicas às escolas. Total: <strong>${this.data.length}</strong></p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="VisitasPage.abrirForm()">
            <i class="fas fa-plus"></i> Registrar Visita
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-check-circle"></i></div>
          <div><div class="kpi-value">${realizadas}</div><div class="kpi-label">Realizadas</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon azul"><i class="fas fa-calendar-check"></i></div>
          <div><div class="kpi-value">${agendadas}</div><div class="kpi-label">Agendadas</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon turquesa"><i class="fas fa-school"></i></div>
          <div><div class="kpi-value">${new Set(this.data.map(v=>v.escola_id)).size}</div><div class="kpi-label">Escolas Visitadas</div></div>
        </div>
      </div>

      ${this.data.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-map-marker-alt"></i>
          <h3>Nenhuma visita registrada</h3>
          <p>Clique em "Registrar Visita" para adicionar.</p>
        </div>
      ` : `
        <div id="visitasLista">
          ${this.data.map(v => this.renderCard(v)).join('')}
        </div>
      `}
    `;
  },

  renderCard(v) {
    const statusColors = { 'Realizada': '#1a7a4a', 'Agendada': '#2563eb', 'Cancelada': '#94a3b8' };
    const color = statusColors[v.status] || '#94a3b8';
    return `
      <div class="visita-card ${v.status?.toLowerCase()}" style="margin-bottom:12px">
        <div class="visita-header">
          <div>
            <div class="visita-escola">${v.escola_nome || '—'}</div>
            <div class="visita-date">
              <i class="fas fa-calendar" style="margin-right:4px;color:var(--turquesa)"></i>
              ${Utils.formatDate(v.data_visita)}
              ${v.superintendente ? `· <i class="fas fa-user" style="margin:0 4px;color:var(--text-secondary)"></i>${v.superintendente}` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge" style="background:${color}20;color:${color}">${v.status}</span>
            <button class="btn btn-sm btn-outline" onclick="VisitasPage.editar('${v.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c" onclick="VisitasPage.excluir('${v.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        ${v.pauta ? `<div class="visita-pauta" style="margin-top:8px"><strong>Pauta:</strong> ${v.pauta.substring(0,200)}${v.pauta.length>200?'…':''}</div>` : ''}
        ${v.encaminhamentos ? `<div class="visita-pauta" style="margin-top:4px"><strong>Encaminhamentos:</strong> ${v.encaminhamentos.substring(0,200)}${v.encaminhamentos.length>200?'…':''}</div>` : ''}
      </div>
    `;
  },

  abrirForm(id = null) {
    const visita = id ? this.data.find(v => v.id === id) : null;
    const escolaOpts = this.escolas.map(e =>
      `<option value="${e.id}" data-nome="${e.nome}" ${visita?.escola_id === e.id ? 'selected':''} >${e.nome}</option>`
    ).join('');

    const body = `
      <form id="visitaForm">
        <div class="form-group">
          <label class="form-label">Escola *</label>
          <select class="form-control" name="escola_id" required id="visitaEscolaSelect">
            <option value="">Selecione...</option>${escolaOpts}
          </select>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Data da Visita *</label>
            <input class="form-control" name="data_visita" type="date" required
              value="${visita?.data_visita?.substring(0,10) || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" name="status">
              ${['Realizada','Agendada','Cancelada'].map(s =>
                `<option value="${s}" ${visita?.status===s?'selected':''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group form-full">
            <label class="form-label">Superintendente</label>
            <input class="form-control" name="superintendente"
              value="${visita?.superintendente||''}" placeholder="Nome do superintendente" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Pauta da Visita</label>
          <textarea class="form-control" name="pauta" rows="3"
            placeholder="Descreva os tópicos abordados na visita...">${visita?.pauta||''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Encaminhamentos / Pactuações</label>
          <textarea class="form-control" name="encaminhamentos" rows="3"
            placeholder="Registre os encaminhamentos e metas acordadas...">${visita?.encaminhamentos||''}</textarea>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="VisitasPage.salvar('${id||''}')">
        <i class="fas fa-save"></i> Salvar
      </button>
    `;
    Utils.openModal(id ? 'Editar Visita' : 'Registrar Visita', body, footer, true);
  },

  editar(id) { this.abrirForm(id); },

  async salvar(id) {
    const form = document.getElementById('visitaForm');
    if (!form) return;
    const fd = new FormData(form);
    const sel = document.getElementById('visitaEscolaSelect');
    const data = {
      escola_id: fd.get('escola_id'),
      escola_nome: sel?.options[sel.selectedIndex]?.getAttribute('data-nome') || '',
      data_visita: fd.get('data_visita'),
      superintendente: fd.get('superintendente'),
      status: fd.get('status'),
      pauta: fd.get('pauta'),
      encaminhamentos: fd.get('encaminhamentos'),
    };
    if (!data.escola_id || !data.data_visita) { Utils.toast('Preencha os campos obrigatórios!','error'); return; }
    const ok = id ? await API.update('visitas', id, data) : await API.create('visitas', data);
    Utils.closeModal();
    if (ok) { Utils.toast(id ? 'Visita atualizada!' : 'Visita registrada!', 'success'); await this.loadData(); this.renderPage(); }
    else { Utils.toast('Erro ao salvar.','error'); }
  },

  excluir(id) {
    Utils.confirm('Excluir este registro de visita?', async () => {
      const ok = await API.delete('visitas', id);
      if (ok) { Utils.toast('Visita excluída.','warning'); await this.loadData(); this.renderPage(); }
    });
  }
};
