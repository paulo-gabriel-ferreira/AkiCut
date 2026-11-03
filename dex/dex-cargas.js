/* =============================================================================
   DEX · dex-cargas.js — telas de carregamento pequenas, com o Dex trabalhando
   1. Cenas      — ZIP: o Dex coloca papéis num envelope amarelo
                   Artes: o Dex, de bigode e boina, pinta um quadro
   2. Cartão     — a caixinha embaixo da tela, com mensagem, barra e porcentagem
   3. Ligação    — substitui o carregamento antigo só nesses dois casos
   A porcentagem é a do próprio app (em tempo real). Durante a compactação do ZIP,
   ela vem direto do JSZip. Só usa transform e opacity: leve em qualquer computador.
   ============================================================================= */
(function(){
  'use strict';
  var D=document, W=window, M=W.Mola||{anima:function(){ return null; },parado:function(){ return true; }};
  if(!W.__dex||!W.__dex.desenho) return;
  var desenho=W.__dex.desenho;

  /* =================================================================== 1. CENAS */
  /* o Dex fica por cima da cena, em HTML (posição em % da cena, que tem 300 x 112) */
  function dexNaCena(humor,x,y,w,extra){
    var s=desenho.inteiro('dex-carga-svg').replace('data-humor="neutro"','data-humor="'+humor+'"'+(extra||''));
    return '<div class="dx-cena-dex" style="left:'+(x/3)+'%;top:'+(y/1.12)+'%;width:'+(w/3)+'%">'+s+'</div>';
  }
  function cenaZip(){
    var papel=function(atraso){ return '<g class="dx-papel" style="animation-delay:'+atraso+'s"><rect width="18" height="23" rx="2"/><path d="M4 7H14M4 11H14M4 15H11"/></g>'; };
    return '<div class="dx-cena-box">'+dexNaCena('jogando',44,-8,92)+'<svg class="dx-cena" viewBox="0 0 300 112" aria-hidden="true">'+
      '<g class="dx-env">'+
        '<path class="dx-env-aba" d="M168 52L206 80L244 52Z"/>'+
        '<rect class="dx-env-corpo" x="168" y="52" width="76" height="44" rx="4"/>'+
        '<g class="dx-env-pilha"><rect x="176" y="40" width="60" height="52" rx="2" fill="#fff" stroke="#c9ced6" stroke-width="1.2"/><path d="M184 48H226M184 54H226M184 60H218" stroke="#dfe2e7" stroke-width="1.6" stroke-linecap="round"/></g>'+
        '<g>'+papel(0)+papel(.5)+papel(1)+'</g>'+
        '<path class="dx-env-frente" d="M168 56L206 80L244 56V92Q244 96 240 96H172Q168 96 168 92Z"/>'+
        '<path d="M168 92L196 72M244 92L216 72" stroke="#B98A13" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>'+
        '<g class="dx-env-ok"><circle cx="244" cy="50" r="12" fill="#3fc98a" stroke="#fff" stroke-width="2.5"/><path d="M238.5 50.5l3.8 3.8 7-7.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      '</g></svg></div>';
  }
  var TRACOS=[['#1BBACC','M184 30C200 22 214 34 230 26C242 20 252 26 258 22'],['#E7B96A','M236 34a8 8 0 1 0 0.1 0'],
    ['#40AF73','M182 64C196 46 210 50 222 58C232 64 244 52 258 56'],['#0E69BE','M184 70C204 62 230 72 256 66'],['#7818FA','M232 70l6 -4 4 4 6 -5']];
  function cenaArte(){
    return '<div class="dx-cena-box">'+'<svg class="dx-cena" viewBox="0 0 300 112" aria-hidden="true">'+
      '<defs><clipPath id="dxTela"><rect x="178" y="14" width="84" height="62" rx="3"/></clipPath></defs>'+
      '<g class="dx-quadro">'+
        '<path d="M220 76L196 108M220 76L246 108M220 8V108" stroke="#8B6B4A" stroke-width="4" stroke-linecap="round"/>'+
        '<rect x="174" y="10" width="92" height="70" rx="5" fill="#fff" stroke="#c9ced6" stroke-width="2.5"/>'+
        '<g clip-path="url(#dxTela)">'+TRACOS.map(function(t,i){ return '<path class="dx-traco" data-i="'+i+'" stroke="'+t[0]+'" d="'+t[1]+'"/>'; }).join('')+'</g>'+
        '<rect x="168" y="80" width="104" height="6" rx="3" fill="#8B6B4A"/>'+
        '<g class="dx-env-ok"><circle cx="262" cy="14" r="12" fill="#3fc98a" stroke="#fff" stroke-width="2.5"/><path d="M256.5 14.5l3.8 3.8 7-7.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      '</g>'+
    '</svg>'+dexNaCena('pintando',60,-10,92,' data-rosto="bigode"')+'</div>';
  }
  /* boina e pincel só do pintor (não mexem nas fantasias do Dex) */
  function vestirPintor(svg){
    var cab=svg.querySelector('.dex-cabeca'), braco=svg.querySelector('.dex-braco-d .dex-osc'), NS='http://www.w3.org/2000/svg';
    var boina=D.createElementNS(NS,'g'); boina.setAttribute('transform','rotate(-12 80 16)');
    boina.innerHTML='<path d="M36 18Q80 -16 124 18Q80 28 36 18Z" fill="#1B1D22" stroke="#121418" stroke-width="2.5" stroke-linejoin="round"/><rect x="76" y="-6" width="7" height="9" rx="3.5" fill="#1B1D22"/>';
    if(cab) cab.appendChild(boina);
    var pincel=D.createElementNS(NS,'g');
    pincel.innerHTML='<rect x="121" y="130" width="7" height="34" rx="3" fill="#8B6B4A" stroke="#5f4630" stroke-width="1.5"/><rect x="120" y="160" width="9" height="7" rx="1.5" fill="#C9CED6"/><path class="dx-tinta" d="M120.5 167Q124.5 186 128.5 167Z" fill="#1BBACC"/>';
    if(braco) braco.appendChild(pincel);
  }

  /* =================================================================== 2. CARTÃO */
  var veu=null, card=null, tipo=null, alvo=0, mostrado=0, raf=0, tAbrir=0, aberto=false, fechando=false, comprimindo=false, tracos=[];
  function montar(t){
    if(card) card.remove(); if(veu) veu.remove();
    veu=D.createElement('div'); veu.className='dx-carga-veu';
    card=D.createElement('div'); card.className='dx-carga'; card.setAttribute('role','status'); card.setAttribute('aria-live','polite');
    card.innerHTML=(t==='zip'?cenaZip():cenaArte())+'<div class="dx-carga-pe"><span></span><b>0<small>%</small></b></div><div class="dx-carga-barra"><i></i></div>';
    D.body.appendChild(veu); D.body.appendChild(card);
    var svg=card.querySelector('.dex-carga-svg'); if(t==='arte') vestirPintor(svg);
    desenho.aplicarVisual();
    if(t==='arte'){ svg.setAttribute('data-rosto','bigode'); svg.setAttribute('data-cab','nenhum'); svg.setAttribute('data-corpo','nenhum'); svg.classList.add('dex-thumb'); }
    svg.setAttribute('data-humor',t==='zip'?'jogando':'pintando');
    tracos=Array.prototype.map.call(card.querySelectorAll('.dx-traco'),function(p){ var l=Math.ceil(p.getTotalLength?p.getTotalLength():200); p.style.setProperty('--l',l); return {el:p,l:l}; });
  }
  function abrir(t){
    tipo=t; aberto=true; fechando=false; comprimindo=false; alvo=0; mostrado=0; montar(t);
    requestAnimationFrame(function(){ veu.classList.add('on'); });
    M.anima(card,[{opacity:0,transform:'translateX(-50%) translateY(40px) scale(.9)'},{opacity:1,transform:'translateX(-50%)'}],'pula');
    laco();
  }
  /* a porcentagem e a barra correm até o valor real de forma suave */
  function laco(){
    cancelAnimationFrame(raf);
    (function passo(){
      if(!card) return;
      if(comprimindo===false&&tipo==='zip'&&alvo>=.9&&!fechando) alvo=Math.min(.96,alvo+.0006);
      mostrado+=(alvo-mostrado)*.14; if(Math.abs(alvo-mostrado)<.001) mostrado=alvo;
      var pct=Math.round(mostrado*100);
      card.querySelector('.dx-carga-pe b').firstChild.nodeValue=String(pct);
      card.querySelector('.dx-carga-barra i').style.transform='scaleX('+mostrado.toFixed(4)+')';
      if(tipo==='zip'){ var pl=card.querySelector('.dx-env-pilha'); if(pl) pl.style.setProperty('--pilha',Math.min(1,mostrado*1.05).toFixed(3)); }
      else tracos.forEach(function(t,i){ var ini=i/tracos.length, fim=(i+1)/tracos.length, k=Math.max(0,Math.min(1,(mostrado-ini)/(fim-ini))); t.el.style.strokeDashoffset=(t.l*(1-k)).toFixed(1);
        if(k>0&&k<1){ var tinta=card.querySelector('.dx-tinta'); if(tinta) tinta.setAttribute('fill',t.el.getAttribute('stroke')); } });
      if(aberto||Math.abs(alvo-mostrado)>.001) raf=requestAnimationFrame(passo);
    })();
  }
  function atualizar(msg,pct){
    if(!card) return;
    if(msg) card.querySelector('.dx-carga-pe span').textContent=msg;
    /* no ZIP, a montagem vai até 90%; a compactação (do JSZip) completa o resto */
    if(pct!=null&&!comprimindo) alvo=Math.max(alvo,tipo==='zip'?pct*.9:pct);
  }
  function fechar(){
    if(!card||fechando) return; fechando=true; aberto=false; alvo=1;
    var c=card, v=veu; card.querySelector('.dx-carga-pe span').textContent=tipo==='zip'?'ZIP pronto!':'Artes prontas!';
    laco(); setTimeout(function(){ if(c) c.classList.add('pronto'); var s=c.querySelector('.dex-carga-svg'); if(s) s.setAttribute('data-humor','comemorando');
      if(tipo==='zip'){ var aba=c.querySelector('.dx-env-aba'), env=c.querySelector('.dx-env'); if(aba&&env) env.appendChild(aba); } },260);
    setTimeout(function(){
      v.classList.remove('on');
      var a=M.anima(c,[{opacity:1,transform:'translateX(-50%)'},{opacity:0,transform:'translateX(-50%) translateY(24px) scale(.94)'}],'rapida',{fill:'forwards'});
      var fim=function(){ c.remove(); v.remove(); if(card===c){ card=null; veu=null; tipo=null; } };
      if(a) a.finished.then(fim,fim); else fim();
    },M.parado()?200:1250);
  }

  /* =================================================================== 3. LIGAÇÃO */
  var MESES='janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro';
  function tipoDe(msg){
    msg=String(msg||'');
    if(/Montando o ZIP/i.test(msg)) return 'zip';
    if(/Gerando artes|Preparando arte|Montando o modelo/i.test(msg)||new RegExp('^Preparando ('+MESES+')','i').test(msg)) return 'arte';
    return null;
  }
  var original=W.busy;
  if(typeof original!=='function') return;
  W.busy=function(on,msg,pct){
    var t=on?tipoDe(msg):null;
    if(on&&(t||tipo||tAbrir)){
      if(!tipo&&!tAbrir){ var tt=t; original(false); tAbrir=setTimeout(function(){ tAbrir=0; abrir(tt); atualizar(ultMsg,ultPct); },120); }
      ultMsg=msg; ultPct=pct; if(card) atualizar(msg,pct); return;
    }
    if(!on&&(tipo||tAbrir)){ if(tAbrir){ clearTimeout(tAbrir); tAbrir=0; } else fechar(); return original.apply(this,arguments); }
    return original.apply(this,arguments);
  };
  var ultMsg='', ultPct=0;
  /* compactação do ZIP em tempo real */
  if(W.JSZip&&JSZip.prototype.generateAsync){
    var gerar=JSZip.prototype.generateAsync;
    JSZip.prototype.generateAsync=function(op,cb){
      if(tipo==='zip'){ comprimindo=true; if(card) card.querySelector('.dx-carga-pe span').textContent='Fechando o envelope…'; }
      return gerar.call(this,op,function(m){ if(cb) cb(m); if(tipo==='zip'&&m&&m.percent!=null) alvo=Math.max(alvo,.9+.1*m.percent/100); });
    };
  }
  W.__dexCarga={abrir:abrir,atualizar:atualizar,fechar:fechar};
})();
