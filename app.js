const THEME_MODES=['auto','light','dark'];
const themeMedia=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
let themeMode=localStorage.getItem('themeMode')||'auto';

function applyTheme(){
  if(!THEME_MODES.includes(themeMode))themeMode='auto';
  const dark=themeMode==='dark'||(themeMode==='auto'&&themeMedia&&themeMedia.matches);
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  const theme=document.querySelector('meta[name="theme-color"]');
  if(theme)theme.setAttribute('content',dark?'#111210':'#f2f2ef');
  const button=document.getElementById('themeToggle');
  if(button){
    const labels={auto:'自动',light:'浅色',dark:'深色'};
    const icons={auto:'◐',light:'☼',dark:'☾'};
    button.querySelector('.theme-label').textContent=labels[themeMode];
    button.querySelector('.theme-icon').textContent=icons[themeMode];
    button.title=`显示模式：${labels[themeMode]}`;
  }
}

if(themeMedia)themeMedia.addEventListener('change',()=>{if(themeMode==='auto')applyTheme();});
applyTheme();

function formatFullDate() {
  const w=['周日','周一','周二','周三','周四','周五','周六'];
  const n=new Date();
  const y=n.getFullYear(),m=(n.getMonth()+1).toString().padStart(2,'0');
  const d=n.getDate().toString().padStart(2,'0'),wd=w[n.getDay()];
  const h=n.getHours().toString().padStart(2,'0'),mi=n.getMinutes().toString().padStart(2,'0'),s=n.getSeconds().toString().padStart(2,'0');
  return `${y}年${m}月${d}日 ${wd} ${h}:${mi}:${s}`;
}
function formatShortTime() {
  const n=new Date();
  const h=n.getHours().toString().padStart(2,'0'),mi=n.getMinutes().toString().padStart(2,'0'),s=n.getSeconds().toString().padStart(2,'0');
  return `${h}:${mi}:${s} 更新`;
}

function getColorClass(v){ if(v==null||isNaN(v))return ''; return v>0.001?'positive-text':v<-0.001?'negative-text':''; }
function getSummaryClass(v){ if(v==null||isNaN(v))return 'neutral'; return v>0.001?'positive':v<-0.001?'negative':'neutral'; }

let _jid=0;
function qqJsonp(codes,timeout=8000){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    const timer=setTimeout(()=>{s.remove();reject(new Error('timeout'));},timeout);
    s.onload=()=>{clearTimeout(timer);s.remove();const r={};codes.forEach(c=>{const v=window['v_'+c];if(v)r[c]=v;});resolve(r);};
    s.onerror=()=>{clearTimeout(timer);s.remove();reject(new Error('err'));};
    s.src=`https://qt.gtimg.cn/q=${codes.join(',')}`;
    document.head.appendChild(s);
  });
}

function parseQuote(code,raw){
  if(!raw)return null;
  const p=raw.split('~');
  const price=parseFloat(p[3]);
  if(!price||price<=0)return null;
  let dp=parseFloat(p[32]);
  if(isNaN(dp)){const prev=parseFloat(code.startsWith('hk')?p[5]:p[4]);if(prev>0)dp=((price-prev)/prev)*100;}
  return{code,price,dailyPct:isNaN(dp)?null:dp};
}

const CACHE={us:{rt:{},ytd:{},loaded:false},hk:{rt:{},ytd:{},loaded:false},a:{rt:{},ytd:{},loaded:false}};
const SHARE_CACHE={};
const VALUATION_CACHE={};
let currentValuationMarket='us';
const PAGE_TABS=['portfolio','valuation','research'];

function fmt(v){ if(v==null||isNaN(v))return '—'; return(v>0?'+':'')+v.toFixed(2)+'%'; }

function renderHoldings(key,rt,ytd){
  document.getElementById(`holdings-${key}`).innerHTML=PORTFOLIOS[key].holdings.map(h=>{
    const q=rt[h.code]||{},d=q.dailyPct,y=ytd[h.code];
    return`<div class="holding">
      <div class="weight">${h.weight}%</div>
      <div class="info"><div class="ticker">${h.display}</div><div class="name-cn">${h.nameCn}</div></div>
      <div class="change ${getColorClass(d)}">${fmt(d)}</div>
      <div class="change ${getColorClass(y)}">${fmt(y)}</div>
    </div>`;
  }).join('');
}

function renderSummary(key,rt,ytd){
  const port=PORTFOLIOS[key];
  let dW=0,yW=0,dOk=false,yOk=false;
  port.holdings.forEach(h=>{
    const w=h.weight/100,q=rt[h.code]||{},y=ytd[h.code];
    if(q.dailyPct!=null){dW+=q.dailyPct*w;dOk=true;}
    if(y!=null){yW+=y*w;yOk=true;}
  });
  const dv=dOk?dW:null,yv=yOk?yW:null;
  document.getElementById(`summary-${key}`).innerHTML=`
    <div class="summary-item ${getSummaryClass(dv)}"><div class="summary-label">当日</div><div class="summary-value">${fmt(dv)}</div></div>
    <div class="summary-item ${getSummaryClass(yv)}"><div class="summary-label">YTD</div><div class="summary-value">${fmt(yv)}</div></div>`;
}

function renderLoadingHoldings(key){
  document.getElementById(`holdings-${key}`).innerHTML=PORTFOLIOS[key].holdings.map(h=>`
    <div class="holding">
      <div class="weight">${h.weight}%</div>
      <div class="info"><div class="ticker">${h.display}</div><div class="name-cn">${h.nameCn}</div></div>
      <div class="change"><div class="loading-skeleton" style="width:50px;height:16px;margin-left:auto"></div></div>
      <div class="change"><div class="loading-skeleton" style="width:50px;height:16px;margin-left:auto"></div></div>
    </div>`).join('');
}

let currentSort='default';
function sortShares(mode){
  currentSort=mode;
  document.getElementById('sort-default').classList.toggle('active', mode==='default');
  document.getElementById('sort-since-desc').classList.toggle('active', mode==='since-desc');
  document.getElementById('sort-date-desc').classList.toggle('active', mode==='date-desc');
  renderShareRecords();
}

function getSharesSorted(){
  const list=[...SHARE_RECORDS.map((w,i)=>({...w,_i:i}))];
  const gs=w=>{const d=SHARE_CACHE[w.sym];return(d&&d.price&&w.price)?(d.price-w.price)/w.price*100:null;};
  if(currentSort==='since-desc') list.sort((a,b)=>{const sa=gs(a),sb=gs(b);if(sa==null&&sb==null)return 0;if(sa==null)return 1;if(sb==null)return -1;return sb-sa;});
  else if(currentSort==='date-desc')  list.sort((a,b)=>b.date.localeCompare(a.date));
  return list;
}

function renderShareRecords(){
  const container=document.getElementById('share-list');
  const list=getSharesSorted();
  const useGroup=(currentSort==='default');
  let html='';
  let lastGroup='';

  list.forEach(w=>{
    /* 默认排序时插入分组标题 */
    if(useGroup && w.group!==lastGroup){
      lastGroup=w.group;
      const col=GROUP_COLORS[w.group]||'var(--text-dim)';
      html+=`<div class="group-header">
        <span class="group-dot" style="background:${col}"></span>
        <span style="color:${col}">${w.group}</span>
      </div>`;
    }

    const d=SHARE_CACHE[w.sym]||{};
    const since=(d.price&&w.price)?((d.price-w.price)/w.price*100):null;
    const c1=getColorClass(d.dailyPct);
    const c2=getColorClass(since);
    const nowPrice=d.price?d.price.toFixed(2):'--';

    /* 价格追踪块 */
    const sinceClass=since==null?'flat':since>0.001?'up':'down';
    const priceBadge=`<div class="price-track">
      <div class="price-item"><span class="price-lbl">记录价</span><span class="price-val">${w.price.toFixed(2)}</span></div>
      <span class="price-arrow">→</span>
      <div class="price-item"><span class="price-lbl">现价</span><span class="price-val">${nowPrice}</span></div>
      <div class="price-since ${sinceClass}">${fmt(since)}</div>
    </div>`;

    html+=`<div class="share-item" onclick="toggleShareDetail('sd-${w._i}')">
      <div class="share-row">
        <div class="share-flag">${w.flag}</div>
        <div class="share-ticker">${w.ticker}</div>
        <div class="share-name">${w.name}</div>
        <div class="share-day ${c1}">${fmt(d.dailyPct)}</div>
        <div class="share-since ${c2}">${fmt(since)}</div>
      </div>
      <div class="share-detail" id="sd-${w._i}">
        <div class="detail-grid">
          <div class="detail-row sector-row"><span class="detail-label">行业</span>${w.sector}</div>
          <div class="detail-row info-row"><span class="detail-label">记录日期</span>${w.date}</div>
        </div>
        <div class="detail-row logic-row"><span class="detail-label">逻辑</span>${w.logic}</div>
        <div class="detail-row analysis-row"><span class="detail-label">分析</span>${w.analysis}</div>
        ${priceBadge}
      </div>
    </div>`;
  });
  container.innerHTML=html;
}

function toggleShareDetail(id){
  document.getElementById(id).classList.toggle('open');
}

async function loadPortfolio(key){
  const port=PORTFOLIOS[key],c=CACHE[key];
  if(!c.loaded)renderLoadingHoldings(key);
  try{
    const codes=port.holdings.map(h=>h.code);
    const rawMap=await qqJsonp(codes);
    port.holdings.forEach(h=>{
      const q=parseQuote(h.code,rawMap[h.code]);
      if(q){c.rt[h.code]=q;const base=YTD_BASE[h.code];if(base>0&&q.price>0)c.ytd[h.code]=((q.price-base)/base)*100;}
    });
  }catch(e){}
  renderHoldings(key,c.rt,c.ytd);
  renderSummary(key,c.rt,c.ytd);
  c.loaded=true;
}

async function loadShareRecords(){
  try{
    const codes=SHARE_RECORDS.map(w=>w.sym);
    const rawMap=await qqJsonp(codes);
    SHARE_RECORDS.forEach(w=>{
      const q=parseQuote(w.sym,rawMap[w.sym]);
      if(q)SHARE_CACHE[w.sym]=q;
    });
  }catch(e){}
  renderShareRecords();
}

function valuationPrice(v){
  const quote=VALUATION_CACHE[v.sym];
  return quote&&quote.price?quote.price:v.snapshot;
}

function valuationState(v,price){
  if(price<=v.buy[0]) return {key:'strong-buy',label:'深度买入区',hint:'低于第一档理想买点'};
  if(price<=v.buy[1]) return {key:'buy',label:'理想买入区',hint:'已进入理想买点'};
  if(price<v.fair[0]) return {key:'watch',label:'等待区',hint:'距离合理价仍有空间'};
  if(price<v.sell[0]) return {key:'fair',label:'止盈观察',hint:'已达到合理股价'};
  return {key:'sell',label:'理想卖出区',hint:'已达到理想卖点'};
}

function compactPrice(value){
  if(value==null||isNaN(value))return '--';
  return value>=100?value.toFixed(0):value.toFixed(1);
}

function activeValuationGroup(){
  return window.VALUATION_GROUPS&&window.VALUATION_GROUPS[currentValuationMarket];
}

function renderValuations(){
  const container=document.getElementById('valuationList');
  const group=activeValuationGroup();
  if(!container||!group)return;
  const records=group.records;
  let buyCount=0,sellCount=0;
  container.innerHTML=records.map(v=>{
    const price=valuationPrice(v);
    const state=valuationState(v,price);
    if(state.key==='buy'||state.key==='strong-buy')buyCount++;
    if(state.key==='fair'||state.key==='sell')sellCount++;

    const min=v.buy[0]*0.82,max=v.sell[1]*1.08;
    const position=Math.max(1,Math.min(99,(price-min)/(max-min)*100));
    const buyEnd=(v.buy[1]-min)/(max-min)*100;
    const fairStart=(v.fair[0]-min)/(max-min)*100;
    const fairEnd=(v.fair[1]-min)/(max-min)*100;
    const sellStart=(v.sell[0]-min)/(max-min)*100;
    const live=VALUATION_CACHE[v.sym]&&VALUATION_CACHE[v.sym].price;
    const holding=v.holding?`${v.holding.toFixed(1)}%`:'观察';
    const currency=v.market==='US'?'$':v.market==='港股'?'HK$':'¥';

    return `<article class="valuation-row state-${state.key}">
      <div class="valuation-company">
        <div class="valuation-symbol-line">
          <strong>${v.name}</strong>
          ${state.key==='buy'||state.key==='strong-buy'?'<span class="signal-pill buy">买入信号</span>':''}
          ${state.key==='sell'?'<span class="signal-pill sell">卖出信号</span>':''}
        </div>
        <span><i class="market-mini ${v.market==='A股'?'cn':v.market==='港股'?'hk':'us'}">${v.market}</i>${v.ticker} · 持仓 ${holding}</span>
      </div>
      <div class="valuation-current">
        <strong>${currency}${compactPrice(price)}</strong>
        <span>${live?'实时行情':'周报参考价 · 非实时'}</span>
      </div>
      <div class="valuation-range">
        <div class="range-labels">
          <span>买 ${compactPrice(v.buy[0])}–${compactPrice(v.buy[1])}</span>
          <span>合理 ${compactPrice(v.fair[0])}–${compactPrice(v.fair[1])}</span>
          <span>卖 ${compactPrice(v.sell[0])}–${compactPrice(v.sell[1])}</span>
        </div>
        <div class="range-track">
          <i class="range-zone buy" style="width:${buyEnd}%"></i>
          <i class="range-zone fair" style="left:${fairStart}%;width:${Math.max(2,fairEnd-fairStart)}%"></i>
          <i class="range-zone sell" style="left:${sellStart}%;right:0"></i>
          <span class="price-pin" style="left:${position}%"><b>${currency}${compactPrice(price)}</b></span>
        </div>
      </div>
      <div class="valuation-status">
        <span class="status-chip ${state.key}">${state.label}</span>
        <small>${state.hint}</small>
      </div>
    </article>`;
  }).join('');

  document.getElementById('buySignalCount').textContent=buyCount;
  document.getElementById('sellSignalCount').textContent=sellCount;
  document.getElementById('valuationTotalCount').textContent=records.length;
  document.getElementById('valuationReserveLabel').textContent=group.reserveLabel;
  document.getElementById('valuationReserve').textContent=`${group.reserve.toFixed(1)}%`;
  document.getElementById('valuationSourceNote').textContent=
    `估值基准来自所提供的${currentValuationMarket==='us'?'美股':'A/H 股'}周报截图，双数值代表两档情景假设；实时价格仅用于定位区间。`;
}

async function loadValuations(){
  if(!window.VALUATION_GROUPS)return;
  try{
    const allRecords=Object.values(VALUATION_GROUPS).flatMap(group=>group.records);
    const codes=allRecords.map(v=>v.sym);
    const rawMap=await qqJsonp(codes);
    allRecords.forEach(v=>{
      const q=parseQuote(v.sym,rawMap[v.sym]);
      if(q)VALUATION_CACHE[v.sym]=q;
    });
  }catch(e){}
  renderValuations();
}

function switchValuationMarket(market){
  if(!window.VALUATION_GROUPS||!VALUATION_GROUPS[market])return;
  currentValuationMarket=market;
  document.querySelectorAll('.valuation-tab').forEach(button=>{
    const active=button.dataset.market===market;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  renderValuations();
}

function switchPageTab(tab,{updateHash=true,scroll=true}={}){
  if(!PAGE_TABS.includes(tab))tab='portfolio';
  const contextText={
    portfolio:'行情每 30 秒刷新 · 组合收益按当前权重估算',
    valuation:'估值基准来自周报 · 实时行情仅用于区间定位',
    research:'记录价对比实时行情 · 内容不构成投资建议'
  };
  document.querySelectorAll('[data-page-tab]').forEach(button=>{
    const active=button.dataset.pageTab===tab;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
  document.querySelectorAll('[data-page-panel]').forEach(panel=>{
    const active=panel.dataset.pagePanel===tab;
    panel.classList.toggle('active',active);
    panel.hidden=!active;
  });
  const context=document.getElementById('dataContextText');
  if(context)context.textContent=contextText[tab];
  if(updateHash)history.replaceState(null,'',`#${tab}`);
  if(scroll){
    const tabs=document.querySelector('.page-tabs');
    const top=tabs?tabs.getBoundingClientRect().top+window.scrollY-12:0;
    window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
  }
}

function pageTabFromHash(){
  const tab=window.location.hash.replace('#','');
  return PAGE_TABS.includes(tab)?tab:'portfolio';
}

function setStatus(s,m){
  const dot=document.getElementById('statusDot');
  const text=document.getElementById('statusText');
  dot.className='dot '+(s==='ok'?'':s==='loading'?'loading':'error');
  text.textContent=s==='ok'&&window.matchMedia('(max-width:640px)').matches?formatShortTime():m;
  text.title=m;
}

function scheduleNextRefresh(){
  clearTimeout(_timer);
  if(!document.hidden) _timer=setTimeout(refreshAll,30000);
}

let _timer=null,_first=true;
async function refreshAll(){
  if(document.hidden){
    scheduleNextRefresh();
    return;
  }
  const btn=document.getElementById('btnRefresh');
  btn.disabled=true;
  const t0=performance.now();
  setStatus('loading',_first?'正在获取数据...':'刷新中...');
  try{
    await Promise.allSettled([...['us','hk','a'].map(k=>loadPortfolio(k)),loadShareRecords(),loadValuations()]);
    _first=false;
    setStatus('ok',formatFullDate());
    const badge=document.getElementById('updateBadge');
    if(badge) badge.textContent=formatShortTime();
  }catch(e){setStatus('error','加载失败');}
  btn.disabled=false;
  scheduleNextRefresh();
}

document.addEventListener('DOMContentLoaded',()=>{
  applyTheme();
  ['us','hk','a'].forEach(k=>renderLoadingHoldings(k));
  renderShareRecords();
  renderValuations();
  document.querySelectorAll('.valuation-tab').forEach(button=>{
    button.addEventListener('click',()=>switchValuationMarket(button.dataset.market));
  });
  document.querySelectorAll('[data-page-tab]').forEach(button=>{
    button.addEventListener('click',()=>switchPageTab(button.dataset.pageTab));
  });
  const context=document.getElementById('dataContextText');
  if(context)context.textContent=contextText[tab];
  document.getElementById('themeToggle')?.addEventListener('click',()=>{
    themeMode=THEME_MODES[(THEME_MODES.indexOf(themeMode)+1)%THEME_MODES.length];
    localStorage.setItem('themeMode',themeMode);
    applyTheme();
  });
  switchPageTab(pageTabFromHash(),{updateHash:false,scroll:false});
  refreshAll();
});

window.addEventListener('hashchange',()=>{
  switchPageTab(pageTabFromHash(),{updateHash:false,scroll:false});
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden) clearTimeout(_timer);
  else refreshAll();
});
