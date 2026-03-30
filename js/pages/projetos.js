/* PAGE: Projetos Extraclasse — CRUD */
const ProjetosPage = {
  data: [],
  escolas: [],

  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    await this.loadData();
    this.renderPage();
  },

  async loadData() {
    const [pRes, eRes] = await Promise.all([API.getAll('projetos'), API.getAll('escolas')]);
    this.data = (pRes.data || []).sort((a,b) => a.nome_projeto?.localeCompare(b.nome_projeto));
    this.escolas = (eRes.data || []).sort((a,b) => a.nome?.localeCompare(b.nome));
  },

  renderPage() {
    const content = document.getElementById('pageContent');
    const ativos = this.data.filter(p => p.status === 'Ativo').length;
    const totalAlunos = this.data.reduce((s,p) => s + (p.alunos_participantes||0), 0);
    const catCount = {};
    this.data.forEach(p => { catCount[p.categoria] = (catCount[p.categoria]||0)+1; });

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-rocket" style="color:var(--laranja);margin-right:8px"></i>Projetos Extraclasse</h1>
          <p>Gerencie projetos culturais, científicos, sociais e esportivos. Total: <strong>${this.data.length}</strong></p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="ProjetosPage.abrirForm()">
            <i class="fas fa-plus"></i> Novo Projeto
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
        <div class="kpi-card">
          <div class="kpi-icon laranja"><i class="fas fa-rocket"></i></div>
          <div><div class="kpi-value">${this.data.length}</div><div class="kpi-label">Total de Projetos</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-play-circle"></i></div>
          <div><div class="kpi-value">${ativos}</div><div class="kpi-label">Projetos Ativos</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon azul"><i class="fas fa-users"></i></div>
          <div><div class="kpi-value">${Utils.formatNum(totalAlunos)}</div><div class="kpi-label">Alunos Participantes</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon turquesa"><i class="fas fa-tags"></i></div>
          <div><div class="kpi-value">${Object.keys(catCount).length}</div><div class="kpi-label">Categorias</div></div>
        </div>
      </div>

      ${this.data.length > 0 ? `
        <div class="card" style="margin-bottom:20px">
          <div class="card-header"><div class="card-title">Projetos por Categoria</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:220px"><canvas id="projCatChart"></canvas></div></div>
        </div>
      ` : ''}

      ${this.data.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-rocket"></i>
          <h3>Nenhum projeto cadastrado</h3>
          <p>Cadastre projetos como Ceará Científico, ENEM, FAQI, Robótica etc.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="ProjetosPage.abrirForm()">
            <i class="fas fa-plus"></i> Novo Projeto
          </button>
        </div>
      ` : `
        <div class="grid-auto" id="projetosGrid">
          ${this.data.map(p => this.renderCard(p)).join('')}
        </div>
      `}
    `;

    if (this.data.length > 0) this.buildChart(catCount);
  },

  buildChart(catCount) {
    const el = document.getElementById('projCatChart');
    if (!el) return;
    const labels = Object.keys(catCount);
    const vals = Object.values(catCount);
    const palette = labels.map(l => Utils.catColors[l]?.color || '#1a7a4a');
    new Chart(el, {
      type: 'bar',
      data: { labels, datasets: [{ label:'Projetos', data: vals, backgroundColor: palette, borderRadius: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize:1 } } }
      }
    });
  },

  renderCard(p) {
    const cat = Utils.catColors[p.categoria] || { bg:'#f1f5f9', color:'#64748b' };
    const icon = Utils.catIcon[p.categoria] || 'star';
    const statusColor = { 'Ativo':'success','Concluído':'neutral','Suspenso':'warning' };
    return `
      <div class="projeto-card">
        <div class="projeto-cat-icon" style="background:${cat.bg};color:${cat.color}">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="projeto-nome">${p.nome_projeto || '—'}</div>
        <div class="projeto-escola"><i class="fas fa-school" style="margin-right:4px"></i>${p.escola_nome || '—'}</div>
        ${p.descricao ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">${p.descricao.substring(0,100)}${p.descricao.length>100?'…':''}</div>` : ''}
        <div class="projeto-footer">
          <div>
            <span class="badge" style="background:${cat.bg};color:${cat.color};margin-right:4px">${p.categoria||'—'}</span>
            <span class="badge badge-${statusColor[p.status]||'neutral'}">${p.status||'—'}</span>
          </div>
          <span style="font-size:12px;color:var(--text-secondary)">
            <i class="fas fa-users" style="margin-right:3px"></i>${p.alunos_participantes||0} alunos
          </span>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn btn-outline btn-sm" onclick="ProjetosPage.editar('${p.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c" onclick="ProjetosPage.excluir('${p.id}','${p.nome_projeto?.replace(/'/g,"\\'")}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },

  abrirForm(id = null) {
    const proj = id ? this.data.find(p => p.id === id) : null;
    const escolaOpts = this.escolas.map(e =>
      `<option value="${e.id}" data-nome="${e.nome}" ${proj?.escola_id===e.id?'selected':''}>${e.nome}</option>`
    ).join('');

    const body = `
      <form id="projetoForm">
        <div class="form-group">
          <label class="form-label">Escola *</label>
          <select class="form-control" name="escola_id" required id="projEscolaSelect">
            <option value="">Selecione...</option>${escolaOpts}
          </select>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nome do Projeto *</label>
            <input class="form-control" name="nome_projeto" required
              value="${proj?.nome_projeto||''}" placeholder="Ex: Ceará Científico 2026" />
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select class="form-control" name="categoria">
              ${['Científico','Cultural','Esportivo','Social','Ambiental','ENEM/Vestibular','Leitura','Digital'].map(c =>
                `<option value="${c}" ${proj?.categoria===c?'selected':''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Alunos Participantes</label>
            <input class="form-control" name="alunos_participantes" type="number" min="0"
              value="${proj?.alunos_participantes||''}" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" name="status">
              ${['Ativo','Concluído','Suspenso'].map(s =>
                `<option value="${s}" ${proj?.status===s?'selected':''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Data de Início</label>
            <input class="form-control" name="data_inicio" type="date" value="${proj?.data_inicio||''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Data de Término Prevista</label>
            <input class="form-control" name="data_termino" type="date" value="${proj?.data_termino||''}" />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Descrição</label>
            <textarea class="form-control" name="descricao" rows="3"
              placeholder="Descreva os objetivos e atividades do projeto...">${proj?.descricao||''}</textarea>
          </div>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="ProjetosPage.salvar('${id||''}')">
        <i class="fas fa-save"></i> Salvar
      </button>
    `;
    Utils.openModal(id ? 'Editar Projeto' : 'Novo Projeto Extraclasse', body, footer, true);
  },

  editar(id) { this.abrirForm(id); },

  async salvar(id) {
    const form = document.getElementById('projetoForm');
    if (!form) return;
    const fd = new FormData(form);
    const sel = document.getElementById('projEscolaSelect');
    const data = {
      escola_id: fd.get('escola_id'),
      escola_nome: sel?.options[sel.selectedIndex]?.getAttribute('data-nome') || '',
      nome_projeto: fd.get('nome_projeto'),
      categoria: fd.get('categoria'),
      descricao: fd.get('descricao'),
      alunos_participantes: Number(fd.get('alunos_participantes'))||0,
      status: fd.get('status'),
      data_inicio: fd.get('data_inicio'),
      data_termino: fd.get('data_termino'),
    };
    if (!data.escola_id || !data.nome_projeto) { Utils.toast('Preencha os campos obrigatórios!','error'); return; }
    const ok = id ? await API.update('projetos', id, data) : await API.create('projetos', data);
    Utils.closeModal();
    if (ok) { Utils.toast(id ? 'Projeto atualizado!' : 'Projeto cadastrado!', 'success'); await this.loadData(); this.renderPage(); }
    else { Utils.toast('Erro ao salvar.','error'); }
  },

  excluir(id, nome) {
    Utils.confirm(`Excluir o projeto <strong>${nome}</strong>?`, async () => {
      const ok = await API.delete('projetos', id);
      if (ok) { Utils.toast('Projeto excluído.','warning'); await this.loadData(); this.renderPage(); }
    });
  }
};
