
'use strict';
document.body.classList.add('full-motion');
const performanceLite=innerWidth<700||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory>0&&navigator.deviceMemory<=4);
document.body.classList.toggle('performance-lite',performanceLite);
const motionReduce={get matches(){return document.body.classList.contains('calm-motion');}};
const motionButton=document.querySelector('#motion-toggle');
motionButton.onclick=()=>{const calm=document.body.classList.toggle('calm-motion');document.body.classList.toggle('full-motion',!calm);motionButton.textContent=calm?'✦ Увімкнути святкові анімації':'☾ Спокійний режим';motionButton.setAttribute('aria-pressed',String(calm));if(calm){effectParticles=[];document.querySelector('#party-reveal').hidden=true;}};
const effectHistory=new Map(),runningMotion=new WeakMap();
const effectCanvases=[document.querySelector('#confetti'),document.querySelector('#modal-confetti')];
const effectContexts=effectCanvases.map(c=>c.getContext('2d'));
const glyphCache=new Map();
function partyGlyph(symbol){if(glyphCache.has(symbol))return glyphCache.get(symbol);const canvas=document.createElement('canvas');canvas.width=72;canvas.height=72;const ctx=canvas.getContext('2d');ctx.font='48px "Segoe UI Emoji",Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(symbol,36,36);glyphCache.set(symbol,canvas);return canvas;}
let effectLastPaint=0;
const effectDirty=[false,false];
function clearEffectLayer(i){if(!effectDirty[i])return;effectContexts[i].clearRect(0,0,effectWidth,effectHeight);effectDirty[i]=false;effectCanvases[i].hidden=true;}
let effectParticles=[],effectFrame=0,effectTime=0,effectWidth=innerWidth,effectHeight=innerHeight;
const effectPalette=['#d4fb71','#ff9ccd','#b3a7f7','#ffd36c','#fff3de'];
const celebrationThemes={
 intro:['🎁','🎈','♥','✦','🍾','🥂'],
 cake:['♥','💖','🍷','🥃','🍺','🍾','🎂'],
 photo:['♥','✦','📸','😜','✨'],
 video:['▶','✦','🎬','🍿','✨'],
 drink:['🥂','🍷','🥃','🍺','♥'],
 love:['♥','💖','💕','♡','✨'],
 music:['♫','♪','🎵','✦','♥'],
 chaos:['♥','🍷','🥃','🍺','🎁','🎈','✨'],
 general:['✦','♥','🎈','✨']
};
function chooseEffect(key,length=5){
 let previous=effectHistory.get(key);
 if(key==='entrance'&&previous===undefined){try{const saved=sessionStorage.getItem('dima-last-entrance');previous=saved===null?undefined:Number(saved);}catch{}}
 let next=Math.floor(Math.random()*length);
 if(next===previous)next=(next+1+Math.floor(Math.random()*(length-1)))%length;
 effectHistory.set(key,next);
 if(key==='entrance'){try{sessionStorage.setItem('dima-last-entrance',String(next));}catch{}}
 return next;
}
function sizeEffects(){effectWidth=innerWidth;effectHeight=innerHeight;effectCanvases.forEach((canvas,i)=>{canvas.width=1;canvas.height=1;effectDirty[i]=false;canvas.hidden=true;});effectParticles=[];}
function prepareEffectLayer(i){const canvas=effectCanvases[i];const dpi=1;const width=Math.round(effectWidth*dpi),height=Math.round(effectHeight*dpi);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;effectContexts[i].setTransform(dpi,0,0,dpi,0,0);}canvas.hidden=false;}
addEventListener('resize',sizeEffects);sizeEffects();
function animateInteraction(element,theme='general',variant=chooseEffect('element:'+theme)){
 if(!element||motionReduce.matches||!element.animate)return;
 runningMotion.get(element)?.cancel();
 const frames=[
 [{transform:'scale(.8) rotate(-6deg)',opacity:.3},{transform:'scale(1.06) rotate(2deg)',opacity:1,offset:.65},{transform:'none',opacity:1}],
 [{transform:'translateX(-70px) rotate(-9deg)',opacity:.2},{transform:'translateX(10px) rotate(2deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],
 [{transform:'translateY(75px) scale(.88)',opacity:.2},{transform:'translateY(-12px) scale(1.04)',opacity:1,offset:.65},{transform:'none',opacity:1}],
 [{transform:'perspective(700px) rotateY(-55deg) scale(.9)',opacity:.2},{transform:'perspective(700px) rotateY(8deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],
 [{transform:'scale(1.12) rotate(6deg)',opacity:.4},{transform:'scale(.97) rotate(-2deg)',opacity:1,offset:.7},{transform:'none',opacity:1}]
 ];
 runningMotion.set(element,element.animate(frames[variant],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'}));
}
function effectOrigin(source){
 if(source&&typeof source.x==='number')return {x:source.x,y:source.y};
 const r=source?.getBoundingClientRect?.();
 return r?{x:Math.max(25,Math.min(effectWidth-25,r.left+r.width/2)),y:Math.max(40,Math.min(effectHeight-30,r.top+r.height/2))}:{x:effectWidth/2,y:effectHeight*.55};
}
function celebrate(theme='general',source,options={}){
 if(motionReduce.matches)return;
 const variant=chooseEffect('particles:'+theme),origin=effectOrigin(source);
 const symbols=options.symbols||celebrationThemes[theme]||celebrationThemes.general;
 const count=options.count||(theme==='cake'||theme==='chaos'?75:theme==='intro'?100:34);
 const layer=document.querySelector('#lightbox').open?1:0;
 const isSmall=effectWidth<700;
 const actual=Math.min(performanceLite?40:70,Math.round(count*(performanceLite?.35:.55)));
 prepareEffectLayer(layer);
 for(let i=0;i<actual;i++){
  const theta=(i/actual)*Math.PI*2+Math.random()*.16;
  const speed=2+Math.random()*8;
  let x=origin.x,y=origin.y,vx=Math.cos(theta)*speed,vy=Math.sin(theta)*speed-3,gravity=.075;
  if(variant===1){vx=(Math.random()-.5)*9;vy=-5-Math.random()*12;gravity=.17;}
  if(variant===2){x=i%2?0:effectWidth;y=effectHeight*.7;vx=(i%2?1:-1)*(5+Math.random()*9);vy=-5-Math.random()*12;gravity=.14;}
  if(variant===3){x=origin.x+Math.cos(theta)*45;y=origin.y+Math.sin(theta)*45;vx=Math.cos(theta)*5;vy=Math.sin(theta)*5-4;gravity=.04;}
  if(variant===4){x=Math.random()*effectWidth;y=-30-Math.random()*120;vx=(Math.random()-.5)*4;vy=3+Math.random()*4;gravity=.02;}
  const emoji=Math.random()<(theme==='cake'||theme==='drink'||theme==='love'?.78:.45)?symbols[i%symbols.length]:null;
  effectParticles.push({x,y,vx,vy,gravity,theta,variant,layer,emoji,size:(emoji?22:7)+Math.random()*(emoji?18:8),color:effectPalette[i%effectPalette.length],spin:(Math.random()-.5)*.1,age:0,maxAge:65+Math.random()*25});
 }
 const limit=performanceLite?60:110;if(effectParticles.length>limit)effectParticles.splice(0,effectParticles.length-limit);
 document.body.dataset.lastEffect=theme+':'+variant;
 if(!effectFrame){effectTime=0;effectFrame=requestAnimationFrame(drawEffects);}
}
function drawEffects(now){
 if(document.hidden){effectFrame=0;return;}
 if(now-effectLastPaint<(performanceLite?33:24)){effectFrame=requestAnimationFrame(drawEffects);return;}effectLastPaint=now;
 const delta=effectTime?Math.min((now-effectTime)/16.667,2.5):1;effectTime=now;
 effectDirty.forEach((dirty,i)=>{if(dirty)effectContexts[i].clearRect(0,0,effectWidth,effectHeight);});
 effectParticles=effectParticles.filter(p=>p.age<p.maxAge&&p.y<effectHeight+100&&p.x>-150&&p.x<effectWidth+150);
 for(const p of effectParticles){
  p.age+=delta;p.vy+=p.gravity*delta;
  if(p.variant===3){p.vx+=Math.cos(p.age*.055+p.theta)*.17*delta;p.vy+=Math.sin(p.age*.055+p.theta)*.1*delta;}
  p.x+=p.vx*delta;p.y+=p.vy*delta;p.theta+=p.spin*delta;
  effectDirty[p.layer]=true;const ctx=effectContexts[p.layer];ctx.save();ctx.globalAlpha=Math.min(1,(p.maxAge-p.age)/35);ctx.translate(p.x,p.y);
  if(p.emoji){ctx.rotate(Math.sin(p.theta)*.22);ctx.drawImage(partyGlyph(p.emoji),-p.size/2,-p.size/2,p.size,p.size);}
  else{ctx.rotate(p.theta);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*.5);}
  ctx.restore();
 }
 effectFrame=effectParticles.length?requestAnimationFrame(drawEffects):0;
 for(let i=0;i<2;i++)if(!effectParticles.some(p=>p.layer===i))clearEffectLayer(i);
}
function partyEntrance(){
 const variant=chooseEffect('entrance');
 const overlay=document.querySelector('#party-reveal');
 const names=['ПОРТАЛ У ТВОЇ 29','РОЗПАКОВУЄМО ЛЕГЕНДУ','ДІМО, ТВОЯ СЦЕНА!','ЗАРАЗ БУДЕ ПОВНИЙ ВІДРИВ','САЛЮТ НА ЧЕСТЬ ДІМИ'];
 overlay.className='party-reveal reveal-mode-'+variant;
 overlay.querySelector('.reveal-kicker').textContent=names[variant];
 overlay.hidden=false;overlay.dataset.variant=variant;
 document.body.dataset.entrance=variant;
 scrollTo({top:0,behavior:'instant'});
 if(motionReduce.matches){overlay.hidden=true;document.querySelector('#gate').hidden=true;return;}
 const gate=document.querySelector('#gate');gate.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:variant%2?'translateY(-100%) rotate(-8deg)':'scale(1.5) rotate(8deg)'}],{duration:650,fill:'forwards',easing:'cubic-bezier(.4,0,.2,1)'});
 const entryFrames=[
 [{opacity:0,transform:'translateY(130px) scale(.55) rotate(-12deg)'},{opacity:1,transform:'translateY(-12px) scale(1.03)',offset:.75},{opacity:1,transform:'none'}],
 [{opacity:0,transform:'translateX(-180px) rotate(-20deg)'},{opacity:1,transform:'translateX(15px) rotate(3deg)',offset:.7},{opacity:1,transform:'none'}],
 [{opacity:0,transform:'translateY(200px) rotateX(35deg)'},{opacity:1,transform:'translateY(-15px)',offset:.75},{opacity:1,transform:'none'}],
 [{opacity:0,transform:'scale(.2) rotate(-120deg)'},{opacity:1,transform:'scale(1.07) rotate(6deg)',offset:.7},{opacity:1,transform:'none'}],
 [{opacity:0,transform:'translateX(180px) scale(1.3)'},{opacity:1,transform:'translateX(-12px) scale(.97)',offset:.7},{opacity:1,transform:'none'}]
 ];
 document.querySelectorAll('.hero-copy>*,.hero-art>*').forEach((el,i)=>{el.animate(entryFrames[(variant+i%2)%5],{duration:1100,delay:700+i*90,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'});});
 celebrate('intro',{x:effectWidth/2,y:effectHeight*.65},{count:180});
 setTimeout(()=>{gate.hidden=true;celebrate('chaos',{x:effectWidth*.2,y:effectHeight*.7},{count:95});},750);
 setTimeout(()=>celebrate('intro',{x:effectWidth*.8,y:effectHeight*.7},{count:95}),1450);
 setTimeout(()=>{overlay.hidden=true;document.querySelector('#sound').focus({preventScroll:true});},2850);
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button,a,video');
 if(!target||target.id==='motion-toggle'||target.id==='unlock'||target.id==='cake'||target.matches('[data-photo],[data-secret],#fortune-button,#joke-button,#photo-extra-joke,#previous,#next'))return;
 let theme=target.matches('[data-drink]')?'drink':target.id.includes('music')||target.id==='sound'||target.id==='start-party-music'?'music':target.id==='love'?'love':target.id==='chaos'?'chaos':target.matches('[data-video],#watch-first,video')?'video':'general';
 const location=(event.clientX||event.clientY)?{x:event.clientX,y:event.clientY}:target;
 const symbols=target.matches('[data-drink]')?['♥',['🍺','🍷','🥃','🍸'][Number(target.dataset.drink)],'🥂','✦']:undefined;
 celebrate(theme,location,{symbols});
 if(target.tagName!=='VIDEO')animateInteraction(target,theme);
 if(theme==='drink')setTimeout(()=>animateInteraction(document.querySelector('.toast-card'),'drink'),0);
 if(theme==='video')animateInteraction(document.querySelector('.screen'),'video');
},true);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(effectFrame)cancelAnimationFrame(effectFrame);effectFrame=0;effectParticles=[];effectDirty.forEach((_,i)=>clearEffectLayer(i));}
});

let scrollIdleTimer;addEventListener('scroll',()=>{document.body.classList.add('is-scrolling');clearTimeout(scrollIdleTimer);scrollIdleTimer=setTimeout(()=>document.body.classList.remove('is-scrolling'),160);},{passive:true});
const mediaVisibility=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting&&!entry.target.paused)entry.target.pause();}),{rootMargin:'80px'});mediaVisibility.observe(document.querySelector('#player'));document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelector('#player').pause();});
