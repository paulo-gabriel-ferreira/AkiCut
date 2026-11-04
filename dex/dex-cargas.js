/* =============================================================================
   DEX · dex-cargas.js — telas de carregamento com o Dex trabalhando de verdade
   1. Boneco     — molas por articulação, braço que alcança pontos (IK), piscar, olhar
   2. Cenas      — arte (pinta um quadro), zip (papéis no envelope),
                   foto (revela uma foto instantânea), geral (escreve um relatório)
   3. Cartão     — centralizado, com título, contagem, porcentagem e barra
   4. Ligação    — assume o carregamento do app (busy) e o progresso real do JSZip
   Nada de animação em loop: cada cena decide a próxima ação (com sorteio e pausa),
   reage ao progresso real e só mexe em transform/opacity. Roda leve em qualquer PC.
   ============================================================================= */
(function(){
  'use strict';
  var D=document, W=window, M=W.Mola||{anima:function(){ return null; }};
  if(!W.__dex||!W.__dex.desenho) return;
  var desenho=W.__dex.desenho;

  /* =================================================================== 1. BONECO */
  function cl(v,a,b){ return v<a?a:v>b?b:v; }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function f2(n){ return Math.round(n*10)/10; }
  /* só escreve no DOM quando o valor muda (evita recalcular estilo à toa) */
  function sT(el,v){ if(el.__t!==v){ el.__t=v; el.style.transform=v; } }
  function sA(el,k,v){ var c='__a'+k; if(el[c]!==v){ el[c]=v; el.setAttribute(k,v); } }
  function Mola(v,k,z){ this.x=v; this.v=0; this.a=v; this.k=k; this.z=z; }
  Mola.prototype.passo=function(dt){ var c=2*Math.sqrt(this.k)*this.z; this.v+=(this.k*(this.a-this.x)-c*this.v)*dt; this.x+=this.v*dt; };

  var OMBRO={d:[124.5,103],e:[35.5,103]};
  function dexG(){
    return desenho.inteiro('dex-carga-svg').replace(/^<svg[^>]*>/,'<g class="dex-svg dex-carga-svg" data-humor="manual" transform="translate(-80 -166)">').replace(/<\/svg>\s*$/,'</g>');
  }
  function Ator(svgCena,S,x,chao){
    var q=function(s){ return svgCena.querySelector(s); }, m=function(v,k,z){ return new Mola(v,k,z); };
    this.g=q('.dx-ator'); this.svg=q('.dex-carga-svg'); this.sombra=q('.dx-sombra-a'); this.S=S; this.chao=chao;
    this.c={x:m(x,52,.84),y:m(chao,58,.8),r:m(0,70,.72),sq:m(0,240,.42),cab:m(0,85,.64),bd:m(0,150,.62),be:m(0,150,.62),
      kd:m(1,190,.7),ke:m(1,190,.7),ox:m(0,300,.86),oy:m(0,300,.86),big:m(1,260,.35)};
    var s=this.svg;
    this.braD=s.querySelector('.dex-braco-d'); this.oscD=s.querySelector('.dex-braco-d .dex-osc');
    this.braE=s.querySelector('.dex-braco-e'); this.oscE=s.querySelector('.dex-braco-e .dex-osc');
    this.cab=s.querySelector('.dex-cabeca'); this.olhos=s.querySelector('.dex-olhos'); this.big=s.querySelector('.dex-ros-bigode');
    this.os=[].slice.call(s.querySelectorAll('.dex-o')); this.oE=s.querySelector('.dex-olho-e .dex-o');
    this.jatos=[].slice.call(s.querySelectorAll('.dex-jato'));
    this.os.forEach(function(o){ o.style.transformBox='fill-box'; o.style.transformOrigin='center'; });
    this.fase=rnd(0,6); this.piscaEm=rnd(.8,2.4); this.pisca=-9; this.fecharE=0; this.humor='manual'; this.humorAte=0; this.Y=chao; this.t=0;
  }
  Ator.prototype.passo=function(dt,t){
    var c=this.c, k; this.t=t;
    for(k in c) c[k].passo(dt);
    var Y=c.y.x+(Math.sin(t*2.1+this.fase)*1.4+Math.sin(t*3.4+this.fase*2)*.5), sq=c.sq.x+Math.sin(t*2.6+this.fase)*.012, S=this.S;
    /* inclina para onde está indo (como quem voa de verdade) */
    var inc=cl(c.x.v*.07,-13,13);
    this.Y=Y; this.rTot=c.r.x+inc;
    sA(this.g,'transform','translate('+f2(c.x.x)+' '+f2(Y)+') rotate('+f2(c.r.x+inc)+') scale('+(Math.round(S*(1-sq*.5)*1000)/1000)+' '+(Math.round(S*(1+sq)*1000)/1000)+')');
    sT(this.braD,'rotate('+f2(c.bd.x)+'deg)'); sT(this.oscD,'scaleY('+(Math.round(c.kd.x*100)/100)+')');
    sT(this.braE,'rotate('+f2(c.be.x)+'deg)'); sT(this.oscE,'scaleY('+(Math.round(c.ke.x*100)/100)+')');
    sT(this.cab,'rotate('+f2(c.cab.x)+'deg)');
    sT(this.olhos,'translate('+f2(c.ox.x)+'px,'+f2(c.oy.x)+'px)');
    if(this.big) sT(this.big,'scale(1.35,'+(Math.round(135*c.big.x)/100)+')');
    /* piscar: às vezes duas vezes seguidas */
    if(t>this.piscaEm){ this.pisca=t; this.piscaEm=t+(Math.random()<.22?.26:rnd(1.8,4.6)); }
    var p=(t-this.pisca)/.15, b=p<1?1-Math.sin(p*Math.PI)*.92:1, self=this;
    this.os.forEach(function(o){ sT(o,'scaleY('+(Math.round((o===self.oE&&self.fecharE?Math.min(b,.14):b)*100)/100)+')'); });
    /* jatos acendem quando ele sobe */
    var subida=cl((this.chao-Y)/28,0,1);
    for(var i=0;i<this.jatos.length;i++){ var j=this.jatos[i]; if(subida<.02){ if(j.__t!=='o'){ j.__t='o'; j.style.opacity=0; } continue; } j.style.opacity=f2(subida*.9); j.__t=''; j.style.transform='scaleY('+f2(.55+subida*.7+Math.sin(t*38+i)*.12)+')'; }
    if(this.sombra){ sA(this.sombra,'cx',f2(c.x.x)); sA(this.sombra,'rx',f2(30*S*(1-subida*.45))); sA(this.sombra,'opacity',f2(.2*(1-subida*.6))); }
    if(this.humorAte&&t>this.humorAte){ this.humorAte=0; this.cara('manual'); }
  };
  Ator.prototype.cara=function(h,dur){ if(h!==this.humor){ this.humor=h; this.svg.setAttribute('data-humor',h); } this.humorAte=dur?this.t+dur:0; if(h==='feliz'||h==='comemorando') this.c.big.v+=5; };
  Ator.prototype.ir=function(x,y,r){ if(x!=null) this.c.x.a=x; if(y!=null) this.c.y.a=Math.min(y,this.chao); if(r!=null) this.c.r.a=r; };
  Ator.prototype.pulo=function(f){ this.c.y.v-=f; this.c.sq.v+=f/70; };
  Ator.prototype.braco=function(l,ang,k){ this.c['b'+l].a=ang; this.c['k'+l].a=k==null?1:k; };
  Ator.prototype.local=function(P){
    var a=-(this.rTot||this.c.r.x)*Math.PI/180, dx=P[0]-this.c.x.x, dy=P[1]-this.Y, cs=Math.cos(a), sn=Math.sin(a);
    return [(dx*cs-dy*sn)/this.S+80,(dx*sn+dy*cs)/this.S+166];
  };
  Ator.prototype.mundo=function(q){
    var a=(this.rTot||this.c.r.x)*Math.PI/180, dx=(q[0]-80)*this.S, dy=(q[1]-166)*this.S, cs=Math.cos(a), sn=Math.sin(a);
    return [this.c.x.x+dx*cs-dy*sn,this.Y+dx*sn+dy*cs];
  };
  /* ponto na ponta do braço (onde está o pincel, a caneta, o papel…) */
  Ator.prototype.ponta=function(l,L){
    var o=OMBRO[l], th=this.c['b'+l].x*Math.PI/180, k=this.c['k'+l].x;
    return this.mundo([o[0]-L*k*Math.sin(th),o[1]+L*k*Math.cos(th)]);
  };
  /* aponta o braço para P e estica um pouco se precisar (braço de robô) */
  Ator.prototype.alcancar=function(l,P,L,kmax){
    var q=this.local(P), o=OMBRO[l], dx=q[0]-o[0], dy=q[1]-o[1], th=-Math.atan2(dx,dy)*180/Math.PI, cur=this.c['b'+l].a;
    while(th-cur>180) th-=360; while(th-cur<-180) th+=360;
    this.c['b'+l].a=th; this.c['k'+l].a=cl(Math.hypot(dx,dy)/L,.72,kmax||1.4);
  };
  Ator.prototype.olhar=function(P){ var q=this.local(P), dx=q[0]-80, dy=q[1]-51, d=Math.hypot(dx,dy)||1; this.c.ox.a=dx/d*5.5; this.c.oy.a=dy/d*4; };
  Ator.prototype.olharVoce=function(){ this.c.ox.a=0; this.c.oy.a=1.5; };

  /* objetos presos à mão (entram no braço e acompanham tudo) */
  function naMao(ator,l,svg){ var g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.innerHTML=svg; (l==='d'?ator.oscD:ator.oscE).appendChild(g); return g; }

  /* partículas: gotas de tinta, notas, brilhos, "+1" e poeira (poucas, recicladas) */
  var NS='http://www.w3.org/2000/svg';
  function Particulas(svg,chao){ this.g=svg.querySelector('.dx-part'); this.l=[]; this.manchas=[]; this.chao=chao; }
  Particulas.prototype.soltar=function(tipo,x,y,o){
    o=o||{}; if(this.l.length>34) { var v=this.l.shift(); v.el.remove(); }
    var el=document.createElementNS(NS,tipo==='nota'||tipo==='mais'?'text':tipo==='brilho'?'path':'circle');
    if(tipo==='gota'){ el.setAttribute('r',o.r||rnd(1.1,2)); el.setAttribute('fill',o.cor||'#9DB8D2'); }
    else if(tipo==='poeira'){ el.setAttribute('r',o.r||rnd(1.4,2.6)); el.setAttribute('fill',o.cor||'#C9CED6'); }
    else if(tipo==='nota'){ el.textContent=Math.random()<.5?'♪':'♫'; el.setAttribute('class','dx-p-nota'); }
    else if(tipo==='mais'){ el.textContent=o.txt||'+1'; el.setAttribute('class','dx-p-mais'); }
    else { el.setAttribute('d','M0 -5L1.3 -1.3L5 0L1.3 1.3L0 5L-1.3 1.3L-5 0L-1.3 -1.3Z'); el.setAttribute('class','dx-p-brilho'); if(o.cor) el.setAttribute('fill',o.cor); }
    this.g.appendChild(el);
    this.l.push({el:el,tipo:tipo,x:x,y:y,vx:o.vx!=null?o.vx:rnd(-30,30),vy:o.vy!=null?o.vy:rnd(-60,-20),t:0,vida:o.vida||(tipo==='gota'?1.4:tipo==='brilho'?.7:1.1),cor:o.cor,s:o.s||1,giro:rnd(-200,200)});
  };
  Particulas.prototype.passo=function(dt){
    for(var i=this.l.length-1;i>=0;i--){
      var p=this.l[i]; p.t+=dt; var k=p.t/p.vida;
      if(p.tipo==='gota'){ p.vy+=380*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
        if(p.y>=this.chao+2){ this.mancha(p.x,p.cor); p.el.remove(); this.l.splice(i,1); continue; } }
      else if(p.tipo==='poeira'){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.92; p.vy*=.92; }
      else { p.x+=p.vx*dt+(p.tipo==='nota'?Math.sin(p.t*7)*.4:0); p.y+=p.vy*dt; p.vy*=.97; }
      if(k>=1){ p.el.remove(); this.l.splice(i,1); continue; }
      var op=p.tipo==='brilho'?Math.sin(k*Math.PI):k<.15?k/.15:1-Math.max(0,(k-.6)/.4), sc=p.tipo==='brilho'?p.s*(.4+Math.sin(k*Math.PI)*.9):p.tipo==='poeira'?p.s*(1+k*1.4):p.s;
      p.el.setAttribute('transform','translate('+f2(p.x)+' '+f2(p.y)+') scale('+f2(sc)+')'+(p.tipo==='brilho'?' rotate('+f2(p.giro*k)+')':''));
      p.el.setAttribute('opacity',f2(op));
    }
    for(var j=this.manchas.length-1;j>=0;j--){ var m=this.manchas[j]; m.t+=dt; if(m.t>5){ m.el.remove(); this.manchas.splice(j,1); } else if(m.t>3.5) m.el.setAttribute('opacity',f2((5-m.t)/1.5*.85)); }
  };
  Particulas.prototype.mancha=function(x,cor){
    if(this.manchas.length>10){ var v=this.manchas.shift(); v.el.remove(); }
    var el=document.createElementNS(NS,'ellipse'); el.setAttribute('cx',f2(x)); el.setAttribute('cy',f2(this.chao+3+rnd(0,3))); el.setAttribute('rx',f2(rnd(1.8,3.2))); el.setAttribute('ry','1'); el.setAttribute('fill',cor||'#9DB8D2'); el.setAttribute('opacity','.85');
    this.g.insertBefore(el,this.g.firstChild); this.manchas.push({el:el,t:0});
  };

  /* sorteio sem repetir a última ação */
  function sorteio(lista,ultima){ var l=lista.filter(function(a){ return a[0]!==ultima; }), tot=0, i; for(i=0;i<l.length;i++) tot+=l[i][1]; var r=Math.random()*tot; for(i=0;i<l.length;i++){ r-=l[i][1]; if(r<=0) return l[i][0]; } return l[0][0]; }

  /* =================================================================== 2. CENAS */
  var VB='0 0 320 172', CHAO=158;
  function base(fundo,frente){
    return '<svg class="dx-cena" viewBox="'+VB+'" aria-hidden="true">'+
      '<ellipse cx="160" cy="'+(CHAO+5)+'" rx="150" ry="9" class="dx-chao"/>'+fundo+
      '<ellipse class="dx-sombra-a" cx="150" cy="'+(CHAO+4)+'" rx="15" ry="3.2"/>'+
      '<g class="dx-ator">'+dexG()+'</g>'+(frente||'')+'<g class="dx-part"></g></svg>';
  }

  /* ---- 2a. QUADRO: o Dex percorre traços (pincel no quadro ou caneta no relatório) ---- */
  function cenaQuadro(o){
    var html=base(o.fundo,o.frente);
    return {html:html,iniciar:function(svg){
      var ator=new Ator(svg,.5,96,CHAO), tracos=[], total=0;
      [].forEach.call(svg.querySelectorAll('.dx-traco'),function(p){ var l=p.getTotalLength(); tracos.push({el:p,ini:total,l:l,cor:p.getAttribute('data-cor')}); total+=l;
        p.style.strokeDasharray='0 '+(l+10); p.style.opacity=0; });
      var ferr=naMao(ator,'d',o.ferramenta), mao=o.maoEsq?naMao(ator,'e',o.maoEsq):null, tinta=ferr.querySelector('.dx-tinta');
      var feito=0, est='entrar', tEst=0, dur=.6, ultima='', cor=-1, parado=0, ok=svg.querySelector('.dx-ok'), okM=new Mola(0,180,.5), fim=false, centro=o.centro;
      function ponto(L){ var tr=tracos[0]; for(var i=0;i<tracos.length;i++){ if(L>=tracos[i].ini) tr=tracos[i]; } var p=tr.el.getPointAtLength(cl(L-tr.ini,0,tr.l)); return {p:[p.x,p.y],i:tracos.indexOf(tr)}; }
      function mudar(e,d){ est=e; tEst=0; dur=d; ultima=e; }
      function pintarAte(){ for(var i=0;i<tracos.length;i++){ var t=tracos[i], v=cl(feito-t.ini,0,t.l); if(v===t.v) continue; t.v=v; t.el.style.opacity=v>.3?1:0; t.el.style.strokeDasharray=f2(v)+' '+f2(t.l+10); } }
      return {ator:ator,acabar:function(){ fim=true; },pronto:function(){ return est==='fim'&&tEst>1.15; },passo:function(dt,t,prog){
        tEst+=dt; var alvo=(fim?1:prog)*total, falta=alvo-feito, pt;
        if(est==='entrar'){ ator.ir(110,CHAO-6,0); ator.olharVoce(); ator.braco('d',-30,1); ator.braco('e',20,1); if(tEst>dur){ ator.cara('feliz',.6); ator.pulo(70); mudar('olhar',.5); } }
        else if(est==='pintar'){
          if(falta<=.5){ parado+=dt; if(parado>.3||fim){ parado=0; mudar(fim?'fim':sorteio(o.pausas,ultima),rnd(1.1,2)); } }
          else{
            parado=0; pt=ponto(feito);
            if(o.molhar&&pt.i!==cor){ cor=pt.i; mudar('molhar',.95); }
            else{
              var vel=(o.vel||110)*(1+Math.min(5,falta/total*9))*(fim?3:1);
              feito=Math.min(alvo,feito+vel*dt); pt=ponto(feito);
              var P=[pt.p[0],pt.p[1]+Math.sin(t*17)*.9];
              ator.ir(P[0]-74,P[1]+42,cl((P[0]-232)/22,-4,4)); ator.alcancar('d',P,o.L,1.45); ator.olhar(P);
              ator.c.cab.a=3+Math.sin(t*1.3)*2; ator.braco('e',o.braE||16,1);
            }
          }
        }
        else if(est==='molhar'){
          /* molha o pincel na paleta da mesinha, com duas voltinhas */
          ator.ir(94,CHAO-12,-3); ator.braco('e',26,1);
          var dip=o.paleta, a=tEst*11; ator.alcancar('d',[dip[0]+Math.cos(a)*2.6,dip[1]-1+Math.sin(a)*1.6],o.L,1.4); ator.olhar(dip); ator.c.cab.a=6;
          if(tEst>dur*.55&&tinta&&tracos[cor]) tinta.setAttribute('fill',tracos[cor].cor);
          if(tEst>dur) mudar('pintar',0);
        }
        else if(est==='admirar'||est==='reler'){
          /* dá um passo para trás e olha a obra, inclinando a cabeça */
          ator.ir(86,CHAO,-3); ator.braco('d',est==='admirar'?-128:-40,.95); ator.braco('e',est==='admirar'?34:-30,1); ator.olhar(centro);
          ator.c.cab.a=tEst<dur*.45?-9:6;
          if(est==='reler') ator.c.oy.a=-1+Math.sin(tEst*5)*2.2;
          if(tEst>dur*.55&&ator.humor==='manual'&&!ator.humorAte) ator.cara('feliz',.7);
          if(tEst>dur) mudar('pintar',0);
        }
        else if(est==='medir'){
          /* o clássico pintor medindo com o pincel, um olho fechado */
          ator.ir(116,CHAO-4,0); ator.braco('d',-86,1.25); ator.braco('e',18,1); ator.olhar(centro); ator.fecharE=tEst>.2&&tEst<dur-.15?1:0; ator.c.cab.a=4;
          if(tEst>dur){ ator.fecharE=0; mudar('pintar',0); }
        }
        else if(est==='pensar'){
          /* bate a caneta no queixo, olhando para cima */
          ator.ir(104,CHAO-2,2); ator.braco('d',-158+Math.sin(tEst*9)*8,.82); ator.c.ox.a=4; ator.c.oy.a=-4; ator.c.cab.a=8;
          if(tEst>dur) mudar('pintar',0);
        }
        else if(est==='olhar'){
          ator.ir(112,CHAO-4,0); ator.olharVoce(); ator.braco('d',-24,1); ator.braco('e',14,1); ator.c.cab.a=-4;
          if(tEst>dur) mudar('pintar',0);
        }
        else if(est==='fim'){
          ator.ir(92,CHAO,0); ator.braco('d',-150,1); ator.braco('e',150,1); ator.olhar(centro);
          if(tEst<dt*1.5){ ator.cara('comemorando'); ator.pulo(150); okM.a=1; }
          if(tEst>.7&&tEst<.7+dt*1.5) ator.pulo(110);
        }
        if(ok){ okM.passo(dt); ok.setAttribute('transform','translate('+o.ok[0]+' '+o.ok[1]+') scale('+f2(Math.max(0,okM.x))+')'); }
        if(falta>.5&&est!=='pintar'&&est!=='molhar'&&est!=='entrar'&&tEst>.55&&!fim&&est!=='fim') mudar('pintar',0);
        pintarAte(); ator.passo(dt,t);
      }};
    }};
  }

  /* ---- 2a'. ARTE: o Dex pinta um quadro de verdade, em etapas que seguem a porcentagem ----
     esboço a lápis → preenche céu, sol e montanhas com pinceladas largas → detalhes com o pincel fino
     → assinatura → brilho final. Troca de ferramenta, molha o pincel, respinga tinta, para e admira. */
  function espiral(cx,cy,r,v){ var d='M'+cx+' '+cy, n=v*28; for(var i=1;i<=n;i++){ var a=i/28*Math.PI*2, rr=r*i/n; d+='L'+f2(cx+Math.cos(a)*rr)+' '+f2(cy+Math.sin(a)*rr); } return d; }
  function zigue(x0,x1,y0,y1,passo){ var d='M'+x0+' '+y0, y=y0, ida=true; while(y<=y1){ d+='H'+(ida?x1:x0); y+=passo; if(y<=y1) d+='V'+y; ida=!ida; } return d; }
  var MORRO1='C196 57 211 59 226 67C238 74 252 57 288 64', MORRO2='C203 76 229 85 249 78C262 74 276 80 288 77';
  var OBRA=[
    {f:'lapis',e:'Esboçando',w:.035,cor:'#8D939C',sw:1.3,d:'M180 72'+MORRO1},
    {f:'lapis',e:'Esboçando',w:.03,cor:'#8D939C',sw:1.3,d:'M180 86'+MORRO2},
    {f:'lapis',e:'Esboçando',w:.025,cor:'#8D939C',sw:1.3,d:'M266 41a9 9 0 1 1 -.1 -1.5'},
    {f:'lapis',e:'Esboçando',w:.03,cor:'#8D939C',sw:1.3,d:'M206 94V78M199 81L206 68L213 81Z'},
    {f:'pincel',e:'Pintando o céu',w:.17,cor:'#A9C1D9',sw:9,d:zigue(180,286,25,67,7)},
    {f:'pincel',e:'Pintando o sol',w:.06,cor:'#E3C48D',sw:3.6,d:espiral(257,41,9,3)},
    {f:'pincel',e:'Pintando as montanhas',w:.14,cor:'#4A6890',sw:9,clip:'dxM1',d:zigue(180,286,58,94,7)},
    {f:'pincel',e:'Pintando o campo',w:.13,cor:'#6F9786',sw:9,clip:'dxM2',d:zigue(180,286,73,103,7)},
    {f:'fino',e:'Detalhes',w:.03,cor:'#3A3F47',sw:3,d:'M206 94V77'},
    {f:'fino',e:'Detalhes',w:.06,cor:'#3F6B5B',pontos:[[206,71],[201,75],[211,75],[204,79],[209,79],[206,66],[200,70],[212,70]],r:3.4},
    {f:'fino',e:'Detalhes',w:.04,cor:'#2B2F36',sw:1.6,d:'M226 34q3.5 -3.5 7 0q3.5 -3.5 7 0M240 46q2.5 -2.5 5 0q2.5 -2.5 5 0'},
    {f:'fino',e:'Detalhes',w:.05,cor:'#E8D9B5',pontos:[[190,96],[222,99],[238,94],[262,98],[276,92],[198,90]],r:1.8},
    {f:'fino',e:'Assinando',w:.05,cor:'#2B2F36',sw:1.4,d:'M262 99c2 -5 4 -5 3 0s3 -5 5 -1c1 2 2 2 4 -1c1 -1 2 0 3 1'},
    {f:'verniz',e:'Dando o brilho final',w:.09}];
  var FERR={lapis:{L:70,svg:'<g class="dx-f-lapis"><rect x="121.5" y="126" width="6" height="34" rx="1.5" fill="#D7D2C4" stroke="#8E8676" stroke-width="1"/><path d="M121.5 160L124.5 172L127.5 160Z" fill="#E9DCC0"/><path d="M123.3 167.2L124.5 172L125.7 167.2Z" fill="#3A3F47"/></g>'},
    pincel:{L:88,svg:'<g class="dx-f-pincel"><rect x="121.5" y="126" width="6" height="40" rx="3" fill="#30343B"/><rect x="120.5" y="163" width="8" height="7" rx="1" fill="#B9BEC6"/><path class="dx-tinta" d="M120.5 170Q124.5 194 128.5 170Z" fill="#A9C1D9"/></g>'},
    fino:{L:84,svg:'<g class="dx-f-fino"><rect x="122.5" y="126" width="4" height="42" rx="2" fill="#5A4636"/><rect x="122" y="166" width="5" height="6" rx="1" fill="#B9BEC6"/><path class="dx-tinta" d="M122 172Q124.5 188 127 172Z" fill="#3A3F47"/></g>'},
    verniz:{L:84,svg:''}};
  function cenaArte(){
    var CL='<defs><clipPath id="dxTela"><rect x="178" y="22" width="110" height="82" rx="2"/></clipPath>'+
      '<clipPath id="dxM1"><path d="M178 104V72'+MORRO1+'V104Z"/></clipPath><clipPath id="dxM2"><path d="M178 104V86'+MORRO2+'V104Z"/></clipPath>'+
      '<linearGradient id="dxBrilho" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
    var itens=OBRA.map(function(o,i){
      if(o.pontos) return '<g data-i="'+i+'">'+o.pontos.map(function(p){ return '<circle class="dx-dab" cx="'+p[0]+'" cy="'+p[1]+'" r="'+o.r+'" fill="'+o.cor+'" transform="scale(0)"/>'; }).join('')+'</g>';
      if(!o.d) return '';
      var t='<path class="dx-traco" data-i="'+i+'" stroke="'+o.cor+'" stroke-width="'+o.sw+'" d="'+o.d+'"'+(o.f==='lapis'?' stroke-dasharray="0 9999" opacity=".9"':'')+'/>';
      return o.clip?'<g clip-path="url(#'+o.clip+')">'+t+'</g>':t; }).join('');
    var fundo=CL+'<g class="dx-cavalete"><path d="M233 22L206 '+CHAO+'M233 22L260 '+CHAO+'" class="dx-madeira"/><path d="M233 14V'+CHAO+'" class="dx-madeira" opacity=".55"/>'+
      '<g class="dx-quadro-g"><rect x="174" y="18" width="118" height="90" rx="4" class="dx-tela"/><g clip-path="url(#dxTela)">'+itens+
      '<rect class="dx-verniz" x="150" y="18" width="40" height="90" fill="url(#dxBrilho)" opacity="0"/></g>'+
      '<rect class="dx-moldura" x="171" y="15" width="124" height="96" rx="5" fill="none" stroke="#B59A6E" stroke-width="5" opacity="0"/></g>'+
      '<rect x="168" y="106" width="130" height="5" rx="2.5" class="dx-madeira-p"/></g>'+
      '<path d="M151 '+CHAO+'V136M141 '+CHAO+'L151 140L161 '+CHAO+'" class="dx-madeira" style="stroke-width:3"/>'+
      '<path d="M134 132C134 126 142 123 152 123C163 123 169 127 168 132C167 137 160 139 151 139C145 139 146 135 141 136C136 137 134 135 134 132Z" fill="#EDE7DC" stroke="#9A8B73" stroke-width="1.8"/>'+
      ['#A9C1D9','#E3C48D','#4A6890','#6F9786','#3F6B5B'].map(function(c,i){ return '<circle class="dx-pal" cx="'+[142,148,155,161,153][i]+'" cy="'+[130,126,126,130,134][i]+'" r="2.6" fill="'+c+'"/>'; }).join('');
    return {html:base(fundo),iniciar:function(svg){
      var ator=new Ator(svg,.5,92,CHAO), part=new Particulas(svg,CHAO), PAL=[150,129];
      var tools={}; Object.keys(FERR).forEach(function(k){ if(FERR[k].svg){ tools[k]=naMao(ator,'d',FERR[k].svg).firstChild; tools[k].style.display='none'; } });
      var tinta=null, ferr='lapis', ferrM=new Mola(1,260,.5), quadroM=new Mola(0,240,.3), molM=new Mola(0,90,.75), verniz=svg.querySelector('.dx-verniz'), moldura=svg.querySelector('.dx-moldura'), quadroG=svg.querySelector('.dx-quadro-g');
      /* medidas de cada traço e de cada ponto */
      var W=0, its=OBRA.map(function(o,i){ var it={o:o,ini:W,fim:W+o.w,len:0}; W+=o.w;
        if(o.d){ it.el=svg.querySelector('.dx-traco[data-i="'+i+'"]'); it.len=it.el.getTotalLength(); it.el.style.strokeDasharray='0 '+(it.len+20); it.el.style.opacity=0; }
        if(o.pontos){ it.dabs=[].slice.call(svg.querySelectorAll('[data-i="'+i+'"] .dx-dab')).map(function(c){ return {el:c,m:new Mola(0,320,.38),on:false}; }); it.len=o.pontos.length*26; }
        if(o.f==='verniz') it.len=150;
        return it; });
      function itemDe(w){ for(var i=0;i<its.length;i++) if(w<its[i].fim-1e-9) return i; return its.length-1; }
      function mostrarFerr(k){ Object.keys(tools).forEach(function(x){ tools[x].style.display=x===k?'':'none'; }); tinta=tools[k]&&tools[k].querySelector('.dx-tinta'); }
      mostrarFerr('lapis');
      var feito=0, est='entrar', tEst=0, dur=.7, ultima='', cur=-1, parado=0, fim=false, gotaT=0, corTinta='#A9C1D9', alvoF='lapis';
      function mudar(e,d){ est=e; tEst=0; dur=d; if(/^(admirar|medir|assobiar|cocar)$/.test(e)) ultima=e; }
      function pintar(){ its.forEach(function(it){ var k=cl((feito-it.ini)/(it.fim-it.ini),0,1); if(k===it.k) return; it.k=k;
        if(it.el){ var v=k*it.len; it.el.style.opacity=v>.4?1:0; it.el.style.strokeDasharray=f2(v)+' '+f2(it.len+20); }
        if(it.dabs) it.dabs.forEach(function(d,j){ var on=k>=(j+.7)/it.dabs.length; if(on&&!d.on){ d.on=true; d.m.a=1; d.m.v=6; quadroM.v+=.6; var p=it.o.pontos[j]; for(var n=0;n<2;n++) part.soltar('gota',p[0],p[1],{cor:it.o.cor,vx:rnd(-40,10),vy:rnd(-40,-5),r:1.1}); } });
        if(it.o.f==='verniz'){ sA(verniz,'opacity',k>0&&k<1?'.9':'0'); sA(verniz,'x',f2(150+k*150)); } }); }
      function ponto(){ var i=itemDe(feito), it=its[i], k=cl((feito-it.ini)/(it.fim-it.ini),0,1);
        if(it.el){ var p=it.el.getPointAtLength(k*it.len); return {i:i,p:[p.x,p.y]}; }
        if(it.dabs){ var n=it.dabs.length, j=Math.min(n-1,Math.floor(k*n)), fr=k*n-j, pp=it.o.pontos[j]; return {i:i,p:[pp[0]-Math.sin(fr*Math.PI)*7,pp[1]-Math.sin(fr*Math.PI)*3],dab:true}; }
        return {i:i,p:[150+k*150,62],verniz:true}; }
      return {ator:ator,acabar:function(){ fim=true; },pronto:function(){ return est==='fim'&&tEst>1.6; },
        etapa:function(){ return est==='fim'?'Obra pronta!':(its[Math.max(0,cur)]||its[0]).o.e; },
        passo:function(dt,t,prog){
        tEst+=dt; var alvo=fim?1:Math.min(prog,1), falta=alvo-feito, pt;
        if(est==='entrar'){ ator.ir(100,CHAO-4,0); ator.olharVoce(); ator.braco('d',-30); ator.braco('e',18); if(tEst>dur){ ator.cara('feliz',.6); ator.pulo(80); cur=0; mudar('olhar',.45); } }
        else if(est==='trabalhar'){
          if(falta<=1e-4){ parado+=dt; ator.braco('e',16+Math.sin(t*2)*4); if(parado>.35&&!fim){ parado=0; mudar(sorteio([['admirar',3],['medir',2],['assobiar',2],['cocar',1.4]],ultima),rnd(1.1,1.9)); } else if(fim&&feito>=.9999) mudar('fim',3); }
          else{
            parado=0; var i=itemDe(feito), it=its[i];
            if(i!==cur){ var ant=its[cur]; cur=i;
              var pressa=falta>.12||fim; if(!ant||ant.o.f!==it.o.f){ alvoF=it.o.f; mudar('trocar',pressa?.26:.42); }
              else if(it.o.f!=='lapis'&&ant.o.cor!==it.o.cor){ mudar('molhar',pressa?.38:.8); } }
            else{
              var vel=150*(1+Math.min(12,falta*30))*(fim?3:1), len=Math.max(30,it.len);
              feito=Math.min(alvo,feito+vel*dt/len*(it.fim-it.ini)); pt=ponto();
              var P=pt.p, fino=it.o.f!=='pincel';
              if(pt.verniz){ ator.ir(P[0]-60,74,0); ator.alcancar('d',[P[0],P[1]+Math.sin(t*8)*18],80,1.5); ator.olhar(P); }
              else{ ator.ir(P[0]-74,P[1]+42,cl((P[0]-232)/22,-4,4)); ator.alcancar('d',[P[0],P[1]+(fino?0:Math.sin(t*15)*.8)],FERR[it.o.f].L,1.5); ator.olhar(P); }
              ator.c.cab.a=3+Math.sin(t*1.6)*2.5; ator.braco('e',16+Math.sin(t*3.1)*6);
              if(ator.humor==='manual'&&Math.random()<dt*.25) ator.cara('surpresa',.6);
              /* respingos de tinta enquanto pinta com o pincel largo */
              gotaT-=dt; if(it.o.f==='pincel'&&gotaT<=0){ gotaT=rnd(.08,.22); if(Math.random()<.45){ var tp=ator.ponta('d',FERR.pincel.L); part.soltar('gota',tp[0],tp[1],{cor:it.o.cor,vx:rnd(-50,35),vy:rnd(-70,-10)}); } }
              if(it.o.f==='lapis'&&Math.random()<dt*6){ var lp=ator.ponta('d',FERR.lapis.L); part.soltar('poeira',lp[0],lp[1],{cor:'#8D939C',r:.7,vx:rnd(-8,8),vy:rnd(4,14),vida:.6}); }
              quadroM.a=fino?0:Math.sin(t*15)*.35;
            }
          }
        }
        else if(est==='trocar'){
          /* abaixa a mão, a ferramenta some e a nova aparece girando */
          ator.braco('d',tEst<dur*.5?40:-60,1); ator.olhar(ator.ponta('d',60)); ator.ir(110,CHAO-6,0);
          if(tEst>dur*.4&&ferr!==alvoF){ ferr=alvoF; if(tools[ferr]) mostrarFerr(ferr); ferrM.x=0; ferrM.v=9; ator.cara('feliz',.5);
            if(tinta) tinta.setAttribute('fill',its[cur].o.cor||'#A9C1D9'); }
          if(tEst>dur) mudar(ferr==='pincel'?'molhar':'trabalhar',ferr==='pincel'?(falta>.12||fim?.38:.8):0);
        }
        else if(est==='molhar'){
          ator.ir(94,CHAO-12,-3); ator.braco('e',26);
          var a=tEst*12; ator.alcancar('d',[PAL[0]+Math.cos(a)*3,PAL[1]-1+Math.sin(a)*1.8],FERR[ferr].L||88,1.4); ator.olhar(PAL); ator.c.cab.a=6;
          if(tEst>dur*.5&&tinta){ corTinta=its[cur].o.cor; tinta.setAttribute('fill',corTinta); }
          if(tEst>dur) mudar('trabalhar',0);
        }
        else if(est==='admirar'){ ator.ir(84,CHAO,-3); ator.braco('d',-128,.95); ator.braco('e',34); ator.olhar([233,62]); ator.c.cab.a=tEst<dur*.45?-9:6;
          if(tEst>dur*.55&&ator.humor==='manual'&&!ator.humorAte) ator.cara('feliz',.7); if(tEst>dur) mudar('trabalhar',0); }
        else if(est==='medir'){ ator.ir(114,CHAO-4,0); ator.braco('d',-86,1.25); ator.braco('e',18); ator.olhar([233,62]); ator.fecharE=tEst>.2&&tEst<dur-.15?1:0; ator.c.cab.a=4; if(tEst>dur){ ator.fecharE=0; mudar('trabalhar',0); } }
        else if(est==='assobiar'){ ator.ir(104,CHAO-3,0); ator.braco('d',-20+Math.sin(tEst*5)*12); ator.braco('e',20-Math.sin(tEst*5)*12); ator.c.cab.a=Math.sin(tEst*5)*7; ator.olharVoce();
          if(Math.random()<dt*2.6) part.soltar('nota',ator.c.x.x+8,ator.Y-70,{vx:rnd(6,18),vy:-28,vida:1.4}); if(tEst>dur) mudar('trabalhar',0); }
        else if(est==='cocar'){ ator.ir(100,CHAO-2,2); ator.braco('e',160+Math.sin(tEst*16)*10,.86); ator.c.ox.a=3; ator.c.oy.a=-3; ator.c.cab.a=-8; if(tEst>dur) mudar('trabalhar',0); }
        else if(est==='olhar'){ ator.ir(102,CHAO-4,0); ator.olhar([233,62]); ator.braco('d',-40); if(tEst>dur) mudar('trabalhar',0); }
        else if(est==='fim'){
          /* moldura, brilhos e palmas */
          ator.ir(84,CHAO,0); ator.olhar([233,62]);
          if(tEst<dt*1.5){ molM.a=1; ator.cara('comemorando'); ator.pulo(150); quadroM.v+=4; for(var n=0;n<8;n++) part.soltar('brilho',[176,290,176,290,233,233,170,296][n],[20,20,104,104,14,110,62,62][n],{vx:0,vy:0,s:rnd(.9,1.5),vida:rnd(.6,1)}); }
          var palma=Math.sin(tEst*14)>0; ator.braco('d',palma?-60:-30); ator.braco('e',palma?60:30);
          if(tEst>.9&&tEst<.9+dt*1.5){ ator.pulo(110); part.soltar('nota',ator.c.x.x,ator.Y-80,{vy:-30}); }
        }
        if(falta>1e-4&&/^(admirar|medir|assobiar|cocar)$/.test(est)&&tEst>.5) mudar('trabalhar',0);
        if(fim&&/^(admirar|medir|assobiar|cocar)$/.test(est)) mudar('trabalhar',0);
        ferrM.passo(dt); quadroM.passo(dt); molM.passo(dt);
        if(tools[ferr]) sA(tools[ferr],'transform','translate(124.5 130) rotate('+f2((1-cl(ferrM.x,0,1.2))*-200)+') scale('+f2(cl(ferrM.x,0,1.3))+') translate(-124.5 -130)');
        sA(quadroG,'transform','rotate('+f2(quadroM.x)+' 233 108)');
        sA(moldura,'opacity',f2(cl(molM.x,0,1))); sA(moldura,'transform','translate(233 61) scale('+f2(1.25-.25*cl(molM.x,0,1.1))+') translate(-233 -61)');
        its.forEach(function(it){ if(it.dabs) it.dabs.forEach(function(d,j){ if(!d.on&&d.m.x===0) return; d.m.passo(dt); var p=it.o.pontos[j]; d.el.setAttribute('transform','translate('+p[0]+' '+p[1]+') scale('+f2(Math.max(0,d.m.x))+') translate('+(-p[0])+' '+(-p[1])+')'); }); });
        pintar(); part.passo(dt); ator.passo(dt,t);
      }};
    }};
  }
  /* geral: o Dex escreve um relatório, linha por linha, e confere */
  function cenaGeral(){
    var linhas='', L=[[190,34,272],[190,46,262],[190,58,276],[190,70,250],[190,82,268],[190,94,236]];
    L.forEach(function(l){ linhas+='<path d="M'+l[0]+' '+l[1]+'H'+l[2]+'" class="dx-linha-c"/>'; });
    var tinta=L.map(function(l){ return 'M'+l[0]+' '+l[1]+'H'+l[2]; }).join('');
    var fundo='<rect x="176" y="10" width="110" height="102" rx="6" class="dx-prancheta"/><rect x="183" y="20" width="96" height="88" rx="2" class="dx-folha-p"/>'+
      '<rect x="212" y="5" width="38" height="11" rx="3" class="dx-clipe"/>'+linhas+
      '<path class="dx-traco" data-cor="#2B2F36" stroke="#2B2F36" stroke-width="3" d="'+tinta+'"/>'+
      '<g class="dx-ok" transform="scale(0)"><circle r="10" class="dx-ok-c"/><path d="M-4.5 .5l3 3 6-6.5" class="dx-ok-v"/></g>';
    return cenaQuadro({fundo:fundo,centro:[231,60],ok:[283,12],L:80,vel:120,braE:-18,
      pausas:[['reler',3],['pensar',2],['olhar',1]],
      ferramenta:'<rect x="121.5" y="128" width="6" height="34" rx="3" fill="#30343B"/><path d="M121.5 162L124.5 172L127.5 162Z" fill="#B9BEC6"/><circle cx="124.5" cy="171" r="1.2" fill="#2B2F36"/>'});
  }

  /* ---- 2b. ZIP: o Dex pega papéis da pilha e coloca no envelope amarelo ---- */
  function cenaZip(){
    var pilha=''; for(var i=0;i<12;i++) pilha+='<rect class="dx-folha-z" x="'+(34+(i%3)*.8)+'" y="'+(150-i*2.6)+'" width="40" height="8" rx="1.5"/>';
    var fundo='<g class="dx-pilha">'+pilha+'</g>'+
      '<g class="dx-env"><rect x="218" y="104" width="80" height="52" rx="4" class="dx-env-fundo"/>'+
      '<g class="dx-env-dentro"></g><rect class="dx-env-cheio" x="226" y="118" width="64" height="36" rx="2"/>'+
      '<path class="dx-env-frente" d="M218 112L258 136L298 112V152Q298 156 294 156H222Q218 156 218 152Z"/>'+
      '<path d="M218 154L246 132M298 154L270 132" class="dx-env-dobra"/>'+
      '<text class="dx-env-n" x="258" y="151">0</text>'+
      '<g class="dx-carimbo-g" opacity="0"><g transform="rotate(-10 281 143)"><rect x="270" y="137" width="22" height="12" rx="2" class="dx-carimbo"/><text class="dx-carimbo-t" x="281" y="145.6">AKI</text></g></g>'+
      '<path class="dx-env-aba" d="M218 104L258 131L298 104Z"/>'+
      '<g class="dx-selo" transform="scale(0)"><circle r="9.5" class="dx-ok-c"/><path d="M-4.2 .5l2.8 2.8 5.6-6" class="dx-ok-v"/></g></g>';
    var frente='<g class="dx-voo"></g>';
    return {html:base(fundo,frente),iniciar:function(svg){
      var ator=new Ator(svg,.5,150,CHAO), part=new Particulas(svg,CHAO), real=0, numTxt=svg.querySelector('.dx-env-n'), carimbo=svg.querySelector('.dx-carimbo-g'), carM=new Mola(0,260,.4), vooM={x:0,y:0,r:0,t:-1}, carimbou=false;
      var papelMao=naMao(ator,'e','<g class="dx-papel-mao" opacity="0"><rect x="22" y="138" width="24" height="30" rx="2" class="dx-papel"/><path d="M27 146H41M27 151H41M27 156H37" class="dx-papel-l"/></g>').firstChild;
      var env=svg.querySelector('.dx-env'), aba=svg.querySelector('.dx-env-aba'), cheio=svg.querySelector('.dx-env-cheio'), selo=svg.querySelector('.dx-selo'), voo=svg.querySelector('.dx-voo');
      var folhas=[].slice.call(svg.querySelectorAll('.dx-folha-z')), pilhaG=svg.querySelector('.dx-pilha');
      var envM=new Mola(0,220,.32), abaM=new Mola(-1,120,.5), seloM=new Mola(0,200,.45), pilhaM=new Mola(0,300,.3), cheioM=new Mola(0,90,.8);
      var N=8, pegos=0, entregues=0, est='entrar', tEst=0, dur=.5, ultima='', voando=[], seq=0, fim=false, fechado=false, modo='';
      function mudar(e,d){ est=e; tEst=0; dur=d; if(/^(esperar|espiar|arrumar)$/.test(e)) ultima=e; }
      function lancar(P0,P1,T,giro){
        var g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.innerHTML='<rect x="-9" y="-11.5" width="18" height="23" rx="2" class="dx-papel"/><path d="M-5 -5H5M-5 -1H5M-5 3H2" class="dx-papel-l"/>';
        voo.appendChild(g); var G=420;
        voando.push({g:g,x:P0[0],y:P0[1],vx:(P1[0]-P0[0])/T,vy:(P1[1]-P0[1])/T-G*T/2,G:G,t:0,T:T,giro:giro,r:rnd(-20,20),alvo:P1,dentro:false,fase:rnd(0,3),vf:rnd(7,13)});
      }
      var SLOT=[258,112];
      return {ator:ator,total:function(n){ N=cl(n||8,3,12); real=n||0; },acabar:function(){ fim=true; },pronto:function(){ return est==='enviar'&&tEst>1.15; },
        etapa:function(){ return est==='enviar'?'Enviado!':fechado?(fim?'Envelope fechado':'Compactando o arquivo'):pegos?'Colocando no envelope':'Separando as artes'; },
        passo:function(dt,t,prog,fechando){
        tEst+=dt; var devidos=Math.floor(cl(prog/.9,0,1)*N+1e-6), atraso=devidos-pegos, vel=fim?2.6:atraso>=3?1.9:atraso>=2?1.4:1;
        var topo=150-(N-pegos-1)*2.6;
        if(est==='entrar'){ ator.ir(150,CHAO-6,0); ator.olharVoce(); ator.braco('d',-24); ator.braco('e',24); if(tEst>dur){ ator.cara('feliz',.5); ator.pulo(60); mudar('esperar',.4); } }
        else if(est==='pegar'){
          ator.ir(104,CHAO-4,-9); ator.alcancar('e',[56+Math.sin(seq)*4,topo-2],40,1.3); ator.olhar([54,topo]); ator.braco('d',-14);
          if(tEst>dur){ pegos++; papelMao.setAttribute('opacity','1'); pilhaM.v-=6; seq++; part.soltar('poeira',54+rnd(-10,10),topo,{vx:rnd(-20,20),vy:rnd(-12,-4),vida:.5});
            modo=(atraso>=2||Math.random()<.62)?'mirar':'levar'; mudar(modo,(modo==='mirar'?.38:.75)/vel); }
        }
        else if(est==='mirar'){ ator.ir(142,CHAO-6,6); ator.braco('e',74,1); ator.olhar(SLOT); ator.c.cab.a=-4; if(tEst>dur) mudar('jogar',.24/vel); }
        else if(est==='jogar'){
          ator.braco('e',-118,1.05); ator.c.r.a=-4;
          if(tEst>dur*.42&&papelMao.getAttribute('opacity')==='1'){ papelMao.setAttribute('opacity','0'); lancar(ator.ponta('e',48),[SLOT[0]+rnd(-7,7),SLOT[1]],rnd(.5,.68)/Math.sqrt(vel),rnd(-560,560)); }
          if(tEst>dur) mudar('acompanhar',.42/vel);
        }
        else if(est==='acompanhar'){ var v=voando[voando.length-1]; ator.olhar(v?[v.x,v.y]:SLOT); ator.braco('e',12); ator.c.cab.a=v?cl((v.x-150)/14,-6,8):0; if(tEst>dur) proximo(); }
        else if(est==='levar'){ ator.ir(236,96,4); ator.alcancar('e',[SLOT[0],SLOT[1]-14],40,1.3); ator.olhar(SLOT); if(tEst>dur) mudar('soltar',.32); }
        else if(est==='soltar'){
          if(papelMao.getAttribute('opacity')==='1'){ papelMao.setAttribute('opacity','0'); var P=ator.ponta('e',48); lancar(P,[SLOT[0],SLOT[1]+2],.28,rnd(-60,60)); }
          ator.braco('e',30); ator.olhar(SLOT); if(tEst>dur){ ator.cara('feliz',.5); mudar('voltar',.45); }
        }
        else if(est==='voltar'){ ator.ir(150,CHAO-6,0); ator.braco('e',16); ator.olharVoce(); if(tEst>dur) proximo(); }
        else if(est==='esperar'){ ator.ir(152,CHAO-4,0); ator.olharVoce(); ator.braco('d',-20+Math.sin(t*2)*4); ator.braco('e',20); ator.c.cab.a=Math.sin(tEst*2.4)*5; if(tEst>dur) proximo(); }
        else if(est==='espiar'){
          ator.ir(206,CHAO-34,14); ator.olhar([258,140]); ator.braco('d',-36); ator.braco('e',-10);
          if(tEst>dur*.4&&ator.humor==='manual'&&!ator.humorAte) ator.cara('surpresa',.5);
          if(tEst>dur) proximo();
        }
        else if(est==='arrumar'){
          ator.ir(100,CHAO-2,-6); var bat=Math.sin(tEst*12)>0; ator.alcancar('e',[56,topo+(bat?-6:0)],40,1.3); ator.olhar([54,topo]);
          if(bat&&!this._b){ pilhaM.v-=3; } this._b=bat; if(tEst>dur) proximo();
        }
        else if(est==='fechar'){
          /* aperta o envelope, a aba fecha e o selo aparece */
          ator.ir(258,CHAO-58,0); ator.alcancar('d',[268,104],40,1.3); ator.alcancar('e',[248,104],40,1.3); ator.olhar([258,120]);
          if(tEst>.25&&abaM.a<0){ abaM.a=1; envM.v+=3; ator.c.sq.v-=2; }
          if(tEst>.6&&seloM.a===0){ seloM.a=1; ator.cara('feliz',.8); }
          if(tEst>dur){ fechado=true; ator.pulo(90); for(var b=0;b<5;b++) part.soltar('brilho',258+rnd(-30,30),rnd(100,140),{vx:0,vy:-10,s:rnd(.8,1.3)}); mudar('festa',.9); }
        }
        else if(est==='festa'){ ator.ir(168,CHAO-6,0); ator.braco('d',-150); ator.braco('e',150); ator.olharVoce(); if(tEst<dt*1.5) ator.cara('comemorando'); if(tEst>.45&&tEst<.45+dt*1.5) ator.pulo(120); if(tEst>dur) proximo(); }
        else if(est==='carimbar'){
          /* enquanto o arquivo compacta: carimba o envelope, com força */
          var desce=tEst>dur*.45; ator.ir(232,CHAO-44,desce?4:-4); ator.alcancar('d',desce?[281,140]:[276,96],40,1.4); ator.olhar([281,143]); ator.braco('e',30);
          if(desce&&!this._c){ this._c=true; envM.v+=2.4; ator.c.sq.v-=1.6; carM.a=1; if(!carimbou){ carimbou=true; carM.x=1.6; } for(var q=0;q<3;q++) part.soltar('poeira',281+rnd(-8,8),146,{vx:rnd(-30,30),vy:rnd(-14,-4),vida:.45,cor:'#E2C15E'}); }
          if(tEst>dur){ this._c=false; proximo(); }
        }
        else if(est==='enviar'){
          /* o envelope sai voando, e ele acena */
          ator.ir(150,CHAO-8,0); ator.braco('d',-150+Math.sin(tEst*12)*22,1); ator.braco('e',20); ator.olhar([258+vooM.x,120+vooM.y]);
          if(tEst<dt*1.5){ ator.cara('feliz',1.4); vooM.t=0; }
          var k=cl(tEst/1.05,0,1), e=k*k*(3-2*k); vooM.x=e*260; vooM.y=-Math.sin(k*Math.PI)*36-e*30; vooM.r=e*24;
          if(Math.random()<dt*14) part.soltar('brilho',258+vooM.x-24,130+vooM.y,{vx:-20,vy:0,s:.7,vida:.5});
        }
        function proximo(){
          if(pegos<devidos) mudar('pegar',.42/vel);
          else if((fechando||fim||prog>=.9)&&pegos>=N&&!voando.length&&!fechado) mudar('fechar',1.05);
          else if(fechado&&fim) mudar('enviar',1.3);
          else if(fechado) mudar(Math.random()<.65?'carimbar':'esperar',rnd(.8,1.2));
          else mudar(sorteio([['esperar',3],['espiar',2],['arrumar',1.5]],ultima),rnd(1.1,1.9));
        }
        if(pegos<devidos&&/^(esperar|espiar|arrumar)$/.test(est)&&tEst>.35) proximo();
        if(fim&&est==='esperar'&&(pegos<N||fechado)) proximo();
        /* papéis no ar: arco de verdade, girando, e entram atrás da frente do envelope */
        for(var i=voando.length-1;i>=0;i--){
          var p=voando[i]; p.t+=dt;
          if(!p.dentro){ p.vy+=p.G*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.r+=p.giro*dt;
            if(p.t>=p.T){ p.dentro=true; p.t=0; p.x=p.alvo[0]; p.y=p.alvo[1]; p.r=0; svg.querySelector('.dx-env-dentro').appendChild(p.g); envM.v+=2.2; entregues++; cheioM.a=entregues/N; part.soltar('mais',258+rnd(-6,6),102,{vx:0,vy:-34,vida:.9}); if(entregues%3===0&&!/fechar|festa/.test(est)) ator.cara('feliz',.45); } }
          else { p.y+=dt*80; if(p.t>.25){ p.g.remove(); voando.splice(i,1); continue; } }
          /* o papel vira no ar (achata e abre, como uma folha girando) */
          p.fase+=dt*p.vf; var sx=p.dentro?.9:Math.max(.22,Math.abs(Math.cos(p.fase)))*.85;
          p.g.setAttribute('transform','translate('+f2(p.x)+' '+f2(p.y)+') rotate('+f2(p.r)+') scale('+f2(sx)+' '+(p.dentro?.9:.85)+')');
        }
        envM.passo(dt); abaM.passo(dt); seloM.passo(dt); pilhaM.passo(dt); cheioM.passo(dt);
        sA(env,'transform','translate('+f2(vooM.x)+' '+f2(vooM.y)+') rotate('+f2(vooM.r)+' 258 130) translate(258 156) scale('+f2(1+envM.x*.05)+' '+f2(1-envM.x*.06)+') translate(-258 -156)');
        var n=real?Math.round(entregues/N*real):entregues; if(String(n)!==numTxt.textContent) numTxt.textContent=String(n);
        carM.passo(dt); sA(carimbo,'opacity',f2(cl(carM.x,0,1))); sA(carimbo,'transform','translate(281 143) scale('+f2(cl(1+(carM.x-1)*.6,.6,1.6))+') translate(-281 -143)');
        sA(aba,'transform','translate(0 104) scale(1 '+f2(cl(abaM.x,-1.1,1.1))+') translate(0 -104)');
        sA(selo,'transform','translate(258 122) scale('+f2(Math.max(0,seloM.x))+')');
        sA(cheio,'transform','translate(0 154) scale(1 '+f2(cl(cheioM.x,0,1))+') translate(0 -154)');
        for(var j=0;j<folhas.length;j++){ var vis=j<N-pegos; if(folhas[j].__o!==vis){ folhas[j].__o=vis; folhas[j].style.opacity=vis?1:0; } }
        sA(pilhaG,'transform','translate(54 158) scale(1 '+f2(1+pilhaM.x*.02)+') rotate('+f2(pilhaM.x*.6)+') translate(-54 -158)');
        part.passo(dt); ator.passo(dt,t);
      }};
    }};
  }

  /* ---- 2c. FOTO: ele tira a foto, a câmera solta a foto instantânea, ele pega, sacode e ela revela ---- */
  function cenaFoto(){
    var POL='<rect x="-17" y="-4" width="34" height="40" rx="2.5" fill="#FBFBFA" stroke="#C9CED6" stroke-width="1.6"/><rect x="-13" y="0" width="26" height="25" fill="#2A2522"/>'+
      '<g class="dx-revela" opacity="0"><rect x="-13" y="0" width="26" height="25" fill="#9DB8D2"/><circle cx="6" cy="7" r="3.5" fill="#E2C38C"/><path d="M-13 20L-5 11L1 17L5 13L13 21V25H-13Z" fill="#3E5A84"/><path d="M-13 25L-13 22Q0 17 13 23V25Z" fill="#6F9786"/></g>'+
      '<rect class="dx-sepia" x="-13" y="0" width="26" height="25" fill="#6B5843" opacity=".55"/>';
    var fundo='<g class="dx-camera"><path d="M46 158L52 136L58 158" class="dx-madeira"/><g class="dx-cam-corpo"><rect x="34" y="114" width="36" height="24" rx="5" class="dx-cam"/><rect x="58" y="109" width="9" height="6" rx="2" class="dx-cam"/>'+
      '<circle cx="52" cy="125" r="8" class="dx-cam-l"/><circle cx="49.5" cy="122.5" r="2" fill="#fff" opacity=".5"/><rect class="dx-cam-luz" x="38" y="117" width="5" height="3" rx="1" fill="#E2C38C"/></g></g>'+
      '<g class="dx-pol-solta" opacity="0">'+POL+'</g>'+
      '<circle class="dx-flash" cx="52" cy="125" r="34"/>';
    return {html:base(fundo),iniciar:function(svg){
      var ator=new Ator(svg,.6,104,CHAO), part=new Particulas(svg,CHAO);
      var foto=naMao(ator,'e','<g class="dx-polaroid" opacity="0">'+POL+'</g>').firstChild;
      var solta=svg.querySelector('.dx-pol-solta'), cam=svg.querySelector('.dx-cam-corpo'), flash=svg.querySelector('.dx-flash'), revs=[].slice.call(svg.querySelectorAll('.dx-revela')), seps=[].slice.call(svg.querySelectorAll('.dx-sepia'));
      var fl=new Mola(0,50,1), camM=new Mola(0,260,.3), sai=new Mola(0,90,.62), zoom=new Mola(1.5,140,.5), est='mirar', tEst=0, fim=false, mostra=0, pegou=false;
      function mudar(e){ est=e; tEst=0; }
      return {ator:ator,acabar:function(){ fim=true; },pronto:function(){ return est==='mostrar'&&tEst>.55; },
        etapa:function(){ return est==='mirar'?'Ajeitando a câmera':est==='ejetar'||est==='pegar'?'Saindo a foto':est==='mostrar'?'Prontinha!':'Revelando'; },
        passo:function(dt,t,prog){
        var rap=fim?2.4:1; tEst+=dt*rap; fl.passo(dt); camM.passo(dt); sai.passo(dt); zoom.passo(dt);
        mostra+=(Math.min(1,prog*1.05)-mostra)*Math.min(1,dt*(fim?9:4));
        if(est==='mirar'){ ator.ir(98,CHAO-4,-3); ator.alcancar('e',[63,109],40,1.4); ator.olhar([52,125]); ator.braco('d',-16); ator.fecharE=1; ator.c.cab.a=-6;
          if(tEst>.32){ ator.fecharE=0; fl.x=1; camM.v-=7; ator.cara('surpresa',.45); ator.pulo(40); mudar('ejetar'); } }
        else if(est==='ejetar'){ ator.ir(104,CHAO-4,0); ator.braco('e',30); ator.olhar([52,150]); sai.a=1; if(tEst>.38) mudar('pegar'); }
        else if(est==='pegar'){ ator.ir(92,CHAO-6,-6); ator.alcancar('e',[52,150],40,1.45); ator.olhar([52,152]);
          if(tEst>.3&&!pegou){ pegou=true; sA(solta,'opacity','0'); sA(foto,'opacity','1'); ator.cara('feliz',.5); }
          if(tEst>.42) mudar('sacudir'); }
        else if(est==='sacudir'){
          /* sacode em rajadas, olha, sacode de novo; poeirinha de movimento */
          var raj=(Math.sin(tEst*2.8)+1)/2, forte=raj>.45, amp=forte?16:2;
          ator.ir(150+Math.sin(tEst*1.3)*8,CHAO-10,Math.sin(t*14)*raj*2.5); ator.braco('e',96+Math.sin(t*21)*amp,1.02); ator.braco('d',-18-Math.sin(t*3)*6);
          var P=ator.ponta('e',56); ator.olhar(P); ator.c.cab.a=forte?Math.sin(t*9)*4:7;
          if(forte&&Math.random()<dt*10) part.soltar('poeira',P[0]+rnd(-10,10),P[1]+rnd(-8,8),{cor:'#C9CED6',r:.9,vx:rnd(-40,40),vy:rnd(-20,20),vida:.35});
          if(!forte&&ator.humor==='manual'&&Math.random()<dt*.8) ator.cara('surpresa',.5);
          if(fim||prog>=.999){ mudar('mostrar'); ator.cara('feliz',1.6); ator.pulo(80); zoom.a=1.85; for(var n=0;n<6;n++) part.soltar('brilho',P[0]+rnd(-22,22),P[1]+rnd(-30,10),{vx:0,vy:-8,s:rnd(.7,1.2),vida:rnd(.5,.9)}); }
        }
        else { ator.ir(150,CHAO-14,0); ator.braco('e',140,1.05); ator.braco('d',-40); ator.olharVoce(); ator.c.cab.a=5; }
        sA(flash,'opacity',f2(cl(fl.x,0,1)*.9)); sA(flash,'transform','translate(52 125) scale('+f2(1+(1-cl(fl.x,0,1))*.8)+') translate(-52 -125)');
        sA(cam,'transform','translate('+f2(camM.x*.6)+' 0) rotate('+f2(camM.x*.8)+' 52 136)');
        if(!pegou){ sA(solta,'opacity',sai.x>.02?'1':'0'); sA(solta,'transform','translate(52 '+f2(128+sai.x*18)+') scale(.9)'); }
        revs.forEach(function(r){ sA(r,'opacity',f2(mostra)); }); seps.forEach(function(r){ sA(r,'opacity',f2(.55*(1-mostra))); });
        /* a foto fica sempre em pé, não importa o ângulo do braço */
        var a=-ator.c.be.x-(ator.rTot||0);
        sA(foto,'transform','translate(35.5 147) scale(1 '+f2(1/ator.c.ke.x)+') rotate('+f2(a)+') scale('+f2(zoom.x)+')');
        part.passo(dt); ator.passo(dt,t);
      }};
    }};
  }

  /* =================================================================== 3. CARTÃO */
  var quadros=0, etTxt='', contTxt='', veu=null, card=null, cena=null, tipo=null, alvo=0, mostrado=0, raf=0, tAbrir=0, aberto=false, fechando=false, comprimindo=false, t0=0, tUlt=0, tAberto=0, pctTxt=-1;
  var TITULO={arte:'Gerando as artes',zip:'Montando o ZIP',foto:'Abrindo a foto',geral:'Trabalhando nisso'};
  var PRONTO={arte:'Artes prontas!',zip:'ZIP pronto!',foto:'Pronto',geral:'Concluído'};
  function limpar(msg){ return String(msg||'').replace(/\s*\d+\s*\/\s*\d+\s*$/,'').replace(/[….]+\s*$/,'').trim(); }
  function contagem(msg){ var m=String(msg||'').match(/(\d+)\s*\/\s*(\d+)\s*$/); return m?[+m[1],+m[2]]:null; }
  function montar(t){
    if(card) card.remove(); if(veu) veu.remove();
    var sc=t==='zip'?cenaZip():t==='arte'?cenaArte():t==='foto'?cenaFoto():cenaGeral();
    veu=D.createElement('div'); veu.className='dx-carga-veu';
    card=D.createElement('div'); card.className='dx-carga dx-carga-'+t; card.setAttribute('role','status'); card.setAttribute('aria-live','polite');
    card.innerHTML='<div class="dx-carga-cena">'+sc.html+'</div><div class="dx-carga-info"><div class="dx-carga-txt"><b></b><small></small></div><span class="dx-carga-pct"><span>0</span><small>%</small></span></div><div class="dx-carga-barra"><i></i></div>';
    D.body.appendChild(veu); D.body.appendChild(card);
    desenho.aplicarVisual();
    var svgD=card.querySelector('.dex-carga-svg');
    if(t==='arte'){ svgD.setAttribute('data-rosto','bigode'); svgD.setAttribute('data-cab','nenhum'); svgD.classList.add('dex-thumb');
      var cab=svgD.querySelector('.dex-cabeca'), b=D.createElementNS('http://www.w3.org/2000/svg','g'); b.setAttribute('transform','rotate(-12 80 16)');
      b.innerHTML='<path d="M36 18Q80 -16 124 18Q80 28 36 18Z" fill="#23262C" stroke="#14161A" stroke-width="2.5" stroke-linejoin="round"/><rect x="76" y="-6" width="7" height="9" rx="3.5" fill="#23262C"/>'; if(cab) cab.appendChild(b); }
    cena=sc.iniciar(card.querySelector('svg.dx-cena'));
    card.querySelector('.dx-carga-txt b').textContent=TITULO[t];
  }
  function abrir(t){
    tipo=t; aberto=true; fechando=false; comprimindo=false; alvo=0; mostrado=0; pctTxt=-1; etTxt=''; contTxt=''; montar(t);
    tAberto=performance.now();
    /* o que está atrás do véu para de animar enquanto o Dex trabalha */
    D.documentElement.classList.add('ak-pausa-carga');
    requestAnimationFrame(function(){ if(veu) veu.classList.add('on'); });
    M.anima(card,[{opacity:0,transform:'translate(-50%,-50%) translateY(18px) scale(.9)'},{opacity:1,transform:'translate(-50%,-50%)'}],'pula');
    t0=tUlt=performance.now(); laco();
  }
  function laco(){
    cancelAnimationFrame(raf);
    (function passo(agora){
      if(!card||!cena) return;
      agora=agora||performance.now();
      /* em computadores mais simples a cena anda a 30 quadros (mais estável que 60 com engasgos) */
      if(D.documentElement.classList.contains('ak-leve')&&(quadros++&1)){ raf=requestAnimationFrame(passo); return; }
      var dt=Math.min(.05,Math.max(0,(agora-tUlt)/1000)); tUlt=agora;
      if(!comprimindo&&tipo==='zip'&&alvo>=.9&&!fechando) alvo=Math.min(.96,alvo+.0005);
      mostrado+=(alvo-mostrado)*Math.min(1,dt*7); if(Math.abs(alvo-mostrado)<.001) mostrado=alvo;
      var pct=Math.round(mostrado*100);
      if(pct!==pctTxt){ pctTxt=pct; card.__pct=card.__pct||card.querySelector('.dx-carga-pct span'); card.__pct.textContent=String(pct); }
      card.__barra=card.__barra||card.querySelector('.dx-carga-barra i'); sT(card.__barra,'scaleX('+mostrado.toFixed(3)+')');
      cena.passo(dt,(agora-t0)/1000,mostrado,fechando||comprimindo);
      if(cena.etapa){ var et=cena.etapa(); if(et!==etTxt){ etTxt=et; var sm=card.querySelector('.dx-carga-txt small'); sm.textContent=et+(contTxt?' · '+contTxt:''); if(!M.parado||!M.parado()) M.anima(sm,[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],'suave'); } }
      raf=requestAnimationFrame(passo);
    })();
  }
  function atualizar(msg,pct){
    if(!card) return;
    var c=contagem(msg), sub=card.querySelector('.dx-carga-txt small'), tit=limpar(msg);
    if(tit&&!/^(Gerando artes|Montando o ZIP|Preparando arte)$/i.test(tit)) card.querySelector('.dx-carga-txt b').textContent=tit;
    if(c){ contTxt=c[0]+' de '+c[1]+(tipo==='zip'||tipo==='arte'?' artes':''); sub.textContent=(cena&&cena.etapa?cena.etapa()+' · ':'')+contTxt; if(cena&&cena.total) cena.total(c[1],c[0]); }
    else if(!sub.textContent) sub.textContent=tipo==='foto'?'Carregando a imagem':'Só um instante';
    /* no ZIP, a montagem vai até 90%; a compactação (do JSZip) completa o resto */
    if(pct!=null&&!comprimindo) alvo=Math.max(alvo,tipo==='zip'?pct*.9:pct);
  }
  function fechar(){
    if(!card||fechando) return; fechando=true; aberto=false; alvo=1;
    var c=card, v=veu, t=tipo, sc=cena; if(sc&&sc.acabar) sc.acabar();
    try{ W.dispatchEvent(new CustomEvent('dex-feito',{detail:{tipo:t}})); }catch(e){}
    c.classList.add('pronto'); c.querySelector('.dx-carga-txt b').textContent=PRONTO[t]; if(!sc||!sc.etapa) c.querySelector('.dx-carga-txt small').textContent='';
    v.classList.remove('on'); v.style.pointerEvents='none';
    var curto=(t==='foto'||t==='geral'), ini=performance.now(), vivo=ini-tAberto;
    /* espera a cena terminar o gesto final (envelope fechado, quadro pronto), sem passar de alguns segundos */
    (function esperar(){
      var agora=performance.now(), ok=sc&&sc.pronto?sc.pronto():true, max=curto?900:(t==='arte'?5200:3800), min=curto?Math.max(320,620-vivo):700;
      if(agora-ini<min||(!ok&&agora-ini<max)) return setTimeout(esperar,80);
      setTimeout(sair,curto?120:650);
    })();
    function sair(){
      var a=M.anima(c,[{opacity:1,transform:'translate(-50%,-50%)'},{opacity:0,transform:'translate(-50%,-50%) translateY(10px) scale(.95)'}],'rapida',{fill:'forwards'});
      var fim=function(){ c.remove(); v.remove(); if(card===c){ cancelAnimationFrame(raf); card=null; veu=null; tipo=null; cena=null; D.documentElement.classList.remove('ak-pausa-carga'); } };
      if(a) a.finished.then(fim,fim); else fim();
    }
  }

  /* =================================================================== 4. LIGAÇÃO */
  var MESES='janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro';
  function tipoDe(msg){
    msg=String(msg||'');
    if(/Montando o ZIP/i.test(msg)) return 'zip';
    if(/Gerando artes/i.test(msg)) return 'arte';
    if(/Preparando arte|teste de qualidade|Catalogando fotos|Lendo as fotos/i.test(msg)) return 'foto';
    return 'geral';
  }
  var original=W.busy, ultMsg='', ultPct=0;
  if(typeof original!=='function') return;
  W.busy=function(on,msg,pct){
    if(on){
      ultMsg=msg||ultMsg; ultPct=pct;
      if(card&&!fechando){ atualizar(msg,pct); return; }
      if(card&&fechando){ cancelAnimationFrame(raf); card.remove(); veu.remove(); card=null; veu=null; cena=null; tipo=null; }
      if(!tAbrir){ var tt=tipoDe(msg); original(false); tAbrir=setTimeout(function(){ tAbrir=0; abrir(tt); atualizar(ultMsg,ultPct); },tt==='foto'?200:130); }
      return;
    }
    if(tAbrir){ clearTimeout(tAbrir); tAbrir=0; }
    else if(card) fechar();
    return original.apply(this,arguments);
  };
  /* compactação do ZIP em tempo real */
  if(W.JSZip&&JSZip.prototype.generateAsync){
    var gerar=JSZip.prototype.generateAsync;
    JSZip.prototype.generateAsync=function(op,cb){
      if(tipo==='zip'){ comprimindo=true; if(card) card.querySelector('.dx-carga-txt b').textContent='Fechando o envelope'; }
      return gerar.call(this,op,function(m){ if(cb) cb(m); if(tipo==='zip'&&m&&m.percent!=null) alvo=Math.max(alvo,.9+.1*m.percent/100); });
    };
  }
  W.__dexCarga={abrir:function(t,msg){ abrir(t); atualizar(msg||'',0); },atualizar:atualizar,fechar:fechar,comprimir:function(){ comprimindo=true; }};
})();
