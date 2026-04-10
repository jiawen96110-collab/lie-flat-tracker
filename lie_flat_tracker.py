import streamlit as st
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import time

# ==============================================
# 1. 配置区：完全复刻原网站的躺平组合
# ==============================================
# 官方躺平ETF组合（和 moodshare.cn 完全一致）
FLAT_ETFS = [
    "SPY", "QQQ", "TLT", "IEF", "LGOV",
    "EMLC", "GLD", "COMT", "USO", "DBC"
]

# ==============================================
# 2. 工具函数：A股代码自动补全+数据拉取
# ==============================================
def format_symbol(s):
    """自动补全A股代码后缀：688012 -> 688012.SS"""
    s = str(s).strip().upper()
    if s.isdigit() and len(s) == 6:
        return s + ".SS" if s.startswith("6") else s + ".SZ"
    return s

def fetch_stock_data(symbol, add_date=None):
    """
    拉取股票数据：
    - 躺平组合：返回 代码/名称/现价/涨跌幅
    - 自定义标的：额外返回 累计收益率/添加日期
    """
    max_retries = 3
    for retry in range(max_retries):
        try:
            ticker = yf.Ticker(symbol)
            # 拉取30天数据，确保有足够历史计算收益
            hist = ticker.history(period="30d", auto_adjust=True)
            if hist.empty:
                time.sleep(1)
                continue

            # 核心数据：现价、当日涨跌幅
            current_price = round(hist["Close"].iloc[-1], 2)
            prev_close = hist["Close"].iloc[-2] if len(hist)>=2 else current_price
            change_pct = round((current_price - prev_close) / prev_close * 100, 2)
            name = ticker.info.get("shortName", symbol)

            # 自定义标的：计算从添加日起的累计收益率
            if add_date:
                add_dt = pd.to_datetime(add_date).tz_localize(None)
                hist.index = hist.index.tz_localize(None)
                # 找到添加日之后的第一个交易日
                available_days = hist.index[hist.index >= add_dt]
                if len(available_days) > 0:
                    buy_price = hist.loc[available_days[0], "Close"]
                    cumulative_return = round((current_price - buy_price) / buy_price * 100, 2)
                else:
                    cumulative_return = "-"
                return [symbol, name, current_price, f"{change_pct}%", f"{cumulative_return}%", add_date]
            
            # 躺平组合：只返回基础数据
            else:
                return [symbol, name, current_price, f"{change_pct}%"]
        
        except Exception as e:
            print(f"第{retry+1}次抓取{symbol}失败: {str(e)}")
            time.sleep(1)
    
    # 抓取失败兜底
    if add_date:
        return [symbol, "抓取失败", "-", "-", "-", add_date]
    else:
        return [symbol, "抓取失败", "-", "-"]

# ==============================================
# 3. 页面样式：1:1复刻原网站
# ==============================================
# 页面标题（和原网站完全一致）
st.markdown("""
    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">躺平ETF组合（实时）</h1>
    <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem;">US市场</p>
""", unsafe_allow_html=True)

# 标签页（和原网站样式一致：官方躺平组合 + 我的自定义标的）
tab1, tab2 = st.tabs(["官方躺平组合", "我的自定义标的"])

# ==============================================
# 4. 标签页1：官方躺平组合（完全复刻原网站）
# ==============================================
with tab1:
    with st.spinner("正在拉取实时行情..."):
        # 拉取躺平组合数据
        flat_data = [fetch_stock_data(sym) for sym in FLAT_ETFS]
        df_flat = pd.DataFrame(flat_data, columns=["代码", "名称", "现价", "涨跌幅"])
        
        # 表格样式：和原网站完全一致，隐藏索引
        st.dataframe(
            df_flat,
            use_container_width=True,
            hide_index=True,
            column_config={
                "代码": st.column_config.TextColumn(width="small"),
                "名称": st.column_config.TextColumn(width="large"),
                "现价": st.column_config.NumberColumn(format="%.2f"),
                "涨跌幅": st.column_config.TextColumn(width="small")
            }
        )

# ==============================================
# 5. 标签页2：我的自定义标的（新增功能：添加日起收益）
# ==============================================
with tab2:
    st.subheader("➕ 添加Z先生新标的（跟踪从添加日起的收益）")
    
    # 输入区域：代码+添加日期
    col1, col2 = st.columns([2, 1])
    with col1:
        new_symbol = st.text_input("标的代码（例：688012/AVGO/300782）", key="new_sym")
    with col2:
        add_date = st.date_input("添加日期", datetime.today(), key="add_date")
    
    # 初始化会话状态（保存添加的标的）
    if "custom_stocks" not in st.session_state:
        st.session_state.custom_stocks = []

    # 添加按钮
    if st.button("添加到跟踪列表", type="primary"):
        if new_symbol:
            formatted_sym = format_symbol(new_symbol)
            st.session_state.custom_stocks.append({
                "symbol": formatted_sym,
                "date": str(add_date)
            })
            st.success(f"✅ 已添加：{formatted_sym}，将从{add_date}开始跟踪收益")

    # 标的管理：删除功能
    if st.session_state.custom_stocks:
        with st.expander("🗑️ 管理跟踪列表（删除标的）"):
            for i, item in enumerate(st.session_state.custom_stocks):
                col_del, col_sym = st.columns([1, 4])
                with col_del:
                    if st.button(f"删除", key=f"del_{i}"):
                        del st.session_state.custom_stocks[i]
                        st.rerun()
                with col_sym:
                    st.write(f"{item['symbol']}（添加日期：{item['date']}）")

    # 展示自定义标的列表（含累计收益）
    st.subheader("📋 我的跟踪标的")
    if not st.session_state.custom_stocks:
        st.info("还未添加标的，在上方输入Z先生推荐的标的即可添加")
    else:
        with st.spinner("正在拉取行情数据..."):
            # 拉取数据（带累计收益）
            custom_data = []
            for item in st.session_state.custom_stocks:
                data = fetch_stock_data(item["symbol"], item["date"])
                custom_data.append(data)
            
            # 表格：新增「累计收益率(自添加日)」列
            df_custom = pd.DataFrame(
                custom_data,
                columns=["代码", "名称", "现价", "当日涨跌幅", "累计收益率(自添加日)", "添加日期"]
            )
            
            # 表格样式：和躺平组合保持一致
            st.dataframe(
                df_custom,
                use_container_width=True,
                hide_index=True,
                column_config={
                    "代码": st.column_config.TextColumn(width="small"),
                    "名称": st.column_config.TextColumn(width="large"),
                    "现价": st.column_config.NumberColumn(format="%.2f"),
                    "当日涨跌幅": st.column_config.TextColumn(width="small"),
                    "累计收益率(自添加日)": st.column_config.TextColumn(width="medium"),
                    "添加日期": st.column_config.TextColumn(width="small")
                }
            )

            # 导出CSV功能
            if st.download_button(
                "导出数据",
                df_custom.to_csv(index=False, encoding="utf-8-sig"),
                "z_stocks_tracker.csv",
                "text/csv"
            ):
                st.success("✅ 导出成功！")

# ==============================================
# 6. 页脚（和原网站一致）
# ==============================================
st.caption("数据来源：Yahoo Finance | 实时更新")
