# 笑傲江湖 · 令狐沖

以 [Three.js](https://threejs.org/)（WebGL）製作的立體武俠冒險小遊戲。主角為金庸《笑傲江湖》中的 **令狐沖**。

## 線上遊玩

部署後網址：<https://ltmtms.github.io/p/>

靜態圖片與影片放在 `public/`，建置時會原樣複製到網站根目錄，網址為 <https://ltmtms.github.io/p/><filename>（檔名不變）。

## 本地遊玩

```bash
npm install
npm run dev
```

瀏覽器開啟終端顯示的位址後，點「開始闖蕩」。

## 部署到 GitHub Pages

Pages 的 Source 必須是 **GitHub Actions**，由 `.github/workflows/deploy-pages.yml` 發布 Vite 的 `dist/`。不要改成 **Deploy from a branch**。

分支發布會把 repo 根目錄原樣放上線：首頁是原始 `index.html`（`/src/main.js`），圖片只在 `/public/<filename>`，所以 `https://ltmtms.github.io/p/eyes.jpg` 會 404。Actions 產物才會把媒體放在網站根目錄，並把程式打成 `/p/assets/`。

1. 合併到 `main` 會跑 **Deploy to GitHub Pages**。
2. Source 已是 GitHub Actions。若被改回 Deploy from a branch，到 **Settings → Pages → Build and deployment** 再選 **GitHub Actions**。
3. 也可在 Actions 分頁手動跑 **Deploy to GitHub Pages**（branch：`main`）。

本地驗證建置：

```bash
npm run build
npm run preview
```

| 操作 | 說明 |
|------|------|
| WASD | 移動 |
| 滑鼠 | 視角（點擊畫布鎖定指標） |
| 左鍵 | 出劍攻擊 |
| Shift | 輕功加速（消耗內力） |
| E | 與古廟／物品互動 |

## 任務

1. 在華山山林中尋找三卷 **獨孤九劍殘篇**
2. 可採靈芝補血、飲桃花酒回內力
3. 擊敗巡邏山賊
4. 殘篇齊全後前往 **華山古廟**，拜見風清揚完成闖蕩

## 技術

- Vite + Three.js（WebGL）
- 程序化角色／場景（古廟、竹林、寶塔、山霧）
- 第三人稱鏡頭、簡易戰鬥與任務流程
