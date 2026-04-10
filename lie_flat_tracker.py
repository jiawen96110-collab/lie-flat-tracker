import streamlit as st
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import time

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

# 3. 【终极修复】带重试+防限流的稳定数据拉取函数
def fetch_stock_info(symbol, add_date=None):
    max_retries = 3  # 最多重试3次
    for retry in range(max_retries):
        try:
            # 拉取最近30天数据，避免当日休市无数据
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="30d", auto_adjust=True)
            
            if hist.empty:
                time.sleep(1)  # 重试前等待1秒
                continue
            
            # 取最新收盘价（现价）
            current_price = round(hist["Close"].iloc[-1], 2)
            # 计算涨跌幅：(最新价-前收盘价)/前收盘价
            prev_close = hist["Close"].iloc[-2] if len(hist)>=2 else current_price
            change_pct = round((current_price - prev_close) / prev_close * 100, 2)
            # 获取名称（兜底处理）
            name = ticker.info.get("shortName", symbol)
            
            # 【新增功能】计算从添加日起的累计收益率
            cumulative_return = "-"
            if add_date:
                # 转换添加日期为datetime
                add_dt = pd.to_datetime(add_date).tz_localize(None)
                # 找到添加日之后的第一个交易日
                hist.index = hist.index.tz_localize(None)
                available_days = hist.index[hist.index >= add_dt]
                if len(available_days) > 0:
                    buy_price = hist.loc[available_days[0], "Close"]
                    cumulative_return = round((current_price - buy_price) / buy_price * 100, 2)
            
            # 成功拉取，返回数据
            if add_date:
                return [symbol, name, current_price, f"{change_pct}%", f"{cumulative_return}%", add_date]
            else:
                return [symbol, name, current_price, f"{change_pct}%"]
        
        except Exception as e:
            print(f"第{retry+1}次抓取{symbol}失败: {str(e)}")
            time.sleep(1)  # 重试间隔
    
    # 所有重试都失败，返回失败
    if add_date:
        return [symbol, "抓取失败", "-", "-", "-", add_date]
    else:
        return [symbol, "抓取失败", "-", "-"]

# ================= 页面逻辑 =================
st.title("🏠 躺平ETF组合 + Z先生新标的 跟踪器")
st.caption("包含官方躺平ETF组合 + 自定义新标的 (数据来自Yahoo Finance)")

# 标签页
tab1, tab2 = st.tabs(["官方躺平组合", "我的自定义标的"])

# ---------- 标签页1：官方躺平组合 ----------
with tab1:
    st.subheader("官方躺平ETF组合 (US市场)")
    # 加个加载提示，优化体验
    with st.spinner("正在拉取行情数据..."):
        df_flat = pd.DataFrame([fetch_stock_info(sym) for sym in FLAT_ETFS],
                               columns=["代码", "名称", "现价", "涨跌幅"])
    st.dataframe(df_flat, use_container_width=True, hide_index=True)

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

    # 【新增】删除标的功能
    if st.session_state.custom_stocks:
        with st.expander("🗑️ 管理跟踪列表（删除标的）"):
            for i, item in enumerate(st.session_state.custom_stocks):
                col_del, col_sym = st.columns([1, 4])
                with col_del:
                    if st.button(f"删除", key=f"del_{i}"):
                        del st.session_state.custom_stocks[i]
                        st.rerun()
                with col_sym:
                    st.write(f"{item['symbol']} (添加日期: {item['date']})")

    # 展示列表
    st.subheader("📋 你的跟踪列表")
    if not st.session_state.custom_stocks:
        st.info("请在上方输入Z先生新推荐的标的添加")
    else:
        with st.spinner("正在拉取行情数据..."):
            # 抓取数据（带累计收益率）
            custom_data = []
            for item in st.session_state.custom_stocks:
                data = fetch_stock_info(item["symbol"], item["date"])
                custom_data.append(data)
            
            # 展示表格（新增累计收益率列）
            df_custom = pd.DataFrame(custom_data, columns=["代码", "名称", "现价", "当日涨跌幅", "累计收益率(自添加日)", "添加日期"])
        st.dataframe(df_custom, use_container_width=True, hide_index=True)
        
        # 导出按钮
        if st.download_button("导出CSV数据", df_custom.to_csv(index=False), "z_stocks.csv"):
            st.success("导出成功！")
