window.VALUATION_UPDATED_AT = '2026-07-12';

window.VALUATION_GROUPS = {
  us: {
    label: '美股估值',
    reserveLabel: '其他 / 美债',
    reserve: 15.2,
    records: [
      { ticker:'MRVL', sym:'usMRVL', market:'US', name:'迈威尔科技', buy:[133.0,177.3], fair:[266.0,354.7], sell:[372.4,496.6], holding:7.3, targetHolding:7.8, snapshot:206.6 },
      { ticker:'GLW',  sym:'usGLW',  market:'US', name:'康宁',       buy:[100.6,134.2], fair:[201.3,268.4], sell:[281.8,375.7], holding:6.2, targetHolding:6.6, snapshot:161.7 },
      { ticker:'NEM',  sym:'usNEM',  market:'US', name:'纽蒙特',     buy:[74,98],       fair:[147,197],     sell:[206,275],     holding:11.1, targetHolding:11.6, snapshot:93.1 },
      { ticker:'NVDA', sym:'usNVDA', market:'US', name:'英伟达',     buy:[143,190],     fair:[285,380],     sell:[399,532],     holding:0, targetHolding:0, snapshot:198.9 },
      { ticker:'SNDK', sym:'usSNDK', market:'US', name:'闪迪',       buy:[1098,1464],   fair:[2196,2928],   sell:[3074,4099],   holding:35.8, targetHolding:33.4, snapshot:1692.8 },
      { ticker:'BE',   sym:'usBE',   market:'US', name:'Bloom Energy', buy:[119.0,158.7], fair:[238.0,317.4], sell:[333.2,444.3], holding:8.8, targetHolding:10.0, snapshot:197.0 },
      { ticker:'MU',   sym:'usMU',   market:'US', name:'美光科技',   buy:[557,743],     fair:[1115,1486],   sell:[1561,2081],   holding:0, targetHolding:0, snapshot:858.9 },
      { ticker:'LITE', sym:'usLITE', market:'US', name:'Lumentum',   buy:[450,600],     fair:[900,1200],    sell:[1260,1680],   holding:8.7, targetHolding:8.1, snapshot:699.0 },
      { ticker:'NOK',  sym:'usNOK',  market:'US', name:'诺基亚',     buy:[7.2,9.6],     fair:[14.4,19.2],   sell:[20.2,26.9],   holding:6.8, targetHolding:6.8, snapshot:11.0 }
    ]
  },
  ah: {
    label: 'A / H 股估值',
    reserveLabel: '其他',
    reserve: 0,
    records: [
      { ticker:'300502', sym:'sz300502', market:'A股', name:'新易盛',   buy:[443,591],       fair:[886,1181],     sell:[1329,1772], holding:32.1, targetHolding:29.9, snapshot:511.8 },
      { ticker:'300308', sym:'sz300308', market:'A股', name:'中际旭创', buy:[874,1166],      fair:[1749,2332],    sell:[2448,3265], holding:33.5, targetHolding:31.5, snapshot:1066.6 },
      { ticker:'688525', sym:'sh688525', market:'A股', name:'佰维存储', buy:[348.0,464.0],   fair:[696.0,928.0],  sell:[1044.0,1391.9], holding:0, targetHolding:0, snapshot:377.0 },
      { ticker:'09992',  sym:'hk09992',  market:'港股', name:'泡泡玛特', buy:[140.6,187.4],  fair:[281.2,374.9],  sell:[421.7,562.3], holding:0, targetHolding:0, snapshot:146.4 },
      { ticker:'02476',  sym:'hk02476',  market:'港股', name:'胜宏科技', buy:[188.8,251.8],   fair:[377.7,503.6],  sell:[566.5,755.3], holding:0, targetHolding:0, snapshot:226.0 },
      { ticker:'06869',  sym:'hk06869',  market:'港股', name:'长飞光纤', buy:[154.6,206.1],  fair:[309.2,412.2],  sell:[463.8,618.4], holding:24.9, targetHolding:29.0, snapshot:152.8 },
      { ticker:'00522',  sym:'hk00522',  market:'港股', name:'ASMPT',    buy:[95.5,127.3],    fair:[190.9,254.6],  sell:[286.4,381.9], holding:0, targetHolding:0, snapshot:155.2 },
      { ticker:'03993',  sym:'hk03993',  market:'港股', name:'洛阳钼业', buy:[13,18],        fair:[27,36],        sell:[38,50], holding:9.6, targetHolding:9.6, snapshot:14.4 },
      { ticker:'03986',  sym:'hk03986',  market:'港股', name:'兆易创新', buy:[529,705],       fair:[1058,1410],    sell:[1481,1974], holding:0, targetHolding:0, snapshot:711.3 }
    ]
  }
};

window.VALUATION_RECORDS = window.VALUATION_GROUPS.us.records;
