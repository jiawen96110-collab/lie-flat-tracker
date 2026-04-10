import streamlit as st
import yfinance as yf
import pandas as pd
from datetime import datetime, date
import json
import os

st.set_page_config(page_title="我的躺平追踪器 - Z先生版", layout="wide")
st.title("🛡️ 我的躺平追踪器（Z先生版）")
st.caption("包含官方躺平ETF组合 + 自定义新标的（从添加那天起涨跌幅） | 数据来自Yahoo Finance")

DATA_FILE = "my_portfolio.json"

# 官方躺平组合（固定）
lying_flat = {
    "US": [
        {"alloc": 25, "ticker": "QQQ", "name": "纳指100 ETF"},
        {"alloc": 25, "ticker": "SPY", "name": "标普500 ETF"},
        {"alloc": 20, "ticker": "RING", "name": "全球黄金矿股 ETF"},
        {"alloc": 20, "ticker": "COPX", "name": "全球铜矿股 ETF"},
        {"alloc": 10, "ticker": "BITB", "name": "比特币 ETF"},
    ],
    "HK": [
        {"alloc": 25, "ticker": "03455.HK", "name": "纳指100 ETF"},
        {"alloc": 20, "ticker": "03132.HK", "name": "全球半导体 ETF"},
        {"alloc": 20, "ticker": "03147.HK", "name": "中国创业板 ETF"},
        {"alloc": 20, "ticker": "03110.HK", "name": "恒生高股息 ETF"},
        {"alloc": 15, "ticker": "02840.HK", "name": "黄金 ETF"},
    ],
    "CN": [
        {"alloc": 25, "ticker": "513390.SS", "name": "纳指100 ETF"},
        {"alloc": 25, "ticker": "159652.SZ", "name": "有色50 ETF"},
        {"alloc": 25, "ticker": "588200.SS", "name": "科创芯片 ETF"},
        {"alloc": 15, "ticker": "515880.SS", "name": "通信 ETF"},
        {"alloc": 10, "ticker": "518880.SS", "name": "黄金 ETF"},
    ]
}

# 自定义标的保存
def load_custom():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_custom(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if "custom_portfolio" not in st.session_state:
    st.session_state.custom_portfolio = load_custom()

@st.cache_data(ttl=300)
def get_price(ticker):
    try:
        data = yf.download(ticker, period="2d", progress=False)
        if len(data) < 1: return None, None
        current = data['Close'].iloc[-1]
        prev = data['Close'].iloc[-2] if len(data) > 1 else current
        daily_pct = (current - prev) / prev * 100
        return round(current, 3), round(daily_pct, 2)
    except:
        return None, None

@st.cache_data(ttl=300)
def get_ytd(ticker):
    try:
        today = date.today()
        start = f"{today.year}-01-01"
        data = yf.download(ticker, start=start, progress=False)
        if len(data) < 1:
            return 0.0
        first = data['Close'].iloc[0]
        last = data['Close'].iloc[-1]
        return round((last - first) / first * 100, 2)
    except:
        return 0.0

def add_custom(ticker_input, market, name_input, notes):
    t = ticker_input.strip().upper()
    if market == "A股":
        ticker = f"{t}.SS" if t.startswith("6") else f"{t}.SZ"
    elif market == "港股":
        ticker = f"{t.zfill(5)}.HK"
    else:
        ticker = t

    price, _ = get_price(ticker)
    if not price:
        st.error("无法获取价格，请检查代码")
        return

    new_item = {
        "ticker": ticker,
        "name": name_input or ticker,
        "add_date": datetime.now().strftime("%Y-%m-%d"),
        "add_price": price,
        "notes": notes or "Z先生推荐"
    }
    st.session_state.custom_portfolio.append(new_item)
    save_custom(st.session_state.custom_portfolio)
    st.success(f"✅ 已添加 {ticker}")

# 页面
tab1, tab2 = st.tabs(["📊 官方躺平组合", "➕ 我的自定义标的"])

with tab1:
    st.subheader("躺平ETF组合（实时）")
    for market, items in lying_flat.items():
        st.write(f"**{market}市场**")
        df = pd.DataFrame(items)
        prices, daily_pcts, ytd_pcts = [], [], []
        for _, row in df.iterrows():
            p, d = get_price(row["ticker"])
            y = get_ytd(row["ticker"])
            prices.append(p or "-")
            daily_pcts.append(d or "-")
            ytd_pcts.append(round(y, 2) if y is not None and isinstance(y, (int, float)) else "-")
        df["当前价格"] = prices
        df["当日涨跌"] = daily_pcts
        df["年初至今"] = ytd_pcts
        st.dataframe(df[["alloc", "ticker", "name", "当前价格", "当日涨跌", "年初至今"]], use_container_width=True, hide_index=True)

with tab2:
    st.subheader("我的新增标的（从添加那天起跟踪）")
    with st.form("add_form"):
        col1, col2, col3 = st.columns([2,1,2])
        with col1:
            code = st.text_input("股票/ETF代码", placeholder="600498 或 MRVL 或 03132")
        with col2:
            market = st.selectbox("市场", ["A股", "港股", "美股"])
        with col3:
            name = st.text_input("名称（可选）", placeholder="长飞光纤")
        notes = st.text_input("备注", placeholder="Z先生推荐")
        if st.form_submit_button("➕ 添加"):
            add_custom(code, market, name, notes)

    if st.session_state.custom_portfolio:
        df_custom = pd.DataFrame(st.session_state.custom_portfolio)
        current_prices = []
        custom_pcts = []
        for _, row in df_custom.iterrows():
            p, _ = get_price(row["ticker"])
            if p:
                pct = (p - row["add_price"]) / row["add_price"] * 100
                current_prices.append(round(p, 3))
                custom_pcts.append(round(pct, 2))
            else:
                current_prices.append("-")
                custom_pcts.append("-")
        df_custom["当前价格"] = current_prices
        df_custom["自添加日起涨跌幅(%)"] = custom_pcts
        df_custom["添加日期"] = df_custom["add_date"]

        def color_pct(val):
            if isinstance(val, (int, float)):
                return f"color: {'green' if val >= 0 else 'red'}; font-weight: bold"
            return ""

        styled = df_custom[["name", "ticker", "添加日期", "add_price", "当前价格", "自添加日起涨跌幅(%)", "notes"]].style.map(color_pct, subset=["自添加日起涨跌幅(%)"])
        st.dataframe(styled, use_container_width=True, hide_index=True)
    else:
        st.info("还没有添加自定义标的")

st.caption("数据每5分钟刷新 | 本地JSON保存 | 仅供个人使用")
