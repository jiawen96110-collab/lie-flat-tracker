if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const upd = () => document.documentElement.setAttribute('data-theme', mq.matches?'dark':'light');
  mq.addEventListener('change', upd); upd();
}

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

function setStatus(s,m){
  const dot=document.getElementById('statusDot');
  const text=document.getElementById('statusText');
  dot.className='dot '+(s==='ok'?'':s==='loading'?'loading':'error');
  text.textContent=m;
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
    await Promise.allSettled([...['us','hk','a'].map(k=>loadPortfolio(k)),loadShareRecords()]);
    _first=false;
    setStatus('ok',formatFullDate());
    const badge=document.getElementById('updateBadge');
    if(badge) badge.textContent=formatShortTime();
  }catch(e){setStatus('error','加载失败');}
  btn.disabled=false;
  scheduleNextRefresh();
}

document.addEventListener('DOMContentLoaded',()=>{
  ['us','hk','a'].forEach(k=>renderLoadingHoldings(k));
  renderShareRecords();
  refreshAll();
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden) clearTimeout(_timer);
  else refreshAll();
});
