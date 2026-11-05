/* =============================================================================
   AkiCut · temas.js — temas do site (paletas completas)
   Cada tema define o fundo, os painéis, o menu lateral, o destaque e se é claro ou
   escuro. "Padrão" mantém o botão Tema de sempre (automático, claro, escuro).
   A escolha fica salva no navegador (ak-paleta). As cores em si ficam em visual.css.
   ============================================================================= */
(function(){
  'use strict';
  var D=document, W=window, H=D.documentElement;
  var LS={get:function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }};
  /* id, nome, modo, [menu, fundo, painel, destaque] (só para a miniatura) */
  var PALETAS=[
    ['padrao','Padrão',null,['#0D0F12','#F4F5F7','#FFFFFF','#111318'],'Grafite, segue o botão Tema'],
    ['meia-noite','Meia-noite','dark',['#000000','#050506','#0E0E11','#ECEEF1'],'Preto profundo'],
    ['akiyama','Akiyama','dark',['#1A1650','#050A33','#0D1347','#9A5CFF'],'As cores da marca'],
    ['oceano','Oceano','dark',['#04141A','#06161C','#0B2129','#3CC4D4'],'Azul-petróleo'],
    ['floresta','Floresta','dark',['#07110C','#0A140F','#101E17','#5FC795'],'Verde-escuro'],
    ['vinho','Vinho','dark',['#13070B','#160A0E','#221016','#E58FA3'],'Bordô suave'],
    ['areia','Areia','light',['#2B2219','#F6F1EA','#FFFDF9','#A86B2D'],'Claro e quente'],
    ['lavanda','Lavanda','light',['#1C1830','#F4F2FB','#FFFFFF','#6B57D6'],'Lilás leve'],
    ['menta','Menta','light',['#0F2219','#EFF7F3','#FFFFFF','#2E8B62'],'Verde-água'],
    ['ceu','Céu','light',['#0E1C2B','#EEF4FA','#FFFFFF','#2F6FB4'],'Azul-claro']];
  var atual=LS.get('ak-paleta')||'padrao';
  if(!PALETAS.some(function(p){ return p[0]===atual; })) atual='padrao';
  function achar(id){ for(var i=0;i<PALETAS.length;i++) if(PALETAS[i][0]===id) return PALETAS[i]; return null; }
  function normal(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }

  function aplicar(id,animar){
    var p=achar(id)||achar(normalizar(id)); if(!p) return false;
    var feito=function(){
      atual=p[0]; LS.set('ak-paleta',atual);
      if(atual==='padrao') H.removeAttribute('data-ak-paleta'); else H.setAttribute('data-ak-paleta',atual);
      if(p[2]&&typeof W.aplicarTema==='function') W.aplicarTema(p[2],false);
      var m=D.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content',p[3][0]);
      marcar();
    };
    /* troca com um cruzamento suave da tela inteira (quando o navegador permite) */
    if(animar&&D.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches) D.startViewTransition(feito); else feito();
    return true;
  }
  function normalizar(nome){ var k=normal(nome); for(var i=0;i<PALETAS.length;i++){ if(normal(PALETAS[i][1])===k||PALETAS[i][0]===k) return PALETAS[i][0]; }
    for(var j=0;j<PALETAS.length;j++){ if(normal(PALETAS[j][1]).indexOf(k)===0) return PALETAS[j][0]; } return k; }

  /* o botão Tema (automático/claro/escuro) volta ao tema Padrão */
  function ligarBotao(){
    var b=D.getElementById('btnTheme'); if(!b||b.__akPal) return; b.__akPal=true;
    var orig=b.onclick;
    b.onclick=function(e){ if(atual!=='padrao'){ aplicar('padrao',true); if(typeof W.toast==='function') W.toast('Tema Padrão',1400); return; } if(orig) return orig.call(this,e); };
  }

  /* seção "Tema do site" em Ajustes */
  var grade=null;
  function miniatura(p){ var c=p[3];
    return '<svg viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" rx="6" fill="'+c[1]+'"/><rect width="16" height="40" rx="6" fill="'+c[0]+'"/><rect x="10" width="6" height="40" fill="'+c[0]+'"/>'+
      '<rect x="4" y="6" width="8" height="2.4" rx="1.2" fill="#fff" opacity=".8"/><rect x="4" y="12" width="7" height="1.8" rx=".9" fill="#fff" opacity=".35"/><rect x="4" y="16" width="7" height="1.8" rx=".9" fill="#fff" opacity=".35"/>'+
      '<rect x="21" y="6" width="34" height="13" rx="3" fill="'+(p[2]==='light'||p[0]==='padrao'?c[0]:c[2])+'"/><rect x="21" y="22" width="16" height="12" rx="3" fill="'+c[2]+'"/><rect x="39" y="22" width="16" height="12" rx="3" fill="'+c[2]+'"/>'+
      '<rect x="24" y="12" width="12" height="3.4" rx="1.7" fill="'+c[3]+'"/></svg>'; }
  function marcar(){ if(!grade) return; grade.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.p===atual)); }); }
  function montarAjustes(){
    var cx=D.querySelector('#settingsDlg .ak-ajustes'); if(!cx||cx.querySelector('.ak-temas-sec')) return;
    var sec=D.createElement('section'); sec.className='ak-sec ak-temas-sec';
    sec.innerHTML='<h4>Tema do site</h4><div class="ak-temas">'+PALETAS.map(function(p){
      return '<button type="button" class="ak-tema" data-p="'+p[0]+'" aria-pressed="'+(p[0]===atual)+'">'+miniatura(p)+'<b>'+p[1]+'</b><small>'+p[4]+'</small></button>'; }).join('')+'</div>';
    var dex=cx.querySelector('.dx-sec'); if(dex&&dex.nextSibling) cx.insertBefore(sec,dex.nextSibling); else cx.insertBefore(sec,cx.firstChild);
    grade=sec.querySelector('.ak-temas');
    grade.querySelectorAll('button').forEach(function(b){ b.onclick=function(){ aplicar(b.dataset.p,true);
      try{ b.animate([{transform:'scale(.94)'},{transform:'scale(1.03)'},{transform:'none'}],{duration:380,easing:'cubic-bezier(.3,.7,.3,1)'}); }catch(e){} }; });
  }

  /* aplica já (antes de pintar) e liga o resto quando a página estiver pronta */
  if(atual!=='padrao') H.setAttribute('data-ak-paleta',atual);
  function iniciar(){ var p=achar(atual); if(p&&p[2]&&typeof W.aplicarTema==='function') W.aplicarTema(p[2],false); ligarBotao(); montarAjustes(); setTimeout(montarAjustes,600); }
  if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',iniciar); else iniciar();

  W.__akPaleta={lista:PALETAS.map(function(p){ return {id:p[0],nome:p[1],modo:p[2],desc:p[4]}; }),aplicar:function(n){ return aplicar(normalizar(n),true); },atual:function(){ return atual; }};
})();
