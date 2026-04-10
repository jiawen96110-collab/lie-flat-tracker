import streamlit as st
import yfinance as yf
import pandas as pd
from datetime import datetime

# ================= 配置区 =================
# 1. 官方躺平ETF组合（保持原版不变）
FLAT_ETFS = [
    "SPY", "QQQ", "TLT", "IEF", "LGOV",
    "EMLC", "GLD", "COMT", "USO", "DBC"
]

# 2. A股代码自动补全后缀（输入688012 -> 688012.SS）
def format_symbol(s):
    s = str(s).strip().upper()
    if s.isdigit() and len(s) == 6:
        return s + ".SS" if s.startswith("6") else s + ".SZ"
    return s

# 3. 核心数据抓取函数（修复了报错：用 pd.isna 判空）
def fetch_stock_info(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # 修复点：不再直接用 p or "-"，而是先判断是否为空
        price = info.get("regularMarketPrice")
        price = price if pd.notna(price) else "-"
        
        change = info.get("regularMarketChangePercent")
        change = f"{change:.2%}" if pd.notna(change) else "-"
        
        name = info.get("shortName", "-")
        return [symbol, name, price, change]
    except Exception:
        return [symbol, "抓取失败", "-", "-"]

# ================= 页面逻辑 =================
st.title("🏠 躺平ETF组合 + Z先生新标的 跟踪器")
st.caption("包含官方躺平ETF组合 + 自定义新标的 (数据来自Yahoo Finance)")

# 标签页
tab1, tab2 = st.tabs(["官方躺平组合", "我的自定义标的"])

# ---------- 标签页1：官方躺平组合 ----------
with tab1:
    st.subheader("官方躺平ETF组合 (US市场)")
    df_flat = pd.DataFrame([fetch_stock_info(sym) for sym in FLAT_ETFS],
                           columns=["代码", "名称", "现价", "涨跌幅"])
    st.dataframe(df_flat, use_container_width=True)

# ---------- 标签页2：我的自定义标的 ----------
with tab2:
    st.subheader("➕ 添加Z先生新标的")
    
    # 输入区域
    col1, col2 = st.columns([2,1])
    with col1:
        new_symbol = st.text_input("输入标的代码 (例：688012/AVGO/002497)", key="new_sym")
    with col2:
        add_date = st.date_input("添加日期", datetime.today(), key="add_date")
    
    # 初始化会话状态（保存数据）
    if "custom_stocks" not in st.session_state:
        st.session_state.custom_stocks = []

    # 添加按钮
    if st.button("添加到跟踪列表"):
        if new_symbol:
            formatted_sym = format_symbol(new_symbol)
            st.session_state.custom_stocks.append({
                "symbol": formatted_sym,
                "date": str(add_date)
            })
            st.success(f"✅ 已添加：{formatted_sym}")

    # 展示列表
    st.subheader("📋 你的跟踪列表")
    if not st.session_state.custom_stocks:
        st.info("请在上方输入Z先生新推荐的标的添加")
    else:
        # 抓取数据
        custom_data = []
        for item in st.session_state.custom_stocks:
            data = fetch_stock_info(item["symbol"])
            # 追添加日期
            data.append(item["date"])
            custom_data.append(data)
        
        # 展示表格
        df_custom = pd.DataFrame(custom_data, columns=["代码", "名称", "现价", "涨跌幅", "添加日期"])
        st.dataframe(df_custom, use_container_width=True)
        
        # 导出按钮
        if st.download_button("导出CSV数据", df_custom.to_csv(index=False), "z_stocks.csv"):
            st.success("导出成功！")
