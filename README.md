# 躺平组合数据整理

这是一个用于查看三市场 ETF 组合和若干关注标的表现的静态网页项目。

在线访问地址：

- Cloudflare Pages: https://lie-flat-tracker.pages.dev/

## 项目功能

- 展示美股、港股、A 股三个 ETF 组合
- 展示每个持仓的权重、当日涨跌和 YTD 表现
- 展示“数据整理”关注列表，支持默认分组、累计涨幅排序、记录日期排序
- 支持点击关注标的查看行业、逻辑、分析和记录价对比
- 展示美股与 A/H 股两套周报估值雷达
- 根据实时价格标记理想买入区、合理区和理想卖出区
- 每 30 秒自动刷新一次行情
- 支持深色/浅色系统主题

## 文件说明

```text
index.html                 网页入口，只保留页面结构
style.css                  页面样式，包括颜色、布局、移动端适配
data.js                    组合配置、YTD 基准价、关注标的数据
valuation.js               美股与 A/H 股周报估值、持仓比例和参考价格
app.js                     页面交互、行情请求、排序、渲染逻辑
data.json                  GitHub Actions 定时生成的行情数据
fetch_stock_data.py        早期 Python 抓取脚本，目前网页未直接使用
requirements.txt           Python 脚本依赖
.github/workflows/         GitHub 自动任务配置
```

## 当前数据方式

当前网页主要通过腾讯财经接口在浏览器中实时获取行情：

```text
https://qt.gtimg.cn/q=...
```

仓库中也保留了 `data.json` 和 GitHub Actions 自动更新逻辑，但当前 `index.html` 页面还没有改为读取 `data.json`。

## 本地查看

这个项目是纯静态网页，不需要安装复杂环境。

最简单的方式是直接用浏览器打开 `index.html`。

如果想用本地服务打开，可以在项目目录启动一个静态服务器，然后访问本地地址。

## 部署说明

项目当前使用 GitHub 托管代码，并通过 Cloudflare Pages 发布网站。

通常流程是：

```text
修改代码
提交到 GitHub
Cloudflare Pages 自动重新部署
线上网址更新
```

只要保留仓库根目录下的 `index.html`，Cloudflare Pages 一般不需要额外调整。

## 风险提示

本项目仅用于公开数据整理和个人学习研究，不构成任何投资建议。

市场有风险，投资需谨慎。
