/* =============================================================================
   DEX · dex.js  (o visual fica em dex.css; as molas vêm de assets/motion.js)

    1. Utilidades
    2. Configuração
    3. Desenho do personagem (SVG)
    4. Montagem na tela
    5. Humor, truques e olhar
    6. Balão de fala
    7. Interação (mouse, chat, mensagens)
    8. Guia na tela e tour
    9. Chat: cabeçalho, gestos e painel de consumo
   10. Estúdio do Dex (em Ajustes)
   11. Conversa com a IA
   12. Início

   Como o chat funciona:
   - Comandos rápidos (resumo, pendências, hoje, gerar mês, colar lista, /) continuam locais.
   - O resto vai para /api/dex (função do Vercel), com a chave guardada no Vercel.
   - Sem IA (sem internet, limite do dia, arquivo aberto fora do Vercel), o Dex usa as respostas locais.
   ============================================================================= */
(function(){
  'use strict';
  if(window.__dex) return;

  /* =================================================================== 1. UTILIDADES */
  var D=document, H=D.documentElement, W=window;
  var M=W.Mola||{anima:function(){ return null; },sp:function(){ return {duration:1}; },morph:function(){ return Promise.resolve(); },arrastar:function(){},parado:function(){ return true; },contar:function(e,v){ if(e) e.textContent=v; },leve:function(){ return false; },definirLeve:function(){},modoLeve:function(){ return 'auto'; }};
  var chat=D.getElementById('aiChat'), msgs=D.getElementById('aiMessages'), form=D.getElementById('aiForm'), input=D.getElementById('aiInput');
  var LS={ get:function(k,p){ try{ var v=localStorage.getItem(k); return v==null?p:v; }catch(e){ return p; } }, set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }, del:function(k){ try{ localStorage.removeItem(k); }catch(e){} } };
  var SS={ get:function(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }, set:function(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} } };
  function parado(){ return M.parado(); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function el(tag,cls,html){ var e=D.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function esperar(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
  function quadro(){ return new Promise(function(r){ requestAnimationFrame(function(){ r(); }); }); }
  function fmt(n){ return n==null||isNaN(n)?'—':Number(n).toLocaleString('pt-BR'); }
  function mil(n){ n=n||0; return n>=1000?(n/1000).toFixed(n>=10000?0:1).replace('.',',')+' mil':String(n); }
  function seg1(ms){ return (ms/1000).toFixed(1).replace('.',',')+' s'; }
  function num(f){ try{ return f(); }catch(e){ return null; } }
  var IC={x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    esq:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    dir:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    eng:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'};

  /* =================================================================== 2. CONFIGURAÇÃO */
  var PADRAO={nome:'Dex',tam:'m',olhos:'branco',acab:'claro',cab:'nenhum',rosto:'nenhum',corpo:'nenhum',epoca:'sim',
    jeito:'divertido',idioma:'pt',anim:'normal',seguir:'sim',balao:'sim',truques:'sim',lado:'direita',tema:'noite'};
  var CFG=(function(){ var c={}; try{ c=JSON.parse(LS.get('dex-cfg','{}'))||{}; }catch(e){}
    if(c.acess&&!c.cab) c.cab=c.acess==='chapeu'?'festa':c.acess==='antena'?'antena':'nenhum';
    var o={}; for(var k in PADRAO) o[k]=c[k]!=null?c[k]:PADRAO[k]; return o; })();
  var OLHOS={branco:'#F3F8FF',ciano:'#5CE1F0',prata:'#C3C9D3',ambar:'#FFD58A'};
  function salvar(){ LS.set('dex-cfg',JSON.stringify(CFG)); }
  var FANT={cab:[['nenhum','Nenhum'],['antena','Antena'],['festa','Festa'],['natal','Papai Noel'],['coelho','Coelho'],['formatura','Formatura'],['chef','Chef'],['coroa','Coroa'],['fones','Fones']],
    rosto:[['nenhum','Nenhum'],['oculos','Óculos'],['escuros','Óculos escuros'],['bigode','Bigode']],
    corpo:[['nenhum','Nenhuma'],['gravata','Gravata'],['cachecol','Cachecol'],['noel','Roupa de Noel']]};
  var TEMAS=[['Clássico',{cab:'nenhum',rosto:'nenhum',corpo:'nenhum'}],['Natal',{cab:'natal',rosto:'nenhum',corpo:'noel'}],['Páscoa',{cab:'coelho',rosto:'nenhum',corpo:'gravata'}],
    ['Formatura',{cab:'formatura',rosto:'nenhum',corpo:'gravata'}],['Festa',{cab:'festa',rosto:'oculos',corpo:'nenhum'}],['Chef',{cab:'chef',rosto:'bigode',corpo:'cachecol'}],
    ['DJ',{cab:'fones',rosto:'escuros',corpo:'nenhum'}],['Realeza',{cab:'coroa',rosto:'bigode',corpo:'cachecol'}]];
  function temaAtual(){ for(var i=0;i<TEMAS.length;i++){ var t=TEMAS[i][1]; if(t.cab===CFG.cab&&t.rosto===CFG.rosto&&t.corpo===CFG.corpo) return i; } return -1; }
  /* fantasia da época: Natal em dezembro e Páscoa perto do domingo de Páscoa, quando nenhuma fantasia foi escolhida */
  function pascoa(a){ var b=a%19,c=Math.floor(a/100),d=a%100,e=Math.floor(c/4),f=c%4,g=Math.floor((c+8)/25),h=Math.floor((c-g+1)/3),i=(19*b+c-e-h+15)%30,k=Math.floor(d/4),l=d%4,m=(32+2*f+2*k-i-l)%7,n=Math.floor((b+11*i+22*m)/451),mes=Math.floor((i+m-7*n+114)/31),dia=((i+m-7*n+114)%31)+1; return new Date(a,mes-1,dia); }
  function visual(){
    var v={cab:CFG.cab,rosto:CFG.rosto,corpo:CFG.corpo};
    if(CFG.epoca==='sim'&&v.cab==='nenhum'&&v.rosto==='nenhum'&&v.corpo==='nenhum'){
      var hj=new Date(), dd=(pascoa(hj.getFullYear())-hj)/86400000;
      if(hj.getMonth()===11){ v.cab='natal'; v.corpo='noel'; } else if(dd<=12&&dd>=-2){ v.cab='coelho'; v.corpo='gravata'; }
    }
    return v;
  }

  /* =================================================================== 3. DESENHO */
  var uid=0, ALTOS={antena:1,festa:1,natal:1,coelho:1,formatura:1,chef:1,coroa:1,fones:1};
  var TRONCO='M80 90C108 90 121 105 119.5 128C118 152 101 166 80 166C59 166 42 152 40.5 128C39 105 52 90 80 90Z';
  var CAB_ATRAS='<g class="dex-cab dex-cab-antena"><path d="M80 13V2"/><circle cx="80" cy="1" r="4.5"/></g>'+
    '<g class="dex-cab dex-cab-coelho"><g transform="rotate(-16 58 18)"><rect class="dx-pele" x="47" y="-38" width="22" height="58" rx="11"/><rect x="52.5" y="-30" width="11" height="42" rx="5.5" fill="#F2B8C6"/></g>'+
    '<g transform="rotate(16 102 18)"><rect class="dx-pele" x="91" y="-38" width="22" height="58" rx="11"/><rect x="96.5" y="-30" width="11" height="42" rx="5.5" fill="#F2B8C6"/></g></g>';
  var CAB_FRENTE=
    '<g class="dex-cab dex-cab-festa" transform="rotate(14 80 16)"><path class="dx-l" d="M80 -22L99 15Q80 21 61 15Z" fill="#1E2126"/><path d="M74.5 -9.5L85.5 -9.5M69 2L91 2" fill="none" stroke="#F6F7F9" stroke-width="3.2"/><circle class="dx-l" cx="80" cy="-23" r="5.5" fill="#F6F7F9"/></g>'+
    '<g class="dex-cab dex-cab-natal"><path class="dx-l" d="M33 14C34 -14 66 -30 98 -24C116 -20 131 -6 137 16L124 13Z" fill="#D7323F"/><path d="M60 -16C70 -22 84 -24 96 -21" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>'+
      '<rect class="dx-l" x="26" y="7" width="108" height="15" rx="7.5" fill="#FFFFFF"/><circle class="dx-l" cx="139" cy="20" r="8" fill="#FFFFFF"/></g>'+
    '<g class="dex-cab dex-cab-coelho"><path d="M76.5 59.5h7l-3.5 4z" fill="#F2B8C6" stroke="#F2B8C6" stroke-width="2" stroke-linejoin="round"/><path class="dex-bigode-coelho" d="M60 61L45 58M60 64L45 66M100 61L115 58M100 64L115 66"/></g>'+
    '<g class="dex-cab dex-cab-formatura"><path class="dx-l" d="M50 6V18Q80 28 110 18V6Z" fill="#202329"/><path class="dx-l" d="M80 -14L134 2L80 18L26 2Z" fill="#2A2D34"/>'+
      '<circle cx="80" cy="2" r="3.2" fill="#E7B96A"/><path d="M80 2Q112 6 124 6V26" fill="none" stroke="#E7B96A" stroke-width="2.4" stroke-linecap="round"/><rect x="120.5" y="24" width="7" height="12" rx="3" fill="#E7B96A"/></g>'+
    '<g class="dex-cab dex-cab-chef"><path class="dx-l" fill="#FFFFFF" d="M48 16C36 14 34 -6 50 -6C50 -20 66 -24 74 -14C80 -24 96 -22 98 -10C112 -14 122 4 110 14Z"/>'+
      '<rect class="dx-l" x="46" y="8" width="68" height="15" rx="5" fill="#FFFFFF"/><path d="M60 11V20M72 11V20M84 11V20M96 11V20" stroke="#D5D9E0" stroke-width="2"/></g>'+
    '<g class="dex-cab dex-cab-coroa"><path class="dx-l" fill="#E7B96A" d="M50 20L46 -6L62 6L80 -12L98 6L114 -6L110 20Z"/><circle cx="80" cy="-12" r="3.5" fill="#FFFFFF"/><circle cx="46" cy="-6" r="3" fill="#FFFFFF"/><circle cx="114" cy="-6" r="3" fill="#FFFFFF"/><circle cx="80" cy="11" r="3.6" fill="#D7323F"/></g>'+
    '<g class="dex-cab dex-cab-fones"><path d="M20 52C18 -2 142 -2 140 52" fill="none" stroke="#1B1D22" stroke-width="7" stroke-linecap="round"/>'+
      '<rect class="dx-l" x="5" y="35" width="25" height="44" rx="11" fill="#1B1D22"/><rect class="dx-l" x="130" y="35" width="25" height="44" rx="11" fill="#1B1D22"/>'+
      '<rect x="10.5" y="46" width="6" height="22" rx="3" fill="#5A5F69"/><rect x="143.5" y="46" width="6" height="22" rx="3" fill="#5A5F69"/></g>';
  var ROSTO_ACESS='<g class="dex-ros dex-ros-oculos"><circle cx="62" cy="51" r="14" fill="none" stroke="#F6F7F9" stroke-width="3"/><circle cx="98" cy="51" r="14" fill="none" stroke="#F6F7F9" stroke-width="3"/><path d="M76 49Q80 46 84 49" fill="none" stroke="#F6F7F9" stroke-width="3"/></g>'+
    '<g class="dex-ros dex-ros-escuros"><path d="M43 41H78V52Q78 63 66 63H56Q43 63 43 52Z" fill="#050607" fill-opacity=".86" stroke="#F6F7F9" stroke-width="2"/><path d="M82 41H117V52Q117 63 104 63H94Q82 63 82 52Z" fill="#050607" fill-opacity=".86" stroke="#F6F7F9" stroke-width="2"/>'+
      '<path d="M78 45H82" stroke="#F6F7F9" stroke-width="2.4"/><path d="M48 46L57 46M87 46L96 46" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/></g>'+
    '<g class="dex-ros dex-ros-bigode"><path d="M80 62C74 57 63 58 58 65C65 63 72 66 80 64C88 66 95 63 102 65C97 58 86 57 80 62Z" fill="#F6F7F9"/></g>';
  function corpoAcess(u){
    return '<g class="dex-crp dex-crp-noel"><path class="dx-l" d="'+TRONCO+'" fill="#D7323F"/><path d="M58 104C61 98 67 95 72 96" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>'+
        '<rect x="38" y="131" width="84" height="11" fill="#1B1D22" clip-path="url(#dexT'+u+')"/><rect x="72" y="129" width="16" height="15" rx="3" fill="none" stroke="#E7B96A" stroke-width="3"/>'+
        '<path d="M80 96V129" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/><path d="M56 95Q80 107 104 95" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/></g>'+
      '<g class="dex-crp dex-crp-cachecol"><path class="dx-l" d="M58 92Q80 104 102 92L104 102Q80 116 56 102Z" fill="#D7323F"/><path class="dx-l" d="M90 104L98 136L86 138L80 108Z" fill="#D7323F"/>'+
        '<path d="M64 97Q80 106 96 97" stroke="#fff" stroke-width="3" fill="none" opacity=".85"/><path d="M89 117L95 116M91 127L97 126" stroke="#fff" stroke-width="3"/></g>'+
      '<g class="dex-crp dex-crp-gravata"><path class="dx-l" d="M80 97L63 89V106Z" fill="#1B1D22"/><path class="dx-l" d="M80 97L97 89V106Z" fill="#1B1D22"/><rect class="dx-l" x="75" y="92" width="10" height="10" rx="3" fill="#2F3239"/></g>';
  }
  /* o brilho dos olhos é um degradê desenhado (antes era um filtro de desfoque, que pesava) */
  function olho(lado,x,u){
    return '<g class="dex-olho dex-olho-'+lado+'" transform="translate('+x+' 51)"><ellipse class="dex-halo" rx="15" ry="17" fill="url(#dexH'+u+')"/><g class="dex-o">'+
      '<rect class="dex-o-aberto" x="-7" y="-9.5" width="14" height="19" rx="7"/><path class="dex-o-feliz" d="M-8 3Q0 -9 8 3"/><path class="dex-o-fechado" d="M-7.5 1.5Q0 6 7.5 1.5"/>'+
      '<path class="dex-o-coracao" d="M0 8C-10 1 -10 -8 -4.6 -8C-2 -8 0 -6 0 -3.6C0 -6 2 -8 4.6 -8C10 -8 10 1 0 8Z"/>'+
      '<path class="dex-o-tonto" d="M0 0a1.5 1.5 0 0 1 1.5 1.5a3 3 0 0 1 -3 3a4.5 4.5 0 0 1 -4.5 -4.5a6 6 0 0 1 6 -6a7.5 7.5 0 0 1 7.5 7.5"/></g></g>';
  }
  function cabeca(u){
    return '<g class="dex-cabeca">'+CAB_ATRAS+
      '<rect class="dex-orelha" x="14" y="41" width="16" height="32" rx="8"/><rect class="dex-orelha" x="130" y="41" width="16" height="32" rx="8"/>'+
      '<rect class="dex-topo" x="63" y="10" width="34" height="13" rx="6.5"/><rect class="dex-casco" x="22" y="17" width="116" height="72" rx="34"/>'+
      '<path class="dex-casco-brilho" d="M38 35C43 27 53 23 63 22.5"/><rect class="dex-visor" x="33" y="28" width="94" height="51" rx="23" fill="url(#dexV'+u+')"/>'+
      '<path class="dex-visor-brilho" d="M44 37C49 33 56 32 62 32"/>'+
      '<g class="dex-rosto"><ellipse class="dex-bochecha" cx="47" cy="64" rx="6" ry="3.2"/><ellipse class="dex-bochecha" cx="113" cy="64" rx="6" ry="3.2"/>'+
        '<g class="dex-olhos">'+olho('e',62,u)+olho('d',98,u)+'</g>'+
        '<g class="dex-boca" transform="translate(80 68)"><path class="dex-boca-sorriso" d="M-6 -1.5Q0 4.5 6 -1.5"/><ellipse class="dex-boca-o" rx="4" ry="4.4"/><path class="dex-boca-triste" d="M-5.5 2.5Q0 -3 5.5 2.5"/></g>'+
      '</g>'+ROSTO_ACESS+CAB_FRENTE+'</g>';
  }
  function defs(u){
    return '<defs><radialGradient id="dexV'+u+'" cx="50%" cy="38%" r="70%"><stop offset="0" style="stop-color:var(--c-visor2)"/><stop offset="1" style="stop-color:var(--c-visor)"/></radialGradient>'+
      '<radialGradient id="dexH'+u+'"><stop offset="0" style="stop-color:var(--dex-olho);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--dex-olho);stop-opacity:0"/></radialGradient>'+
      '<clipPath id="dexT'+u+'"><path d="'+TRONCO+'"/></clipPath></defs>';
  }
  var CONF=[['#E7B96A',-34,-40],['#40AF73',30,-46],['#1BBACC',-46,-12],['#7818FA',44,-16],['#F6F7F9',-18,-56],['#0E69BE',16,-60],['#E7B96A',52,-36],['#F6F7F9',-52,-30]];
  function svgInteiro(cls){
    var u=++uid;
    return '<svg class="dex-svg'+(cls?' '+cls:'')+'" viewBox="0 -30 160 214" aria-hidden="true" data-humor="neutro">'+defs(u)+
      '<path class="dex-jato" d="M64 160Q68 186 72 160Z"/><path class="dex-jato" d="M88 160Q92 186 96 160Z"/>'+
      '<g class="dex-braco dex-braco-e"><g class="dex-osc"><rect x="27" y="97" width="17" height="44" rx="8.5"/></g></g>'+
      '<g class="dex-braco dex-braco-d"><g class="dex-osc"><rect x="116" y="97" width="17" height="44" rx="8.5"/></g></g>'+
      '<rect class="dex-pescoco" x="69" y="82" width="22" height="14" rx="5"/><path class="dex-tronco" d="'+TRONCO+'"/>'+
      '<path class="dex-tronco-sombra" d="M103 95C115 104 121 119 118.5 136C115 155 99 165 80 166C96 157 108 142 108 123C108 111 106 102 103 95Z"/>'+
      '<path class="dex-brilho" d="M54 108C58 100 66 96 72 97C68 102 62 110 59 122C57 128 52 120 54 108Z"/><path class="dex-costura" d="M47 137Q80 148 113 137"/>'+
      '<rect class="dex-luz" x="71" y="117" width="18" height="5" rx="2.5"/>'+corpoAcess(u)+cabeca(u)+
      '<g class="dex-fx">'+
        '<g><path class="dex-fx-brilho" d="M24 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#C9CED6" stroke="#24272D" stroke-width="1.4"/><path class="dex-fx-brilho" d="M142 8l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill="#F6F7F9" stroke="#24272D" stroke-width="1.4"/></g>'+
        '<g><circle class="dex-fx-ponto" cx="128" cy="2" r="3.6" fill="#9AA1AC"/><circle class="dex-fx-ponto" cx="139" cy="-6" r="3.6" fill="#9AA1AC"/><circle class="dex-fx-ponto" cx="150" cy="-14" r="3.6" fill="#9AA1AC"/></g>'+
        '<g><text class="dex-fx-z" x="122" y="6">z</text><text class="dex-fx-z" x="130" y="-2" style="font-size:16px">z</text><text class="dex-fx-z" x="140" y="-10" style="font-size:19px">Z</text></g>'+
        '<g><path class="dex-fx-cor" d="M30 10c-5-3.5-5-8-2.3-8 1.3 0 2.3 1 2.3 2.2 0-1.2 1-2.2 2.3-2.2 2.7 0 2.7 4.5-2.3 8z"/><path class="dex-fx-cor" d="M132 0c-6-4-6-9.5-2.7-9.5 1.6 0 2.7 1.2 2.7 2.6 0-1.4 1.1-2.6 2.7-2.6 3.3 0 3.3 5.5-2.7 9.5z"/><path class="dex-fx-cor" d="M118 -14c-4-3-4-6.5-1.8-6.5 1 0 1.8.8 1.8 1.8 0-1 .8-1.8 1.8-1.8 2.2 0 2.2 3.5-1.8 6.5z"/></g>'+
        '<g>'+CONF.map(function(c,i){ return '<rect class="dex-fx-conf" x="77" y="10" width="6" height="9" rx="1.5" fill="'+c[0]+'" style="--i:'+i+';--cx:'+c[1]+'px;--cy:'+c[2]+'px"/>'; }).join('')+'</g>'+
      '</g></svg>';
  }
  function svgCabeca(cls){ var u=++uid; return '<svg class="dex-svg dex-mini'+(cls?' '+cls:'')+'" viewBox="10 -2 140 96" aria-hidden="true" data-humor="neutro">'+defs(u)+cabeca(u)+'</svg>'; }
  /* as camadas que flutuam e pulam ficam em HTML: o navegador move tudo sem redesenhar o SVG */
  function corpoHTML(cls){ return '<div class="dex-corpo"><div class="dex-sombra"></div><div class="dex-flut"><div class="dex-incl"><div class="dex-mola">'+svgInteiro(cls)+'</div></div></div></div>'; }
  function miniatura(tipo,v){
    var inteiro=tipo==='corpo'||tipo==='tema', s=inteiro?svgInteiro('dex-fixo dex-thumb dex-inteiro'):svgCabeca('dex-fixo dex-thumb');
    var a={cab:'nenhum',rosto:'nenhum',corpo:'nenhum'}; if(tipo==='tema') a=v; else if(tipo==='atual') a=visual(); else a[tipo]=v;
    s=s.replace('data-humor="neutro"','data-humor="neutro" data-cab="'+a.cab+'" data-rosto="'+a.rosto+'" data-corpo="'+a.corpo+'"');
    if(!inteiro) s=s.replace('viewBox="10 -2 140 96"','viewBox="'+(ALTOS[a.cab]?'2 -42 156 136':'10 -2 140 96')+'"');
    return s;
  }

  /* =================================================================== 4. MONTAGEM */
  var raiz=el('div','dex'); raiz.id='dex';
  raiz.innerHTML='<div class="dex-balao" role="status" aria-live="polite"></div><button class="dex-btn" type="button">'+corpoHTML('dex-vivo dex-principal')+'</button>';
  D.body.appendChild(raiz);
  var btn=raiz.querySelector('.dex-btn'), corpo=raiz.querySelector('.dex-principal'), caixaCorpo=raiz.querySelector('.dex-corpo'), balao=raiz.querySelector('.dex-balao');
  H.classList.add('dex-on');
  var humorAtual='neutro';
  function vivos(){ return D.querySelectorAll('.dex-svg.dex-vivo'); }
  function aplicarVisual(){
    var v=visual();
    D.querySelectorAll('.dex-svg:not(.dex-thumb)').forEach(function(s){
      s.setAttribute('data-cab',v.cab); s.setAttribute('data-rosto',v.rosto); s.setAttribute('data-corpo',v.corpo);
      if(s.classList.contains('dex-mini')) s.setAttribute('viewBox',ALTOS[v.cab]?'2 -42 156 136':'10 -2 140 96');
    });
    vivos().forEach(function(s){ s.setAttribute('data-humor',humorAtual); });
  }
  function trocarAvatares(){
    if(chat){ var cab=chat.querySelector('.ai-chat-head .ai-avatar'); if(cab&&!cab.querySelector('.dex-mini')) cab.innerHTML=svgCabeca('dex-vivo');
      chat.querySelectorAll('.ai-welcome .ai-avatar').forEach(function(av){ if(!av.querySelector('.dex-mini')) av.innerHTML=svgCabeca('dex-fixo'); }); }
    aplicarVisual();
  }
  function aplicarNome(){
    var n=CFG.nome||'Dex';
    btn.setAttribute('aria-label','Abrir o chat com '+n+', o assistente do AkiCut');
    var tt=chat&&chat.querySelector('.ai-title b'); if(tt) tt.textContent=n;
    var orb=D.getElementById('btnAssistant'); if(orb){ orb.setAttribute('aria-label','Abrir '+n); orb.title=n; }
    var w=chat&&chat.querySelector('.ai-welcome-copy');
    if(w) w.textContent=CFG.jeito==='formal'?'Olá, eu sou o '+n+', o assistente do AkiCut. Explico qualquer parte do site e executo boa parte das tarefas. Digite / para ver os comandos rápidos.'
      :'Bip-bop! Eu sou o '+n+'. Pergunte qualquer coisa do AkiCut: eu explico, faço tarefas por você e até voo pela tela para mostrar onde fica cada botão. Digite / para ver os comandos rápidos.';
    var card=D.querySelector('#inicioAssistente .inicio-txt'); if(card) card.innerHTML='<b>Conversar com o '+esc(n)+'</b><small>Tire dúvidas e peça ações por chat</small>';
    D.querySelectorAll('.dx-nome-atual').forEach(function(x){ x.textContent=n; });
  }
  /* tema do chat, do painel e do estúdio: Noite, Grafite, Névoa ou Automático (segue o tema do site) */
  function siteEscuro(){ var t=H.getAttribute('data-theme'); if(t==='dark') return true; if(t==='light') return false; try{ return matchMedia('(prefers-color-scheme: dark)').matches; }catch(e){ return false; } }
  function aplicarTema(){ var t=CFG.tema==='auto'?(siteEscuro()?'noite':'nevoa'):CFG.tema; if(t==='noite') H.removeAttribute('data-dx-tema'); else H.setAttribute('data-dx-tema',t); }
  new MutationObserver(function(){ if(CFG.tema==='auto') aplicarTema(); }).observe(H,{attributes:true,attributeFilter:['data-theme']});
  function aplicarCfg(){
    aplicarTema();
    H.setAttribute('data-dex-tam',CFG.tam); H.setAttribute('data-dex-acab',CFG.acab); H.setAttribute('data-dex-anim',CFG.anim); H.setAttribute('data-dex-lado',CFG.lado);
    H.style.setProperty('--dex-olho',OLHOS[CFG.olhos]||OLHOS.branco);
    if(CFG.seguir!=='sim') olharPara(0,0,0);
    aplicarVisual(); aplicarNome(); cacheRect();
  }

  /* =================================================================== 5. HUMOR, TRUQUES E OLHAR */
  var E={hover:false,pensando:false,ouvindo:false,falaAte:0,dormindo:false,reacao:null,ultimoMov:Date.now(),guia:null};
  function base(){
    if(E.guia) return E.guia; if(E.pensando) return 'pensando'; if(E.falaAte>Date.now()) return 'falando';
    if(E.dormindo) return 'dormindo'; if(E.hover) return 'feliz'; if(E.ouvindo) return 'ouvindo'; return 'neutro';
  }
  var tBase=0;
  function render(){
    var h=(!E.guia&&E.reacao&&E.reacao.ate>Date.now())?E.reacao.h:base();
    if(h!==humorAtual){ humorAtual=h; vivos().forEach(function(s){ s.setAttribute('data-humor',h); }); }
    clearTimeout(tBase);
    var prox=Math.min(E.reacao&&E.reacao.ate>Date.now()?E.reacao.ate:Infinity,E.falaAte>Date.now()?E.falaAte:Infinity);
    if(prox<Infinity) tBase=setTimeout(render,prox-Date.now()+10);
  }
  function reagir(h,ms){ E.reacao={h:h,ate:Date.now()+(ms||1200)}; render(); if(h==='comemorando') pular(); }
  function truque(nome,caixas){
    if(parado()) return;
    (caixas||[caixaCorpo]).forEach(function(c){ if(!c) return; c.classList.remove('pula','quica','pirueta'); void c.offsetWidth; c.classList.add(nome); });
  }
  function pular(){ truque('pula',[caixaCorpo,D.querySelector('.dx-est-dex .dex-corpo')]); }
  D.addEventListener('animationend',function(e){ var c=e.target&&e.target.closest&&e.target.closest('.dex-corpo');
    if(c&&/^dex(Pulo|Quica|Pirueta)$/.test(e.animationName)) c.classList.remove('pula','quica','pirueta');
    var s=e.target&&e.target.closest&&e.target.closest('.dex-svg'); if(s&&e.animationName==='dexSim') s.classList.remove('sim'); },true);

  (function piscar(){
    setTimeout(function(){
      if(!D.hidden&&/^(neutro|ouvindo|falando|surpresa|apontando)$/.test(humorAtual)){
        var ss=vivos(); ss.forEach(function(s){ s.classList.add('pisca'); });
        setTimeout(function(){ ss.forEach(function(s){ s.classList.remove('pisca'); });
          if(Math.random()<.22) setTimeout(function(){ ss.forEach(function(s){ s.classList.add('pisca'); }); setTimeout(function(){ ss.forEach(function(s){ s.classList.remove('pisca'); }); },110); },170); },120);
      }
      piscar();
    },2600+Math.random()*3800);
  })();
  function piscadinha(){ corpo.classList.add('pisca-d'); setTimeout(function(){ corpo.classList.remove('pisca-d'); },380); }

  /* olhar: a posição do Dex fica guardada, sem medir a tela a cada movimento do mouse */
  var RB={left:0,top:0,width:1,height:1};
  function cacheRect(){ var r=btn.getBoundingClientRect(); if(r.width) RB=r; }
  W.addEventListener('resize',cacheRect); W.addEventListener('scroll',cacheRect,{passive:true}); setInterval(cacheRect,2000);
  function olharPara(ox,oy,tilt){ corpo.style.setProperty('--ox',ox.toFixed(1)+'px'); corpo.style.setProperty('--oy',oy.toFixed(1)+'px'); corpo.style.setProperty('--tilt',tilt.toFixed(1)+'deg'); }
  var raf=0, px=0, py=0, olhandoAte=0;
  function seguir(){
    raf=0;
    if(CFG.seguir!=='sim'||E.guia||Date.now()<olhandoAte||/^(dormindo|pensando|tonto|espreguica)$/.test(humorAtual)) return;
    var cx=RB.left+RB.width/2, cy=RB.top+RB.height*.36, dx=px-cx, dy=py-cy, d=Math.hypot(dx,dy)||1, k=Math.min(1,d/220);
    olharPara(6*dx/d*k,4.5*dy/d*k,Math.max(-6,Math.min(6,dx/d*6*Math.min(1,d/420))));
  }
  function olharElemento(alvo,ms){
    if(!alvo) return; var a=alvo.getBoundingClientRect(), r=btn.getBoundingClientRect();
    var dx=(a.left+a.width/2)-(r.left+r.width/2), dy=(a.top+a.height/2)-(r.top+r.height*.36), d=Math.hypot(dx,dy)||1;
    olharPara(6*dx/d,4.5*dy/d,Math.max(-6,Math.min(6,dx/d*6))); olhandoAte=Date.now()+(ms||900);
  }
  D.addEventListener('pointermove',function(e){ px=e.clientX; py=e.clientY; atividade(); if(!raf) raf=requestAnimationFrame(seguir); },{passive:true});
  var tSono=0;
  var ultAtiv=0;
  function atividade(){
    var agora=Date.now(); if(!E.dormindo&&agora-ultAtiv<300){ E.ultimoMov=agora; return; } ultAtiv=agora;
    E.ultimoMov=agora;
    if(E.dormindo){ E.dormindo=false; reagir('surpresa',650); pular(); }
    clearTimeout(tSono); tSono=setTimeout(function(){ if(!aberto()&&!E.hover&&!E.guia){ E.dormindo=true; olharPara(0,2,0); render(); } },75000);
  }
  D.addEventListener('keydown',atividade,true); atividade();
  setInterval(function(){
    if(D.hidden||humorAtual!=='neutro'||Date.now()-E.ultimoMov<6000||CFG.seguir!=='sim') return;
    if(Math.random()<.5){ var s=Math.random()<.5?-1:1; olharPara(5*s,Math.random()*3-1,3*s); olhandoAte=Date.now()+1300; setTimeout(function(){ if(Date.now()>=olhandoAte) olharPara(0,0,0); },1350); }
  },5200);
  (function truques(){
    setTimeout(function(){
      if(CFG.truques==='sim'&&!D.hidden&&humorAtual==='neutro'&&!E.hover&&!aberto()&&!E.guia&&Date.now()-E.ultimoMov>3500&&!parado()&&H.getAttribute('data-ak-mov')!=='suaves'){
        var op=CFG.anim==='sutil'?['pisca','pulo']:['espreguica','pirueta','pulo','aceno','olha'], t=op[Math.floor(Math.random()*op.length)];
        if(t==='espreguica') reagir('espreguica',1900); else if(t==='pirueta') truque('pirueta'); else if(t==='pulo') pular(); else if(t==='aceno') reagir('feliz',1500);
        else if(t==='olha'){ olharPara(-6,-2,-5); olhandoAte=Date.now()+900; setTimeout(function(){ olharPara(6,-2,5); olhandoAte=Date.now()+900; },900); }
        else piscadinha();
      }
      truques();
    },(CFG.anim==='expressiva'?11000:17000)+Math.random()*12000);
  })();

  /* =================================================================== 6. BALÃO */
  var tBalao=0;
  function falarBalao(txt,ms,forcar){
    if(!forcar&&(CFG.balao!=='sim'||aberto()||H.getAttribute('data-ak-orb')==='nao')) return;
    balao.innerHTML=txt; balao.classList.add('on'); if(!E.guia) reagir('falando',Math.min(2400,balao.textContent.length*45));
    clearTimeout(tBalao); if(ms!==0) tBalao=setTimeout(function(){ balao.classList.remove('on'); },ms||5200);
  }
  balao.addEventListener('click',function(){ balao.classList.remove('on'); if(E.guia&&!emTour){ fimGuia(); return; } if(!E.guia) abrirChat(); });

  /* =================================================================== 7. INTERAÇÃO */
  function aberto(){ return !!(chat&&chat.classList.contains('open')); }
  function abrirChat(){ var o=D.getElementById('btnAssistant'); if(o) o.click(); else if(chat){ chat.classList.add('open'); chat.setAttribute('aria-hidden','false'); } }
  function fecharChat(){ var x=D.getElementById('aiClose'); if(x) x.click(); }
  var cliques=[];
  btn.addEventListener('pointerenter',function(e){ if(e.pointerType==='touch'||E.guia) return; if(!E.hover) truque('quica'); E.hover=true; setTimeout(render,110); });
  btn.addEventListener('pointerleave',function(){ E.hover=false; render(); if(Math.random()<.35&&humorAtual==='neutro') piscadinha(); });
  btn.addEventListener('click',function(){
    if(E.guia){ if(emTour) proximoPasso(); else fimGuia(); return; }
    pular(); balao.classList.remove('on');
    if(!aberto()){ setTimeout(abrirChat,90); return; }
    var agora=Date.now(); cliques=cliques.filter(function(t){ return agora-t<1600; }); cliques.push(agora);
    if(cliques.length>=5){ cliques=[]; reagir('tonto',2300); } else reagir('amor',1500);
  });

  /* abrir o chat: um "fantasma" sai do Dex e vira a janela */
  if(chat){
    new MutationObserver(function(){
      var ab=aberto(); H.classList.toggle('dex-chat-aberto',ab);
      if(ab&&!chat.__dexAb){
        balao.classList.remove('on'); E.dormindo=false; reagir('surpresa',520); setTimeout(function(){ reagir('feliz',1300); },540);
        if(!parado()&&!H.classList.contains('dex-guia')){
          M.morph(btn,chat,{cor:(getComputedStyle(chat).backgroundColor||'#0c0d10'),raioDe:btn.offsetWidth/2});
          [chat.querySelector('.ai-chat-head'),msgs,chat.querySelector('.ak-chips'),form].forEach(function(n,i){ M.anima(n,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],'calma',{delay:120+i*55,fill:'backwards'}); });
        }
      }
      if(!ab&&chat.__dexAb) fecharFolha(true);
      chat.__dexAb=ab;
      E.pensando=chat.classList.contains('ak-pensando')||ocupado; chat.classList.toggle('dx-pensa',E.pensando); render();
    }).observe(chat,{attributes:true,attributeFilter:['class']});
  }
  if(input){
    var tSim=0;
    input.addEventListener('focus',function(){ E.ouvindo=true; render(); olharElemento(input,1200); });
    input.addEventListener('blur',function(){ E.ouvindo=false; render(); });
    input.addEventListener('input',function(){
      if(form) form.classList.toggle('tem-texto',!!input.value.trim());
      if(Math.random()<.3) olharElemento(input,700);
      clearTimeout(tSim); tSim=setTimeout(function(){ if(humorAtual==='ouvindo') vivos().forEach(function(s){ s.classList.remove('sim'); void s.getBoundingClientRect(); s.classList.add('sim'); }); },500);
    });
  }
  /* mensagens: a sua sai do campo de texto; a do Dex chega com um pulinho */
  if(msgs){
    var marcar=function(n){ if(!n.querySelector(':scope > .dex-av')) n.appendChild(el('span','dex-av',svgCabeca('dex-fixo'))); };
    msgs.querySelectorAll('.ai-msg.bot').forEach(marcar);
    new MutationObserver(function(ms){
      var novo=false;
      ms.forEach(function(m){ m.addedNodes.forEach(function(n){
        if(n.nodeType!==1||!n.classList||!n.classList.contains('ai-msg')) return;
        if(n.classList.contains('user')){
          if(!parado()&&form){ var fr=form.getBoundingClientRect(), br=n.getBoundingClientRect(); n.style.transformOrigin='100% 100%';
            M.anima(n,[{transform:'translate('+(fr.right-br.right-8)+'px,'+(fr.top-br.top+6)+'px) scale(.86)',opacity:.4},{transform:'none',opacity:1}],'morph'); }
          return;
        }
        marcar(n); novo=true;
        if(!parado()){ n.style.transformOrigin='0 100%';
          if(n.classList.contains('ak-rico')) Array.prototype.forEach.call(n.children,function(c,i){ if(!c.classList.contains('dex-av')) M.anima(c,[{opacity:0,transform:'translateY(14px) scale(.96)'},{opacity:1,transform:'none'}],'pula',{delay:i*60,fill:'backwards'}); });
          else M.anima(n,[{opacity:0,transform:'translateY(14px) scale(.92)'},{opacity:1,transform:'none'}],'pula'); }
        if(!n.classList.contains('dex-carregando')){ var len=(n.textContent||'').length; E.falaAte=Date.now()+Math.max(900,Math.min(4200,len*38)); render(); }
      }); });
      if(novo) aplicarVisual();
    }).observe(msgs,{childList:true});
  }
  /* abas: uma dica por aba, uma vez por sessão */
  var DICAS={inicio:'Quer ajuda para fechar as artes do mês? É só me chamar.',aniv:'Dica: você pode colar a lista de datas e nomes direto no meu chat.',
    arte:'Arraste a foto na prévia e use a roda do mouse para ajustar o zoom.',colab:'Fotos sem dono ficam em <b>Fotos a confirmar</b>, no topo desta aba.',novos:'Busque o colaborador para usar a foto que já está no cadastro.'};
  (function(){
    var o=W.setTab; if(typeof o!=='function') return;
    W.setTab=function(t){ var r=o.apply(this,arguments);
      try{ if(!E.guia){ var b=D.querySelector('.tabs button[data-tab="'+t+'"]'); if(b) olharElemento(b,900);
        if(W.__akPronto&&!SS.get('dex-dica-'+t)&&DICAS[t]){ SS.set('dex-dica-'+t,'1'); setTimeout(function(){ falarBalao(DICAS[t]); },1300); } } }catch(e){}
      return r; };
  })();
  (function(){
    function ola(){ setTimeout(function(){
      reagir('surpresa',450); pular(); setTimeout(function(){ reagir('feliz',1700); },470);
      if(!SS.get('dex-ola')){ SS.set('dex-ola','1'); setTimeout(function(){ falarBalao((CFG.jeito==='formal'?'Olá! Eu sou o ':'Bip-bop! Eu sou o ')+esc(CFG.nome||'Dex')+'. Clique em mim quando precisar de ajuda.',6000); },700); }
    },700); }
    if(D.body.classList.contains('revealed')) ola();
    else new MutationObserver(function(m,ob){ if(D.body.classList.contains('revealed')){ ob.disconnect(); ola(); } }).observe(D.body,{attributes:true,attributeFilter:['class']});
  })();

  /* =================================================================== 8. GUIA NA TELA E TOUR */
  var ALVO={
    aba_inicio:[null,'.tabs button[data-tab="inicio"]','<b>Início</b>: o resumo do mês e os atalhos.'],
    aba_aniv:[null,'.tabs button[data-tab="aniv"]','<b>Aniversariantes</b>: a lista do mês, a geração e o ZIP.'],
    aba_arte:[null,'.tabs button[data-tab="arte"]','<b>Arte</b>: o estúdio para ajustar cada arte.'],
    aba_colab:[null,'.tabs button[data-tab="colab"]','<b>Colaboradores</b>: cadastro, fotos e backup.'],
    aba_novos:[null,'.tabs button[data-tab="novos"]','<b>Novos colaboradores</b>: as artes de boas-vindas.'],
    importar_lista:['aniv','#btnImport','<b>Importar lista</b>: cole uma pessoa por linha, como 06/10 – Nome.'],
    adicionar_pessoa:['aniv','#btnAddOne','<b>Adicionar pessoa</b>: inclui alguém na lista do mês.'],
    gerar_mes:['aniv','#btnGenMonth','<b>Gerar artes do mês</b>: cria todas as artes de uma vez.'],
    preparar:['aniv','#btnPrepNext','<b>Preparar</b>: vincula as fotos e enquadra o próximo mês.'],
    gerar_proximo:['aniv','#btnGenNext','<b>Gerar próximo mês</b>: já deixa as artes prontas.'],
    zip:['aniv','#btnZip','<b>Baixar todas (ZIP)</b>: todas as artes do mês num arquivo só.'],
    meses:['aniv','#months','Aqui você troca o <b>mês</b>.'], ano:['aniv','#yearSel','Aqui você troca o <b>ano</b>.'],
    auto:['arte','#btnAuto','<b>Aplicar automático</b>: refaz o enquadramento.'], chapeleiro:['arte','#btnChapeleiro','<b>Chapeleiro</b>: encaixa a cabeça embaixo do chapéu.'],
    modelos:['arte','#btnModelos','<b>Modelos de arte</b>: troque o fundo da arte.'], textos:['arte','#btnTextosArte','<b>Textos da arte</b>: título e frases.'],
    png:['arte','#btnPng','<b>Baixar PNG</b>: salva a arte aberta.'], anterior:['arte','#btnPrev','Volta para a arte <b>anterior</b>.'], proxima:['arte','#btnNext','Vai para a <b>próxima</b> arte.'],
    importar_pasta:['colab','#btnFolder','<b>Importar pasta</b>: uma subpasta com o nome de cada pessoa.'], fotos_soltas:['colab','#btnFiles','<b>Importar fotos soltas</b>: o nome do arquivo identifica a pessoa.'],
    zip_fotos:['colab','#btnImportarZipFotos','<b>Importar ZIP de fotos</b>.'], novo_colaborador:['colab','#btnNewPerson','<b>Novo colaborador</b>: cadastro manual.'],
    unificar:['colab','#btnMerge','<b>Unificar duplicados</b>: junta cadastros repetidos.'], padronizar:['colab','#btnPadronizar','<b>Padronizar nomes</b>.'],
    supabase:['colab','#btnEspaco','<b>Supabase</b>: veja o espaço usado.'], limpar:['colab','#btnWipe','<b>Limpar cadastro</b>: cuidado, remove todos os colaboradores.'],
    backup:['colab','#btnBackup','<b>Exportar</b>: cópia de segurança.'], restaurar:['colab','#btnRestore','<b>Restaurar</b>: devolve um backup.'],
    ordenar:['colab','#peopleSort','<b>Ordenar</b> a lista de colaboradores.'], buscar:['colab','#search','<b>Pesquisar</b> colaborador pelo nome.'],
    novos_modelo:['novos','#nvModelo','Escolha o <b>modelo</b> da arte de boas-vindas.'], novos_busca:['novos','#nvBusca','<b>Busque</b> o colaborador para usar a foto do cadastro.'],
    novos_baixar:['novos','#nvBaixar','<b>Baixar PNG</b> da arte de boas-vindas.'], novos_copiar:['novos','#nvCopiar','<b>Copiar imagem</b> para colar onde quiser.'],
    tema:[null,'#btnTheme','O botão de <b>tema</b>: claro, escuro ou automático.'], ajustes:[null,'#btnSettings','Em <b>Ajustes</b> você muda o site e me personaliza!']
  };
  var veu=null, anel=null, alvoGuia=null, textoGuia='', guiaVez=0, guiaTimer=0, emTour=false, ultCaixa=null;
  function visivel(n){ if(!n) return false; var r=n.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(n).visibility!=='hidden'; }
  /* espera o botão parar de se mexer (as abas entram com animação) antes de medir */
  async function estavel(n){ var ult='',iguais=0,t0=performance.now();
    while(performance.now()-t0<1300){ await quadro(); var r=n.getBoundingClientRect(), k=Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width);
      if(k===ult){ if(++iguais>=4) return; } else { iguais=0; ult=k; } } }
  function homeRect(){ var t=raiz.style.transform; raiz.style.transition='none'; raiz.style.transform='none'; var r=raiz.getBoundingClientRect(); raiz.style.transform=t; void raiz.offsetWidth; raiz.style.transition=''; return r; }
  function furo(x,y,w,h,r){ var X=innerWidth,Y=innerHeight; r=Math.min(r,w/2,h/2);
    return 'path(evenodd, "M0 0H'+X+'V'+Y+'H0Z M'+(x+r)+' '+y+'H'+(x+w-r)+'A'+r+' '+r+' 0 0 1 '+(x+w)+' '+(y+r)+'V'+(y+h-r)+'A'+r+' '+r+' 0 0 1 '+(x+w-r)+' '+(y+h)+'H'+(x+r)+'A'+r+' '+r+' 0 0 1 '+x+' '+(y+h-r)+'V'+(y+r)+'A'+r+' '+r+' 0 0 1 '+(x+r)+' '+y+'Z")'; }
  function posicionar(animar){
    if(!alvoGuia) return;
    var r=alvoGuia.getBoundingClientRect(), pad=8, rad=Math.min(22,parseFloat(getComputedStyle(alvoGuia).borderRadius)||12)+pad;
    var caixa={x:Math.round(r.left-pad),y:Math.round(r.top-pad),w:Math.round(r.width+pad*2),h:Math.round(r.height+pad*2),r:rad};
    if(!veu){ veu=el('div','dx-veu'); D.body.appendChild(veu); anel=el('div','dx-anel'); D.body.appendChild(anel); }
    var de=ultCaixa||{x:caixa.x-40,y:caixa.y-40,w:caixa.w+80,h:caixa.h+80,r:rad+20};
    veu.style.clipPath=furo(caixa.x,caixa.y,caixa.w,caixa.h,caixa.r);
    anel.style.width=caixa.w+'px'; anel.style.height=caixa.h+'px'; anel.style.borderRadius=caixa.r+'px'; anel.style.transform='translate('+caixa.x+'px,'+caixa.y+'px)';
    if(animar){ M.anima(veu,[{clipPath:furo(de.x,de.y,de.w,de.h,de.r)},{clipPath:veu.style.clipPath}],'morph');
      M.anima(anel,[{transform:'translate('+de.x+'px,'+de.y+'px) scale('+(de.w/caixa.w).toFixed(3)+','+(de.h/caixa.h).toFixed(3)+')'},{transform:anel.style.transform}],'morph'); }
    ultCaixa=caixa; veu.classList.add('on'); anel.classList.add('on');
    /* onde o Dex fica: ao lado do botão, com o braço apontando para ele */
    var Wd=raiz.offsetWidth, Hd=Wd*214/160, casa=homeRect();
    var dir=r.right+Wd*.95+14<innerWidth, braco=dir?'e':'d';
    var left=dir?r.right+14+Wd*.078:r.left-14-Wd*1.08, cy=r.top+r.height/2, top=Math.max(8,Math.min(innerHeight-Hd-8,cy-Hd*.6215));
    left=Math.max(8,Math.min(innerWidth-Wd-8,left));
    raiz.style.setProperty('--lean',(left<casa.left?-12:12)+'deg');
    raiz.style.transform='translate3d('+(left-casa.left).toFixed(1)+'px,'+(top-casa.top).toFixed(1)+'px,0)';
    var paraDir=dir&&left+Wd+240<innerWidth;
    raiz.classList.toggle('balao-dir',paraDir); raiz.classList.toggle('balao-esq',!paraDir); raiz.classList.toggle('balao-baixo',top<150);
    var sx=left+Wd*(braco==='e'?35.5:124.5)/160, sy=top+Hd*133/214, tx=Math.max(r.left,Math.min(r.right,sx)), ty=Math.max(r.top,Math.min(r.bottom,sy));
    if(tx===sx&&ty===sy){ tx=r.left+r.width/2; ty=r.top+r.height/2; }
    var ang=Math.atan2(ty-sy,tx-sx)*180/Math.PI-90; if(braco==='e'&&ang<-180) ang+=360; if(braco==='d'&&ang>180) ang-=360;
    corpo.setAttribute('data-braco',braco); corpo.style.setProperty('--ap',ang.toFixed(1)+'deg');
  }
  async function irPara(id,texto){
    var a=ALVO[id]; if(!a) return false; var vez=++guiaVez;
    if(a[0]&&typeof state!=='undefined'&&state.tab!==a[0]&&typeof W.setTab==='function') W.setTab(a[0]);
    var alvo=D.querySelector(a[1]); if(!alvo) return false;
    await estavel(alvo); if(vez!==guiaVez||!visivel(alvo)) return false;
    var r0=alvo.getBoundingClientRect();
    if(r0.top<70||r0.bottom>innerHeight-110){ try{ alvo.scrollIntoView({block:'center',behavior:parado()?'auto':'smooth'}); }catch(e){} await estavel(alvo); if(vez!==guiaVez) return false; }
    H.classList.add('dex-guia'); balao.classList.remove('on'); E.dormindo=false;
    alvoGuia=alvo; textoGuia=texto||a[2];
    raiz.classList.add('voando'); E.guia='voando'; render();
    raiz.style.transition='transform '+(parado()?1:950)+'ms var(--mola,ease)';
    posicionar(true);
    await esperar(parado()?30:900); if(vez!==guiaVez) return false;
    raiz.classList.remove('voando'); E.guia='apontando'; render(); olharElemento(alvo,99999); truque('quica');
    falarBalao(textoGuia,0,true);
    return true;
  }
  async function mostrar(id,texto){
    if(emTour) return false;
    var ok=await irPara(id,texto); if(!ok) return false;
    clearTimeout(guiaTimer); var v=guiaVez; guiaTimer=setTimeout(function(){ if(v===guiaVez) fimGuia(); },5600);
    return true;
  }
  function fimGuia(){
    clearTimeout(guiaTimer); guiaVez++; emTour=false; alvoGuia=null; ultCaixa=null;
    if(veu){ veu.classList.remove('on'); anel.classList.remove('on'); }
    fecharHudTour(); balao.classList.remove('on','x');
    raiz.style.transition='transform '+(parado()?1:950)+'ms var(--mola,ease)'; raiz.style.transform='';
    raiz.classList.remove('balao-dir','balao-esq','balao-baixo'); raiz.classList.add('voando');
    E.guia='voando'; render(); olhandoAte=0;
    var v=guiaVez; setTimeout(function(){ if(v!==guiaVez) return; raiz.classList.remove('voando'); E.guia=null; render(); olharPara(0,0,0); H.classList.remove('dex-guia'); reagir('feliz',900); cacheRect(); },parado()?40:950);
  }
  var tReposi=0;
  function reposicionar(){ if(!alvoGuia) return; cancelAnimationFrame(tReposi); tReposi=requestAnimationFrame(function(){ raiz.style.transition='transform .5s var(--mola,ease)'; posicionar(false); }); }
  W.addEventListener('resize',reposicionar); W.addEventListener('scroll',reposicionar,{passive:true,capture:true});
  W.addEventListener('keydown',function(e){ if(!E.guia) return; if(e.key==='Escape') fimGuia(); else if(emTour&&e.key==='ArrowRight') proximoPasso(); else if(emTour&&e.key==='ArrowLeft') passoAnterior(); });
  D.addEventListener('pointerdown',function(e){ if(E.guia&&!emTour&&!raiz.contains(e.target)) fimGuia(); },true);

  /* tour: uma barrinha embaixo com anterior, próximo e sair; avança sozinho a cada 6 segundos */
  var PASSOS=[['aba_inicio','Bem-vindo ao tour! Aqui é a <b>Início</b>: resumo do mês e atalhos.'],['aba_aniv','Em <b>Aniversariantes</b> fica a lista de cada mês.'],
    ['importar_lista','Comece por aqui: <b>Importar lista</b>, uma pessoa por linha.'],['meses','Troque o <b>mês</b> por aqui.'],['gerar_mes','<b>Gerar artes do mês</b> cria tudo de uma vez.'],
    ['zip','<b>Baixar todas (ZIP)</b> entrega as artes num arquivo só.'],['aba_colab','Em <b>Colaboradores</b> ficam os cadastros e as fotos.'],
    ['importar_pasta','<b>Importar pasta</b>: uma subpasta com o nome de cada pessoa.'],['aba_arte','No estúdio de <b>Arte</b> você ajusta cada arte.'],
    ['aba_novos','<b>Novos colaboradores</b>: as artes de boas-vindas.'],['ajustes','E em <b>Ajustes</b> você me personaliza. Fim do tour, bip-bop!']];
  var passo=0, hud=null, barraAnim=null, abaAntesTour=null;
  function hudTour(){
    if(hud) return hud;
    hud=el('div','dx-tour'); hud.setAttribute('role','region'); hud.setAttribute('aria-label','Tour do Dex');
    hud.innerHTML='<button type="button" data-t="ant" aria-label="Passo anterior">'+IC.esq+'</button><div class="dx-tour-meio"><span></span><div class="dx-tour-barra"><i></i></div></div>'+
      '<button type="button" data-t="prox" aria-label="Próximo passo">'+IC.dir+'</button><button type="button" class="dx-sair" data-t="sair">Sair</button>';
    D.body.appendChild(hud);
    hud.querySelector('[data-t="ant"]').onclick=passoAnterior; hud.querySelector('[data-t="prox"]').onclick=proximoPasso; hud.querySelector('[data-t="sair"]').onclick=fimGuia;
    hud.addEventListener('pointerenter',function(){ if(barraAnim) barraAnim.pause(); }); hud.addEventListener('pointerleave',function(){ if(barraAnim) barraAnim.play(); });
    var x0=null; hud.addEventListener('pointerdown',function(e){ x0=e.clientX; }); hud.addEventListener('pointerup',function(e){ if(x0==null) return; var dx=e.clientX-x0; x0=null; if(dx<-50) proximoPasso(); else if(dx>50) passoAnterior(); });
    M.anima(hud,[{opacity:0,transform:'translateX(-50%) translateY(30px) scale(.9)'},{opacity:1,transform:'translateX(-50%)'}],'pula');
    return hud;
  }
  function fecharHudTour(){ if(!hud) return; var h=hud; hud=null; if(barraAnim){ barraAnim.cancel(); barraAnim=null; }
    var a=M.anima(h,[{opacity:1},{opacity:0,transform:getComputedStyle(h).transform+' translateY(20px)'}],'rapida',{fill:'forwards'}); if(a) a.finished.then(function(){ h.remove(); },function(){ h.remove(); }); else h.remove(); }
  async function irPasso(i){
    passo=Math.max(0,Math.min(PASSOS.length-1,i)); var h=hudTour();
    h.querySelector('.dx-tour-meio span').innerHTML='<em>'+(passo+1)+'/'+PASSOS.length+'</em>'+PASSOS[passo][1].replace(/<[^>]+>/g,'').split(':')[0].split('.')[0];
    h.querySelector('[data-t="ant"]').disabled=passo===0;
    if(barraAnim){ barraAnim.cancel(); barraAnim=null; }
    var ok=await irPara(PASSOS[passo][0],PASSOS[passo][1]);
    if(!emTour) return;
    if(!ok){ if(passo<PASSOS.length-1) return irPasso(passo+1); return fimGuia(); }
    var i2=h.querySelector('.dx-tour-barra i'); barraAnim=i2.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:6500,easing:'linear',fill:'forwards'});
    barraAnim.onfinish=function(){ if(emTour) proximoPasso(); };
  }
  function proximoPasso(){ if(!emTour) return; if(passo>=PASSOS.length-1){ var t=abaAntesTour; fimGuia(); if(t&&W.setTab) setTimeout(function(){ W.setTab(t); },300); return; } irPasso(passo+1); }
  function passoAnterior(){ if(emTour&&passo>0) irPasso(passo-1); }
  function tour(){ if(emTour) return; clearTimeout(guiaTimer); abaAntesTour=typeof state!=='undefined'?state.tab:null; emTour=true; irPasso(0); }

  /* =================================================================== 9. CHAT: CABEÇALHO, GESTOS E CONSUMO */
  var API='/api/dex', hist=[], modoIA='local', localAte=0, avisouLocal=false, INFO={}, ocupado=false;
  var USO=(function(){ var u={}; try{ u=JSON.parse(LS.get('dex-uso','{}'))||{}; }catch(e){} return u; })();
  function hojeK(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function usoDia(){ if(USO.dia!==hojeK()){ USO.dia=hojeK(); USO.perguntas=0; USO.entrada=0; USO.saida=0; USO.ms=0; USO.locais=0; USO.hist=[]; } return USO; }
  function salvarUso(){ LS.set('dex-uso',JSON.stringify(USO)); }
  usoDia();
  var head=chat&&chat.querySelector('.ai-chat-head'), btUso=null, folha=null, cortina=null;
  (function montarCabecalho(){
    if(!head) return;
    var tit=head.querySelector('.ai-title'); if(tit) tit.appendChild(el('span','dx-st','<i></i><em>conectando…</em><span class="dx-onda"><b></b><b></b><b></b><b></b></span>'));
    btUso=el('button','dx-bt dx-uso','<svg class="dx-ring" viewBox="0 0 34 34"><circle class="f" cx="17" cy="17" r="14"/><circle class="a" cx="17" cy="17" r="14" stroke-dasharray="88" stroke-dashoffset="88"/></svg><span>IA</span>');
    btUso.type='button'; btUso.title='Meu consumo'; btUso.setAttribute('aria-label','Ver o consumo da IA'); btUso.onclick=function(){ abrirFolha(); };
    var aj=el('button','dx-bt',IC.eng); aj.type='button'; aj.title='Estúdio do Dex'; aj.setAttribute('aria-label','Abrir o Estúdio do Dex'); aj.onclick=function(){ abrirEstudio(); };
    var x=D.getElementById('aiClose'); head.insertBefore(btUso,x); head.insertBefore(aj,x);
    cortina=el('div','dx-cortina'); folha=el('div','dx-folha'); folha.setAttribute('role','dialog'); folha.setAttribute('aria-label','Consumo da IA');
    chat.appendChild(cortina); chat.appendChild(folha); cortina.onclick=function(){ fecharFolha(); };
    /* arrastar o topo para baixo fecha o chat */
    var y0=null,yv=0,lt=0,ly=0;
    head.addEventListener('pointerdown',function(e){ if(e.target.closest('button,input')||e.button!==0) return; y0=ly=e.clientY; lt=performance.now(); yv=0; head.setPointerCapture(e.pointerId); });
    head.addEventListener('pointermove',function(e){ if(y0==null) return; var dy=e.clientY-y0; dy=dy<0?-Math.sqrt(-dy)*2:dy; chat.style.translate='0 '+dy+'px';
      var t=performance.now(); yv=(e.clientY-ly)/Math.max(1,t-lt); ly=e.clientY; lt=t; });
    var soltar=function(e){ if(y0==null) return; var dy=e.clientY-y0; y0=null;
      if(dy>110||(dy>30&&yv>.7)){ var a=M.anima(chat,[{translate:'0 '+Math.max(0,dy)+'px'},{translate:'0 110%'}],'rapida',{fill:'forwards'}); var f=function(){ fecharChat(); setTimeout(function(){ chat.style.translate=''; if(a) a.cancel(); },320); }; if(a) a.finished.then(f,f); else f(); }
      else { M.anima(chat,[{translate:'0 '+dy+'px'},{translate:'0 0'}],'pula'); chat.style.translate=''; } };
    head.addEventListener('pointerup',soltar); head.addEventListener('pointercancel',soltar);
    var chips=chat.querySelector('.ak-chips'); if(chips) M.arrastar(chips);
    if(form) form.addEventListener('submit',function(){ var b=form.querySelector('button[type="submit"]'); if(b) M.anima(b,[{transform:'scale(1)'},{transform:'scale(.8) rotate(-25deg)',offset:.35},{transform:'scale(1.12) rotate(0)',offset:.7},{transform:'scale(1)'}],'suave'); });
  })();
  function textoModo(){ return modoIA==='ia'?'online · com IA':modoIA==='limite'?'IA no limite · modo local':'modo local · respostas básicas'; }
  /* o Groq informa quanto falta para a cota encher de novo (ex.: "2m52.8s"); ela se recupera aos poucos,
     então a cota de agora é estimada a partir da última leitura e do tempo que passou */
  function duracao(t){ if(t==null||t==='') return null; t=String(t); var m=t.match(/^(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m(?!s))?(?:(\d+(?:\.\d+)?)s)?(?:(\d+(?:\.\d+)?)ms)?$/);
    if(!m) return isNaN(+t)?null:+t; return (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0)+(+m[4]||0)/1000; }
  function quando(seg){ if(seg==null) return ''; if(seg<60) return 'menos de 1 min'; if(seg<3600) return Math.round(seg/60)+' min'; var h=Math.floor(seg/3600), mi=Math.round((seg%3600)/60); return h+' h'+(mi?' '+mi+' min':''); }
  function estimar(lim,rest,reset,quandoMs){
    if(!lim||rest==null) return null; var falta=lim-rest, cheio=duracao(reset), passou=quandoMs?Math.max(0,(Date.now()-quandoMs)/1000):0;
    if(cheio==null||cheio<=0||falta<=0) return {livre:rest,lim:lim,cheioEm:falta>0?null:0};
    return {livre:Math.min(lim,Math.round(rest+falta*Math.min(1,passou/cheio))),lim:lim,cheioEm:Math.max(0,cheio-passou)};
  }
  function cota(){ var u=USO.ultimo||{}, l=u.limites||{}; return estimar(l.req_limite_dia,l.req_restantes_dia,l.reset_req,u.quando); }
  function folego(){ var u=USO.ultimo||{}, l=u.limites||{}; return estimar(l.tok_limite_min,l.tok_restantes_min,l.reset_tok,u.quando); }
  function pctCota(){ var c=cota(); return c?Math.max(0,Math.min(1,c.livre/c.lim)):null; }
  function atualizarCabecalho(){
    if(!chat) return; chat.setAttribute('data-dex',modoIA);
    var st=chat.querySelector('.dx-st em'); if(st) st.textContent=E.pensando?'pensando':textoModo();
    if(btUso){ var p=pctCota(), a=btUso.querySelector('.a'); a.style.strokeDashoffset=(88*(1-(p==null?0:p))).toFixed(1); a.style.stroke=p!=null&&p<.15?'#ffb35c':'#fff';
      btUso.querySelector('span').textContent=p==null?'IA':Math.round(p*100)+'%'; }
  }
  /* painel de consumo: uma folha que sobe de baixo e desce com um arrasto */
  function abrirFolha(){
    if(!folha) return; renderFolha(); folha.classList.add('on'); cortina.classList.add('on');
    M.anima(folha,[{transform:'translateY(105%)'},{transform:'none'}],'morph');
    folha.querySelectorAll('.dx-hero,.dx-trio > div,.dx-bloco,.dx-info,.dx-acoes').forEach(function(n,i){ M.anima(n,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],'calma',{delay:80+i*45,fill:'backwards'}); });
    var a=folha.querySelector('.dx-hero-ring .a'); if(a){ var alvo=a.getAttribute('data-off'); M.anima(a,[{strokeDashoffset:'339'},{strokeDashoffset:alvo}],'calma',{delay:120,fill:'backwards'}); }
    folha.querySelectorAll('.dx-trilho i').forEach(function(i){ M.anima(i,[{transform:'scaleX(0)'},{transform:'scaleX('+i.style.getPropertyValue('--v')+')'}],'calma',{delay:260,fill:'backwards'}); });
    folha.querySelectorAll('.dx-barras i').forEach(function(i,k){ M.anima(i,[{transform:'scaleY(0)'},{transform:'none'}],'pula',{delay:300+k*30,fill:'backwards'}); });
    folha.querySelectorAll('[data-conta]').forEach(function(n){ M.contar(n,+n.getAttribute('data-conta'),900); });
    reagir('feliz',900);
  }
  function fecharFolha(rapido){
    if(!folha||!folha.classList.contains('on')) return; cortina.classList.remove('on');
    if(rapido){ folha.classList.remove('on'); return; }
    var a=M.anima(folha,[{transform:'none'},{transform:'translateY(105%)'}],'rapida',{fill:'forwards'}); var f=function(){ folha.classList.remove('on'); if(a) a.cancel(); };
    if(a) a.finished.then(f,f); else f();
  }
  function renderFolha(){
    usoDia(); var u=USO.ultimo||{}, c=cota(), fo=folego(), p=pctCota(), tpm=fo?fo.livre/fo.lim:null;
    var hs=(USO.hist||[]).slice(-14), mx=Math.max.apply(null,hs.concat([1])), media=USO.perguntas&&USO.ms>0?Math.round(USO.ms/USO.perguntas):null, tok=(USO.entrada||0)+(USO.saida||0);
    var minutos=u.quando?Math.round((Date.now()-u.quando)/60000):null;
    var h='<div class="dx-pega"></div><header><b>Meu consumo</b><small>'+(minutos==null?'hoje':minutos<1?'atualizado agora':'atualizado há '+minutos+' min')+'</small></header>';
    if(p==null&&!USO.perguntas){
      h+='<div class="dx-vazio">'+svgInteiro('dex-fixo dex-thumb')+'<p>'+(modoIA==='ia'?'Ainda não respondi nada com IA hoje. Faça uma pergunta e eu mostro aqui quanto gastei e quanto ainda sobra.':'Estou no modo local agora, sem gastar IA. Quando a IA estiver ligada, o consumo aparece aqui.')+'</p></div>';
    } else {
      var off=(339*(1-(p==null?0:p))).toFixed(1);
      h+='<div class="dx-hero"><div class="dx-hero-ring"><svg viewBox="0 0 118 118"><defs><linearGradient id="dxGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9aa1ac"/></linearGradient></defs>'+
          '<circle class="f" cx="59" cy="59" r="54"/><circle class="a" cx="59" cy="59" r="54" stroke-dasharray="339" stroke-dashoffset="'+off+'" data-off="'+off+'"/></svg>'+
          '<b>'+(p==null?'—':'<span data-conta="'+Math.round(p*100)+'">0</span><small>%</small>')+'</b><em>livre agora</em></div>'+
        '<div class="dx-hero-txt"><strong>'+(p==null?'Cota ainda não medida':p<.15?'A cota está acabando':p<.5?'Ainda dá para muita conversa':'Tem bastante IA disponível')+'</strong>'+
          '<p>'+(p==null?'Faça uma pergunta para eu medir.':'Cerca de '+fmt(c.livre)+' de '+fmt(c.lim)+' perguntas livres para toda a equipe. A cota se recupera aos poucos ao longo do dia.')+'</p>'+
          (c&&c.cheioEm>0?'<span class="dx-chip">cheia de novo em '+quando(c.cheioEm)+'</span>':c&&c.cheioEm===0?'<span class="dx-chip">cota cheia</span>':'')+'</div></div>'+
        '<div class="dx-trio"><div><b data-conta="'+(USO.perguntas||0)+'">0</b><span>perguntas suas hoje</span></div><div><b>'+mil(tok)+'</b><span>tokens gastos</span></div><div><b>'+(media?seg1(media):'—')+'</b><span>resposta média</span></div></div>'+
        '<div class="dx-bloco"><h6>Fôlego agora <span>'+(fo?fmt(fo.livre)+' de '+fmt(fo.lim)+' tokens por minuto':'—')+'</span></h6><div class="dx-trilho'+(tpm!=null&&tpm<.2?' baixo':'')+'"><i style="--v:'+(tpm==null?0:tpm.toFixed(3))+'"></i></div>'+
          '<p>É o limite por minuto. Se acabar, espero alguns segundos e volto a responder.</p></div>'+
        (hs.length?'<div class="dx-bloco"><h6>Tamanho das últimas respostas <span>tokens</span></h6><div class="dx-barras">'+hs.map(function(v){ return '<i style="--h:'+Math.max(.08,v/mx).toFixed(3)+'" title="'+fmt(v)+' tokens"></i>'; }).join('')+'</div></div>':'');
    }
    h+='<div class="dx-info"><span>'+esc(String(u.modelo||(INFO.modelos&&INFO.modelos[0])||'sem IA').replace(/^.*\//,''))+(u.provedor||INFO.provedor?' · '+esc(u.provedor||INFO.provedor):'')+'</span><span>'+fmt(USO.locais||0)+' respostas sem IA hoje (de graça)</span></div>'+
      '<div class="dx-acoes"><button type="button" class="pri" data-a="testar">Testar conexão</button><button type="button" data-a="zerar">Zerar contagem</button></div>';
    folha.innerHTML=h; aplicarVisual();
    folha.querySelector('[data-a="testar"]').onclick=function(){ var b=this; b.textContent='Testando…'; checar().then(function(){ b.textContent=modoIA==='ia'?'Conectado':'Sem IA'; reagir(modoIA==='ia'?'comemorando':'triste',1400); }); };
    folha.querySelector('[data-a="zerar"]').onclick=function(){ USO.dia=''; usoDia(); salvarUso(); renderFolha(); M.anima(folha,[{transform:'scale(.98)'},{transform:'none'}],'pula'); reagir('surpresa',700); };
    var y0=null; folha.querySelector('.dx-pega').parentNode.querySelector('header').style.touchAction='none';
    [folha.querySelector('.dx-pega'),folha.querySelector('header')].forEach(function(z){
      z.addEventListener('pointerdown',function(e){ y0=e.clientY; z.setPointerCapture(e.pointerId); });
      z.addEventListener('pointermove',function(e){ if(y0==null) return; var dy=Math.max(0,e.clientY-y0); folha.style.translate='0 '+dy+'px'; });
      z.addEventListener('pointerup',function(e){ if(y0==null) return; var dy=e.clientY-y0; y0=null; folha.style.translate='';
        if(dy>90) fecharFolha(); else if(dy>0) M.anima(folha,[{translate:'0 '+dy+'px'},{translate:'0 0'}],'pula'); });
    });
  }
  function cartaoStatus(){
    usoDia(); var b=el('div','ai-msg bot dex-ia'), p=pctCota(), c=cota();
    b.innerHTML='<div class="dex-txt">'+esc(CFG.jeito==='formal'?'Resumo do meu consumo hoje:':'Raio-X do meu cérebro de robô:')+'\n• '+esc(textoModo())+'\n• '+fmt(USO.perguntas)+' perguntas e '+mil((USO.entrada||0)+(USO.saida||0))+' tokens hoje'+
      (p!=null?'\n• '+Math.round(p*100)+'% da cota da equipe livre agora'+(c&&c.cheioEm>0?' (cheia de novo em '+quando(c.cheioEm)+')':''):'')+'\n• '+fmt(USO.locais||0)+' respostas sem gastar IA</div>';
    msgs.appendChild(b); rolar();
    var g=el('div','ak-btns'), x=el('button','ak-btn pri','Ver o painel completo'); x.type='button'; x.onclick=abrirFolha; g.appendChild(x); b.appendChild(g); reagir('feliz',1400);
  }

  /* =================================================================== 10. ESTÚDIO DO DEX */
  var TEMAS_CHAT=[['noite','Noite','linear-gradient(160deg,#2a2d34,#0c0d10)'],['grafite','Grafite','linear-gradient(160deg,#3c4048,#26292f)'],
    ['nevoa','Névoa','linear-gradient(160deg,#ffffff,#e9ebef)'],['auto','Automático','linear-gradient(135deg,#ffffff 0 50%,#0c0d10 50% 100%)']];
  var est=null, abaEst='visual', ABAS=[['visual','Visual'],['fantasias','Fantasias'],['conversa','Conversa'],['jeito','Jeito']];
  function pilula(box,animar){
    var sel=box.querySelector('[aria-pressed="true"],[aria-selected="true"]'), pol=box.querySelector('.dx-pol'); if(!sel||!pol) return;
    var novo={x:sel.offsetLeft,y:sel.offsetTop,w:sel.offsetWidth,h:sel.offsetHeight}, ant=pol.__box;
    pol.style.width=novo.w+'px'; pol.style.height=novo.h+'px'; pol.style.transform='translate('+(novo.x-0)+'px,'+(novo.y-0)+'px)';
    if(animar&&ant&&(ant.x!==novo.x||ant.y!==novo.y)){ var dx=0;
      M.anima(pol,[{transform:'translate('+(ant.x-dx)+'px,'+(ant.y-dx)+'px) scale('+(ant.w/novo.w).toFixed(3)+','+(ant.h/novo.h).toFixed(3)+')'},{transform:pol.style.transform}],'suave'); }
    pol.__box=novo;
  }
  function seg(k,ops){ return '<div class="dx-seg" data-k="'+k+'"><i class="dx-pol"></i>'+ops.map(function(o){ return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(valor(k)===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>'; }
  function sw(k,txt,sub){ return '<div class="dx-linha"><div>'+txt+(sub?'<small>'+sub+'</small>':'')+'</div><button type="button" class="dx-sw" role="switch" data-k="'+k+'" aria-checked="'+(valor(k)==='sim')+'" aria-label="'+esc(txt)+'"></button></div>'; }
  function valor(k){ if(k==='__orb') return H.getAttribute('data-ak-orb')==='nao'?'nao':'sim'; if(k==='__leve') return M.modoLeve(); return CFG[k]; }
  function definir(k,v){
    if(k==='__orb'){ if(v==='nao'){ LS.set('ak-orb','nao'); H.setAttribute('data-ak-orb','nao'); } else { LS.del('ak-orb'); H.removeAttribute('data-ak-orb'); } }
    else if(k==='__leve') M.definirLeve(v);
    else { CFG[k]=v; salvar(); aplicarCfg(); }
  }
  function grade(tipo){ return '<div class="dx-grade" data-g="'+tipo+'">'+FANT[tipo].map(function(o){ return '<button type="button" class="dx-card dx-toque" data-v="'+o[0]+'" aria-pressed="'+(CFG[tipo]===o[0])+'">'+miniatura(tipo,o[0])+'<span>'+esc(o[1])+'</span></button>'; }).join('')+'</div>'; }
  function montarEstudio(){
    est=D.createElement('dialog'); est.id='dexStudio'; est.className='dx-est'; est.setAttribute('aria-label','Estúdio do Dex');
    var i=temaAtual();
    est.innerHTML='<div class="dx-est-in">'+
      '<div class="dx-est-palco"><div class="dx-est-dex">'+corpoHTML('dex-vivo dex-prev')+'</div>'+
        '<input class="dx-est-nome" maxlength="16" aria-label="Nome do assistente" value="'+esc(CFG.nome)+'">'+
        '<div class="dx-est-tema"><button type="button" data-tm="-1" aria-label="Fantasia anterior">‹</button><span>'+(i<0?'Personalizado':TEMAS[i][0])+'</span><button type="button" data-tm="1" aria-label="Próxima fantasia">›</button></div>'+
        '<p class="dx-est-dica">Arraste o Dex para os lados para trocar de fantasia</p></div>'+
      '<div class="dx-est-lado"><header><b>Estúdio do Dex</b><button type="button" data-x aria-label="Fechar">×</button></header>'+
        '<div class="dx-abas" role="tablist"><i class="dx-pol"></i>'+ABAS.map(function(a,n){ return '<button type="button" role="tab" data-aba="'+a[0]+'" aria-selected="'+(n===0)+'">'+a[1]+'</button>'; }).join('')+'</div>'+
        '<div class="dx-paineis">'+
          '<div class="dx-painel" data-p="visual"><span class="dx-rot">Tamanho</span>'+seg('tam',[['p','Pequeno'],['m','Médio'],['g','Grande']])+
            '<span class="dx-rot">Cor dos olhos</span><div class="dx-cores">'+Object.keys(OLHOS).map(function(k){ return '<button type="button" data-cor="'+k+'" style="background:'+OLHOS[k]+'" aria-label="'+k+'" aria-pressed="'+(CFG.olhos===k)+'"></button>'; }).join('')+'</div>'+
            '<span class="dx-rot">Acabamento</span>'+seg('acab',[['claro','Claro'],['grafite','Grafite']])+
            '<span class="dx-rot">Lado da tela</span>'+seg('lado',[['direita','Direita'],['esquerda','Esquerda']])+
            '<span class="dx-rot">Tema do chat</span><div class="dx-temas">'+TEMAS_CHAT.map(function(t){ return '<button type="button" class="dx-tema dx-toque" data-tc="'+t[0]+'" aria-pressed="'+(CFG.tema===t[0])+'"><i style="background:'+t[2]+'"></i>'+t[1]+'</button>'; }).join('')+'</div>'+
            '<p class="dx-nota">Vale para o chat, o painel de consumo, o estúdio e os carregamentos.</p></div>'+
          '<div class="dx-painel" data-p="fantasias" hidden><span class="dx-rot">Temas prontos</span><div class="dx-carrossel">'+TEMAS.map(function(t,n){ return '<button type="button" class="dx-card dx-toque" data-t="'+n+'" aria-pressed="'+(n===i)+'">'+miniatura('tema',t[1])+'<span>'+t[0]+'</span></button>'; }).join('')+'</div>'+
            '<span class="dx-rot">Cabeça</span>'+grade('cab')+'<span class="dx-rot">Rosto</span>'+grade('rosto')+'<span class="dx-rot">Roupa</span>'+grade('corpo')+
            '<span class="dx-rot">Época</span><div class="dx-lista">'+sw('epoca','Fantasia da época automática','Papai Noel em dezembro e coelho na Páscoa, quando nenhuma fantasia está escolhida')+'</div></div>'+
          '<div class="dx-painel" data-p="conversa" hidden><span class="dx-rot">Jeito de conversar</span><div class="dx-jeitos">'+
            [['divertido','Divertido','"Bip-bop! Bora deixar essas artes prontas?"'],['equilibrado','Equilibrado','"Claro! Vou te mostrar onde fica."'],['formal','Formal','"Certamente. Siga os passos abaixo."']].map(function(j){ return '<button type="button" class="dx-jeito dx-toque" data-j="'+j[0]+'" aria-pressed="'+(CFG.jeito===j[0])+'"><b>'+j[1]+'</b><span>'+j[2]+'</span></button>'; }).join('')+'</div>'+
            '<span class="dx-rot">Idioma das respostas</span>'+seg('idioma',[['pt','Português'],['en','English'],['es','Español']])+
            '<p class="dx-nota">O jeito e o idioma valem para as respostas com IA. As respostas do modo local continuam em português.</p></div>'+
          '<div class="dx-painel" data-p="jeito" hidden><span class="dx-rot">Animações</span>'+seg('anim',[['sutil','Sutis'],['normal','Normais'],['expressiva','Expressivas']])+
            '<span class="dx-rot">Comportamento</span><div class="dx-lista">'+sw('truques','Truques quando estou parado','Espreguiçar, pirueta, pulinho')+sw('seguir','Seguir o mouse com o olhar')+sw('balao','Dicas em balão')+sw('__orb','Mostrar o Dex na tela')+'</div>'+
            '<span class="dx-rot">Desempenho</span>'+seg('__leve',[['auto','Automático'],['sim','Modo leve'],['nao','Completo']])+
            '<p class="dx-nota">No automático, computadores mais simples recebem a versão leve: os efeitos mais caros saem e as animações continuam.</p></div>'+
        '</div>'+
        '<footer class="dx-est-pe"><button type="button" data-a="padrao">Restaurar padrão</button><button type="button" data-a="tour">Fazer o tour</button><button type="button" class="pri" data-a="ok">Concluído</button></footer>'+
      '</div></div>';
    D.body.appendChild(est);
    var palco=est.querySelector('.dx-est-palco'), dexBox=est.querySelector('.dx-est-dex');
    est.querySelector('[data-x]').onclick=fecharEstudio; est.querySelector('[data-a="ok"]').onclick=fecharEstudio;
    est.addEventListener('cancel',function(e){ e.preventDefault(); fecharEstudio(); });
    est.querySelector('[data-a="tour"]').onclick=function(){ fecharEstudio(); try{ D.getElementById('settingsDlg').close(); }catch(e){} setTimeout(tour,450); };
    est.querySelector('[data-a="padrao"]').onclick=function(){ for(var k in PADRAO) CFG[k]=PADRAO[k]; salvar(); aplicarCfg(); est.querySelector('.dx-est-nome').value=CFG.nome; marcarEstudio(true); trocarFantasiaVisual(0); reagir('feliz',1000); };
    var nm=est.querySelector('.dx-est-nome'); nm.oninput=function(){ CFG.nome=nm.value.trim().slice(0,16)||'Dex'; salvar(); aplicarNome(); };
    est.querySelectorAll('.dx-abas button').forEach(function(b){ b.onclick=function(){ trocarAbaEst(b.dataset.aba); }; });
    est.querySelectorAll('.dx-seg').forEach(function(g){ g.querySelectorAll('button').forEach(function(b){ b.onclick=function(){ definir(g.dataset.k,b.dataset.v); marcarEstudio(true); reagir(g.dataset.k==='anim'&&b.dataset.v==='expressiva'?'comemorando':'feliz',1000); pular(); }; }); });
    est.querySelectorAll('.dx-sw').forEach(function(s){ s.onclick=function(){ var on=s.getAttribute('aria-checked')!=='true'; definir(s.dataset.k,on?'sim':'nao'); s.setAttribute('aria-checked',String(on)); reagir(on?'feliz':'surpresa',900); }; });
    est.querySelectorAll('.dx-cores button').forEach(function(b){ b.onclick=function(){ definir('olhos',b.dataset.cor); marcarEstudio(true); M.anima(b,[{transform:'scale(.8)'},{transform:'none'}],'pula'); reagir('amor',900); }; });
    est.querySelectorAll('.dx-tema').forEach(function(b){ b.onclick=function(){ definir('tema',b.dataset.tc); marcarEstudio(true); reagir('surpresa',600); setTimeout(function(){ reagir('feliz',900); },600); }; });
    est.querySelectorAll('.dx-jeito').forEach(function(b){ b.onclick=function(){ definir('jeito',b.dataset.j); marcarEstudio(true); reagir(b.dataset.j==='divertido'?'comemorando':b.dataset.j==='formal'?'surpresa':'feliz',1200); }; });
    est.querySelectorAll('.dx-grade').forEach(function(g){ g.querySelectorAll('.dx-card').forEach(function(b){ b.onclick=function(){ CFG[g.dataset.g]=b.dataset.v; salvar(); aplicarCfg(); marcarEstudio(true); estalo(b); reagir(b.dataset.v==='natal'?'comemorando':'amor',1200); pular(); }; }); });
    est.querySelectorAll('.dx-carrossel .dx-card').forEach(function(b){ b.onclick=function(){ trocarFantasiaVisual(+b.dataset.t); estalo(b); }; });
    est.querySelectorAll('[data-tm]').forEach(function(b){ b.onclick=function(){ var i=temaAtual(); trocarFantasiaVisual(((i<0?0:i)+(+b.dataset.tm)+TEMAS.length)%TEMAS.length,+b.dataset.tm); }; });
    M.arrastar(est.querySelector('.dx-carrossel'));
    /* arrastar o Dex no palco troca a fantasia */
    var x0=null,vx=0,lt=0,lx=0;
    palco.addEventListener('pointerdown',function(e){ if(e.target.closest('button,input')) return; x0=lx=e.clientX; lt=performance.now(); vx=0; palco.setPointerCapture(e.pointerId); palco.classList.add('arrastando'); });
    palco.addEventListener('pointermove',function(e){ if(x0==null) return; var dx=e.clientX-x0; dexBox.style.transform='translateX('+(dx*.7)+'px) rotate('+(dx*.04)+'deg)'; var t=performance.now(); vx=(e.clientX-lx)/Math.max(1,t-lt); lx=e.clientX; lt=t; });
    var fim=function(e){ if(x0==null) return; var dx=e.clientX-x0; x0=null; palco.classList.remove('arrastando');
      if(Math.abs(dx)>70||Math.abs(vx)>.6){ var d=dx<0?1:-1, i=temaAtual(); trocarFantasiaVisual(((i<0?0:i)+d+TEMAS.length)%TEMAS.length,d,dx*.7); }
      else { M.anima(dexBox,[{transform:dexBox.style.transform||'none'},{transform:'none'}],'pula'); dexBox.style.transform=''; if(Math.abs(dx)<5){ truque('pirueta',[dexBox.querySelector('.dex-corpo')]); reagir('feliz',1100); } } };
    palco.addEventListener('pointerup',fim); palco.addEventListener('pointercancel',fim);
    aplicarVisual();
  }
  function estalo(b){ var s=b.querySelector('.dex-svg'); if(s) M.anima(s,[{transform:'scale(.82) rotate(-6deg)'},{transform:'none'}],'pula'); }
  /* trocar de fantasia: o Dex dá meia-volta (como uma carta), troca de roupa no meio do giro e volta com mola macia */
  var trocando=null;
  /* troca de roupa: ele toma impulso, pula, a roupa antiga se dissolve no ar e ele aterrissa com a nova */
  var trocaFantasma=null, trocaTimer=0;
  function trocarFantasiaVisual(i,dir,desde){
    var t=TEMAS[i][1], box=est&&est.querySelector('.dx-est-dex'), d=dir||1;
    var aplicar=function(){ CFG.cab=t.cab; CFG.rosto=t.rosto; CFG.corpo=t.corpo; salvar(); aplicarCfg(); marcarEstudio(true); };
    var corpoEl=box&&box.querySelector('.dex-corpo');
    if(!box||!corpoEl||parado()){ aplicar(); return; }
    if(trocando) trocando.cancel(); if(trocaFantasma) trocaFantasma.remove();
    var x0=desde||0, X=function(f){ return 'translateX('+Math.round(x0*f)+'px) '; };
    trocando=box.animate([
      {transform:X(1)+'none',easing:'cubic-bezier(.3,0,.5,1)'},
      {offset:.16,transform:X(.8)+'translateY(5px) scale(1.07,.9)',easing:'cubic-bezier(.2,.7,.3,1)'},
      {offset:.46,transform:X(.35)+'translateY(-24px) scale(.95,1.06) rotate('+(d*4)+'deg)',easing:'cubic-bezier(.5,0,.7,.4)'},
      {offset:.68,transform:X(.1)+'translateY(3px) scale(1.06,.93)',easing:'cubic-bezier(.3,.7,.4,1)'},
      {offset:.84,transform:X(0)+'translateY(-3px) scale(.99,1.015)',easing:'ease-in-out'},
      {transform:'none'}],{duration:860});
    trocando.finished.then(function(){ trocando=null; },function(){});
    clearTimeout(trocaTimer); trocaTimer=setTimeout(function(){
    /* cópia com a roupa atual, no mesmo passo da flutuação do original */
    var velho=corpoEl.cloneNode(true), sv=corpoEl.querySelector('.dex-svg'), attrs={cab:sv.getAttribute('data-cab'),rosto:sv.getAttribute('data-rosto'),corpo:sv.getAttribute('data-corpo')};
    velho.classList.add('dx-roupa-velha'); velho.setAttribute('aria-hidden','true'); [].forEach.call(velho.querySelectorAll('.dex-svg'),function(x){ x.classList.add('dex-thumb'); x.classList.remove('dex-prev'); }); box.appendChild(velho); trocaFantasma=velho;
    var o1=[corpoEl].concat([].slice.call(corpoEl.querySelectorAll('*'))), o2=[velho].concat([].slice.call(velho.querySelectorAll('*')));
    o1.forEach(function(e,k){ var a1=e.getAnimations?e.getAnimations():[], a2=o2[k]&&o2[k].getAnimations?o2[k].getAnimations():[]; a2.forEach(function(an,j){ if(a1[j]) an.currentTime=a1[j].currentTime; }); });
    aplicar();
    var sv2=velho.querySelector('.dex-svg'); sv2.setAttribute('data-cab',attrs.cab); sv2.setAttribute('data-rosto',attrs.rosto); sv2.setAttribute('data-corpo',attrs.corpo);
    /* a roupa velha some no alto do pulo, com um brilho suave */
    var some=velho.animate([{opacity:1,filter:'blur(0)',transform:'scale(1)'},{opacity:0,filter:'blur(3px)',transform:'scale(1.05) translateY(-4px)'}],{duration:300,delay:0,easing:'cubic-bezier(.4,0,.6,1)',fill:'both'});
    some.finished.then(function(){ velho.remove(); if(trocaFantasma===velho) trocaFantasma=null; },function(){ velho.remove(); });
    var luz=document.createElement('i'); luz.className='dx-troca-luz'; box.appendChild(luz);
    luz.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.5)'},{opacity:.9,offset:.35},{opacity:0,transform:'translate(-50%,-50%) scale(1.35)'}],{duration:620,delay:0,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).finished.then(function(){ luz.remove(); },function(){ luz.remove(); });
    },240);
    setTimeout(function(){ reagir(t.cab==='natal'?'comemorando':'feliz',1300); },560);
    var nomeT=est.querySelector('.dx-est-tema span'); M.anima(nomeT,[{opacity:0,transform:'translateY('+(d*10)+'px)',filter:'blur(3px)'},{opacity:1,transform:'none',filter:'none'}],'suave',{delay:260,fill:'backwards'});
  }
  function marcarEstudio(animar){
    if(!est) return; var i=temaAtual();
    est.querySelector('.dx-est-tema span').textContent=i<0?'Personalizado':TEMAS[i][0];
    est.querySelectorAll('.dx-seg').forEach(function(g){ var v=valor(g.dataset.k); g.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.v===v)); }); pilula(g,animar); });
    est.querySelectorAll('.dx-sw').forEach(function(s){ s.setAttribute('aria-checked',String(valor(s.dataset.k)==='sim')); });
    est.querySelectorAll('.dx-cores button').forEach(function(b){ b.setAttribute('aria-pressed',String(CFG.olhos===b.dataset.cor)); });
    est.querySelectorAll('.dx-jeito').forEach(function(b){ b.setAttribute('aria-pressed',String(CFG.jeito===b.dataset.j)); });
    est.querySelectorAll('.dx-tema').forEach(function(b){ b.setAttribute('aria-pressed',String(CFG.tema===b.dataset.tc)); });
    est.querySelectorAll('.dx-grade').forEach(function(g){ g.querySelectorAll('.dx-card').forEach(function(b){ b.setAttribute('aria-pressed',String(CFG[g.dataset.g]===b.dataset.v)); }); });
    est.querySelectorAll('.dx-carrossel .dx-card').forEach(function(b){ b.setAttribute('aria-pressed',String(+b.dataset.t===i)); });
    atualizarCartao();
  }
  function trocarAbaEst(a){
    if(!est||a===abaEst) return; var ord=ABAS.map(function(x){ return x[0]; }), dir=ord.indexOf(a)>ord.indexOf(abaEst)?1:-1, antiga=abaEst; abaEst=a;
    est.querySelectorAll('.dx-abas button').forEach(function(b){ b.setAttribute('aria-selected',String(b.dataset.aba===a)); }); pilula(est.querySelector('.dx-abas'),true);
    var box=est.querySelector('.dx-paineis'), velho=est.querySelector('.dx-painel[data-p="'+antiga+'"]'), novo=est.querySelector('.dx-painel[data-p="'+a+'"]');
    if(velho&&!parado()){ var top=box.scrollTop; velho.classList.add('saindo'); velho.style.top=(14-top)+'px';
      var sai=M.anima(velho,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-dir*28)+'px)'}],'rapida',{fill:'forwards'});
      var f=function(){ velho.hidden=true; velho.classList.remove('saindo'); velho.style.top=''; if(sai) sai.cancel(); }; if(sai) sai.finished.then(f,f); else f(); }
    else if(velho) velho.hidden=true;
    box.scrollTop=0; novo.hidden=false;
    M.anima(novo,[{opacity:0,transform:'translateX('+(dir*34)+'px)'},{opacity:1,transform:'none'}],'suave',{delay:40,fill:'backwards'});
    novo.querySelectorAll('.dx-seg').forEach(function(g){ pilula(g,false); });
    Array.prototype.forEach.call(novo.children,function(c,k){ M.anima(c,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],'calma',{delay:60+k*24,fill:'backwards'}); });
  }
  function abrirEstudio(){
    if(!est) montarEstudio();
    if(!est.open){ try{ est.showModal(); }catch(e){ return; } }
    requestAnimationFrame(function(){ pilula(est.querySelector('.dx-abas'),false); marcarEstudio(false); });
    aplicarVisual(); setTimeout(function(){ reagir('surpresa',500); setTimeout(function(){ reagir('feliz',1200); truque('pula',[est.querySelector('.dx-est-dex .dex-corpo')]); },500); },200);
  }
  function fecharEstudio(){ if(!est||!est.open) return; var a=M.anima(est,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.96) translateY(10px)'}],'rapida',{fill:'forwards'}); var f=function(){ try{ est.close(); }catch(e){} if(a) a.cancel(); }; if(a) a.finished.then(f,f); else f(); }
  /* em Ajustes fica um cartão que abre o estúdio */
  var cartao=null;
  function atualizarCartao(){ if(!cartao) return; var i=temaAtual(); cartao.querySelector('.dx-cartao-ico').innerHTML=miniatura('atual');
    cartao.querySelector('small').textContent=(i<0?'Fantasia personalizada':'Fantasia: '+TEMAS[i][0])+' · jeito '+CFG.jeito; }
  (function(){
    var cx=D.querySelector('#settingsDlg .ak-ajustes'); if(!cx) return;
    var sec=el('section','ak-sec dx-sec'); sec.innerHTML='<h4>Dex, o assistente</h4>';
    cartao=el('button','dx-cartao dx-toque','<span class="dx-cartao-ico"></span><div><b>Estúdio do <span class="dx-nome-atual">'+esc(CFG.nome)+'</span></b><small></small></div><i aria-hidden="true">›</i>');
    cartao.type='button'; cartao.onclick=abrirEstudio; sec.appendChild(cartao); cx.insertBefore(sec,cx.firstChild); atualizarCartao();
    D.querySelectorAll('#settingsDlg .ak-sec').forEach(function(s){ var h=s.querySelector('h4'); if(s!==sec&&h&&/Assistente/.test(h.textContent)){ h.textContent='Chat do Dex';
      s.querySelectorAll('.fgrp').forEach(function(f){ var l=f.querySelector('.fl'); if(l&&/Botão do assistente/.test(l.textContent)) f.style.display='none'; }); } });
  })();
  W.__dexEditor=abrirEstudio;

  /* =================================================================== 11b. PESSOAS: busca precisa e ficha do colaborador */
  /* Acha nomes dentro da frase (com ou sem acento, nome parcial, grafia parecida) usando as
     mesmas regras do app: sobrenome diferente é outra pessoa; só o primeiro nome é parcial. */
  var PARADAS=new Set(('a o e de da do das dos di du em no na nos nas um uma uns umas que quem qual quais quando onde como sobre pra para por com sem ao aos me '+
    'te se eu voce vc voces ele ela eles elas isso esse essa este esta tem ter teve faz fez sao sou ser foi vai vou dar mostra mostre mostrar abre abrir abra fala fale diga diz '+
    'info infos informacao informacoes dados ficha cadastro cadastrado cadastrada colaborador colaboradora colaboradores pessoa pessoas aniversario aniversarios aniversariante '+
    'niver data dia mes foto fotos arte artes ja ainda hoje amanha ta procura procure procurar busca busque buscar buscando acha ache achar encontra encontre encontrar quero queria '+
    'saber sabe preciso pode poderia favor obrigado obrigada oi ola dex sim nao tudo todo toda nome sobrenome status situacao gerar gerada gerado pronta pronto mais menos ver veja '+
    'lista listar quantas quantos qual seu sua dele dela meu minha nosso nossa ou tambem entao aqui ali la isso dela dele perfil detalhes contar conta conte '+
    'proximo proxima proximos proximas ultimo ultima primeiro primeira semana ano novo nova novos novas '+
    'busco procuro acho encontro como funciona fica faco faz fazer importar importo usar uso posso consigo devo existe certo errado ok legal valeu bom boa tarde noite dia').split(' '));
  function normalizar(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
  function pedacos(texto){
    var w=normalizar(texto).replace(/[^a-z\s'-]/g,' ').split(/\s+/).filter(Boolean), grupos=[], g=[];
    w.forEach(function(x){ if(PARADAS.has(x)||x.length<2){ if(g.length) grupos.push(g); g=[]; } else g.push(x); });
    if(g.length) grupos.push(g);
    /* "Ana de Souza": a partícula no meio do nome não quebra o grupo */
    var partes=normalizar(texto).replace(/[^a-z\s'-]/g,' ').split(/\s+/).filter(Boolean), c=[];
    for(var i=0;i<partes.length;i++){ if(!PARADAS.has(partes[i])&&partes[i].length>1){ var j=i, nome=[partes[i]]; while(j+2<partes.length&&/^(de|da|do|dos|das|e)$/.test(partes[j+1])&&!PARADAS.has(partes[j+2])){ nome.push(partes[j+1],partes[j+2]); j+=2; } if(nome.length>1) c.push(nome); } }
    var cands=[]; grupos.concat(c).forEach(function(g){ for(var a=0;a<g.length;a++) for(var b=a+1;b<=Math.min(g.length,a+5);b++) cands.push(g.slice(a,b).join(' ')); });
    return cands.filter(function(x,i,l){ return l.indexOf(x)===i; });
  }
  function entradasDe(p){
    var out=[]; num(function(){ Object.keys(state.months).forEach(function(k){ var rec=state.months[k]; (rec.entries||[]).forEach(function(e){
      if(p.id&&e.personId===p.id) out.push({k:k,e:e}); else if(!e.personId&&compararNomes(e.name,p.name).score>=.84) out.push({k:k,e:e}); }); }); });
    return out;
  }
  function buscarPessoas(texto){
    var cands=pedacos(texto), achados={};
    if(!cands.length) return {cands:cands,lista:[]};
    num(function(){
      cands.forEach(function(c){
        var palavras=c.split(' ').length;
        state.people.forEach(function(p){ var r=compararNomes(c,p.name); if(r.score>0){ var sc=r.score+palavras*.05; if(!achados[p.id]||achados[p.id].score<sc) achados[p.id]={p:p,score:sc,tipo:r.tipo,termo:c}; } });
        /* aniversariantes que estão só na lista do mês (sem cadastro) */
        Object.keys(state.months).forEach(function(k){ (state.months[k].entries||[]).forEach(function(e){ if(e.personId) return; var r=compararNomes(c,e.name); if(r.score>0){ var id='lista:'+normalizar(e.name); var sc=r.score+palavras*.05; if(!achados[id]||achados[id].score<sc) achados[id]={p:{id:null,name:e.name,soLista:true},score:sc,tipo:r.tipo,termo:c}; } }); });
      });
    });
    var lista=Object.keys(achados).map(function(k){ return achados[k]; }).sort(function(a,b){ return b.score-a.score; });
    /* fica com quem bateu melhor (mais palavras e mais parecido); empates viram pergunta "qual delas?" */
    if(lista.length){ var top=lista[0].score; lista=lista.filter(function(x){ return x.score>=top-.03; }); }
    return {cands:cands,lista:lista.slice(0,6)};
  }
  /* nomes parecidos quando nada bate (erro de digitação no primeiro nome) */
  function parecidos(cands){
    var out=[]; num(function(){
      var ts=[]; cands.forEach(function(c){ c.split(' ').forEach(function(t){ if(t.length>2&&ts.indexOf(t)<0) ts.push(t); }); });
      state.people.forEach(function(p){ var nt=nomeTokens(p.name), m=0; ts.forEach(function(t){ nt.forEach(function(u){ var c=_compat(t,u); if(c>m) m=c; }); }); if(m>=.66) out.push({p:p,m:m}); });
    });
    return out.sort(function(a,b){ return b.m-a.m; }).slice(0,4).map(function(x){ return x.p; });
  }
  var MES_CURTO=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function diasAte(d,m){ var h=new Date(); h.setHours(0,0,0,0); var a=new Date(h.getFullYear(),m-1,d); if(a<h) a=new Date(h.getFullYear()+1,m-1,d); return Math.round((a-h)/86400000); }
  function ficha(p){
    var f={nome:p.name,cadastrado:!p.soLista};
    if(!p.soLista){ var fs=num(function(){ return state.photos[p.id]||[]; })||[]; f.fotos=fs.length; var notas=fs.map(function(x){ return x.analysis&&x.analysis.score||0; }).filter(Boolean); if(notas.length) f.melhor_nota=Math.max.apply(null,notas); f.thumb=(fs.find(function(x){ return x.thumb; })||{}).thumb||null; }
    var en=p.soLista?[]:entradasDe(p);
    if(p.soLista) num(function(){ Object.keys(state.months).forEach(function(k){ (state.months[k].entries||[]).forEach(function(e){ if(!e.personId&&normalizar(e.name)===normalizar(p.name)) en.push({k:k,e:e}); }); }); });
    en.sort(function(a,b){ return a.k<b.k?1:-1; });
    if(en.length){
      var e=en[0].e, st=num(function(){ return catalogStatus(e); });
      f.aniversario=String(e.day).padStart(2,'0')+' de '+MESNOME[e.month-1].toLowerCase(); f.dia=e.day; f.mes=e.month; f.faltam_dias=diasAte(e.day,e.month);
      f.lista=en[0].k; f.entrada=e.id;
      f.arte=e.status==='ready'?'gerada':st==='ready'?'pronta para gerar':st==='review'?'precisa conferir o vínculo':'sem foto ou sem cadastro';
      if(e.msg) f.aviso=e.msg;
    }
    return f;
  }
  function fichaIA(f){ var o={}; ['nome','cadastrado','fotos','melhor_nota','aniversario','faltam_dias','arte','aviso'].forEach(function(k){ if(f[k]!=null) o[k]=f[k]; }); return o; }
  function iniciais(n){ return String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase(); }
  function cartaoPessoa(p,caixa){
    var f=ficha(p), c=el('div','dx-pessoa');
    var falta=f.faltam_dias==null?'':f.faltam_dias===0?' · é hoje!':f.faltam_dias===1?' · amanhã':' · em '+f.faltam_dias+' dias';
    var linhas=[];
    linhas.push(['Aniversário',f.aniversario?f.aniversario+falta:'não está em nenhuma lista']);
    if(f.cadastrado) linhas.push(['Fotos',f.fotos?f.fotos+(f.fotos>1?' fotos':' foto')+(f.melhor_nota?' · melhor nota '+f.melhor_nota:''):'nenhuma foto ainda']);
    else linhas.push(['Cadastro','só na lista do mês, sem cadastro']);
    if(f.arte) linhas.push(['Arte',f.arte]);
    var cls=f.arte==='gerada'||f.arte==='pronta para gerar'?'ok':f.arte&&/conferir/.test(f.arte)?'conf':'falta';
    c.innerHTML='<div class="dx-pessoa-topo"><span class="dx-pessoa-ava">'+esc(iniciais(f.nome))+(f.thumb?'<img src="'+esc(f.thumb)+'" alt="">':'')+'</span>'+
      '<div class="dx-pessoa-nome"><b>'+esc(f.nome)+'</b><small>'+(f.cadastrado?'Colaborador cadastrado':'Aniversariante sem cadastro')+'</small></div>'+
      (f.arte?'<i class="dx-pessoa-st '+cls+'" title="'+esc(f.arte)+'"></i>':'')+'</div>'+
      '<dl class="dx-pessoa-dados">'+linhas.map(function(l){ return '<div><dt>'+esc(l[0])+'</dt><dd>'+esc(l[1])+'</dd></div>'; }).join('')+'</dl>';
    var bt=el('div','ak-btns');
    if(f.cadastrado&&typeof W.personDialog==='function'){ var a=el('button','ak-btn pri','Abrir cadastro'); a.type='button'; a.onclick=function(){ num(function(){ W.setTab('colab'); }); setTimeout(function(){ W.personDialog(p.id); },250); }; bt.appendChild(a); }
    if(f.entrada&&typeof W.openArt==='function'){ var b=el('button','ak-btn'+(bt.children.length?'':' pri'),'Abrir a arte'); b.type='button'; b.onclick=function(){ num(function(){ var y=+f.lista.slice(0,4), m=+f.lista.slice(5,7); state.year=y; state.month=m; W.openArt(f.entrada); }); }; bt.appendChild(b); }
    if(bt.children.length) c.appendChild(bt);
    (caixa||msgs).appendChild(c);
    if(!parado()) M.anima(c,[{opacity:0,transform:'translateY(10px) scale(.97)'},{opacity:1,transform:'none'}],'pula',{delay:120,fill:'backwards'});
    rolar(); return f;
  }
  function falaBot(html){ var b=el('div','ai-msg bot dex-ia'); b.innerHTML='<div class="dex-txt">'+html+'</div>'; msgs.appendChild(b); rolar(); return b; }
  function falaUser(t){ var u=el('div','ai-msg user'); u.textContent=t; msgs.appendChild(u); }
  function escolherPessoa(lista,b){
    var g=el('div','ak-btns'); lista.forEach(function(x){ var p=x.p||x, k=el('button','ak-btn',esc(p.name)); k.type='button'; k.onclick=function(){ falaUser(p.name); var r=falaBot(CFG.jeito==='formal'?'Aqui está o cadastro:':'Prontinho, olha a ficha:'); cartaoPessoa(p,r); reagir('feliz',900); }; g.appendChild(k); });
    b.appendChild(g); rolar();
  }
  var RE_PESSOA=/\b(quem e|quem eh|info|informac|dados d|ficha|cadastro d|aniversario d|niver d|quando (e|eh|faz) o aniversario|fotos? d[aoe]s?\b|tem foto|busca|buscar|procur|ach[aeo]|encontr|fala (d|s)obre|me conta|sobre (o|a)\b|mostra (o|a)\b|status d|situacao d|perfil)/;
  var RE_PESSOA_FORTE=/\b(quem e|quem eh|info|informac|dados d|ficha|cadastro d|aniversario d|niver d|quando (e|eh|faz) o aniversario|fotos? d[aoe]s?\b|status d|situacao d|perfil|sobre (o|a)\b)/;
  var MESES_RE='janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro';
  var RE_LISTA_MES=new RegExp('(aniversariantes?|aniversario|niver|quem faz).*\\b('+MESES_RE+')\\b|\\b('+MESES_RE+')\\b.*(aniversariantes?|aniversario|niver)');
  /* responde no próprio site, sem gastar IA, quando a pergunta é sobre uma pessoa ou um mês */
  function responderLocal(t){
    var n=normalizar(t), m=n.match(RE_LISTA_MES);
    if(m&&!/\bgera|\bzip|\bbaix/.test(n)){
      var nomeMes=m[2]||m[3], mi=MESES_RE.split('|').indexOf(nomeMes)+1, ano=num(function(){ return state.year; })||new Date().getFullYear();
      var rec=num(function(){ return state.months[mk(ano,mi)]; }), es=(rec&&rec.entries||[]).slice().sort(function(a,b){ return a.day-b.day; });
      falaUser(t);
      if(!es.length){ falaBot('Ainda não há lista de <b>'+esc(MESNOME[mi-1])+' de '+ano+'</b>. Dá para importar em Aniversariantes → Importar lista.'); reagir('pensando',900); return true; }
      var b=falaBot('<b>'+esc(MESNOME[mi-1])+' de '+ano+'</b>: '+es.length+(es.length>1?' aniversariantes':' aniversariante')+'. Toque em um nome para ver a ficha.');
      var l=el('div','dx-lista-mes'); es.slice(0,40).forEach(function(e){ var st=num(function(){ return catalogStatus(e); }), i=el('button','dx-lm-item','<span>'+String(e.day).padStart(2,'0')+'</span><b>'+esc(e.name)+'</b><i class="dx-pessoa-st '+(e.status==='ready'||st==='ready'?'ok':st==='review'?'conf':'falta')+'"></i>'); i.type='button';
        i.onclick=function(){ var p=e.personId&&num(function(){ return state.people.find(function(x){ return x.id===e.personId; }); }); var r=falaBot('Ficha de <b>'+esc(e.name)+'</b>:'); cartaoPessoa(p||{id:null,name:e.name,soLista:true},r); }; l.appendChild(i); });
      b.appendChild(l); rolar(); reagir('feliz',900); return true;
    }
    if(!RE_PESSOA.test(n)) return false;
    var r=buscarPessoas(t);
    if(!r.cands.length) return false;
    falaUser(t);
    if(r.lista.length===1){ var b1=falaBot(CFG.jeito==='formal'?'Encontrei este cadastro:':(Math.random()<.5?'Achei! Aqui está a ficha:':'Bip! Encontrei. Olha só:')); cartaoPessoa(r.lista[0].p,b1); reagir('feliz',1100); return true; }
    if(r.lista.length>1){ var b2=falaBot('Encontrei '+r.lista.length+' pessoas que combinam. Qual delas?'); escolherPessoa(r.lista,b2); reagir('pensando',1100); return true; }
    var pr=parecidos(r.cands);
    if(!RE_PESSOA_FORTE.test(n)&&!pr.length){ msgs.lastChild&&msgs.lastChild.classList.contains('user')&&msgs.lastChild.remove(); return false; }
    var b3=falaBot('Não encontrei ninguém com esse nome no cadastro nem nas listas dos meses.'+(pr.length?' Talvez seja uma destas pessoas:':' Confira a grafia ou procure em Colaboradores.'));
    if(pr.length) escolherPessoa(pr,b3); reagir('triste',1000); return true;
  }
  function responderLocalMes(nomeMes,caixa){
    var mi=MESES_RE.split('|').indexOf(normalizar(nomeMes).trim())+1; if(!mi) return;
    var ano=num(function(){ return state.year; })||new Date().getFullYear(), rec=num(function(){ return state.months[mk(ano,mi)]; }), es=(rec&&rec.entries||[]).slice().sort(function(a,b){ return a.day-b.day; });
    if(!es.length) return; var l=el('div','dx-lista-mes');
    es.slice(0,40).forEach(function(e){ var i=el('button','dx-lm-item','<span>'+String(e.day).padStart(2,'0')+'</span><b>'+esc(e.name)+'</b>'); i.type='button'; i.onclick=function(){ var p=e.personId&&num(function(){ return state.people.find(function(x){ return x.id===e.personId; }); }); var r=falaBot('Ficha de <b>'+esc(e.name)+'</b>:'); cartaoPessoa(p||{id:null,name:e.name,soLista:true},r); }; l.appendChild(i); });
    caixa.appendChild(l); rolar();
  }
  /* para a IA: fichas reais das pessoas citadas na pergunta (só delas) */
  function pessoasPara(t){
    var r=buscarPessoas(t), o={};
    if(r.lista.length) o.pessoas_encontradas=r.lista.map(function(x){ return fichaIA(ficha(x.p)); });
    else if(r.cands.length&&RE_PESSOA.test(normalizar(t))){ o.busca_sem_resultado=true; var pr=parecidos(r.cands); if(pr.length) o.nomes_parecidos=pr.map(function(p){ return p.name; }); }
    if(/aniversari|niver|quem|lista|mes/.test(normalizar(t))) num(function(){ var rec=state.months[mk(state.year,state.month)]; if(rec&&rec.entries.length) o.aniversariantes_do_mes_aberto=rec.entries.slice().sort(function(a,b){ return a.day-b.day; }).slice(0,40).map(function(e){ return String(e.day).padStart(2,'0')+' '+e.name; }); });
    return o;
  }

  /* =================================================================== 11. CONVERSA COM A IA */
  function marcarModo(m){ modoIA=m; atualizarCabecalho(); }
  function checar(){
    if(!/^https?:$/.test(location.protocol)){ localAte=Infinity; marcarModo('local'); return Promise.resolve(); }
    return fetch(API,{method:'GET',cache:'no-store'}).then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ INFO=j||{}; if(j&&j.ia){ localAte=0; marcarModo('ia'); } else { localAte=Infinity; marcarModo('local'); } })
      .catch(function(){ localAte=Infinity; marcarModo('local'); });
  }
  function contexto(texto){
    var c={};
    try{
      c.aba=({inicio:'Início',aniv:'Aniversariantes',arte:'Arte',colab:'Colaboradores',novos:'Novos colaboradores'})[state.tab]||state.tab;
      c.mes_aberto=MESNOME[state.month-1]+' de '+state.year;
      c.hoje=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      c.colaboradores=(state.people||[]).length; c.fotos=num(function(){ return MEM.photos.size; });
      var rec=state.months[mk(state.year,state.month)], es=rec?rec.entries:[], ok=0,rev=0,sem=0,ger=0;
      es.forEach(function(e){ var s=num(function(){ return catalogStatus(e); }); if(s==='ready') ok++; else if(s==='review') rev++; else sem++; if(e.status==='ready') ger++; });
      c.lista_do_mes={aniversariantes:es.length,foto_ok:ok,para_conferir:rev,sem_foto:sem,artes_geradas:ger};
      c.fotos_a_confirmar=num(function(){ return Array.from(MEM.photos.values()).filter(function(f){ return f.personId===PENDING; }).length; });
      c.arte_aberta=num(function(){ return typeof curEntry!=='undefined'&&!!curEntry; });
      c.tema=H.getAttribute('data-theme')||'automático'; c.fantasia_do_dex=visual();
      if(texto) Object.assign(c,pessoasPara(texto));
    }catch(e){}
    return c;
  }
  function rolar(){ try{ msgs.scrollTo({top:msgs.scrollHeight,behavior:parado()?'auto':'smooth'}); }catch(e){ msgs.scrollTop=msgs.scrollHeight; } }
  function formatar(t){
    var h=esc(t).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g,'$1<i>$2</i>').replace(/`([^`]+)`/g,'<b>$1</b>').replace(/^#+\s*/gm,'').replace(/^\s*[-•]\s+/gm,'• ');
    if(parado()||M.leve()) return h;
    var i=0; return h.replace(/(<[^>]+>)|([^\s<]+)/g,function(m,tag,pal){ return tag?tag:(i<90?'<span class="dex-palavra" style="--i:'+(i++)+'">'+pal+'</span>':pal); });
  }
  /* conta as perguntas que o site respondeu sem gastar IA */
  var passar=false, comando=false, viuDex=false;
  W.addEventListener('submit',function(ev){ if(ev.target!==form||comando||passar||!(input.value||'').trim()) return; viuDex=false;
    setTimeout(function(){ if(!viuDex){ usoDia(); USO.locais=(USO.locais||0)+1; salvarUso(); } },0); },true);
  function rodarComando(texto){
    if(!form||!input) return; comando=true; var antes=input.value; input.value=texto;
    try{ form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); }finally{ comando=false; }
    var us=msgs.querySelectorAll('.ai-msg.user'), u=us[us.length-1]; if(u&&u.textContent===texto) u.remove();
    if(input.value===texto) input.value=antes;
  }
  function rodarAcao(id){
    if(typeof W.__akRunAction==='function') return W.__akRunAction(id);
    var mapa={importLista:'#btnImport',importFotos:'#btnFolder',merge:'#btnMerge',auto:'#btnAuto',hat:'#btnChapeleiro',zip:'#btnZip',prepare:'#btnPrepNext',settings:'#btnSettings',tema:'#btnTheme'};
    var b=D.querySelector(mapa[id]); if(b){ b.click(); return true; } return false;
  }
  var BOTOES={importar_lista:['Importar lista','importLista','importar_lista'],importar_fotos:['Importar pasta de fotos','importFotos','importar_pasta'],unificar:['Unificar duplicados','merge','unificar'],
    ajustar:['Aplicar enquadramento automático','auto','auto'],chapeleiro:['Aplicar o Chapeleiro','hat','chapeleiro'],zip:['Baixar todas (ZIP)','zip','zip'],preparar:['Preparar próximo mês','prepare','preparar'],
    configuracoes:['Abrir os ajustes','settings','ajustes'],tema:['Alternar o tema','tema','tema']};
  function executarAcoes(acoes,caixa,mostrarId){
    var botoes=[], apontar=mostrarId||null, fazerTour=false;
    (acoes||[]).forEach(function(a){
      var arg=(a.arg||'').replace(/[<>]/g,'').trim();
      switch(a.id){
        case 'tour': fazerTour=true; break;
        case 'aba': if(/^(inicio|aniv|arte|colab|novos)$/.test(arg)){ if(!apontar) apontar='aba_'+arg; setTimeout(function(){ W.setTab(arg); },350); } break;
        case 'resumo': rodarComando('resumo do mês'); break;           case 'pendencias': rodarComando('pendências'); break;
        case 'hoje': rodarComando('hoje'); break;                      case 'semana': rodarComando('próximos 7 dias'); break;
        case 'mes30': rodarComando('próximos 30 dias'); break;         case 'espaco': rodarComando('espaço'); break;
        case 'confirmar': rodarComando('fotos a confirmar'); break;    case 'sem_foto': rodarAcao('semFoto'); break;
        case 'buscar': if(arg) rodarComando('buscar '+arg); break;     case 'arte': if(arg) rodarComando('abrir arte da '+arg); break;
        case 'ir_mes': if(arg) rodarComando('ir para '+arg); break;
        case 'pessoa': if(arg&&caixa){ var rp=buscarPessoas(arg); if(rp.lista.length===1) cartaoPessoa(rp.lista[0].p,caixa); else if(rp.lista.length>1) escolherPessoa(rp.lista,caixa); } break;
        case 'abrir_cadastro': if(arg){ var rc=buscarPessoas(arg); if(rc.lista.length===1&&rc.lista[0].p.id&&typeof W.personDialog==='function'){ var pc=rc.lista[0].p; botoes.push({t:'Abrir o cadastro de '+pc.name.split(' ')[0],fn:function(){ num(function(){ W.setTab('colab'); }); setTimeout(function(){ W.personDialog(pc.id); },250); }}); } } break;
        case 'lista_mes': if(arg){ responderLocalMes(arg,caixa); } break;
        case 'gerar_mes': rodarComando('gerar o mês de '+(arg||num(function(){ return MESNOME[state.month-1]; })||'')); break;
        case 'gerar_arte': if(arg) botoes.push({t:'Gerar a arte de '+arg,fn:function(){ rodarComando('gerar arte da '+arg); }}); break;
        case 'editar_dex': botoes.push({t:'Abrir o Estúdio do Dex',fn:abrirEstudio}); break;
        default: if(BOTOES[a.id]){ var B=BOTOES[a.id]; if(!apontar) apontar=B[2]; botoes.push({t:B[0],fn:function(){ var r=rodarAcao(B[1]); if(r&&r.then) r.catch(function(){}); }}); }
      }
    });
    if(caixa&&(botoes.length||(apontar&&ALVO[apontar]))){
      var g=el('div','ak-btns');
      botoes.forEach(function(b,i){ var x=el('button','ak-btn'+(i===0?' pri':''),esc(b.t)); x.type='button'; x.onclick=function(){ x.disabled=true; b.fn(); setTimeout(function(){ x.disabled=false; },1500); }; g.appendChild(x); });
      if(apontar&&ALVO[apontar]){ var m=el('button','ak-btn'+(botoes.length?'':' pri'),'Mostrar de novo'); m.type='button'; var id=apontar; m.onclick=function(){ mostrar(id); }; g.appendChild(m); }
      caixa.appendChild(g); M.anima(g,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],'pula',{delay:200,fill:'backwards'}); rolar();
    }
    if(fazerTour) setTimeout(tour,900); else if(apontar&&ALVO[apontar]) setTimeout(function(){ mostrar(apontar); },1100);
  }
  function paraLocal(texto,motivo){
    if(motivo==='limite'||motivo==='rede') localAte=Date.now()+120000;
    if(!avisouLocal){ avisouLocal=true; var a=el('div','ai-msg bot dex-aviso');
      var espera=duracao(USO.ultimo&&USO.ultimo.limites&&USO.ultimo.limites.tentar_em);
      a.textContent=motivo==='limite'?'Ufa, a IA chegou no limite por agora'+(espera?' (volta em '+quando(espera)+')':'')+'. Enquanto isso, respondo com o que já sei do site.':'Estou sem conexão com a IA agora. Enquanto isso, respondo com o que já sei do site.';
      msgs.appendChild(a); rolar(); }
    marcarModo(motivo==='limite'?'limite':'local');
    passar=true; input.value=texto;
    try{ form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); }finally{ passar=false; }
  }
  /* a bolha "pensando" cresce até virar a resposta */
  function crescer(txt,html){
    var h0=txt.offsetHeight; txt.innerHTML=html; var h1=txt.scrollHeight;
    if(!parado()&&h0) M.anima(txt,[{height:h0+'px'},{height:h1+'px'}],'suave');
  }
  function pensando(on){ ocupado=on; E.pensando=on||!!(chat&&chat.classList.contains('ak-pensando')); if(chat) chat.classList.toggle('dx-pensa',E.pensando); render(); atualizarCabecalho(); }
  async function perguntarIA(texto){
    pensando(true);
    var u=el('div','ai-msg user'); u.textContent=texto; msgs.appendChild(u);
    var b=el('div','ai-msg bot dex-ia dex-carregando'), txt=el('div','dex-txt','<span class="dex-pontos"><i></i><i></i><i></i></span>'); b.appendChild(txt); msgs.appendChild(b); rolar();
    hist.push({role:'user',content:texto}); if(hist.length>12) hist=hist.slice(-12);
    var ctl=new AbortController(), t=setTimeout(function(){ ctl.abort(); },26000), r=null, j=null;
    try{ r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensagens:hist,contexto:contexto(texto),nome:CFG.nome,jeito:CFG.jeito,idioma:CFG.idioma}),signal:ctl.signal}); j=await r.json().catch(function(){ return null; }); }
    catch(e){ r=null; }
    clearTimeout(t); pensando(false);
    if(j&&j.limites&&(j.limites.req_limite_dia!=null||j.limites.tentar_em)){ usoDia(); USO.ultimo=Object.assign({},USO.ultimo,{limites:Object.assign({},USO.ultimo&&USO.ultimo.limites,j.limites),quando:Date.now()}); salvarUso(); }
    if(!r||!r.ok||!j||!j.texto){
      hist.pop(); u.remove(); b.remove(); reagir('triste',1400);
      var motivo=!r?'rede':((j&&j.erro)==='limite'||r.status===429)?'limite':(j&&j.erro)==='sem_chave'?'sem_chave':'rede';
      if(motivo==='sem_chave') localAte=Infinity; paraLocal(texto,motivo); return;
    }
    usoDia(); USO.perguntas=(USO.perguntas||0)+1; var uso=j.uso||{};
    USO.entrada=(USO.entrada||0)+(uso.entrada||0); USO.saida=(USO.saida||0)+(uso.saida||0); USO.ms=(USO.ms||0)+(j.ms||0);
    USO.hist=(USO.hist||[]).concat([uso.total||0]).slice(-30);
    USO.ultimo={modelo:j.modelo,provedor:j.provedor,ms:j.ms,limites:j.limites||{},quando:Date.now()}; salvarUso();
    marcarModo('ia'); if(folha&&folha.classList.contains('on')) renderFolha();
    b.classList.remove('dex-carregando'); if(j.humor) reagir(j.humor,1500);
    crescer(txt,formatar(j.texto));
    E.falaAte=Date.now()+Math.max(900,Math.min(4200,j.texto.length*38)); render();
    hist.push({role:'assistant',content:j.texto});
    executarAcoes(j.acoes,b,j.mostrar);
  }
  var RE_STATUS=/^\/status$|(quanto|qual).*(voc[eê]|a ia|a intelig).*(consum|gast|us[oa]u?)|\b(seu|teu) (estado|status|consumo|limite)|\bconsumo da ia\b|\bcota\b/i;
  var RE_TOUR=/^\/tour$|\btour\b|me (mostra|apresenta) o site|apresentar o site/i;
  D.addEventListener('submit',function(ev){
    if(ev.target!==form||passar||comando) return;
    var t=(input.value||'').trim(); if(!t) return;
    if(RE_STATUS.test(t)||RE_TOUR.test(t)){
      viuDex=true; ev.preventDefault(); ev.stopImmediatePropagation(); input.value=''; form.classList.remove('tem-texto');
      var u=el('div','ai-msg user'); u.textContent=t; msgs.appendChild(u);
      if(RE_TOUR.test(t)){ var b=el('div','ai-msg bot dex-ia'); b.innerHTML='<div class="dex-txt">'+(CFG.jeito==='formal'?'Vou mostrar as partes principais do site.':'Aperte os cintos: vou voar pela tela e te mostrar tudo!')+'</div>'; msgs.appendChild(b); rolar(); reagir('comemorando',1200); setTimeout(tour,900); }
      else cartaoStatus();
      return;
    }
    if(t.charAt(0)==='/') return;
    if(Date.now()<localAte) return;
    viuDex=true; ev.preventDefault(); ev.stopImmediatePropagation(); input.value=''; form.classList.remove('tem-texto');
    if(!ocupado) perguntarIA(t);
  },true);

  /* pessoas e listas de mês: respondidas antes de tudo (no window, fase de captura), com a busca precisa do Dex */
  W.addEventListener('submit',function(ev){
    if(ev.target!==form||passar||comando||ocupado) return;
    var t=(input.value||'').trim(); if(!t||t.charAt(0)==='/') return;
    if(!num(function(){ return state&&state.people; })) return;
    var ok=false; try{ ok=responderLocal(t); }catch(e){ ok=false; }
    if(!ok) return;
    viuDex=true; ev.preventDefault(); ev.stopImmediatePropagation(); input.value=''; form.classList.remove('tem-texto');
    usoDia(); USO.locais=(USO.locais||0)+1; salvarUso();
    hist.push({role:'user',content:t},{role:'assistant',content:'(mostrei no chat a ficha ou a lista pedida)'}); if(hist.length>12) hist=hist.slice(-12);
  },true);

  /* =================================================================== 12. INÍCIO */
  if(chat) chat.querySelectorAll('[data-prompt]').forEach(function(b){ if(/AniverCut/i.test(b.dataset.prompt)) b.dataset.prompt=b.dataset.prompt.replace(/AniverCut/gi,'AkiCut'); });
  trocarAvatares(); setTimeout(trocarAvatares,400);
  aplicarCfg(); render(); checar(); setInterval(atualizarCabecalho,60000);
  W.__dex={desenho:{inteiro:svgInteiro,aplicarVisual:aplicarVisual},reagir:reagir,pular:pular,truque:truque,mostrar:mostrar,tour:tour,fimGuia:fimGuia,abrirEstudio:abrirEstudio,abrirFolha:abrirFolha,falar:falarBalao,cfg:CFG,contexto:contexto,
    uso:function(){ return USO; },estado:function(){ return {humor:humorAtual,modo:modoIA,guia:E.guia,tour:emTour,passo:passo}; }};
})();
