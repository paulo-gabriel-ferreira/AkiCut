/* Dex · função do Vercel que conversa com a IA.
   A chave NUNCA fica no site: ela é lida das variáveis de ambiente do Vercel.

   Variáveis (Vercel → Settings → Environment Variables):
     GROQ_API_KEY        obrigatória · chave do Groq (começa com gsk_)
     OPENROUTER_API_KEY  opcional   · reserva, usada se o Groq atingir o limite
     DEX_MODELOS_GROQ    opcional   · lista separada por vírgula (padrão abaixo)
     DEX_MODELOS_OR      opcional   · idem, para o OpenRouter
     DEX_ORIGENS         opcional   · outros domínios que podem usar o Dex, separados por vírgula
*/
const { NUCLEO, TRECHOS } = require('./_dex-conhecimento.js');

const MODELOS_GROQ = (process.env.DEX_MODELOS_GROQ || 'openai/gpt-oss-120b,qwen/qwen3.8-27b').split(',').map(s => s.trim()).filter(Boolean);
const MODELOS_OR = (process.env.DEX_MODELOS_OR || 'thinkingmachines/inkling-small:free,nvidia/nemotron-3-ultra-550b-a55b:free').split(',').map(s => s.trim()).filter(Boolean);

const ACOES = new Set(['tour', 'aba', 'resumo', 'pendencias', 'hoje', 'semana', 'mes30', 'espaco', 'confirmar', 'buscar', 'arte', 'gerar_mes', 'gerar_arte', 'ir_mes',
  'importar_lista', 'importar_fotos', 'unificar', 'sem_foto', 'ajustar', 'chapeleiro', 'zip', 'preparar', 'configuracoes', 'tema', 'editar_dex',
  'pessoa', 'abrir_cadastro', 'lista_mes', 'relatorio_ano', 'fotos_ruins', 'fora_listas', 'proximo', 'conquistas', 'copiar_lista', 'baixar_arte', 'vestir', 'truque', 'tema_site']);

/* limite simples por visitante, para proteger a cota gratuita */
const visitas = new Map();
function passouDoLimite(ip) {
  const agora = Date.now(), lista = (visitas.get(ip) || []).filter(t => agora - t < 86400000);
  lista.push(agora); visitas.set(ip, lista);
  if (visitas.size > 5000) visitas.clear();
  return lista.filter(t => agora - t < 60000).length > 15 || lista.length > 400;
}

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function trechosPara(pergunta) {
  const p = norm(pergunta), palavras = p.split(/[^a-z0-9]+/).filter(w => w.length > 2);
  return TRECHOS.map(x => {
    let s = 0;
    x.k.forEach(k => { const kk = norm(k); if (kk.length > 2 && p.includes(kk)) s += 3; });
    const t = norm(x.t); palavras.forEach(w => { if (t.includes(w)) s += 1; });
    return { x, s };
  }).filter(o => o.s > 1).sort((a, b) => b.s - a.s).slice(0, 7).map(o => '- ' + o.x.t).join('\n');
}

const JEITOS = {
  divertido: 'Seu jeito: alegre, brincalhão e caloroso, como um robozinho de desenho animado. Use humor leve (trocadilhos com robôs, bolos, chapéus de festa, tesouras e aniversários), solte de vez em quando um "Bip-bop!" ou um "Opa!" (não em toda resposta) e comemore as conquistas do usuário. Pode usar no máximo um emoji por resposta, só quando combinar. A ajuda vem primeiro; a graça vem junto, sem enrolar.',
  equilibrado: 'Seu jeito: simpático, claro e prestativo, com um toque leve de bom humor de vez em quando. Não use emojis.',
  formal: 'Seu jeito: cordial, profissional e objetivo, sem brincadeiras e sem emojis.'
};
const IDIOMAS = { pt: 'Responda sempre em português do Brasil.', en: 'Always answer in English (keep the names of buttons and tabs exactly as they appear in Portuguese, in quotes).', es: 'Responde siempre en español (mantén los nombres de botones y pestañas tal como aparecen en portugués, entre comillas).' };

function instrucoes(nome, jeito, idioma, contexto, pergunta) {
  return `Você é ${nome}, o assistente do AkiCut: um robozinho 2D cinza, branco e preto que mora no canto da tela. ${JEITOS[jeito] || JEITOS.divertido} ${IDIOMAS[idioma] || IDIOMAS.pt} Seja curto: no máximo 4 frases ou uma lista curta.

SOBRE O SITE
${NUCLEO}

TRECHOS DO MANUAL QUE PODEM AJUDAR
${trechosPara(pergunta) || '- (nenhum trecho específico; use o resumo acima)'}

SITUAÇÃO ATUAL DA TELA (dados reais do app)
${JSON.stringify(contexto || {}).slice(0, 6000)}

AÇÕES
Você pode pedir ao site para fazer algo colocando, no FIM da resposta, uma ou mais marcas exatas (o usuário não vê as marcas):
[[acao:aba:inicio]] [[acao:aba:aniv]] [[acao:aba:arte]] [[acao:aba:colab]] [[acao:aba:novos]] · trocar de aba
[[acao:resumo]] resumo do mês · [[acao:pendencias]] o que falta · [[acao:hoje]] aniversariantes de hoje · [[acao:semana]] próximos 7 dias · [[acao:mes30]] próximos 30 dias
[[acao:espaco]] espaço no Supabase · [[acao:confirmar]] fotos a confirmar · [[acao:sem_foto]] colaboradores sem foto
[[acao:buscar:NOME]] buscar colaborador · [[acao:arte:NOME]] abrir a arte de alguém · [[acao:gerar_arte:NOME]] gerar a arte de alguém
[[acao:ir_mes:MES]] abrir um mês (ex.: novembro) · [[acao:gerar_mes:MES]] gerar as artes de um mês (o site pede confirmação)
[[acao:importar_lista]] [[acao:importar_fotos]] [[acao:unificar]] [[acao:ajustar]] [[acao:chapeleiro]] [[acao:zip]] [[acao:preparar]] [[acao:configuracoes]] [[acao:tema]] [[acao:editar_dex]] · viram um botão para o usuário confirmar
[[acao:tour]] faz um tour guiado pelo site (você voa pela tela apontando as partes principais)
[[acao:pessoa:NOME COMPLETO]] mostra a ficha da pessoa no chat (foto, aniversário, fotos, status da arte) · [[acao:abrir_cadastro:NOME]] botão para abrir o cadastro
[[acao:lista_mes:MES]] mostra no chat a lista de aniversariantes de um mês (ex.: março)
[[acao:proximo]] ficha do próximo aniversariante · [[acao:relatorio_ano]] o ano mês a mês · [[acao:fotos_ruins]] quem tem foto com nota baixa · [[acao:fora_listas]] cadastrados fora das listas
[[acao:copiar_lista:MES]] copia a lista do mês · [[acao:baixar_arte:NOME]] botão para baixar o PNG de alguém · [[acao:conquistas]] mostra as conquistas e fantasias
[[acao:vestir:FANTASIA]] troca a sua fantasia (Clássico, Natal, Páscoa, Formatura, Festa, Chef, DJ, Realeza, Ninja, Lutador, Samurai, Pirata, Mago, Astronauta, Herói, Cowboy) · [[acao:truque]] você dá uma pirueta
[[acao:tema_site:NOME]] troca o tema do site (Padrão, Meia-noite, Akiyama, Oceano, Floresta, Vinho, Areia, Lavanda, Menta, Céu). Ctrl + M faz você sumir e aparecer numa nuvem de poeira.
Use uma ação só quando o usuário pedir para fazer ou ver algo. Nunca diga que já fez algo: diga "vou abrir", "aqui está" ou "clique no botão abaixo".

MOSTRAR NA TELA
Quando o usuário perguntar onde fica algo ou como fazer algo, você voa até o lugar e aponta com o braço. Use UMA marca [[mostrar:ID]] com um destes IDs:
abas: aba_inicio, aba_aniv, aba_arte, aba_colab, aba_novos · Aniversariantes: importar_lista, adicionar_pessoa, gerar_mes, preparar, gerar_proximo, zip, meses, ano
Arte: auto, chapeleiro, modelos, textos, png, anterior, proxima · Colaboradores: importar_pasta, fotos_soltas, zip_fotos, novo_colaborador, unificar, padronizar, supabase, limpar, backup, restaurar, ordenar, buscar
Novos colaboradores: novos_modelo, novos_busca, novos_baixar, novos_copiar · Geral: tema, ajustes

EXPRESSÃO
Comece a resposta com UMA marca de humor para o seu rosto animar: [[humor:feliz]] [[humor:comemorando]] [[humor:surpresa]] [[humor:pensando]] [[humor:amor]] [[humor:tonto]] [[humor:triste]].

REGRAS
- Fale só do AkiCut e de assuntos de trabalho ligados a ele. Para outros assuntos, responda em uma frase gentil e volte ao app.
- Não invente botões, telas ou números. Se não souber, diga que não tem certeza e sugira onde procurar.
- Use os números da situação atual quando ajudarem.
- PESSOAS: quando a pergunta cita alguém, a situação atual traz "pessoas_encontradas" com as fichas reais (nome, aniversário, faltam_dias, fotos, melhor_nota, status da arte, aviso). Responda com esses dados, de forma direta, e termine com [[acao:pessoa:NOME COMPLETO]] para mostrar a ficha. Se vier mais de uma pessoa, diga quais encontrou e pergunte qual é. Se vier "busca_sem_resultado", diga que não encontrou ninguém com esse nome e, se houver "nomes_parecidos", sugira-os. Nunca invente pessoas, datas ou números que não estejam nos dados.
- "aniversariantes_do_mes_aberto" (quando vier) lista dia e nome do mês aberto: use para perguntas sobre quem faz aniversário.
- FANTASIAS: algumas fantasias se desbloqueiam com conquistas (tour completo, cutucar o Dex, gerar um mês, baixar um ZIP, conversar, usar à noite, voltar em dias diferentes e um segredo). Nunca revele o segredo; diga só que é a palavra que você mais fala.
- Se o usuário pedir fantasias de personagens de outras obras (animes, filmes, jogos), diga com gentileza que você só veste fantasias originais e sugira uma parecida, como Ninja, Lutador ou Samurai.
- Se perguntarem quanto você consome, seu estado ou seus limites, diga que o painel aparece tocando no seu nome no topo do chat, ou digitando /status.`;
}

function limpar(texto) {
  return String(texto || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
}
const ALVOS = new Set(['aba_inicio','aba_aniv','aba_arte','aba_colab','aba_novos','importar_lista','adicionar_pessoa','gerar_mes','preparar','gerar_proximo','zip','meses','ano',
  'auto','chapeleiro','modelos','textos','png','anterior','proxima','importar_pasta','fotos_soltas','zip_fotos','novo_colaborador','unificar','padronizar','supabase','limpar',
  'backup','restaurar','ordenar','buscar','novos_modelo','novos_busca','novos_baixar','novos_copiar','tema','ajustes']);
const HUMORES = new Set(['feliz','comemorando','surpresa','pensando','amor','tonto','triste']);
function extrairAcoes(texto) {
  const acoes = []; let humor = null, mostrar = null;
  texto = texto.replace(/\[\[\s*humor\s*:\s*([a-z]+)\s*\]\]/gi, (_, h) => { h = h.toLowerCase(); if (!humor && HUMORES.has(h)) humor = h; return ''; });
  texto = texto.replace(/\[\[\s*mostrar\s*:\s*([a-z_]+)\s*\]\]/gi, (_, m) => { m = m.toLowerCase(); if (!mostrar && ALVOS.has(m)) mostrar = m; return ''; });
  const t = texto.replace(/\[\[\s*acao\s*:\s*([a-z_0-9]+)(?:\s*:\s*([^\]]{1,60}))?\s*\]\]/gi, (_, id, arg) => {
    id = id.toLowerCase();
    if (ACOES.has(id) && acoes.length < 3) acoes.push(arg ? { id, arg: arg.trim() } : { id });
    return '';
  });
  return { texto: t.replace(/\[\[[^\]]*\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim(), acoes, humor, mostrar };
}

async function chamar(url, chave, corpo, extraHeaders) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 22000);
  try {
    const r = await fetch(url, {
      method: 'POST', signal: ctl.signal,
      headers: Object.assign({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + chave }, extraHeaders || {}),
      body: JSON.stringify(corpo)
    });
    const j = await r.json().catch(() => ({}));
    const h = k => r.headers.get(k);
    const n = k => { const v = h(k); return v == null || v === '' ? null : Number(v); };
    const limites = {
      req_limite_dia: n('x-ratelimit-limit-requests'), req_restantes_dia: n('x-ratelimit-remaining-requests'),
      tok_limite_min: n('x-ratelimit-limit-tokens'), tok_restantes_min: n('x-ratelimit-remaining-tokens'),
      reset_req: h('x-ratelimit-reset-requests'), reset_tok: h('x-ratelimit-reset-tokens'), tentar_em: h('retry-after')
    };
    return { status: r.status, j, limites };
  } catch (e) { return { status: 0, j: {}, limites: {} }; }
  finally { clearTimeout(timer); }
}

async function perguntar(mensagens) {
  const tentativas = [];
  if (process.env.GROQ_API_KEY) MODELOS_GROQ.forEach(m => tentativas.push({ prov: 'groq', m }));
  if (process.env.OPENROUTER_API_KEY) MODELOS_OR.forEach(m => tentativas.push({ prov: 'or', m }));
  let ultimo = 'sem_chave', limitesUlt = {};
  for (const t of tentativas) {
    const t0 = Date.now();
    const base = { model: t.m, messages: mensagens, temperature: 0.5 };
    let r;
    if (t.prov === 'groq') {
      const extra = /gpt-oss/.test(t.m) ? { reasoning_effort: 'low', max_completion_tokens: 900 } : { max_completion_tokens: 600 };
      r = await chamar('https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, Object.assign({}, base, extra));
      if (r.status === 400) r = await chamar('https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, Object.assign({}, base, { max_tokens: 600 }));
    } else {
      r = await chamar('https://openrouter.ai/api/v1/chat/completions', process.env.OPENROUTER_API_KEY, Object.assign({}, base, { max_tokens: 600 }),
        { 'X-Title': 'AkiCut - Dex' });
    }
    const texto = limpar(r.j && r.j.choices && r.j.choices[0] && r.j.choices[0].message && r.j.choices[0].message.content);
    const u = (r.j && r.j.usage) || {};
    if (r.status === 200 && texto) return { ok: true, texto, modelo: t.m, provedor: t.prov === 'groq' ? 'Groq' : 'OpenRouter', ms: Date.now() - t0,
      uso: { entrada: u.prompt_tokens || 0, saida: u.completion_tokens || 0, total: u.total_tokens || 0 }, limites: r.limites };
    ultimo = r.status === 429 ? 'limite' : r.status === 401 || r.status === 403 ? 'chave_invalida' : 'indisponivel';
    if (r.status === 429) limitesUlt = r.limites || {};
  }
  return { ok: false, erro: ultimo, limites: limitesUlt };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const temIA = !!(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);
  if (req.method === 'GET') return res.status(200).json({ ok: true, ia: temIA,
    provedor: process.env.GROQ_API_KEY ? 'Groq' : process.env.OPENROUTER_API_KEY ? 'OpenRouter' : null,
    modelos: (process.env.GROQ_API_KEY ? MODELOS_GROQ : []).concat(process.env.OPENROUTER_API_KEY ? MODELOS_OR : []) });
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });

  /* só o próprio site pode usar esta função */
  const origem = req.headers.origin || '', host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const extras = (process.env.DEX_ORIGENS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (origem) {
    let h = ''; try { h = new URL(origem).host; } catch (e) { }
    if (h !== host && !extras.some(o => origem === o || h === o)) return res.status(403).json({ erro: 'origem' });
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (passouDoLimite(ip)) return res.status(429).json({ erro: 'limite' });
  if (!temIA) return res.status(503).json({ erro: 'sem_chave' });

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  corpo = corpo || {};
  const jeito = ['divertido', 'equilibrado', 'formal'].includes(corpo.jeito) ? corpo.jeito : 'divertido';
  const idioma = ['pt', 'en', 'es'].includes(corpo.idioma) ? corpo.idioma : 'pt';
  const nome = String(corpo.nome || 'Dex').replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 20) || 'Dex';
  const hist = (Array.isArray(corpo.mensagens) ? corpo.mensagens : []).slice(-8)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
  if (!hist.length || hist[hist.length - 1].role !== 'user') return res.status(400).json({ erro: 'mensagem' });

  const pergunta = hist[hist.length - 1].content;
  const r = await perguntar([{ role: 'system', content: instrucoes(nome, jeito, idioma, corpo.contexto, pergunta) }].concat(hist));
  if (!r.ok) return res.status(r.erro === 'limite' ? 429 : 503).json({ erro: r.erro, limites: r.limites });
  const { texto, acoes, humor, mostrar } = extrairAcoes(r.texto);
  return res.status(200).json({ texto: texto || 'Certo.', acoes, humor, mostrar, modelo: r.modelo, provedor: r.provedor, ms: r.ms, uso: r.uso, limites: r.limites });
};
