window.VALUATION_GROUPS = {
  us: {
    label:'美股估值',
    reserveLabel:'现金 / 美债',
    reserve:13.7,
    records:[
      { ticker:'MRVL', sym:'usMRVL', market:'US', name:'迈威尔科技', buy:[128.7,171.6], fair:[257.4,343.2], sell:[360.4,480.5], holding:8.8, targetHolding:14.1, snapshot:263.3 },
      { ticker:'GLW',  sym:'usGLW',  market:'US', name:'康宁',       buy:[100.6,134.2], fair:[201.3,268.4], sell:[281.8,375.7], holding:12.7, targetHolding:13.0, snapshot:179.3 },
      { ticker:'NEM',  sym:'usNEM',  market:'US', name:'纽蒙特',     buy:[82,109],      fair:[164,219],     sell:[230,306],     holding:12.5, targetHolding:13.8, snapshot:96.5 },
      { ticker:'NVDA', sym:'usNVDA', market:'US', name:'英伟达',     buy:[141,189],     fair:[283,377],     sell:[396,528],     holding:11.0, targetHolding:11.3, snapshot:202.3 },
      { ticker:'SNDK', sym:'usSNDK', market:'US', name:'闪迪',       buy:[748,998],     fair:[1497,1995],   sell:[2095,2794],   holding:31.2, targetHolding:34.0, snapshot:1558.9 },
      { ticker:'BE',   sym:'usBE',   market:'US', name:'Bloom Energy',buy:[120.3,160.4],fair:[240.6,320.8], sell:[336.8,449.1], holding:0, targetHolding:0, snapshot:267.3 },
      { ticker:'MU',   sym:'usMU',   market:'US', name:'美光科技',   buy:[448,598],     fair:[897,1195],    sell:[1255,1674],   holding:0, targetHolding:0, snapshot:864.1 },
      { ticker:'LITE', sym:'usLITE', market:'US', name:'Lumentum',   buy:[450,600],     fair:[900,1200],    sell:[1260,1680],   holding:10.0, targetHolding:0, snapshot:867.5 },
      { ticker:'SBSW', sym:'usSBSW', market:'US', name:'Sibanye',    buy:[9.3,12.4],    fair:[18.5,24.7],   sell:[26,34.6],     holding:0, targetHolding:0, snapshot:10.1 }
    ]
  },
  ah: {
    label:'A / H 股估值',
    reserveLabel:'其他',
    reserve:3.7,
    records:[
      { ticker:'300502', sym:'sz300502', market:'A股', name:'新易盛',   buy:[478,637],       fair:[956,1274],     sell:[1434,1911], holding:23.5, targetHolding:21.7, snapshot:705 },
      { ticker:'300308', sym:'sz300308', market:'A股', name:'中际旭创', buy:[675,900],       fair:[1350,1800],    sell:[1890,2520], holding:31.2, targetHolding:29.9, snapshot:1158 },
      { ticker:'300476', sym:'sz300476', market:'A股', name:'胜宏科技', buy:[239,318.7],     fair:[478,637.3],    sell:[717,956],   holding:0, targetHolding:0, snapshot:419.3 },
      { ticker:'09992',  sym:'hk09992',  market:'港股', name:'泡泡玛特', buy:[99.6,132.8],    fair:[199.2,265.6],  sell:[298.8,398.4],holding:0, targetHolding:0, snapshot:172 },
      { ticker:'600547', sym:'sh600547', market:'A股', name:'山东黄金', buy:[22.5,30],       fair:[45,60],        sell:[67.5,90],    holding:0, targetHolding:0, snapshot:23.9 },
      { ticker:'06869',  sym:'hk06869',  market:'港股', name:'长飞光纤', buy:[151,201.3],     fair:[301.9,402.6],  sell:[452.9,603.9],holding:31.3, targetHolding:21.9, snapshot:227 },
      { ticker:'01138',  sym:'hk01138',  market:'港股', name:'中远海能', buy:[12.3,16.3],     fair:[24.5,32.7],    sell:[36.8,49],    holding:0, targetHolding:0, snapshot:16 },
      { ticker:'03993',  sym:'hk03993',  market:'港股', name:'洛阳钼业', buy:[15,21],         fair:[31,41],        sell:[43,58],      holding:10.4, targetHolding:11.2, snapshot:18.3 },
      { ticker:'02899',  sym:'hk02899',  market:'港股', name:'紫金矿业', buy:[32,42],         fair:[64,85],        sell:[89,119],     holding:0, targetHolding:11.3, snapshot:32.8 }
    ]
  }
};

window.VALUATION_RECORDS = window.VALUATION_GROUPS.us.records;
