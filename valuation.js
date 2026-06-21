window.VALUATION_GROUPS = {
  us: {
    label:'美股估值',
    reserveLabel:'其他 / 美债',
    reserve:11.9,
    records:[
      { ticker:'MRVL', sym:'usMRVL', market:'US', name:'迈威尔科技', buy:[133.0,177.3], fair:[266.0,354.7], sell:[372.4,496.6], holding:8.9, targetHolding:8.5, snapshot:263.3 },
      { ticker:'GLW',  sym:'usGLW',  market:'US', name:'康宁',       buy:[100.6,134.2], fair:[201.3,268.4], sell:[281.8,375.7], holding:12.1, targetHolding:11.7, snapshot:179.3 },
      { ticker:'NEM',  sym:'usNEM',  market:'US', name:'纽蒙特',     buy:[74,98],       fair:[147,197],     sell:[206,275],     holding:11.2, targetHolding:11.4, snapshot:96.5 },
      { ticker:'NVDA', sym:'usNVDA', market:'US', name:'英伟达',     buy:[143,190],     fair:[285,380],     sell:[399,532],     holding:9.7, targetHolding:10.0, snapshot:202.3 },
      { ticker:'SNDK', sym:'usSNDK', market:'US', name:'闪迪',       buy:[878,1171],    fair:[1757,2342],   sell:[2459,3279],   holding:37.7, targetHolding:36.1, snapshot:1558.9 },
      { ticker:'BE',   sym:'usBE',   market:'US', name:'Bloom Energy',buy:[119.0,158.7],fair:[238.0,317.4], sell:[333.2,444.3], holding:0, targetHolding:0, snapshot:267.3 },
      { ticker:'MU',   sym:'usMU',   market:'US', name:'美光科技',   buy:[502,669],     fair:[1003,1338],   sell:[1405,1873],   holding:0, targetHolding:0, snapshot:864.1 },
      { ticker:'LITE', sym:'usLITE', market:'US', name:'Lumentum',   buy:[450,600],     fair:[900,1200],    sell:[1260,1680],   holding:8.6, targetHolding:9.8, snapshot:867.5 },
      { ticker:'NOK',  sym:'usNOK',  market:'US', name:'诺基亚',     buy:[7.2,9.6],     fair:[14.4,19.2],   sell:[20.2,26.9],   holding:0, targetHolding:0, snapshot:10.1 }
    ]
  },
  ah: {
    label:'A / H 股估值',
    reserveLabel:'其他',
    reserve:3.9,
    records:[
      { ticker:'300502', sym:'sz300502', market:'A股', name:'新易盛',   buy:[443,591],       fair:[886,1181],     sell:[1329,1772], holding:25.0, targetHolding:23.6, snapshot:705 },
      { ticker:'300308', sym:'sz300308', market:'A股', name:'中际旭创', buy:[874,1166],      fair:[1749,2332],    sell:[2448,3265], holding:33.8, targetHolding:30.9, snapshot:1158 },
      { ticker:'300476', sym:'sz300476', market:'A股', name:'胜宏科技', buy:[272.8,363.7],   fair:[545.5,727.4],  sell:[818.3,1091],holding:0, targetHolding:0, snapshot:419.3 },
      { ticker:'09992',  sym:'hk09992',  market:'港股', name:'泡泡玛特', buy:[140.6,187.4],   fair:[281.2,374.9],  sell:[421.7,562.3],holding:0, targetHolding:0, snapshot:172 },
      { ticker:'600547', sym:'sh600547', market:'A股', name:'山东黄金', buy:[18,24],         fair:[36,48],        sell:[54,72],      holding:0, targetHolding:0, snapshot:23.9 },
      { ticker:'06869',  sym:'hk06869',  market:'港股', name:'长飞光纤', buy:[151,201.3],     fair:[301.9,402.6],  sell:[452.9,603.9],holding:27.5, targetHolding:31.0, snapshot:227 },
      { ticker:'01138',  sym:'hk01138',  market:'港股', name:'中远海能', buy:[10.7,14.3],     fair:[21.5,28.6],    sell:[32.2,42.9],  holding:0, targetHolding:0, snapshot:16 },
      { ticker:'03993',  sym:'hk03993',  market:'港股', name:'洛阳钼业', buy:[13,18],         fair:[27,36],        sell:[38,50],      holding:9.8, targetHolding:10.6, snapshot:18.3 },
      { ticker:'02899',  sym:'hk02899',  market:'港股', name:'紫金矿业', buy:[28,37],         fair:[56,74],        sell:[78,104],     holding:0, targetHolding:0, snapshot:32.8 }
    ]
  }
};

window.VALUATION_RECORDS = window.VALUATION_GROUPS.us.records;
