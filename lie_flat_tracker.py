import streamlit as st
import requests
import pandas as pd
from datetime import datetime
import time

# ==============================================
# 自动刷新：每30秒刷新一次
# ==============================================
from streamlit_autorefresh import st_autorefresh
st_autorefresh(interval=30 * 1000, key="auto_refresh_30s")

# ==============================================
# 1. 腾讯财经接口函数（核心）
# ==============================================
def get_tencent_price(symbol):
    """
    从腾讯财经 qt.gtimg.cn 获取实时价格
    返回: 名称, 当前价, 涨跌幅(%)
    """
    url = f"http://qt.gtimg.cn/q={symbol}"
    try:
        r = requests.get(url, timeout=5)
        r.encoding = 'gb2312'  # 腾讯接口编码
        txt = r.text.strip()
        if not txt:
            return None, None, None
        
        # 解析 ~ 分割
        parts = txt.split('~')
        if len(parts) < 5:
            return None, None, None
        
        name = parts[1]
        price = parts[3]
        close_yesterday = parts[4]
        
        # 计算涨跌幅
        try:
            p = float(price)
            c = float(close_yesterday)
            change_pct = (p - c) / c * 100
            change_pct_str = f"{change_pct:.2f}%"
        except:
            change_pct_str = "-"
        
        return name, price, change_pct_str
    except Exception as e:
        return None, None, None

# ==============================================
# 2. 代码格式化（自动加 sh/sz/us）
# ==============================================
def format_code(s):
    s = str(s).strip().upper()
    # A股 6位数字
    if s.isdigit() and len(s) == 6:
        if s.startswith(('6', '9', '7')):
            return f"sh{s}"
        else:
            return f"sz{s}"
    # 美股（字母）
    elif s.isalpha() and len(s) <= 5:
        return f"us{s}"
    # 已经带前缀
    elif s.startswith(('sh', 'sz', 'us', 'hk')):
        return s
    # 默认当美股
    else:
        return f"us{s}"

# ==============================================
# 3. 躺平组合（和原网站一致，转腾讯格式）
# ==============================================
FLAT_ETF = [
    "usSPY", "usQQQ", "usTLT", "usIEF", "usLGOV",
    "usEMLC", "usGLD", "usCOMT", "usUSO", "usDBC"
]

# ==============================================
# 4. 页面样式（1:1复刻 moodshare.cn）
# ==============================================
st.markdown("""
<h1 style="font-size: 2rem; font-weight:700; margin-bottom:0.5rem;">躺平ETF组合（实时）</h1>
<p style="font-size:1.2rem; font-weight:600; margin-bottom:1.5rem;">US市场</p>
""", unsafe_allow_html=True)

tab1, tab2 = st.tabs(["官方躺平组合", "我的自定义标的"])

# ==============================================
# 标签1：官方躺平组合（腾讯行情）
# ==============================================
with tab1:
    st.subheader("官方躺平组合（实时）")
    data = []
    for code in FLAT_ETF:
        name, price, chg = get_tencent_price(code)
        data.append([
            code.replace("us",""),  # 显示去掉us
            name if name else code,
            price if price else "-",
            chg if chg else "-"
        ])
    
    df = pd.DataFrame(data, columns=["代码", "名称", "现价", "涨跌幅"])
    st.dataframe(df, use_container_width=True, hide_index=True)

# ==============================================
# 标签2：自定义标的（含添加日至今收益）
# ==============================================
with tab2:
    st.subheader("➕ 添加Z先生新标的（跟踪添加日收益）")
    
    col1, col2 = st.columns([2,1])
    with col1:
        new_code = st.text_input("标的代码（如 688012 / AVGO / 002497）")
    with col2:
        add_date = st.date_input("添加日期", datetime.today())
    
    # 会话状态保存列表
    if "my_stocks" not in st.session_state:
        st.session_state.my_stocks = []
    
    # 添加按钮
    if st.button("添加到跟踪", type="primary"):
        if new_code:
            fmt_code = format_code(new_code)
            st.session_state.my_stocks.append({
                "code": fmt_code,
                "date": str(add_date)
            })
            st.success(f"已添加：{fmt_code}")
    
    # 显示我的标的
    st.subheader("📋 我的跟踪标的")
    if not st.session_state.my_stocks:
        st.info("请添加标的")
    else:
        rows = []
        for item in st.session_state.my_stocks:
            c = item["code"]
            d = item["date"]
            name, price, chg = get_tencent_price(c)
            # 显示简化代码
            show_code = c.replace("sh","").replace("sz","").replace("us","")
            rows.append([
                show_code,
                name if name else c,
                price if price else "-",
                chg if chg else "-",
                "—",  # 累计收益（历史K线需另接口，这里占位）
                d
            ])
        
        df_my = pd.DataFrame(rows, columns=[
            "代码", "名称", "现价", "当日涨跌幅", "累计收益(自添加日)", "添加日期"
        ])
        st.dataframe(df_my, use_container_width=True, hide_index=True)

# ==============================================
# 页脚
# ==============================================
st.caption("数据来源：腾讯财经 qt.gtimg.cn | 每30秒自动刷新")

# ==============================================
# 6. 页脚（和原网站一致）
# ==============================================
st.caption("数据来源：Yahoo Finance | 实时更新")
