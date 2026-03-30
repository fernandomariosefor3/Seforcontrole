/* PAGE: Notas */
const NotasPage = {
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

    const pendentes = Object.values(ultPorEscola).filter(i => i.notas_lancadas < 100).length;
    const criticas = Object.values(ultPorEscola).filter(i => i.notas_lancadas < 60).length;
    const mediaNotas = escolas.length
      ? (Object.values(ultPorEscola).reduce((s,i) => s + (i.notas_lancadas||0), 0) / Math.max(1, Object.keys(ultPorEscola).length))
      : 0;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-edit" style="color:var(--turquesa);margin-right:8px"></i>Notas & Rendimento</h1>
          <p>Acompanhe o percentual de notas lançadas e alunos em risco de reprovação.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.navigate('indicadores')">
            <i class="fas fa-edit"></i> Lançar Indicadores
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="kpi-card">
          <div class="kpi-icon turquesa"><i class="fas fa-percentage"></i></div>
          <div><div class="kpi-value">${mediaNotas.toFixed(1)}%</div><div class="kpi-label">Média Notas Lançadas</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amarelo"><i class="fas fa-clock"></i></div>
          <div><div class="kpi-value">${pendentes}</div><div class="kpi-label">Escolas com Pendência</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-exclamation-triangle"></i></div>
          <div><div class="kpi-value">${criticas}</div><div class="kpi-label">Situação Crítica (&lt;60%)</div></div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><div class="card-title">% Notas Lançadas por Escola</div></div>
        <div class="card-body"><div class="chart-wrap" style="height:300px"><canvas id="notasChart"></canvas></div></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Situação do Lançamento de Notas</div></div>
        <div class="card-body table-wrap">
          ${escolas.length === 0 ? `<div class="empty-state"><i class="fas fa-school"></i><h3>Sem escolas cadastradas</h3></div>` : `
          <table>
            <thead><tr>
              <th>Escola</th><th>% Notas Lançadas</th><th>Alunos em Risco</th><th>Progresso</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${escolas.map(e => {
                const ind = ultPorEscola[e.id];
                const notas = ind?.notas_lancadas;
                const risco = ind?.alunos_risco;
                return `<tr>
                  <td style="font-size:13px">${e.nome}</td>
                  <td><strong>${notas != null ? notas + '%' : '—'}</strong></td>
                  <td>${risco != null ? `<span style="color:var(--vermelho);font-weight:600">${risco}</span>` : '—'}</td>
                  <td style="min-width:150px">${notas != null ? Utils.progressBar(notas) : '—'}</td>
                  <td>${notas != null
                      ? `<span class="badge badge-${notas>=80?'success':notas>=60?'warning':'danger'}">${notas>=80?'Em dia':notas>=60?'Atenção':'Pendente'}</span>`
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
    const vals = escolasComInd.map(e => ultPorEscola[e.id].notas_lancadas || 0);
    const colors = vals.map(v => v >= 80 ? '#0d9488' : v >= 60 ? '#d97706' : '#dc2626');

    new Chart(document.getElementById('notasChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Notas Lançadas (%)', data: vals, backgroundColor: colors, borderRadius: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min:0, max:100, ticks: { callback: v => v+'%' } } }
      }
    });
  }
};
