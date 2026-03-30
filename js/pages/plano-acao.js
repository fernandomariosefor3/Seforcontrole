/* PAGE: Plano de Ação */
const PlanoAcaoPage = {
  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    const [indRes, escRes] = await Promise.all([API.getAll('indicadores'), API.getAll('escolas')]);
    const indicadores = indRes.data || [];
    const escolas = escRes.data || [];

    const ultPorEscola = {};
    indicadores.forEach(ind => {
      if (!ultPorEscola[ind.escola_id] ||
          (ind.ano * 12 + ind.mes) > (ultPorEscola[ind.escola_id].ano * 12 + ultPorEscola[ind.escola_id].mes)) {
        ultPorEscola[ind.escola_id] = ind;
      }
    });

    const vals = Object.values(ultPorEscola).map(i => i.plano_acao_execucao || 0);
    const media = vals.length ? vals.reduce((s,v) => s+v,0) / vals.length : 0;
    const acimaMeta = vals.filter(v => v >= 70).length;
    const abaixo = vals.filter(v => v < 50).length;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-bullseye" style="color:var(--laranja);margin-right:8px"></i>Plano de Ação</h1>
          <p>Acompanhe a execução do Plano de Ação (Circuito de Gestão Cearense) por escola.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.navigate('indicadores')">
            <i class="fas fa-edit"></i> Atualizar Indicadores
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="kpi-card">
          <div class="kpi-icon laranja"><i class="fas fa-chart-pie"></i></div>
          <div><div class="kpi-value">${media.toFixed(1)}%</div><div class="kpi-label">Execução Média</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-check"></i></div>
          <div><div class="kpi-value">${acimaMeta}</div><div class="kpi-label">Escolas ≥ 70%</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-times"></i></div>
          <div><div class="kpi-value">${abaixo}</div><div class="kpi-label">Abaixo de 50%</div></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Execução do Plano de Ação por Escola</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:320px"><canvas id="planoBarChart"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Etapas do Circuito de Gestão Cearense</div></div>
          <div class="card-body">
            ${['Planejamento','Execução','Monitoramento (SMAR)','Correção de Rotas','Parada Reflexiva'].map((etapa, i) => {
              const pct = [85, 72, 60, 45, 30][i];
              return `
                <div style="margin-bottom:16px">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-size:13px;font-weight:600">${etapa}</span>
                    <span style="font-size:12px;color:var(--text-secondary)">${pct}%</span>
                  </div>
                  ${Utils.progressBar(pct)}
                </div>
              `;
            }).join('')}
            <p style="font-size:11px;color:var(--text-secondary);margin-top:8px">
              <i class="fas fa-info-circle"></i> Baseado nos registros de execução das escolas
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Execução por Escola — Detalhamento</div></div>
        <div class="card-body table-wrap">
          ${escolas.length === 0 ? `<div class="empty-state"><i class="fas fa-school"></i><h3>Sem escolas cadastradas</h3></div>` : `
          <table>
            <thead><tr>
              <th>Escola</th><th>Mês Ref.</th><th>Execução do Plano</th><th>Progresso</th><th>Projetos Ativos</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${escolas.map(e => {
                const ind = ultPorEscola[e.id];
                const pct = ind?.plano_acao_execucao;
                return `<tr>
                  <td style="font-size:13px">${e.nome}</td>
                  <td style="font-size:12px">${ind ? `${Utils.mesNome(ind.mes)}/${ind.ano}` : '—'}</td>
                  <td><strong>${pct != null ? pct+'%' : '—'}</strong></td>
                  <td style="min-width:160px">${pct != null ? Utils.progressBar(pct) : '—'}</td>
                  <td>${ind?.projetos_ativos ?? '—'}</td>
                  <td>${pct != null
                      ? `<span class="badge badge-${pct>=70?'success':pct>=50?'warning':'danger'}">${pct>=70?'Em dia':pct>=50?'Atenção':'Crítico'}</span>`
                      : '<span class="badge badge-neutral">Sem dados</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`}
        </div>
      </div>
    `;

    const escolasComInd = escolas.filter(e => ultPorEscola[e.id]);
    const labels = escolasComInd.map(e => Utils.abrev(e.nome, 20));
    const planoVals = escolasComInd.map(e => ultPorEscola[e.id].plano_acao_execucao || 0);
    const colors = planoVals.map(v => v >= 70 ? '#1a7a4a' : v >= 50 ? '#d97706' : '#dc2626');

    new Chart(document.getElementById('planoBarChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Execução (%)', data: planoVals, backgroundColor: colors, borderRadius: 6 }] },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { min:0, max:100, ticks: { callback: v => v+'%' } } }
      }
    });
  }
};
