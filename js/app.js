/* ============================================
   APP — Roteador Principal
   SEDUC-CE · Painel Superintendência 2026
   ============================================ */

const App = {
  currentPage: 'dashboard',

  pages: {
    'dashboard': { module: DashboardPage, label: 'Dashboard' },
    'escolas': { module: EscolasPage, label: 'Gestão de Escolas' },
    'indicadores': { module: IndicadoresPage, label: 'Indicadores' },
    'frequencia': { module: FrequenciaPage, label: 'Frequência & Fluxo' },
    'notas': { module: NotasPage, label: 'Notas & Rendimento' },
    'plano-acao': { module: PlanoAcaoPage, label: 'Plano de Ação' },
    'visitas': { module: VisitasPage, label: 'Visitas da Superintendência' },
    'projetos': { module: ProjetosPage, label: 'Projetos Extraclasse' },
    'busca-ativa': { module: BuscaAtivaPage, label: 'Busca Ativa Escolar' },
    'agenda': { module: AgendaPage, label: 'Agenda & Alertas' },
  },

  init() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
      document.getElementById('mainContent').classList.toggle('expanded');
    });
    document.getElementById('menuBtn').addEventListener('click', () => {
      const s = document.getElementById('sidebar');
      s.classList.toggle('mobile-open');
    });

    // Nav links
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const page = el.getAttribute('data-page');
        if (page) this.navigate(page);
        // Fechar mobile
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    // Data no topbar
    document.getElementById('currentDate').textContent = Utils.dataAtual();

    // Navegar para a página inicial
    this.navigate('dashboard');
  },

  navigate(page) {
    if (!this.pages[page]) {
      console.warn('Page not found:', page);
      return;
    }

    // Atualizar nav ativo
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      if (el.getAttribute('data-page') === page) el.classList.add('active');
    });

    // Breadcrumb
    document.getElementById('breadcrumb').textContent = this.pages[page].label;

    // Render page
    this.currentPage = page;
    const mod = this.pages[page].module;
    if (mod && typeof mod.render === 'function') {
      mod.render();
    }

    // Scroll ao topo
    document.getElementById('pageContent').scrollTop = 0;
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => App.init());
