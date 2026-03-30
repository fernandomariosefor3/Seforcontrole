/* PAGE: Busca Ativa — Nem 1 Aluno Fora da Escola */
const BuscaAtivaPage = {
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

    const totalBA = Object.values(ultPorEscola).reduce((s,i) => s + (i.busca_ativa_alunos||0), 0);
    const totalPdm = Object.values(ultPorEscola).reduce((s,i) => s + (i.pe_de_meia_beneficiarios||0), 0);
    const escBusca = Object.values(ultPorEscola).filter(i => (i.busca_ativa_alunos||0) > 0).length;

    content.innerHTML = `
      <div class="page-header">
        <div class="page-header-info">
          <h1><i class="fas fa-search" style="color:var(--vermelho);margin-right:8px"></i>Busca Ativa Escolar</h1>
          <p>"Nem 1 Aluno Fora da Escola" — Acompanhe alunos em risco de evasão e beneficiários do Pé-de-Meia.</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.navigate('indicadores')">
            <i class="fas fa-edit"></i> Atualizar Dados
          </button>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        <div class="kpi-card">
          <div class="kpi-icon vermelho"><i class="fas fa-user-slash"></i></div>
          <div><div class="kpi-value">${totalBA}</div><div class="kpi-label">Alunos em Busca Ativa</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amarelo"><i class="fas fa-school"></i></div>
          <div><div class="kpi-value">${escBusca}</div><div class="kpi-label">Escolas com Ocorrências</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon verde"><i class="fas fa-piggy-bank"></i></div>
          <div><div class="kpi-value">${Utils.formatNum(totalPdm)}</div><div class="kpi-label">Beneficiários Pé-de-Meia</div></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-search" style="color:var(--vermelho);margin-right:6px"></i>Alunos em Busca Ativa por Escola</div>
          </div>
          <div class="card-body"><div class="chart-wrap" style="height:280px"><canvas id="buscaChart"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-piggy-bank" style="color:var(--verde);margin-right:6px"></i>Beneficiários Pé-de-Meia</div>
          </div>
          <div class="card-body"><div class="chart-wrap" style="height:280px"><canvas id="pdmChart"></canvas></div></div>
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
              <th>Escola</th><th>Alunos em Busca Ativa</th><th>Pé-de-Meia</th><th>Frequência</th><th>Infrequentes</th><th>Prioridade</th>
            </tr></thead>
            <tbody>
              ${escolas.map(e => {
                const ind = ultPorEscola[e.id];
                const ba = ind?.busca_ativa_alunos ?? null;
                const pdm = ind?.pe_de_meia_beneficiarios ?? null;
                const freq = ind?.frequencia_media ?? null;
                const infreq = ind?.alunos_infrequentes ?? null;
                const critico = ba > 10 || freq < 75;
                return `<tr>
                  <td style="font-size:13px">${e.nome}</td>
                  <td>${ba != null ? `<span style="color:${ba>5?'var(--vermelho)':'inherit'};font-weight:${ba>5?700:400}">${ba}</span>` : '—'}</td>
                  <td>${pdm != null ? pdm : '—'}</td>
                  <td>${freq != null ? freq+'%' : '—'}</td>
                  <td>${infreq != null ? infreq : '—'}</td>
                  <td>${ind ? `<span class="badge badge-${critico?'danger':'success'}">${critico?'Alta':'Normal'}</span>` : '<span class="badge badge-neutral">Sem dados</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`}
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid-2" style="margin-top:20px">
        <div class="card">
          <div class="card-body">
            <div style="font-size:14px;font-weight:700;color:var(--vermelho);margin-bottom:10px">
              <i class="fas fa-info-circle"></i> Sobre Busca Ativa
            </div>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">
              O programa <strong>"Nem 1 Aluno Fora da Escola"</strong> prevê a realização da 
              <strong>Semana da Busca Ativa</strong> e do <strong>Dia D da Busca Ativa</strong> no início 
              de cada semestre letivo, conforme as Diretrizes SEDUC-CE 2026.
            </p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div style="font-size:14px;font-weight:700;color:var(--verde);margin-bottom:10px">
              <i class="fas fa-piggy-bank"></i> Pé-de-Meia — Alerta de Frequência
            </div>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">
              Alunos com frequência abaixo de <strong>80%</strong> perdem o direito ao incentivo financeiro. 
              Acompanhe mensalmente e notifique as escolas com alunos em risco de perda do benefício.
            </p>
          </div>
        </div>
      </div>
    `;

    // Charts
    const escolasComInd = escolas.filter(e => ultPorEscola[e.id]);
    const labels = escolasComInd.map(e => Utils.abrev(e.nome,18));
    const baVals = escolasComInd.map(e => ultPorEscola[e.id].busca_ativa_alunos||0);
    const pdmVals = escolasComInd.map(e => ultPorEscola[e.id].pe_de_meia_beneficiarios||0);

    new Chart(document.getElementById('buscaChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Busca Ativa', data: baVals, backgroundColor: '#dc2626', borderRadius:6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display:false } },
        scales: { y: { beginAtZero:true, ticks: { stepSize:1 } } }
      }
    });

    new Chart(document.getElementById('pdmChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label:'Pé-de-Meia', data: pdmVals, backgroundColor: '#1a7a4a', borderRadius:6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display:false } },
        scales: { y: { beginAtZero:true, ticks: { stepSize:10 } } }
      }
    });
  }
};
