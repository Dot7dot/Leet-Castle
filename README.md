# 🏰 Leet Castle・程式城堡

**從零開始學程式，一路挑戰到 LeetCode Medium / Hard 的冒險遊戲。**

蟲蟲魔王用 Bug 詛咒了程式城堡。每一層都有被詛咒的守衛，只有學會「程式魔法」的人才能淨化它們。
在瀏覽器裡直接寫 **JavaScript** 或 **Python**，邊學邊打怪、開寶箱、收集服裝、解鎖成就！

## ✨ 特色

| 系統 | 內容 |
| --- | --- |
| 📖 **故事模式** | 5 層城堡、48 個關卡。每關教一個概念（函式 → 迴圈 → 雜湊表 → 雙指標 → 二分搜尋 → 遞迴 → 鏈結串列 → 樹 → BFS/DFS → 回溯 → 動態規劃 → 堆積 → 單調堆疊……），課程附 JS／Python 範例程式，最後的 BOSS 是 Hard 題「接雨水」。每關三顆星：通過／最佳時間複雜度／失敗提交 ≤ 1 次。 |
| ⚔️ **挑戰模式** | 選擇 Easy／Medium／Hard 隨機挑戰（69 題經典題），或從題目列表挑題。通過後自動量測 **時間複雜度**、**空間複雜度** 與 **答題時間**，給出 S／A／B／C 評價。 |
| 📅 **每日挑戰** | 每天一道題，首次完成送黃金寶箱。 |
| 🎁 **寶箱** | 木、銅、黃金、鑽石四種寶箱，越高級越容易開出稀有服裝。可在商店用金幣購買，或從關卡掉落——越難的題目、越高的評價，越有機會掉落高級寶箱。重複的服裝自動轉換成金幣。 |
| 👗 **換裝** | 三頭身 Q 版角色，9 個部位（頭飾、髮型、臉飾、上衣、下身、鞋子、手持、背飾、寵物）共 66 件服裝，分為普通／稀有／史詩／傳說四種稀有度，傳說服裝有動態特效。另可自選膚色與瞳色。 |
| 🏆 **成就** | 每種程式語言**各自獨立**解鎖一整套成就（用 Python 重新挑戰，又是全新的旅程），另有共通成就。 |
| 📈 **成長** | 經驗值與等級、稱號、連續登入獎勵。 |

## 🎮 如何遊玩

不需要安裝、不需要建置：

```bash
# 方法一：直接用瀏覽器打開
open index.html

# 方法二：啟動本機伺服器（建議）
python3 -m http.server 8000
# 然後打開 http://localhost:8000
```

也可以直接部署到 GitHub Pages（Settings → Pages → Deploy from branch）。

- JavaScript 在瀏覽器的 Web Worker 中原生執行。
- Python 透過 [Pyodide](https://pyodide.org)（CPython 的 WebAssembly 版本）執行，第一次使用時需要從 CDN 下載（約 10 MB，之後會被瀏覽器快取）。
- 進度儲存在瀏覽器的 localStorage，可在「冒險者資料」中匯出／匯入存檔碼。

## ⏱️ 複雜度是怎麼量測的？

提交並通過所有測資後，遊戲會用一系列越來越大的輸入（例如 n = 64, 128, …, 4096）實際執行你的程式：

- **時間**：把程式碼插樁（JavaScript 用 [acorn](https://github.com/acornjs/acorn) 解析 AST，Python 用內建 `ast` 模組），計算迴圈次數、函式呼叫次數，以及內建函式的隱藏成本（例如 `sort` 是 n log n、`list.pop(0)`／`Array.shift` 是 O(n)、`x in list` 是 O(n)）。
- **空間**：追蹤存活中的容器元素數量（陣列、雜湊表、集合、字串……）的峰值，以及遞迴深度。
- 最後把「運算次數 vs n」擬合到 O(1)、O(log n)、O(√n)、O(n)、O(n log n)、O(n²)、O(2ⁿ)、O(n!) 等成長曲線，選出最符合的一個。

這是實際量測的「估算」，結果附有圖表，可以點開「量測細節」查看。

## 🗂️ 專案結構

```
index.html               遊戲入口
selftest.html            自我測試頁（用參考解答跑完所有題目與複雜度分析）
css/style.css            介面樣式
js/shared.js             ListNode / TreeNode、測資產生器（主執行緒與 Worker 共用）
js/engine/               判題引擎：JS Worker、Python(Pyodide) Worker、複雜度擬合、執行器
js/data/problems*.js     題庫（83 題：題目、測資產生器、JS 與 Python 參考解答、提示、解說）
js/data/story.js         故事模式章節與課程內容
js/data/items.js         角色繪製與 66 件服裝、寶箱
js/data/monsters.js      關卡怪物
js/data/achievements.js  成就
js/game.js               存檔、經濟系統、評分、獎勵
js/ui/                   畫面（大廳、故事地圖、挑戰、衣櫃、商店、成就、解題畫面）
vendor/                  CodeMirror 5、acorn（MIT）
tools/selftest.cjs       無頭瀏覽器自我測試腳本
```

### 新增一道題目

在 `js/data/problems-extra.js` 中呼叫 `add({...})`，主要欄位：

- `fn`、`params`（`[['nums', 'int[]'], ['target', 'int']]`）、`ret`：函式簽名，會自動產生兩種語言的初始程式碼
- `examples`、`tests`：範例與邊界測資（只需要輸入，預期輸出由 `ref` 自動算出）
- `gen(R, n, worst)`：隨機測資產生器；`rand`、`big` 控制隨機與大型測資的大小
- `cx: { time, space, sizes, gen, labels, note }`：最佳複雜度與量測設定
- `ref`：JavaScript 參考解答；`py`：Python 參考解答
- `cmp: 'unordered'` / `'unorderedDeep'` / `'float'` 或 `check(out, args, expected)`：答案比對方式

然後執行自我測試，確認兩種語言的參考解答都能通過、量測到的複雜度符合 `cx`：

```bash
npm i -D playwright
node tools/selftest.cjs both              # 或 javascript / python，也可以加上題目 id
```

## 📄 授權

遊戲程式碼與內容為本專案所有。內附的 CodeMirror 與 acorn 依其 MIT 授權發佈（見 `vendor/`）。題目為經典演算法問題的原創中文改寫。
