if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const upd = () => {
    const dark=mq.matches;
    document.documentElement.setAttribute('data-theme',dark?'dark':'light');
    const theme=document.querySelector('meta[name="theme-color"]');
    if(theme)theme.setAttribute('content',dark?'#111210':'#f2f2ef');
  };
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
    codes.forEach(code=>{
      try{ delete window['v_'+code]; }catch(_error){ window['v_'+code]=undefined; }
    });
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
  return{code,price,dailyPct:isNaN(dp)?null:dp,quoteTime:p[30]||''};
}

const CACHE={us:{rt:{},ytd:{},loaded:false},hk:{rt:{},ytd:{},loaded:false},a:{rt:{},ytd:{},loaded:false}};
const SHARE_CACHE={};
const VALUATION_CACHE={};
const HISTORY_CACHE={};
const PORTFOLIO_CHART_STATE={us:'all',hk:'all',a:'all'};
let currentValuationMarket='us';
const PAGE_TABS=['portfolio','valuation','research'];
const PORTFOLIO_START_DATE=window.PORTFOLIO_CONFIG?.startDate||'2026-01-01';

function fmt(v){ if(v==null||isNaN(v))return '—'; return(v>0?'+':'')+v.toFixed(2)+'%'; }
function fmtNav(v){ if(v==null||isNaN(v))return '1.0000'; return(1+v/100).toFixed(4); }

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
  const history=mergeLiveHistory(window.PORTFOLIO_HISTORY?.portfolios?.[key]||null,yv);
  renderPortfolioChart(key,dv,yv,history,false);
}

function mergeLiveHistory(points,liveYtd){
  if(!points?.length||liveYtd==null||isNaN(liveYtd))return points;
  const merged=points.map(point=>({...point}));
  const now=new Date();
  const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if(merged[merged.length-1].date===today)merged[merged.length-1].value=Number(liveYtd.toFixed(4));
  else merged.push({date:today,value:Number(liveYtd.toFixed(4)),intraday:true});
  return merged;
}

function filterChartPoints(points,range){
  if(range==='all')return points;
  const months=range==='3m'?3:6;
  const last=new Date(`${points[points.length-1].date}T00:00:00`);
  const cutoff=new Date(last);
  cutoff.setMonth(cutoff.getMonth()-months);
  return points.filter(point=>new Date(`${point.date}T00:00:00`)>=cutoff);
}

function chartScale(points){
  const vals=points.map(point=>point.value);
  let min=Math.min(...vals,0),max=Math.max(...vals,0);
  const span=Math.max(1,max-min);
  min-=span*.16; max+=span*.16;
  return {min,max};
}

function makeLinePath(points,w,h,left=48,right=10,top=12,bottom=28,scale=chartScale(points)){
  if(!points||points.length<2)return '';
  return points.map((p,i)=>{
    const x=left+(w-left-right)*(i/(points.length-1));
    const y=top+(h-top-bottom)*(1-(p.value-scale.min)/(scale.max-scale.min));
    return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function compactDate(date){
  const parts=date.split('-');
  return `${Number(parts[1])}月${Number(parts[2])}日`;
}

function maxDrawdown(points){
  let peak=1,drawdown=0;
  points.forEach(point=>{
    const nav=1+point.value/100;
    peak=Math.max(peak,nav);
    drawdown=Math.min(drawdown,(nav/peak-1)*100);
  });
  return drawdown;
}

function renderPortfolioChart(key,dailyValue,ytdValue,points,estimated=true){
  const el=document.getElementById(`chart-${key}`);
  if(!el)return;
  const previous=HISTORY_CACHE[key];
  const data=points&&points.length>1?points:
    previous&&previous.data?.length>1?previous.data:null;
  if(!data){
    el.innerHTML='<div class="chart-unavailable"><strong>历史走势暂不可用</strong><span>行情恢复后自动更新，不使用模拟曲线</span></div>';
    return;
  }
  HISTORY_CACHE[key]={data,daily:dailyValue,ytd:ytdValue,estimated};
  const range=PORTFOLIO_CHART_STATE[key]||'all';
  const visible=filterChartPoints(data,range);
  const latest=visible[visible.length-1]?.value??ytdValue;
  const first=visible[0]?.value||0;
  const periodReturn=((1+latest/100)/(1+first/100)-1)*100;
  const yearReturn=data[data.length-1]?.value??ytdValue;
  const drawdown=maxDrawdown(visible);
  const w=620,h=250,left=48,right=10,top=12,bottom=32;
  const scale=chartScale(visible);
  const line=makeLinePath(visible,w,h,left,right,top,bottom,scale);
  const plotBottom=h-bottom;
  const plotRight=w-right;
  const area=`${line} L${plotRight},${plotBottom} L${left},${plotBottom} Z`;
  const cls=getSummaryClass(latest);
  const ticks=Array.from({length:4},(_,i)=>scale.max-(scale.max-scale.min)*(i/3));
  const yTicks=ticks.map((value,i)=>{
    const y=top+(h-top-bottom)*(i/3);
    return `<line x1="${left}" y1="${y}" x2="${plotRight}" y2="${y}" class="chart-grid-line"></line>
      <text x="${left-7}" y="${y+4}" text-anchor="end" class="chart-y-label">${value.toFixed(1)}%</text>`;
  }).join('');
  const mid=visible[Math.floor((visible.length-1)/2)];
  el.innerHTML=`
    <div class="chart-head">
      <div class="chart-metrics">
        <div class="chart-metric primary ${getSummaryClass(yearReturn)}"><span>今年以来</span><strong>${fmt(yearReturn)}</strong></div>
        <div class="chart-metric ${getSummaryClass(dailyValue)}"><span>当日</span><strong>${fmt(dailyValue)}</strong></div>
        <div class="chart-metric neutral"><span>最新净值</span><strong>${fmtNav(yearReturn)}</strong></div>
      </div>
      <div class="chart-period-result ${getSummaryClass(periodReturn)}">
        <span>${range==='all'?'最大回撤':range==='3m'?'近3月':'近6月'}</span>
        <strong>${fmt(range==='all'?drawdown:periodReturn)}</strong>
      </div>
    </div>
    <div class="chart-plot" data-chart-key="${key}">
      <svg class="nav-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${PORTFOLIOS[key].name}净值走势">
        ${yTicks}
        <path class="chart-area ${cls}" d="${area}"></path>
        <path class="chart-line ${cls}" d="${line}"></path>
        <line class="chart-zero" x1="${left}" y1="${top+(h-top-bottom)*(1-(0-scale.min)/(scale.max-scale.min))}" x2="${plotRight}" y2="${top+(h-top-bottom)*(1-(0-scale.min)/(scale.max-scale.min))}"></line>
        <text x="${left}" y="${h-7}" text-anchor="start" class="chart-x-label">${compactDate(visible[0].date)}</text>
        <text x="${(left+plotRight)/2}" y="${h-7}" text-anchor="middle" class="chart-x-label">${compactDate(mid.date)}</text>
        <text x="${plotRight}" y="${h-7}" text-anchor="end" class="chart-x-label">${compactDate(visible[visible.length-1].date)}</text>
      </svg>
      <div class="chart-crosshair"><i></i><b></b></div>
      <div class="chart-tooltip"><span></span><strong></strong><em></em></div>
    </div>
    <div class="chart-footer">
      <span class="chart-origin">${PORTFOLIO_START_DATE} 起算 · 复权日线 · ${data[data.length-1]?.intraday?'盘中估算':'截至 '+compactDate(data[data.length-1].date)}</span>
      <div class="chart-ranges" role="group" aria-label="走势区间">
        <button class="${range==='3m'?'active':''}" onclick="setPortfolioRange('${key}','3m')">近3月</button>
        <button class="${range==='6m'?'active':''}" onclick="setPortfolioRange('${key}','6m')">近6月</button>
        <button class="${range==='all'?'active':''}" onclick="setPortfolioRange('${key}','all')">成立以来</button>
      </div>
    </div>`;
  bindChartPointer(key,visible,{left,right,top,bottom,w,h,scale});
}

function switchPortfolioView(key,view){
  const chart=document.getElementById(`chart-${key}`);
  const holdings=document.getElementById(`holdings-panel-${key}`);
  if(!chart||!holdings)return;
  const showChart=view==='chart';
  chart.hidden=!showChart;
  holdings.hidden=showChart;
  document.querySelectorAll(`[data-portfolio-key="${key}"]`).forEach(button=>{
    const active=button.dataset.portfolioView===view;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',active?'true':'false');
  });
}

function setPortfolioRange(key,range){
  PORTFOLIO_CHART_STATE[key]=range;
  const cache=HISTORY_CACHE[key];
  if(cache)renderPortfolioChart(key,cache.daily,cache.ytd,cache.data,cache.estimated);
}

function bindChartPointer(key,points,layout){
  const plot=document.querySelector(`#chart-${key} .chart-plot`);
  if(!plot||points.length<2)return;
  const crosshair=plot.querySelector('.chart-crosshair');
  const tooltip=plot.querySelector('.chart-tooltip');
  const update=event=>{
    const rect=plot.getBoundingClientRect();
    const localX=Math.max(0,Math.min(rect.width,event.clientX-rect.left));
    const plotStart=layout.left/layout.w*rect.width;
    const plotEnd=(layout.w-layout.right)/layout.w*rect.width;
    const ratio=Math.max(0,Math.min(1,(localX-plotStart)/(plotEnd-plotStart)));
    const index=Math.round(ratio*(points.length-1));
    const point=points[index];
    const x=plotStart+ratio*(plotEnd-plotStart);
    const yRatio=1-(point.value-layout.scale.min)/(layout.scale.max-layout.scale.min);
    const y=(layout.top/layout.h*rect.height)+yRatio*((layout.h-layout.top-layout.bottom)/layout.h*rect.height);
    crosshair.style.setProperty('--cursor-x',`${x}px`);
    crosshair.style.setProperty('--cursor-y',`${y}px`);
    tooltip.style.left=`${x}px`;
    tooltip.style.top=`${Math.max(4,y-10)}px`;
    tooltip.classList.toggle('align-right',x>rect.width*.68);
    tooltip.querySelector('span').textContent=point.date;
    tooltip.querySelector('strong').textContent=`${fmt(point.value)}`;
    tooltip.querySelector('em').textContent=`净值 ${fmtNav(point.value)}`;
    plot.classList.add('is-tracking');
  };
  plot.addEventListener('pointerdown',event=>{plot.setPointerCapture?.(event.pointerId);update(event);});
  plot.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'||plot.hasPointerCapture?.(event.pointerId))update(event);});
  plot.addEventListener('pointerleave',()=>plot.classList.remove('is-tracking'));
  plot.addEventListener('pointerup',event=>plot.releasePointerCapture?.(event.pointerId));
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

function allQuoteCodes(){
  const codes=new Set();
  Object.values(PORTFOLIOS).forEach(portfolio=>portfolio.holdings.forEach(holding=>codes.add(holding.code)));
  SHARE_RECORDS.forEach(record=>codes.add(record.sym));
  Object.values(window.VALUATION_GROUPS||{}).forEach(group=>group.records.forEach(record=>codes.add(record.sym)));
  return [...codes];
}

function applyQuoteMap(rawMap){
  const parsed={};
  allQuoteCodes().forEach(code=>{
    const quote=parseQuote(code,rawMap[code]);
    if(quote)parsed[code]=quote;
  });

  Object.entries(PORTFOLIOS).forEach(([key,portfolio])=>{
    const cache=CACHE[key];
    portfolio.holdings.forEach(holding=>{
      const quote=parsed[holding.code];
      if(!quote)return;
      cache.rt[holding.code]=quote;
      const base=YTD_BASE[holding.code];
      if(base>0)cache.ytd[holding.code]=((quote.price-base)/base)*100;
    });
    cache.loaded=true;
  });
  SHARE_RECORDS.forEach(record=>{if(parsed[record.sym])SHARE_CACHE[record.sym]=parsed[record.sym];});
  Object.values(window.VALUATION_GROUPS||{}).forEach(group=>group.records.forEach(record=>{
    if(parsed[record.sym])VALUATION_CACHE[record.sym]=parsed[record.sym];
  }));
  return {received:Object.keys(parsed).length,total:allQuoteCodes().length};
}

function renderAllData(){
  Object.keys(PORTFOLIOS).forEach(key=>{
    renderHoldings(key,CACHE[key].rt,CACHE[key].ytd);
    renderSummary(key,CACHE[key].rt,CACHE[key].ytd);
  });
  renderShareRecords();
  renderValuations();
}

async function refreshQuotes(){
  const codes=allQuoteCodes();
  const rawMap=await qqJsonp(codes);
  const stats=applyQuoteMap(rawMap);
  if(!stats.received)throw new Error('no quote data');
  return stats;
}

function valuationQuote(v){
  const quote=VALUATION_CACHE[v.sym];
  return {price:quote&&quote.price?quote.price:v.snapshot,live:Boolean(quote&&quote.price)};
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

function valuationSignalRank(key){
  return {
    'strong-buy':4,
    buy:3,
    sell:3,
    fair:2,
    watch:1
  }[key]||0;
}

function renderValuations(){
  const container=document.getElementById('valuationList');
  const group=activeValuationGroup();
  if(!container||!group)return;
  const records=group.records;
  let buyCount=0,sellCount=0;
  const orderedRecords=records.map(v=>{
    const {price,live}=valuationQuote(v);
    const state=valuationState(v,price);
    return {v,price,live,state};
  }).sort((a,b)=>{
    const holdingA=Number(a.v.holding)||0;
    const holdingB=Number(b.v.holding)||0;
    const activeA=holdingA>0?1:0;
    const activeB=holdingB>0?1:0;
    if(activeA!==activeB)return activeB-activeA;
    if(holdingA!==holdingB)return holdingB-holdingA;
    return valuationSignalRank(b.state.key)-valuationSignalRank(a.state.key);
  });

  container.innerHTML=orderedRecords.map(({v,price,live,state})=>{
    if(state.key==='buy'||state.key==='strong-buy')buyCount++;
    if(state.key==='fair'||state.key==='sell')sellCount++;

    const min=v.buy[0]*0.82,max=v.sell[1]*1.08;
    const position=Math.max(1,Math.min(99,(price-min)/(max-min)*100));
    const buyEnd=(v.buy[1]-min)/(max-min)*100;
    const fairStart=(v.fair[0]-min)/(max-min)*100;
    const fairEnd=(v.fair[1]-min)/(max-min)*100;
    const sellStart=(v.sell[0]-min)/(max-min)*100;
    const holding=v.holding?`${v.holding.toFixed(1)}%`:'观察';
    const holdingClass=v.holding?'active':'watch';
    const currency=v.market==='US'?'$':v.market==='港股'?'HK$':'¥';
    const isUs=currentValuationMarket==='us';
    const title=isUs?v.ticker:v.name;
    const badge=isUs?'':v.market;

    return `<article class="valuation-row state-${state.key}">
      <div class="valuation-company">
        <div class="valuation-symbol-line">
          ${badge?`<span class="valuation-ticker">${badge}</span>`:''}
          <strong>${title}</strong>
          <span class="valuation-holding ${holdingClass}">${v.holding?'持仓 ':''}${holding}</span>
          <span class="status-chip inline ${state.key}">${state.label}</span>
        </div>
      </div>
      <div class="valuation-current">
        <strong>${currency}${compactPrice(price)}</strong>
        ${live?'':'<span class="valuation-price-source">周报参考价</span>'}
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
    </article>`;
  }).join('');

  document.getElementById('buySignalCount').textContent=buyCount;
  document.getElementById('sellSignalCount').textContent=sellCount;
  document.getElementById('valuationTotalCount').textContent=records.length;
  document.getElementById('valuationReserveLabel').textContent=group.reserveLabel;
  document.getElementById('valuationReserve').textContent=`${group.reserve.toFixed(1)}%`;
  document.getElementById('valuationSourceNote').textContent=
    `估值基准来自所提供的${currentValuationMarket==='us'?'美股':'A/H 股'}周报截图，双数值代表两档情景假设。`;
  const updateStamp=document.getElementById('valuationUpdateStamp');
  if(updateStamp)updateStamp.textContent=`\u5468\u62a5\u66f4\u65b0\uff1a${window.VALUATION_UPDATED_AT||'--'}`;
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
  dot.className='dot '+(s==='ok'?'':s==='loading'?'loading':s==='warning'?'warning':'error');
  text.textContent=s==='ok'&&window.matchMedia('(max-width:640px)').matches?formatShortTime():m;
  text.title=m;
}

function scheduleNextRefresh(){
  clearTimeout(_timer);
  if(!document.hidden) _timer=setTimeout(refreshAll,30000);
}

let _timer=null,_first=true,_refreshing=false;
async function refreshAll(){
  if(document.hidden||_refreshing){
    scheduleNextRefresh();
    return;
  }
  _refreshing=true;
  const btn=document.getElementById('btnRefresh');
  btn.disabled=true;
  setStatus('loading',_first?'正在获取数据...':'刷新中...');
  try{
    const stats=await refreshQuotes();
    renderAllData();
    _first=false;
    if(stats.received<stats.total){
      setStatus('warning',`部分行情可用 · ${stats.received}/${stats.total}`);
    }else{
      setStatus('ok',formatFullDate());
    }
    const badge=document.getElementById('updateBadge');
    if(badge) badge.textContent=formatShortTime();
  }catch(e){
    renderAllData();
    setStatus('error','行情暂不可用 · 已保留现有数据');
  }
  btn.disabled=false;
  _refreshing=false;
  scheduleNextRefresh();
}

document.addEventListener('DOMContentLoaded',()=>{
  ['us','hk','a'].forEach(k=>renderLoadingHoldings(k));
  renderShareRecords();
  renderValuations();
  document.querySelectorAll('.valuation-tab').forEach(button=>{
    button.addEventListener('click',()=>switchValuationMarket(button.dataset.market));
  });
  document.querySelectorAll('[data-page-tab]').forEach(button=>{
    button.addEventListener('click',()=>switchPageTab(button.dataset.pageTab));
  });
  document.querySelectorAll('[data-portfolio-view]').forEach(button=>{
    button.addEventListener('click',()=>switchPortfolioView(button.dataset.portfolioKey,button.dataset.portfolioView));
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
