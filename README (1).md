# 咖啡饮品百科全书 - GitHub Pages 部署文档

## 项目简介
纯原生 HTML + CSS + JavaScript 实现的 **咖啡饮品百科全书** 站。
站内预置 8 条高质量内容，支持分类筛选、关键词搜索、主题切换、移动端流式卡片布局、详情弹窗展示。
GitHub Actions 每日定时（北京时间 19:52 左右）刷新排序、更新阅读热度/评分时间戳，保持内容新鲜感。

## 功能特性
- ✅ 原生 HTML/CSS/JS，零前端框架，无 CDN 依赖
- ✅ 暗色/浅色主题切换（跟随系统 + localStorage 记忆偏好）
- ✅ 分类筛选：全部 / 意式浓缩 / 手冲单品 / 特调拿铁 / 冷萃冰咖 / 烘焙豆知识 / 器具指南
- ✅ 关键词全站搜索（标题+所有字段合并模糊匹配）
- ✅ 卡片流式布局（>1024px 多列，<720px 单列，自适应）
- ✅ 卡片点击弹窗详情（字段自动分 KV 表 + 大段落展示 + 评分大号渐变色）
- ✅ 评分/分数项目大号渐变色展示
- ✅ GitHub Actions 每日定时刷新（打乱顺序、views/评分扰动），保持首页动态变化
- ✅ 所有资源读取本地 `data/data.json`，彻底规避浏览器跨域问题

## 目录结构
```
web31/
├── index.html
├── css/style.css           # 主题色：#7c3aed + #c2410c
├── js/app.js
├── data/data.json          # 预置 8 条 咖啡饮品百科全书 内容
└── .github/workflows/deploy.yml
```

## 部署步骤

### 方案 A：独立仓库部署（推荐）
1. 将 web31 文件夹**内部所有文件**上传到一个独立 GitHub 仓库根目录（不是把 web31/ 上传，而是把里面的 index.html / css / js / data / .github 上传到仓库根）
2. 仓库 → Settings → Pages → Source 选择 **GitHub Actions**
3. 仓库 → Actions → 找到本工作流 → Run workflow → 手动执行一次
4. 1~2 分钟后，部署完成，生成地址形如：`https://你的用户名.github.io/仓库名/`

### 方案 B：Monorepo 子路径部署（与 web11~web30 同仓）
1. 整个项目（web11~web40）全部 push 到同一个仓库（根目录下放 web11~web40 文件夹）
2. Settings → Pages → Source 选 **GitHub Actions**
3. 进入 Actions → 选中 `web31 - 每日更新+部署 GitHub Pages` → Run workflow
4. 部署完成后访问：`https://你的用户名.github.io/仓库名/` （注意每个站点是独立的 Pages 工作流，一次只能部署一个站点；如果想同仓发布多个站点，需要每个站点一个独立 branch 或独立仓库）

> ⚠️ **静态资源路径说明**：本项目全部使用相对路径（./css/、./js/、./data/），**无论部署在根域名还是子路径都不会 404**，无需修改 base/href。

## 每日定时更新机制
GitHub Actions 工作流在 `北京时间 19:52 左右`（UTC 11:52）会自动运行：
1. 读取 `data/data.json`
2. **洗牌**打乱 24 条内容的排列顺序（每次首页都不一样）
3. **评分 +阅读量微扰动**（评分在 ±0.05 浮动，阅读量 ±8% 浮动，制造动态感）
4. 更新 `lastUpdate` 时间戳
5. git commit + push 回仓库
6. 自动部署 GitHub Pages

> 想修改刷新频率？编辑 `.github/workflows/deploy.yml` 第 10 行左右的 `cron: 'xx xx * * *'`，cron 语法是 UTC 时间（减 8 小时=北京时间）。

## 本地预览
1. 安装 Python 3.x
2. 进入本项目根目录（web40 的上级目录），执行：
   ```bash
   python -m http.server 8080
   ```
3. 浏览器访问 `http://localhost:8080/web31/index.html`

## 常见问题
**Q: 搜索功能不生效？** A: 必须通过 HTTP 服务器访问（localhost 或 GitHub Pages），直接双击 index.html 用 file:// 协议打开会因为浏览器 CORS 策略无法读取 JSON。

**Q: 如何自定义内容？** A: 编辑 `data/data.json` 的 `items` 数组即可，所有字段都是自由的，JS 会自动渲染。

**Q: 如何修改主题色？** A: 编辑 `css/style.css` 最顶部的 `:root` 中的 `--accent` 和 `--accent2` 两个 CSS 变量即可全局换色。
