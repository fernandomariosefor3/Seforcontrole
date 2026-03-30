/* PAGE: Frequência & Fluxo */
const FrequenciaPage = {
  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    const [indRes, escRes] = await Promise.all([API.getAll('indicadores'), API.getAll('escolas')]);
    const indicadores = indRes.data || [];
    const escolas = escRes.data || [];

    // Último registro por escola
    const ultPorEscola = {};
    indicadores.forEach(ind => {
      if (!ultPorEscola[ind.escola_id] ||
          (ind.ano * 12 + ind.mes) > (ultPorEscola[ind.escola_id].ano * 12 + ultPorEscola[ind.escola_id].mes)) {
        ultPorEscola[ind.escola_id] = ind;
      }
    });

    const totalInfrequentes = indicadores.reduce((s,i) => s + (i.alunos_infrequentes||0), 0);
    const escCriticas = Object.values(ultPorEscola).filter(i => i.frequencia_media < 75).length;
    const escAtencao = Object.values(ultPorEscola).filter(i => i.frequencia_media >= 75 && i.frequencia_media < 85).length;
    const escOk = Object.values(ultPorEscola).filter(i => i.frequencia_media >= 85).length;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-user-check" style="color:var(--verde);margin-right:8px"></i>Frequência & Fluxo Escolar</h1>
          <p>Monitoramento da frequência dos alunos e fluxo escolar por escola.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.navigate('indicadores')">
            <i class="fas fa-edit"></i> Lançar Indicadores
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-check-circle"></i></div>
          <div><div class="kpi-value">${escOk}</div><div class="kpi-label">Escolas OK (≥85%)</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amarelo"><i class="fas fa-exclamation-circle"></i></div>
          <div><div class="kpi-value">${escAtencao}</div><div class="kpi-label">Em Atenção (75-85%)</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-times-circle"></i></div>
          <div><div class="kpi-value">${escCriticas}</div><div class="kpi-label">Crítico (&lt;75%)</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon laranja"><i class="fas fa-user-slash"></i></div>
          <div><div class="kpi-value">${totalInfrequentes}</div><div class="kpi-label">Alunos Infrequentes</div></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Frequência por Escola</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:320px"><canvas id="freqBarChart"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Distribuição de Status</div></div>
          <div class="card-body"><div class="chart-wrap" style="height:320px"><canvas id="freqDonutChart"></canvas></div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Detalhamento por Escola</div>
        </div>
        <div class="card-body table-wrap">
          ${escolas.length === 0 ? `<div class="empty-state"><i class="fas fa-school"></i><h3>Sem escolas cadastradas</h3></div>` : `
          <table>
            <thead><tr>
              <th>Escola</th><th>Tipo</th><th>Município</th>
              <th>Frequência</th><th>Infrequentes</th><th>Alunos em Risco</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${escolas.map(e => {
                const ind = ultPorEscola[e.id];
                const freq = ind?.frequencia_media;
                const s = freq != null ? Utils.semaforoFreq(freq) : null;
                return `<tr>
                  <td style="font-size:13px">${e.nome}</td>
                  <td><span class="badge badge-neutral">${e.tipo||'—'}</span></td>
                  <td style="font-size:12px">${e.municipio||'—'}</td>
                  <td>
                    ${freq != null
                      ? `<div style="display:flex;align-items:center;gap:8px">
                          <span class="semaforo semaforo-${s}"></span>
                          <strong>${freq}%</strong>
                         </div>`
                      : '<span style="color:#94a3b8;font-size:12px">Sem dados</span>'}
                  </td>
                  <td>${ind?.alunos_infrequentes ?? '—'}</td>
                  <td>${ind?.alunos_risco ?? '—'}</td>
                  <td>${s ? `<span class="badge badge-${s==='verde'?'success':s==='amarelo'?'warning':'danger'}">${s==='verde'?'Regular':'Atenção'}</span>` : '<span class="badge badge-neutral">Sem dados</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`}
        </div>
      </div>
    `;

    // Charts
    const escolasComInd = escolas.filter(e => ultPorEscola[e.id]);
    const labels = escolasComInd.map(e => Utils.abrev(e.nome, 18));
    const freqVals = escolasComInd.map(e => ultPorEscola[e.id].frequencia_media);
    const colors = freqVals.map(v => v >= 85 ? '#1a7a4a' : v >= 75 ? '#d97706' : '#dc2626');

    new Chart(document.getElementById('freqBarChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Frequência (%)', data: freqVals, backgroundColor: colors, borderRadius: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min:0, max:100, ticks: { callback: v => v+'%' } } }
      }
    });

    new Chart(document.getElementById('freqDonutChart'), {
      type: 'doughnut',
      data: {
        labels: ['Regular (≥85%)', 'Atenção (75-85%)', 'Crítico (<75%)'],
        datasets: [{ data: [escOk, escAtencao, escCriticas], backgroundColor: ['#1a7a4a','#d97706','#dc2626'], borderWidth: 2, borderColor:'#fff' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position:'bottom', labels: { padding:12 } } }
      }
    });
  }
};
