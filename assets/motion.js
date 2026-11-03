/* =============================================================================
   AkiCut · motion.js
   O movimento do site, no estilo Apple Motion: molas de verdade (física), nada de
   curvas prontas. Só usa transform e opacity, que o navegador desenha na placa de vídeo.

   1. Mola        — biblioteca pequena usada pelo site e pelo Dex (window.Mola)
   2. Modo leve   — detecta computador mais simples e corta os efeitos caros
   3. Toques      — botões afundam e voltam com mola
   4. Abas        — indicador que desliza e conteúdo que entra pelo lado certo
   5. Meses       — o destaque do mês "voa" até o mês escolhido
   6. Diálogos    — abrem crescendo a partir do botão clicado
   7. Listas      — linhas e cartões chegam em sequência
   8. Avisos      — os toasts entram com mola
   ============================================================================= */
(function(){
  'use strict';
  var D=document, H=D.documentElement, W=window;
  var LS={ get:function(k,p){ try{ var v=localStorage.getItem(k); return v==null?p:v; }catch(e){ return p; } }, set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };

  /* =========================================================== 1. MOLA */
  function parado(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches||H.getAttribute('data-ak-mov')==='desligadas'; }catch(e){ return false; } }
  /* simula uma mola (rigidez k, atrito c) e devolve a curva pronta para o CSS (linear()) */
  function curva(k,c){
    var p=0,v=0,t=0,n=0,dt=1/240,pts=[0];
    while(t<3){ var f=-k*(p-1)-c*v; v+=f*dt; p+=v*dt; t+=dt; n++; if(n%7===0) pts.push(+p.toFixed(4)); if(t>.2&&Math.abs(p-1)<.001&&Math.abs(v)<.015) break; }
    pts.push(1); return {easing:'linear('+pts.join(', ')+')',duration:Math.round(t*1000)};
  }
  var LIN=!!(W.CSS&&CSS.supports&&CSS.supports('transition-timing-function','linear(0, 1)'));
  /* molas um pouco mais macias: movimento mais longo e fluido, sem perder a resposta */
  var SP=LIN?{suave:curva(118,21.5),calma:curva(72,16.8),morph:curva(138,23),rapida:curva(210,28.5),pula:curva(200,15.5),elastica:curva(150,12.5)}
    :{suave:{easing:'cubic-bezier(.22,1,.36,1)',duration:700},calma:{easing:'cubic-bezier(.22,1,.36,1)',duration:950},morph:{easing:'cubic-bezier(.2,.9,.25,1)',duration:680},
      rapida:{easing:'cubic-bezier(.22,1,.36,1)',duration:480},pula:{easing:'cubic-bezier(.34,1.56,.64,1)',duration:600},elastica:{easing:'cubic-bezier(.34,1.8,.64,1)',duration:800}};
  if(LIN){ H.style.setProperty('--mola',SP.suave.easing); H.style.setProperty('--mola-pula',SP.pula.easing); H.style.setProperty('--mola-rapida',SP.rapida.easing); }
  else { H.style.setProperty('--mola','cubic-bezier(.22,1,.36,1)'); H.style.setProperty('--mola-pula','cubic-bezier(.34,1.56,.64,1)'); H.style.setProperty('--mola-rapida','cubic-bezier(.22,1,.36,1)'); }
  function sp(k,x){ if(parado()) return Object.assign({duration:1},x||{},{delay:0}); return Object.assign({duration:SP[k].duration,easing:SP[k].easing},x||{}); }
  function anima(el,frames,k,x){ if(!el||!el.animate) return null; try{ return el.animate(frames,sp(k||'suave',x)); }catch(e){ return null; } }
  /* FLIP: mede, muda, e anima cada elemento do lugar antigo até o novo */
  function flip(els,mudar,k){
    var antes=new Map(); els.forEach(function(e){ antes.set(e,e.getBoundingClientRect()); }); mudar();
    els.forEach(function(e){ var a=antes.get(e), b=e.getBoundingClientRect(); if(!a) return; var dx=a.left-b.left, dy=a.top-b.top;
      if(Math.abs(dx)>.5||Math.abs(dy)>.5) anima(e,[{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],k||'suave',{composite:'add'}); });
  }
  function raios(el){ var cs=getComputedStyle(el); return ['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(function(k){ return parseFloat(cs[k])||0; }); }
  function visivel(el){ if(!el||!el.getBoundingClientRect) return false; var r=el.getBoundingClientRect(); return r.width>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; }
  /* morph: um "fantasma" sai do elemento de origem e vira o destino (como abrir um app no iPhone) */
  function morph(de,para,op){
    op=op||{};
    if(parado()||!para) return Promise.resolve();
    var fr=de&&de.getBoundingClientRect?de.getBoundingClientRect():de, to=para.getBoundingClientRect();
    if(!fr||!fr.width||!to.width) return Promise.resolve();
    var r0=op.raioDe!=null?op.raioDe:(de&&de.nodeType?raios(de)[0]:fr.width/2), rs=raios(para);
    var g=D.createElement('div'); g.className='ak-fantasma';
    Object.assign(g.style,{width:to.width+'px',height:to.height+'px',transform:'translate('+to.left+'px,'+to.top+'px)',background:op.cor||getComputedStyle(para).backgroundColor||'#111',boxShadow:op.sombra||'none'});
    D.body.appendChild(g);
    var sx=fr.width/to.width, sy=fr.height/to.height;
    var a={transform:'translate('+fr.left+'px,'+fr.top+'px) scale('+sx+','+sy+')',borderRadius:(r0/sx).toFixed(2)+'px / '+(r0/sy).toFixed(2)+'px'};
    var b={transform:'translate('+to.left+'px,'+to.top+'px)',borderRadius:rs.map(function(r){ return r+'px'; }).join(' ')};
    var dur=SP.morph.duration;
    var ga=g.animate(op.volta?[b,a]:[a,b],sp('morph',{fill:'forwards'}));
    g.animate(op.volta?[{opacity:0},{opacity:1,offset:.25},{opacity:1}]:[{opacity:1},{opacity:1,offset:.42},{opacity:0}],{duration:dur,fill:'forwards'});
    if(!op.volta) para.animate([{opacity:0,transform:'scale(.965)'},{opacity:1,transform:'none'}],{duration:Math.round(dur*.62),delay:Math.round(dur*.2),easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
    return ga.finished.then(function(){ g.remove(); },function(){ g.remove(); });
  }
  /* conta um número até o alvo */
  function contar(el,alvo,ms){ if(!el) return; var de=parseFloat(el.dataset.v||'0')||0; el.dataset.v=alvo; if(parado()){ el.textContent=Math.round(alvo).toLocaleString('pt-BR'); return; }
    var t0=performance.now(), d=ms||900; (function p(t){ var k=Math.min(1,(t-t0)/d), e=1-Math.pow(1-k,4); el.textContent=Math.round(de+(alvo-de)*e).toLocaleString('pt-BR'); if(k<1) requestAnimationFrame(p); })(t0); }
  /* arrastar para os lados com o mouse, com inércia e um "quique" na borda */
  function arrastar(box){
    if(!box||box.__arrasta) return; box.__arrasta=true; box.classList.add('ak-arrasta');
    var x0=0,s0=0,v=0,lt=0,lx=0,ativo=false,moveu=false,raf=0;
    box.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; cancelAnimationFrame(raf); ativo=true; moveu=false; x0=lx=e.clientX; s0=box.scrollLeft; v=0; lt=performance.now(); });
    W.addEventListener('pointermove',function(e){ if(!ativo) return; var dx=e.clientX-x0; if(!moveu&&Math.abs(dx)>5){ moveu=true; box.classList.add('ak-arrastando'); }
      if(!moveu) return; box.scrollLeft=s0-dx; var t=performance.now(); v=(e.clientX-lx)/Math.max(1,t-lt); lx=e.clientX; lt=t; },{passive:true});
    W.addEventListener('pointerup',function(){ if(!ativo) return; ativo=false; box.classList.remove('ak-arrastando');
      if(!moveu) return; var vel=-v*16;
      (function inercia(){ var antes=box.scrollLeft; box.scrollLeft+=vel; vel*=.94;
        if(box.scrollLeft===antes&&Math.abs(vel)>2){ var dir=vel>0?-1:1; anima(box.firstElementChild,[{transform:'translateX('+(dir*Math.min(24,Math.abs(vel)*2))+'px)'},{transform:'none'}],'elastica',{composite:'add'}); return; }
        if(Math.abs(vel)>.4) raf=requestAnimationFrame(inercia); })();
    });
    box.addEventListener('click',function(e){ if(moveu){ e.preventDefault(); e.stopPropagation(); moveu=false; } },true);
  }

  /* =========================================================== 2. MODO LEVE */
  function aplicarLeve(){
    var op=LS.get('ak-leve','auto'), fraco=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
    H.classList.toggle('ak-leve',op==='sim'||(op==='auto'&&(fraco||LS.get('ak-leve-medido','')==='1')));
  }
  aplicarLeve();
  /* mede o desempenho real uma vez: se o navegador não passar de ~40 quadros por segundo, liga o modo leve */
  function medir(){ if(LS.get('ak-leve','auto')!=='auto'||D.hidden) return;
    var n=0,t0=performance.now(); (function f(t){ n++; if(t-t0<2000) requestAnimationFrame(f); else { var fps=n/((t-t0)/1000); LS.set('ak-leve-medido',fps<40?'1':'0'); aplicarLeve(); } })(t0); }
  D.addEventListener('visibilitychange',function(){ H.classList.toggle('ak-pausa',D.hidden); });

  W.Mola={sp:sp,anima:anima,flip:flip,morph:morph,contar:contar,arrastar:arrastar,parado:parado,visivel:visivel,raios:raios,
    leve:function(){ return H.classList.contains('ak-leve'); },definirLeve:function(v){ LS.set('ak-leve',v); aplicarLeve(); },modoLeve:function(){ return LS.get('ak-leve','auto'); }};
  H.classList.add('ak-mola');

  /* =========================================================== 3. TOQUES */
  var TOQUE='.btn,.mchip,.inicio-card,.iconbtn,.pcard,.ak-chip,.ak-btn,.ak-starter,.ak-num,.top .tabs button,.dlg-f button,.dx-toque';
  var ultimoToque=null, tUltimo=0;
  D.addEventListener('pointerdown',function(e){
    if(e.button!==0) return; var el=e.target.closest&&e.target.closest(TOQUE); ultimoToque=e.target.closest?e.target.closest('button,[role="button"],a,.pcard,.inicio-card')||e.target:null; tUltimo=Date.now();
    if(!el||el.disabled||parado()) return;
    var s=el.offsetWidth>260?.985:el.offsetWidth>140?.97:.94;
    if(el.__toque) el.__toque.cancel();
    el.__toque=el.animate([{transform:'scale(1)'},{transform:'scale('+s+')'}],{duration:110,easing:'ease-out',fill:'forwards',composite:'add'});
    var soltar=function(){ W.removeEventListener('pointerup',soltar,true); W.removeEventListener('pointercancel',soltar,true);
      if(el.__toque){ el.__toque.cancel(); el.__toque=null; } anima(el,[{transform:'scale('+s+')'},{transform:'scale(1)'}],'pula',{composite:'add'}); };
    W.addEventListener('pointerup',soltar,true); W.addEventListener('pointercancel',soltar,true);
  },true);

  /* =========================================================== 4. ABAS */
  var tabs=D.querySelector('.top .tabs'), gl=null, glAntes=null;
  function moverGlider(animar){
    if(!tabs) return; var b=tabs.querySelector('button[aria-selected="true"]');
    if(!b||!b.offsetWidth){ H.classList.remove('ak-glider-on'); return; }
    if(!gl){ gl=D.createElement('span'); gl.className='ak-glider'; gl.setAttribute('aria-hidden','true'); tabs.insertBefore(gl,tabs.firstChild); }
    var box={x:b.offsetLeft,y:b.offsetTop,w:b.offsetWidth,h:b.offsetHeight};
    gl.style.borderRadius=getComputedStyle(b).borderRadius;
    gl.style.width=box.w+'px'; gl.style.height=box.h+'px'; gl.style.transform='translate('+box.x+'px,'+box.y+'px)';
    if(animar&&glAntes&&(glAntes.x!==box.x||glAntes.y!==box.y))
      anima(gl,[{transform:'translate('+glAntes.x+'px,'+glAntes.y+'px) scale('+(glAntes.w/box.w)+','+(glAntes.h/box.h)+')'},{transform:'translate('+box.x+'px,'+box.y+'px)'}],'suave');
    glAntes=box; H.classList.add('ak-glider-on');
  }
  if(tabs){
    if('ResizeObserver' in W) new ResizeObserver(function(){ moverGlider(false); }).observe(tabs);
    new MutationObserver(function(){ requestAnimationFrame(function(){ moverGlider(false); }); }).observe(D.body,{attributes:true,attributeFilter:['class']});
  }
  var ORDEM=['inicio','aniv','arte','colab','novos'], abaAtual=null;
  /* a aba nova entra pelo lado de onde veio, e o conteúdo chega em cascata */
  function entrarAba(sec,dir){
    if(!sec||parado()) return;
    anima(sec,[{opacity:0,transform:'translateX('+(dir*42)+'px)'},{opacity:1,transform:'none'}],'suave');
    var filhos=[]; Array.prototype.forEach.call(sec.children,function(c){ if(c.hidden||c.offsetParent===null) return;
      if(/inicio-cols|studio/.test(c.className)) Array.prototype.forEach.call(c.children,function(x){ filhos.push(x); }); else filhos.push(c); });
    filhos.slice(0,8).forEach(function(c,i){ anima(c,[{opacity:0,transform:'translateY(18px) scale(.985)'},{opacity:1,transform:'none'}],'calma',{delay:40+i*55,fill:'backwards'}); });
  }
  var oTab=W.setTab;
  if(typeof oTab==='function') W.setTab=function(t){
    var antes=abaAtual, r=oTab.apply(this,arguments);
    try{ moverGlider(true); if(t!==antes){ abaAtual=t; var i0=ORDEM.indexOf(antes), i1=ORDEM.indexOf(t); entrarAba(D.getElementById('tab-'+t),i0<0||i1>=i0?1:-1); } }catch(e){}
    return r;
  };
  new MutationObserver(function(m,ob){ if(!D.body.classList.contains('revealed')) return; ob.disconnect(); moverGlider(false);
    var s=D.querySelector('main > section:not([hidden])'); if(s){ abaAtual=s.id.replace('tab-',''); entrarAba(s,1); }
    setTimeout(medir,1800);
  }).observe(D.body,{attributes:true,attributeFilter:['class']});

  /* =========================================================== 5. MESES */
  var meses=D.getElementById('months');
  if(meses){
    meses.addEventListener('click',function(e){
      var alvo=e.target.closest('.mchip'), antigo=meses.querySelector('.mchip[aria-pressed="true"]'); if(!alvo||!antigo||alvo===antigo||parado()) return;
      var r0=antigo.getBoundingClientRect(), cor=getComputedStyle(antigo).backgroundImage, rad=getComputedStyle(antigo).borderRadius;
      requestAnimationFrame(function(){
        var novo=meses.querySelector('.mchip[aria-pressed="true"]'); if(!novo) return; var r1=novo.getBoundingClientRect();
        var g=D.createElement('div'); g.className='ak-fantasma'; Object.assign(g.style,{width:r1.width+'px',height:r1.height+'px',borderRadius:rad,backgroundImage:cor,zIndex:5});
        D.body.appendChild(g);
        var a=g.animate([{transform:'translate('+r0.left+'px,'+r0.top+'px) scale('+(r0.width/r1.width)+','+(r0.height/r1.height)+')'},{transform:'translate('+r1.left+'px,'+r1.top+'px)'}],sp('suave',{fill:'forwards'}));
        g.animate([{opacity:1},{opacity:1,offset:.7},{opacity:0}],{duration:SP.suave.duration,fill:'forwards'});
        anima(novo,[{opacity:.5},{opacity:1}],'suave');
        a.finished.then(function(){ g.remove(); },function(){ g.remove(); });
      });
    },true);
  }

  /* =========================================================== 6. DIÁLOGOS */
  if(W.HTMLDialogElement&&HTMLDialogElement.prototype.showModal){
    var abrirOrig=HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal=function(){
      var r=abrirOrig.apply(this,arguments), dlg=this, src=Date.now()-tUltimo<900?ultimoToque:null;
      if(!parado()&&!dlg.hasAttribute('data-sem-morph')){
        dlg.style.animation='none';
        if(src&&visivel(src)&&!dlg.contains(src)) morph(src,dlg,{cor:getComputedStyle(dlg).backgroundColor});
        else anima(dlg,[{opacity:0,transform:'translateY(22px) scale(.95)'},{opacity:1,transform:'none'}],'morph');
        var b=dlg.querySelector('.dlg-b,.dx-est-in'); if(b) anima(b,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],'calma',{delay:120,fill:'backwards'});
      }
      return r;
    };
  }

  /* =========================================================== 7. LISTAS */
  function cascata(box,max){
    if(!box) return; var ult=0;
    new MutationObserver(function(ms){
      if(parado()) return; var agora=Date.now(); if(agora-ult<450) return;
      var novos=[]; ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1) novos.push(n); }); });
      if(novos.length<3) return; ult=agora;
      novos.slice(0,max).forEach(function(n,i){ anima(n,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],'suave',{delay:i*24,fill:'backwards'}); });
    }).observe(box,{childList:true});
  }
  cascata(D.getElementById('rows'),16); cascata(D.getElementById('people'),24);

  /* =========================================================== 8. AVISOS */
  var toastBox=D.getElementById('toast');
  if(toastBox) new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1) anima(n,[{opacity:0,transform:'translateY(26px) scale(.9)'},{opacity:1,transform:'none'}],'pula'); }); }); }).observe(toastBox,{childList:true});
})();
