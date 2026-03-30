// SEDUC-CE app.js - VERSÃO COM EDIÇÃO DE ESCOLAS E localStorage
const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtN = n => (n || n === 0 ? n.toLocaleString('pt-BR') : '--');
const fmtD = s => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};
const diasRestantes = s => {
  const d = new Date(s) - new Date();
  return Math.ceil(d / 86400000);
};
const nomeEscola = id => D.escolas.find(e => e.ide === id)?.nome ?? id;
const shortEscola = id => {
  const n = nomeEscola(id);
  const w = n.split(' ');
  return w.length > 3 ? w.slice(0, 3).join(' ') : n;
};
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai',
