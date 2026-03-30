/* ═══════════════════════════════════════════════
   SEDUC-CE · app.js — lógica principal
   Foco: o que a Superintendente acompanha
   Paleta: #1B7A3E #1A5C32 #3DBFB8 #F47920 #E8401C
   ═══════════════════════════════════════════════ */

/* ─── helpers ─── */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmtN = n => (n??'--').toLocaleString('pt-BR');
const fmtD = s => { if(!s) return '—'; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}`; };
const diasRestantes = s => { const d=new Date(s)-new Date(); return Math.ceil(d/864e5); };
const nomeEscola = id => D.escolas.find(e=>e.id===id)?.nome ?? id;
const shortEscola = id => { const n=nomeEscola(id); const w=n.split(' '); return w.length>3?w.slice(0,3).join(' ')+'…':n; };
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

/* ─── paleta oficial PDF ─── */
const COR = {
  green:  '#1B7A3E',
  gdark:  '#1A5C32',
  glight: '#2E8B4A',
  teal:   '#3DBFB8',
  tdark:  '#2AB5A0',
  orange: '#F47920',
  red:    '#E8401C',
  blue:   '#3B82F6',
  purple: '#7C3AED',
  bg:     '#F2F2F2',
  grid:   'rgba(0,0,0,.06)',
};

/* Paleta graduada verde→turquesa para gráficos */
const GRAD8 = ['#1A5C32','#1B7A3E','#2E8B4A','#3DBFB8','#2AB5A0','#F47920','#E8401C','#3B82F6'];

/* ─── estado da aplicação ─── */
let ST = {
  charts: {},
  plano:  [...D.planoAcao],
  visitas:[...D.visitas],
  proj:   [...D.projetos],
  eventos:[...D.eventos],
  smar:   new Array(D.smarChecklist.length).fill(false),
  editandoAcao: null,
  editandoVisita: null,
  editandoProjeto: null,
  obsCircuito: [],
};

/* ════════════════════════════════════════════
   NAVEGAÇÃO
   ════════════════════════════════════════════ */
function navTo(page) {
  $$('.page').forEach(p => p.classList.remove('active'));
  $$('.nav-link').forEach(l => l.classList.remove('active'));
  const pg = $(`#page-${page}`);
  const lk = $(`.nav-link[data-page="${page}"]`);
  if(pg) pg.classList.add('active');
  if(lk) lk.classList.add('active');
  $('#bcCurrent').textContent = lk?.querySelector('span')?.textContent ?? page;
  if(window.innerWidth<=768) closeSidebar();
  renderPage(page);
}

function renderPage(p) {
  const map = {
    dashboard: renderDash,
    fluxo: renderFluxo,
    notas: renderNotas,
    recomposicao: renderRecomp,
    plano: renderPlano,
    visitas: renderVisitas,
    circuito: renderCircuito,
    projetos: renderProjetos,
    busca: renderBusca,
    pedemeia: renderPdm,
    agenda: renderAgenda,
    escolas: renderEscolas,
  };
  if(map[p]) map[p]();
}

/* ─── sidebar ─── */
const openSidebar  = ()=>{ $('#sidebar').classList.add('open'); $('#overlay').classList.add('show'); };
const closeSidebar = ()=>{ $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); };

/* ─── modal ─── */
const openModal  = id => $(`#${id}`).classList.add('open');
const closeModal = id => { $(`#${id}`).classList.remove('open'); };

/* ─── toast ─── */
function toast(msg, type='success') {
  const w = $('#toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {success:'check-circle',error:'circle-xmark',warning:'triangle-exclamation',info:'circle-info'};
  t.innerHTML = `<i class="fas fa-${icons[type]||'circle-info'}"></i> ${msg}`;
  w.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(100%)'; setTimeout(()=>t.remove(),300); }, 3200);
}

/* ─── popula selects de escolas ─── */
function populateEscolaSelects() {
  const ids = ['aEscola','vEscola','pEscola',
               'fFluxoEscola','fPlanoEscola','fVisitaEscola',
               'fBuscaEscola','fNotasEscola'];
  ids.forEach(id => {
    const el = $(`#${id}`); if(!el) return;
    const hasAll = id.startsWith('f');
    el.innerHTML = hasAll ? '<option value="">Todas as escolas</option>' : '<option value="">Selecione…</option>';
    D.escolas.forEach(e => el.innerHTML += `<option value="${e.id}">${e.nome}</option>`);
  });
}

/* ─── badges nav ─── */
function updateBadges() {
  const alertasFreq = D.fluxo.filter(f=>f.bim===1&&f.freq<80).length;
  const notasPend   = D.notas.filter(n=>n.pct<70).length;
  const prazosUrg   = ST.eventos.filter(e=>{ const d=diasRestantes(e.data); return d>=0&&d<=7; }).length;
  const setB = (id,v) => {
    const el=$(id); if(!el) return;
    el.textContent=v;
    el.style.display=v>0?'':'none';
  };
  setB('#badgeFluxo', alertasFreq);
  setB('#badgeNotas', notasPend);
  setB('#badgeAgenda', prazosUrg);
  const total = alertasFreq+notasPend+prazosUrg;
  const dot = $('#dotBadge');
  if(dot) dot.classList.toggle('show', total>0);
}

/* ─── semáforo ─── */
function semaforo(freq) {
  if(freq >= 90) return {cls:'verde',   icon:'circle-check', txt:freq.toFixed(1)+'%'};
  if(freq >= 85) return {cls:'amarelo', icon:'circle',       txt:freq.toFixed(1)+'%'};
  if(freq >= 80) return {cls:'laranja', icon:'triangle-exclamation', txt:freq.toFixed(1)+'%'};
  return              {cls:'vermelho', icon:'circle-xmark',  txt:freq.toFixed(1)+'%'};
}

/* ─── cor progresso ─── */
function corProg(p) {
  if(p>=80) return 'green';
  if(p>=50) return 'teal';
  if(p>=30) return 'orange';
  return 'red';
}

/* ─── helper chart destroy ─── */
function destroyChart(id) {
  if(ST.charts[id]) { ST.charts[id].destroy(); delete ST.charts[id]; }
}

/* ─── render bar prog ─── */
function barProg(pct, color) {
  return `<div class="prog-bar-wrap">
    <div class="prog-bar-bg"><div class="prog-bar-fill ${color}" style="width:${pct}%"></div></div>
    <span class="prog-pct">${pct}%</span>
  </div>`;
}

/* ─── eixo label ─── */
const eixoLabel = { pedagogico:'Pedagógico', gestao:'Gestão', permanencia:'Permanência', infraestrutura:'Infraestrutura' };
const eixoCor   = { pedagogico: COR.green, gestao: COR.teal, permanencia: COR.orange, infraestrutura: COR.red };

/* ─── status pill ─── */
function pillHTML(status) {
  const map = {
    concluida: '<i class="fas fa-check"></i> Concluída',
    andamento: '<i class="fas fa-spinner fa-spin-pulse"></i> Andamento',
    planejada: '<i class="fas fa-hourglass-start"></i> Planejada',
    atrasada:  '<i class="fas fa-triangle-exclamation"></i> Atrasada',
    realizada: '<i class="fas fa-check"></i> Realizada',
    agendada:  '<i class="fas fa-calendar"></i> Agendada',
    ok:        '<i class="fas fa-check"></i> OK',
    pendente:  '<i class="fas fa-clock"></i> Pendente',
    inconsistente: '<i class="fas fa-triangle-exclamation"></i> Inconsistente',
    andamento2:'<i class="fas fa-arrow-trend-up"></i> Andamento',
    planejado: '<i class="fas fa-hourglass-start"></i> Planejado',
    concluido: '<i class="fas fa-check"></i> Concluído',
  };
  const s = status==='andamento'&&status?'andamento':status;
  return `<span class="pill ${status}">${map[status]||status}</span>`;
}

/* ════════════════════════════════════════════
   ALERTAS (DRAWER)
   ════════════════════════════════════════════ */
function renderAlertas() {
  const body = $('#drawerBody'); if(!body) return;
  const icons = { danger:'circle-xmark', warning:'triangle-exclamation', info:'circle-info' };
  body.innerHTML = D.alertas.map(a=>`
    <div class="alert-item ${a.tipo}">
      <i class="fas fa-${icons[a.tipo]||'circle-info'}"></i>
      <div class="alert-item-txt">
        <strong>${esc(a.titulo)}</strong>
        <span>${esc(a.desc)}</span>
        <small><i class="fas fa-clock"></i> ${a.tempo}</small>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════ */
function renderDash() {
  // KPIs
  const totalMatric = D.escolas.reduce((s,e)=>s+e.matricula,0);
  const freqMedia   = (D.fluxo.filter(f=>f.bim===1).reduce((s,f)=>s+f.freq,0)/D.fluxo.filter(f=>f.bim===1).length).toFixed(1);
  const mediaNotas  = (D.notas.reduce((s,n)=>s+n.pct,0)/D.notas.length).toFixed(0);
  const acAtrasadas = ST.plano.filter(p=>p.status==='atrasada').length;
  const visitasFeit = ST.visitas.filter(v=>v.status==='realizada').length;
  const pdmRisco    = D.pedeMeia.reduce((s,p)=>s+p.risco,0);

  $('#kpiRow').innerHTML = `
    ${kpiCard('green','graduation-cap', fmtN(totalMatric), 'Matrículas Ativas', '8 escolas')}
    ${kpiCard('teal','percent', freqMedia+'%', 'Frequência Média', '1º Bimestre 2026')}
    ${kpiCard('orange','clipboard-check', mediaNotas+'%', 'Notas Lançadas', 'Média SIGE')}
    ${kpiCard('red','triangle-exclamation', acAtrasadas, 'Ações Atrasadas', 'Plano de Ação')}
    ${kpiCard('blue','route', visitasFeit, 'Visitas Realizadas', 'Ano 2026')}
    ${kpiCard('orange','piggy-bank', pdmRisco, 'Em Risco Pé-de-Meia', '<80% de frequência')}
  `;

  // Gráfico frequência por escola
  destroyChart('chartFreq');
  const fluxo1 = D.fluxo.filter(f=>f.bim===1);
  const cores = fluxo1.map(f=> f.freq>=90?COR.green: f.freq>=85?COR.teal: f.freq>=80?COR.orange: COR.red);
  ST.charts.chartFreq = new Chart($('#chartFreq'), {
    type:'bar',
    data:{
      labels: fluxo1.map(f=>shortEscola(f.escola)),
      datasets:[{
        label:'Frequência (%)',
        data: fluxo1.map(f=>f.freq),
        backgroundColor: cores,
        borderRadius:6, borderSkipped:false,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw}%`}}},
      scales:{
        y:{min:60,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},
        x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}
      }
    }
  });

  // Gráfico plano pizza
  destroyChart('chartPlano');
  const statusCount = ['planejada','andamento','atrasada','concluida'].map(s=>ST.plano.filter(p=>p.status===s).length);
  ST.charts.chartPlano = new Chart($('#chartPlano'), {
    type:'doughnut',
    data:{
      labels:['Planejada','Andamento','Atrasada','Concluída'],
      datasets:[{data:statusCount, backgroundColor:[COR.blue,COR.teal,COR.orange,COR.green], borderWidth:0, hoverOffset:6}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}}}
  });

  // Frequência mensal linha
  destroyChart('chartFreqMes');
  const meses = D.freqMensal.filter(m=>m.val!==null);
  ST.charts.chartFreqMes = new Chart($('#chartFreqMes'), {
    type:'line',
    data:{
      labels: meses.map(m=>m.mes),
      datasets:[{
        label:'Freq. Média (%)',
        data: meses.map(m=>m.val),
        borderColor: COR.teal, backgroundColor:'rgba(61,191,184,.12)',
        pointBackgroundColor: COR.teal, tension:.4, fill:true,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{min:80,max:98,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false}}}}
  });

  // Notas bar
  destroyChart('chartNotas');
  const coresNotas = D.notas.map(n=>n.pct>=90?COR.green:n.pct>=70?COR.teal:n.pct>=50?COR.orange:COR.red);
  ST.charts.chartNotas = new Chart($('#chartNotas'), {
    type:'bar',
    data:{
      labels: D.notas.map(n=>shortEscola(n.escola)),
      datasets:[{label:'% Notas',data:D.notas.map(n=>n.pct),backgroundColor:coresNotas,borderRadius:5,borderSkipped:false}]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw}%`}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  // Escolas em alerta
  const criticas = D.fluxo.filter(f=>f.bim===1&&f.freq<85).sort((a,b)=>a.freq-b.freq);
  $('#escolasAlerta').innerHTML = criticas.length
    ? criticas.map(f=>`
        <div class="alerta-escola-item">
          <div>
            <div class="aei-nome">${esc(shortEscola(f.escola))}</div>
            <div style="font-size:11px;color:var(--txt3)">${nomeEscola(f.escola).split(' ').slice(0,2).join(' ')}</div>
          </div>
          <span class="semaforo ${semaforo(f.freq).cls}">
            <i class="fas fa-${semaforo(f.freq).icon}"></i>${f.freq}%
          </span>
        </div>
      `).join('')
    : '<div class="card-body text-muted fs-12"><i class="fas fa-check-circle text-green"></i> Todas as escolas acima de 85%</div>';

  // Últimas visitas
  const ults = ST.visitas.slice(0,4);
  $('#dashVisitas').innerHTML = ults.map(v=>`
    <div class="dash-visita-item">
      <div class="dvi-dot ${v.status}"></div>
      <div style="flex:1;min-width:0">
        <div class="dvi-escola">${esc(shortEscola(v.escola))}</div>
        <div class="dvi-data"><i class="fas fa-calendar fa-xs"></i> ${fmtD(v.data)} · ${pillHTML(v.status)}</div>
        <div class="dvi-pauta">${esc(v.pauta.substring(0,70))}${v.pauta.length>70?'…':''}</div>
      </div>
    </div>
  `).join('');

  // Próximos prazos
  const proximos = ST.eventos
    .filter(e=>diasRestantes(e.data)>=0)
    .sort((a,b)=>new Date(a.data)-new Date(b.data))
    .slice(0,5);
  $('#dashPrazos').innerHTML = proximos.map(e=>{
    const d = diasRestantes(e.data);
    const cls = d<=3?'urgente':d<=14?'proximo':'normal';
    return `
      <div class="prazo-item">
        <div class="prazo-days ${cls}">
          <span>${d}</span>
          <small>dias</small>
        </div>
        <div>
          <div class="prazo-titulo">${esc(e.titulo)}</div>
          <div class="prazo-data"><i class="fas fa-calendar fa-xs"></i> ${fmtD(e.data)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function kpiCard(color, icon, val, lbl, sub) {
  return `<div class="kpi ${color}">
    <div class="kpi-accent"></div>
    <div class="kpi-icon"><i class="fas fa-${icon}"></i></div>
    <div class="kpi-val">${val}</div>
    <div class="kpi-lbl">${lbl}</div>
    <div class="kpi-sub">${sub}</div>
    <div class="kpi-deco"><i class="fas fa-${icon}"></i></div>
  </div>`;
}

/* ════════════════════════════════════════════
   FLUXO & FREQUÊNCIA
   ════════════════════════════════════════════ */
function renderFluxo() {
  const bim    = parseInt($('#fFluxoBim')?.value||'1');
  const escolaF= $('#fFluxoEscola')?.value||'';
  let dados = D.fluxo.filter(f=>f.bim===bim);
  if(escolaF) dados = dados.filter(f=>f.escola===escolaF);

  // KPIs
  const total = dados.reduce((s,f)=>s+f.matricula,0);
  const pres  = dados.reduce((s,f)=>s+f.presentes,0);
  const infreq= dados.reduce((s,f)=>s+f.infreq,0);
  const aband = dados.reduce((s,f)=>s+f.abandonos,0);
  const media = dados.length? (dados.reduce((s,f)=>s+f.freq,0)/dados.length).toFixed(1):0;
  const pdmR  = dados.reduce((s,f)=>s+(f.pdmRisco||0),0);

  $('#fluxoKpis').innerHTML = `
    ${kpiCard('green','users', fmtN(total), 'Matrículas', `${bim}º Bimestre`)}
    ${kpiCard('teal','user-check', fmtN(pres), 'Presentes', `Frequência ${media}%`)}
    ${kpiCard('orange','user-clock', fmtN(infreq), 'Infrequentes', '≥3 faltas injustificadas')}
    ${kpiCard('red','user-xmark', fmtN(aband), 'Abandonos', 'Evasão acumulada')}
    ${kpiCard('orange','piggy-bank', pdmR, 'Pé-de-Meia em Risco', 'Frequência <80%')}
  `;

  // Gráfico comparativo
  destroyChart('chartFluxoBar');
  const cores = dados.map(f=>f.freq>=90?COR.green:f.freq>=85?COR.teal:f.freq>=80?COR.orange:COR.red);
  ST.charts.chartFluxoBar = new Chart($('#chartFluxoBar'),{
    type:'bar',
    data:{
      labels:dados.map(f=>shortEscola(f.escola)),
      datasets:[
        {label:'Matriculados',data:dados.map(f=>f.matricula),backgroundColor:'rgba(26,92,50,.15)',borderRadius:4},
        {label:'Presentes',   data:dados.map(f=>f.presentes), backgroundColor:cores,              borderRadius:4},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},
      scales:{y:{grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  // Linha evolução mensal
  destroyChart('chartFluxoLinha');
  const meses = D.freqMensal.filter(m=>m.val!==null);
  ST.charts.chartFluxoLinha = new Chart($('#chartFluxoLinha'),{
    type:'line',
    data:{
      labels:meses.map(m=>m.mes),
      datasets:[{
        label:'Frequência Média (%)',
        data:meses.map(m=>m.val),
        borderColor:COR.teal,backgroundColor:'rgba(61,191,184,.1)',
        pointBackgroundColor:COR.teal,tension:.4,fill:true,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{min:80,max:98,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false}}}}
  });

  // Cards por escola
  $('#fluxoGrid').innerHTML = dados.map(f=>{
    const s = semaforo(f.freq);
    const escola = D.escolas.find(e=>e.id===f.escola);
    return `
      <div class="fluxo-card">
        <div class="fluxo-card-head ${s.cls}">
          <h4>${esc(nomeEscola(f.escola))}</h4>
          <span class="semaforo ${s.cls}"><i class="fas fa-${s.icon}"></i>${f.freq}%</span>
        </div>
        <div class="fluxo-card-body">
          <div style="margin-bottom:10px">
            ${barProg(Math.round(f.freq), corProg(f.freq))}
          </div>
          <div class="fluxo-nums">
            <div class="fluxo-num"><div class="fn-val">${fmtN(f.matricula)}</div><div class="fn-lbl">Matrículas</div></div>
            <div class="fluxo-num"><div class="fn-val" style="color:var(--g-main)">${fmtN(f.presentes)}</div><div class="fn-lbl">Presentes</div></div>
            <div class="fluxo-num"><div class="fn-val" style="color:var(--o-dark)">${fmtN(f.infreq)}</div><div class="fn-lbl">Infreq.</div></div>
            <div class="fluxo-num"><div class="fn-val" style="color:var(--r-main)">${fmtN(f.abandonos)}</div><div class="fn-lbl">Evasões</div></div>
          </div>
          ${f.pdmRisco>0?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bg2);font-size:11.5px;color:var(--o-dark)"><i class="fas fa-piggy-bank"></i> <strong>${f.pdmRisco}</strong> estudantes em risco no Pé-de-Meia</div>`:''}
          ${escola?`<div style="margin-top:6px;font-size:11px;color:var(--txt3)"><i class="fas fa-user-tie"></i> ${esc(escola.diretor)}</div>`:''}
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-state"><i class="fas fa-magnifying-glass"></i><p>Nenhum dado encontrado para os filtros selecionados.</p></div>';
}

/* ════════════════════════════════════════════
   NOTAS
   ════════════════════════════════════════════ */
function renderNotas() {
  const escolaF = $('#fNotasEscola')?.value||'';
  let dados = [...D.notas];
  if(escolaF) dados = dados.filter(n=>n.escola===escolaF);

  const mediaGeral = (dados.reduce((s,n)=>s+n.pct,0)/dados.length).toFixed(0);
  const criticas   = dados.filter(n=>n.pct<70).length;
  const completas  = dados.filter(n=>n.pct>=95).length;
  const totalPend  = dados.reduce((s,n)=>s+n.pendentes,0);

  $('#notasKpis').innerHTML = `
    ${kpiCard('teal','percent', mediaGeral+'%', 'Média de Notas Lançadas', 'Rede — 1º Bimestre')}
    ${kpiCard('red','triangle-exclamation', criticas, 'Escolas Abaixo de 70%', 'Ação imediata necessária')}
    ${kpiCard('green','check-circle', completas, 'Escolas ≥95% Completas', 'Lançamento quase total')}
    ${kpiCard('orange','clock', totalPend, 'Total de Notas Pendentes', 'Todas as escolas')}
  `;

  // Gráfico por escola
  destroyChart('chartNotasEscola');
  const coresN = dados.map(n=>n.pct>=90?COR.green:n.pct>=70?COR.teal:n.pct>=50?COR.orange:COR.red);
  ST.charts.chartNotasEscola = new Chart($('#chartNotasEscola'),{
    type:'bar',
    data:{
      labels:dados.map(n=>shortEscola(n.escola)),
      datasets:[
        {label:'Meta (100%)', data:dados.map(()=>100), backgroundColor:'rgba(0,0,0,.04)', borderRadius:5,borderSkipped:false},
        {label:'Lançado (%)', data:dados.map(n=>n.pct),  backgroundColor:coresN, borderRadius:5,borderSkipped:false},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  // Componentes curriculares
  destroyChart('chartNotasComp');
  ST.charts.chartNotasComp = new Chart($('#chartNotasComp'),{
    type:'bar',
    data:{
      labels:D.componentes.map(c=>c.comp),
      datasets:[{
        label:'% Lançado',
        data:D.componentes.map(c=>c.pct),
        backgroundColor:D.componentes.map(c=>c.pct>=90?COR.green:c.pct>=70?COR.teal:c.pct>=50?COR.orange:COR.red),
        borderRadius:4,borderSkipped:false,
      }]
    },
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw}%`}}},
      scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},y:{grid:{display:false},ticks:{font:{size:11}}}}
    }
  });

  // Tabela
  $('#tblNotasBody').innerHTML = dados.map(n=>{
    const escola = D.escolas.find(e=>e.id===n.escola);
    const pct = n.pct;
    const sit = pct>=90?'normal':pct>=70?'atencao':'critico';
    const labels = {normal:'Normal',atencao:'Atenção',critico:'Crítico'};
    return `<tr>
      <td><strong>${esc(escola?.nome||n.escola)}</strong><br><small class="text-muted">${escola?.municipio||''}</small></td>
      <td class="text-center">${n.turmas}</td>
      <td class="text-center" style="color:var(--g-main);font-weight:700">${n.lancadas}</td>
      <td class="text-center" style="color:var(--r-main);font-weight:700">${n.pendentes}</td>
      <td style="min-width:130px">${barProg(pct, corProg(pct))}</td>
      <td>${pillHTML(sit)}</td>
      <td>${fmtD(n.prazo)}</td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════════════
   RECOMPOSIÇÃO
   ════════════════════════════════════════════ */
function renderRecomp() {
  const r = D.recomposicao;
  const implantados = r.filter(x=>x.focoAp==='Implantado').length;
  const khanAtivo   = r.filter(x=>x.khan==='Ativo').length;
  const totalAbaixo = r.reduce((s,x)=>s+x.abaixoNivel,0);
  const mediaP      = Math.round(r.reduce((s,x)=>s+x.prog,0)/r.length);

  $('#recompKpis').innerHTML = `
    ${kpiCard('green','check-circle', implantados+'/'+r.length, 'Foco na Aprendizagem', 'Implantado')}
    ${kpiCard('teal','graduation-cap', khanAtivo+'/'+r.length, 'Khan Academy Ativo', 'Nas escolas')}
    ${kpiCard('orange','users', fmtN(totalAbaixo), 'Alunos Abaixo do Nível', 'Precisam de intervenção')}
    ${kpiCard('blue','percent', mediaP+'%', 'Progresso Médio', 'Implantação da recomposição')}
  `;

  destroyChart('chartRecomp');
  ST.charts.chartRecomp = new Chart($('#chartRecomp'),{
    type:'bar',
    data:{
      labels:r.map(x=>shortEscola(x.escola)),
      datasets:[
        {label:'Meta',       data:r.map(()=>100), backgroundColor:'rgba(0,0,0,.04)',borderRadius:4,borderSkipped:false},
        {label:'Progresso %',data:r.map(x=>x.prog), backgroundColor:r.map(x=>x.prog>=80?COR.green:x.prog>=50?COR.teal:x.prog>=30?COR.orange:COR.red),borderRadius:4,borderSkipped:false},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  destroyChart('chartRecompAlunos');
  ST.charts.chartRecompAlunos = new Chart($('#chartRecompAlunos'),{
    type:'bar',
    data:{
      labels:r.map(x=>shortEscola(x.escola)),
      datasets:[{
        label:'Alunos abaixo do nível',
        data:r.map(x=>x.abaixoNivel),
        backgroundColor:COR.orange,borderRadius:5,borderSkipped:false,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  const khanCor = {Ativo:'verde',Inativo:'vermelho'};
  const focoCor = {'Implantado':'concluida','Parcial':'andamento','Não Iniciado':'atrasada'};
  $('#tblRecomp').innerHTML = r.map(x=>{
    const e = D.escolas.find(s=>s.id===x.escola);
    return `<tr>
      <td><strong>${esc(e?.nome||x.escola)}</strong></td>
      <td>${pillHTML(focoCor[x.focoAp]||'planejada')}</td>
      <td><span class="semaforo ${khanCor[x.khan]||'laranja'}">${x.khan}</span></td>
      <td class="text-center" style="color:var(--o-dark);font-weight:700">${fmtN(x.abaixoNivel)}</td>
      <td class="text-center">${x.intervencoes}</td>
      <td style="min-width:130px">${barProg(x.prog, corProg(x.prog))}</td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════════════
   PLANO DE AÇÃO
   ════════════════════════════════════════════ */
function renderPlano() {
  const eixoF   = $('#fPlanoEixo')?.value||'';
  const statusF = $('#fPlanoStatus')?.value||'';
  const escolaF = $('#fPlanoEscola')?.value||'';

  let dados = ST.plano;
  if(eixoF)   dados = dados.filter(p=>p.eixo===eixoF);
  if(statusF) dados = dados.filter(p=>p.status===statusF);
  if(escolaF) dados = dados.filter(p=>p.escola===escolaF);

  const total      = ST.plano.length;
  const andamento  = ST.plano.filter(p=>p.status==='andamento').length;
  const atrasadas  = ST.plano.filter(p=>p.status==='atrasada').length;
  const concluidas = ST.plano.filter(p=>p.status==='concluida').length;
  const mediaP     = Math.round(ST.plano.reduce((s,p)=>s+p.prog,0)/ST.plano.length);

  $('#planoKpis').innerHTML = `
    ${kpiCard('teal','list-check', total, 'Total de Ações', 'No plano')}
    ${kpiCard('blue','spinner', andamento, 'Em Andamento', 'Ativas')}
    ${kpiCard('red','triangle-exclamation', atrasadas, 'Ações Atrasadas', 'Prazo expirado')}
    ${kpiCard('green','check', concluidas, 'Concluídas', 'Entregues')}
    ${kpiCard('orange','percent', mediaP+'%', 'Progresso Médio', 'Todas as ações')}
  `;

  // Gráficos
  destroyChart('chartPlanoStatus');
  ST.charts.chartPlanoStatus = new Chart($('#chartPlanoStatus'),{
    type:'doughnut',
    data:{
      labels:['Planejada','Andamento','Atrasada','Concluída'],
      datasets:[{
        data:['planejada','andamento','atrasada','concluida'].map(s=>ST.plano.filter(p=>p.status===s).length),
        backgroundColor:[COR.blue,COR.teal,COR.orange,COR.green],
        borderWidth:0, hoverOffset:6
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}}}
  });

  destroyChart('chartPlanoEixo');
  const eixos = ['pedagogico','gestao','permanencia','infraestrutura'];
  ST.charts.chartPlanoEixo = new Chart($('#chartPlanoEixo'),{
    type:'bar',
    data:{
      labels:eixos.map(e=>eixoLabel[e]),
      datasets:[{
        label:'Qtd. ações',
        data:eixos.map(e=>ST.plano.filter(p=>p.eixo===e).length),
        backgroundColor:[COR.green,COR.teal,COR.orange,COR.red],
        borderRadius:6,borderSkipped:false,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:COR.grid},ticks:{stepSize:1}},x:{grid:{display:false}}}}
  });

  // Tabela
  $('#tblPlano').innerHTML = dados.map(p=>{
    const e = D.escolas.find(s=>s.id===p.escola);
    const eixoCss = {pedagogico:'normal',gestao:'andamento',permanencia:'atencao',infraestrutura:'critico'};
    return `<tr>
      <td style="max-width:220px;white-space:normal"><strong>${esc(p.acao)}</strong>${p.obs?`<br><small style="color:var(--o-dark)"><i class="fas fa-circle-exclamation"></i> ${esc(p.obs)}</small>`:''}
      </td>
      <td><span class="pill ${eixoCss[p.eixo]||'normal'}">${eixoLabel[p.eixo]||p.eixo}</span></td>
      <td style="font-size:12px">${esc(e?.nome?.split(' ').slice(0,3).join(' ')||p.escola)}</td>
      <td style="font-size:12px">${esc(p.responsavel)}</td>
      <td style="white-space:nowrap;font-size:12px">${fmtD(p.prazo)}</td>
      <td style="min-width:120px">${barProg(p.prog, corProg(p.prog))}</td>
      <td>${pillHTML(p.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="editarAcao('${p.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn btn-ghost btn-sm btn-icon" title="Excluir" onclick="excluirAcao('${p.id}')"><i class="fas fa-trash" style="color:var(--r-main)"></i></button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="text-center text-muted" style="padding:24px">Nenhuma ação encontrada para os filtros selecionados.</td></tr>';
}

function editarAcao(id) {
  const p = ST.plano.find(a=>a.id===id); if(!p) return;
  ST.editandoAcao = id;
  $('#modalAcaoTitulo').textContent = 'Editar Ação';
  $('#aAcao').value  = p.acao;
  $('#aEixo').value  = p.eixo;
  $('#aEscola').value= p.escola;
  $('#aResp').value  = p.responsavel;
  $('#aPrazo').value = p.prazo;
  $('#aProg').value  = p.prog;
  $('#aStatus').value= p.status;
  $('#aPrio').value  = p.prio;
  $('#aObs').value   = p.obs||'';
  openModal('modalAcao');
}
function excluirAcao(id) {
  if(!confirm('Excluir esta ação do plano?')) return;
  ST.plano = ST.plano.filter(p=>p.id!==id);
  renderPlano();
  toast('Ação excluída.','warning');
}

/* ════════════════════════════════════════════
   VISITAS
   ════════════════════════════════════════════ */
function renderVisitas() {
  const statusF = $('#fVisitaStatus')?.value||'';
  const escolaF = $('#fVisitaEscola')?.value||'';
  let dados = ST.visitas;
  if(statusF) dados = dados.filter(v=>v.status===statusF);
  if(escolaF) dados = dados.filter(v=>v.escola===escolaF);

  const total    = ST.visitas.length;
  const realiz   = ST.visitas.filter(v=>v.status==='realizada').length;
  const agend    = ST.visitas.filter(v=>v.status==='agendada').length;

  $('#visitasKpis').innerHTML = `
    ${kpiCard('green','route', total, 'Total de Visitas', '2026')}
    ${kpiCard('teal','check-circle', realiz, 'Realizadas', 'Concluídas')}
    ${kpiCard('orange','calendar-check', agend, 'Agendadas', 'Próximas visitas')}
  `;

  const tipoCor = { tecnica:'teal', monitoramento:'green', smar:'orange' };
  const tipoLabel = { tecnica:'Técnica', monitoramento:'Monitoramento', smar:'SMAR' };

  $('#visitaList').innerHTML = dados.map(v=>`
    <div class="visita-card">
      <div class="visita-card-head">
        <div>
          <div class="visita-escola">${esc(nomeEscola(v.escola))}</div>
          <div class="visita-meta">
            <span><i class="fas fa-calendar"></i> ${fmtD(v.data)}</span>
            <span><i class="fas fa-tag"></i> ${tipoLabel[v.tipo]||v.tipo}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${pillHTML(v.status)}
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="editarVisita('${v.id}')"><i class="fas fa-pen"></i></button>
        </div>
      </div>
      <div class="visita-card-body">
        <div class="visita-section">
          <div class="vsec-lbl"><i class="fas fa-clipboard-list fa-xs"></i> Pauta</div>
          <div class="vsec-val">${esc(v.pauta)}</div>
        </div>
        ${v.participantes?`<div class="visita-section"><div class="vsec-lbl"><i class="fas fa-users fa-xs"></i> Participantes</div><div class="vsec-val">${esc(v.participantes)}</div></div>`:''}
        ${v.encam?`<div class="visita-section"><div class="vsec-lbl"><i class="fas fa-arrow-right fa-xs"></i> Encaminhamentos</div><div class="vsec-val" style="white-space:pre-line">${esc(v.encam)}</div></div>`:''}
        ${v.proxima?`<div class="visita-section"><div class="vsec-lbl"><i class="fas fa-calendar-plus fa-xs"></i> Próxima Visita</div><div class="vsec-val">${fmtD(v.proxima)}</div></div>`:''}
        ${v.obs?`<div class="visita-section"><div class="vsec-lbl"><i class="fas fa-note-sticky fa-xs"></i> Observações</div><div class="vsec-val">${esc(v.obs)}</div></div>`:''}
      </div>
    </div>
  `).join('') || '<div class="empty-state"><i class="fas fa-route"></i><p>Nenhuma visita encontrada.</p></div>';
}

function editarVisita(id) {
  const v = ST.visitas.find(x=>x.id===id); if(!v) return;
  ST.editandoVisita = id;
  $('#modalVisitaTitulo').textContent = 'Editar Visita Técnica';
  $('#vEscola').value = v.escola;
  $('#vData').value   = v.data;
  $('#vTipo').value   = v.tipo;
  $('#vStatus').value = v.status;
  $('#vPauta').value  = v.pauta;
  $('#vPart').value   = v.participantes||'';
  $('#vEncam').value  = v.encam||'';
  $('#vProxima').value= v.proxima||'';
  $('#vObs').value    = v.obs||'';
  openModal('modalVisita');
}

/* ════════════════════════════════════════════
   CIRCUITO DE GESTÃO
   ════════════════════════════════════════════ */
function renderCircuito() {
  const etapas = [
    { nome:'Planejamento', desc:'Definição de metas, responsáveis e pactuação com escolas.' },
    { nome:'Execução',     desc:'Implementação das ações previstas no plano de ação.' },
    { nome:'Monitoramento',desc:'Acompanhamento sistemático dos indicadores e visitas técnicas.' },
    { nome:'SMAR',         desc:'Análise de resultados, correção de rotas e encaminhamentos.' },
    { nome:'Balanço Final',desc:'Avaliação dos resultados anuais e subsídios para próximo ano.' },
  ];

  $('#etapasRow').innerHTML = etapas.map((e,i)=>`
    <div class="etapa-card">
      <div class="etapa-num">${i+1}</div>
      <div class="etapa-nome">${e.nome}</div>
      <div class="etapa-desc">${e.desc}</div>
    </div>
  `).join('');

  // Checklist SMAR
  const cl = $('#smarChecklist');
  cl.innerHTML = D.smarChecklist.map((item,i)=>`
    <label class="smar-check-item ${ST.smar[i]?'done':''}" id="smar_${i}">
      <input type="checkbox" ${ST.smar[i]?'checked':''} onchange="toggleSmar(${i})"/>
      <span>${esc(item)}</span>
    </label>
  `).join('');
  updateSmarPct();

  // Radar
  destroyChart('chartRadar');
  const mediaFreq = (D.fluxo.filter(f=>f.bim===1).reduce((s,f)=>s+f.freq,0)/D.fluxo.filter(f=>f.bim===1).length);
  const mediaNotas= D.notas.reduce((s,n)=>s+n.pct,0)/D.notas.length;
  const mediaRecomp=D.recomposicao.reduce((s,r)=>s+r.prog,0)/D.recomposicao.length;
  const mediaVisit= (ST.visitas.filter(v=>v.status==='realizada').length/ST.visitas.length)*100;
  const mediaPlano= ST.plano.reduce((s,p)=>s+p.prog,0)/ST.plano.length;
  ST.charts.chartRadar = new Chart($('#chartRadar'),{
    type:'radar',
    data:{
      labels:['Frequência','Notas SIGE','Recomposição','Visitas Téc.','Plano de Ação'],
      datasets:[{
        label:'1º Bimestre 2026',
        data:[mediaFreq,mediaNotas,mediaRecomp,mediaVisit,mediaPlano].map(v=>Math.round(v)),
        backgroundColor:'rgba(61,191,184,.15)',
        borderColor:COR.teal,
        pointBackgroundColor:COR.teal,
        pointRadius:5,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{r:{min:0,max:100,ticks:{stepSize:25,callback:v=>v+'%',font:{size:10}},grid:{color:COR.grid},pointLabels:{font:{size:11}}}}}
  });
}

function toggleSmar(i) {
  ST.smar[i] = !ST.smar[i];
  const el = $(`#smar_${i}`);
  if(el) el.classList.toggle('done', ST.smar[i]);
  updateSmarPct();
}
function updateSmarPct() {
  const done = ST.smar.filter(Boolean).length;
  const pct  = Math.round(done/ST.smar.length*100);
  const bar  = $('#smarBar'); const lbl = $('#smarPct');
  if(bar) bar.style.width = pct+'%';
  if(lbl) lbl.textContent = pct+'%';
}

/* ════════════════════════════════════════════
   PROJETOS EXTRACLASSE
   ════════════════════════════════════════════ */
function renderProjetos() {
  const catF    = $('#fProjCat')?.value||'';
  const statusF = $('#fProjStatus')?.value||'';
  let dados = ST.proj;
  if(catF)    dados = dados.filter(p=>p.cat===catF);
  if(statusF) dados = dados.filter(p=>p.status===statusF);

  const total   = ST.proj.length;
  const ativos  = ST.proj.filter(p=>p.status==='andamento').length;
  const totalPart = ST.proj.reduce((s,p)=>s+(p.part||0),0);

  $('#projetosKpis').innerHTML = `
    ${kpiCard('green','rocket', total, 'Total de Projetos', '2026')}
    ${kpiCard('teal','circle-play', ativos, 'Em Andamento', 'Ativos')}
    ${kpiCard('orange','users', fmtN(totalPart), 'Participantes', 'Total estimado')}
  `;

  const catLabel = {cientifico:'Científico',enem:'ENEM / C3',cultural:'Cultural',ambiental:'Ambiental',estagio:'Estágio',ppdt:'PPDT'};

  $('#projGrid').innerHTML = dados.map(p=>`
    <div class="proj-card">
      <div class="proj-card-head">
        <span class="proj-cat ${p.cat}">${catLabel[p.cat]||p.cat}</span>
        ${pillHTML(p.status==='andamento'?'andamento':p.status==='planejado'?'planejada':'concluida')}
      </div>
      <div class="proj-card-body">
        <div class="proj-nome">${esc(p.nome)}</div>
        <div class="proj-info"><i class="fas fa-school"></i> ${esc(nomeEscola(p.escola).split(' ').slice(0,3).join(' '))}</div>
        <div class="proj-info"><i class="fas fa-user-tie"></i> ${esc(p.coord)}</div>
        <div class="proj-info"><i class="fas fa-calendar"></i> ${esc(p.periodo)}</div>
        <div class="proj-info"><i class="fas fa-users"></i> <span class="proj-part">${p.part}</span> <span style="font-size:11px;color:var(--txt3)">participantes</span></div>
        <div class="proj-desc">${esc(p.desc)}</div>
        <div style="margin-top:10px;display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editarProjeto('${p.id}')"><i class="fas fa-pen"></i> Editar</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--r-main)" onclick="excluirProjeto('${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('') || '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-rocket"></i><p>Nenhum projeto encontrado.</p></div>';
}

function editarProjeto(id) {
  const p = ST.proj.find(x=>x.id===id); if(!p) return;
  ST.editandoProjeto = id;
  $('#modalProjetoTitulo').textContent = 'Editar Projeto';
  $('#pNome').value    = p.nome;
  $('#pCat').value     = p.cat;
  $('#pEscola').value  = p.escola;
  $('#pCoord').value   = p.coord;
  $('#pPart').value    = p.part;
  $('#pPeriodo').value = p.periodo;
  $('#pDesc').value    = p.desc||'';
  $('#pStatus').value  = p.status;
  openModal('modalProjeto');
}
function excluirProjeto(id) {
  if(!confirm('Excluir este projeto?')) return;
  ST.proj = ST.proj.filter(p=>p.id!==id);
  renderProjetos();
  toast('Projeto excluído.','warning');
}

/* ════════════════════════════════════════════
   BUSCA ATIVA
   ════════════════════════════════════════════ */
function renderBusca() {
  const escolaF = $('#fBuscaEscola')?.value||'';
  const sitF    = $('#fBuscaSit')?.value||'';
  let dados = D.buscaAtiva;
  if(escolaF) dados = dados.filter(b=>b.escola===escolaF);
  if(sitF)    dados = dados.filter(b=>b.sit===sitF);

  const sem_c  = D.buscaAtiva.filter(b=>b.sit==='sem_contato').length;
  const acomp  = D.buscaAtiva.filter(b=>b.sit==='acompanhamento').length;
  const reint  = D.buscaAtiva.filter(b=>b.sit==='reintegrado').length;
  const total  = D.buscaAtiva.length;

  $('#buscaStats').innerHTML = `
    ${buscaStat(total,        'Total em B.A.',    'var(--t-dark)')}
    ${buscaStat(sem_c,        'Sem Contato',      'var(--r-main)')}
    ${buscaStat(acomp,        'Em Acompanhamento','var(--o-dark)')}
    ${buscaStat(reint,        'Reintegrados',     'var(--g-main)')}
  `;

  // Gráfico situação
  destroyChart('chartBuscaSit');
  ST.charts.chartBuscaSit = new Chart($('#chartBuscaSit'),{
    type:'doughnut',
    data:{
      labels:['Sem Contato','Acompanhamento','Reintegrado'],
      datasets:[{data:[sem_c,acomp,reint],backgroundColor:[COR.red,COR.orange,COR.green],borderWidth:0,hoverOffset:6}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}}}
  });

  // Gráfico por escola
  destroyChart('chartBuscaEscola');
  const porEscola = D.escolas.map(e=>D.buscaAtiva.filter(b=>b.escola===e.id).length);
  ST.charts.chartBuscaEscola = new Chart($('#chartBuscaEscola'),{
    type:'bar',
    data:{
      labels:D.escolas.map(e=>e.nome.split(' ').slice(-2).join(' ')),
      datasets:[{label:'Casos',data:porEscola,backgroundColor:COR.orange,borderRadius:5,borderSkipped:false}]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:COR.grid},ticks:{stepSize:1}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  const sitCls = { sem_contato:'atrasada', acompanhamento:'andamento', reintegrado:'concluida' };
  const sitLbl = { sem_contato:'Sem Contato', acompanhamento:'Acompanhamento', reintegrado:'Reintegrado' };
  const contCls= { Realizado:'concluida', Pendente:'atrasada' };
  $('#tblBusca').innerHTML = dados.map(b=>`
    <tr>
      <td style="font-size:12px"><strong>${esc(nomeEscola(b.escola).split(' ').slice(0,3).join(' '))}</strong></td>
      <td class="text-center">${esc(b.turma)}</td>
      <td style="font-size:12px">${esc(b.motivo)}</td>
      <td class="text-center" style="font-weight:700;color:var(--r-main)">${b.faltas}</td>
      <td>${pillHTML(contCls[b.contato]||'andamento')}</td>
      <td>${pillHTML(contCls[b.visita]||'andamento')}</td>
      <td style="font-size:12px">${esc(b.resp)}</td>
      <td><span class="pill ${sitCls[b.sit]||'andamento'}">${sitLbl[b.sit]||b.sit}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="text-center text-muted" style="padding:24px">Nenhum caso encontrado.</td></tr>';
}

function buscaStat(val, lbl, cor) {
  return `<div class="busca-stat">
    <div class="bstat-val" style="color:${cor}">${val}</div>
    <div class="bstat-lbl">${lbl}</div>
  </div>`;
}

/* ════════════════════════════════════════════
   PÉ-DE-MEIA
   ════════════════════════════════════════════ */
function renderPdm() {
  const pd = D.pedeMeia;
  const totalB  = pd.reduce((s,p)=>s+p.benef,0);
  const totalR  = pd.reduce((s,p)=>s+p.risco,0);
  const totalBl = pd.reduce((s,p)=>s+p.bloq,0);
  const envAtual= pd.filter(p=>p.envio==='Atualizado').length;

  $('#pdmSummary').innerHTML = `
    <div class="pdm-sum-card"><div class="pdm-val" style="color:var(--g-main)">${fmtN(totalB)}</div><div class="pdm-lbl">Total Beneficiários</div></div>
    <div class="pdm-sum-card"><div class="pdm-val" style="color:var(--r-main)">${fmtN(totalR)}</div><div class="pdm-lbl">Em Risco (&lt;80%)</div></div>
    <div class="pdm-sum-card"><div class="pdm-val" style="color:var(--o-dark)">${fmtN(totalBl)}</div><div class="pdm-lbl">Benefícios Bloqueados</div></div>
    <div class="pdm-sum-card"><div class="pdm-val" style="color:var(--t-dark)">${envAtual}/${pd.length}</div><div class="pdm-lbl">Envios Atualizados</div></div>
  `;

  destroyChart('chartPdmRisco');
  ST.charts.chartPdmRisco = new Chart($('#chartPdmRisco'),{
    type:'bar',
    data:{
      labels:pd.map(p=>shortEscola(p.escola)),
      datasets:[{label:'Em Risco (<80%)',data:pd.map(p=>p.risco),backgroundColor:pd.map(p=>p.risco>20?COR.red:p.risco>10?COR.orange:COR.teal),borderRadius:5,borderSkipped:false}]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  destroyChart('chartPdmFreq');
  ST.charts.chartPdmFreq = new Chart($('#chartPdmFreq'),{
    type:'line',
    data:{
      labels:pd.map(p=>shortEscola(p.escola)),
      datasets:[
        {label:'Meta (80%)',   data:pd.map(()=>80),  borderColor:'rgba(232,64,28,.3)',borderDash:[5,5],borderWidth:2,pointRadius:0,fill:false},
        {label:'Freq. Média %',data:pd.map(p=>p.freqM),borderColor:COR.teal,backgroundColor:'rgba(61,191,184,.08)',pointBackgroundColor:COR.teal,tension:.3,fill:true},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{size:11},padding:10}}},
      scales:{y:{min:70,max:100,ticks:{callback:v=>v+'%'},grid:{color:COR.grid}},x:{grid:{display:false},ticks:{font:{size:10},maxRotation:25}}}}
  });

  const envCls = { Atualizado:'concluida', Pendente:'atrasada' };
  $('#tblPdm').innerHTML = pd.map(p=>{
    const e = D.escolas.find(s=>s.id===p.escola);
    const freqCor = p.freqM>=90?'var(--g-main)':p.freqM>=80?'var(--t-dark)':'var(--r-main)';
    return `<tr>
      <td><strong>${esc(e?.nome||p.escola)}</strong></td>
      <td class="text-center" style="font-weight:700;color:var(--g-dark)">${fmtN(p.benef)}</td>
      <td><span style="font-weight:700;color:${freqCor}">${p.freqM}%</span></td>
      <td class="text-center" style="font-weight:700;color:var(--r-main)">${p.risco}</td>
      <td class="text-center" style="font-weight:700;color:var(--o-dark)">${p.bloq}</td>
      <td>${pillHTML(envCls[p.envio]||'andamento')}</td>
      <td style="font-size:12px">${p.dataEnvio}</td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════════════
   AGENDA & PRAZOS
   ════════════════════════════════════════════ */
function renderAgenda() {
  const tipoF = $('#fAgendaTipo')?.value||'';
  let dados = ST.eventos.sort((a,b)=>new Date(a.data)-new Date(b.data));
  if(tipoF) dados = dados.filter(e=>e.tipo===tipoF);

  const urgentes = ST.eventos.filter(e=>{ const d=diasRestantes(e.data); return d>=0&&d<=7; }).length;
  const proximos = ST.eventos.filter(e=>{ const d=diasRestantes(e.data); return d>=0&&d<=30; }).length;
  const passados = ST.eventos.filter(e=>diasRestantes(e.data)<0).length;

  $('#agendaKpis').innerHTML = `
    ${kpiCard('red','fire', urgentes, 'Urgentes (≤7 dias)', 'Atenção imediata')}
    ${kpiCard('orange','calendar-check', proximos, 'Próximos 30 dias', 'Em breve')}
    ${kpiCard('teal','calendar-days', ST.eventos.length, 'Total de Eventos', '2026')}
    ${kpiCard('green','check-circle', passados, 'Realizados', 'Já ocorreram')}
  `;

  const tipoLabel = { prazo:'Prazo',reuniao:'Reunião',visita:'Visita',avaliacao:'Avaliação',evento:'Evento',formacao:'Formação' };
  const tipoIcon  = { prazo:'clock',reuniao:'people-group',visita:'route',avaliacao:'chart-bar',evento:'star',formacao:'chalkboard-user' };

  $('#agendaList').innerHTML = dados.map(e=>{
    const d = diasRestantes(e.data);
    const [y,m,dy] = e.data.split('-');
    const passado = d<0;
    const cls = passado?'normal':d<=3?'urgente':d<=14?'proximo':'normal';
    return `
      <div class="agenda-item" style="${passado?'opacity:.6':''}">
        <div class="agenda-strip ${e.tipo}"></div>
        <div class="agenda-date">
          <div class="agenda-dd">${dy}</div>
          <div class="agenda-mm">${MESES[parseInt(m)-1]||''}</div>
        </div>
        <div class="agenda-content">
          <div class="agenda-titulo"><i class="fas fa-${tipoIcon[e.tipo]||'calendar'}" style="color:var(--g-main);margin-right:5px"></i>${esc(e.titulo)}</div>
          <div class="agenda-desc">${esc(e.desc)}</div>
        </div>
        <div class="agenda-right">
          ${passado
            ? `<span class="pill concluida"><i class="fas fa-check"></i> Realizado</span>`
            : `<div class="prazo-days ${cls}"><span>${d}</span><small>dias</small></div>`
          }
          <button class="btn btn-ghost btn-sm btn-icon" title="Excluir" onclick="excluirEvento('${e.id}')"><i class="fas fa-trash" style="color:var(--r-main)"></i></button>
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-state"><i class="fas fa-calendar"></i><p>Nenhum evento encontrado.</p></div>';
}

function excluirEvento(id) {
  if(!confirm('Excluir este evento?')) return;
  ST.eventos = ST.eventos.filter(e=>e.id!==id);
  renderAgenda();
  updateBadges();
  toast('Evento removido.','warning');
}

/* ════════════════════════════════════════════
   ESCOLAS
   ════════════════════════════════════════════ */
function renderEscolas() {
  const tipoF  = $('#fEscolaTipo')?.value||'';
  const buscaF = ($('#fEscolaBusca')?.value||'').toLowerCase();
  let dados = D.escolas;
  if(tipoF)  dados = dados.filter(e=>e.tipo===tipoF);
  if(buscaF) dados = dados.filter(e=>e.nome.toLowerCase().includes(buscaF)||e.municipio.toLowerCase().includes(buscaF));

  const totalM = dados.reduce((s,e)=>s+e.matricula,0);
  const freqM  = (dados.reduce((s,e)=>s+e.freq,0)/dados.length).toFixed(1);
  const notM   = (dados.reduce((s,e)=>s+e.notas,0)/dados.length).toFixed(0);

  $('#escolasKpis').innerHTML = `
    ${kpiCard('green','school', dados.length, 'Escolas Exibidas', `de ${D.escolas.length} no total`)}
    ${kpiCard('teal','users', fmtN(totalM), 'Matrículas', 'Escolas filtradas')}
    ${kpiCard('orange','percent', freqM+'%', 'Freq. Média', 'Bimestre')}
    ${kpiCard('blue','clipboard-check', notM+'%', 'Notas Médias', 'SIGE')}
  `;

  $('#escolaGrid').innerHTML = dados.map(e=>{
    const fluxo = D.fluxo.find(f=>f.escola===e.id&&f.bim===1);
    const s = semaforo(e.freq);
    const nCor = e.notas>=90?'var(--g-main)':e.notas>=70?'var(--t-dark)':e.notas>=50?'var(--o-dark)':'var(--r-main)';
    const sigeCls = { ok:'concluida', pendente:'atrasada', inconsistente:'critico' };
    return `
      <div class="escola-card" onclick="detalheEscola('${e.id}')">
        <div class="escola-card-top">
          <h4>${esc(e.nome)}</h4>
          <span class="escola-tipo">${e.tipo}</span>
        </div>
        <div class="escola-card-body">
          <div class="escola-card-row"><span><i class="fas fa-map-marker-alt" style="color:var(--g-main)"></i> Município</span><span>${esc(e.municipio)}</span></div>
          <div class="escola-card-row"><span><i class="fas fa-user-tie" style="color:var(--g-main)"></i> Diretor(a)</span><span>${esc(e.diretor)}</span></div>
          <div class="escola-card-row"><span><i class="fas fa-users" style="color:var(--g-main)"></i> Matrículas</span><span>${fmtN(e.matricula)}</span></div>
          <div class="escola-card-indicators">
            <div class="escola-ind">
              <div class="ind-val" style="color:${s.cls==='verde'?'var(--g-main)':s.cls==='laranja'?'var(--o-dark)':'var(--r-main)'}">${e.freq}%</div>
              <div class="ind-lbl">Frequência</div>
            </div>
            <div class="escola-ind">
              <div class="ind-val" style="color:${nCor}">${e.notas}%</div>
              <div class="ind-lbl">Notas SIGE</div>
            </div>
            <div class="escola-ind">
              <div class="ind-val">${fluxo?fluxo.infreq:'—'}</div>
              <div class="ind-lbl">Infreq.</div>
            </div>
            <div class="escola-ind">
              <div class="ind-val" style="color:e.sige==='ok'?'var(--g-main)':'var(--r-main)'">${pillHTML(sigeCls[e.sige]||'andamento')}</div>
              <div class="ind-lbl">SIGE/Censo</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-school"></i><p>Nenhuma escola encontrada.</p></div>';
}

function detalheEscola(id) {
  const e = D.escolas.find(s=>s.id===id); if(!e) return;
  const fluxo = D.fluxo.find(f=>f.escola===id&&f.bim===1);
  const notas = D.notas.find(n=>n.escola===id);
  const pdm   = D.pedeMeia.find(p=>p.escola===id);
  const recomp= D.recomposicao.find(r=>r.escola===id);
  const visits= ST.visitas.filter(v=>v.escola===id);
  const acoes = ST.plano.filter(p=>p.escola===id);
  const s = semaforo(e.freq);

  $('#modalEscolaNome').textContent = e.nome;
  $('#modalEscolaBody').innerHTML = `
    <div class="escola-detalhe-grid">
      <div class="ed-stat"><div class="val">${fmtN(e.matricula)}</div><div class="lbl">Matrículas</div></div>
      <div class="ed-stat"><div class="val">${e.turmas}</div><div class="lbl">Turmas</div></div>
      <div class="ed-stat"><div class="val">${e.professores}</div><div class="lbl">Professores</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div><div style="font-size:10.5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">Município</div><div style="font-weight:600">${esc(e.municipio)}</div></div>
      <div><div style="font-size:10.5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">Diretor(a)</div><div style="font-weight:600">${esc(e.diretor)}</div></div>
      <div><div style="font-size:10.5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">Tipo</div><div style="font-weight:600">${e.tipo}</div></div>
      <div><div style="font-size:10.5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">Contato</div><div style="font-weight:600">${e.fone}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      <div class="ed-stat"><div class="val" style="color:var(--${s.cls==='verde'?'g-main':s.cls==='laranja'?'o-dark':'r-main'})">${e.freq}%</div><div class="lbl">Frequência</div></div>
      <div class="ed-stat"><div class="val" style="color:var(--${e.notas>=90?'g-main':e.notas>=70?'t-dark':'r-main'})">${e.notas}%</div><div class="lbl">Notas SIGE</div></div>
      <div class="ed-stat"><div class="val" style="color:var(--o-dark)">${fluxo?fluxo.infreq:'—'}</div><div class="lbl">Infreq.</div></div>
      <div class="ed-stat"><div class="val" style="color:var(--r-main)">${fluxo?fluxo.abandonos:'—'}</div><div class="lbl">Evasões</div></div>
    </div>
    ${pdm?`<div style="background:var(--t-pale);border:1px solid var(--t-light);border-radius:var(--r-md);padding:12px 14px;margin-bottom:14px;font-size:13px">
      <strong><i class="fas fa-piggy-bank" style="color:var(--t-dark);margin-right:5px"></i>Pé-de-Meia</strong> —
      ${fmtN(pdm.benef)} beneficiários · <span style="color:var(--r-main)">${pdm.risco} em risco</span> · ${pdm.bloq} bloqueados · Envio: ${pillHTML(pdm.envio==='Atualizado'?'concluida':'atrasada')}
    </div>`:''}
    ${recomp?`<div style="background:var(--g-pale);border:1px solid var(--g-xlight);border-radius:var(--r-md);padding:12px 14px;margin-bottom:14px;font-size:13px">
      <strong><i class="fas fa-book-open-reader" style="color:var(--g-main);margin-right:5px"></i>Recomposição</strong> —
      Foco: <strong>${recomp.focoAp}</strong> · Khan: <strong>${recomp.khan}</strong> · ${fmtN(recomp.abaixoNivel)} abaixo nível · Progresso: ${barProg(recomp.prog,corProg(recomp.prog))}
    </div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--txt3);margin-bottom:8px">Visitas (${visits.length})</div>
        ${visits.length?visits.map(v=>`<div style="font-size:12px;margin-bottom:6px"><span class="pill ${v.status==='realizada'?'concluida':'agendada'}">${v.status}</span> <strong>${fmtD(v.data)}</strong><br><span style="color:var(--txt2)">${esc(v.pauta.substring(0,50))}…</span></div>`).join(''):'<div class="text-muted fs-12">Nenhuma visita registrada.</div>'}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--txt3);margin-bottom:8px">Plano de Ação (${acoes.length})</div>
        ${acoes.length?acoes.map(p=>`<div style="font-size:12px;margin-bottom:6px">${pillHTML(p.status)} <span style="color:var(--txt2)">${esc(p.acao.substring(0,50))}…</span></div>`).join(''):'<div class="text-muted fs-12">Nenhuma ação registrada.</div>'}
      </div>
    </div>
  `;
  openModal('modalEscola');
}

/* ════════════════════════════════════════════
   SALVADORES (MODAIS)
   ════════════════════════════════════════════ */
function salvarAcao() {
  const acao = $('#aAcao').value.trim();
  if(!acao) { toast('Informe a descrição da ação.','error'); return; }
  if(!$('#aEscola').value) { toast('Selecione uma escola.','error'); return; }

  const obj = {
    id:    ST.editandoAcao || 'p'+Date.now(),
    acao:  acao,
    eixo:  $('#aEixo').value,
    escola:$('#aEscola').value,
    responsavel: $('#aResp').value.trim(),
    prazo: $('#aPrazo').value,
    prog:  parseInt($('#aProg').value)||0,
    status:$('#aStatus').value,
    prio:  $('#aPrio').value,
    obs:   $('#aObs').value.trim(),
  };

  if(ST.editandoAcao) {
    ST.plano = ST.plano.map(p=>p.id===ST.editandoAcao?obj:p);
    toast('Ação atualizada com sucesso!','success');
  } else {
    ST.plano.push(obj);
    toast('Nova ação adicionada!','success');
  }
  ST.editandoAcao = null;
  closeModal('modalAcao');
  renderPlano();
}

function salvarVisita() {
  if(!$('#vEscola').value) { toast('Selecione uma escola.','error'); return; }
  if(!$('#vData').value)   { toast('Informe a data.','error'); return; }
  if(!$('#vPauta').value.trim()) { toast('Informe a pauta.','error'); return; }

  const obj = {
    id:    ST.editandoVisita || 'v'+Date.now(),
    escola:     $('#vEscola').value,
    data:       $('#vData').value,
    tipo:       $('#vTipo').value,
    status:     $('#vStatus').value,
    pauta:      $('#vPauta').value.trim(),
    participantes: $('#vPart').value.trim(),
    encam:      $('#vEncam').value.trim(),
    proxima:    $('#vProxima').value,
    obs:        $('#vObs').value.trim(),
  };

  if(ST.editandoVisita) {
    ST.visitas = ST.visitas.map(v=>v.id===ST.editandoVisita?obj:v);
    toast('Visita atualizada!','success');
  } else {
    ST.visitas.push(obj);
    toast('Visita registrada!','success');
  }
  ST.editandoVisita = null;
  closeModal('modalVisita');
  renderVisitas();
}

function salvarProjeto() {
  const nome = $('#pNome').value.trim();
  if(!nome) { toast('Informe o nome do projeto.','error'); return; }

  const obj = {
    id:    ST.editandoProjeto || 'pr'+Date.now(),
    nome:  nome,
    cat:   $('#pCat').value,
    escola:$('#pEscola').value,
    coord: $('#pCoord').value.trim(),
    part:  parseInt($('#pPart').value)||0,
    periodo: $('#pPeriodo').value.trim(),
    desc:  $('#pDesc').value.trim(),
    status:$('#pStatus').value,
  };

  if(ST.editandoProjeto) {
    ST.proj = ST.proj.map(p=>p.id===ST.editandoProjeto?obj:p);
    toast('Projeto atualizado!','success');
  } else {
    ST.proj.push(obj);
    toast('Projeto adicionado!','success');
  }
  ST.editandoProjeto = null;
  closeModal('modalProjeto');
  renderProjetos();
}

function salvarEvento() {
  const titulo = $('#evTitulo').value.trim();
  if(!titulo) { toast('Informe o título do evento.','error'); return; }
  if(!$('#evData').value) { toast('Informe a data.','error'); return; }

  const obj = {
    id:    'ev'+Date.now(),
    titulo:titulo,
    data:  $('#evData').value,
    tipo:  $('#evTipo').value,
    desc:  $('#evDesc').value.trim(),
  };
  ST.eventos.push(obj);
  toast('Evento adicionado!','success');
  closeModal('modalEvento');
  renderAgenda();
  updateBadges();
}

/* ════════════════════════════════════════════
   INICIALIZAÇÃO
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* navegação */
  $$('.nav-link[data-page]').forEach(l => {
    l.addEventListener('click', () => navTo(l.dataset.page));
  });
  $$('[data-goto]').forEach(b => {
    b.addEventListener('click', () => navTo(b.dataset.goto));
  });
  // delegação para botões dinâmicos data-goto
  $('#main').addEventListener('click', e=>{
    const g = e.target.closest('[data-goto]');
    if(g) navTo(g.dataset.goto);
  });

  /* sidebar */
  $('#hamburger').addEventListener('click', openSidebar);
  $('#sidebarClose').addEventListener('click', closeSidebar);
  $('#overlay').addEventListener('click', closeSidebar);

  /* alert drawer */
  $('#btnAlertPanel').addEventListener('click', ()=>{
    $('#alertDrawer').classList.toggle('open');
    renderAlertas();
  });
  $('#closeDrawer').addEventListener('click', ()=>$('#alertDrawer').classList.remove('open'));

  /* print */
  $('#btnPrint').addEventListener('click', ()=>window.print());

  /* fechar modais clicando fora */
  $$('.modal').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('open'); });
  });

  /* salvar ações modal */
  $('#btnSalvarAcao').addEventListener('click', salvarAcao);
  $('#btnSalvarVisita').addEventListener('click', salvarVisita);
  $('#btnSalvarProjeto').addEventListener('click', salvarProjeto);
  $('#btnSalvarEvento').addEventListener('click', salvarEvento);

  /* botões novo */
  $('#btnNovaAcao').addEventListener('click', ()=>{
    ST.editandoAcao = null;
    $('#modalAcaoTitulo').textContent='Nova Ação';
    ['aAcao','aResp','aObs'].forEach(id=>$(`#${id}`).value='');
    $('#aPrazo').value=''; $('#aProg').value=0;
    $('#aEixo').value='pedagogico'; $('#aStatus').value='planejada'; $('#aPrio').value='alta';
    openModal('modalAcao');
  });
  $('#btnNovaVisita').addEventListener('click', ()=>{
    ST.editandoVisita = null;
    $('#modalVisitaTitulo').textContent='Nova Visita Técnica';
    ['vEscola','vData','vPauta','vPart','vEncam','vProxima','vObs'].forEach(id=>{
      const el=$(`#${id}`); if(el) el.value='';
    });
    $('#vTipo').value='tecnica'; $('#vStatus').value='agendada';
    openModal('modalVisita');
  });
  $('#btnNovoProjeto').addEventListener('click', ()=>{
    ST.editandoProjeto = null;
    $('#modalProjetoTitulo').textContent='Novo Projeto';
    ['pNome','pCoord','pPart','pPeriodo','pDesc'].forEach(id=>$(`#${id}`).value='');
    $('#pCat').value='cientifico'; $('#pStatus').value='andamento';
    openModal('modalProjeto');
  });
  $('#btnNovoEvento').addEventListener('click', ()=>{
    ['evTitulo','evData','evDesc'].forEach(id=>$(`#${id}`).value='');
    $('#evTipo').value='prazo';
    openModal('modalEvento');
  });

  /* Reset SMAR */
  $('#btnResetSmar').addEventListener('click', ()=>{
    ST.smar = new Array(D.smarChecklist.length).fill(false);
    renderCircuito();
    toast('Checklist SMAR reiniciado.','info');
  });

  /* Salvar observações circuito */
  $('#btnSalvarObs').addEventListener('click', ()=>{
    const txt = $('#circuitoObs').value.trim();
    if(!txt) { toast('Digite uma observação.','warning'); return; }
    ST.obsCircuito.push({ txt, data: new Date().toLocaleDateString('pt-BR') });
    $('#circuitoObs').value='';
    const hist = $('#obsHistory');
    hist.innerHTML = ST.obsCircuito.map(o=>`
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;font-size:12.5px">
        <div style="font-size:10px;color:var(--txt3);margin-bottom:4px"><i class="fas fa-calendar-check"></i> ${o.data}</div>
        <div style="color:var(--txt1);white-space:pre-line">${esc(o.txt)}</div>
      </div>
    `).reverse().join('');
    toast('Observação salva!','success');
  });

  /* Filtros reativos */
  const filtros = [
    ['#fFluxoBim','fluxo'],['#fFluxoEscola','fluxo'],
    ['#fNotasEscola','notas'],
    ['#fPlanoEixo','plano'],['#fPlanoStatus','plano'],['#fPlanoEscola','plano'],
    ['#fVisitaStatus','visitas'],['#fVisitaEscola','visitas'],
    ['#fProjCat','projetos'],['#fProjStatus','projetos'],
    ['#fBuscaEscola','busca'],['#fBuscaSit','busca'],
    ['#fAgendaTipo','agenda'],
    ['#fEscolaTipo','escolas'],['#fEscolaBusca','escolas'],
  ];
  filtros.forEach(([sel, page])=>{
    const el=$(sel); if(!el) return;
    el.addEventListener('change', ()=>renderPage(page));
    if(el.tagName==='INPUT') el.addEventListener('input', ()=>renderPage(page));
  });

  /* Popula selects */
  populateEscolaSelects();

  /* Badges iniciais */
  updateBadges();

  /* Render inicial */
  renderDash();
});
