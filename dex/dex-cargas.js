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
  function f2(n){ return Math.round(n*100)/100; }
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
    var Y=c.y.x+(Math.sin(t*2.1+this.fase)*1.4+Math.sin(t*3.4+this.fase*2)*.5), sq=c.sq.x, S=this.S;
    this.Y=Y;
    this.g.setAttribute('transform','translate('+f2(c.x.x)+' '+f2(Y)+') rotate('+f2(c.r.x)+') scale('+f2(S*(1-sq*.5)*1000)/1000+' '+f2(S*(1+sq)*1000)/1000+')');
    this.braD.style.transform='rotate('+f2(c.bd.x)+'deg)'; this.oscD.style.transform='scaleY('+f2(c.kd.x)+')';
    this.braE.style.transform='rotate('+f2(c.be.x)+'deg)'; this.oscE.style.transform='scaleY('+f2(c.ke.x)+')';
    this.cab.style.transform='rotate('+f2(c.cab.x)+'deg)';
    this.olhos.style.transform='translate('+f2(c.ox.x)+'px,'+f2(c.oy.x)+'px)';
    if(this.big) this.big.style.transform='scale(1.35,'+f2(1.35*c.big.x)+')';
    /* piscar: às vezes duas vezes seguidas */
    if(t>this.piscaEm){ this.pisca=t; this.piscaEm=t+(Math.random()<.22?.26:rnd(1.8,4.6)); }
    var p=(t-this.pisca)/.15, b=p<1?1-Math.sin(p*Math.PI)*.92:1, self=this;
    this.os.forEach(function(o){ o.style.transform='scaleY('+f2(o===self.oE&&self.fecharE?Math.min(b,.14):b)+')'; });
    /* jatos acendem quando ele sobe */
    var subida=cl((this.chao-Y)/28,0,1);
    for(var i=0;i<this.jatos.length;i++){ var j=this.jatos[i]; j.style.opacity=f2(subida*.9); j.style.transform='scaleY('+f2(.55+subida*.7+Math.sin(t*38+i)*.12)+')'; }
    if(this.sombra){ this.sombra.setAttribute('cx',f2(c.x.x)); this.sombra.setAttribute('rx',f2(30*S*(1-subida*.45))); this.sombra.setAttribute('opacity',f2(.2*(1-subida*.6))); }
    if(this.humorAte&&t>this.humorAte){ this.humorAte=0; this.cara('manual'); }
  };
  Ator.prototype.cara=function(h,dur){ if(h!==this.humor){ this.humor=h; this.svg.setAttribute('data-humor',h); } this.humorAte=dur?this.t+dur:0; if(h==='feliz'||h==='comemorando') this.c.big.v+=5; };
  Ator.prototype.ir=function(x,y,r){ if(x!=null) this.c.x.a=x; if(y!=null) this.c.y.a=Math.min(y,this.chao); if(r!=null) this.c.r.a=r; };
  Ator.prototype.pulo=function(f){ this.c.y.v-=f; this.c.sq.v+=f/70; };
  Ator.prototype.braco=function(l,ang,k){ this.c['b'+l].a=ang; this.c['k'+l].a=k==null?1:k; };
  Ator.prototype.local=function(P){
    var a=-this.c.r.x*Math.PI/180, dx=P[0]-this.c.x.x, dy=P[1]-this.Y, cs=Math.cos(a), sn=Math.sin(a);
    return [(dx*cs-dy*sn)/this.S+80,(dx*sn+dy*cs)/this.S+166];
  };
  Ator.prototype.mundo=function(q){
    var a=this.c.r.x*Math.PI/180, dx=(q[0]-80)*this.S, dy=(q[1]-166)*this.S, cs=Math.cos(a), sn=Math.sin(a);
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

  /* sorteio sem repetir a última ação */
  function sorteio(lista,ultima){ var l=lista.filter(function(a){ return a[0]!==ultima; }), tot=0, i; for(i=0;i<l.length;i++) tot+=l[i][1]; var r=Math.random()*tot; for(i=0;i<l.length;i++){ r-=l[i][1]; if(r<=0) return l[i][0]; } return l[0][0]; }

  /* =================================================================== 2. CENAS */
  var VB='0 0 320 172', CHAO=158;
  function base(fundo,frente){
    return '<svg class="dx-cena" viewBox="'+VB+'" aria-hidden="true">'+
      '<ellipse cx="160" cy="'+(CHAO+5)+'" rx="150" ry="9" class="dx-chao"/>'+fundo+
      '<ellipse class="dx-sombra-a" cx="150" cy="'+(CHAO+4)+'" rx="15" ry="3.2"/>'+
      '<g class="dx-ator">'+dexG()+'</g>'+(frente||'')+'</svg>';
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

  /* arte: paisagem em tons sóbrios, pintada traço a traço */
  var TINTAS=[['#9DB8D2','M186 31L280 31M280 39L186 39M186 47L280 47',8],['#E2C38C','M262 42a7 7 0 1 1 -0.1 -1.2',6],
    ['#3E5A84','M182 74C198 58 212 60 226 68C238 75 252 58 286 65',8],['#6F9786','M182 86C204 76 230 85 250 78C262 74 276 80 286 77M286 94C250 98 214 88 182 96',9],
    ['#2B2F36','M206 90V74M200 79L206 70L212 79M228 34q3.5 -3.5 7 0q3.5 -3.5 7 0',2.6]];
  function cenaArte(){
    var fundo='<defs><clipPath id="dxTela"><rect x="177" y="21" width="112" height="82" rx="2"/></clipPath></defs>'+
      '<path d="M233 22L206 '+CHAO+'M233 22L260 '+CHAO+'" class="dx-madeira"/><path d="M233 14V'+CHAO+'" class="dx-madeira" opacity=".55"/>'+
      '<rect x="174" y="18" width="118" height="88" rx="4" class="dx-tela"/>'+
      '<g clip-path="url(#dxTela)">'+TINTAS.map(function(t){ return '<path class="dx-traco" data-cor="'+t[0]+'" stroke="'+t[0]+'" stroke-width="'+t[2]+'" d="'+t[1]+'"/>'; }).join('')+'</g>'+
      '<rect x="168" y="106" width="130" height="5" rx="2.5" class="dx-madeira-p"/>'+
      '<path d="M151 '+CHAO+'V136M141 '+CHAO+'L151 140L161 '+CHAO+'" class="dx-madeira" style="stroke-width:3"/>'+
      '<path d="M134 132C134 126 142 123 152 123C163 123 169 127 168 132C167 137 160 139 151 139C145 139 146 135 141 136C136 137 134 135 134 132Z" fill="#EDE7DC" stroke="#9A8B73" stroke-width="1.8"/>'+
      TINTAS.slice(0,4).map(function(t,i){ return '<circle cx="'+[143,150,157,162][i]+'" cy="'+[130,127,128,132][i]+'" r="2.8" fill="'+t[0]+'"/>'; }).join('')+
      '<g class="dx-ok" transform="scale(0)"><circle r="10" class="dx-ok-c"/><path d="M-4.5 .5l3 3 6-6.5" class="dx-ok-v"/></g>';
    return cenaQuadro({fundo:fundo,centro:[233,62],ok:[290,20],L:88,molhar:true,braE:16,
      pausas:[['admirar',3],['medir',2],['olhar',1]],
      ferramenta:'<rect x="121.5" y="128" width="6" height="40" rx="3" fill="#30343B"/><rect x="120.5" y="164" width="8" height="6" rx="1" fill="#B9BEC6"/><path class="dx-tinta" d="M120.5 170Q124.5 193 128.5 170Z" fill="#9DB8D2"/>',
      paleta:[150,129]});
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
      '<path class="dx-env-aba" d="M218 104L258 131L298 104Z"/>'+
      '<g class="dx-selo" transform="scale(0)"><circle r="9.5" class="dx-ok-c"/><path d="M-4.2 .5l2.8 2.8 5.6-6" class="dx-ok-v"/></g></g>';
    var frente='<g class="dx-voo"></g>';
    return {html:base(fundo,frente),iniciar:function(svg){
      var ator=new Ator(svg,.5,150,CHAO);
      var papelMao=naMao(ator,'e','<g class="dx-papel-mao" opacity="0"><rect x="22" y="138" width="24" height="30" rx="2" class="dx-papel"/><path d="M27 146H41M27 151H41M27 156H37" class="dx-papel-l"/></g>').firstChild;
      var env=svg.querySelector('.dx-env'), aba=svg.querySelector('.dx-env-aba'), cheio=svg.querySelector('.dx-env-cheio'), selo=svg.querySelector('.dx-selo'), voo=svg.querySelector('.dx-voo');
      var folhas=[].slice.call(svg.querySelectorAll('.dx-folha-z')), pilhaG=svg.querySelector('.dx-pilha');
      var envM=new Mola(0,220,.32), abaM=new Mola(-1,120,.5), seloM=new Mola(0,200,.45), pilhaM=new Mola(0,300,.3), cheioM=new Mola(0,90,.8);
      var N=8, pegos=0, entregues=0, est='entrar', tEst=0, dur=.5, ultima='', voando=[], seq=0, fim=false, fechado=false, modo='';
      function mudar(e,d){ est=e; tEst=0; dur=d; if(/^(esperar|espiar|arrumar)$/.test(e)) ultima=e; }
      function lancar(P0,P1,T,giro){
        var g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.innerHTML='<rect x="-9" y="-11.5" width="18" height="23" rx="2" class="dx-papel"/><path d="M-5 -5H5M-5 -1H5M-5 3H2" class="dx-papel-l"/>';
        voo.appendChild(g); var G=420;
        voando.push({g:g,x:P0[0],y:P0[1],vx:(P1[0]-P0[0])/T,vy:(P1[1]-P0[1])/T-G*T/2,G:G,t:0,T:T,giro:giro,r:rnd(-20,20),alvo:P1,dentro:false});
      }
      var SLOT=[258,112];
      return {ator:ator,total:function(n){ N=cl(n||8,3,12); },acabar:function(){ fim=true; },pronto:function(){ return fechado&&!(est==='festa'&&tEst<.85); },passo:function(dt,t,prog,fechando){
        tEst+=dt; var devidos=Math.floor(cl(prog/.9,0,1)*N+1e-6), atraso=devidos-pegos, vel=fim?2.6:atraso>=3?1.9:atraso>=2?1.4:1;
        var topo=150-(N-pegos-1)*2.6;
        if(est==='entrar'){ ator.ir(150,CHAO-6,0); ator.olharVoce(); ator.braco('d',-24); ator.braco('e',24); if(tEst>dur){ ator.cara('feliz',.5); ator.pulo(60); mudar('esperar',.4); } }
        else if(est==='pegar'){
          ator.ir(104,CHAO-4,-9); ator.alcancar('e',[56+Math.sin(seq)*4,topo-2],40,1.3); ator.olhar([54,topo]); ator.braco('d',-14);
          if(tEst>dur){ pegos++; papelMao.setAttribute('opacity','1'); pilhaM.v-=6; seq++;
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
          if(tEst>dur){ fechado=true; ator.pulo(90); mudar('festa',.9); }
        }
        else if(est==='festa'){ ator.ir(168,CHAO-6,0); ator.braco('d',-150); ator.braco('e',150); ator.olharVoce(); if(tEst<dt*1.5) ator.cara('comemorando'); if(tEst>.45&&tEst<.45+dt*1.5) ator.pulo(120); if(tEst>dur) mudar('esperar',2); }
        function proximo(){
          if(pegos<devidos) mudar('pegar',.42/vel);
          else if((fechando||fim||prog>=.9)&&pegos>=N&&!voando.length&&!fechado) mudar('fechar',1.05);
          else if(fechado) mudar('esperar',rnd(1,2));
          else mudar(sorteio([['esperar',3],['espiar',2],['arrumar',1.5]],ultima),rnd(1.1,1.9));
        }
        if(pegos<devidos&&/^(esperar|espiar|arrumar)$/.test(est)&&tEst>.35) proximo();
        if(fim&&pegos<N&&est==='esperar') proximo();
        /* papéis no ar: arco de verdade, girando, e entram atrás da frente do envelope */
        for(var i=voando.length-1;i>=0;i--){
          var p=voando[i]; p.t+=dt;
          if(!p.dentro){ p.vy+=p.G*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.r+=p.giro*dt;
            if(p.t>=p.T){ p.dentro=true; p.t=0; p.x=p.alvo[0]; p.y=p.alvo[1]; p.r=0; svg.querySelector('.dx-env-dentro').appendChild(p.g); envM.v+=2.2; entregues++; cheioM.a=entregues/N; if(entregues%3===0&&!/fechar|festa/.test(est)) ator.cara('feliz',.45); } }
          else { p.y+=dt*80; if(p.t>.25){ p.g.remove(); voando.splice(i,1); continue; } }
          p.g.setAttribute('transform','translate('+f2(p.x)+' '+f2(p.y)+') rotate('+f2(p.r)+') scale('+(p.dentro?.9:.85)+')');
        }
        envM.passo(dt); abaM.passo(dt); seloM.passo(dt); pilhaM.passo(dt); cheioM.passo(dt);
        env.setAttribute('transform','translate(258 156) scale('+f2(1+envM.x*.05)+' '+f2(1-envM.x*.06)+') translate(-258 -156)');
        aba.setAttribute('transform','translate(0 104) scale(1 '+f2(cl(abaM.x,-1.1,1.1))+') translate(0 -104)');
        selo.setAttribute('transform','translate(258 122) scale('+f2(Math.max(0,seloM.x))+')');
        cheio.setAttribute('transform','translate(0 154) scale(1 '+f2(cl(cheioM.x,0,1))+') translate(0 -154)');
        for(var j=0;j<folhas.length;j++) folhas[j].style.opacity=j<N-pegos?1:0;
        pilhaG.setAttribute('transform','translate(54 158) scale(1 '+f2(1+pilhaM.x*.02)+') rotate('+f2(pilhaM.x*.6)+') translate(-54 -158)');
        ator.passo(dt,t);
      }};
    }};
  }

  /* ---- 2c. FOTO: a foto instantânea revela enquanto ele sacode ---- */
  function cenaFoto(){
    var fundo='<g class="dx-camera" transform="translate(52 128)"><path d="M-6 30L0 8L6 30" class="dx-madeira"/><rect x="-18" y="-6" width="36" height="22" rx="5" class="dx-cam"/><circle cy="5" r="7.5" class="dx-cam-l"/><rect x="6" y="-11" width="9" height="6" rx="2" class="dx-cam"/></g>'+
      '<circle class="dx-flash" cx="52" cy="133" r="30"/>';
    return {html:base(fundo),iniciar:function(svg){
      var ator=new Ator(svg,.6,150,CHAO);
      var foto=naMao(ator,'d','<g class="dx-polaroid"><rect x="-17" y="-4" width="34" height="40" rx="2.5" fill="#FBFBFA" stroke="#C9CED6" stroke-width="1.6"/><rect x="-13" y="0" width="26" height="25" fill="#23272E"/>'+
        '<g class="dx-revela" opacity="0"><rect x="-13" y="0" width="26" height="25" fill="#9DB8D2"/><circle cx="6" cy="7" r="3.5" fill="#E2C38C"/><path d="M-13 20L-5 11L1 17L5 13L13 21V25H-13Z" fill="#3E5A84"/></g></g>').firstChild;
      var revela=foto.querySelector('.dx-revela'), flash=svg.querySelector('.dx-flash'), fl=new Mola(0,60,1), est='flash', tEst=0, sac=0, fim=false, mostra=0;
      fl.x=1;
      return {ator:ator,acabar:function(){ fim=true; },pronto:function(){ return est==='mostrar'&&tEst>.45; },passo:function(dt,t,prog){
        tEst+=dt; fl.passo(dt); flash.setAttribute('opacity',f2(cl(fl.x,0,1)*.85));
        mostra+=(Math.min(1,prog*1.1)-mostra)*Math.min(1,dt*5); revela.setAttribute('opacity',f2(mostra));
        if(est==='flash'){ ator.ir(150,CHAO-4,-4); ator.olhar([52,130]); ator.braco('d',-80,1.02); ator.braco('e',20); if(tEst<dt*1.5) ator.cara('surpresa',.5); if(tEst>.45){ est='sacudir'; tEst=0; } }
        else if(est==='sacudir'){
          /* sacode em rajadas, para, olha, sacode de novo */
          var rajada=(Math.sin(tEst*2.6)+1)/2, amp=rajada>.45?14:2;
          ator.ir(150,CHAO-6,Math.sin(t*14)*rajada*2); ator.braco('d',-92+Math.sin(t*19)*amp,1.02); ator.braco('e',18+Math.sin(t*3)*4);
          var P=ator.ponta('d',52); ator.olhar(P); ator.c.cab.a=rajada>.45?Math.sin(t*9)*3:-7;
          if(fim||prog>=.999){ est='mostrar'; tEst=0; ator.cara('feliz',1.2); ator.pulo(70); }
        }
        else { ator.ir(150,CHAO-10,0); ator.braco('d',-140,1.05); ator.olharVoce(); ator.c.cab.a=-5; }
        /* a foto fica sempre em pé, não importa o ângulo do braço */
        var a=-ator.c.bd.x-ator.c.r.x;
        foto.setAttribute('transform','translate(124.5 '+f2(147)+') scale(1 '+f2(1/ator.c.kd.x)+') rotate('+f2(a)+') scale(1.5)');
        ator.passo(dt,t);
      }};
    }};
  }

  /* =================================================================== 3. CARTÃO */
  var veu=null, card=null, cena=null, tipo=null, alvo=0, mostrado=0, raf=0, tAbrir=0, aberto=false, fechando=false, comprimindo=false, t0=0, tUlt=0, tAberto=0, pctTxt=-1;
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
    tipo=t; aberto=true; fechando=false; comprimindo=false; alvo=0; mostrado=0; pctTxt=-1; montar(t);
    tAberto=performance.now();
    requestAnimationFrame(function(){ if(veu) veu.classList.add('on'); });
    M.anima(card,[{opacity:0,transform:'translate(-50%,-50%) translateY(18px) scale(.9)'},{opacity:1,transform:'translate(-50%,-50%)'}],'pula');
    t0=tUlt=performance.now(); laco();
  }
  function laco(){
    cancelAnimationFrame(raf);
    (function passo(agora){
      if(!card||!cena) return;
      agora=agora||performance.now();
      var dt=Math.min(.05,Math.max(0,(agora-tUlt)/1000)); tUlt=agora;
      if(!comprimindo&&tipo==='zip'&&alvo>=.9&&!fechando) alvo=Math.min(.96,alvo+.0005);
      mostrado+=(alvo-mostrado)*Math.min(1,dt*7); if(Math.abs(alvo-mostrado)<.001) mostrado=alvo;
      var pct=Math.round(mostrado*100);
      if(pct!==pctTxt){ pctTxt=pct; card.querySelector('.dx-carga-pct span').textContent=String(pct); }
      card.querySelector('.dx-carga-barra i').style.transform='scaleX('+mostrado.toFixed(4)+')';
      cena.passo(dt,(agora-t0)/1000,mostrado,fechando||comprimindo);
      raf=requestAnimationFrame(passo);
    })();
  }
  function atualizar(msg,pct){
    if(!card) return;
    var c=contagem(msg), sub=card.querySelector('.dx-carga-txt small'), tit=limpar(msg);
    if(tit&&!/^(Gerando artes|Montando o ZIP|Preparando arte)$/i.test(tit)) card.querySelector('.dx-carga-txt b').textContent=tit;
    if(c){ sub.textContent=c[0]+' de '+c[1]+(tipo==='zip'||tipo==='arte'?' artes':''); if(cena&&cena.total) cena.total(c[1]); }
    else if(!sub.textContent) sub.textContent=tipo==='foto'?'Carregando a imagem':'Só um instante';
    /* no ZIP, a montagem vai até 90%; a compactação (do JSZip) completa o resto */
    if(pct!=null&&!comprimindo) alvo=Math.max(alvo,tipo==='zip'?pct*.9:pct);
  }
  function fechar(){
    if(!card||fechando) return; fechando=true; aberto=false; alvo=1;
    var c=card, v=veu, t=tipo, sc=cena; if(sc&&sc.acabar) sc.acabar();
    c.classList.add('pronto'); c.querySelector('.dx-carga-txt b').textContent=PRONTO[t]; c.querySelector('.dx-carga-txt small').textContent='';
    v.classList.remove('on'); v.style.pointerEvents='none';
    var curto=(t==='foto'||t==='geral'), ini=performance.now(), vivo=ini-tAberto;
    /* espera a cena terminar o gesto final (envelope fechado, quadro pronto), sem passar de alguns segundos */
    (function esperar(){
      var agora=performance.now(), ok=sc&&sc.pronto?sc.pronto():true, max=curto?900:3600, min=curto?Math.max(320,620-vivo):700;
      if(agora-ini<min||(!ok&&agora-ini<max)) return setTimeout(esperar,80);
      setTimeout(sair,curto?120:650);
    })();
    function sair(){
      var a=M.anima(c,[{opacity:1,transform:'translate(-50%,-50%)'},{opacity:0,transform:'translate(-50%,-50%) translateY(10px) scale(.95)'}],'rapida',{fill:'forwards'});
      var fim=function(){ c.remove(); v.remove(); if(card===c){ cancelAnimationFrame(raf); card=null; veu=null; tipo=null; cena=null; } };
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
