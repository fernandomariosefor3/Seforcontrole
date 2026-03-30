/* ============================================
   PAGE: Indicadores — Formulário por escola
   Alimenta os gráficos do dashboard
   ============================================ */

const IndicadoresPage = {
  data: [],
  escolas: [],
  escolaFiltro: null,
  escolaNomeFiltro: null,

  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    await this.loadData();
    this.renderPage();
  },

  async loadData() {
    const [indRes, escRes] = await Promise.all([
      API.getAll('indicadores'),
      API.getAll('escolas')
    ]);
    this.data = (indRes.data || []).sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });
    this.escolas = (escRes.data || []).sort((a, b) => a.nome?.localeCompare(b.nome));
  },

  renderPage() {
    const content = document.getElementById('pageContent');
    const filtrado = this.escolaFiltro
      ? this.data.filter(i => i.escola_id === this.escolaFiltro)
      : this.data;

    const escolaOptions = this.escolas.map(e =>
      `<option value="${e.id}" ${this.escolaFiltro === e.id ? 'selected' : ''}>${e.nome}</option>`
    ).join('');

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-chart-bar" style="color:var(--turquesa);margin-right:8px"></i>Indicadores por Escola</h1>
          <p>Insira ou edite os indicadores mensais que alimentam os gráficos do Dashboard.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="IndicadoresPage.abrirForm()">
            <i class="fas fa-plus"></i> Registrar Indicadores
          </button>
        </div>
      </div>

      <!-- Filtro por escola -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:16px 20px">
          <div style="flex:1;min-width:200px">
            <label class="form-label" style="margin-bottom:4px">Filtrar por escola:</label>
            <select class="form-control" onchange="IndicadoresPage.filtrarEscola(this.value)">
              <option value="">Todas as escolas</option>
              ${escolaOptions}
            </select>
          </div>
          ${this.escolaFiltro ? `
            <div style="padding-top:20px">
              <button class="btn btn-secondary btn-sm" onclick="IndicadoresPage.limparFiltro()">
                <i class="fas fa-times"></i> Limpar filtro
              </button>
            </div>
          ` : ''}
          <div style="padding-top:20px">
            <span class="badge badge-info">${filtrado.length} registro${filtrado.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      ${this.renderGraficosIndicadores(filtrado)}

      <!-- Tabela de registros -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-table" style="color:var(--turquesa);margin-right:6px"></i>Registros de Indicadores</div>
        </div>
        <div class="card-body">
          ${filtrado.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-chart-bar"></i>
              <h3>Nenhum indicador registrado</h3>
              <p>Clique em "Registrar Indicadores" para inserir os dados de uma escola.</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th>Escola</th>
                  <th>Mês/Ano</th>
                  <th>Frequência</th>
                  <th>Notas Lançadas</th>
                  <th>Plano de Ação</th>
                  <th>Infrequentes</th>
                  <th>Alunos Risco</th>
                  <th>Busca Ativa</th>
                  <th>Visitas</th>
                  <th>Ações</th>
                </tr></thead>
                <tbody>
                  ${filtrado.map(ind => this.renderRow(ind)).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
    this.buildMiniCharts(filtrado);
  },

  renderGraficosIndicadores(filtrado) {
    if (!filtrado.length) return '';
    return `
      <div class="grid-3" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Frequência Média</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:200px"><canvas id="miniChartFreq"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Notas Lançadas</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:200px"><canvas id="miniChartNotas"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Plano de Ação</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:200px"><canvas id="miniChartPlano"></canvas></div></div>
        </div>
      </div>
    `;
  },

  buildMiniCharts(filtrado) {
    // Destruir se existir
    ['miniChartFreq','miniChartNotas','miniChartPlano'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el._chart) { el._chart.destroy(); }
    });
    if (!filtrado.length) return;
    const sorted = [...filtrado].sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });
    const labels = sorted.map(i => `${Utils.mesNome(i.mes)}/${i.ano}`);
    const buildChart = (id, label, key, color) => {
      const el = document.getElementById(id);
      if (!el) return;
      const c = new Chart(el, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label,
            data: sorted.map(i => i[key] || 0),
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } } },
            x: { ticks: { font: { size: 10 } } }
          }
        }
      });
      el._chart = c;
    };
    buildChart('miniChartFreq', 'Frequência (%)', 'frequencia_media', '#1a7a4a');
    buildChart('miniChartNotas', 'Notas (%)', 'notas_lancadas', '#0d9488');
    buildChart('miniChartPlano', 'Plano (%)', 'plano_acao_execucao', '#ea580c');
  },

  renderRow(ind) {
    const s = Utils.semaforoFreq(ind.frequencia_media || 0);
    return `
      <tr>
        <td style="font-size:12px;max-width:150px;word-break:break-word">${ind.escola_nome || '—'}</td>
        <td><strong>${Utils.mesNome(ind.mes)}/${ind.ano}</strong></td>
        <td>
          <span class="semaforo semaforo-${s}"></span>
          ${ind.frequencia_media ?? '—'}%
        </td>
        <td>${Utils.progressBar(ind.notas_lancadas || 0)}</td>
        <td>${Utils.progressBar(ind.plano_acao_execucao || 0)}</td>
        <td>${ind.alunos_infrequentes ?? '—'}</td>
        <td>${ind.alunos_risco ?? '—'}</td>
        <td>${ind.busca_ativa_alunos ?? '—'}</td>
        <td>${ind.visitas_realizadas ?? '—'}</td>
        <td>
          <button class="btn btn-sm btn-outline" style="margin-right:4px" onclick="IndicadoresPage.editar('${ind.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c" onclick="IndicadoresPage.excluir('${ind.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  async abrirForm(id = null) {
    const ind = id ? this.data.find(i => i.id === id) : null;
    const escolaOptions = this.escolas.map(e =>
      `<option value="${e.id}" data-nome="${e.nome}" ${(ind?.escola_id === e.id || this.escolaFiltro === e.id) ? 'selected' : ''}>${e.nome}</option>`
    ).join('');

    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    const body = `
      <form id="indForm">
        <div class="form-group">
          <label class="form-label">Escola *</label>
          <select class="form-control" name="escola_id" required id="indEscolaSelect">
            <option value="">Selecione a escola...</option>
            ${escolaOptions}
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Mês *</label>
            <select class="form-control" name="mes" required>
              ${Array.from({length:12},(_,i)=>i+1).map(m =>
                `<option value="${m}" ${(ind?.mes || mesAtual) === m ? 'selected' : ''}>${Utils.mesNome(m)} - ${m}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ano *</label>
            <input class="form-control" name="ano" type="number" required
              value="${ind?.ano || anoAtual}" min="2020" max="2035" />
          </div>
        </div>

        <div style="background:#f0fdf4;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;color:var(--verde);margin-bottom:12px">
            <i class="fas fa-user-check" style="margin-right:6px"></i>Frequência & Fluxo
          </div>
          <div class="form-grid">
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Frequência Média (%) *</label>
              <div class="indicador-slider">
                <input type="range" name="frequencia_media" min="0" max="100" step="0.5"
                  value="${ind?.frequencia_media ?? 85}"
                  oninput="document.getElementById('freqVal').textContent=this.value+'%'" />
                <span class="slider-val" id="freqVal">${ind?.frequencia_media ?? 85}%</span>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Alunos Infrequentes</label>
              <input class="form-control" name="alunos_infrequentes" type="number" min="0"
                value="${ind?.alunos_infrequentes ?? ''}" placeholder="Nº de alunos" />
            </div>
          </div>
        </div>

        <div style="background:#f0fdfa;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;color:var(--turquesa);margin-bottom:12px">
            <i class="fas fa-edit" style="margin-right:6px"></i>Rendimento & Notas
          </div>
          <div class="form-grid">
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Notas Lançadas (%)</label>
              <div class="indicador-slider">
                <input type="range" name="notas_lancadas" min="0" max="100" step="1"
                  value="${ind?.notas_lancadas ?? 75}"
                  oninput="document.getElementById('notasVal').textContent=this.value+'%'" />
                <span class="slider-val" id="notasVal">${ind?.notas_lancadas ?? 75}%</span>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Alunos em Risco de Reprovação</label>
              <input class="form-control" name="alunos_risco" type="number" min="0"
                value="${ind?.alunos_risco ?? ''}" placeholder="Nº de alunos" />
            </div>
          </div>
        </div>

        <div style="background:#fff7ed;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;color:var(--laranja);margin-bottom:12px">
            <i class="fas fa-bullseye" style="margin-right:6px"></i>Plano de Ação & Projetos
          </div>
          <div class="form-grid">
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Execução do Plano de Ação (%)</label>
              <div class="indicador-slider">
                <input type="range" name="plano_acao_execucao" min="0" max="100" step="1"
                  value="${ind?.plano_acao_execucao ?? 50}"
                  oninput="document.getElementById('planoVal').textContent=this.value+'%'" />
                <span class="slider-val" id="planoVal">${ind?.plano_acao_execucao ?? 50}%</span>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Projetos Extraclasse Ativos</label>
              <input class="form-control" name="projetos_ativos" type="number" min="0"
                value="${ind?.projetos_ativos ?? ''}" placeholder="Quantidade" />
            </div>
          </div>
        </div>

        <div style="background:#eff6ff;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;color:var(--azul);margin-bottom:12px">
            <i class="fas fa-search" style="margin-right:6px"></i>Programas Especiais
          </div>
          <div class="form-grid-3">
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Visitas da Superintendência</label>
              <input class="form-control" name="visitas_realizadas" type="number" min="0"
                value="${ind?.visitas_realizadas ?? ''}" placeholder="0" />
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Alunos em Busca Ativa</label>
              <input class="form-control" name="busca_ativa_alunos" type="number" min="0"
                value="${ind?.busca_ativa_alunos ?? ''}" placeholder="0" />
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label class="form-label">Beneficiários Pé-de-Meia</label>
              <input class="form-control" name="pe_de_meia_beneficiarios" type="number" min="0"
                value="${ind?.pe_de_meia_beneficiarios ?? ''}" placeholder="0" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-control" name="observacoes" rows="3"
            placeholder="Registre informações adicionais, contexto ou encaminhamentos...">${ind?.observacoes || ''}</textarea>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="IndicadoresPage.salvar('${id || ''}')">
        <i class="fas fa-save"></i> Salvar Indicadores
      </button>
    `;
    Utils.openModal(id ? 'Editar Indicadores' : 'Registrar Indicadores', body, footer, true);
  },

  editar(id) {
    this.abrirForm(id);
  },

  async salvar(id) {
    const form = document.getElementById('indForm');
    if (!form) return;
    const fd = new FormData(form);
    const sel = document.getElementById('indEscolaSelect');
    const escolaNome = sel ? sel.options[sel.selectedIndex]?.getAttribute('data-nome') : '';
    const data = {
      escola_id: fd.get('escola_id'),
      escola_nome: escolaNome || '',
      mes: Number(fd.get('mes')),
      ano: Number(fd.get('ano')),
      frequencia_media: Number(fd.get('frequencia_media')),
      alunos_infrequentes: Number(fd.get('alunos_infrequentes')) || 0,
      notas_lancadas: Number(fd.get('notas_lancadas')),
      alunos_risco: Number(fd.get('alunos_risco')) || 0,
      plano_acao_execucao: Number(fd.get('plano_acao_execucao')),
      projetos_ativos: Number(fd.get('projetos_ativos')) || 0,
      visitas_realizadas: Number(fd.get('visitas_realizadas')) || 0,
      busca_ativa_alunos: Number(fd.get('busca_ativa_alunos')) || 0,
      pe_de_meia_beneficiarios: Number(fd.get('pe_de_meia_beneficiarios')) || 0,
      observacoes: fd.get('observacoes') || '',
    };
    if (!data.escola_id) { Utils.toast('Selecione a escola!', 'error'); return; }

    const btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }

    let ok;
    if (id) {
      ok = await API.update('indicadores', id, data);
    } else {
      ok = await API.create('indicadores', data);
    }
    Utils.closeModal();
    if (ok) {
      Utils.toast(id ? 'Indicadores atualizados!' : 'Indicadores registrados! Os gráficos foram atualizados.', 'success');
      await this.loadData();
      this.renderPage();
    } else {
      Utils.toast('Erro ao salvar.', 'error');
    }
  },

  excluir(id) {
    Utils.confirm('Deseja excluir este registro de indicadores?', async () => {
      const ok = await API.delete('indicadores', id);
      if (ok) {
        Utils.toast('Registro excluído.', 'warning');
        await this.loadData();
        this.renderPage();
      } else {
        Utils.toast('Erro ao excluir.', 'error');
      }
    });
  },

  filtrarEscola(id) {
    this.escolaFiltro = id || null;
    this.escolaNomeFiltro = null;
    this.renderPage();
  },

  limparFiltro() {
    this.escolaFiltro = null;
    this.escolaNomeFiltro = null;
    this.renderPage();
  }
};
