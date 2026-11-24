(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
window.Lesson=o=>{window.__L=o};
addEventListener('DOMContentLoaded',()=>window.__L?player(window.__L):home());
const tt=o=>o?`${o.ar||''} | ${o.en||''}`:'';
const IC={prev:['M6 5v14M19 5L9 12l10 7z'],next:['M18 5v14M5 5l10 7L5 19z'],play:['M7 4l13 8L7 20z',1],pause:['M7 4h4v16H7zM14 4h4v16h-4z',1],redo:['M4 12a8 8 0 1 0 3-6M4 4v5h5'],
  vol0:['M11 5L6 9H3v6h3l5 4zM16 9l5 6M21 9l-5 6'],
  vol1:['M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7'],
  vol2:['M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13']};
const icon=n=>`<svg viewBox="0 0 24 24" fill="${IC[n][1]?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="${IC[n][0]}"/></svg>`;
const set=(el,n)=>el.innerHTML=icon(n);
function home(){
  document.body.classList.add('home');
  const list=window.LESSON_LIST||[],g={};
  list.forEach(l=>((g[l.subject]??={})[l.unit]??=[]).push(l));
  $('#app').innerHTML='<h1>Math Course | كورس الماث</h1>'+(list.length?Object.entries(g).map(([s,us])=>
    `<section><h2>${s}</h2>`+Object.entries(us).map(([u,ls])=>`<h3>${u}</h3><div class="grid">`+
    ls.map(l=>`<a href="Subjects/${s}/${u}/${l.lesson}/lesson.html">${l.title}</a>`).join('')+'</div>').join('')+'</section>').join('')
    :'<p>مفيش دروس لسه. ضيف سطر في Subjects/list.js</p>');
}
function player(L){
  document.body.classList.add('player');
  document.body.insertAdjacentHTML('afterbegin',`
  <header><a class="btn" href="../../../../index.html">الرئيسية | Home</a><div id="ttl">${tt(L.title)}</div></header>
  <main><div id="stage"><div id="chip"></div><div id="scene"></div><div id="scriptBox" hidden></div><button id="start" aria-label="Play"></button></div></main>
  <nav id="ctl" dir="ltr">
    <button class="ic" id="bPrev" data-i="prev" title="Previous"></button>
    <button class="ic big" id="bPlay" data-i="play" title="Play / Pause"></button>
    <button class="ic" id="bNext" data-i="next" title="Next"></button>
    <button class="ic" id="bRe" data-i="redo" title="Replay"></button>
    <input id="bar" type="range" min="0" max="1000" value="0">
    <span id="cnt">0:00 / 0:00</span>
    <button class="btn hidden" id="bSkip" title="Skip timer">تخطي التايمر | Skip</button>
    <div id="vol"><button class="ic" id="bVol" title="Mute / Unmute (M)" aria-label="Volume"></button><input id="vbar" type="range" min="0" max="100" step="1" value="100" title="Volume (↑ ↓)" aria-label="Volume level"></div>
    <select id="rate" title="Speed"><option>0.75</option><option selected>1</option><option>1.25</option><option>1.5</option></select>
    <button class="btn" id="bFull">ملء الشاشة | Full</button>
    <button class="btn" id="bScript">سكريبت | Script</button>
  </nav>`);
  document.head.insertAdjacentHTML('beforeend','<style>#vol{display:flex;align-items:center;gap:2px}#cnt{min-width:96px!important;font-variant-numeric:tabular-nums}#bSkip{background:var(--hi);color:var(--ink);border-color:var(--hi);font-weight:700}#vbar{width:84px;accent-color:var(--hi);cursor:pointer}@media (max-width:700px){#vbar{width:64px}}</style>');
  document.title=tt(L.title);
  $$('[data-i]').forEach(b=>set(b,b.dataset.i));set($('#start'),'play');

  const A=new Audio();A.preload='auto';
  let vol=1,muted=false;
  try{const v=parseFloat(localStorage.getItem('lessonVol'));if(v>=0&&v<=1)vol=v;muted=localStorage.getItem('lessonMuted')==='1'}catch(e){}
  function applyVol(){
    const eff=muted?0:vol;
    A.volume=eff;
    set($('#bVol'),eff===0?'vol0':eff<.5?'vol1':'vol2');
    $('#vbar').value=Math.round(eff*100);
    $('#bVol').title=(eff===0?'Unmute':'Mute')+' (M)';
    try{localStorage.setItem('lessonVol',vol);localStorage.setItem('lessonMuted',muted?'1':'0')}catch(e){}
  }
  function setVol(v){vol=Math.max(0,Math.min(1,v));muted=vol===0;applyVol()}
  function toggleMute(){if(muted||vol===0){muted=false;if(vol===0)vol=.5}else muted=true;applyVol()}

  const S={i:0,steps:[],k:0,mode:'audio',pos:0,dur:0,end:0,playing:false,rate:1,last:0,ff:false,holds:[],hi:0,off:0,holding:false,hStart:0,hEnd:0,lastSec:-1};
  const N=L.scenes.length;

  let AC=null,tk=0;
  function beep(){
    try{
      AC=AC||new(window.AudioContext||window.webkitAudioContext)();
      if(AC.state==='suspended')AC.resume();
      const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime,hi=(tk++%2===0);
      o.type='square';o.frequency.value=hi?1500:1000;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,.25*(muted?0:vol)),t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.06);
      o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.07);
    }catch(e){}
  }

  function fit(){
    const f=$('#fit'),s=$('#scene');if(!f||!f.offsetWidth)return;
    const k=Math.min(1.6,s.clientWidth*.94/f.offsetWidth,s.clientHeight*.84/f.offsetHeight);
    f.style.transform=`scale(${k})`;S.fit=k;
  }
  new ResizeObserver(fit).observe($('#scene'));
  document.fonts&&document.fonts.ready.then(fit);
  function resetStage(){
    const sc=L.scenes[S.i];S.sc=sc;
    S.steps=[...(sc.steps||[])].sort((a,b)=>a.t-b.t);S.k=0;
    S.holds=S.steps.filter(x=>x.hold).map(x=>({t:x.t,d:x.hold}));S.hi=0;S.off=0;S.holding=false;S.lastSec=-1;
    $('#scene').innerHTML='<div id="fit">'+(sc.stage||'')+'</div>';fit();$('#chip').textContent=tt(sc.title);
  }
  function loadScene(i){
    S.i=i;resetStage();S.mode='audio';S.pos=0;
    S.end=Math.max(0,...S.steps.map(s=>s.t))+2500;S.dur=S.end;
    const name=S.sc.audio||`V${pad(i+1)}`;
    let tried=0;
    A.onerror=()=>{if(!tried++&&!/^https?:\/\//i.test(name)){A.src=`audio/${name}.wav`;A.load();return}S.mode='timer';S.dur=S.sc.dur||S.end;ui()};
    A.onloadedmetadata=()=>{if(S.mode==='audio')S.dur=Math.max(A.duration*1000+S.holds.reduce((a,h)=>a+h.d,0),S.end-2000);prog()};
    A.src=/^https?:\/\//i.test(name)?name:`audio/${name}.mp3`;A.playbackRate=S.rate;A.load();
    $('#scriptBox').innerHTML=`<b>${name}</b>${S.sc.say||''}`;
    prog();ui();
  }
  function jump(ms){
    resetStage();S.ff=true;$('#scene').classList.add('instant');fire(ms);
    $('#scene').classList.remove('instant');S.ff=false;S.pos=ms;
    if(S.mode==='audio'){
      let off=0,hi=0,hold=null;
      for(const h of S.holds){if(ms>=h.t+h.d){off+=h.d;hi++}else{if(ms>=h.t){hold=h;hi++}break}}
      S.off=off;S.hi=hi;S.holding=!!hold;
      if(hold){S.hStart=hold.t;S.hEnd=hold.t+hold.d;S.lastSec=Math.floor((ms-hold.t)/1000);A.pause();try{A.currentTime=(hold.t-off)/1000}catch(e){}}
      else{try{A.currentTime=(ms-off)/1000}catch(e){}if(S.playing&&A.paused)A.play().catch(()=>{})}
    }
    prog();
  }
  const q=x=>$('#scene').querySelectorAll(x);
  function run(s){
    if(s.show)q(s.show).forEach(e=>e.classList.remove('hid'));
    if(s.hide)q(s.hide).forEach(e=>e.classList.add('hid'));
    if(s.hl)q(s.hl).forEach(e=>e.classList.add('hl'));
    if(s.unhl)q(s.unhl).forEach(e=>e.classList.remove('hl'));
    if(s.text){q(s.text[0]).forEach(e=>e.innerHTML=s.text[1]);fit()}
    if(s.fx)q(s.fx[0]).forEach(e=>{const c='fx-'+s.fx[1];e.classList.remove(c);void e.offsetWidth;e.classList.add(c)});
    if(s.fly){const a=q(s.fly[0])[0],b=q(s.fly[1])[0];if(a&&b){a.classList.remove('hid');
      const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
      a.animate([{transform:'none'},{transform:`translate(${(y.left+y.width/2-x.left-x.width/2)/(S.fit||1)}px,${(y.top+y.height/2-x.top-x.height/2)/(S.fit||1)}px)`}],{duration:S.ff?0:900,easing:'ease-in-out',fill:'forwards'})}}
    if(s.run)s.run($('#scene'));
  }
  function fire(t){while(S.k<S.steps.length&&S.steps[S.k].t<=t)run(S.steps[S.k++])}
  function tick(now){
    if(!S.playing)return;
    const dt=now-S.last;S.last=now;
    if(S.mode==='audio'){
      if(S.holding){
        S.pos+=dt;
        const sec=Math.floor((S.pos-S.hStart)/1000);
        if(sec!==S.lastSec&&S.pos<S.hEnd){S.lastSec=sec;beep()}
        if(S.pos>=S.hEnd)endHold()
      }else{
        S.pos=A.currentTime*1000+S.off;if(A.ended)return done();
        const h=S.holds[S.hi];
        if(h&&S.pos>=h.t){S.hi++;S.holding=true;S.hStart=h.t;S.hEnd=h.t+h.d;S.pos=h.t;S.lastSec=0;A.pause();beep()}
      }
    }
    else{S.pos+=dt*S.rate;if(S.pos>=S.dur)return done()}
    fire(S.pos);prog();requestAnimationFrame(tick);
  }
  function done(){
    fire(Infinity);S.playing=false;ui();
    if(S.i<N-1)setTimeout(()=>{if(!S.playing){loadScene(S.i+1);play()}},700);
  }
  function play(){
    $('#start').classList.add('hidden');
    if(A.ended||S.pos>=S.dur-50)loadScene(S.i);
    S.playing=true;S.last=performance.now();
    if(S.mode==='audio'&&!S.holding)A.play().catch(()=>{if(A.error)S.mode='timer'});
    ui();requestAnimationFrame(tick);
  }
  function pause(){S.playing=false;A.pause();ui()}
  function go(i){if(i<0||i>=N)return;const w=S.playing;pause();loadScene(i);if(w)play()}
  const fmt=ms=>{const t=Math.max(0,Math.floor(ms/1000));return Math.floor(t/60)+':'+pad(t%60)};
  function prog(){
    $('#bar').value=Math.min(1000,S.pos/(S.dur||1)*1000);
    $('#cnt').textContent=`${fmt(S.pos)} / ${fmt(S.dur)}`;
    $('#bSkip').classList.toggle('hidden',!S.holding);
  }
  function endHold(){
    S.holding=false;S.pos=S.hEnd;S.off=S.hEnd-A.currentTime*1000;
    if(S.playing)A.play().catch(()=>{});
    fire(S.pos);prog();
  }
  function ui(){
    set($('#bPlay'),S.playing?'pause':'play');
    $('#bScript').title=S.mode==='timer'?'No audio file: timer mode':'';
  }
  $('#bPlay').onclick=()=>S.playing?pause():play();
  $('#start').onclick=play;
  $('#bPrev').onclick=()=>go(S.i-1);
  $('#bNext').onclick=()=>go(S.i+1);
  $('#bRe').onclick=()=>go(S.i);
  $('#bar').oninput=e=>jump(e.target.value/1000*(S.dur||S.end));
  $('#rate').onchange=e=>{S.rate=+e.target.value;A.playbackRate=S.rate};
  $('#bSkip').onclick=()=>{if(S.holding)endHold()};
  $('#bVol').onclick=toggleMute;
  $('#vbar').oninput=e=>setVol(e.target.value/100);
  $('#bFull').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
  $('#bScript').onclick=()=>{const b=$('#scriptBox');b.hidden=!b.hidden};
  addEventListener('keydown',e=>{
    if(e.target.tagName==='SELECT')return;
    if(e.code==='KeyM')toggleMute();
    if((e.code==='ArrowUp'||e.code==='ArrowDown')&&e.target.id!=='vbar'){e.preventDefault();setVol((muted?0:vol)+(e.code==='ArrowUp'?.05:-.05))}
    if(e.code==='Space'){e.preventDefault();$('#bPlay').click()}
    if(e.target.id==='vbar')return;
    if(e.code==='ArrowRight')go(S.i+1);if(e.code==='ArrowLeft')go(S.i-1);
  });
  applyVol();
  loadScene(0);
}
})();
