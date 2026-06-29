window.VALUATION_GROUPS = {
  us: {
    label: '美股估值',
    reserveLabel: '其他 / 美债',
    reserve: 6.1,
    records: [
      { ticker:'MRVL', sym:'usMRVL', market:'US', name:'迈威尔科技', buy:[133.0,177.3], fair:[266.0,354.7], sell:[372.4,496.6], holding:7.9, targetHolding:8.9, snapshot:267.4 },
      { ticker:'GLW',  sym:'usGLW',  market:'US', name:'康宁',       buy:[100.6,134.2], fair:[201.3,268.4], sell:[281.8,375.7], holding:14.0, targetHolding:12.1, snapshot:222.9 },
      { ticker:'NEM',  sym:'usNEM',  market:'US', name:'纽蒙特',     buy:[74,98],       fair:[147,197],     sell:[206,275],     holding:10.6, targetHolding:11.2, snapshot:96.0 },
      { ticker:'NVDA', sym:'usNVDA', market:'US', name:'英伟达',     buy:[143,190],     fair:[285,380],     sell:[399,532],     holding:9.1, targetHolding:9.7, snapshot:192.7 },
      { ticker:'SNDK', sym:'usSNDK', market:'US', name:'闪迪',       buy:[1098,1464],   fair:[2196,2928],   sell:[3074,4099],   holding:37.0, targetHolding:37.7, snapshot:2096.4 },
      { ticker:'BE',   sym:'usBE',   market:'US', name:'Bloom Energy', buy:[119.0,158.7], fair:[238.0,317.4], sell:[333.2,444.3], holding:0, targetHolding:0, snapshot:252.5 },
      { ticker:'MU',   sym:'usMU',   market:'US', name:'美光科技',   buy:[557,743],     fair:[1115,1486],   sell:[1561,2081],   holding:0, targetHolding:0, snapshot:1137.0 },
      { ticker:'LITE', sym:'usLITE', market:'US', name:'Lumentum',   buy:[450,600],     fair:[900,1200],    sell:[1260,1680],   holding:8.4, targetHolding:8.6, snapshot:818.5 },
      { ticker:'NOK',  sym:'usNOK',  market:'US', name:'诺基亚',     buy:[7.2,9.6],     fair:[14.4,19.2],   sell:[20.2,26.9],   holding:6.8, targetHolding:0, snapshot:13.0 }
    ]
  },
  ah: {
    label: 'A / H 股估值',
    reserveLabel: '其他',
    reserve: 0,
    records: [
      { ticker:'300502', sym:'sz300502', market:'A股', name:'新易盛',   buy:[443,591],       fair:[886,1181],     sell:[1329,1772], holding:28.5, targetHolding:25.0, snapshot:567.0 },
      { ticker:'300308', sym:'sz300308', market:'A股', name:'中际旭创', buy:[874,1166],      fair:[1749,2332],    sell:[2448,3265], holding:31.4, targetHolding:33.8, snapshot:1253.4 },
      { ticker:'688525', sym:'sh688525', market:'A股', name:'佰维存储', buy:[348.0,464.0],   fair:[696.0,928.0],  sell:[1044.0,1391.9], holding:0, targetHolding:0, snapshot:499.1 },
      { ticker:'09992',  sym:'hk09992',  market:'港股', name:'泡泡玛特', buy:[140.6,187.4],  fair:[281.2,374.9],  sell:[421.7,562.3], holding:0, targetHolding:0, snapshot:158.4 },
      { ticker:'300476', sym:'sz300476', market:'A股', name:'胜宏科技', buy:[272.8,363.7],   fair:[545.5,727.4],  sell:[818.3,1091.0], holding:0, targetHolding:0, snapshot:342.1 },
      { ticker:'06869',  sym:'hk06869',  market:'港股', name:'长飞光纤', buy:[151.0,201.3],  fair:[301.9,402.6],  sell:[452.9,603.9], holding:32.1, targetHolding:27.5, snapshot:251.0 },
      { ticker:'01138',  sym:'hk01138',  market:'港股', name:'中远海能', buy:[10.7,14.3],    fair:[21.5,28.6],    sell:[32.2,42.9], holding:0, targetHolding:0, snapshot:16.8 },
      { ticker:'03993',  sym:'hk03993',  market:'港股', name:'洛阳钼业', buy:[13,18],        fair:[27,36],        sell:[38,50], holding:8.1, targetHolding:9.8, snapshot:15.1 },
      { ticker:'603986', sym:'sh603986', market:'A股', name:'兆易创新', buy:[529,705],       fair:[1058,1410],    sell:[1481,1974], holding:0, targetHolding:0, snapshot:1082.5 }
    ]
  }
};

window.VALUATION_RECORDS = window.VALUATION_GROUPS.us.records;
