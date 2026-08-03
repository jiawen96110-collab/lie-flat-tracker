window.VALUATION_UPDATED_AT = '2026-07-25';
window.POSITION_UPDATED_AT = '2026-08-01';
window.VALUATION_NOTICE = '股票仓位已全部清仓；本周未发布新估值表，价格区间沿用上一期公开数据。';

window.VALUATION_GROUPS = {
  us: {
    label: '美股估值',
    reserveLabel: '股票仓位',
    reserve: 0,
    records: [
      { ticker:'MRVL', sym:'usMRVL', market:'US', name:'迈威尔科技', buy:[133.0,177.3], fair:[266.0,354.7], sell:[372.4,496.6], holding:0, targetHolding:7.1, snapshot:195.6 },
      { ticker:'GLW',  sym:'usGLW',  market:'US', name:'康宁',       buy:[100.6,134.2], fair:[201.3,268.4], sell:[281.8,375.7], holding:0, targetHolding:6.1, snapshot:147.7 },
      { ticker:'NEM',  sym:'usNEM',  market:'US', name:'纽蒙特',     buy:[74,98],       fair:[147,197],     sell:[206,275],     holding:0, targetHolding:12.8, snapshot:92.1 },
      { ticker:'NVDA', sym:'usNVDA', market:'US', name:'英伟达',     buy:[143,190],     fair:[285,380],     sell:[399,532],     holding:0, targetHolding:0, snapshot:206.9 },
      { ticker:'SNDK', sym:'usSNDK', market:'US', name:'闪迪',       buy:[1098,1464],   fair:[2196,2928],   sell:[3074,4099],   holding:0, targetHolding:31.5, snapshot:1440.0 },
      { ticker:'BE',   sym:'usBE',   market:'US', name:'Bloom Energy', buy:[119.0,158.7], fair:[238.0,317.4], sell:[333.2,444.3], holding:0, targetHolding:7.8, snapshot:185.2 },
      { ticker:'MU',   sym:'usMU',   market:'US', name:'美光科技',   buy:[557,743],     fair:[1115,1486],   sell:[1561,2081],   holding:0, targetHolding:0, snapshot:977.4 },
      { ticker:'LITE', sym:'usLITE', market:'US', name:'Lumentum',   buy:[450,600],     fair:[900,1200],    sell:[1260,1680],   holding:0, targetHolding:9.6, snapshot:761.0 },
      { ticker:'NOK',  sym:'usNOK',  market:'US', name:'诺基亚',     buy:[7.2,9.6],     fair:[14.4,19.2],   sell:[20.2,26.9],   holding:0, targetHolding:5.9, snapshot:9.1 }
    ]
  },
  ah: {
    label: 'A / H 股估值',
    reserveLabel: '股票仓位',
    reserve: 0,
    records: [
      { ticker:'300502', sym:'sz300502', market:'A股', name:'新易盛',   buy:[443,591],       fair:[886,1181],     sell:[1329,1772], holding:0, targetHolding:18.3, snapshot:476.0 },
      { ticker:'300308', sym:'sz300308', market:'A股', name:'中际旭创', buy:[874,1166],      fair:[1749,2332],    sell:[2448,3265], holding:0, targetHolding:17.2, snapshot:1052.0 },
      { ticker:'688525', sym:'sh688525', market:'A股', name:'佰维存储', buy:[232.0,309.3],   fair:[464.0,618.6],  sell:[696.0,928.0], holding:0, targetHolding:0, snapshot:236.5 },
      { ticker:'601898', sym:'sh601898', market:'A股', name:'中煤能源', buy:[10.6,10.6],     fair:[20.0,20.0],    sell:[25.4,25.4], holding:0, targetHolding:15.0, snapshot:13.7 },
      { ticker:'02476',  sym:'hk02476',  market:'港股', name:'胜宏科技', buy:[188.8,251.8],   fair:[377.7,503.6],  sell:[566.5,755.3], holding:0, targetHolding:0, snapshot:230.5 },
      { ticker:'06869',  sym:'hk06869',  market:'港股', name:'长飞光纤', buy:[154.6,206.1],  fair:[309.2,412.2],  sell:[463.8,618.4], holding:0, targetHolding:22.6, snapshot:129.8 },
      { ticker:'603993', sym:'sh603993', market:'A股', name:'洛阳钼业', buy:[13,18],         fair:[27,36],        sell:[38,50], holding:0, targetHolding:15.6, snapshot:18.6 },
      { ticker:'03993',  sym:'hk03993',  market:'港股', name:'洛阳钼业', buy:[13,18],        fair:[27,36],        sell:[38,50], holding:0, targetHolding:11.1, snapshot:15.2 },
      { ticker:'03986',  sym:'hk03986',  market:'港股', name:'兆易创新', buy:[423,564],       fair:[846,1128],     sell:[1185,1579], holding:0, targetHolding:0, snapshot:456.5 }
    ]
  }
};

window.VALUATION_RECORDS = window.VALUATION_GROUPS.us.records;
