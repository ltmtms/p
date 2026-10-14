# 笑傲江湖 · 令狐沖

以 [Three.js](https://threejs.org/)（WebGL）製作的立體武俠冒險小遊戲。主角為金庸《笑傲江湖》中的 **令狐沖**。

## 線上遊玩

部署後網址：<https://ltmtms.github.io/p/>

## 本地遊玩

```bash
npm install
npm run dev
```

瀏覽器開啟終端顯示的位址後，點「開始闖蕩」。

## 部署到 GitHub Pages

1. 合併本分支到 `main`（會觸發 Actions）。
2. 在 repo **Settings → Pages → Build and deployment**，Source 選 **GitHub Actions**。
3. 也可在 Actions 分頁手動跑 **Deploy to GitHub Pages**。

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
