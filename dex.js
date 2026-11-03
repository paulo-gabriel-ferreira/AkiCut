/* =============================================================================
   DEX · o assistente do AkiCut  (versão 2)
   - Personagem 2D cinza, branco e preto, com reações de desenho animado.
   - Fantasias (Papai Noel, coelho, formatura, chef, coroa, fones, óculos…).
   - Chat em "ilha" (estilo Apple) com o painel de consumo da IA.
   - Guia na tela: o Dex voa até o botão e aponta com o braço.
   - Todas as opções ficam em Ajustes → Dex.

   Como o chat funciona:
   1. Comandos rápidos (resumo, pendências, hoje, gerar mês, colar lista, /) continuam locais.
   2. O resto vai para /api/dex (função do Vercel), com a chave guardada no Vercel.
   3. Sem IA (sem internet, limite do dia, arquivo aberto fora do Vercel) o Dex usa as
      respostas locais que o app já tinha.
   ============================================================================= */
(function(){
  'use strict';
  if(window.__dex) return;
  var D=document, H=D.documentElement, W=window;
  var chat=D.getElementById('aiChat'), msgs=D.getElementById('aiMessages'), form=D.getElementById('aiForm'), input=D.getElementById('aiInput');
  var LS={ get:function(k,p){ try{ var v=localStorage.getItem(k); return v==null?p:v; }catch(e){ return p; } },
           set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
           del:function(k){ try{ localStorage.removeItem(k); }catch(e){} } };
  var SS={ get:function(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }, set:function(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} } };
  function reduzido(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches||H.getAttribute('data-ak-mov')==='desligadas'; }catch(e){ return false; } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function el(tag,cls,html){ var e=D.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function esperar(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
  function fmt(n){ return n==null||isNaN(n)?'—':Number(n).toLocaleString('pt-BR'); }

  /* ------------------------------------------------------------------ config */
  var PADRAO={nome:'Dex',tam:'m',olhos:'branco',acab:'claro',cab:'nenhum',rosto:'nenhum',corpo:'nenhum',epoca:'sim',
    jeito:'divertido',idioma:'pt',anim:'normal',seguir:'sim',balao:'sim',truques:'sim',lado:'direita'};
  var CFG=(function(){ var c={}; try{ c=JSON.parse(LS.get('dex-cfg','{}'))||{}; }catch(e){}
    if(c.acess&&!c.cab) c.cab=c.acess==='chapeu'?'festa':c.acess==='antena'?'antena':'nenhum';   // versão anterior
    var o={}; for(var k in PADRAO) o[k]=c[k]!=null?c[k]:PADRAO[k]; return o; })();
  var OLHOS={branco:'#F3F8FF',ciano:'#5CE1F0',prata:'#C3C9D3',ambar:'#FFD58A'};
  function salvar(){ LS.set('dex-cfg',JSON.stringify(CFG)); }

  /* fantasia da época: Natal em dezembro, Páscoa perto do domingo de Páscoa (só se nenhuma fantasia foi escolhida) */
  function pascoa(a){ var b=a%19,c=Math.floor(a/100),d=a%100,e=Math.floor(c/4),f=c%4,g=Math.floor((c+8)/25),h=Math.floor((c-g+1)/3),i=(19*b+c-e-h+15)%30,k=Math.floor(d/4),l=d%4,m=(32+2*f+2*k-i-l)%7,n=Math.floor((b+11*i+22*m)/451),mes=Math.floor((i+m-7*n+114)/31),dia=((i+m-7*n+114)%31)+1; return new Date(a,mes-1,dia); }
  function visual(){
    var v={cab:CFG.cab,rosto:CFG.rosto,corpo:CFG.corpo};
    if(CFG.epoca==='sim'&&v.cab==='nenhum'&&v.rosto==='nenhum'&&v.corpo==='nenhum'){
      var hj=new Date(), p=pascoa(hj.getFullYear()), dd=(p-hj)/86400000;
      if(hj.getMonth()===11){ v.cab='natal'; v.corpo='noel'; }
      else if(dd<=12&&dd>=-2){ v.cab='coelho'; v.corpo='gravata'; }
    }
    return v;
  }

  /* ------------------------------------------------------------------ estilos */
  var CABS=['antena','festa','natal','coelho','formatura','chef','coroa','fones'], ROSTOS=['oculos','escuros','bigode'], CORPOS=['gravata','cachecol','noel'];
  var cssFantasias=CABS.map(function(c){ return '.dex-svg[data-cab="'+c+'"] .dex-cab-'+c; }).join(',')+','+
    ROSTOS.map(function(c){ return '.dex-svg[data-rosto="'+c+'"] .dex-ros-'+c; }).join(',')+','+
    CORPOS.map(function(c){ return '.dex-svg[data-corpo="'+c+'"] .dex-crp-'+c; }).join(',')+'{display:inline}';
  var css=`
:root{--dex-olho:#F3F8FF;--dex-w:96px;--e-apple:cubic-bezier(.32,.72,0,1);--e-mola:cubic-bezier(.34,1.45,.64,1);--e-mola2:cubic-bezier(.3,1.25,.5,1)}
html[data-dex-tam="p"]{--dex-w:74px} html[data-dex-tam="g"]{--dex-w:124px}
.dex{position:fixed;right:22px;bottom:14px;z-index:120;width:var(--dex-w);pointer-events:none;
  transition:opacity .45s var(--e-apple),transform 1s var(--e-apple),right .6s var(--e-apple),left .6s var(--e-apple)}
html[data-dex-lado="esquerda"] .dex{right:auto;left:22px}
html[data-dex-lado="esquerda"] body:not(.hud-right):not(.hud-top):not(.hud-bottom):not(.hud-icons) .dex{left:290px}
html[data-ak-orb="nao"] .dex{display:none}
body.booting .dex{opacity:0;transform:translateY(30px) scale(.8)}
.dex-btn{all:unset;display:block;width:100%;cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent;border-radius:40%}
.dex-btn:focus-visible{outline:2px solid #9aa3b2;outline-offset:4px}
.dex-svg{display:block;width:100%;height:auto;overflow:visible}

/* cores do personagem */
.dex-svg{--c-corpo:#F6F7F9;--c-meio:#E2E5EA;--c-sombra:#C4C9D1;--c-linha:#24272D;--c-visor:#0F1114;--c-visor2:#26313B;--c-chao:rgba(15,17,20,.18)}
html[data-dex-acab="grafite"] .dex-svg{--c-corpo:#5A5F69;--c-meio:#474B54;--c-sombra:#33363D;--c-linha:#121418;--c-visor:#08090B;--c-visor2:#1C2229}
html[data-theme="dark"] .dex-svg{--c-chao:rgba(0,0,0,.4)}
.dex-svg .dex-chao{fill:var(--c-chao)}
.dex-svg .dex-tronco,.dex-svg .dex-casco,.dex-svg .dex-braco rect,.dex-svg .dex-orelha,.dex-svg .dex-topo,.dex-svg .dx-pele{fill:var(--c-corpo);stroke:var(--c-linha);stroke-width:3;stroke-linejoin:round}
.dex-svg .dex-orelha,.dex-svg .dex-topo,.dex-svg .dex-braco rect{fill:var(--c-meio)}
.dex-svg .dex-pescoco{fill:var(--c-sombra);stroke:var(--c-linha);stroke-width:3}
.dex-svg .dex-tronco-sombra{fill:var(--c-sombra);opacity:.55}
.dex-svg .dex-brilho{fill:#fff;opacity:.75}
html[data-dex-acab="grafite"] .dex-svg .dex-brilho{opacity:.18}
.dex-svg .dex-casco-brilho{fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;opacity:.85}
html[data-dex-acab="grafite"] .dex-svg .dex-casco-brilho{opacity:.2}
.dex-svg .dex-costura{fill:none;stroke:var(--c-sombra);stroke-width:2.5;stroke-linecap:round}
.dex-svg .dex-visor{stroke:var(--c-linha);stroke-width:2.5}
.dex-svg .dex-visor-brilho{fill:none;stroke:rgba(255,255,255,.12);stroke-width:3;stroke-linecap:round}
.dex-svg .dex-luz{fill:var(--dex-olho);opacity:.55}
.dex-svg .dex-o-aberto,.dex-svg .dex-o-coracao{fill:var(--dex-olho)}
.dex-svg .dex-o-feliz,.dex-svg .dex-o-fechado,.dex-svg .dex-o-tonto,.dex-svg .dex-boca path{fill:none;stroke:var(--dex-olho);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.dex-svg .dex-o-tonto{stroke-width:2.6}
.dex-svg .dex-boca-o{fill:var(--dex-olho)}
.dex-svg .dex-bochecha{fill:var(--dex-olho);opacity:0;transition:opacity .5s ease}
.dex-svg .dx-l{stroke:var(--c-linha);stroke-width:2.6;stroke-linejoin:round}
.dex-svg .dex-cab,.dex-svg .dex-ros,.dex-svg .dex-crp{display:none}
${cssFantasias}
.dex-svg .dex-cab-antena path{stroke:var(--c-linha);stroke-width:3;stroke-linecap:round}
.dex-svg .dex-cab-antena circle{fill:var(--dex-olho);stroke:var(--c-linha);stroke-width:2.5}
.dex-svg .dex-bigode-coelho{stroke:var(--dex-olho);stroke-width:1.6;stroke-linecap:round;opacity:.55;fill:none}
.dex-svg .dex-jato{fill:var(--dex-olho);opacity:0;transform-box:fill-box;transform-origin:50% 0}

/* juntas: cada peça gira no seu ponto, como um boneco articulado */
.dex-svg g{transform-box:view-box}
.dex-svg .dex-flutua,.dex-svg .dex-mola{transform-origin:80px 166px}
.dex-svg .dex-truque{transform-origin:80px 128px;transition:transform .6s var(--e-mola2)}
.dex-svg .dex-cabeca{transform-origin:80px 88px;transform:rotate(var(--tilt,0deg));transition:transform .7s var(--e-mola2)}
.dex-svg .dex-braco-e,.dex-svg .dex-braco-e .dex-osc{transform-origin:35.5px 103px}
.dex-svg .dex-braco-d,.dex-svg .dex-braco-d .dex-osc{transform-origin:124.5px 103px}
.dex-svg .dex-braco{transition:transform .75s var(--e-mola2)}
.dex-svg .dex-olhos{transform:translate(var(--ox,0px),var(--oy,0px));transition:transform .32s var(--e-apple)}
.dex-svg .dex-o > *{transform-box:fill-box;transform-origin:center;transition:opacity .28s ease,transform .5s var(--e-mola2)}
.dex-svg .dex-o-feliz,.dex-svg .dex-o-fechado,.dex-svg .dex-o-coracao,.dex-svg .dex-o-tonto{opacity:0;transform:scale(.55,.2)}
.dex-svg .dex-boca > *{transform-box:fill-box;transform-origin:center;transition:opacity .25s ease,transform .45s var(--e-mola2)}
.dex-svg .dex-boca-o,.dex-svg .dex-boca-triste{opacity:0;transform:scale(.3)}
.dex-svg .dex-fx > g > *{opacity:0}

/* parado: respira, flutua e balança os braços */
.dex-svg .dex-flutua{animation:dexFlutua 3.8s ease-in-out infinite}
.dex-svg .dex-chao{transform-box:fill-box;transform-origin:center;animation:dexChao 3.8s ease-in-out infinite}
.dex-svg .dex-braco-e .dex-osc{animation:dexBalancoE 3.8s ease-in-out infinite}
.dex-svg .dex-braco-d .dex-osc{animation:dexBalancoD 3.8s ease-in-out infinite}
@keyframes dexFlutua{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(-5px * var(--dex-k,1)))}}
@keyframes dexChao{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.86);opacity:.7}}
@keyframes dexBalancoE{0%,100%{transform:rotate(3deg)}50%{transform:rotate(-2deg)}}
@keyframes dexBalancoD{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(2deg)}}
html[data-dex-anim="sutil"]{--dex-k:.5}
html[data-dex-anim="expressiva"]{--dex-k:1.6}
html[data-ak-mov="suaves"] .dex-svg .dex-flutua,html[data-ak-mov="suaves"] .dex-svg .dex-chao,html[data-ak-mov="suaves"] .dex-svg .dex-osc{animation:none}

/* piscar */
.dex-svg.pisca .dex-o-aberto{transform:scaleY(.08);transition-duration:.07s}
.dex-svg.pisca-d .dex-olho-d .dex-o-aberto{transform:scaleY(.08)}

/* ---------- humores (as poses mudam com transição: nada de corte seco) ---------- */
.dex-svg[data-humor="feliz"] .dex-o-aberto,.dex-svg[data-humor="comemorando"] .dex-o-aberto,.dex-svg[data-humor="amor"] .dex-o-aberto,.dex-svg[data-humor="dormindo"] .dex-o-aberto,
.dex-svg[data-humor="tonto"] .dex-o-aberto,.dex-svg[data-humor="espreguica"] .dex-o-aberto{opacity:0;transform:scale(1,.15) translateY(3px)}
.dex-svg[data-humor="feliz"] .dex-o-feliz,.dex-svg[data-humor="comemorando"] .dex-o-feliz{opacity:1;transform:none}
.dex-svg[data-humor="feliz"] .dex-bochecha,.dex-svg[data-humor="amor"] .dex-bochecha,.dex-svg[data-humor="comemorando"] .dex-bochecha{opacity:.35}
.dex-svg[data-humor="feliz"] .dex-boca-sorriso,.dex-svg[data-humor="comemorando"] .dex-boca-sorriso{transform:scale(1.35,1.5)}
.dex-svg[data-humor="feliz"] .dex-braco-d{transform:rotate(-150deg)}
.dex-svg[data-humor="feliz"] .dex-braco-d .dex-osc{animation:dexAceno .95s ease-in-out .5s infinite}
.dex-svg[data-humor="feliz"] .dex-braco-e{transform:rotate(16deg)}
.dex-svg[data-humor="feliz"] .dex-fx-brilho{animation:dexBrilho 1.6s ease-out infinite}
.dex-svg[data-humor="feliz"] .dex-fx-brilho:nth-child(2){animation-delay:.5s}
@keyframes dexAceno{0%,100%{transform:rotate(0)}50%{transform:rotate(-20deg)}}
@keyframes dexAcenoE{0%,100%{transform:rotate(0)}50%{transform:rotate(20deg)}}
@keyframes dexBrilho{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1;transform:scale(1) rotate(45deg)}100%{opacity:0;transform:scale(.4) rotate(90deg)}}
.dex-fx-brilho,.dex-fx-conf{transform-box:fill-box;transform-origin:center}

.dex-svg[data-humor="comemorando"] .dex-braco-e{transform:rotate(152deg)}
.dex-svg[data-humor="comemorando"] .dex-braco-d{transform:rotate(-152deg)}
.dex-svg[data-humor="comemorando"] .dex-braco-e .dex-osc{animation:dexAcenoE .5s ease-in-out infinite}
.dex-svg[data-humor="comemorando"] .dex-braco-d .dex-osc{animation:dexAceno .5s ease-in-out infinite}
.dex-svg[data-humor="comemorando"] .dex-fx-conf{animation:dexConf 1.3s cubic-bezier(.2,.7,.3,1) infinite;animation-delay:calc(var(--i) * 90ms)}
@keyframes dexConf{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--cx),var(--cy)) rotate(260deg) scale(1)}}

.dex-svg[data-humor="surpresa"] .dex-o-aberto{transform:scale(1.22,1.28)}
.dex-svg[data-humor="surpresa"] .dex-boca-sorriso{opacity:0;transform:scale(.3)}
.dex-svg[data-humor="surpresa"] .dex-boca-o{opacity:1;transform:none}
.dex-svg[data-humor="surpresa"] .dex-braco-e{transform:rotate(40deg)}
.dex-svg[data-humor="surpresa"] .dex-braco-d{transform:rotate(-40deg)}
.dex-svg[data-humor="surpresa"] .dex-osc{animation:none}

.dex-svg[data-humor="pensando"] .dex-olhos{transform:translate(5px,-6px)}
.dex-svg[data-humor="pensando"] .dex-cabeca{transform:rotate(7deg)}
.dex-svg[data-humor="pensando"] .dex-braco-e{transform:rotate(-112deg)}
.dex-svg[data-humor="pensando"] .dex-braco-e .dex-osc{animation:none}
.dex-svg[data-humor="pensando"] .dex-o-aberto{transform:scaleY(.8)}
.dex-svg[data-humor="pensando"] .dex-boca-sorriso{transform:scale(.6,.4) translateX(3px)}
.dex-svg[data-humor="pensando"] .dex-fx-ponto{animation:dexPonto 1.2s ease-in-out infinite}
.dex-svg[data-humor="pensando"] .dex-fx-ponto:nth-child(2){animation-delay:.18s}
.dex-svg[data-humor="pensando"] .dex-fx-ponto:nth-child(3){animation-delay:.36s}
@keyframes dexPonto{0%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}

.dex-svg[data-humor="ouvindo"] .dex-cabeca{transform:rotate(-6deg)}
.dex-svg[data-humor="ouvindo"] .dex-o-aberto{transform:scale(1.06)}

.dex-svg[data-humor="falando"] .dex-boca-sorriso{opacity:0}
.dex-svg[data-humor="falando"] .dex-boca-o{opacity:1;animation:dexFala .22s ease-in-out infinite alternate}
.dex-svg[data-humor="falando"] .dex-luz{animation:dexLuz .5s ease-in-out infinite alternate}
.dex-svg[data-humor="falando"] .dex-braco-d{transform:rotate(-34deg)}
.dex-svg[data-humor="falando"] .dex-braco-d .dex-osc{animation:dexAceno 1.4s ease-in-out infinite}
@keyframes dexFala{from{transform:scale(1.1,.25)}to{transform:scale(1,1)}}
@keyframes dexLuz{from{opacity:.3}to{opacity:1}}

.dex-svg[data-humor="triste"] .dex-olho-e .dex-o-aberto{transform:scaleY(.62) rotate(-16deg)}
.dex-svg[data-humor="triste"] .dex-olho-d .dex-o-aberto{transform:scaleY(.62) rotate(16deg)}
.dex-svg[data-humor="triste"] .dex-olhos{transform:translate(0,3px)}
.dex-svg[data-humor="triste"] .dex-boca-sorriso{opacity:0}
.dex-svg[data-humor="triste"] .dex-boca-triste{opacity:1;transform:none}
.dex-svg[data-humor="triste"] .dex-cabeca{transform:rotate(-4deg) translateY(3px)}
.dex-svg[data-humor="triste"] .dex-braco-e{transform:rotate(-6deg)}
.dex-svg[data-humor="triste"] .dex-braco-d{transform:rotate(6deg)}
.dex-svg[data-humor="triste"] .dex-osc{animation:none}

.dex-svg[data-humor="dormindo"] .dex-o-fechado{opacity:1;transform:none}
.dex-svg[data-humor="dormindo"] .dex-boca-sorriso{transform:scale(.5,.3)}
.dex-svg[data-humor="dormindo"] .dex-cabeca{transform:rotate(-7deg) translateY(2px)}
.dex-svg[data-humor="dormindo"] .dex-flutua{animation-duration:6s}
.dex-svg[data-humor="dormindo"] .dex-fx-z{animation:dexZ 3s ease-in infinite}
.dex-svg[data-humor="dormindo"] .dex-fx-z:nth-child(2){animation-delay:1s}
.dex-svg[data-humor="dormindo"] .dex-fx-z:nth-child(3){animation-delay:2s}
@keyframes dexZ{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate(16px,-26px) scale(1.15)}}
.dex-fx-z{font:700 13px/1 system-ui,sans-serif;fill:#8A919C;transform-box:fill-box;transform-origin:center}

.dex-svg[data-humor="espreguica"] .dex-o-fechado{opacity:1;transform:none}
.dex-svg[data-humor="espreguica"] .dex-boca-o{opacity:1;transform:scale(1,1.2)}
.dex-svg[data-humor="espreguica"] .dex-boca-sorriso{opacity:0}
.dex-svg[data-humor="espreguica"] .dex-braco-e{transform:rotate(168deg);transition-duration:1.1s}
.dex-svg[data-humor="espreguica"] .dex-braco-d{transform:rotate(-168deg);transition-duration:1.1s}
.dex-svg[data-humor="espreguica"] .dex-osc{animation:none}

.dex-svg[data-humor="amor"] .dex-o-coracao{opacity:1;transform:none;animation:dexBate .6s ease-in-out infinite}
.dex-svg[data-humor="amor"] .dex-boca-sorriso{transform:scale(1.4,1.6)}
.dex-svg[data-humor="amor"] .dex-braco-e{transform:rotate(132deg)}
.dex-svg[data-humor="amor"] .dex-braco-d{transform:rotate(-132deg)}
.dex-svg[data-humor="amor"] .dex-osc{animation:none}
.dex-svg[data-humor="amor"] .dex-fx-cor{animation:dexSobe 1.4s ease-out infinite}
.dex-svg[data-humor="amor"] .dex-fx-cor:nth-child(2){animation-delay:.45s}
.dex-svg[data-humor="amor"] .dex-fx-cor:nth-child(3){animation-delay:.9s}
@keyframes dexBate{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
@keyframes dexSobe{0%{opacity:0;transform:translateY(6px) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translateY(-30px) scale(1)}}
.dex-fx-cor{fill:#C9CED6;stroke:#24272D;stroke-width:1.5;transform-box:fill-box;transform-origin:center}

.dex-svg[data-humor="tonto"] .dex-o-tonto{opacity:1;transform:none;animation:dexGira 1s linear infinite}
.dex-svg[data-humor="tonto"] .dex-cabeca{animation:dexBamboleia 1s ease-in-out infinite}
.dex-svg[data-humor="tonto"] .dex-boca-sorriso{opacity:0}
.dex-svg[data-humor="tonto"] .dex-boca-triste{opacity:1;transform:scale(1.1,.6)}
@keyframes dexGira{to{transform:rotate(360deg)}}
@keyframes dexBamboleia{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}

/* voando (guia): braços para trás, corpo inclinado e jatinhos */
.dex-svg[data-humor="voando"] .dex-braco-e{transform:rotate(36deg)}
.dex-svg[data-humor="voando"] .dex-braco-d{transform:rotate(-36deg)}
.dex-svg[data-humor="voando"] .dex-braco-e .dex-osc{animation:dexAcenoE .32s ease-in-out infinite}
.dex-svg[data-humor="voando"] .dex-braco-d .dex-osc{animation:dexAceno .32s ease-in-out infinite}
.dex-svg[data-humor="voando"] .dex-truque{transform:rotate(var(--lean,0deg))}
.dex-svg[data-humor="voando"] .dex-jato{opacity:.95;animation:dexJato .12s ease-in-out infinite alternate}
.dex-svg[data-humor="voando"] .dex-chao{opacity:0}
@keyframes dexJato{from{transform:scaleY(.55)}to{transform:scaleY(1.15)}}

/* apontando: o braço gira até a direção do botão */
.dex-svg[data-humor="apontando"] .dex-osc{animation:none}
.dex-svg[data-humor="apontando"][data-braco="e"] .dex-braco-e{transform:rotate(var(--ap,90deg))}
.dex-svg[data-humor="apontando"][data-braco="d"] .dex-braco-d{transform:rotate(var(--ap,-90deg))}
.dex-svg[data-humor="apontando"][data-braco="e"] .dex-braco-d{transform:rotate(-10deg)}
.dex-svg[data-humor="apontando"][data-braco="d"] .dex-braco-e{transform:rotate(10deg)}
.dex-svg[data-humor="apontando"] .dex-o-aberto{transform:scale(1.08)}
.dex-svg[data-humor="apontando"] .dex-boca-sorriso{transform:scale(1.2,1.3)}

/* truques */
.dex-svg.pula .dex-mola{animation:dexPulo .78s var(--e-apple)}
@keyframes dexPulo{0%{transform:none}14%{transform:scale(1.14,.82)}38%{transform:translateY(calc(-26px * var(--dex-k,1))) scale(.9,1.12)}62%{transform:translateY(0) scale(1.1,.9)}80%{transform:scale(.97,1.03)}100%{transform:none}}
.dex-svg.quica .dex-mola{animation:dexQuica .55s var(--e-apple)}
@keyframes dexQuica{0%{transform:none}30%{transform:scale(1.07,.93)}62%{transform:translateY(-7px) scale(.97,1.04)}100%{transform:none}}
.dex-svg.pirueta .dex-mola{animation:dexPirueta .95s var(--e-apple)}
@keyframes dexPirueta{0%{transform:none}20%{transform:translateY(-14px) scaleX(1)}50%{transform:translateY(-22px) scaleX(-1)}80%{transform:translateY(-8px) scaleX(1)}100%{transform:none}}
.dex-svg.sim .dex-cabeca{animation:dexSim .5s ease-in-out}
@keyframes dexSim{0%,100%{transform:rotate(var(--tilt,0deg))}50%{transform:rotate(var(--tilt,0deg)) translateY(3px)}}

/* ---------- balão de fala ---------- */
.dex-balao{position:absolute;right:calc(100% - 26px);bottom:calc(100% - 10px);width:max-content;max-width:240px;padding:11px 14px;border-radius:18px 18px 4px 18px;
  background:#fff;color:#16181d;font:500 13px/1.4 var(--f-ui,system-ui);box-shadow:0 16px 40px rgba(10,12,16,.18),0 2px 6px rgba(10,12,16,.08);border:1px solid rgba(10,12,16,.08);
  opacity:0;transform:translateY(8px) scale(.85);transform-origin:100% 100%;pointer-events:none;transition:opacity .3s ease,transform .55s var(--e-mola)}
html[data-dex-lado="esquerda"] .dex-balao,.dex.balao-dir .dex-balao{right:auto;left:calc(100% - 26px);border-radius:18px 18px 18px 4px;transform-origin:0 100%}
html[data-dex-lado="esquerda"] .dex.balao-esq .dex-balao{left:auto;right:calc(100% - 26px);border-radius:18px 18px 4px 18px;transform-origin:100% 100%}
.dex-balao.on{opacity:1;transform:none;pointer-events:auto;cursor:pointer}
.dex-balao b{font-weight:600}
html[data-theme="dark"] .dex-balao{background:#1d2026;color:#f2f4f7;border-color:rgba(255,255,255,.1)}
@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .dex-balao{background:#1d2026;color:#f2f4f7;border-color:rgba(255,255,255,.1)}}

/* ---------- guia na tela ---------- */
.dex-spot{position:fixed;z-index:116;left:0;top:0;border-radius:18px;pointer-events:none;opacity:0;
  box-shadow:0 0 0 200vmax rgba(6,8,12,.42);transition:opacity .4s ease,transform .7s var(--e-apple),width .7s var(--e-apple),height .7s var(--e-apple)}
.dex-spot.on{opacity:1}
.dex-spot::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:2px solid rgba(255,255,255,.95);box-shadow:0 0 24px rgba(255,255,255,.45);animation:dexAnel 1.6s var(--e-apple) infinite}
@keyframes dexAnel{0%{transform:scale(.98);opacity:1}70%{transform:scale(1.06);opacity:0}100%{opacity:0}}
html.dex-guia #aiChat.open{opacity:0 !important;transform:translateY(24px) scale(.9) !important;pointer-events:none !important}
html.dex-guia .dex{z-index:121}
html.dex-guia.dex-chat-aberto .dex{opacity:1 !important}

@media (max-width:720px){
  .dex{right:12px;bottom:10px;--dex-w:68px;width:68px}
  html.dex-chat-aberto:not(.dex-guia) .dex{opacity:0;transform:translateY(20px) scale(.8);pointer-events:none}
  html.dex-chat-aberto:not(.dex-guia) .dex *{pointer-events:none !important}
  .dex-balao{max-width:190px;font-size:12.5px}
}
@media (prefers-reduced-motion:reduce){.dex-svg *{animation:none !important}}
html.dex-pausa .dex-svg *{animation-play-state:paused !important}

/* ======================= CHAT: a ilha do Dex ======================= */
#aiChat{width:min(410px,calc(100vw - 24px)) !important;height:min(660px,calc(100vh - 40px)) !important;border-radius:34px !important;overflow:hidden !important;
  background:color-mix(in srgb,var(--panel) 80%,transparent) !important;-webkit-backdrop-filter:blur(30px) saturate(1.7);backdrop-filter:blur(30px) saturate(1.7);
  border:1px solid color-mix(in srgb,var(--ink) 9%,transparent) !important;
  box-shadow:0 40px 120px rgba(8,10,14,.34),0 12px 30px rgba(8,10,14,.12),inset 0 1px 0 rgba(255,255,255,.45) !important;
  transform-origin:100% 100%;transition:opacity .35s ease,transform .75s var(--e-mola2),visibility 0s linear .75s !important}
#aiChat:not(.open){opacity:0 !important;transform:translate(26px,30px) scale(.55) !important}
#aiChat.open{transition:opacity .3s ease,transform .75s var(--e-mola2),visibility 0s !important}
html.dex-on:not([data-ak-orb="nao"]) #aiChat{right:calc(var(--dex-w) + 38px) !important;bottom:22px !important}
html.dex-on[data-dex-lado="esquerda"]:not([data-ak-orb="nao"]) #aiChat{right:24px !important;transform-origin:0 100%}
#aiChat.open .ai-chat-head{animation:dexEntra .6s var(--e-apple) .06s both}
#aiChat.open .ai-chat-body{animation:dexEntra .7s var(--e-apple) .12s both}
#aiChat.open .ak-chips,#aiChat.open .ai-chat-input{animation:dexEntra .7s var(--e-apple) .18s both}
@keyframes dexEntra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

#aiChat .ai-chat-head{background:transparent !important;padding:12px 12px 6px !important;gap:8px !important;border:0 !important;display:flex !important;align-items:flex-start !important;overflow:visible !important}
#aiChat .ai-chat-head::before,#aiChat .ai-chat-head::after{display:none !important}
.dex-ilha{position:relative;flex:1;min-width:0;border-radius:26px;background:#0c0d10;color:#fff;overflow:hidden;isolation:isolate;
  box-shadow:0 10px 30px rgba(8,10,14,.28),inset 0 1px 0 rgba(255,255,255,.08);transition:border-radius .6s var(--e-apple),box-shadow .4s ease}
.dex-ilha::before{content:"";position:absolute;inset:-80%;z-index:-2;background:conic-gradient(from 0deg,transparent 0 55%,rgba(255,255,255,.75) 72%,transparent 88%);opacity:0;transition:opacity .4s ease;animation:dexGira 1.8s linear infinite}
.dex-ilha::after{content:"";position:absolute;inset:1.6px;border-radius:inherit;z-index:-1;background:radial-gradient(120% 140% at 0% 0%,#24262c 0%,#0c0d10 55%)}
.dex-ilha.pensa::before{opacity:1}
.dex-ilha.aberta{border-radius:24px}
.dex-ilha-topo{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;padding:6px 12px 6px 6px;cursor:pointer}
.dex-ilha-topo:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-3px;border-radius:24px}
#aiChat .dex-ilha .ai-brand{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
#aiChat .dex-ilha .ai-avatar{width:46px !important;height:40px !important;flex:none;filter:none !important;margin:0 !important}
#aiChat .dex-ilha .ai-title{min-width:0}
#aiChat .dex-ilha .ai-title b{color:#fff !important;font:600 15px/1.15 var(--f-ui) !important;display:block}
#aiChat .dex-ilha .ai-title small{display:none !important}
.dex-st{display:flex;align-items:center;gap:6px;margin-top:3px;font:400 11.5px/1.2 var(--f-ui,system-ui);color:rgba(255,255,255,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dex-pt{width:7px;height:7px;border-radius:50%;flex:none;background:#5bd69a;box-shadow:0 0 0 3px rgba(91,214,154,.18);transition:background .3s ease,box-shadow .3s ease}
.dex-ilha[data-modo="local"] .dex-pt{background:#c9ced6;box-shadow:0 0 0 3px rgba(201,206,214,.16)}
.dex-ilha[data-modo="limite"] .dex-pt{background:#ffb35c;box-shadow:0 0 0 3px rgba(255,179,92,.18)}
.dex-onda{display:none;align-items:center;gap:2.5px;height:12px}
.dex-onda i{display:block;width:3px;height:100%;border-radius:3px;background:#fff;transform:scaleY(.3);animation:dexOnda .9s ease-in-out infinite}
.dex-onda i:nth-child(2){animation-delay:.12s}.dex-onda i:nth-child(3){animation-delay:.24s}.dex-onda i:nth-child(4){animation-delay:.36s}.dex-onda i:nth-child(5){animation-delay:.48s}
@keyframes dexOnda{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.dex-ilha.pensa .dex-onda{display:flex}
.dex-gauge{flex:none;width:30px;height:30px;position:relative;display:grid;place-items:center}
.dex-gauge svg{position:absolute;inset:0;transform:rotate(-90deg)}
.dex-gauge circle{fill:none;stroke-width:3.2}
.dex-gauge .fundo{stroke:rgba(255,255,255,.14)}
.dex-gauge .arco{stroke:#fff;stroke-linecap:round;transition:stroke-dashoffset 1s var(--e-apple),stroke .3s ease}
.dex-gauge span{font:600 8.5px/1 var(--f-num,system-ui);color:rgba(255,255,255,.85)}
.dex-ilha-mais{display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s var(--e-apple)}
.dex-ilha.aberta .dex-ilha-mais{grid-template-rows:1fr}
.dex-ilha-in{overflow:hidden;min-height:0}
.dex-ilha-cont{padding:4px 14px 14px;opacity:0;transform:translateY(-6px);transition:opacity .3s ease,transform .5s var(--e-apple)}
.dex-ilha.aberta .dex-ilha-cont{opacity:1;transform:none;transition-delay:.12s}
.dex-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dex-tile{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:10px 11px;min-width:0}
.dex-tile.larga{grid-column:1/-1}
.dex-tile small{display:block;font:500 9.5px/1 var(--f-ui,system-ui);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5);margin:0 0 6px}
.dex-tile b{display:block;font:600 15px/1.15 var(--f-num,system-ui);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dex-tile em{display:block;font-style:normal;font-size:10.5px;color:rgba(255,255,255,.55);margin-top:4px}
.dex-barra{height:6px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:8px}
.dex-barra i{display:block;height:100%;width:100%;border-radius:inherit;background:linear-gradient(90deg,#fff,#c9ced6);transform-origin:left;transform:scaleX(var(--v,0));transition:transform 1s var(--e-apple)}
.dex-barra.baixa i{background:linear-gradient(90deg,#ffb35c,#ffd58a)}
.dex-spark{display:flex;align-items:flex-end;gap:3px;height:30px;margin-top:6px}
.dex-spark i{flex:1;min-width:3px;max-width:14px;border-radius:3px 3px 1px 1px;background:rgba(255,255,255,.75);height:calc(var(--h) * 100%);transform-origin:bottom;animation:dexBarraSobe .7s var(--e-apple) both;animation-delay:calc(var(--i) * 25ms)}
@keyframes dexBarraSobe{from{transform:scaleY(0)}to{transform:none}}
.dex-ilha-acoes{display:flex;gap:8px;margin-top:10px}
#aiChat .ai-chat-head .dex-ilha-acoes button{all:unset;cursor:pointer;flex:1;text-align:center;padding:9px 10px;border-radius:999px !important;background:rgba(255,255,255,.1) !important;border:0 !important;color:#fff !important;font:500 12px/1 var(--f-ui,system-ui);transition:background .2s ease,transform .3s var(--e-mola)}
#aiChat .ai-chat-head .dex-ilha-acoes button:hover{background:rgba(255,255,255,.2) !important}
#aiChat .ai-chat-head .dex-ilha-acoes button:active{transform:scale(.95)}
#aiChat .ai-chat-head .dex-hd-btn{all:unset;flex:none;width:38px;height:38px;border-radius:50% !important;display:grid;place-items:center;cursor:pointer;color:var(--ink) !important;
  background:color-mix(in srgb,var(--panel) 70%,transparent) !important;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent) !important;box-shadow:0 6px 16px rgba(8,10,14,.1);
  transition:transform .4s var(--e-mola),background .2s ease}
#aiChat .ai-chat-head .dex-hd-btn:hover{transform:scale(1.07) rotate(30deg);background:var(--panel) !important}
#aiChat .ai-chat-head .dex-hd-btn:active{transform:scale(.92)}
.dex-hd-btn svg{width:17px;height:17px}
#aiChat #aiClose{all:unset;flex:none;width:38px;height:38px;border-radius:50%;display:grid !important;place-items:center;cursor:pointer;font:400 22px/1 system-ui;color:var(--ink) !important;
  background:color-mix(in srgb,var(--panel) 70%,transparent) !important;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent) !important;box-shadow:0 6px 16px rgba(8,10,14,.1);transition:transform .4s var(--e-mola)}
#aiChat #aiClose:hover{transform:scale(1.07) rotate(90deg)}

/* mensagens */
#aiChat .ai-chat-body{background:transparent !important;padding:14px 14px 10px !important;gap:10px !important;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 16px,#000 calc(100% - 8px),transparent);mask-image:linear-gradient(to bottom,transparent 0,#000 16px,#000 calc(100% - 8px),transparent)}
#aiChat .ai-msg{animation:dexBolha .6s var(--e-mola2) both !important;font-size:13.5px !important;line-height:1.5 !important}
#aiChat .ai-msg.user{transform-origin:right bottom;background:linear-gradient(180deg,#2c2f36,#17191d) !important;color:#fff !important;border-radius:22px 22px 6px 22px !important;box-shadow:0 8px 20px rgba(8,10,14,.18)}
#aiChat .ai-msg.bot:not(.ak-rico){transform-origin:left bottom;background:color-mix(in srgb,var(--panel) 92%,var(--ink) 4%) !important;border:1px solid color-mix(in srgb,var(--ink) 8%,transparent) !important;color:var(--ink) !important;border-radius:22px 22px 22px 6px !important}
#aiChat .ai-msg.bot{position:relative}
#aiChat .ai-msg.bot::before{display:none !important}
@keyframes dexBolha{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}
html[data-theme="dark"] #aiChat .ai-msg.user{background:linear-gradient(180deg,#f3f4f6,#dfe2e7) !important;color:#14161a !important}
@media (prefers-color-scheme:dark){html:not([data-theme="light"]) #aiChat .ai-msg.user{background:linear-gradient(180deg,#f3f4f6,#dfe2e7) !important;color:#14161a !important}}
.dex-av{position:absolute;left:-42px;bottom:-2px;width:34px;height:30px;display:none;pointer-events:none}
#aiChat .ai-msg.bot:not(:has(+ .ai-msg.bot)) > .dex-av{display:block}
.dex-av .dex-svg{width:100%;height:100%}
.ai-msg.dex-ia{white-space:pre-wrap}
.dex-txt{overflow:hidden;transition:height .5s var(--e-apple)}
.ai-msg.dex-ia .dex-palavra{opacity:0;animation:dexPalavra .5s var(--e-apple) forwards;animation-delay:calc(var(--i) * 24ms)}
@keyframes dexPalavra{from{opacity:0;filter:blur(4px);transform:translateY(2px)}to{opacity:1;filter:none;transform:none}}
.dex-pontos{display:inline-flex;gap:5px;padding:4px 2px}
.dex-pontos i{width:7px;height:7px;border-radius:50%;background:var(--ink3,#8a919c);animation:dexPulsa 1.1s var(--e-apple) infinite}
.dex-pontos i:nth-child(2){animation-delay:.15s}.dex-pontos i:nth-child(3){animation-delay:.3s}
@keyframes dexPulsa{0%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}
.ai-msg.dex-ia .ak-btns{margin-top:10px;white-space:normal}
.ai-msg.dex-aviso{font-size:12px !important;opacity:.85}
#aiChat .ak-btn{border-radius:999px !important;transition:transform .35s var(--e-mola),background .2s ease !important}
#aiChat .ak-btn:active{transform:scale(.95) !important}
#aiChat .ak-btn.pri,#aiChat .ak-slash{background:#17191d !important;color:#fff !important;border-color:#17191d !important;box-shadow:0 8px 20px rgba(8,10,14,.2) !important}
html[data-theme="dark"] #aiChat .ak-btn.pri,html[data-theme="dark"] #aiChat .ak-slash{background:#eef0f3 !important;color:#14161a !important;border-color:#eef0f3 !important}
#aiChat .ak-card,#aiChat .ak-starter{border-radius:20px !important;background:color-mix(in srgb,var(--panel) 88%,transparent) !important;border-color:color-mix(in srgb,var(--ink) 8%,transparent) !important}
#aiChat .ak-starter{transition:transform .45s var(--e-mola),box-shadow .3s ease !important}
#aiChat .ak-starter:hover{transform:translateY(-3px) !important;box-shadow:0 14px 30px rgba(8,10,14,.12) !important}
#aiChat .ak-chip{border-radius:999px !important;background:color-mix(in srgb,var(--panel) 80%,transparent) !important;transition:transform .4s var(--e-mola),background .2s ease !important}
#aiChat .ak-chip:hover{transform:translateY(-2px) !important}
#aiChat .ai-chat-input{margin:4px 12px 12px !important;padding:6px !important;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent) !important;border-radius:28px !important;
  background:color-mix(in srgb,var(--panel) 92%,transparent) !important;box-shadow:inset 0 1px 2px rgba(8,10,14,.06),0 10px 24px rgba(8,10,14,.08);gap:6px !important;align-items:center;transition:box-shadow .3s ease,border-color .3s ease}
#aiChat .ai-chat-input:focus-within{border-color:color-mix(in srgb,var(--ink) 22%,transparent) !important;box-shadow:0 0 0 4px color-mix(in srgb,var(--ink) 7%,transparent),0 14px 30px rgba(8,10,14,.12)}
#aiChat .ai-chat-input input{border:0 !important;background:transparent !important;box-shadow:none !important;font-size:14px !important;padding:9px 6px !important}
#aiChat .ai-chat-input button[type="submit"]{width:40px !important;height:40px !important;border-radius:50% !important;background:#17191d !important;color:#fff !important;flex:none;
  transform:scale(.78);opacity:.45;transition:transform .45s var(--e-mola),opacity .25s ease !important}
#aiChat .ai-chat-input.tem-texto button[type="submit"]{transform:scale(1);opacity:1}
html[data-theme="dark"] #aiChat .ai-chat-input button[type="submit"]{background:#eef0f3 !important;color:#14161a !important}
#aiChat .ak-slash{width:40px !important;height:40px !important}
#aiChat .ak-pal{border-radius:22px !important;background:color-mix(in srgb,var(--panel) 92%,transparent) !important;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
.head-orb .dex-svg{width:100%;height:100%;filter:drop-shadow(0 10px 16px rgba(10,12,16,.25))}
.head-orb{filter:none !important}
@media (max-width:720px){
  html.dex-on #aiChat,html.dex-on:not([data-ak-orb="nao"]) #aiChat,html.dex-on[data-dex-lado="esquerda"]:not([data-ak-orb="nao"]) #aiChat{right:12px !important;bottom:12px !important;height:calc(100vh - 24px) !important}
}

/* ======================= AJUSTES → DEX ======================= */
.dex-sec{margin-bottom:6px}
.dex-palco{position:relative;display:grid;grid-template-columns:118px 1fr;gap:16px;align-items:center;padding:14px 16px;border-radius:22px;margin:0 0 14px;
  background:radial-gradient(130% 120% at 0% 0%,color-mix(in srgb,var(--panel2) 70%,#fff) 0%,var(--panel2) 60%);border:1px solid var(--line2)}
html[data-theme="dark"] .dex-palco{background:radial-gradient(130% 120% at 0% 0%,#1d2565 0%,var(--panel2) 60%)}
.dex-palco .dex-prev{width:104px;cursor:pointer}
.dex-palco h5{margin:0 0 4px;font:600 18px/1.1 var(--f-ui)}
.dex-palco p{margin:0 0 10px;font-size:12.5px;color:var(--ink3)}
.dex-palco .dex-acoes{display:flex;flex-wrap:wrap;gap:6px}
.dex-abas{position:relative;display:grid;grid-template-columns:repeat(4,1fr);padding:4px;border-radius:999px;background:var(--panel2);border:1px solid var(--line2);margin:0 0 14px}
.dex-abas button{all:unset;position:relative;z-index:1;text-align:center;cursor:pointer;padding:8px 4px;font:500 12.5px/1 var(--f-ui);color:var(--ink2);border-radius:999px;transition:color .25s ease}
.dex-abas button[aria-selected="true"]{color:var(--ink);font-weight:600}
.dex-abas .dex-polegar{position:absolute;z-index:0;top:4px;bottom:4px;left:4px;width:calc((100% - 8px) / 4);border-radius:999px;background:var(--panel);box-shadow:0 2px 8px rgba(8,10,14,.12),0 0 0 1px var(--line);
  transform:translateX(calc(var(--n,0) * 100%));transition:transform .55s var(--e-apple)}
.dex-paineis{position:relative}
.dex-painel{display:none}
.dex-painel.on{display:block;animation:dexPainel .5s var(--e-apple)}
@keyframes dexPainel{from{opacity:0;transform:translateX(calc(var(--dir,1) * 18px))}to{opacity:1;transform:none}}
.dex-campo{display:block;margin:0 0 14px}
.dex-campo > span{display:block;font:600 10px/1 var(--f-ui,system-ui);letter-spacing:.16em;text-transform:uppercase;color:var(--ink3,#77759a);margin:0 0 8px}
.dex-seg{display:flex;flex-wrap:wrap;gap:6px}
.dex-seg button{all:unset;cursor:pointer;padding:8px 13px;border-radius:999px;font:500 12.5px/1 var(--f-ui,system-ui);border:1px solid var(--line,#e3e2ec);color:var(--ink2,#46436a);background:var(--panel);
  transition:background .25s ease,color .2s ease,border-color .2s ease,transform .35s var(--e-mola)}
.dex-seg button:hover{border-color:#8b919c}
.dex-seg button:active{transform:scale(.95)}
.dex-seg button[aria-pressed="true"]{background:#17191d;border-color:#17191d;color:#fff}
html[data-theme="dark"] .dex-seg button[aria-pressed="true"]{background:#eef0f3;border-color:#eef0f3;color:#14161a}
.dex-cor{width:14px;height:14px;border-radius:50%;display:inline-block;vertical-align:-3px;margin-right:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
.dex-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px}
.dex-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;justify-items:center;gap:6px;padding:10px 6px 9px;border-radius:18px;border:1px solid var(--line);background:var(--panel);
  font:500 11.5px/1.2 var(--f-ui);color:var(--ink2);text-align:center;transition:transform .4s var(--e-mola),border-color .2s ease,box-shadow .3s ease,background .25s ease}
.dex-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(8,10,14,.1)}
.dex-card:active{transform:scale(.95)}
.dex-card[aria-pressed="true"]{border-color:#17191d;box-shadow:0 0 0 2px #17191d;color:var(--ink);font-weight:600}
html[data-theme="dark"] .dex-card[aria-pressed="true"]{border-color:#eef0f3;box-shadow:0 0 0 2px #eef0f3}
.dex-card .dex-svg{width:58px;height:46px}
.dex-card .dex-svg.dex-inteiro{width:40px;height:54px}
.dex-dica{font-size:12px;color:var(--ink3);margin:-4px 0 14px;line-height:1.45}
.dex-sec input.dex-nome{width:100%;box-sizing:border-box;padding:10px 13px}
.dex-rod{display:flex;justify-content:space-between;gap:8px;padding-top:12px;border-top:1px solid var(--line2);margin-top:4px}
`;
  var st=el('style'); st.id='dex-css'; st.textContent=css; D.head.appendChild(st);

  /* ------------------------------------------------------------------ desenho */
  var uid=0;
  var TRONCO='M80 90C108 90 121 105 119.5 128C118 152 101 166 80 166C59 166 42 152 40.5 128C39 105 52 90 80 90Z';
  function cabAtras(){
    return '<g class="dex-cab dex-cab-antena"><path d="M80 13V2"/><circle cx="80" cy="1" r="4.5"/></g>'+
      '<g class="dex-cab dex-cab-coelho">'+
        '<g transform="rotate(-16 58 18)"><rect class="dx-pele" x="47" y="-38" width="22" height="58" rx="11"/><rect x="52.5" y="-30" width="11" height="42" rx="5.5" fill="#F2B8C6"/></g>'+
        '<g transform="rotate(16 102 18)"><rect class="dx-pele" x="91" y="-38" width="22" height="58" rx="11"/><rect x="96.5" y="-30" width="11" height="42" rx="5.5" fill="#F2B8C6"/></g>'+
      '</g>';
  }
  function cabFrente(){
    return ''+
      '<g class="dex-cab dex-cab-festa" transform="rotate(14 80 16)"><path class="dx-l" d="M80 -22L99 15Q80 21 61 15Z" fill="#1E2126"/><path d="M74.5 -9.5L85.5 -9.5M69 2L91 2" fill="none" stroke="#F6F7F9" stroke-width="3.2"/><circle class="dx-l" cx="80" cy="-23" r="5.5" fill="#F6F7F9"/></g>'+
      '<g class="dex-cab dex-cab-natal"><path class="dx-l" d="M33 14C34 -14 66 -30 98 -24C116 -20 131 -6 137 16L124 13Z" fill="#D7323F"/><path d="M60 -16C70 -22 84 -24 96 -21" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>'+
        '<rect class="dx-l" x="26" y="7" width="108" height="15" rx="7.5" fill="#FFFFFF"/><circle class="dx-l" cx="139" cy="20" r="8" fill="#FFFFFF"/></g>'+
      '<g class="dex-cab dex-cab-coelho"><path d="M76.5 59.5h7l-3.5 4z" fill="#F2B8C6" stroke="#F2B8C6" stroke-width="2" stroke-linejoin="round"/>'+
        '<path class="dex-bigode-coelho" d="M60 61L45 58M60 64L45 66M100 61L115 58M100 64L115 66"/></g>'+
      '<g class="dex-cab dex-cab-formatura"><path class="dx-l" d="M50 6V18Q80 28 110 18V6Z" fill="#202329"/><path class="dx-l" d="M80 -14L134 2L80 18L26 2Z" fill="#2A2D34"/>'+
        '<circle cx="80" cy="2" r="3.2" fill="#E7B96A"/><path d="M80 2Q112 6 124 6V26" fill="none" stroke="#E7B96A" stroke-width="2.4" stroke-linecap="round"/><rect x="120.5" y="24" width="7" height="12" rx="3" fill="#E7B96A"/></g>'+
      '<g class="dex-cab dex-cab-chef"><path class="dx-l" fill="#FFFFFF" d="M48 16C36 14 34 -6 50 -6C50 -20 66 -24 74 -14C80 -24 96 -22 98 -10C112 -14 122 4 110 14Z"/>'+
        '<rect class="dx-l" x="46" y="8" width="68" height="15" rx="5" fill="#FFFFFF"/><path d="M60 11V20M72 11V20M84 11V20M96 11V20" stroke="#D5D9E0" stroke-width="2"/></g>'+
      '<g class="dex-cab dex-cab-coroa"><path class="dx-l" fill="#E7B96A" d="M50 20L46 -6L62 6L80 -12L98 6L114 -6L110 20Z"/><circle cx="80" cy="-12" r="3.5" fill="#FFFFFF"/><circle cx="46" cy="-6" r="3" fill="#FFFFFF"/><circle cx="114" cy="-6" r="3" fill="#FFFFFF"/><circle cx="80" cy="11" r="3.6" fill="#D7323F"/></g>'+
      '<g class="dex-cab dex-cab-fones"><path d="M20 52C18 -2 142 -2 140 52" fill="none" stroke="#1B1D22" stroke-width="7" stroke-linecap="round"/>'+
        '<rect class="dx-l" x="5" y="35" width="25" height="44" rx="11" fill="#1B1D22"/><rect class="dx-l" x="130" y="35" width="25" height="44" rx="11" fill="#1B1D22"/>'+
        '<rect x="10.5" y="46" width="6" height="22" rx="3" fill="#5A5F69"/><rect x="143.5" y="46" width="6" height="22" rx="3" fill="#5A5F69"/></g>';
  }
  function rostoAcess(){
    return '<g class="dex-ros dex-ros-oculos"><circle cx="62" cy="51" r="14" fill="none" stroke="#F6F7F9" stroke-width="3"/><circle cx="98" cy="51" r="14" fill="none" stroke="#F6F7F9" stroke-width="3"/><path d="M76 49Q80 46 84 49" fill="none" stroke="#F6F7F9" stroke-width="3"/></g>'+
      '<g class="dex-ros dex-ros-escuros"><path d="M43 41H78V52Q78 63 66 63H56Q43 63 43 52Z" fill="#050607" fill-opacity=".86" stroke="#F6F7F9" stroke-width="2"/><path d="M82 41H117V52Q117 63 104 63H94Q82 63 82 52Z" fill="#050607" fill-opacity=".86" stroke="#F6F7F9" stroke-width="2"/>'+
        '<path d="M78 45H82" stroke="#F6F7F9" stroke-width="2.4"/><path d="M48 46L57 46M87 46L96 46" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/></g>'+
      '<g class="dex-ros dex-ros-bigode"><path d="M80 62C74 57 63 58 58 65C65 63 72 66 80 64C88 66 95 63 102 65C97 58 86 57 80 62Z" fill="#F6F7F9"/></g>';
  }
  function corpoAcess(u){
    return '<g class="dex-crp dex-crp-noel"><path class="dx-l" d="'+TRONCO+'" fill="#D7323F"/><path d="M58 104C61 98 67 95 72 96" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>'+
        '<rect x="38" y="131" width="84" height="11" fill="#1B1D22" clip-path="url(#dexT'+u+')"/><rect x="72" y="129" width="16" height="15" rx="3" fill="none" stroke="#E7B96A" stroke-width="3"/>'+
        '<path d="M80 96V129" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/><path d="M56 95Q80 107 104 95" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/></g>'+
      '<g class="dex-crp dex-crp-cachecol"><path class="dx-l" d="M58 92Q80 104 102 92L104 102Q80 116 56 102Z" fill="#D7323F"/><path class="dx-l" d="M90 104L98 136L86 138L80 108Z" fill="#D7323F"/>'+
        '<path d="M64 97Q80 106 96 97" stroke="#fff" stroke-width="3" fill="none" opacity=".85"/><path d="M89 117L95 116M91 127L97 126" stroke="#fff" stroke-width="3"/></g>'+
      '<g class="dex-crp dex-crp-gravata"><path class="dx-l" d="M80 97L63 89V106Z" fill="#1B1D22"/><path class="dx-l" d="M80 97L97 89V106Z" fill="#1B1D22"/><rect class="dx-l" x="75" y="92" width="10" height="10" rx="3" fill="#2F3239"/></g>';
  }
  function olho(lado,x){
    return '<g class="dex-olho dex-olho-'+lado+'" transform="translate('+x+' 51)"><g class="dex-o">'+
      '<rect class="dex-o-aberto" x="-7" y="-9.5" width="14" height="19" rx="7"/>'+
      '<path class="dex-o-feliz" d="M-8 3Q0 -9 8 3"/>'+
      '<path class="dex-o-fechado" d="M-7.5 1.5Q0 6 7.5 1.5"/>'+
      '<path class="dex-o-coracao" d="M0 8C-10 1 -10 -8 -4.6 -8C-2 -8 0 -6 0 -3.6C0 -6 2 -8 4.6 -8C10 -8 10 1 0 8Z"/>'+
      '<path class="dex-o-tonto" d="M0 0a1.5 1.5 0 0 1 1.5 1.5a3 3 0 0 1 -3 3a4.5 4.5 0 0 1 -4.5 -4.5a6 6 0 0 1 6 -6a7.5 7.5 0 0 1 7.5 7.5"/>'+
    '</g></g>';
  }
  function partesCabeca(u){
    return '<g class="dex-cabeca">'+cabAtras()+
      '<rect class="dex-orelha" x="14" y="41" width="16" height="32" rx="8"/>'+
      '<rect class="dex-orelha" x="130" y="41" width="16" height="32" rx="8"/>'+
      '<rect class="dex-topo" x="63" y="10" width="34" height="13" rx="6.5"/>'+
      '<rect class="dex-casco" x="22" y="17" width="116" height="72" rx="34"/>'+
      '<path class="dex-casco-brilho" d="M38 35C43 27 53 23 63 22.5"/>'+
      '<rect class="dex-visor" x="33" y="28" width="94" height="51" rx="23" fill="url(#dexV'+u+')"/>'+
      '<path class="dex-visor-brilho" d="M44 37C49 33 56 32 62 32"/>'+
      '<g class="dex-rosto" filter="url(#dexG'+u+')">'+
        '<ellipse class="dex-bochecha" cx="47" cy="64" rx="6" ry="3.2"/><ellipse class="dex-bochecha" cx="113" cy="64" rx="6" ry="3.2"/>'+
        '<g class="dex-olhos">'+olho('e',62)+olho('d',98)+'</g>'+
        '<g class="dex-boca" transform="translate(80 68)">'+
          '<path class="dex-boca-sorriso" d="M-6 -1.5Q0 4.5 6 -1.5"/><ellipse class="dex-boca-o" cx="0" cy="0" rx="4" ry="4.4"/><path class="dex-boca-triste" d="M-5.5 2.5Q0 -3 5.5 2.5"/>'+
        '</g>'+
      '</g>'+rostoAcess()+cabFrente()+
    '</g>';
  }
  function defs(u){
    return '<defs>'+
      '<filter id="dexG'+u+'" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
      '<radialGradient id="dexV'+u+'" cx="50%" cy="38%" r="70%"><stop offset="0" style="stop-color:var(--c-visor2)"/><stop offset="1" style="stop-color:var(--c-visor)"/></radialGradient>'+
      '<clipPath id="dexT'+u+'"><path d="'+TRONCO+'"/></clipPath>'+
    '</defs>';
  }
  var CONF=[['#E7B96A',-34,-40],['#40AF73',30,-46],['#1BBACC',-46,-12],['#7818FA',44,-16],['#F6F7F9',-18,-56],['#0E69BE',16,-60],['#E7B96A',52,-36],['#F6F7F9',-52,-30]];
  function svgCompleto(cls){
    var u=++uid;
    return '<svg class="dex-svg'+(cls?' '+cls:'')+'" viewBox="0 -30 160 214" aria-hidden="true" data-humor="neutro">'+defs(u)+
      '<ellipse class="dex-chao" cx="80" cy="177" rx="34" ry="5.5"/>'+
      '<g class="dex-flutua"><g class="dex-mola"><g class="dex-truque">'+
        '<path class="dex-jato" d="M64 160Q68 186 72 160Z"/><path class="dex-jato" d="M88 160Q92 186 96 160Z"/>'+
        '<g class="dex-braco dex-braco-e"><g class="dex-osc"><rect x="27" y="97" width="17" height="44" rx="8.5"/></g></g>'+
        '<g class="dex-braco dex-braco-d"><g class="dex-osc"><rect x="116" y="97" width="17" height="44" rx="8.5"/></g></g>'+
        '<rect class="dex-pescoco" x="69" y="82" width="22" height="14" rx="5"/>'+
        '<path class="dex-tronco" d="'+TRONCO+'"/>'+
        '<path class="dex-tronco-sombra" d="M103 95C115 104 121 119 118.5 136C115 155 99 165 80 166C96 157 108 142 108 123C108 111 106 102 103 95Z"/>'+
        '<path class="dex-brilho" d="M54 108C58 100 66 96 72 97C68 102 62 110 59 122C57 128 52 120 54 108Z"/>'+
        '<path class="dex-costura" d="M47 137Q80 148 113 137"/>'+
        '<rect class="dex-luz" x="71" y="117" width="18" height="5" rx="2.5"/>'+
        corpoAcess(u)+partesCabeca(u)+
      '</g></g></g>'+
      '<g class="dex-fx">'+
        '<g><path class="dex-fx-brilho" d="M24 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#C9CED6" stroke="#24272D" stroke-width="1.4"/>'+
           '<path class="dex-fx-brilho" d="M142 8l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill="#F6F7F9" stroke="#24272D" stroke-width="1.4"/></g>'+
        '<g><circle class="dex-fx-ponto" cx="128" cy="2" r="3.6" fill="#9AA1AC"/><circle class="dex-fx-ponto" cx="139" cy="-6" r="3.6" fill="#9AA1AC"/><circle class="dex-fx-ponto" cx="150" cy="-14" r="3.6" fill="#9AA1AC"/></g>'+
        '<g><text class="dex-fx-z" x="122" y="6">z</text><text class="dex-fx-z" x="130" y="-2" style="font-size:16px">z</text><text class="dex-fx-z" x="140" y="-10" style="font-size:19px">Z</text></g>'+
        '<g><path class="dex-fx-cor" d="M30 10c-5-3.5-5-8-2.3-8 1.3 0 2.3 1 2.3 2.2 0-1.2 1-2.2 2.3-2.2 2.7 0 2.7 4.5-2.3 8z"/>'+
           '<path class="dex-fx-cor" d="M132 0c-6-4-6-9.5-2.7-9.5 1.6 0 2.7 1.2 2.7 2.6 0-1.4 1.1-2.6 2.7-2.6 3.3 0 3.3 5.5-2.7 9.5z"/>'+
           '<path class="dex-fx-cor" d="M118 -14c-4-3-4-6.5-1.8-6.5 1 0 1.8.8 1.8 1.8 0-1 .8-1.8 1.8-1.8 2.2 0 2.2 3.5-1.8 6.5z"/></g>'+
        '<g>'+CONF.map(function(c,i){ return '<rect class="dex-fx-conf" x="77" y="10" width="6" height="9" rx="1.5" fill="'+c[0]+'" style="--i:'+i+';--cx:'+c[1]+'px;--cy:'+c[2]+'px"/>'; }).join('')+'</g>'+
      '</g>'+
    '</svg>';
  }
  function svgCabeca(cls){
    var u=++uid;
    return '<svg class="dex-svg dex-mini'+(cls?' '+cls:'')+'" viewBox="10 -2 140 96" aria-hidden="true" data-humor="neutro">'+defs(u)+partesCabeca(u)+'</svg>';
  }
  var ALTOS={antena:1,festa:1,natal:1,coelho:1,formatura:1,chef:1,coroa:1,fones:1};

  /* ------------------------------------------------------------------ montar */
  var raiz=el('div','dex'); raiz.id='dex';
  raiz.innerHTML='<div class="dex-balao" role="status" aria-live="polite"></div><button class="dex-btn" type="button">'+svgCompleto()+'</button>';
  D.body.appendChild(raiz);
  var btn=raiz.querySelector('.dex-btn'), corpo=raiz.querySelector('.dex-svg'), balao=raiz.querySelector('.dex-balao');
  var spot=el('div','dex-spot'); D.body.appendChild(spot);
  H.classList.add('dex-on');
  var humorAtual='neutro';

  function trocarAvatares(){
    if(chat) chat.querySelectorAll('.ai-avatar').forEach(function(av){ if(!av.querySelector('.dex-mini')) av.innerHTML=svgCabeca(); });
    var orb=D.getElementById('btnAssistant'); if(orb&&!orb.querySelector('.dex-mini')) orb.innerHTML=svgCabeca();
    aplicarVisual();
  }
  function todos(){ return D.querySelectorAll('.dex-svg:not(.dex-fixo)'); }
  function aplicarVisual(){
    var v=visual();
    todos().forEach(function(s){
      s.setAttribute('data-cab',v.cab); s.setAttribute('data-rosto',v.rosto); s.setAttribute('data-corpo',v.corpo);
      if(s.classList.contains('dex-mini')) s.setAttribute('viewBox',ALTOS[v.cab]?'2 -42 156 136':'10 -2 140 96');
      if(s.getAttribute('data-humor')!==humorAtual) s.setAttribute('data-humor',humorAtual);
    });
  }

  function aplicarNome(){
    var n=CFG.nome||'Dex';
    btn.setAttribute('aria-label','Abrir o chat com '+n+', o assistente do AkiCut');
    var tt=chat&&chat.querySelector('.ai-title b'); if(tt) tt.textContent=n;
    var orb=D.getElementById('btnAssistant'); if(orb){ orb.setAttribute('aria-label','Abrir '+n); orb.title=n; }
    var w=chat&&chat.querySelector('.ai-welcome-copy');
    if(w) w.textContent=CFG.jeito==='formal'?'Olá, eu sou o '+n+', o assistente do AkiCut. Explico qualquer parte do site e executo boa parte das tarefas. Digite / para ver os comandos rápidos.'
      :'Bip-bop! Eu sou o '+n+', o assistente do AkiCut. Pode falar comigo do seu jeito: explico qualquer parte do site, faço tarefas por você e até mostro na tela onde fica cada coisa. Digite / para ver os comandos rápidos.';
    var card=D.querySelector('#inicioAssistente .inicio-txt'); if(card) card.innerHTML='<b>Conversar com o '+esc(n)+'</b><small>Tire dúvidas e peça ações por chat</small>';
    var nomeAj=D.querySelector('.dex-palco h5'); if(nomeAj) nomeAj.textContent=n;
  }

  function aplicarCfg(){
    H.setAttribute('data-dex-tam',CFG.tam); H.setAttribute('data-dex-acab',CFG.acab);
    H.setAttribute('data-dex-anim',CFG.anim); H.setAttribute('data-dex-lado',CFG.lado);
    H.style.setProperty('--dex-olho',OLHOS[CFG.olhos]||OLHOS.branco);
    if(CFG.seguir!=='sim') olharPara(0,0,0);
    aplicarVisual(); aplicarNome();
  }

  /* ------------------------------------------------------------------ humor */
  var E={hover:false,pensando:false,ouvindo:false,falaAte:0,dormindo:false,reacao:null,ultimoMov:Date.now(),guia:null};
  function base(){
    if(E.guia) return E.guia;
    if(E.pensando) return 'pensando';
    if(E.falaAte>Date.now()) return 'falando';
    if(E.dormindo) return 'dormindo';
    if(E.hover) return 'feliz';
    if(E.ouvindo) return 'ouvindo';
    return 'neutro';
  }
  var tBase=0;
  function render(){
    var h=(!E.guia&&E.reacao&&E.reacao.ate>Date.now())?E.reacao.h:base();
    if(h!==humorAtual){ humorAtual=h; todos().forEach(function(s){ s.setAttribute('data-humor',h); }); }
    clearTimeout(tBase);
    var prox=Math.min(E.reacao&&E.reacao.ate>Date.now()?E.reacao.ate:Infinity, E.falaAte>Date.now()?E.falaAte:Infinity);
    if(prox<Infinity) tBase=setTimeout(render,prox-Date.now()+10);
  }
  function reagir(h,ms){ E.reacao={h:h,ate:Date.now()+(ms||1200)}; render(); if(h==='comemorando') pular(); }
  function truque(nome,alvos){
    if(reduzido()) return;
    (alvos||[corpo]).forEach(function(s){ if(!s) return; s.classList.remove('pula','quica','pirueta'); void s.getBoundingClientRect(); s.classList.add(nome); });
  }
  function pular(){ truque('pula',[corpo,D.querySelector('.dex-prev')]); }
  D.addEventListener('animationend',function(e){
    var s=e.target&&e.target.closest&&e.target.closest('.dex-svg'); if(!s) return;
    if(/^dex(Pulo|Quica|Pirueta)$/.test(e.animationName)) s.classList.remove('pula','quica','pirueta');
    if(e.animationName==='dexSim') s.classList.remove('sim');
  },true);

  (function piscar(){
    setTimeout(function(){
      if(!D.hidden&&/^(neutro|ouvindo|falando|surpresa|apontando)$/.test(humorAtual)){
        var ss=todos(); ss.forEach(function(s){ s.classList.add('pisca'); });
        setTimeout(function(){ ss.forEach(function(s){ s.classList.remove('pisca'); });
          if(Math.random()<.22) setTimeout(function(){ ss.forEach(function(s){ s.classList.add('pisca'); }); setTimeout(function(){ ss.forEach(function(s){ s.classList.remove('pisca'); }); },110); },170);
        },120);
      }
      piscar();
    },2600+Math.random()*3800);
  })();
  function piscadinha(){ corpo.classList.add('pisca-d'); setTimeout(function(){ corpo.classList.remove('pisca-d'); },380); }

  /* ------------------------------------------------------------------ olhar e seguir o mouse */
  function olharPara(ox,oy,tilt){ corpo.style.setProperty('--ox',ox.toFixed(2)+'px'); corpo.style.setProperty('--oy',oy.toFixed(2)+'px'); corpo.style.setProperty('--tilt',tilt.toFixed(2)+'deg'); }
  var raf=0, px=0, py=0, olhandoAte=0;
  function seguir(){
    raf=0;
    if(CFG.seguir!=='sim'||E.guia||Date.now()<olhandoAte||/^(dormindo|pensando|tonto|espreguica)$/.test(humorAtual)) return;
    var r=btn.getBoundingClientRect(); if(!r.width) return;
    var cx=r.left+r.width/2, cy=r.top+r.height*.36, dx=px-cx, dy=py-cy, d=Math.hypot(dx,dy)||1, k=Math.min(1,d/220);
    olharPara(6*dx/d*k, 4.5*dy/d*k, Math.max(-6,Math.min(6,dx/d*6*Math.min(1,d/420))));
  }
  function olharElemento(alvo,ms){
    if(!alvo) return; var a=alvo.getBoundingClientRect(), r=btn.getBoundingClientRect();
    var dx=(a.left+a.width/2)-(r.left+r.width/2), dy=(a.top+a.height/2)-(r.top+r.height*.36), d=Math.hypot(dx,dy)||1;
    olharPara(6*dx/d,4.5*dy/d,Math.max(-6,Math.min(6,dx/d*6))); olhandoAte=Date.now()+(ms||900);
  }
  D.addEventListener('pointermove',function(e){ px=e.clientX; py=e.clientY; atividade(); if(!raf) raf=requestAnimationFrame(seguir); },{passive:true});

  /* ------------------------------------------------------------------ sono, olhadinhas e truques */
  var tSono=0;
  function atividade(){
    E.ultimoMov=Date.now();
    if(E.dormindo){ E.dormindo=false; reagir('surpresa',650); pular(); }
    clearTimeout(tSono);
    tSono=setTimeout(function(){ if(!aberto()&&!E.hover&&!E.guia){ E.dormindo=true; olharPara(0,2,0); render(); } },75000);
  }
  D.addEventListener('keydown',atividade,true);
  atividade();
  D.addEventListener('visibilitychange',function(){ H.classList.toggle('dex-pausa',D.hidden); });
  setInterval(function(){
    if(D.hidden||humorAtual!=='neutro'||Date.now()-E.ultimoMov<6000||CFG.seguir!=='sim') return;
    if(Math.random()<.5){ var s=Math.random()<.5?-1:1; olharPara(5*s,Math.random()*3-1,3*s); olhandoAte=Date.now()+1300; setTimeout(function(){ if(Date.now()>=olhandoAte) olharPara(0,0,0); },1350); }
  },5200);
  (function truques(){
    setTimeout(function(){
      if(CFG.truques==='sim'&&!D.hidden&&humorAtual==='neutro'&&!E.hover&&!aberto()&&!E.guia&&Date.now()-E.ultimoMov>3500&&!reduzido()&&H.getAttribute('data-ak-mov')!=='suaves'){
        var op=CFG.anim==='sutil'?['pisca','pulo']:['espreguica','pirueta','pulo','aceno','olha'];
        var t=op[Math.floor(Math.random()*op.length)];
        if(t==='espreguica') reagir('espreguica',1900);
        else if(t==='pirueta') truque('pirueta');
        else if(t==='pulo') pular();
        else if(t==='aceno') reagir('feliz',1500);
        else if(t==='olha'){ olharPara(-6,-2,-5); olhandoAte=Date.now()+900; setTimeout(function(){ olharPara(6,-2,5); olhandoAte=Date.now()+900; },900); }
        else piscadinha();
      }
      truques();
    },(CFG.anim==='expressiva'?11000:17000)+Math.random()*12000);
  })();

  /* ------------------------------------------------------------------ balão */
  var tBalao=0;
  function falarBalao(txt,ms,forcar){
    if(!forcar&&(CFG.balao!=='sim'||aberto()||H.getAttribute('data-ak-orb')==='nao')) return;
    balao.innerHTML=txt; balao.classList.add('on'); if(!E.guia) reagir('falando',Math.min(2400,balao.textContent.length*45));
    clearTimeout(tBalao); if(ms!==0) tBalao=setTimeout(function(){ balao.classList.remove('on'); },ms||5200);
  }
  balao.addEventListener('click',function(){ balao.classList.remove('on'); if(E.guia){ fimGuia(); return; } abrirChat(); });

  /* ------------------------------------------------------------------ interação */
  function aberto(){ return !!(chat&&chat.classList.contains('open')); }
  function abrirChat(){ var o=D.getElementById('btnAssistant'); if(o) o.click(); else if(chat){ chat.classList.add('open'); chat.setAttribute('aria-hidden','false'); } }
  var cliques=[];
  btn.addEventListener('pointerenter',function(e){ if(e.pointerType==='touch'||E.guia) return; if(!E.hover) truque('quica'); E.hover=true; setTimeout(render,120); });
  btn.addEventListener('pointerleave',function(){ E.hover=false; render(); if(Math.random()<.35&&humorAtual==='neutro') piscadinha(); });
  btn.addEventListener('click',function(){
    if(E.guia){ fimGuia(); return; }
    pular(); balao.classList.remove('on');
    if(!aberto()){ setTimeout(abrirChat,110); return; }
    var agora=Date.now(); cliques=cliques.filter(function(t){ return agora-t<1600; }); cliques.push(agora);
    if(cliques.length>=5){ cliques=[]; reagir('tonto',2300); } else reagir('amor',1500);
  });

  if(chat){
    new MutationObserver(function(){
      var ab=aberto(); H.classList.toggle('dex-chat-aberto',ab);
      if(ab&&!chat.__dexAb){ balao.classList.remove('on'); E.dormindo=false; reagir('surpresa',520); setTimeout(function(){ reagir('feliz',1300); },540); }
      chat.__dexAb=ab;
      E.pensando=chat.classList.contains('ak-pensando')||ocupado; render(); ilhaPensa();
    }).observe(chat,{attributes:true,attributeFilter:['class']});
  }
  if(input){
    var tSim=0;
    input.addEventListener('focus',function(){ E.ouvindo=true; render(); olharElemento(input,1200); });
    input.addEventListener('blur',function(){ E.ouvindo=false; render(); });
    input.addEventListener('input',function(){
      if(form) form.classList.toggle('tem-texto',!!input.value.trim());
      if(Math.random()<.3) olharElemento(input,700);
      clearTimeout(tSim); tSim=setTimeout(function(){ if(humorAtual==='ouvindo') todos().forEach(function(s){ s.classList.remove('sim'); void s.getBoundingClientRect(); s.classList.add('sim'); }); },500);
    });
  }

  /* avatar do Dex nas respostas e "fala" ao chegar mensagem */
  if(msgs){
    var marcar=function(n){ if(n.nodeType===1&&n.classList&&n.classList.contains('ai-msg')&&n.classList.contains('bot')&&!n.querySelector(':scope > .dex-av')){ n.appendChild(el('span','dex-av',svgCabeca())); } };
    msgs.querySelectorAll('.ai-msg.bot').forEach(marcar);
    new MutationObserver(function(ms){
      var novo=false;
      ms.forEach(function(m){ m.addedNodes.forEach(function(n){
        if(n.nodeType!==1||!n.classList||!n.classList.contains('ai-msg')||n.classList.contains('user')) return;
        marcar(n); novo=true;
        if(!n.classList.contains('dex-carregando')){ var len=(n.textContent||'').length; E.falaAte=Date.now()+Math.max(900,Math.min(4200,len*38)); render(); }
      }); });
      if(novo) aplicarVisual();
    }).observe(msgs,{childList:true});
  }

  /* abas: dica uma vez por aba, por sessão */
  var DICAS={inicio:'Quer ajuda para fechar as artes do mês? É só me chamar.',aniv:'Dica: você pode colar a lista de datas e nomes direto no meu chat.',
    arte:'Arraste a foto na prévia e use a roda do mouse para ajustar o zoom.',colab:'Fotos sem dono ficam em <b>Fotos a confirmar</b>, no topo desta aba.',
    novos:'Busque o colaborador para usar a foto que já está no cadastro.'};
  (function(){
    var o=W.setTab; if(typeof o!=='function') return;
    W.setTab=function(t){
      var r=o.apply(this,arguments);
      try{
        if(!E.guia){ var b=D.querySelector('.tabs button[data-tab="'+t+'"]'); if(b) olharElemento(b,900);
          if(W.__akPronto&&!SS.get('dex-dica-'+t)&&DICAS[t]){ SS.set('dex-dica-'+t,'1'); setTimeout(function(){ falarBalao(DICAS[t]); },1300); } }
      }catch(e){}
      return r;
    };
  })();

  (function(){
    function ola(){ setTimeout(function(){
      reagir('surpresa',450); pular();
      setTimeout(function(){ reagir('feliz',1700); },470);
      if(!SS.get('dex-ola')){ SS.set('dex-ola','1'); setTimeout(function(){ falarBalao((CFG.jeito==='formal'?'Olá! Eu sou o ':'Bip-bop! Eu sou o ')+esc(CFG.nome||'Dex')+'. Clique em mim quando precisar de ajuda.',6000); },700); }
    },700); }
    if(D.body.classList.contains('revealed')) ola();
    else new MutationObserver(function(m,ob){ if(D.body.classList.contains('revealed')){ ob.disconnect(); ola(); } }).observe(D.body,{attributes:true,attributeFilter:['class']});
  })();

  /* ================================================================== GUIA NA TELA */
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
    meses:['aniv','#months','Aqui você troca o <b>mês</b>.'],
    ano:['aniv','#yearSel','Aqui você troca o <b>ano</b>.'],
    auto:['arte','#btnAuto','<b>Aplicar automático</b>: refaz o enquadramento.'],
    chapeleiro:['arte','#btnChapeleiro','<b>Chapeleiro</b>: encaixa a cabeça embaixo do chapéu.'],
    modelos:['arte','#btnModelos','<b>Modelos de arte</b>: troque o fundo da arte.'],
    textos:['arte','#btnTextosArte','<b>Textos da arte</b>: título e frases.'],
    png:['arte','#btnPng','<b>Baixar PNG</b>: salva a arte aberta.'],
    anterior:['arte','#btnPrev','Volta para a arte <b>anterior</b>.'],
    proxima:['arte','#btnNext','Vai para a <b>próxima</b> arte.'],
    importar_pasta:['colab','#btnFolder','<b>Importar pasta</b>: uma subpasta por pessoa.'],
    fotos_soltas:['colab','#btnFiles','<b>Importar fotos soltas</b>: o nome do arquivo identifica a pessoa.'],
    zip_fotos:['colab','#btnImportarZipFotos','<b>Importar ZIP de fotos</b>.'],
    novo_colaborador:['colab','#btnNewPerson','<b>Novo colaborador</b>: cadastro manual.'],
    unificar:['colab','#btnMerge','<b>Unificar duplicados</b>: junta cadastros repetidos.'],
    padronizar:['colab','#btnPadronizar','<b>Padronizar nomes</b>.'],
    supabase:['colab','#btnEspaco','<b>Supabase</b>: veja o espaço usado.'],
    limpar:['colab','#btnWipe','<b>Limpar cadastro</b>: cuidado, remove todos os colaboradores.'],
    backup:['colab','#btnBackup','<b>Exportar</b>: cópia de segurança.'],
    restaurar:['colab','#btnRestore','<b>Restaurar</b>: devolve um backup.'],
    ordenar:['colab','#peopleSort','<b>Ordenar</b> a lista de colaboradores.'],
    buscar:['colab','#search','<b>Pesquisar</b> colaborador pelo nome.'],
    novos_modelo:['novos','#nvModelo','Escolha o <b>modelo</b> da arte de boas-vindas.'],
    novos_busca:['novos','#nvBusca','<b>Busque</b> o colaborador para usar a foto do cadastro.'],
    novos_baixar:['novos','#nvBaixar','<b>Baixar PNG</b> da arte de boas-vindas.'],
    novos_copiar:['novos','#nvCopiar','<b>Copiar imagem</b> para colar onde quiser.'],
    tema:[null,'#btnTheme','O botão de <b>tema</b>: claro, escuro ou automático.'],
    ajustes:[null,'#btnSettings','Em <b>Ajustes</b> você muda o site e me personaliza!']
  };
  var guiaFim=null, guiaTimer=0, guiaVez=0, emTour=false;
  function visivel(n){ if(!n) return false; var r=n.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(n).visibility!=='hidden'; }
  function homeRect(){ var t=raiz.style.transform, tr=raiz.style.transition; raiz.style.transition='none'; raiz.style.transform='none'; var r=raiz.getBoundingClientRect(); raiz.style.transform=t; void raiz.offsetWidth; raiz.style.transition=tr; return r; }
  async function mostrar(id,texto,ms){
    var a=ALVO[id]; if(!a) return false;
    if(guiaFim){ var pf=guiaFim; guiaFim=null; clearTimeout(guiaTimer); pf(false); }
    var vez=++guiaVez;
    if(a[0]&&typeof state!=='undefined'&&state.tab!==a[0]&&typeof W.setTab==='function'){ W.setTab(a[0]); await esperar(420); }
    var alvo=D.querySelector(a[1]); if(!visivel(alvo)) return false;
    var r0=alvo.getBoundingClientRect();
    if(r0.top<70||r0.bottom>innerHeight-40){ try{ alvo.scrollIntoView({block:'center',behavior:reduzido()?'auto':'smooth'}); }catch(e){} await esperar(520); }
    if(vez!==guiaVez) return false;
    H.classList.add('dex-guia'); balao.classList.remove('on'); E.dormindo=false;
    var r=alvo.getBoundingClientRect(), pad=8;
    /* holofote: começa largo e fecha no botão */
    if(!spot.classList.contains('on')){ spot.style.transition='none'; spot.style.width=(r.width+80)+'px'; spot.style.height=(r.height+80)+'px'; spot.style.transform='translate3d('+(r.left-40)+'px,'+(r.top-40)+'px,0)'; void spot.offsetWidth; spot.style.transition=''; }
    spot.style.borderRadius=(Math.min(22,parseFloat(getComputedStyle(alvo).borderRadius)||12)+pad)+'px';
    spot.style.width=(r.width+pad*2)+'px'; spot.style.height=(r.height+pad*2)+'px'; spot.style.transform='translate3d('+(r.left-pad)+'px,'+(r.top-pad)+'px,0)'; spot.classList.add('on');
    /* voo até o botão */
    var Wd=raiz.offsetWidth, Hd=Wd*214/160, casa=homeRect();
    var dir=r.right+Wd*.95+14<innerWidth, braco=dir?'e':'d';
    var left=dir?r.right+14+Wd*.078:r.left-14-Wd*.30-Wd*.778;
    var cy=r.top+r.height/2, top=Math.max(8,Math.min(innerHeight-Hd-8,cy-Hd*.6215));
    left=Math.max(8,Math.min(innerWidth-Wd-8,left));
    var dx=left-casa.left, dy=top-casa.top;
    corpo.style.setProperty('--lean',(dx<0?-12:12)+'deg');
    E.guia='voando'; render();
    raiz.style.transition='transform 1s var(--e-apple),opacity .4s ease';
    raiz.style.transform='translate3d('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px,0)';
    raiz.classList.toggle('balao-dir',!dir); raiz.classList.toggle('balao-esq',dir);
    await esperar(reduzido()?50:950);
    if(vez!==guiaVez) return false;
    /* aponta: do ombro até o ponto mais próximo do botão */
    var sx=left+Wd*(braco==='e'?35.5:124.5)/160, sy=top+Hd*133/214;
    var tx=Math.max(r.left,Math.min(r.right,sx)), ty=Math.max(r.top,Math.min(r.bottom,sy));
    if(tx===sx&&ty===sy){ tx=r.left+r.width/2; ty=r.top+r.height/2; }
    var ang=Math.atan2(ty-sy,tx-sx)*180/Math.PI-90;
    if(braco==='e'&&ang<-180) ang+=360; if(braco==='d'&&ang>180) ang-=360;
    corpo.setAttribute('data-braco',braco); corpo.style.setProperty('--ap',ang.toFixed(1)+'deg');
    E.guia='apontando'; render(); olharElemento(alvo,99999); truque('quica');
    falarBalao(texto||a[2],0,true);
    return new Promise(function(res){
      guiaFim=res; clearTimeout(guiaTimer);
      guiaTimer=setTimeout(function(){ if(vez===guiaVez) fimGuia(true); },ms||5200);
    });
  }
  function fimGuia(continua){
    clearTimeout(guiaTimer);
    var f=guiaFim; guiaFim=null;
    if(!continua||!emTour){
      guiaVez++; emTour=false;
      spot.classList.remove('on'); balao.classList.remove('on');
      raiz.style.transition='transform 1s var(--e-apple),opacity .4s ease'; raiz.style.transform='';
      raiz.classList.remove('balao-dir','balao-esq');
      E.guia='voando'; render(); olhandoAte=0;
      var v=guiaVez;
      setTimeout(function(){ if(v===guiaVez){ E.guia=null; render(); olharPara(0,0,0); H.classList.remove('dex-guia'); reagir('feliz',900); } },reduzido()?60:950);
    }
    if(f) f(!!continua);
  }
  W.addEventListener('keydown',function(e){ if(E.guia&&e.key==='Escape') fimGuia(); });
  W.addEventListener('wheel',function(){ if(E.guia) fimGuia(); },{passive:true});
  D.addEventListener('pointerdown',function(e){ if(E.guia&&!raiz.contains(e.target)) fimGuia(); },true);
  async function tour(){
    var passos=[['aba_inicio','Bem-vindo ao tour! Aqui é a <b>Início</b>: resumo do mês e atalhos.'],['aba_aniv','Em <b>Aniversariantes</b> fica a lista de cada mês.'],
      ['importar_lista','Comece por aqui: <b>Importar lista</b>, uma pessoa por linha.'],['gerar_mes','Depois, <b>Gerar artes do mês</b> cria tudo de uma vez.'],
      ['zip','E <b>Baixar todas (ZIP)</b> entrega as artes num arquivo só.'],['aba_colab','Em <b>Colaboradores</b> ficam os cadastros e as fotos.'],
      ['importar_pasta','<b>Importar pasta</b>: uma subpasta com o nome de cada pessoa.'],['aba_arte','No estúdio de <b>Arte</b> você ajusta cada arte.'],
      ['aba_novos','<b>Novos colaboradores</b>: as artes de boas-vindas.'],['ajustes','E em <b>Ajustes</b> você me personaliza. Fim do tour, bip-bop!']];
    emTour=true;
    for(var i=0;i<passos.length;i++){
      if(!emTour) break;
      await mostrar(passos[i][0],passos[i][1]+' <small style="opacity:.6">('+(i+1)+'/'+passos.length+')</small>',3800);
    }
    if(emTour){ emTour=false; fimGuia(); }
  }

  /* ================================================================== CHAT: ilha + consumo */
  var API='/api/dex', hist=[], modoIA='local', localAte=0, avisouLocal=false, INFO={}, ocupado=false;
  var USO=(function(){ var u={}; try{ u=JSON.parse(LS.get('dex-uso','{}'))||{}; }catch(e){} return u; })();
  function hojeK(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function usoDia(){ if(USO.dia!==hojeK()){ USO.dia=hojeK(); USO.perguntas=0; USO.entrada=0; USO.saida=0; USO.ms=0; USO.locais=0; USO.hist=[]; } return USO; }
  function salvarUso(){ LS.set('dex-uso',JSON.stringify(USO)); }
  usoDia();
  var ilha=null, topoIlha=null, contIlha=null, stTxt=null;
  (function montarIlha(){
    if(!chat) return;
    var head=chat.querySelector('.ai-chat-head'), brand=head&&head.querySelector('.ai-brand'); if(!head||!brand) return;
    ilha=el('div','dex-ilha'); ilha.setAttribute('data-modo','local');
    topoIlha=el('div','dex-ilha-topo'); topoIlha.setAttribute('role','button'); topoIlha.tabIndex=0; topoIlha.setAttribute('aria-expanded','false');
    topoIlha.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); topoIlha.click(); } }); topoIlha.title='Ver o meu estado e o consumo da IA';
    topoIlha.appendChild(brand);
    var tit=brand.querySelector('.ai-title'); stTxt=el('span','dex-st','<i class="dex-pt"></i><span class="dex-st-t">conectando…</span><span class="dex-onda"><i></i><i></i><i></i><i></i><i></i></span>'); if(tit) tit.appendChild(stTxt);
    topoIlha.insertAdjacentHTML('beforeend','<span class="dex-gauge" aria-hidden="true"><svg viewBox="0 0 30 30"><circle class="fundo" cx="15" cy="15" r="12.4"/><circle class="arco" cx="15" cy="15" r="12.4" stroke-dasharray="77.9" stroke-dashoffset="77.9"/></svg><span>IA</span></span>');
    var mais=el('div','dex-ilha-mais'), inn=el('div','dex-ilha-in'); contIlha=el('div','dex-ilha-cont'); inn.appendChild(contIlha); mais.appendChild(inn);
    ilha.appendChild(topoIlha); ilha.appendChild(mais);
    head.insertBefore(ilha,head.firstChild);
    var aj=el('button','dex-hd-btn','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>');
    aj.type='button'; aj.title='Personalizar o Dex (Ajustes)'; aj.setAttribute('aria-label','Personalizar o Dex nos Ajustes'); aj.onclick=function(){ abrirAjustes('aparencia'); };
    var x=D.getElementById('aiClose'); head.insertBefore(aj,x);
    topoIlha.onclick=function(){ var ab=!ilha.classList.contains('aberta'); if(ab) renderStatus(); ilha.classList.toggle('aberta',ab); topoIlha.setAttribute('aria-expanded',String(ab)); if(ab) reagir('feliz',900); };
  })();
  function textoModo(){ return modoIA==='ia'?'online · com IA':modoIA==='limite'?'limite da IA · modo local':'modo local · respostas básicas'; }
  function ilhaPensa(){ if(!ilha) return; var p=chat.classList.contains('ak-pensando')||ocupado; ilha.classList.toggle('pensa',p); var t=stTxt&&stTxt.querySelector('.dex-st-t'); if(t) t.textContent=p?'pensando':textoModo(); }
  function pctCota(){ var l=USO.ultimo&&USO.ultimo.limites; if(l&&l.req_limite_dia&&l.req_restantes_dia!=null) return Math.max(0,Math.min(1,l.req_restantes_dia/l.req_limite_dia)); return null; }
  function atualizarGauge(){
    if(!ilha) return; var p=pctCota(), arco=ilha.querySelector('.dex-gauge .arco'), sp=ilha.querySelector('.dex-gauge span');
    if(arco){ arco.style.strokeDashoffset=(77.9*(1-(p==null?0:p))).toFixed(1); arco.style.stroke=p!=null&&p<.15?'#ffb35c':'#fff'; }
    if(sp) sp.textContent=p==null?'IA':Math.round(p*100)+'%';
    ilha.setAttribute('data-modo',modoIA||'local');
    var t=stTxt&&stTxt.querySelector('.dex-st-t'); if(t&&!ilha.classList.contains('pensa')) t.textContent=textoModo();
  }
  function seg1(ms){ return (ms/1000).toFixed(1).replace('.',',')+' s'; }
  function renderStatus(){
    if(!contIlha) return; usoDia();
    var u=USO.ultimo||{}, l=u.limites||{}, p=pctCota(), tpm=l.tok_limite_min&&l.tok_restantes_min!=null?l.tok_restantes_min/l.tok_limite_min:null;
    var hs=(USO.hist||[]).slice(-18), mx=Math.max.apply(null,hs.concat([1]));
    var media=USO.perguntas?Math.round(USO.ms/USO.perguntas):null;
    contIlha.innerHTML='<div class="dex-tiles">'+
      '<div class="dex-tile"><small>Estado</small><b>'+(modoIA==='ia'?'Online':modoIA==='limite'?'No limite':'Modo local')+'</b><em>'+(modoIA==='ia'?'respostas com IA':'respostas do próprio site')+'</em></div>'+
      '<div class="dex-tile"><small>Cérebro</small><b>'+esc(String(u.modelo||(INFO.modelos&&INFO.modelos[0])||'—').replace(/^.*\//,''))+'</b><em>'+esc(u.provedor||INFO.provedor||'sem IA conectada')+'</em></div>'+
      '<div class="dex-tile"><small>Hoje, neste navegador</small><b>'+fmt(USO.perguntas)+' perguntas</b><em>'+fmt((USO.entrada||0)+(USO.saida||0))+' tokens · '+fmt(USO.locais)+' sem IA</em></div>'+
      '<div class="dex-tile"><small>Velocidade</small><b>'+(u.ms?seg1(u.ms):'—')+'</b><em>'+(media?'média '+seg1(media):'última resposta')+'</em></div>'+
      '<div class="dex-tile larga"><small>Cota diária da IA (toda a equipe)</small><b>'+(p==null?'—':fmt(l.req_restantes_dia)+' de '+fmt(l.req_limite_dia)+' perguntas livres')+'</b>'+
        '<div class="dex-barra'+(p!=null&&p<.15?' baixa':'')+'"><i style="--v:'+(p==null?0:p.toFixed(3))+'"></i></div><em>'+(l.reset_req?'renova em '+esc(l.reset_req):p==null?'faça uma pergunta para eu medir':'')+'</em></div>'+
      '<div class="dex-tile larga"><small>Fôlego por minuto</small><b>'+(tpm==null?'—':fmt(l.tok_restantes_min)+' de '+fmt(l.tok_limite_min)+' tokens')+'</b>'+
        '<div class="dex-barra'+(tpm!=null&&tpm<.2?' baixa':'')+'"><i style="--v:'+(tpm==null?0:tpm.toFixed(3))+'"></i></div>'+
        (hs.length?'<div class="dex-spark" title="tokens por pergunta">'+hs.map(function(v,i){ return '<i style="--h:'+Math.max(.08,v/mx).toFixed(3)+';--i:'+i+'"></i>'; }).join('')+'</div><em>tokens por pergunta (últimas '+hs.length+')</em>':'')+'</div>'+
      '</div><div class="dex-ilha-acoes"><button type="button" data-a="testar">Testar conexão</button><button type="button" data-a="zerar">Zerar contagem</button></div>';
    contIlha.querySelector('[data-a="testar"]').onclick=function(e){ e.stopPropagation(); var b=this; b.textContent='Testando…'; checar().then(function(){ renderStatus(); reagir(modoIA==='ia'?'comemorando':'triste',1400); }); };
    contIlha.querySelector('[data-a="zerar"]').onclick=function(e){ e.stopPropagation(); USO.dia=''; usoDia(); salvarUso(); renderStatus(); reagir('surpresa',700); };
  }
  function cartaoStatus(){
    usoDia(); var b=el('div','ai-msg bot dex-ia'); var u=USO.ultimo||{}, l=u.limites||{}, p=pctCota();
    var txt=CFG.jeito==='formal'?'Este é o meu estado agora:':'Raio-X do meu cérebro de robô:';
    b.innerHTML='<div class="dex-txt">'+esc(txt)+'\n• Estado: '+esc(textoModo())+'\n• Hoje: '+fmt(USO.perguntas)+' perguntas, '+fmt((USO.entrada||0)+(USO.saida||0))+' tokens ('+fmt(USO.locais)+' respondidas sem IA)'+
      (p!=null?'\n• Cota da equipe: '+fmt(l.req_restantes_dia)+' de '+fmt(l.req_limite_dia)+' perguntas livres':'')+(u.ms?'\n• Última resposta em '+seg1(u.ms):'')+'</div>';
    msgs.appendChild(b); rolar();
    var g=el('div','ak-btns'), x=el('button','ak-btn pri','Abrir o painel completo'); x.type='button'; x.onclick=function(){ if(ilha&&!ilha.classList.contains('aberta')) topoIlha.click(); }; g.appendChild(x); b.appendChild(g);
    reagir('feliz',1400);
  }

  /* ================================================================== AJUSTES → DEX */
  var secAj=null, prevSvg=null, abaAj='aparencia';
  var FANT={cab:[['nenhum','Nenhum'],['antena','Antena'],['festa','Festa'],['natal','Papai Noel'],['coelho','Coelho'],['formatura','Formatura'],['chef','Chef'],['coroa','Coroa'],['fones','Fones']],
    rosto:[['nenhum','Nenhum'],['oculos','Óculos'],['escuros','Óculos escuros'],['bigode','Bigode']],
    corpo:[['nenhum','Nenhuma'],['gravata','Gravata'],['cachecol','Cachecol'],['noel','Roupa de Noel']]};
  var TEMAS=[['Clássico',{cab:'nenhum',rosto:'nenhum',corpo:'nenhum'}],['Natal',{cab:'natal',rosto:'nenhum',corpo:'noel'}],['Páscoa',{cab:'coelho',rosto:'nenhum',corpo:'gravata'}],
    ['Formatura',{cab:'formatura',rosto:'nenhum',corpo:'gravata'}],['Festa',{cab:'festa',rosto:'oculos',corpo:'nenhum'}],['Chef',{cab:'chef',rosto:'bigode',corpo:'cachecol'}],
    ['DJ',{cab:'fones',rosto:'escuros',corpo:'nenhum'}],['Realeza',{cab:'coroa',rosto:'bigode',corpo:'cachecol'}]];
  function thumb(tipo,v){
    var inteiro=tipo==='corpo'||tipo==='tema', s=inteiro?svgCompleto('dex-fixo dex-inteiro'):svgCabeca('dex-fixo');
    var a={cab:'nenhum',rosto:'nenhum',corpo:'nenhum'}; if(tipo==='tema') a=v; else a[tipo]=v;
    s=s.replace('data-humor="neutro"','data-humor="neutro" data-cab="'+a.cab+'" data-rosto="'+a.rosto+'" data-corpo="'+a.corpo+'"');
    if(!inteiro) s=s.replace('viewBox="10 -2 140 96"','viewBox="'+(ALTOS[a.cab]?'2 -42 156 136':'10 -2 140 96')+'"');
    return s;
  }
  function seg(k,ops,cor){ return '<div class="dex-seg" data-k="'+k+'">'+ops.map(function(o){ return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(CFG[k]===o[0])+'">'+(cor?'<i class="dex-cor" style="background:'+OLHOS[o[0]]+'"></i>':'')+esc(o[1])+'</button>'; }).join('')+'</div>'; }
  function campo(t,html){ return '<div class="dex-campo"><span>'+t+'</span>'+html+'</div>'; }
  function grade(tipo){ return '<div class="dex-grade" data-g="'+tipo+'">'+FANT[tipo].map(function(o){ return '<button type="button" class="dex-card" data-v="'+o[0]+'" aria-pressed="'+(CFG[tipo]===o[0])+'">'+thumb(tipo,o[0])+'<span>'+esc(o[1])+'</span></button>'; }).join('')+'</div>'; }
  function montarAjustes(){
    var cx=D.querySelector('#settingsDlg .ak-ajustes'); if(!cx) return;
    secAj=el('section','ak-sec dex-sec'); secAj.id='dexAjustes';
    secAj.innerHTML='<h4>Dex, o assistente</h4>'+
      '<div class="dex-palco"><div class="dex-prev-box">'+svgCompleto('dex-prev')+'</div><div><h5>'+esc(CFG.nome)+'</h5><p>Tudo o que você muda aqui vale na hora e fica salvo neste navegador.</p>'+
        '<div class="dex-acoes"><button type="button" class="btn sm" data-x="surpresa">Surpreenda-me</button><button type="button" class="btn sm" data-x="tour">Fazer um tour</button></div></div></div>'+
      '<div class="dex-abas" role="tablist"><i class="dex-polegar" aria-hidden="true"></i>'+
        [['aparencia','Aparência'],['fantasias','Fantasias'],['conversa','Conversa'],['jeito','Comportamento']].map(function(a,i){ return '<button type="button" role="tab" data-aba="'+a[0]+'" data-n="'+i+'" aria-selected="'+(i===0)+'">'+a[1]+'</button>'; }).join('')+'</div>'+
      '<div class="dex-paineis">'+
        '<div class="dex-painel on" data-p="aparencia">'+
          campo('Nome','<input type="text" class="dex-nome" maxlength="16" value="'+esc(CFG.nome)+'">')+
          campo('Tamanho',seg('tam',[['p','Pequeno'],['m','Médio'],['g','Grande']]))+
          campo('Cor dos olhos',seg('olhos',[['branco','Branco'],['ciano','Ciano'],['prata','Prata'],['ambar','Âmbar']],true))+
          campo('Acabamento',seg('acab',[['claro','Claro'],['grafite','Grafite']]))+
        '</div>'+
        '<div class="dex-painel" data-p="fantasias">'+
          campo('Temas prontos','<div class="dex-grade" data-g="tema">'+TEMAS.map(function(t,i){ return '<button type="button" class="dex-card" data-t="'+i+'">'+thumb('tema',t[1])+'<span>'+t[0]+'</span></button>'; }).join('')+'</div>')+
          campo('Cabeça',grade('cab'))+campo('Rosto',grade('rosto'))+campo('Roupa',grade('corpo'))+
          campo('Fantasia da época',seg('epoca',[['sim','Automática'],['nao','Desligada']]))+
          '<p class="dex-dica">Com a fantasia da época ligada e nenhuma fantasia escolhida, eu me visto de Papai Noel em dezembro e de coelho na Páscoa.</p>'+
        '</div>'+
        '<div class="dex-painel" data-p="conversa">'+
          campo('Jeito de conversar',seg('jeito',[['divertido','Divertido'],['equilibrado','Equilibrado'],['formal','Formal']]))+
          '<p class="dex-dica">Divertido: brincalhão e animado. Equilibrado: simpático e direto. Formal: profissional, sem brincadeiras.</p>'+
          campo('Idioma das respostas',seg('idioma',[['pt','Português'],['en','English'],['es','Español']]))+
          '<p class="dex-dica">O jeito e o idioma valem para as respostas com IA. As respostas do modo local continuam em português.</p>'+
        '</div>'+
        '<div class="dex-painel" data-p="jeito">'+
          campo('Animações',seg('anim',[['sutil','Sutis'],['normal','Normais'],['expressiva','Expressivas']]))+
          campo('Truques quando estou parado',seg('truques',[['sim','Sim'],['nao','Não']]))+
          campo('Seguir o mouse com o olhar',seg('seguir',[['sim','Sim'],['nao','Não']]))+
          campo('Dicas em balão',seg('balao',[['sim','Sim'],['nao','Não']]))+
          campo('Lado da tela',seg('lado',[['direita','Direita'],['esquerda','Esquerda']]))+
          campo('Mostrar o Dex na tela','<div class="dex-seg" data-k="__orb"><button type="button" data-v="sim">Mostrar</button><button type="button" data-v="nao">Ocultar</button></div>')+
        '</div>'+
      '</div>'+
      '<div class="dex-rod"><button type="button" class="btn ghost sm" data-x="padrao">Restaurar o Dex padrão</button></div>';
    cx.insertBefore(secAj,cx.firstChild);
    prevSvg=secAj.querySelector('.dex-prev');
    secAj.querySelectorAll('.dex-abas button').forEach(function(b){ b.onclick=function(){ trocarAba(b.dataset.aba); }; });
    var nm=secAj.querySelector('.dex-nome'); nm.oninput=function(){ CFG.nome=nm.value.trim().slice(0,16)||'Dex'; salvar(); aplicarNome(); };
    secAj.querySelectorAll('.dex-seg').forEach(function(g){ g.querySelectorAll('button').forEach(function(b){ b.onclick=function(){
      var k=g.dataset.k, v=b.dataset.v;
      if(k==='__orb'){ if(v==='nao'){ LS.set('ak-orb','nao'); H.setAttribute('data-ak-orb','nao'); } else { LS.del('ak-orb'); H.removeAttribute('data-ak-orb'); } }
      else { CFG[k]=v; salvar(); aplicarCfg(); }
      marcarAjustes(); reagir(k==='jeito'&&v==='divertido'?'comemorando':k==='jeito'&&v==='formal'?'surpresa':'feliz',1100); pular();
    }; }); });
    secAj.querySelectorAll('.dex-grade[data-g]').forEach(function(g){ g.querySelectorAll('.dex-card').forEach(function(b){ b.onclick=function(){
      var t=g.dataset.g;
      if(t==='tema'){ var tm=TEMAS[+b.dataset.t][1]; CFG.cab=tm.cab; CFG.rosto=tm.rosto; CFG.corpo=tm.corpo; }
      else CFG[t]=b.dataset.v;
      salvar(); aplicarCfg(); marcarAjustes(); reagir(b.dataset.v==='natal'||b.dataset.t==='1'?'comemorando':'amor',1300); pular();
    }; }); });
    secAj.querySelector('[data-x="padrao"]').onclick=function(){ for(var k in PADRAO) CFG[k]=PADRAO[k]; salvar(); aplicarCfg(); nm.value=CFG.nome; marcarAjustes(); reagir('feliz',1000); pular(); };
    secAj.querySelector('[data-x="surpresa"]').onclick=function(){
      function sorteia(l){ return l[Math.floor(Math.random()*l.length)][0]; }
      CFG.cab=sorteia(FANT.cab.slice(1)); CFG.rosto=Math.random()<.5?'nenhum':sorteia(FANT.rosto.slice(1)); CFG.corpo=Math.random()<.4?'nenhum':sorteia(FANT.corpo.slice(1));
      CFG.olhos=sorteia([['branco'],['ciano'],['prata'],['ambar']]); salvar(); aplicarCfg(); marcarAjustes(); reagir('comemorando',1500);
    };
    secAj.querySelector('[data-x="tour"]').onclick=function(){ try{ D.getElementById('settingsDlg').close(); }catch(e){} setTimeout(tour,250); };
    prevSvg.addEventListener('click',function(){ truque('pirueta',[prevSvg]); reagir('feliz',1200); });
    /* o antigo item "Botão do assistente" agora fica aqui ("Mostrar o Dex") */
    D.querySelectorAll('#settingsDlg .ak-sec').forEach(function(s){ var h=s.querySelector('h4'); if(s!==secAj&&h&&/Assistente/.test(h.textContent)){ h.textContent='Chat do Dex';
      s.querySelectorAll('.fgrp').forEach(function(f){ var l=f.querySelector('.fl'); if(l&&/Botão do assistente/.test(l.textContent)) f.style.display='none'; }); } });
    marcarAjustes();
  }
  function marcarAjustes(){
    if(!secAj) return;
    secAj.querySelectorAll('.dex-seg').forEach(function(g){ var k=g.dataset.k, v=k==='__orb'?(H.getAttribute('data-ak-orb')==='nao'?'nao':'sim'):CFG[k];
      g.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.v===v)); }); });
    secAj.querySelectorAll('.dex-grade[data-g]').forEach(function(g){ var t=g.dataset.g;
      g.querySelectorAll('.dex-card').forEach(function(b){ if(t==='tema'){ var tm=TEMAS[+b.dataset.t][1]; b.setAttribute('aria-pressed',String(tm.cab===CFG.cab&&tm.rosto===CFG.rosto&&tm.corpo===CFG.corpo)); } else b.setAttribute('aria-pressed',String(CFG[t]===b.dataset.v)); }); });
  }
  function trocarAba(a){
    if(!secAj) return; var bs=secAj.querySelectorAll('.dex-abas button'), ant=abaAj, n=0, na=0; abaAj=a;
    bs.forEach(function(b){ var s=b.dataset.aba===a; b.setAttribute('aria-selected',String(s)); if(s) n=+b.dataset.n; if(b.dataset.aba===ant) na=+b.dataset.n; });
    secAj.querySelector('.dex-polegar').style.setProperty('--n',n);
    secAj.querySelectorAll('.dex-painel').forEach(function(p){ var on=p.dataset.p===a; p.classList.toggle('on',on); if(on) p.style.setProperty('--dir',n>=na?1:-1); });
  }
  function abrirAjustes(aba){
    var b=D.getElementById('btnSettings'), d=D.getElementById('settingsDlg');
    if(d&&!d.open){ if(b) b.click(); else try{ d.showModal(); }catch(e){} }
    setTimeout(function(){ if(aba) trocarAba(aba); if(secAj) try{ secAj.scrollIntoView({block:'start',behavior:reduzido()?'auto':'smooth'}); }catch(e){} },90);
  }
  W.__dexEditor=abrirAjustes;
  montarAjustes();
  (function(){ var d=D.getElementById('settingsDlg'); if(!d) return; new MutationObserver(function(){ if(d.open){ marcarAjustes(); setTimeout(function(){ reagir('feliz',1000); truque('quica',[prevSvg]); },300); } }).observe(d,{attributes:true,attributeFilter:['open']}); })();

  /* ================================================================== IA */
  function marcarModo(m){ modoIA=m; if(chat) chat.setAttribute('data-dex',m==='ia'?'ia':'local'); atualizarGauge(); }
  function checar(){
    if(!/^https?:$/.test(location.protocol)){ localAte=Infinity; marcarModo('local'); return Promise.resolve(); }
    return fetch(API,{method:'GET',cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(function(j){ INFO=j||{}; if(j&&j.ia){ localAte=0; marcarModo('ia'); } else { localAte=Infinity; marcarModo('local'); } })
      .catch(function(){ localAte=Infinity; marcarModo('local'); });
  }
  checar();

  function num(f){ try{ return f(); }catch(e){ return null; } }
  function contexto(){
    var c={};
    try{
      c.aba=({inicio:'Início',aniv:'Aniversariantes',arte:'Arte',colab:'Colaboradores',novos:'Novos colaboradores'})[state.tab]||state.tab;
      c.mes_aberto=MESNOME[state.month-1]+' de '+state.year;
      c.hoje=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      c.colaboradores=(state.people||[]).length;
      c.fotos=num(function(){ return MEM.photos.size; });
      var rec=state.months[mk(state.year,state.month)], es=rec?rec.entries:[], ok=0,rev=0,sem=0,ger=0;
      es.forEach(function(e){ var s=num(function(){ return catalogStatus(e); }); if(s==='ready') ok++; else if(s==='review') rev++; else sem++; if(e.status==='ready') ger++; });
      c.lista_do_mes={aniversariantes:es.length,foto_ok:ok,para_conferir:rev,sem_foto:sem,artes_geradas:ger};
      c.fotos_a_confirmar=num(function(){ return Array.from(MEM.photos.values()).filter(function(f){ return f.personId===PENDING; }).length; });
      c.arte_aberta=num(function(){ return typeof curEntry!=='undefined'&&!!curEntry; });
      c.tema=H.getAttribute('data-theme')||'automático';
      c.fantasia_do_dex=visual();
    }catch(e){}
    return c;
  }

  function rolar(){ try{ msgs.scrollTo({top:msgs.scrollHeight,behavior:reduzido()?'auto':'smooth'}); }catch(e){ msgs.scrollTop=msgs.scrollHeight; } }
  function formatar(t){
    var linhas=esc(t).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g,'$1<i>$2</i>').replace(/`([^`]+)`/g,'<b>$1</b>').replace(/^#+\s*/gm,'').replace(/^\s*[-•]\s+/gm,'• ');
    if(reduzido()) return linhas;
    var i=0; return linhas.replace(/(<[^>]+>)|([^\s<]+)/g,function(m,tag,pal){ return tag?tag:'<span class="dex-palavra" style="--i:'+(i++)+'">'+pal+'</span>'; });
  }

  /* conta as perguntas que o site respondeu sem gastar IA */
  var passar=false, comando=false, viuDex=false;
  W.addEventListener('submit',function(ev){
    if(ev.target!==form||comando||passar||!(input.value||'').trim()) return;
    viuDex=false;
    setTimeout(function(){ if(!viuDex){ usoDia(); USO.locais=(USO.locais||0)+1; salvarUso(); } },0);
  },true);

  function rodarComando(texto){
    if(!form||!input) return;
    comando=true; var antes=input.value; input.value=texto;
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
        case 'resumo': rodarComando('resumo do mês'); break;
        case 'pendencias': rodarComando('pendências'); break;
        case 'hoje': rodarComando('hoje'); break;
        case 'semana': rodarComando('próximos 7 dias'); break;
        case 'mes30': rodarComando('próximos 30 dias'); break;
        case 'espaco': rodarComando('espaço'); break;
        case 'confirmar': rodarComando('fotos a confirmar'); break;
        case 'sem_foto': rodarAcao('semFoto'); break;
        case 'buscar': if(arg) rodarComando('buscar '+arg); break;
        case 'arte': if(arg) rodarComando('abrir arte da '+arg); break;
        case 'ir_mes': if(arg) rodarComando('ir para '+arg); break;
        case 'gerar_mes': rodarComando('gerar o mês de '+(arg||num(function(){ return MESNOME[state.month-1]; })||'')); break;
        case 'gerar_arte': if(arg) botoes.push({t:'Gerar a arte de '+arg,fn:function(){ rodarComando('gerar arte da '+arg); }}); break;
        case 'editar_dex': botoes.push({t:'Personalizar o '+(CFG.nome||'Dex'),fn:function(){ abrirAjustes('fantasias'); }}); break;
        default: if(BOTOES[a.id]){ var B=BOTOES[a.id]; if(!apontar) apontar=B[2];
          botoes.push({t:B[0],fn:function(){ var r=rodarAcao(B[1]); if(r&&r.then) r.catch(function(){}); }}); }
      }
    });
    if(caixa&&(botoes.length||(apontar&&ALVO[apontar]))){
      var g=el('div','ak-btns');
      botoes.forEach(function(b,i){ var x=el('button','ak-btn'+(i===0?' pri':''),esc(b.t)); x.type='button'; x.onclick=function(){ x.disabled=true; b.fn(); setTimeout(function(){ x.disabled=false; },1500); }; g.appendChild(x); });
      if(apontar&&ALVO[apontar]){ var m=el('button','ak-btn'+(botoes.length?'':' pri'),'Mostrar de novo'); m.type='button'; var id=apontar; m.onclick=function(){ mostrar(id); }; g.appendChild(m); }
      caixa.appendChild(g); rolar();
    }
    if(fazerTour) setTimeout(tour,900);
    else if(apontar&&ALVO[apontar]) setTimeout(function(){ mostrar(apontar); },1100);
  }

  function paraLocal(texto,motivo){
    if(motivo==='limite'||motivo==='rede') localAte=Date.now()+120000;
    if(!avisouLocal){ avisouLocal=true; var a=el('div','ai-msg bot dex-aviso');
      a.textContent=motivo==='limite'?'Ufa, a IA chegou no limite de uso por agora. Enquanto isso, respondo com o que já sei do site.':'Estou sem conexão com a IA agora. Enquanto isso, respondo com o que já sei do site.';
      msgs.appendChild(a); rolar(); }
    marcarModo(motivo==='limite'?'limite':'local');
    passar=true; input.value=texto;
    try{ form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); }finally{ passar=false; }
  }

  function crescer(txt,html){
    var h0=txt.offsetHeight; txt.style.height=h0+'px'; txt.innerHTML=html;
    var h1=txt.scrollHeight; if(reduzido()||!h0){ txt.style.height=''; return; }
    requestAnimationFrame(function(){ txt.style.height=h1+'px'; });
    var f=function(){ txt.style.height=''; txt.removeEventListener('transitionend',f); }; txt.addEventListener('transitionend',f); setTimeout(f,700);
  }

  async function perguntarIA(texto){
    ocupado=true; ilhaPensa(); E.pensando=true; render();
    var u=el('div','ai-msg user'); u.textContent=texto; msgs.appendChild(u);
    var b=el('div','ai-msg bot dex-ia dex-carregando'), txt=el('div','dex-txt','<span class="dex-pontos"><i></i><i></i><i></i></span>'); b.appendChild(txt); msgs.appendChild(b); rolar();
    hist.push({role:'user',content:texto}); if(hist.length>12) hist=hist.slice(-12);
    var ctl=new AbortController(), t=setTimeout(function(){ ctl.abort(); },26000), r=null, j=null;
    try{ r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensagens:hist,contexto:contexto(),nome:CFG.nome,jeito:CFG.jeito,idioma:CFG.idioma}),signal:ctl.signal}); j=await r.json().catch(function(){ return null; }); }
    catch(e){ r=null; }
    clearTimeout(t); ocupado=false; E.pensando=!!(chat&&chat.classList.contains('ak-pensando')); ilhaPensa();
    if(j&&j.limites&&j.limites.req_limite_dia!=null){ usoDia(); USO.ultimo=Object.assign({},USO.ultimo,{limites:j.limites}); salvarUso(); }
    if(!r||!r.ok||!j||!j.texto){
      hist.pop(); u.remove(); b.remove(); reagir('triste',1400);
      var motivo=!r?'rede':((j&&j.erro)==='limite'||r.status===429)?'limite':(j&&j.erro)==='sem_chave'?'sem_chave':'rede';
      if(motivo==='sem_chave') localAte=Infinity;
      paraLocal(texto,motivo); return;
    }
    /* consumo */
    usoDia(); USO.perguntas=(USO.perguntas||0)+1; var uso=j.uso||{};
    USO.entrada=(USO.entrada||0)+(uso.entrada||0); USO.saida=(USO.saida||0)+(uso.saida||0); USO.ms=(USO.ms||0)+(j.ms||0);
    USO.hist=(USO.hist||[]).concat([uso.total||0]).slice(-30);
    USO.ultimo={modelo:j.modelo,provedor:j.provedor,ms:j.ms,limites:j.limites||{},quando:Date.now()}; salvarUso();
    marcarModo('ia'); if(ilha&&ilha.classList.contains('aberta')) renderStatus();
    b.classList.remove('dex-carregando');
    if(j.humor) reagir(j.humor,1500);
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
    viuDex=true; ev.preventDefault(); ev.stopImmediatePropagation();
    input.value=''; form.classList.remove('tem-texto');
    if(ocupado) return;
    perguntarIA(t);
  },true);

  if(chat) chat.querySelectorAll('[data-prompt]').forEach(function(b){ if(/AniverCut/i.test(b.dataset.prompt)) b.dataset.prompt=b.dataset.prompt.replace(/AniverCut/gi,'AkiCut'); });

  /* ------------------------------------------------------------------ início */
  trocarAvatares(); setTimeout(trocarAvatares,400);
  aplicarCfg(); render(); atualizarGauge();
  W.__dex={reagir:reagir,pular:pular,truque:truque,mostrar:mostrar,tour:tour,fimGuia:fimGuia,abrirAjustes:abrirAjustes,falar:falarBalao,cfg:CFG,contexto:contexto,uso:function(){ return USO; },
    estado:function(){ return {humor:humorAtual,modo:modoIA,guia:E.guia}; }};
})();
