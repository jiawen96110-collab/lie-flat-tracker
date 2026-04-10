import streamlit as st
import requests
import pandas as pd
from datetime import datetime
import akshare as ak

# ==============================================
# 自动 30 秒刷新（腾讯财经实时更新）
# ==============================================
from streamlit_autorefresh import st_autorefresh
st_autorefresh(interval=30 * 1000, key="refresh30s")

# ==============================================
# 1. 腾讯财经：获取实时价格 + 涨跌幅
# ==============================================
def get_tencent_spot(symbol):
    try:
        url = f"http://qt.gtimg.cn/q={symbol}"
        r = requests.get(url, timeout=3)
        r.encoding = "gb2312"
        data = r.text.strip().split("~")
        if len(data) < 10:
            return None, None, None
        name = data[1]
        price = data[3]
        pre_close = data[4]
        try:
            p = float(price)
            c = float(pre_close)
            change = (p - c) / c * 100
            return name, round(p, 2), f"{change:.2f}%"
        except:
            return None, None, None
    except:
        return None, None, None

# ==============================================
# 2. 获取历史价格 → 计算【从添加日到现在的收益】
# ==============================================
def get_hist_price(symbol, add_date):
    try:
        code = symbol.replace("sh", "").replace("sz", "").replace("us", "")
        date = add_date.replace("-", "")

        if symbol.startswith("us"):
            df = ak.stock_us_hist(symbol=code, start_date=date, adjust="qfq")
            buy_price = df["close"].iloc[0]
        else:
            df = ak.stock_zh_a_hist(symbol=code, period="daily", start_date=date, adjust="qfq")
            buy_price = df["收盘"].iloc[0]

        return round(buy_price, 2)
    except:
        return None

# ==============================================
# 3. 自动格式化代码（A股/美股自动识别）
# ==============================================
def fmt(s):
    s = str(s).strip().upper()
    if s.isdigit() and len(s) == 6:
        return f"sh{s}" if s.startswith(("6", "9", "7")) else f"sz{s}"
    elif s.isalpha() and len(s) <= 5:
        return f"us{s}"
    return s

# ==============================================
# 4. 躺平组合（和 moodshare.cn 完全一致）
# ==============================================
FLAT = ["usSPY", "usQQQ", "usTLT", "usIEF", "usLGOV", "usEMLC", "usGLD", "usCOMT", "usUSO", "usDBC"]

# ==============================================
# 5. 页面样式（1:1 复刻原网站）
# ==============================================
st.markdown("""
<h1 style='font-size:2rem; font-weight:700; margin-bottom:0.5rem'>躺平ETF组合（实时）</h1>
<p style='font-size:1.2rem; font-weight:600; margin-bottom:1.5rem'>US市场</p>
""", unsafe_allow_html=True)

tab1, tab2 = st.tabs(["官方躺平组合", "我的自定义标的"])

# --------------------------
# 标签1：官方躺平组合
# --------------------------
with tab1:
    rows = []
    for code in FLAT:
        name, price, chg = get_tencent_spot(code)
        rows.append([
            code.replace("us", ""),
            name or code,
            price if price else "-",
            chg if chg else "-"
        ])
    df = pd.DataFrame(rows, columns=["代码", "名称", "现价", "涨跌幅"])
    st.dataframe(df, use_container_width=True, hide_index=True)

# --------------------------
# 标签2：你的Z先生标的（带累计收益）
# --------------------------
with tab2:
    st.subheader("➕ 添加京城Z先生新推荐标的")
    col1, col2 = st.columns([2, 1])
    with col1:
        user_input = st.text_input("股票代码（如 688012 AVGO 300782）")
    with col2:
        add_date = st.date_input("添加日期（从这天算收益）")

    if "my_stocks" not in st.session_state:
        st.session_state.my_stocks = []

    if st.button("添加到跟踪列表", type="primary"):
        if user_input:
            code = fmt(user_input)
            st.session_state.my_stocks.append({
                "code": code,
                "date": str(add_date)
            })
            st.success(f"✅ 已添加：{code}")

    st.subheader("📋 我的跟踪列表（含累计收益）")
    if not st.session_state.my_stocks:
        st.info("请添加Z先生推荐的标的")
    else:
        my_rows = []
        for item in st.session_state.my_stocks:
            code = item["code"]
            date = item["date"]
            name, now, chg = get_tencent_spot(code)

            profit = "-"
            if now and now != "-":
                buy = get_hist_price(code, date)
                if buy:
                    rate = (float(now) - buy) / buy * 100
                    profit = f"{rate:.2f}%"

            show_code = code.replace("sh","").replace("sz","").replace("us","")
            my_rows.append([show_code, name or code, now or "-", chg or "-", profit, date])

        df_my = pd.DataFrame(my_rows, columns=[
            "代码", "名称", "现价", "当日涨跌幅", "累计收益(自添加日)", "添加日期"
        ])
        st.dataframe(df_my, use_container_width=True, hide_index=True)

st.caption("数据来源：腾讯财经 | 每30秒自动刷新 | 累计收益由历史K线计算")
