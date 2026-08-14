# Z先生躺平组合

一个适配手机与电脑的 ETF 组合看板，用于展示美股、港股和 A 股三个组合的持仓与净值走势。

- 网站：[bjzsir.com](https://bjzsir.com/)
- 仓库：[lie-flat-tracker](https://github.com/jiawen96110-collab/lie-flat-tracker)

## 当前功能

- 展示三个市场的 ETF 组合与持仓权重
- 计算并展示自 2026 年首个交易日起的复权净值走势
- 支持近 3 月、近 6 月和成立以来三个时间区间
- 支持拖动走势图查看每日净值
- 行情每 30 秒自动刷新，也可手动刷新
- 同时适配桌面端、移动端及深浅色模式

历史走势由各 ETF 的复权日线与固定组合权重计算。美股使用复权收盘价，A/H 股使用前复权日线，减少分红、拆股等因素造成的收益跳变；盘中最新点根据实时行情估算。

## 数据维护

- `portfolio_config.js`：组合名称、ETF、权重及行情代码
- `portfolio_history.js`：自动生成的历史净值数据
- `fetch_portfolio_history.py`：抓取复权行情并计算组合净值
- `.github/workflows/`：交易日自动更新历史净值

调整组合时，只需修改 `portfolio_config.js`，并确保每个组合的权重合计为 100%。历史净值可由 GitHub Actions 自动更新，也可在 Actions 页面手动运行 `Update Portfolio History`。

## 主要文件

```text
index.html                    页面结构
style.css                    页面样式与响应式布局
app.js                       行情、交互与图表渲染
portfolio_config.js          三市场组合配置
portfolio_history.js         组合历史净值
fetch_portfolio_history.py   历史净值生成脚本
```

## 风险提示

市场有风险，投资需谨慎。
