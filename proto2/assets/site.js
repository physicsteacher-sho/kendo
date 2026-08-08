
/* HEADER HEIGHT --------------------------------------------------- */
/* 緊急告知の有無や折り返しでヘッダー高さが変わるので実測値を CSS 変数に流す */
try{
  const hd=document.querySelector('.header');
  if(hd){
    const sync=()=>document.body.style.setProperty('--header-h',hd.offsetHeight+'px');
    sync();
    if('ResizeObserver' in window){new ResizeObserver(sync).observe(hd)}
    else{addEventListener('resize',sync)}
    addEventListener('load',sync);
  }
}catch(e){}

/* MENU ------------------------------------------------------------ */
try{
  const btn=document.querySelector('.menu-btn'),panel=document.querySelector('.menu-panel'),
        main=document.querySelector('main');
  if(btn&&panel){
    const links=panel.querySelectorAll('a'),
          hasInert='inert' in HTMLElement.prototype;
    const setOpen=o=>{
      panel.classList.toggle('open',o);
      btn.setAttribute('aria-expanded',String(o));
      document.documentElement.classList.toggle('menu-open',o);
      if(hasInert){panel.inert=!o; if(main){main.inert=o}}
      if(o){if(links[0]){links[0].focus()}}else{btn.focus()}
    };
    if(hasInert){panel.inert=true}
    btn.addEventListener('click',()=>setOpen(!panel.classList.contains('open')));
    links.forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&panel.classList.contains('open')){setOpen(false)}
    });
  }
}catch(e){}

/* COUNTDOWN ------------------------------------------------------- */
try{
  document.querySelectorAll('[data-countdown]').forEach(el=>{
    const target=new Date(el.dataset.countdown+'T00:00:00+09:00');
    const label=el.parentElement.querySelector('[data-countdown-label]');
    if(isNaN(target)){el.textContent='\u2014';return}
    const days=Math.ceil((target-Date.now())/864e5);
    el.textContent=days>0?days:0;
    if(label)label.textContent=days>1?'DAYS TO GO':days===1?'DAY TO GO':days===0?'TODAY':'EVENT CLOSED';
  });
}catch(e){}

/* REVEAL ---------------------------------------------------------- */
/* js クラスは IntersectionObserver が使える時だけ付与する。
   途中でエラーが出た場合は catch で外し、全要素を可視状態に戻す。 */
try{
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('js');
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    }),{threshold:.15});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }
}catch(e){
  document.documentElement.classList.remove('js');
}

/* NEWS FILTER + PAGER --------------------------------------------- */
try{
  const list=document.getElementById('newslist');
  if(list){
    const items=Array.from(list.children),
          chips=Array.from(document.querySelectorAll('.chip')),
          empty=document.getElementById('newsempty'),
          pager=document.getElementById('pager'),
          PER=8;
    let cat='all', page=1;

    const matched=()=>cat==='all'?items:items.filter(el=>el.dataset.cat===cat);

    const draw=()=>{
      const hit=matched(), pages=Math.max(1,Math.ceil(hit.length/PER));
      if(page>pages){page=pages}
      items.forEach(el=>{el.hidden=true});
      hit.slice((page-1)*PER,page*PER).forEach(el=>{el.hidden=false});
      if(empty){empty.hidden=hit.length>0}
      list.hidden=hit.length===0;
      chips.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.filter===cat)));
      if(pager){
        pager.innerHTML='';
        if(pages>1){
          const mk=(label,to,opt)=>{
            const b=document.createElement('button');
            b.textContent=label;
            if(opt==='current'){b.setAttribute('aria-current','page')}
            if(opt==='off'){b.disabled=true}
            else{b.addEventListener('click',()=>{page=to;draw();
              document.querySelector('.filter').scrollIntoView({block:'start'})})}
            pager.appendChild(b);
          };
          mk('←',page-1,page===1?'off':null);
          for(let n=1;n<=pages;n++){mk(String(n),n,n===page?'current':null)}
          mk('→',page+1,page===pages?'off':null);
        }
      }
    };

    chips.forEach(c=>c.addEventListener('click',()=>{cat=c.dataset.filter;page=1;draw();
      history.replaceState(null,'',cat==='all'?location.pathname:'#cat-'+cat)}));

    const h=(location.hash||'').replace('#cat-','');
    if(h&&chips.some(c=>c.dataset.filter===h)){cat=h}
    draw();
  }
}catch(e){}
