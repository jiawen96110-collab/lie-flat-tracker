const PORTFOLIOS = window.PORTFOLIO_CONFIG.portfolios;
const YTD_BASE = Object.fromEntries(
  Object.values(PORTFOLIOS).flatMap(portfolio =>
    portfolio.holdings.map(holding => [holding.code, holding.base])
  )
);

/* 分享记录 — 含 group 字段用于分组 */
const SHARE_RECORDS = [
  /* AI光互连 */
  {ticker:'MRVL',  name:'迈威尔科技',sym:'usMRVL', flag:'🇺🇸',date:'2026-03-18',price:87.58,  group:'AI光互连',sector:'AI芯片/光互连',    logic:'AI数据中心定制芯片 + 光互连芯片双轮驱动',analysis:'AI数据中心核心标的，ASIC定制芯片+硅光互连，深度受益全球算力基建扩张'},
  {ticker:'AAOI',  name:'应用光电',  sym:'usAAOI', flag:'🇺🇸',date:'2026-04-10',price:150.60, group:'AI光互连',sector:'光模块/光通信',    logic:'AI算力光互连爆发 + 1.6T高速光模块放量',  analysis:'高速光模块龙头，垂直整合激光器芯片，深度受益AI算力网络需求爆发'},
  {ticker:'06869', name:'长飞光纤',  sym:'hk06869',flag:'🇭🇰',date:'2026-04-17',price:206.00, group:'AI光互连',sector:'光纤光缆/光通信',  logic:'AI算力光纤光缆刚需 + 海外出海',          analysis:'全球光纤光缆龙头，受益AI算力网络建设、海外需求复苏'},
  {ticker:'GLW',   name:'康宁',      sym:'usGLW',  flag:'🇺🇸',date:'2026-05-10',price:186.94, group:'AI光互连',sector:'光学玻璃/光通信',  logic:'AI高速光互连 + 硅光玻璃材料核心龙头',    analysis:'全球光学玻璃、硅光基板龙头，英伟达光网络合作核心供应商，受益AI算力光链路基建爆发'},
  {ticker:'002428',name:'云南锗业',  sym:'sz002428',flag:'🇨🇳',date:'2026-04-10',price:56.79,  group:'AI光互连',sector:'磷化铟/锗半导体',  logic:'光模块上游核心晶圆材料',                 analysis:'国内稀缺量产磷化铟晶圆企业，主营磷化铟单晶、锗基半导体衬底，AI光模块激光器核心上游原材料'},
  /* AI射频芯片 */
  {ticker:'300782',name:'卓胜微',    sym:'sz300782',flag:'🇨🇳',date:'2026-03-26',price:87.00,  group:'AI射频芯片',sector:'射频芯片',       logic:'AI手机射频升级 + 国产替代加速',           analysis:'国内射频前端龙头，垄断安卓高端机射频模组，受益AI手机射频复杂度提升与美国制裁替代窗口'},
  /* SpaceX概念 */
  {ticker:'300136',name:'信维通信',  sym:'sz300136',flag:'🇨🇳',date:'2026-04-22',price:79.52,  group:'SpaceX概念',sector:'卫星通信',       logic:'SpaceX星链终端核心供应商',                analysis:'射频天线+连接器，为SpaceX星链终端提供核心射频组件'},
  {ticker:'002149',name:'西部材料',  sym:'sz002149',flag:'🇨🇳',date:'2026-04-22',price:64.10,  group:'SpaceX概念',sector:'航天材料',       logic:'火箭发动机用稀有金属',                    analysis:'铌钛合金供货商，用于SpaceX火箭发动机高温部件'},
  {ticker:'603308',name:'应流股份',  sym:'sh603308',flag:'🇨🇳',date:'2026-04-22',price:75.45,  group:'SpaceX概念',sector:'航空航天',       logic:'航天发动机结构件',                        analysis:'高温合金部件制造商，供应SpaceX航天发动机关键结构件'},
  {ticker:'603601',name:'再升科技',  sym:'sh603601',flag:'🇨🇳',date:'2026-04-22',price:15.82,  group:'SpaceX概念',sector:'航天材料',       logic:'火箭隔热保温材料',                        analysis:'气凝胶供货商，为SpaceX火箭提供高效隔热保温材料'},
  {ticker:'605123',name:'派克新材',  sym:'sh605123',flag:'🇨🇳',date:'2026-04-22',price:104.29, group:'SpaceX概念',sector:'航空航天',       logic:'航天环形锻件',                            analysis:'高温合金定制件，用于SpaceX火箭及航天器结构'},

  /* 航天原材料 —— 新增分组 */
  {ticker:'601958',name:'金钼股份',  sym:'sh601958',flag:'🇨🇳',date:'2026-05-13',price:23.38, group:'航天原材料',sector:'钼/铼金属', logic:'钼行业龙头 + 铼金属副产品稀缺标的', analysis:'国内钼金属龙头，伴生稀有金属铼，航天发动机高温合金核心原材料，军民两用稀缺资源'},
   {ticker:'600497',name:'驰宏锌锗',  sym:'sh600497',flag:'🇨🇳',date:'2026-05-13',price:10.86, group:'航天原材料',sector:'铅锌/铼金属', logic:'铅锌冶炼龙头，伴生铼金属资源', analysis:'大型铅锌冶炼企业，冶炼环节副产稀有金属铼，航天高温合金上游重要原材料标的，资源属性突出'},
  {ticker:'FCX',   name:'麦克莫兰铜金',sym:'usFCX', flag:'🇺🇸',date:'2026-05-13',price:67.16, group:'航天原材料',sector:'铜/钼/稀有金属', logic:'全球铜钼龙头 + 航天级原材料供应', analysis:'全球顶级铜钼资源商，钼金属广泛用于航空发动机、火箭高温部件，受益航天产业扩张'},
];

/* 分组颜色映射 */
const GROUP_COLORS = {
  'AI光互连':      '#4e9ef8',
  'AI射频芯片':    '#a855f7',
  'SpaceX概念':    '#f97316',
  '航天原材料':    '#e67e22',
};
