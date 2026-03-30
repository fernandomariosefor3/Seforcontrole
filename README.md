# SEDUC-CE · Painel da Superintendência Escolar 2026

Painel de acompanhamento responsivo para superintendência escolar, baseado nas **Diretrizes para o Ano Letivo 2026 da SEDUC-Ceará**.

---

## 🎨 Identidade Visual
Paleta **100% fiel à capa do documento oficial**:
| Token | Hex | Uso |
|-------|-----|-----|
| Verde título | `#1B7A3E` | Principal, KPIs, nav active |
| Verde escuro | `#1A5C32` | Sidebar, logo |
| Turquesa | `#3DBFB8` | Gráficos, destaque secundário |
| Laranja | `#F47920` | Alertas médios, eixo permanência |
| Vermelho | `#E8401C` | Alertas críticos, badges |
| Fundo | `#F2F2F2` | Background geral |

---

## ✅ Funcionalidades Implementadas

### 📊 Dashboard
- 6 KPIs: matrículas, frequência média, notas lançadas, ações atrasadas, visitas realizadas, Pé-de-Meia em risco
- Gráfico de frequência por escola (semáforo verde/amarelo/laranja/vermelho)
- Gráfico doughnut — status do Plano de Ação
- Linha de evolução mensal de frequência
- Barras de notas lançadas por escola
- Lista de escolas em alerta crítico
- Últimas visitas técnicas com status
- Próximos prazos com contagem regressiva

### 👥 Fluxo & Frequência
- Filtros por bimestre e escola
- KPIs: matrículas, presentes, infrequentes, evasões, Pé-de-Meia em risco
- Gráfico comparativo matriculados × presentes
- Linha de evolução mensal
- Cards por escola com semáforo visual (verde/laranja/vermelho)

### 📋 Preenchimento de Notas
- KPIs: média geral, escolas críticas (<70%), completas (≥95%), total pendente
- Gráficos: % por escola e por componente curricular (horizontal)
- Tabela completa com status e prazo

### 📚 Recomposição das Aprendizagens
- Monitoramento do "Foco na Aprendizagem" e Khan Academy por escola
- KPIs: implantações, Khan ativo, alunos abaixo do nível, progresso médio
- Gráficos de progresso e alunos em risco
- Tabela detalhada por escola

### 🎯 Plano de Ação
- CRUD completo (criar, editar, excluir)
- Filtros: eixo, status, escola
- Eixos: Pedagógico, Gestão, Permanência, Infraestrutura
- Gráficos de pizza (status) e barras (eixos)
- Tabela com barras de progresso e status visual

### 🚗 Visitas Técnicas
- Registro de pautas, participantes, encaminhamentos, próxima visita
- CRUD completo (criar, editar)
- Filtros por status e escola
- Cards com todas as informações da visita

### 🔄 Circuito de Gestão
- 5 etapas visuais do CGC/SEDUC
- Checklist SMAR interativo com progresso
- Radar de indicadores (frequência, notas, recomposição, visitas, plano)
- Registro de observações e encaminhamentos

### 🚀 Projetos Extraclasse
- Cards por categoria: Científico, ENEM/C3, Cultural, Ambiental, Estágio, PPDT
- 12 projetos: Ceará Científico, ENEM, Festival Alunos que Inspiram, Robótica, Pé-de-Meia, etc.
- CRUD completo
- Filtros por categoria e status

### 🔍 Busca Ativa Escolar
- "Nem 1 Aluno Fora da Escola"
- Estatísticas: sem contato, acompanhamento, reintegrados
- Gráficos por situação e por escola
- Tabela individual com responsável

### 🐖 Pé-de-Meia
- Controle de beneficiários por escola
- Alertas de frequência < 80%
- Status de envio mensal ao MEC
- Gráficos de risco e frequência com linha de meta (80%)

### 📅 Agenda & Prazos
- Todos os prazos críticos 2026 (Censo, notas, SMAR, etc.)
- Contagem regressiva em dias
- Filtros por tipo (prazo, reunião, visita, formação...)
- CRUD para adicionar novos eventos

### 🏫 Minhas Escolas
- Grid de cards com indicadores visuais
- Filtros por tipo (EEMTI, EEEP, EEM) e busca por nome
- Modal de detalhe completo (perfil, indicadores, visitas, plano)

### 🔔 Sistema de Alertas
- Drawer lateral com alertas em tempo real
- Níveis: danger (vermelho), warning (laranja), info (turquesa)
- Badge de notificação no sino com contador

---

## 📁 Estrutura de Arquivos

```
index.html          — HTML principal (12 módulos)
css/
  style.css         — Estilos completos (paleta PDF + responsivo)
js/
  data.js           — Dados seed (8 escolas, fluxo, notas, visitas, etc.)
  app.js            — Lógica principal, gráficos, CRUD, navegação
README.md
```

---

## 🗃️ Dados

### Tabelas na API
- **escolas** — 8 escolas com indicadores
- **plano_acao** — Ações do plano com eixo/status/progresso

### Dados em memória (js/data.js)
- `D.escolas` — 8 escolas (EEMTI, EEEP, EEM)
- `D.fluxo` — 11 registros bimestrais de fluxo
- `D.freqMensal` — evolução fevereiro–julho
- `D.notas` — % lançado por escola
- `D.componentes` — 12 componentes curriculares
- `D.planoAcao` — 12 ações (4 eixos)
- `D.visitas` — 6 visitas técnicas
- `D.projetos` — 12 projetos extraclasse
- `D.buscaAtiva` — 8 estudantes em acompanhamento
- `D.pedeMeia` — beneficiários por escola
- `D.recomposicao` — status Foco + Khan Academy
- `D.eventos` — 13 eventos/prazos 2026
- `D.alertas` — 10 alertas iniciais
- `D.smarChecklist` — 11 itens do checklist SMAR

---

## 🔗 Navegação

| Rota (data-page) | Módulo |
|---|---|
| `dashboard` | Dashboard principal |
| `fluxo` | Fluxo & Frequência |
| `notas` | Preenchimento de Notas |
| `recomposicao` | Recomposição das Aprendizagens |
| `plano` | Plano de Ação |
| `visitas` | Visitas Técnicas |
| `circuito` | Circuito de Gestão |
| `projetos` | Projetos Extraclasse |
| `busca` | Busca Ativa Escolar |
| `pedemeia` | Pé-de-Meia |
| `agenda` | Agenda & Prazos |
| `escolas` | Minhas Escolas |

---

## 🚀 Publicação
Para publicar, use a aba **Publish** — um clique e o site fica online.
