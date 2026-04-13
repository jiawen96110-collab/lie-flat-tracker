import yfinance as yf
import requests
import json
from datetime import datetime, timezone
import time

# ====================== 配置 ======================
# 美股 ticker（直接用 yfinance）
US_TICKERS = ['QQQ', 'SPY', 'RING', 'COPX', 'BITB', 'MRVL', 'AAOI']

# 自选股映射（和 HTML 里的 WATCH 对应）
WATCH_LIST = [
    {'ticker': '300782', 'key': 'watch_300782', 'name': '卓胜微', 'market': 'cn'},
    {'ticker': 'MRVL',   'key': 'watch_MRVL',   'name': '迈威尔科技', 'market': 'us'},
    {'ticker': 'AAOI',   'key': 'watch_AAOI',   'name': '应用光电', 'market': 'us'}
]

# ====================== 获取数据 ======================
data = {}

# 1. 获取美股 ETF 和自选（MRVL, AAOI）
print("正在获取美股数据...")
for t in US_TICKERS:
    try:
        stock = yf.Ticker(t)
        hist = stock.history(period="2d")
        if len(hist) >= 1:
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) >= 2 else current_price
            today_change = ((current_price - prev_close) / prev_close * 100) if prev_close != 0 else 0
            
            key = f"us_{t}" if t in ['QQQ', 'SPY', 'RING', 'COPX', 'BITB'] else f"watch_{t}" if t in ['MRVL', 'AAOI'] else t
            data[key] = {
                "today": round(today_change, 2),
                "price": round(current_price, 2)
            }
            print(f"✓ {t}: {current_price:.2f} ({today_change:+.2f}%)")
        time.sleep(0.5)
    except Exception as e:
        print(f"✗ {t} 获取失败: {e}")

# 2. 获取 A股/港股（腾讯财经接口，兼容你原来的 ETF）
print("正在获取 A股/港股数据...")
CN_TICKERS = {
    '513390': 'sh513390', '159652': 'sz159652', '588200': 'sh588200',
    '515880': 'sh515880', '518880': 'sh518880',
    '03455': 'hk03455', '03132': 'hk03132', '03147': 'hk03147',
    '03110': 'hk03110', '02840': 'hk02840'
}

for code, key in CN_TICKERS.items():
    try:
        url = f"https://qt.gtimg.cn/q={key}"
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            line = resp.text.strip()
            parts = line.split('~')
            if len(parts) > 5:
                price = float(parts[3])
                prev = float(parts[4])
                today = ((price - prev) / prev * 100) if prev != 0 else 0
                
                data_key = f"cn_{code}" if code.isdigit() and len(code) > 5 else f"hk_{code}"
                data[data_key] = {
                    "today": round(today, 2),
                    "price": round(price, 3) if price < 10 else round(price, 2)
                }
                print(f"✓ {key}: {price} ({today:+.2f}%)")
        time.sleep(0.3)
    except Exception as e:
        print(f"✗ {key} 获取失败")

# ====================== 保存 data.json ======================
output = {
    "updated": datetime.now(timezone.utc).isoformat(),
    "data": data
}

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ data.json 更新完成！包含 MRVL 和 AAOI")
print(f"总共获取 {len(data)} 条数据")
