/* ============================================
   PAGE: Dashboard
   ============================================ */

const DashboardPage = {
  charts: {},

  async render() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    try {
      const [escolasRes, indicadoresRes, visitasRes, projetosRes] = await Promise.all([
        API.getAll('escolas'),
        API.getAll('indicadores'),
        API.getAll('visitas'),
        API.getAll('projetos')
      ]);

      const escolas = escolasRes.data || [];
      const indicadores = indicadoresRes.data || [];
      const visitas = visitasRes.data || [];
      const projetos = projetosRes.data || [];

      // Calcular KPIs
      const totalEscolas = escolas.length;
      const totalAlunos = escolas.reduce((s, e) => s + (e.total_alunos || 0), 0);
      const visitasRealizadas = visitas.filter(v => v.status === 'Realizada').length;
      const projetosAtivos = projetos.filter(p => p.status === 'Ativo').length;

      // Médias dos últimos indicadores por escola
      const ultIndPorEscola = {};
      indicadores.forEach(ind => {
        if (!ultIndPorEscola[ind.escola_id]) {
          ultIndPorEscola[ind.escola_id] = ind;
        } else {
          if ((ind.ano * 12 + ind.mes) > (ultIndPorEscola[ind.escola_id].ano * 12 + ultIndPorEscola[ind.escola_id].mes)) {
            ultIndPorEscola[ind.escola_id] = ind;
          }
        }
      });

      const ultList = Object.values(ultIndPorEscola);
      const mediaFreq = ultList.length ? (ultList.reduce((s, i) => s + (i.frequencia_media || 0), 0) / ultList.length) : 0;
      const mediaNotas = ultList.length ? (ultList.reduce((s, i) => s + (i.notas_lancadas || 0), 0) / ultList.length) : 0;
      const totalInfrequentes = indicadores.reduce((s, i) => s + (i.alunos_infrequentes || 0), 0);
      const alertCount = ultList.filter(i => i.frequencia_media < 75 || i.notas_lancadas < 60).length;

      document.getElementById('alertCount').textContent = alertCount;

      content.innerHTML = `
        <!-- KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon verde"><i class="fas fa-school"></i></div>
            <div>
              <div class="kpi-value">${totalEscolas}</div>
              <div class="kpi-label">Escolas Monitoradas</div>
              <div class="kpi-trend neutral"><i class="fas fa-circle"></i> Rede SEDUC-CE</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon azul"><i class="fas fa-user-graduate"></i></div>
            <div>
              <div class="kpi-value">${Utils.formatNum(totalAlunos)}</div>
              <div class="kpi-label">Alunos Matriculados</div>
              <div class="kpi-trend neutral"><i class="fas fa-circle"></i> Total da rede</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon ${mediaFreq >= 85 ? 'verde' : mediaFreq >= 75 ? 'amarelo' : 'vermelho'}">
              <i class="fas fa-user-check"></i>
            </div>
            <div>
              <div class="kpi-value">${mediaFreq.toFixed(1)}%</div>
              <div class="kpi-label">Frequência Média</div>
              <div class="kpi-trend ${mediaFreq >= 85 ? 'up' : 'down'}">
                <i class="fas fa-${mediaFreq >= 85 ? 'arrow-up' : 'arrow-down'}"></i>
                Meta: 85%
              </div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon ${mediaNotas >= 80 ? 'verde' : mediaNotas >= 60 ? 'amarelo' : 'vermelho'}">
              <i class="fas fa-edit"></i>
            </div>
            <div>
              <div class="kpi-value">${mediaNotas.toFixed(1)}%</div>
              <div class="kpi-label">Notas Lançadas</div>
              <div class="kpi-trend ${mediaNotas >= 80 ? 'up' : 'down'}">
                <i class="fas fa-${mediaNotas >= 80 ? 'arrow-up' : 'exclamation'}"></i>
                Meta: 100%
              </div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon turquesa"><i class="fas fa-map-marker-alt"></i></div>
            <div>
              <div class="kpi-value">${visitasRealizadas}</div>
              <div class="kpi-label">Visitas Realizadas</div>
              <div class="kpi-trend neutral"><i class="fas fa-circle"></i> Total registrado</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon laranja"><i class="fas fa-rocket"></i></div>
            <div>
              <div class="kpi-value">${projetosAtivos}</div>
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-trend neutral"><i class="fas fa-circle"></i> Extraclasse</div>
            </div>
          </div>
        </div>

        <!-- GRÁFICOS -->
        <div class="grid-2" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title"><i class="fas fa-chart-bar" style="color:var(--verde);margin-right:8px"></i>Frequência por Escola</div>
                <div class="card-subtitle">Último registro de cada escola</div>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-wrap"><canvas id="chartFreq"></canvas></div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title"><i class="fas fa-edit" style="color:var(--turquesa);margin-right:8px"></i>% Notas Lançadas</div>
                <div class="card-subtitle">Percentual por escola</div>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-wrap"><canvas id="chartNotas"></canvas></div>
            </div>
          </div>
        </div>

        <div class="grid-3" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-pie-chart" style="color:var(--laranja);margin-right:8px"></i>Projetos por Categoria</div>
            </div>
            <div class="card-body">
              <div class="chart-wrap"><canvas id="chartProjetos"></canvas></div>
            </div>
          </div>
          <div class="card" style="grid-column:span 2">
            <div class="card-header">
              <div>
                <div class="card-title"><i class="fas fa-chart-line" style="color:var(--azul);margin-right:8px"></i>Evolução da Frequência</div>
                <div class="card-subtitle">Média mensal da rede</div>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-wrap"><canvas id="chartEvolucao"></canvas></div>
            </div>
          </div>
        </div>

        <!-- TABELA DE ESCOLAS + ALERTAS -->
        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-exclamation-triangle" style="color:var(--vermelho);margin-right:8px"></i>Alertas Críticos</div>
              <span class="badge badge-danger">${alertCount} escola${alertCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="card-body" id="alertasBody"></div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="fas fa-school" style="color:var(--verde);margin-right:8px"></i>Status das Escolas</div>
            </div>
            <div class="card-body table-wrap" id="statusEscolasBody"></div>
          </div>
        </div>
      `;

      // Montar gráficos
      this.buildCharts(escolas, indicadores, projetos, ultIndPorEscola);

      // Alertas
      this.renderAlertas(ultIndPorEscola, escolas);

      // Tabela status
      this.renderStatusEscolas(escolas, ultIndPorEscola);

    } catch (err) {
      content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Erro ao carregar</h3><p>${err.message}</p></div>`;
    }
  },

  buildCharts(escolas, indicadores, projetos, ultInd) {
    // Destruir charts anteriores
    Object.values(this.charts).forEach(c => c.destroy());
    this.charts = {};

    const escolasComInd = escolas.filter(e => ultInd[e.id]);
    const labels = escolasComInd.map(e => Utils.abrev(e.nome, 20));
    const freqData = escolasComInd.map(e => ultInd[e.id]?.frequencia_media || 0);
    const notasData = escolasComInd.map(e => ultInd[e.id]?.notas_lancadas || 0);
    const freqColors = freqData.map(v => v >= 85 ? '#1a7a4a' : v >= 75 ? '#d97706' : '#dc2626');

    // Chart Frequência
    const c1 = document.getElementById('chartFreq');
    if (c1) {
      this.charts.freq = new Chart(c1, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Frequência (%)',
            data: freqData,
            backgroundColor: freqColors,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
            x: { ticks: { maxRotation: 30, font: { size: 11 } } }
          }
        }
      });
    }

    // Chart Notas
    const c2 = document.getElementById('chartNotas');
    if (c2) {
      const notasColors = notasData.map(v => v >= 80 ? '#0d9488' : v >= 60 ? '#d97706' : '#dc2626');
      this.charts.notas = new Chart(c2, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Notas Lançadas (%)',
            data: notasData,
            backgroundColor: notasColors,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
            x: { ticks: { maxRotation: 30, font: { size: 11 } } }
          }
        }
      });
    }

    // Chart Projetos por categoria
    const c3 = document.getElementById('chartProjetos');
    if (c3) {
      const catCount = {};
      projetos.forEach(p => { catCount[p.categoria] = (catCount[p.categoria] || 0) + 1; });
      const catLabels = Object.keys(catCount);
      const catVals = Object.values(catCount);
      const catPalette = ['#1a7a4a','#0d9488','#ea580c','#2563eb','#d97706','#6d28d9','#dc2626','#059669'];
      this.charts.proj = new Chart(c3, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{ data: catVals, backgroundColor: catPalette, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } } }
        }
      });
    }

    // Chart Evolução frequência por mês
    const c4 = document.getElementById('chartEvolucao');
    if (c4) {
      const byMes = {};
      indicadores.forEach(ind => {
        if (!byMes[ind.mes]) byMes[ind.mes] = [];
        byMes[ind.mes].push(ind.frequencia_media || 0);
      });
      const meses = Object.keys(byMes).map(Number).sort((a, b) => a - b);
      const medias = meses.map(m => {
        const vals = byMes[m];
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      });
      this.charts.evolucao = new Chart(c4, {
        type: 'line',
        data: {
          labels: meses.map(m => Utils.mesNome(m)),
          datasets: [{
            label: 'Frequência Média (%)',
            data: medias,
            borderColor: '#1a7a4a',
            backgroundColor: 'rgba(26,122,74,.1)',
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#1a7a4a',
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 50, max: 100, ticks: { callback: v => v + '%' } }
          }
        }
      });
    }
  },

  renderAlertas(ultInd, escolas) {
    const body = document.getElementById('alertasBody');
    if (!body) return;
    const escolaMap = {};
    escolas.forEach(e => escolaMap[e.id] = e.nome);
    const alertas = Object.entries(ultInd)
      .filter(([id, ind]) => ind.frequencia_media < 75 || ind.notas_lancadas < 60)
      .map(([id, ind]) => ({
        escola: Utils.abrev(escolaMap[id] || 'Escola', 30),
        freq: ind.frequencia_media,
        notas: ind.notas_lancadas,
      }));
    if (!alertas.length) {
      body.innerHTML = `<div class="empty-state" style="padding:30px 0">
        <i class="fas fa-check-circle" style="color:var(--verde)"></i>
        <h3 style="color:var(--verde)">Nenhum alerta!</h3>
        <p>Todas as escolas estão dentro dos limites.</p>
      </div>`;
      return;
    }
    body.innerHTML = alertas.map(a => `
      <div class="alert-item">
        <div class="alert-icon ${a.freq < 75 ? 'critico' : 'atencao'}">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div style="flex:1">
          <div class="alert-title">${a.escola}</div>
          <div class="alert-desc">
            ${a.freq < 75 ? `<span class="badge badge-danger" style="margin-right:4px">Freq: ${a.freq}%</span>` : ''}
            ${a.notas < 60 ? `<span class="badge badge-warning">Notas: ${a.notas}%</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderStatusEscolas(escolas, ultInd) {
    const body = document.getElementById('statusEscolasBody');
    if (!body) return;
    if (!escolas.length) {
      body.innerHTML = `<div class="empty-state" style="padding:30px"><i class="fas fa-school"></i><h3>Sem escolas</h3></div>`;
      return;
    }
    body.innerHTML = `
      <table>
        <thead><tr>
          <th>Escola</th>
          <th>Frequência</th>
          <th>Notas</th>
          <th>Status</th>
        </tr></thead>
        <tbody>
          ${escolas.map(e => {
            const ind = ultInd[e.id];
            const freq = ind ? ind.frequencia_media : null;
            const notas = ind ? ind.notas_lancadas : null;
            const s = Utils.semaforoFreq(freq || 0);
            return `<tr>
              <td style="max-width:160px;word-break:break-word;font-size:12px">${e.nome}</td>
              <td>
                ${freq !== null
                  ? `<span class="semaforo semaforo-${s}"></span> ${freq}%`
                  : '<span style="color:#94a3b8;font-size:12px">—</span>'}
              </td>
              <td>${notas !== null ? notas + '%' : '<span style="color:#94a3b8;font-size:12px">—</span>'}</td>
              <td>${freq !== null
                  ? `<span class="badge badge-${s === 'verde' ? 'success' : s === 'amarelo' ? 'warning' : 'danger'}">${s === 'verde' ? 'OK' : s === 'amarelo' ? 'Atenção' : 'Crítico'}</span>`
                  : '<span class="badge badge-neutral">Sem dados</span>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }
};
