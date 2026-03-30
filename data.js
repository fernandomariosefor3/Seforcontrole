/* ═══════════════════════════════════════════════
   SEDUC-CE · Dados seed — focado no que a
   Superintendente acompanha
   ═══════════════════════════════════════════════ */
const D = {

  escolas: [
    { id:'e1', nome:'EEMTI Presidente Costa e Silva', tipo:'EEMTI', municipio:'Fortaleza',   diretor:'Ana Paula Lima',       fone:'(85)3101-2001', matricula:820, turmas:24, professores:45, freq:91.2, notas:87, sige:'ok' },
    { id:'e2', nome:'EEEP Maria Neli Sobreira',        tipo:'EEEP',  municipio:'Fortaleza',   diretor:'João Carlos Neto',     fone:'(85)3101-2002', matricula:460, turmas:12, professores:32, freq:93.5, notas:95, sige:'ok' },
    { id:'e3', nome:'EEM Gov. Virgílio Távora',         tipo:'EEM',   municipio:'Caucaia',     diretor:'Marta Regina Souza',   fone:'(85)3466-1100', matricula:650, turmas:18, professores:38, freq:86.7, notas:72, sige:'pendente' },
    { id:'e4', nome:'EEMTI 13 de Maio',                tipo:'EEMTI', municipio:'Maracanaú',   diretor:'Carlos Eduardo Ferreira',fone:'(85)3371-0010',matricula:710, turmas:20, professores:41, freq:88.4, notas:68, sige:'pendente' },
    { id:'e5', nome:'EEM Dom Hélder Câmara',            tipo:'EEM',   municipio:'Sobral',      diretor:'Beatriz Farias',       fone:'(88)3677-2200', matricula:540, turmas:15, professores:29, freq:77.2, notas:55, sige:'inconsistente' },
    { id:'e6', nome:'EEEP Frei Moacyr de Metz',        tipo:'EEEP',  municipio:'Crato',       diretor:'Paulo Henrique Santos',fone:'(88)3521-0099', matricula:380, turmas:10, professores:24, freq:94.1, notas:98, sige:'ok' },
    { id:'e7', nome:'EEM Dep. Manoel Mota',            tipo:'EEM',   municipio:'Iguatu',      diretor:'Lúcia Rocha Silva',    fone:'(88)3581-1122', matricula:490, turmas:14, professores:27, freq:82.3, notas:61, sige:'ok' },
    { id:'e8', nome:'EEMTI Maria das Dores',           tipo:'EEMTI', municipio:'Juazeiro do Norte', diretor:'Raimundo Costa Lima', fone:'(88)3511-0044', matricula:600, turmas:17, professores:35, freq:90.0, notas:80, sige:'ok' },
  ],

  fluxo: [
    { id:'f1', escola:'e1', bim:1, matricula:820,  presentes:748, infreq:32,  abandonos:5,  freq:91.2, pdmRisco:18 },
    { id:'f2', escola:'e2', bim:1, matricula:460,  presentes:430, infreq:8,   abandonos:1,  freq:93.5, pdmRisco:4  },
    { id:'f3', escola:'e3', bim:1, matricula:650,  presentes:564, infreq:52,  abandonos:9,  freq:86.7, pdmRisco:28 },
    { id:'f4', escola:'e4', bim:1, matricula:710,  presentes:628, infreq:45,  abandonos:7,  freq:88.4, pdmRisco:22 },
    { id:'f5', escola:'e5', bim:1, matricula:540,  presentes:417, infreq:81,  abandonos:14, freq:77.2, pdmRisco:45 },
    { id:'f6', escola:'e6', bim:1, matricula:380,  presentes:357, infreq:5,   abandonos:0,  freq:94.1, pdmRisco:2  },
    { id:'f7', escola:'e7', bim:1, matricula:490,  presentes:403, infreq:38,  abandonos:6,  freq:82.3, pdmRisco:10 },
    { id:'f8', escola:'e8', bim:1, matricula:600,  presentes:540, infreq:28,  abandonos:4,  freq:90.0, pdmRisco:5  },
    // bimestre 2 (parcial)
    { id:'f9',  escola:'e1', bim:2, matricula:815, presentes:742, infreq:28,  abandonos:5,  freq:91.0, pdmRisco:14 },
    { id:'f10', escola:'e3', bim:2, matricula:641, presentes:556, infreq:48,  abandonos:9,  freq:86.7, pdmRisco:25 },
    { id:'f11', escola:'e5', bim:2, matricula:526, presentes:400, infreq:74,  abandonos:14, freq:76.0, pdmRisco:50 },
  ],

  // Evolução frequência mensal (média rede)
  freqMensal: [
    { mes:'Fev', val:87.8 }, { mes:'Mar', val:89.4 }, { mes:'Abr', val:88.2 },
    { mes:'Mai', val:90.1 }, { mes:'Jun', val:91.3 }, { mes:'Jul', val:null },
  ],

  notas: [
    { id:'n1', escola:'e1', turmas:24, comp:12, lancadas:250, pendentes:38,  prazo:'2026-06-15', pct:87 },
    { id:'n2', escola:'e2', turmas:12, comp:12, lancadas:137, pendentes:7,   prazo:'2026-06-15', pct:95 },
    { id:'n3', escola:'e3', turmas:18, comp:12, lancadas:156, pendentes:60,  prazo:'2026-06-15', pct:72 },
    { id:'n4', escola:'e4', turmas:20, comp:12, lancadas:163, pendentes:77,  prazo:'2026-06-15', pct:68 },
    { id:'n5', escola:'e5', turmas:15, comp:12, lancadas:99,  pendentes:81,  prazo:'2026-06-15', pct:55 },
    { id:'n6', escola:'e6', turmas:10, comp:12, lancadas:118, pendentes:2,   prazo:'2026-06-15', pct:98 },
    { id:'n7', escola:'e7', turmas:14, comp:12, lancadas:102, pendentes:66,  prazo:'2026-06-15', pct:61 },
    { id:'n8', escola:'e8', turmas:17, comp:12, lancadas:163, pendentes:41,  prazo:'2026-06-15', pct:80 },
  ],

  componentes: [
    { comp:'Língua Portuguesa',     area:'Linguagens',  turmas:24, lancadas:22, pendentes:2, pct:92 },
    { comp:'Literatura',            area:'Linguagens',  turmas:24, lancadas:18, pendentes:6, pct:75 },
    { comp:'Inglês',                area:'Linguagens',  turmas:24, lancadas:20, pendentes:4, pct:83 },
    { comp:'Matemática',            area:'Matemática',  turmas:24, lancadas:24, pendentes:0, pct:100},
    { comp:'Física',                area:'Ciências',    turmas:24, lancadas:19, pendentes:5, pct:79 },
    { comp:'Química',               area:'Ciências',    turmas:24, lancadas:17, pendentes:7, pct:71 },
    { comp:'Biologia',              area:'Ciências',    turmas:24, lancadas:21, pendentes:3, pct:88 },
    { comp:'História',              area:'Humanas',     turmas:24, lancadas:23, pendentes:1, pct:96 },
    { comp:'Geografia',             area:'Humanas',     turmas:24, lancadas:22, pendentes:2, pct:92 },
    { comp:'Filosofia',             area:'Humanas',     turmas:24, lancadas:15, pendentes:9, pct:63 },
    { comp:'Sociologia',            area:'Humanas',     turmas:24, lancadas:14, pendentes:10,pct:58 },
    { comp:'Ed. Física',            area:'Linguagens',  turmas:24, lancadas:20, pendentes:4, pct:83 },
  ],

  planoAcao: [
    { id:'p1',  acao:'Recomposição das Aprendizagens — Foco na Aprendizagem', eixo:'pedagogico',     escola:'e5', responsavel:'Coord. Pedagógico',       prazo:'2026-04-30', prog:40,  status:'andamento',  prio:'alta',  obs:'' },
    { id:'p2',  acao:'Formação PPDT — Conselho de Turma Bimestral',           eixo:'pedagogico',     escola:'e3', responsavel:'Coord. PPDT',              prazo:'2026-03-31', prog:15,  status:'atrasada',   prio:'alta',  obs:'Prazo expirado sem realização' },
    { id:'p3',  acao:'Atualização do Censo Escolar no SIGE',                  eixo:'gestao',         escola:'e4', responsavel:'Secretaria Escolar',       prazo:'2026-05-28', prog:60,  status:'andamento',  prio:'alta',  obs:'' },
    { id:'p4',  acao:'Busca Ativa — Contato com famílias infrequentes',       eixo:'permanencia',    escola:'e5', responsavel:'PDT / Assist. Social',     prazo:'2026-04-15', prog:25,  status:'andamento',  prio:'alta',  obs:'' },
    { id:'p5',  acao:'Jornada Pedagógica 2º Semestre',                        eixo:'pedagogico',     escola:'e1', responsavel:'Direção',                  prazo:'2026-07-20', prog:0,   status:'planejada',  prio:'media', obs:'' },
    { id:'p6',  acao:'Implementação do Projeto Ceará Científico',             eixo:'pedagogico',     escola:'e8', responsavel:'PCA Ciências',             prazo:'2026-05-15', prog:80,  status:'andamento',  prio:'media', obs:'' },
    { id:'p7',  acao:'Prestação de contas PDDE',                              eixo:'gestao',         escola:'e7', responsavel:'Diretor Financeiro',       prazo:'2026-04-30', prog:100, status:'concluida',  prio:'alta',  obs:'Concluída em 22/04' },
    { id:'p8',  acao:'Credenciamento CEE — Renovação',                        eixo:'gestao',         escola:'e2', responsavel:'Secretaria',               prazo:'2026-09-01', prog:20,  status:'planejada',  prio:'media', obs:'' },
    { id:'p9',  acao:'Khan Academy — Matemática todos os 1ºs anos',           eixo:'pedagogico',     escola:'e4', responsavel:'PCA Matemática',           prazo:'2026-03-15', prog:100, status:'concluida',  prio:'media', obs:'' },
    { id:'p10', acao:'Reforma de sanitários',                                  eixo:'infraestrutura', escola:'e3', responsavel:'CREDE / Gestão',           prazo:'2026-06-01', prog:35,  status:'atrasada',   prio:'alta',  obs:'Aguardando liberação financeira' },
    { id:'p11', acao:'Implementar NTPPS em todas as turmas do noturno',        eixo:'pedagogico',     escola:'e7', responsavel:'Coord. Pedagógico',        prazo:'2026-04-30', prog:55,  status:'andamento',  prio:'media', obs:'' },
    { id:'p12', acao:'Atualizar Projeto Político-Pedagógico (PPP)',            eixo:'gestao',         escola:'e1', responsavel:'Equipe Gestora',           prazo:'2026-05-31', prog:70,  status:'andamento',  prio:'media', obs:'' },
  ],

  visitas: [
    { id:'v1', escola:'e5', data:'2026-03-10', tipo:'tecnica',      pauta:'Análise de frequência e busca ativa — absenteísmo acima de 20%', participantes:'Superintendente, Diretora Beatriz, Assist. Social', encam:'1. Iniciar busca ativa até 20/03\n2. PDTs devem ligar para famílias esta semana\n3. Reunião de pais agendada p/ 25/03', proxima:'2026-04-14', obs:'Escola em situação crítica de frequência.', status:'realizada' },
    { id:'v2', escola:'e3', data:'2026-03-12', tipo:'monitoramento', pauta:'Revisão do Plano de Ação e situação de notas no SIGE',          participantes:'Superintendente, Coord. Marta',                     encam:'1. Prazo para notas: 20/03\n2. PDTs reforçam conselho de turma\n3. Secretaria regulariza SIGE até 31/03', proxima:'2026-04-16', obs:'', status:'realizada' },
    { id:'v3', escola:'e4', data:'2026-03-20', tipo:'smar',          pauta:'SMAR 1º Bimestre — análise de indicadores e correção de rotas',  participantes:'Equipe Supervisão, Gestão escolar completa',        encam:'1. Correção de rotas para abril\n2. Intensificar Khan Academy\n3. Revisar horário das turmas em risco', proxima:'2026-05-05', obs:'Bimestre encerrado com bons avanços em Matemática.', status:'realizada' },
    { id:'v4', escola:'e7', data:'2026-04-08', tipo:'tecnica',       pauta:'Acompanhamento Pé-de-Meia e frequência do noturno',             participantes:'Superintendente, Diretora Lúcia',                   encam:'Envio de dados MEC até dia 5 do mês', proxima:'2026-05-12', obs:'', status:'agendada' },
    { id:'v5', escola:'e1', data:'2026-04-10', tipo:'tecnica',       pauta:'Avaliação diagnóstica e projetos PPDT',                          participantes:'Superintendente, Coord. Pedagógico',                encam:'Definir calendário de Conselhos de Turma', proxima:'2026-05-15', obs:'', status:'agendada' },
    { id:'v6', escola:'e6', data:'2026-04-22', tipo:'monitoramento', pauta:'Estágio curricular e Ceará Científico',                          participantes:'Superintendente, Coord. Estágio',                   encam:'Confirmar concedentes de estágio', proxima:'2026-06-03', obs:'', status:'agendada' },
  ],

  projetos: [
    { id:'pr1',  nome:'Ceará Científico 2026',           cat:'cientifico', escola:'e8', coord:'Profa. Clara Mota',     part:120, periodo:'Mar — Jun/2026', desc:'Feira com etapas escolar, regional e estadual. Inscrições abertas para projetos em todas as áreas.', status:'andamento' },
    { id:'pr2',  nome:'ENEM: Chego Junto, Chego Bem!',   cat:'enem',       escola:'e1', coord:'Coord. C3',             part:250, periodo:'Ano Letivo 2026', desc:'Programa com 7 etapas: Documentação, Isenção, Inscrição, Motivação, Preparação, #Enemvou2dias e Ingresso.', status:'andamento' },
    { id:'pr3',  nome:'Festival Alunos que Inspiram',     cat:'cultural',   escola:'e2', coord:'Profa. Renata Cruz',    part:180, periodo:'Mar — Mai/2026', desc:'Festival com 6 categorias artísticas: dança, teatro, música, artes visuais, literatura e vídeo.', status:'andamento' },
    { id:'pr4',  nome:'Maratona Cearense de Matemática', cat:'cientifico', escola:'e6', coord:'Prof. Marcos Silva',    part:90,  periodo:'Abr — Set/2026', desc:'MCEM com etapas escolar, regional e estadual para fortalecer o ensino de matemática.', status:'planejado' },
    { id:'pr5',  nome:'Clube de Robótica / STEAM',        cat:'cientifico', escola:'e4', coord:'Prof. AGI Tiago',       part:45,  periodo:'Mar — Nov/2026', desc:'Clube com Arduino, cultura maker e integração com Ciências e Matemática.', status:'andamento' },
    { id:'pr6',  nome:'Selo Escola Sustentável',          cat:'ambiental',  escola:'e8', coord:'Coord. Ambiental',      part:350, periodo:'Ano Letivo 2026', desc:'Ações nos eixos Currículo, Gestão, Espaço Físico e Educomunicação.', status:'andamento' },
    { id:'pr7',  nome:'Sou + Terceirão',                  cat:'enem',       escola:'e1', coord:'Coord. C3',             part:80,  periodo:'Mar — Nov/2026', desc:'Mapas Mentais e intensificação de estudos para o ENEM — 3ª série.', status:'andamento' },
    { id:'pr8',  nome:'Projeto Social EEEP — 60h',        cat:'estagio',    escola:'e2', coord:'Coord. Estágio',        part:120, periodo:'Ago — Nov/2026', desc:'Projeto Social obrigatório de 60 horas para EEEPs com ações comunitárias.', status:'planejado' },
    { id:'pr9',  nome:'Conselho de Turma Bimestral PPDT', cat:'ppdt',       escola:'e3', coord:'PDTs Responsáveis',     part:650, periodo:'Bimestral',       desc:'4 Conselhos anuais com avaliação qualitativa e desenvolvimento de competências socioemocionais.', status:'andamento' },
    { id:'pr10', nome:'Junho Ambiental e Festa das Árvores', cat:'ambiental', escola:'e7', coord:'Profa. Iane Costa',  part:200, periodo:'Jun/2026',         desc:'Atividades de educação ambiental, plantio de mudas e oficinas de reutilização.', status:'planejado' },
    { id:'pr11', nome:'PreparaITA',                        cat:'enem',       escola:'e1', coord:'Coord. ENEM',           part:22,  periodo:'Mar — Nov/2026', desc:'Preparação intensiva para ITA e vestibulares de alta concorrência.', status:'andamento' },
    { id:'pr12', nome:'Projeto Yburana — Corpo e Território', cat:'cultural', escola:'e7', coord:'Profa. Iane Costa',  part:60,  periodo:'Mar — Dez/2026', desc:'Educação indígena com práticas de corpo-território e bem-viver.', status:'andamento' },
  ],

  buscaAtiva: [
    { escola:'e5', turma:'2ºA', motivo:'Trabalho informal',       faltas:18, contato:'Realizado', visita:'Pendente',  resp:'PDT Ana',      sit:'acompanhamento' },
    { escola:'e5', turma:'1ºC', motivo:'Dificuldade transporte',  faltas:22, contato:'Realizado', visita:'Realizada', resp:'Assist. Social',sit:'reintegrado'    },
    { escola:'e3', turma:'3ºB', motivo:'Gravidez',                faltas:15, contato:'Realizado', visita:'Realizada', resp:'Psicólogo',     sit:'acompanhamento' },
    { escola:'e4', turma:'1ºA', motivo:'Conflito familiar',       faltas:20, contato:'Pendente',  visita:'Pendente',  resp:'PDT Carlos',   sit:'sem_contato'    },
    { escola:'e7', turma:'2ºD', motivo:'Doença / saúde',          faltas:12, contato:'Realizado', visita:'Realizada', resp:'Assist. Social',sit:'reintegrado'    },
    { escola:'e5', turma:'3ºA', motivo:'Desinteresse / fracasso', faltas:25, contato:'Realizado', visita:'Pendente',  resp:'PDT Marcos',   sit:'acompanhamento' },
    { escola:'e3', turma:'1ºD', motivo:'Mudança de endereço',     faltas:30, contato:'Pendente',  visita:'Pendente',  resp:'Secretaria',   sit:'sem_contato'    },
    { escola:'e4', turma:'2ºB', motivo:'Problemas financeiros',   faltas:17, contato:'Realizado', visita:'Realizada', resp:'Assist. Social',sit:'acompanhamento' },
  ],

  pedeMeia: [
    { escola:'e1', benef:320, freqM:91.2, risco:18,  bloq:2,  envio:'Atualizado', dataEnvio:'05/03/2026' },
    { escola:'e2', benef:180, freqM:93.5, risco:4,   bloq:0,  envio:'Atualizado', dataEnvio:'05/03/2026' },
    { escola:'e3', benef:260, freqM:86.7, risco:28,  bloq:7,  envio:'Atualizado', dataEnvio:'05/03/2026' },
    { escola:'e4', benef:285, freqM:88.4, risco:22,  bloq:5,  envio:'Pendente',   dataEnvio:'—'          },
    { escola:'e5', benef:210, freqM:77.2, risco:45,  bloq:14, envio:'Pendente',   dataEnvio:'—'          },
    { escola:'e6', benef:148, freqM:94.1, risco:2,   bloq:0,  envio:'Atualizado', dataEnvio:'05/03/2026' },
    { escola:'e7', benef:195, freqM:82.3, risco:10,  bloq:2,  envio:'Atualizado', dataEnvio:'05/03/2026' },
    { escola:'e8', benef:244, freqM:90.0, risco:5,   bloq:0,  envio:'Atualizado', dataEnvio:'05/03/2026' },
  ],

  recomposicao: [
    { escola:'e1', focoAp:'Implantado', khan:'Ativo', abaixoNivel:112, intervencoes:8,  prog:72 },
    { escola:'e2', focoAp:'Implantado', khan:'Ativo', abaixoNivel:48,  intervencoes:5,  prog:85 },
    { escola:'e3', focoAp:'Parcial',    khan:'Ativo', abaixoNivel:195, intervencoes:4,  prog:42 },
    { escola:'e4', focoAp:'Implantado', khan:'Ativo', abaixoNivel:178, intervencoes:7,  prog:58 },
    { escola:'e5', focoAp:'Não Iniciado', khan:'Inativo', abaixoNivel:280, intervencoes:2, prog:18 },
    { escola:'e6', focoAp:'Implantado', khan:'Ativo', abaixoNivel:35,  intervencoes:6,  prog:90 },
    { escola:'e7', focoAp:'Parcial',    khan:'Ativo', abaixoNivel:130, intervencoes:3,  prog:50 },
    { escola:'e8', focoAp:'Implantado', khan:'Ativo', abaixoNivel:90,  intervencoes:7,  prog:68 },
  ],

  eventos: [
    { id:'ev1',  titulo:'Envio Dados Pé-de-Meia ao MEC',         data:'2026-04-05', tipo:'prazo',    desc:'Envio mensal dos dados de frequência para garantia do benefício.' },
    { id:'ev2',  titulo:'Encerramento 1º Bimestre — Notas',      data:'2026-04-10', tipo:'prazo',    desc:'Prazo final para lançamento de frequência e notas no SIGE Escola.' },
    { id:'ev3',  titulo:'Conselho de Turma — 1º Bimestre',       data:'2026-04-14', tipo:'reuniao',  desc:'Convocatória emitida 8 dias antes. Presença obrigatória dos PDTs.' },
    { id:'ev4',  titulo:'Visita Técnica — EEM Dom Hélder',       data:'2026-04-14', tipo:'visita',   desc:'Visita de monitoramento preventivo — frequência e busca ativa.' },
    { id:'ev5',  titulo:'SMAR — Monitoramento 1º Bimestre',      data:'2026-04-22', tipo:'avaliacao',desc:'Rodada SMAR do Circuito de Gestão Cearense. Análise de evidências.' },
    { id:'ev6',  titulo:'Semana da Busca Ativa Escolar',         data:'2026-05-05', tipo:'evento',   desc:'Semana estadual de busca ativa. Dia D na última sexta-feira.' },
    { id:'ev7',  titulo:'Congelamento Censo Escolar — Fase 1',   data:'2026-05-28', tipo:'prazo',    desc:'Congelamento dos dados de Matrícula Inicial no Educacenso/INEP.' },
    { id:'ev8',  titulo:'Encerramento 2º Bimestre — Notas',      data:'2026-06-15', tipo:'prazo',    desc:'Prazo final para lançamento de notas do 2º bimestre no SIGE.' },
    { id:'ev9',  titulo:'Conselho de Turma — 2º Bimestre',       data:'2026-06-22', tipo:'reuniao',  desc:'Segundo conselho bimestral com avaliação socioemocional.' },
    { id:'ev10', titulo:'Jornada Pedagógica — 2º Semestre',      data:'2026-07-20', tipo:'formacao', desc:'Planejamento pedagógico 2º semestre — alinhamento de metas.' },
    { id:'ev11', titulo:'Início Estágio em Campo — EEEPs',       data:'2026-08-03', tipo:'prazo',    desc:'Início preferencial das atividades de estágio em campo — eixo geral.' },
    { id:'ev12', titulo:'Retificação Censo Escolar',              data:'2026-09-15', tipo:'prazo',    desc:'Período de retificação: 2ª quinzena set — 1ª quinzena out.' },
    { id:'ev13', titulo:'Parada Reflexiva — Final Ano Letivo',   data:'2026-11-30', tipo:'formacao', desc:'Etapa final do Circuito de Gestão — balanço e subsídios para 2027.' },
  ],

  alertas: [
    { tipo:'danger',  titulo:'Frequência Crítica',       desc:'EEM Dom Hélder Câmara — 77,2%. Busca Ativa urgente.',          tempo:'Agora'        },
    { tipo:'danger',  titulo:'Notas Críticas',           desc:'EEM Dom Hélder — apenas 55% das notas lançadas no SIGE.',      tempo:'2h atrás'     },
    { tipo:'warning', titulo:'Prazo Censo Escolar',      desc:'Congelamento em 28/maio — EEM Dom Hélder e EEM Gov. Virgílio pendentes.',  tempo:'5h atrás'     },
    { tipo:'warning', titulo:'Ação Atrasada',            desc:'Plano p2: Formação PPDT — prazo expirou em 31/03.',            tempo:'1 dia atrás'  },
    { tipo:'warning', titulo:'Pé-de-Meia em Risco',     desc:'134 estudantes com frequência entre 75–80%.',                  tempo:'1 dia atrás'  },
    { tipo:'info',    titulo:'Visita Agendada',          desc:'Visita técnica em EEM Dep. Manoel Mota — 08/04.',              tempo:'2 dias atrás' },
    { tipo:'info',    titulo:'Conselho de Turma',        desc:'Conselho bimestral previsto para 14/04 — emitir convocatórias.',tempo:'2 dias atrás'},
    { tipo:'warning', titulo:'Notas Parciais (68%)',     desc:'EEMTI 13 de Maio — 68% das notas lançadas.',                  tempo:'3 dias atrás' },
    { tipo:'danger',  titulo:'Recomposição Não Iniciada',desc:'EEM Dom Hélder — Foco na Aprendizagem não iniciado.',         tempo:'4 dias atrás' },
    { tipo:'info',    titulo:'Ceará Científico',         desc:'Etapa escolar deve ocorrer até o final de maio.',              tempo:'4 dias atrás' },
  ],

  smarChecklist: [
    'Analisar frequência e identificar escolas abaixo de 80%',
    'Verificar % de notas lançadas no SIGE Escola',
    'Revisar metas e progresso do Plano de Ação',
    'Mapear ações atrasadas e acionar responsáveis',
    'Avaliar situação dos beneficiários Pé-de-Meia',
    'Verificar andamento dos projetos extraclasse',
    'Analisar dados de busca ativa escolar',
    'Checar atualização do Censo Escolar no SIGE',
    'Monitorar Recomposição das Aprendizagens',
    'Definir pauta e agenda das próximas visitas técnicas',
    'Registrar encaminhamentos na plataforma',
  ],
};
