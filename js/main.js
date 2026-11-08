(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
  var pad=function(n){return n<10?'0'+n:''+n};

  /* ---------- navigation ---------- */
  var nav=$('#nav'), burger=$('#burger'), mmenu=$('#mmenu');
  function setMenu(open){
    mmenu.classList.toggle('open',open);
    nav.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    document.body.style.overflow=open?'hidden':'';
  }
  burger.addEventListener('click',function(){setMenu(!mmenu.classList.contains('open'))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  function goTo(id){
    var t=id==='top'?document.body:document.getElementById(id);
    if(!t)return;
    var y=id==='top'?0:t.getBoundingClientRect().top+window.pageYOffset-(id==='menu'||id==='why'?0:0);
    window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
  }
  var goingToMenu=false;
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var h=a.getAttribute('href').slice(1);
      if(a.hasAttribute('data-soon')||!h)return;
      if(a.dataset.cat){setCat(a.dataset.cat)}
      setMenu(false);
      goTo(h);
    });
  });
  $('#toTop').addEventListener('click',function(){goTo('top')});

  /* ---------- reveal ---------- */
  var rvs=$$('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
    rvs.forEach(function(el){io.observe(el)});
  } else { rvs.forEach(function(el){el.classList.add('in')}) }

  /* ---------- statement words ---------- */
  var stH=$('#stH'), words=[];
  (function(){
    var txt=stH.textContent.trim().split(/\s+/);
    stH.textContent='';
    txt.forEach(function(w,i){
      var s=document.createElement('span');
      s.className='w'+(w.indexOf('спешим')===0?' hot':'');
      s.textContent=w;
      stH.appendChild(s);
      if(i<txt.length-1)stH.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  })();

  /* ---------- scroll-linked effects ---------- */
  var heroImg=$('#heroImg'), archImg=$('#archImg'), whyImg=$('#whyImg'), ctImg=$('#ctImg'), fWord=$('#fWord'), hero=$('#hero');
  var ticking=false;
  function relCenter(el){var r=el.getBoundingClientRect();return (r.top+r.height/2-window.innerHeight/2)/window.innerHeight}
  function frame(){
    ticking=false;
    var y=window.pageYOffset, vh=window.innerHeight;
    nav.classList.toggle('solid',y>40);
    if(!reduce){
      if(y<hero.offsetHeight+100)heroImg.style.setProperty('--py',(y*.1)+'px');
      archImg.style.setProperty('--ay',(relCenter(archImg.parentNode)*-50)+'px');
      whyImg.style.setProperty('--wy',(relCenter(whyImg.parentNode)*-44)+'px');
      ctImg.style.setProperty('--cy',(relCenter(ctImg.parentNode)*-44)+'px');
      var fr=fWord.getBoundingClientRect();
      fWord.style.setProperty('--fy',clamp((vh-fr.top)*.06-30,-30,40)+'px');
    }
    var r=stH.getBoundingClientRect();
    var p=clamp((vh*.82-r.top)/(r.height+vh*.28),0,1);
    var n=reduce?words.length:Math.round(p*words.length*1.12);
    words.forEach(function(w,i){w.classList.toggle('on',i<n)});
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  frame();

  /* ---------- gallery ---------- */
  var gal=$('#gallery'), vp=$('#gView'), track=$('#gTrack'), slides=$$('.g-slide'), dotsBox=$('#gDots'), cnt=$('#gCount');
  var MS=3000, idx=0, step=0, maxIdx=0, maxShift=0, timer=null, drag=null, visible=true, dots=[];
  gal.style.setProperty('--ms',MS+'ms');
  function shiftFor(i){return Math.min(i*step,maxShift)}
  function setX(x,anim){track.style.transition=anim?'':'none';track.style.transform='translate3d('+(-x)+'px,0,0)'}
  function buildDots(){
    dotsBox.innerHTML=''; dots=[];
    for(var i=0;i<=maxIdx;i++){
      var b=document.createElement('button');
      b.type='button';b.className='g-dot';b.setAttribute('aria-label','Слайд '+(i+1));
      (function(k){b.addEventListener('click',function(){go(k);start()})})(i);
      dotsBox.appendChild(b);dots.push(b);
    }
  }
  function mark(){
    dots.forEach(function(d,i){d.classList.remove('on')});
    void dotsBox.offsetWidth;
    if(dots[idx])dots[idx].classList.add('on');
    cnt.textContent=pad(idx+1)+' / '+pad(maxIdx+1);
  }
  function go(i,anim){
    idx=clamp(i,0,maxIdx);
    setX(shiftFor(idx),anim!==false);
    mark();
  }
  function measure(){
    if(slides.length<2)return;
    step=slides[1].offsetLeft-slides[0].offsetLeft;
    var padL=parseFloat(getComputedStyle(vp).paddingLeft)||0;
    var avail=vp.clientWidth-padL;
    maxShift=Math.max(0,track.scrollWidth-avail);
    maxIdx=Math.max(0,Math.ceil(maxShift/step));
    idx=Math.min(idx,maxIdx);
    buildDots();
    setX(shiftFor(idx),false);
    mark();
  }
  function stop(){clearTimeout(timer);timer=null}
  function start(){
    stop();
    mark();
    gal.classList.remove('paused');
    if(reduce||!visible)return;
    timer=setTimeout(function(){go(idx>=maxIdx?0:idx+1);start()},MS);
  }
  function pause(){stop();gal.classList.add('paused')}
  $('#gNext').addEventListener('click',function(){go(idx>=maxIdx?0:idx+1);start()});
  $('#gPrev').addEventListener('click',function(){go(idx<=0?maxIdx:idx-1);start()});
  vp.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    drag={x:e.clientX,base:shiftFor(idx),dx:0};
    stop();vp.classList.add('grab');setX(drag.base,false);
    try{vp.setPointerCapture(e.pointerId)}catch(_){}
  });
  vp.addEventListener('pointermove',function(e){
    if(!drag)return;
    drag.dx=e.clientX-drag.x;
    setX(clamp(drag.base-drag.dx,-80,maxShift+80),false);
  });
  var wheelLock=0;
  vp.addEventListener('wheel',function(e){
    if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)||Math.abs(e.deltaX)<12)return;
    e.preventDefault();
    var now=Date.now();if(now-wheelLock<500)return;wheelLock=now;
    go(idx+(e.deltaX>0?1:-1));start();
  },{passive:false});
  vp.tabIndex=0;
  vp.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){e.preventDefault();go(idx+1);start()}
    else if(e.key==='ArrowLeft'){e.preventDefault();go(idx-1);start()}
  });
  function endDrag(){
    if(!drag)return;
    var dx=drag.dx;drag=null;vp.classList.remove('grab');
    if(Math.abs(dx)>Math.max(40,step*.16))go(idx+(dx<0?1:-1));else go(idx);
    start();
  }
  vp.addEventListener('pointerup',endDrag);
  vp.addEventListener('pointercancel',endDrag);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible){if(!drag)start()}else stop()},{threshold:.15}).observe(vp);
  }
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
  window.addEventListener('load',measure);
  measure();start();

  /* ---------- menu ---------- */
  var MENU={
    coffee:{label:'Кофе',items:[
      {n:'Эспрессо',d:'Двойной шот кофе нашей обжарки',p:190},
      {n:'Американо',d:'Эспрессо и горячая вода',p:220},
      {n:'Капучино',d:'Эспрессо и нежная молочная пена',p:290},
      {n:'Латте',d:'Много молока, мягкий сливочный вкус',p:310},
      {n:'Флэт уайт',d:'Двойной ристретто и бархатное молоко',p:330},
      {n:'Моккачино',d:'Эспрессо, шоколад и молоко',p:350,t:'Фирменный'},
      {n:'Раф',d:'Сливки, ванильный сахар и эспрессо',p:360},
      {n:'V60',d:'Фильтр-кофе ручной заварки, зерно на выбор',p:380}
    ]},
    drinks:{label:'Не кофе',items:[
      {n:'Матча латте',d:'Японская матча и молоко на выбор',p:360},
      {n:'Какао',d:'Густое какао на цельном молоке',p:290},
      {n:'Горячий шоколад',d:'Бельгийский шоколад и сливки',p:330},
      {n:'Чай листовой',d:'Чёрный, зелёный или травяной',p:250},
      {n:'Облепиховый чай',d:'С мёдом и имбирём',p:340},
      {n:'Лимонад дня',d:'Сезонные ягоды и цитрусы',p:320}
    ]},
    desserts:{label:'Десерты',items:[
      {n:'Круассан сливочный',d:'Хрустящий, слоистый, выпекаем утром',p:210},
      {n:'Миндальный круассан',d:'С миндальным кремом и лепестками',p:280},
      {n:'Чизкейк Сан-Себастьян',d:'Нежный, с карамельной корочкой',p:340,t:'Хит'},
      {n:'Тирамису',d:'Маскарпоне, савоярди и эспрессо',p:360},
      {n:'Брауни',d:'Тёмный шоколад и морская соль',p:260},
      {n:'Морковный пирог',d:'Со сливочным кремом и орехами',p:290}
    ]},
    breakfast:{label:'Завтраки',items:[
      {n:'Сырники с клубникой',d:'С ягодами, бананом и шоколадной пастой',p:420,t:'Хит'},
      {n:'Омлет с сыром',d:'С зеленью и поджаренным хлебом',p:390},
      {n:'Тост с авокадо',d:'С яйцом пашот и семенами',p:450},
      {n:'Гранола с йогуртом',d:'Домашняя гранола и свежие ягоды',p:340},
      {n:'Овсяная каша',d:'На молоке или растительном напитке',p:310}
    ]}
  };
  var order=['coffee','drinks','desserts','breakfast'], cat='coffee';
  var tabsBox=$('#tabs'), list=$('#mList');
  var pv=$('#pv'), pvImg=$('#pvImg'), pvInfo=$('#pvInfo'), pvName=$('#pvName'), pvDesc=$('#pvDesc'), pvPrice=$('#pvPrice');
  var money=function(n){return n+' ₽'};
  order.forEach(function(k){
    var b=document.createElement('button');
    b.type='button';b.className='tab';b.setAttribute('role','tab');b.dataset.k=k;b.textContent=MENU[k].label;
    b.addEventListener('click',function(){setCat(k)});
    tabsBox.appendChild(b);
  });
  var swapT;
  function showPreview(it){
    clearTimeout(swapT);
    pvInfo.classList.add('swap');
    swapT=setTimeout(function(){
      pvName.textContent=it.n;pvDesc.textContent=it.d;pvPrice.textContent=money(it.p);
      if(it.img){pvImg.style.backgroundImage='url("'+it.img+'")';pv.classList.add('has-img')}
      else{pvImg.style.backgroundImage='';pv.classList.remove('has-img')}
      pvInfo.classList.remove('swap');
    },reduce?0:160);
  }
  function renderMenu(){
    $$('.tab').forEach(function(t){t.setAttribute('aria-selected',t.dataset.k===cat?'true':'false')});
    list.innerHTML='';
    MENU[cat].items.forEach(function(it,i){
      var li=document.createElement('li');
      li.className='item';li.tabIndex=0;li.style.setProperty('--d',(i*55)+'ms');
      li.innerHTML='<h3></h3><p></p><span class="price"></span>';
      li.querySelector('h3').textContent=it.n;
      if(it.t){var s=document.createElement('span');s.className='tag';s.textContent=it.t;li.querySelector('h3').appendChild(s)}
      li.querySelector('p').textContent=it.d;
      li.querySelector('.price').textContent=money(it.p);
      var act=function(){$$('.item',list).forEach(function(x){x.classList.remove('cur')});li.classList.add('cur');showPreview(it)};
      li.addEventListener('mouseenter',act);
      li.addEventListener('focus',act);
      list.appendChild(li);
    });
    var first=$('.item',list);
    if(first)first.classList.add('cur');
    var f=MENU[cat].items[0];
    pvName.textContent=f.n;pvDesc.textContent=f.d;pvPrice.textContent=money(f.p);
    if(f.img){pvImg.style.backgroundImage='url("'+f.img+'")';pv.classList.add('has-img')}else{pvImg.style.backgroundImage='';pv.classList.remove('has-img')}
  }
  function setCat(k){if(!MENU[k])return;cat=k;renderMenu()}
  window.setCat=setCat;
  renderMenu();

  /* ---------- open status ---------- */
  (function(){
    var d=new Date(), h=d.getHours()+d.getMinutes()/60;
    var st=$('#status'), tx=$('#statusText');
    if(h>=8&&h<22){tx.textContent='Сейчас открыто до 22:00'}
    else{st.classList.add('closed');tx.textContent='Сейчас закрыто, откроемся в 08:00'}
  })();
})();
