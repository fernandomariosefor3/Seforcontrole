/* ============================================
   PAGE: Escolas — CRUD completo
   ============================================ */

const EscolasPage = {
  data: [],
  searchTerm: '',

  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    await this.loadData();
    this.renderPage();
  },

  async loadData() {
    const res = await API.getAll('escolas');
    this.data = (res.data || []).sort((a, b) => a.nome?.localeCompare(b.nome));
  },

  renderPage() {
    const content = document.getElementById('pageContent');
    const filtered = this.filterData();

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-school" style="color:var(--verde);margin-right:8px"></i>Gestão de Escolas</h1>
          <p>Cadastre, edite e acompanhe as escolas da rede. Total: <strong>${this.data.length} escola${this.data.length !== 1 ? 's' : ''}</strong></p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="EscolasPage.abrirForm()">
            <i class="fas fa-plus"></i> Nova Escola
          </button>
        </div>
      </div>

      <div class="search-bar">
        <div class="search-input-wrap">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Buscar escola por nome, município, regional..."
            value="${this.searchTerm}"
            oninput="EscolasPage.onSearch(this.value)"
            id="escolaSearch" />
        </div>
        <select class="form-control" style="width:auto;padding:9px 12px"
          onchange="EscolasPage.filtrarTipo(this.value)" id="tipoFilter">
          <option value="">Todos os tipos</option>
          <option value="Regular">Regular</option>
          <option value="EEMTI">EEMTI</option>
          <option value="EEEP">EEEP</option>
          <option value="Campo">Campo</option>
          <option value="EJA">EJA</option>
        </select>
      </div>

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-school"></i>
          <h3>Nenhuma escola encontrada</h3>
          <p>Clique em "Nova Escola" para cadastrar ou ajuste os filtros.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="EscolasPage.abrirForm()">
            <i class="fas fa-plus"></i> Cadastrar Escola
          </button>
        </div>
      ` : `
        <div class="grid-auto" id="escolasGrid">
          ${filtered.map(e => this.renderCard(e)).join('')}
        </div>
      `}
    `;
  },

  renderCard(e) {
    const inicial = e.nome ? e.nome.charAt(0).toUpperCase() : '?';
    const tipoColor = {
      'Regular': '#1a7a4a', 'EEMTI': '#0d9488', 'EEEP': '#ea580c',
      'Campo': '#059669', 'EJA': '#6d28d9'
    };
    const color = tipoColor[e.tipo] || '#1a7a4a';
    return `
      <div class="escola-card">
        <div style="position:absolute;top:12px;right:12px">
          <span class="badge" style="background:${color}20;color:${color};font-size:10px">${e.tipo || '—'}</span>
        </div>
        <div class="escola-card-header">
          <div class="escola-avatar">${inicial}</div>
          <div>
            <div class="escola-name">${Utils.abrev(e.nome, 35)}</div>
            <div class="escola-meta">
              <i class="fas fa-map-marker-alt" style="margin-right:4px;color:var(--verde)"></i>
              ${e.municipio || '—'} · ${e.regional || '—'}
            </div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <i class="fas fa-user-tie"></i> ${e.diretor || 'Sem diretor cadastrado'}
        </div>
        ${e.telefone ? `
          <div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <i class="fas fa-phone"></i> ${e.telefone}
          </div>
        ` : ''}

        <div class="escola-stats">
          <div class="escola-stat">
            <div class="escola-stat-val">${Utils.formatNum(e.total_alunos || 0)}</div>
            <div class="escola-stat-lbl">Alunos</div>
          </div>
          <div class="escola-stat">
            <div class="escola-stat-val" style="color:${e.ativa !== false ? 'var(--verde)' : 'var(--vermelho)'}">
              ${e.ativa !== false ? 'Ativa' : 'Inativa'}
            </div>
            <div class="escola-stat-lbl">Situação</div>
          </div>
        </div>

        <div class="escola-actions">
          <button class="btn btn-secondary btn-sm" onclick="EscolasPage.verIndicadores('${e.id}', '${e.nome?.replace(/'/g, "\\'")}')">
            <i class="fas fa-chart-bar"></i> Indicadores
          </button>
          <button class="btn btn-outline btn-sm" onclick="EscolasPage.abrirForm('${e.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c" onclick="EscolasPage.excluir('${e.id}', '${e.nome?.replace(/'/g, "\\'")}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },

  filterData() {
    let list = [...this.data];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.nome || '').toLowerCase().includes(t) ||
        (e.municipio || '').toLowerCase().includes(t) ||
        (e.regional || '').toLowerCase().includes(t) ||
        (e.diretor || '').toLowerCase().includes(t)
      );
    }
    if (this._tipoFilter) {
      list = list.filter(e => e.tipo === this._tipoFilter);
    }
    return list;
  },

  onSearch(val) {
    this.searchTerm = val;
    const grid = document.getElementById('escolasGrid');
    const filtered = this.filterData();
    if (grid) {
      grid.innerHTML = filtered.map(e => this.renderCard(e)).join('');
    }
  },

  filtrarTipo(val) {
    this._tipoFilter = val || null;
    this.onSearch(this.searchTerm);
  },

  abrirForm(id = null) {
    const escola = id ? this.data.find(e => e.id === id) : null;
    const title = escola ? 'Editar Escola' : 'Nova Escola';

    const body = `
      <form id="escolaForm">
        <div class="form-grid">
          <div class="form-group form-full">
            <label class="form-label">Nome da Escola *</label>
            <input class="form-control" name="nome" required
              value="${escola?.nome || ''}" placeholder="Ex: EEEM Presidente Castelo Branco" />
          </div>
          <div class="form-group">
            <label class="form-label">Município *</label>
            <input class="form-control" name="municipio" required
              value="${escola?.municipio || ''}" placeholder="Ex: Fortaleza" />
          </div>
          <div class="form-group">
            <label class="form-label">Regional / CREDE</label>
            <input class="form-control" name="regional"
              value="${escola?.regional || ''}" placeholder="Ex: CREDE 1" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de Escola</label>
            <select class="form-control" name="tipo">
              ${['Regular','EEMTI','EEEP','Campo','EJA'].map(t =>
                `<option value="${t}" ${escola?.tipo === t ? 'selected' : ''}>${t}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Total de Alunos</label>
            <input class="form-control" name="total_alunos" type="number" min="0"
              value="${escola?.total_alunos || ''}" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Diretor(a)</label>
            <input class="form-control" name="diretor"
              value="${escola?.diretor || ''}" placeholder="Nome completo" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input class="form-control" name="telefone"
              value="${escola?.telefone || ''}" placeholder="(00) 0000-0000" />
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:10px;padding-top:24px">
            <input type="checkbox" id="escolaAtiva" name="ativa" style="width:18px;height:18px;accent-color:var(--verde)"
              ${escola?.ativa !== false ? 'checked' : ''} />
            <label for="escolaAtiva" style="font-size:14px;font-weight:500;cursor:pointer">Escola Ativa</label>
          </div>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="EscolasPage.salvar('${id || ''}')">
        <i class="fas fa-save"></i> Salvar
      </button>
    `;
    Utils.openModal(title, body, footer, true);
  },

  async salvar(id) {
    const form = document.getElementById('escolaForm');
    if (!form) return;
    const fd = new FormData(form);
    const data = {
      nome: fd.get('nome'),
      municipio: fd.get('municipio'),
      regional: fd.get('regional'),
      tipo: fd.get('tipo'),
      total_alunos: Number(fd.get('total_alunos')) || 0,
      diretor: fd.get('diretor'),
      telefone: fd.get('telefone'),
      ativa: document.getElementById('escolaAtiva').checked,
    };
    if (!data.nome || !data.municipio) {
      Utils.toast('Preencha os campos obrigatórios!', 'error'); return;
    }
    const btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }

    let ok;
    if (id) {
      ok = await API.update('escolas', id, data);
    } else {
      ok = await API.create('escolas', data);
    }
    Utils.closeModal();
    if (ok) {
      Utils.toast(id ? 'Escola atualizada!' : 'Escola cadastrada!', 'success');
      await this.loadData();
      this.renderPage();
    } else {
      Utils.toast('Erro ao salvar. Tente novamente.', 'error');
    }
  },

  excluir(id, nome) {
    Utils.confirm(
      `Deseja excluir a escola <strong>${nome}</strong>? Esta ação não pode ser desfeita.`,
      async () => {
        const ok = await API.delete('escolas', id);
        if (ok) {
          Utils.toast('Escola excluída.', 'warning');
          await this.loadData();
          this.renderPage();
        } else {
          Utils.toast('Erro ao excluir.', 'error');
        }
      }
    );
  },

  verIndicadores(id, nome) {
    // Navega para a página de indicadores com filtro da escola
    IndicadoresPage.escolaFiltro = id;
    IndicadoresPage.escolaNomeFiltro = nome;
    App.navigate('indicadores');
  }
};
