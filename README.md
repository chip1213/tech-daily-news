# 科技脈動 Daily

AI 產業 & 低軌衛星每日新聞，由 GitHub Actions 自動抓取、GitHub Pages 靜態展示。

## 架構

```
每天 3 次
GitHub Actions ──► scripts/fetch-news.js ──► news.json ──► index.html 讀取顯示
(伺服器端呼叫 Anthropic API)              (commit 進 repo)   (純靜態，無 CORS 問題)
```

## 部署步驟

### 1. Fork / Clone 這個 repo 到你的 GitHub

### 2. 設定 API Key
- 進入 repo 的 **Settings → Secrets and variables → Actions**
- 點「New repository secret」
- Name：`ANTHROPIC_API_KEY`
- Value：貼上你的 Anthropic API Key

### 3. 開啟 GitHub Pages
- 進入 **Settings → Pages**
- Source 選「Deploy from a branch」
- Branch 選 `main`，資料夾選 `/ (root)`
- 儲存後會得到網址：`https://你的帳號.github.io/tech-daily-news`

### 4. 手動觸發第一次更新
- 進入 **Actions → 每日新聞更新 → Run workflow**
- 等 30 秒執行完後，重新整理網頁即可看到新聞

## 排程時間

| UTC 時間 | 台灣時間 |
|----------|----------|
| 00:00    | 08:00    |
| 04:00    | 12:00    |
| 12:00    | 20:00    |

## 本機測試

```bash
npm install
ANTHROPIC_API_KEY=你的key npm run fetch
# 然後用瀏覽器開啟 index.html
```
