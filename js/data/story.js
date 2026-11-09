/*
 * Story Mode: chapters (castle floors) and levels. Each level teaches one concept with a short
 * lesson (examples in both JavaScript and Python) and then asks the player to solve a problem.
 */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const p = (html) => ({ t: 'p', html });
  const h = (html) => ({ t: 'h', html });
  const tip = (html) => ({ t: 'tip', html });
  const cx = (html) => ({ t: 'cx', html });
  const code = (js, py) => ({ t: 'code', js, py });
  const say = (who, html) => ({ t: 'say', who, html });

  const chapters = [
    {
      id: 1, name: '第一層・城門', sub: '程式的第一步', icon: '🚪', color: '#22c55e', bg: 'meadow', monster: 'slime',
      intro: '傳說中的程式城堡 <b>Leet Castle</b> 被「蟲蟲魔王」施下了 Bug 詛咒，每一層都有被詛咒的守衛。只有懂得程式魔法的人才能淨化它們。你——一位見習程式術士——站在了城門前……',
      boss: '史萊姆大王',
    },
    {
      id: 2, name: '第二層・魔法森林', sub: '字串、函式與雜湊表', icon: '🌲', color: '#10b981', bg: 'forest', monster: 'bat',
      intro: '穿過城門，眼前是一片會說話的魔法森林。樹上的蝙蝠精靈喜歡用文字謎題考驗旅人，而森林深處藏著能瞬間找到任何東西的「雜湊之泉」。',
      boss: '異位詞樹精',
    },
    {
      id: 3, name: '第三層・演算法山谷', sub: '經典解題技巧', icon: '⛰️', color: '#f59e0b', bg: 'valley', monster: 'goblin',
      intro: '山谷裡住著狡猾的哥布林，他們的謎題用暴力法解永遠來不及。你需要學會堆疊、雙指標、滑動視窗與二分搜尋這些「招式」。',
      boss: '哥布林軍師',
    },
    {
      id: 4, name: '第四層・遞迴之塔', sub: '遞迴、鏈結串列與樹', icon: '🗼', color: '#8b5cf6', bg: 'tower', monster: 'ghost',
      intro: '這座塔一直往上延伸，彷彿沒有盡頭——塔裡的每個房間，都包含著一座更小的塔。幽靈們守護著鎖鏈與世界樹的秘密。',
      boss: '世界樹守護靈',
    },
    {
      id: 5, name: '第五層・王座之間', sub: '進階演算法', icon: '👑', color: '#ef4444', bg: 'throne', monster: 'dragon',
      intro: '終於來到王座之間。蟲蟲魔王的龍族親衛隊精通回溯、動態規劃與各種高階魔法。擊敗他們，淨化整座城堡吧！',
      boss: '蟲蟲魔王',
    },
  ];

  const levels = [
    /* ------------------------------ Chapter 1 ------------------------------ */
    {
      id: '1-1', ch: 1, problem: 'hello', concept: '函式與回傳值', chest: 'wood',
      story: '「站住！說出口令才能進城！」城門的史萊姆守衛擋住了你。',
      lesson: [
        p('歡迎來到程式的世界！程式就是一連串給電腦的<b>指令</b>。我們會把指令包裝成<b>函式（function）</b>：一台「輸入 → 處理 → 輸出」的小機器。'),
        code(`function hello() {\n  return "Hello, Castle!";\n}`, `def hello():\n    return "Hello, Castle!"`),
        p('<code>return</code> 的意思是：「把這個值交回給呼叫我的人」，並且立刻結束函式。被引號包住的文字叫做<b>字串（string）</b>。'),
        tip('Python 用<b>縮排</b>（4 個空白）表示哪些程式屬於函式；JavaScript 則用大括號 <code>{ }</code>。'),
        p('在每一關，你要完成右邊編輯器裡的函式。按 <b>▶ 執行</b> 可以用範例測試，按 <b>⚔️ 提交</b> 就會用所有測資挑戰守衛！'),
        tip('想看看變數的值？JS 用 <code>console.log(x)</code>，Python 用 <code>print(x)</code>，輸出會顯示在下方的主控台。'),
      ],
    },
    {
      id: '1-2', ch: 1, problem: 'rect-area', concept: '變數與算術運算', chest: 'wood',
      story: '工匠們需要知道城牆有多大，才能準備足夠的油漆。',
      lesson: [
        p('<b>變數</b>就像貼了標籤的盒子，可以把資料存起來，之後再用名字拿出來。'),
        code(`let gold = 10;       // 可以改變的變數用 let\nconst bonus = 5;     // 不會改變的用 const\ngold = gold + bonus; // gold 現在是 15`, `gold = 10        # Python 直接用 = 建立變數\nbonus = 5\ngold = gold + bonus  # gold 現在是 15`),
        h('算術運算子'),
        p('<code>+</code> 加、<code>-</code> 減、<code>*</code> 乘、<code>/</code> 除、<code>%</code> 取餘數。'),
        p('函式可以接收<b>參數</b>：呼叫時傳進來的值。例如 <code>rectangleArea(3, 4)</code> 時，width = 3、height = 4。'),
      ],
    },
    {
      id: '1-3', ch: 1, problem: 'split-coins', concept: '整數除法、餘數與陣列', chest: 'wood',
      story: '打倒史萊姆的隊伍正在為了分金幣吵架，請你主持公道！',
      lesson: [
        p('除法在兩種語言中有點不同：'),
        code(`17 / 5            // 3.4（JS 的 / 會產生小數）\nMath.floor(17 / 5) // 3（無條件捨去）\n17 % 5            // 2（餘數）`, `17 / 5    # 3.4\n17 // 5   # 3（整數除法）\n17 % 5    # 2（餘數）`),
        p('要一次回傳兩個值，可以把它們放進<b>陣列（Array）</b>／<b>串列（list）</b>，用中括號 <code>[ ]</code> 包起來：'),
        code(`return [3, 2];`, `return [3, 2]`),
        tip('<code>%</code> 非常實用：<code>x % 2 == 0</code> 代表 x 是偶數，<code>x % 10</code> 可以取得個位數。'),
      ],
    },
    {
      id: '1-4', ch: 1, problem: 'grade', concept: '條件判斷 if / else', chest: 'wood',
      story: '騎士學院的考官史萊姆要你幫忙打成績。',
      lesson: [
        p('程式常常需要「如果……就……否則……」。這就是<b>條件判斷</b>：'),
        code(`if (score >= 90) {\n  return "A";\n} else if (score >= 80) {\n  return "B";\n} else {\n  return "F";\n}`, `if score >= 90:\n    return "A"\nelif score >= 80:\n    return "B"\nelse:\n    return "F"`),
        p('比較運算子：<code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code>、相等（JS: <code>===</code>，Python: <code>==</code>）、不相等（JS: <code>!==</code>，Python: <code>!=</code>）。'),
        tip('條件會<b>由上往下</b>檢查，第一個成立的就會執行，後面的不再檢查。所以要把最嚴格的條件放前面！'),
      ],
    },
    {
      id: '1-5', ch: 1, problem: 'leap-year', concept: '邏輯運算 and / or / not', chest: 'wood',
      story: '「今年要不要辦祭典呢？」城鎮的長老史萊姆搔著頭。',
      lesson: [
        p('多個條件可以用<b>邏輯運算子</b>組合起來：'),
        code(`a && b   // 且：兩個都成立\na || b   // 或：至少一個成立\n!a       // 非：反過來`, `a and b  # 且\na or b   # 或\nnot a    # 非`),
        p('比較的結果是<b>布林值（boolean）</b>：只有 true / false（Python 是 True / False）。函式也可以直接回傳一個條件式的結果：'),
        code(`return x % 2 === 0;  // x 是偶數就回傳 true`, `return x % 2 == 0  # x 是偶數就回傳 True`),
        tip('不確定先後順序時，加上括號最保險：<code>(A and B) or C</code>。'),
      ],
    },
    {
      id: '1-6', ch: 1, problem: 'sum-to', concept: 'for 迴圈與時間複雜度', chest: 'bronze',
      story: '通往第二層的階梯上鑲滿了寶石。要搬走它們之前，先數數看有幾顆吧！',
      lesson: [
        p('需要重複做事時，就用<b>迴圈</b>。for 迴圈可以讓一個變數依序走過一段範圍：'),
        code(`let total = 0;\nfor (let i = 1; i <= n; i++) {\n  total += i;   // total = total + i\n}`, `total = 0\nfor i in range(1, n + 1):  # 1, 2, ..., n\n    total += i`),
        tip('Python 的 <code>range(a, b)</code> 包含 a、<b>不包含</b> b。'),
        h('⏱️ 什麼是時間複雜度？'),
        p('上面的迴圈跑了 n 次，我們說它的時間複雜度是 <b>O(n)</b>：n 變成兩倍，花的時間也大約變兩倍。'),
        cx('提交後，遊戲會用越來越大的輸入實際測量你的程式，估算它的<b>時間複雜度</b>與<b>空間複雜度</b>。達到最佳複雜度可以獲得額外的星星！這一關的最佳解是 <b>O(1)</b>——想想看高斯是怎麼算 1+2+…+100 的？'),
      ],
    },
    {
      id: '1-7', ch: 1, problem: 'count-digits', concept: 'while 迴圈', chest: 'wood',
      story: '數字精靈出了一道題：「我的名字有幾位數？」',
      lesson: [
        p('當你不知道要重複幾次，只知道「什麼時候該停」，就用 <b>while 迴圈</b>：只要條件成立就繼續。'),
        code(`while (n > 0) {\n  n = Math.floor(n / 10); // 去掉最後一位\n  count++;\n}`, `while n > 0:\n    n //= 10   # 去掉最後一位\n    count += 1`),
        tip('小心<b>無窮迴圈</b>！一定要確保迴圈內有東西會讓條件最後變成 false。遊戲偵測到程式跑太久會判定「超時」。'),
        cx('每次除以 10，數字的位數就少 1。n 有 log₁₀(n) 位，所以這是 <b>O(log n)</b>——比 O(n) 快非常多！'),
      ],
    },
    {
      id: '1-8', ch: 1, problem: 'array-sum', concept: '陣列走訪', chest: 'wood',
      story: '寶物庫裡有一排寶箱，國王想知道總共有多少金幣。',
      lesson: [
        p('陣列可以存放一串資料，用<b>索引</b>（從 0 開始）取出元素：'),
        code(`const nums = [3, 1, 4];\nnums[0];       // 3\nnums.length;   // 3\nfor (const x of nums) {  // 依序取出每個元素\n  console.log(x);\n}`, `nums = [3, 1, 4]\nnums[0]      # 3\nlen(nums)    # 3\nfor x in nums:  # 依序取出每個元素\n    print(x)`),
        p('如果需要索引，也可以這樣寫：'),
        code(`for (let i = 0; i < nums.length; i++) {\n  console.log(i, nums[i]);\n}`, `for i in range(len(nums)):\n    print(i, nums[i])`),
        cx('看過每個元素一次：時間 <b>O(n)</b>。只用了一個 total 變數：額外空間 <b>O(1)</b>。'),
      ],
    },
    {
      id: '1-9', ch: 1, problem: 'find-max', concept: '追蹤最佳值', chest: 'wood',
      story: '「誰是城門最強的怪物？」史萊姆們爭吵不休。',
      lesson: [
        p('一個非常常見的模式：用一個變數記住「目前為止最好的答案」，走訪時不斷更新。'),
        code(`let best = nums[0];\nfor (const x of nums) {\n  if (x > best) best = x;\n}`, `best = nums[0]\nfor x in nums:\n    if x > best:\n        best = x`),
        tip('初始值很重要！如果把 best 設成 0，當所有數字都是負數時就會出錯。用第一個元素當初始值最安全。'),
      ],
    },
    {
      id: '1-10', ch: 1, problem: 'fizz-buzz', concept: 'BOSS：綜合練習', chest: 'gold', boss: true,
      story: '史萊姆大王出現了！「回答我的 FizzBuzz 之謎，否則休想通過！」',
      lesson: [
        p('第一層的 BOSS 要你結合<b>迴圈、條件判斷、陣列與字串</b>。'),
        p('把結果一個一個加進陣列：'),
        code(`const answer = [];\nanswer.push("Fizz");   // 加到尾端\nString(7);             // "7"`, `answer = []\nanswer.append("Fizz")  # 加到尾端\nstr(7)                 # "7"`),
        tip('判斷順序是關鍵：15 的倍數同時也是 3 的倍數，所以要<b>先</b>檢查 15。'),
        p('這題是經典的面試暖身題（LeetCode 412）。準備好了嗎？'),
      ],
    },

    /* ------------------------------ Chapter 2 ------------------------------ */
    {
      id: '2-1', ch: 2, problem: 'count-vowels', concept: '字串走訪', chest: 'wood',
      story: '森林入口的蝙蝠精靈只讓「懂得母音」的人通過。',
      lesson: [
        p('字串可以看成「字元的陣列」：可以用索引取字元，也可以用迴圈走訪。'),
        code(`const s = "Hello";\ns[0];          // "H"\ns.length;      // 5\nfor (const ch of s) { /* ... */ }\n"aeiou".includes("e"); // true`, `s = "Hello"\ns[0]          # "H"\nlen(s)        # 5\nfor ch in s:\n    pass\n"e" in "aeiou"  # True`),
        tip('大小寫是不同的字元！<code>"A" === "a"</code> 是 false。可以用 <code>toLowerCase()</code> / <code>lower()</code> 轉成小寫再比較。'),
      ],
    },
    {
      id: '2-2', ch: 2, problem: 'reverse-string', concept: '建立新字串', chest: 'wood',
      story: '魔鏡裡傳出聲音：「elcats……elcats……」',
      lesson: [
        p('建立新字串的方法很多。最直接的是從最後一個字元往前走：'),
        code(`let result = "";\nfor (let i = s.length - 1; i >= 0; i--) {\n  result += s[i];\n}`, `result = ""\nfor i in range(len(s) - 1, -1, -1):\n    result += s[i]`),
        p('兩種語言都有更簡潔的寫法：'),
        code(`s.split("").reverse().join("");\n// split 拆成陣列、reverse 反轉、join 接回字串`, `s[::-1]   # 切片：從頭到尾、步長 -1`),
        tip('Python 的<b>切片</b> <code>s[a:b]</code> 取出索引 a 到 b−1；JS 對應的是 <code>s.slice(a, b)</code>。'),
      ],
    },
    {
      id: '2-3', ch: 2, problem: 'palindrome-basic', concept: '雙指標初體驗', chest: 'wood',
      story: '一座橋橫跨在河上，橋頭寫著：「唯有迴文，方可通行」。',
      lesson: [
        p('判斷迴文時，不需要真的把字串反轉。用兩個索引從兩端往中間走，一一比較就好：'),
        code(`let left = 0, right = s.length - 1;\nwhile (left < right) {\n  // 比較 s[left] 和 s[right]\n  left++;\n  right--;\n}`, `left, right = 0, len(s) - 1\nwhile left < right:\n    # 比較 s[left] 和 s[right]\n    left += 1\n    right -= 1`),
        cx('反轉字串需要 O(n) 額外空間；雙指標只用兩個變數：<b>O(1) 空間</b>。這就是「雙指標」技巧的威力，第三層還會再遇到它！'),
      ],
    },
    {
      id: '2-4', ch: 2, problem: 'is-prime', concept: '函式的提早回傳', chest: 'bronze',
      story: '魔法陣需要質數水晶才能啟動，但市集上混了很多假貨……',
      lesson: [
        p('<code>return</code> 會<b>立刻</b>結束函式。這讓我們可以「一找到答案就離開」：'),
        code(`for (let d = 2; d * d <= n; d++) {\n  if (n % d === 0) return false; // 找到因數，直接結束\n}\nreturn true;`, `d = 2\nwhile d * d <= n:\n    if n % d == 0:\n        return False  # 找到因數，直接結束\n    d += 1\nreturn True`),
        p('你也可以自己定義<b>輔助函式</b>，把大問題拆成小問題。'),
        cx('如果從 2 試到 n−1 是 O(n)。但因數總是成對出現（a × b = n），只要試到 √n 就夠了：<b>O(√n)</b>。對 n = 10 億來說，是 10 億次 vs 3 萬次的差別！'),
      ],
    },
    {
      id: '2-5', ch: 2, problem: 'first-uniq-char', concept: '雜湊表：計數', chest: 'wood',
      story: '符文石碑上，只有一個符文是孤單的。找到它，就能開啟森林的秘道。',
      lesson: [
        p('<b>雜湊表（Hash Map）</b>是程式設計中最重要的資料結構之一：它把「鍵（key）」對應到「值（value）」，查詢、新增都只要平均 <b>O(1)</b>。'),
        code(`const count = new Map();\ncount.set("a", 1);\ncount.get("a");           // 1\ncount.has("b");           // false\ncount.set(ch, (count.get(ch) || 0) + 1); // 計數的慣用寫法`, `count = {}\ncount["a"] = 1\ncount["a"]           # 1\n"b" in count         # False\ncount[ch] = count.get(ch, 0) + 1  # 計數的慣用寫法\n# 或者：from collections import Counter; Counter(s)`),
        tip('JS 也可以用一般物件 <code>{}</code> 當雜湊表，但 <code>Map</code> 功能更完整。'),
      ],
    },
    {
      id: '2-6', ch: 2, problem: 'contains-duplicate', concept: '集合 Set', chest: 'wood',
      story: '森林裡混進了會分身術的狐狸，快把分身找出來！',
      lesson: [
        p('<b>集合（Set）</b>只存放「不重複」的元素，並且可以在 O(1) 時間判斷某個元素在不在裡面：'),
        code(`const seen = new Set();\nseen.add(3);\nseen.has(3);   // true\nseen.size;     // 1`, `seen = set()\nseen.add(3)\n3 in seen      # True\nlen(seen)      # 1`),
        cx('暴力法比較每一對元素需要 <b>O(n²)</b>：n = 10 萬時要比較 50 億次！用集合只要 <b>O(n)</b>。這是「用空間換時間」的經典例子。'),
        tip('陣列的 <code>includes</code> / Python 串列的 <code>in</code> 是 O(n)；集合的查詢才是 O(1)。'),
      ],
    },
    {
      id: '2-7', ch: 2, problem: 'two-sum', concept: '雜湊表：查找配對', chest: 'bronze',
      story: '雜湊之泉的泉水低語：「找到兩個加起來等於目標的數字吧……」',
      lesson: [
        p('LeetCode 第 1 題！暴力解是檢查每一對 (i, j)：'),
        code(`for (let i = 0; i < nums.length; i++)\n  for (let j = i + 1; j < nums.length; j++)\n    if (nums[i] + nums[j] === target) return [i, j];`, `for i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        if nums[i] + nums[j] == target:\n            return [i, j]`),
        p('這是 O(n²)。能更快嗎？關鍵是換個問題：對每個數 x，我需要的另一半是 <code>target − x</code>。如果用雜湊表記住「看過的數字 → 它的索引」，就能 O(1) 查到！'),
        cx('目標：<b>O(n) 時間</b>。達成最佳複雜度可以獲得第二顆星 ⭐'),
      ],
    },
    {
      id: '2-8', ch: 2, problem: 'valid-anagram', concept: '排序與計數', chest: 'wood',
      story: '「listen」和「silent」是同一個咒語嗎？',
      lesson: [
        p('<b>排序</b>是很強大的工具：排序後，相同的元素會排在一起。'),
        code(`[3, 1, 2].sort((a, b) => a - b);   // [1, 2, 3]（數字要給比較函式！）\n"cab".split("").sort().join("");   // "abc"`, `sorted([3, 1, 2])      # [1, 2, 3]\n"".join(sorted("cab"))  # "abc"\nnums.sort()            # 原地排序`),
        tip('JS 的 <code>sort()</code> 預設會把元素當成<b>字串</b>比較：<code>[10, 9, 1].sort()</code> 會得到 <code>[1, 10, 9]</code>！數字排序一定要傳 <code>(a, b) => a - b</code>。'),
        cx('排序的時間複雜度是 <b>O(n log n)</b>。但這題有更快的方法：字母只有 26 個，用一個長度 26 的陣列計數就是 <b>O(n)</b>。'),
        code(`const count = new Array(26).fill(0);\ncount[ch.charCodeAt(0) - 97]++;  // 'a' 的編碼是 97`, `count = [0] * 26\ncount[ord(ch) - ord("a")] += 1`),
      ],
    },
    {
      id: '2-9', ch: 2, problem: 'transpose', concept: '二維陣列與巢狀迴圈', chest: 'wood',
      story: '森林中央的石板魔法陣被打亂了，需要把它「轉置」回來。',
      lesson: [
        p('陣列裡也可以放陣列，形成<b>二維陣列</b>（矩陣）：'),
        code(`const grid = [[1, 2, 3],\n              [4, 5, 6]];\ngrid[1][2];        // 6（第 1 列、第 2 行）\ngrid.length;       // 2 列\ngrid[0].length;    // 3 行`, `grid = [[1, 2, 3],\n        [4, 5, 6]]\ngrid[1][2]       # 6\nlen(grid)        # 2 列\nlen(grid[0])     # 3 行`),
        p('用<b>巢狀迴圈</b>走訪所有格子：'),
        code(`for (let i = 0; i < rows; i++)\n  for (let j = 0; j < cols; j++)\n    console.log(grid[i][j]);`, `for i in range(rows):\n    for j in range(cols):\n        print(grid[i][j])`),
        tip('Python 建立二維陣列請用 <code>[[0] * cols for _ in range(rows)]</code>，不要用 <code>[[0] * cols] * rows</code>（每一列會是同一個物件！）。'),
      ],
    },
    {
      id: '2-10', ch: 2, problem: 'group-anagrams', concept: 'BOSS：雜湊表的進階用法', chest: 'gold', boss: true,
      story: '巨大的異位詞樹精甦醒了，它的葉子上寫滿了被打亂的單字！',
      lesson: [
        p('第一道 <b>Medium</b> 題目！雜湊表的 key 不只可以是單一字元，也可以是任何「代表某一群東西」的字串。'),
        p('想想看：「eat」、「tea」、「ate」有什麼共同點？排序後都是「aet」！'),
        code(`const groups = new Map();\nif (!groups.has(key)) groups.set(key, []);\ngroups.get(key).push(word);\nArray.from(groups.values());  // 取出所有群組`, `from collections import defaultdict\ngroups = defaultdict(list)   # 不存在的 key 自動建立空串列\ngroups[key].append(word)\nlist(groups.values())`),
      ],
    },

    /* ------------------------------ Chapter 3 ------------------------------ */
    {
      id: '3-1', ch: 3, problem: 'valid-parentheses', concept: '堆疊 Stack', chest: 'wood',
      story: '山谷入口被括號封印鎖住了，哥布林守衛冷笑著：「解不開的。」',
      lesson: [
        p('<b>堆疊</b>就像一疊盤子：最後放上去的，最先被拿走（後進先出，LIFO）。用陣列就能實作：'),
        code(`const stack = [];\nstack.push(1);   // 放到頂端\nstack.push(2);\nstack.pop();     // 2（拿走頂端）\nstack[stack.length - 1]; // 偷看頂端`, `stack = []\nstack.append(1)\nstack.append(2)\nstack.pop()      # 2\nstack[-1]        # 偷看頂端`),
        p('括號配對正是堆疊的經典應用：最晚打開的括號，必須最先被關閉。'),
        cx('push 與 pop 都是 O(1)。'),
      ],
    },
    {
      id: '3-2', ch: 3, problem: 'time-to-buy', concept: '佇列 Queue 與模擬', chest: 'wood',
      story: '藥水店前大排長龍，哥布林老闆規定每人每次只能買一瓶。',
      lesson: [
        p('<b>佇列</b>就像排隊：先來的先服務（先進先出，FIFO）。'),
        code(`const queue = [1, 2, 3];\nqueue.push(4);     // 排到隊尾\nqueue.shift();     // 1（隊頭離開）—— 注意：shift 是 O(n)！\n// 高效的寫法：用一個 head 索引代替 shift\nlet head = 0;\nconst first = queue[head++];`, `from collections import deque\nqueue = deque([1, 2, 3])\nqueue.append(4)     # 排到隊尾\nqueue.popleft()     # 1（O(1)）\n# 不要用 list.pop(0)，它是 O(n)！`),
        p('很多題目可以先「照著題目模擬」，再想想能不能用數學直接算出答案。'),
        tip('先寫出正確的模擬解，再優化——這是解題的好習慣。'),
      ],
    },
    {
      id: '3-3', ch: 3, problem: 'move-zeroes', concept: '原地修改與快慢指標', chest: 'wood',
      story: '符文陣列中混入了沒有力量的「空白符文」0，請把它們移到最後面。',
      lesson: [
        p('有些題目要求<b>原地（in-place）</b>修改輸入陣列，不能建立新陣列，也不需要回傳。'),
        p('<b>快慢指標</b>：快指標負責讀、慢指標負責寫。'),
        code(`let write = 0;\nfor (let read = 0; read < nums.length; read++) {\n  if (要保留 nums[read]) {\n    nums[write] = nums[read];\n    write++;\n  }\n}`, `write = 0\nfor read in range(len(nums)):\n    if 要保留 nums[read]:\n        nums[write] = nums[read]\n        write += 1`),
        cx('只走訪一次、不需要額外陣列：<b>O(n) 時間、O(1) 空間</b>。'),
      ],
    },
    {
      id: '3-4', ch: 3, problem: 'two-sum-sorted', concept: '對撞雙指標', chest: 'bronze',
      story: '這次的兩數之和是排好序的——哥布林說：「不准用雜湊表！」',
      lesson: [
        p('當陣列<b>已排序</b>時，可以從兩端同時出發：'),
        code(`let l = 0, r = nums.length - 1;\nwhile (l < r) {\n  const sum = nums[l] + nums[r];\n  if (sum === target) /* 找到了 */;\n  else if (sum < target) l++;  // 需要更大：左邊往右\n  else r--;                    // 需要更小：右邊往左\n}`, `l, r = 0, len(nums) - 1\nwhile l < r:\n    s = nums[l] + nums[r]\n    if s == target:\n        pass  # 找到了\n    elif s < target:\n        l += 1\n    else:\n        r -= 1`),
        cx('每一步都排除一個不可能的元素，最多 n 步：<b>O(n) 時間、O(1) 空間</b>。比雜湊表省空間！'),
        tip('注意這題回傳的索引是<b>從 1 開始</b>的。'),
      ],
    },
    {
      id: '3-5', ch: 3, problem: 'max-sum-k', concept: '滑動視窗', chest: 'wood',
      story: '哥布林農夫想知道連續 k 天最多能採到多少魔法草。',
      lesson: [
        p('想像一個寬度為 k 的<b>視窗</b>在陣列上滑動。每往右滑一格：右邊進來一個元素、左邊離開一個元素。'),
        code(`// 視窗 [i-k+1, i] 的和\nsum += nums[i];       // 新元素進來\nsum -= nums[i - k];   // 舊元素離開`, `s += nums[i]        # 新元素進來\ns -= nums[i - k]    # 舊元素離開`),
        cx('每次重新加總 k 個數是 O(n·k)；滑動視窗每次只更新一次：<b>O(n)</b>。'),
      ],
    },
    {
      id: '3-6', ch: 3, problem: 'pivot-index', concept: '前綴和', chest: 'wood',
      story: '山谷的古代天秤需要找到平衡點才能打開大門。',
      lesson: [
        p('<b>前綴和</b>：prefix[i] = nums[0] + … + nums[i−1]。有了它，任何一段區間的和都能 O(1) 算出：'),
        code(`// 區間 [l, r] 的和\nprefix[r + 1] - prefix[l]`, `# 區間 [l, r] 的和\nprefix[r + 1] - prefix[l]`),
        p('這題甚至不用存整個 prefix 陣列：知道總和 total，又知道左邊的和 left，右邊的和就是 <code>total − left − nums[i]</code>。'),
        cx('O(n) 時間、O(1) 空間。'),
      ],
    },
    {
      id: '3-7', ch: 3, problem: 'binary-search', concept: '二分搜尋', chest: 'bronze',
      story: '哥布林偷走了寶物並藏在一排有序的箱子中。只有 20 次機會能打開箱子……',
      lesson: [
        p('猜數字遊戲：1～100，每次告訴你「太大」或「太小」。最好的策略是每次猜中間——每猜一次就排除一半！'),
        code(`let lo = 0, hi = nums.length - 1;\nwhile (lo <= hi) {\n  const mid = Math.floor((lo + hi) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[mid] < target) lo = mid + 1;\n  else hi = mid - 1;\n}`, `lo, hi = 0, len(nums) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1`),
        cx('100 萬個元素最多只要比較 20 次：<b>O(log n)</b>。前提是資料必須<b>有序</b>。'),
        tip('邊界條件是二分搜尋最容易出錯的地方：<code>lo &lt;= hi</code> 還是 <code>lo &lt; hi</code>？<code>mid + 1</code> 還是 <code>mid</code>？想清楚區間的定義！'),
      ],
    },
    {
      id: '3-8', ch: 3, problem: 'best-time-stock', concept: '貪婪：一次走訪', chest: 'wood',
      story: '哥布林商人想知道魔法石該在哪天買、哪天賣。',
      lesson: [
        p('很多題目的關鍵是：<b>走到第 i 天時，我需要知道過去的什麼資訊？</b>'),
        p('如果今天要賣出，最好的買入點一定是「之前的最低價」。所以只要一邊走一邊記住最低價！'),
        code(`let minPrice = Infinity, best = 0;\nfor (const p of prices) {\n  minPrice = Math.min(minPrice, p);\n  best = Math.max(best, p - minPrice);\n}`, `min_price, best = float("inf"), 0\nfor p in prices:\n    min_price = min(min_price, p)\n    best = max(best, p - min_price)`),
        cx('從 O(n²) 的暴力法變成 <b>O(n)</b>。'),
      ],
    },
    {
      id: '3-9', ch: 3, problem: 'longest-substring', concept: 'BOSS：可變長度滑動視窗', chest: 'gold', boss: true,
      story: '哥布林軍師念起了冗長的咒文：「找出最長的、沒有重複字元的片段吧！」',
      lesson: [
        p('滑動視窗的進階版：視窗大小不固定。<b>右邊界</b>不斷往右擴張；當視窗不合法時，<b>左邊界</b>往右收縮。'),
        code(`let left = 0;\nfor (let right = 0; right < s.length; right++) {\n  // 把 s[right] 加入視窗\n  while (視窗不合法) {\n    // 把 s[left] 移出視窗\n    left++;\n  }\n  // 更新答案：right - left + 1\n}`, `left = 0\nfor right in range(len(s)):\n    # 把 s[right] 加入視窗\n    while 視窗不合法:\n        # 把 s[left] 移出視窗\n        left += 1\n    # 更新答案：right - left + 1`),
        cx('left 和 right 都只會往右移動，各最多 n 次：<b>O(n)</b>。這題是 LeetCode 第 3 題，面試超常見！'),
      ],
    },

    /* ------------------------------ Chapter 4 ------------------------------ */
    {
      id: '4-1', ch: 4, problem: 'factorial', concept: '遞迴', chest: 'wood',
      story: '塔裡傳來回音：「要知道我的答案，先問問比我小一號的我……」',
      lesson: [
        p('<b>遞迴</b>就是函式呼叫自己。每個遞迴都需要兩部分：'),
        p('1️⃣ <b>基本情況</b>：最簡單、可以直接回答的情況。<br>2️⃣ <b>遞迴情況</b>：把問題縮小，交給「自己」處理。'),
        code(`function factorial(n) {\n  if (n === 0) return 1;          // 基本情況\n  return n * factorial(n - 1);    // 遞迴情況\n}`, `def factorial(n):\n    if n == 0:\n        return 1                  # 基本情況\n    return n * factorial(n - 1)   # 遞迴情況`),
        cx('每一層遞迴都會佔用「呼叫堆疊」的空間。遞迴 n 層，空間複雜度就是 <b>O(n)</b>。'),
        tip('忘記寫基本情況，函式就會無限呼叫自己，最後「堆疊溢位」！'),
      ],
    },
    {
      id: '4-2', ch: 4, problem: 'climbing-stairs', concept: '記憶化與動態規劃入門', chest: 'bronze',
      story: '高塔的樓梯一階一階往上延伸。幽靈問：「有幾種方法能爬上來？」',
      lesson: [
        p('直接寫遞迴 <code>ways(n) = ways(n-1) + ways(n-2)</code> 是對的，但會<b>重複計算</b>：ways(n−2) 被算了兩次、ways(n−3) 被算了三次……時間是 <b>O(2ⁿ)</b>，n = 45 時要算十幾億次！'),
        p('<b>記憶化</b>：把算過的答案存起來，下次直接拿。'),
        code(`const memo = new Map();\nfunction ways(n) {\n  if (n <= 1) return 1;\n  if (memo.has(n)) return memo.get(n);\n  const r = ways(n - 1) + ways(n - 2);\n  memo.set(n, r);\n  return r;\n}`, `from functools import lru_cache\n\n@lru_cache(maxsize=None)   # 自動記憶化！\ndef ways(n):\n    if n <= 1:\n        return 1\n    return ways(n - 1) + ways(n - 2)`),
        p('或者反過來，<b>由小到大</b>算：這就是<b>動態規劃（DP）</b>。'),
        cx('記憶化：O(n) 時間、O(n) 空間。由下而上只保留前兩項：O(n) 時間、<b>O(1) 空間</b>（最佳）。'),
      ],
    },
    {
      id: '4-3', ch: 4, problem: 'middle-node', concept: '鏈結串列', chest: 'wood',
      story: '幽靈用一條長長的鎖鏈封住了樓梯，弱點就在鎖鏈的正中央。',
      lesson: [
        p('<b>鏈結串列</b>由一個個「節點」串起來，每個節點有值 <code>val</code> 和指向下一個節點的 <code>next</code>：'),
        code(`// 遊戲已經幫你定義好了：\n// class ListNode { constructor(val, next) { this.val = val; this.next = next; } }\nlet cur = head;\nwhile (cur !== null) {\n  console.log(cur.val);\n  cur = cur.next;   // 走到下一個節點\n}`, `# 遊戲已經幫你定義好了：\n# class ListNode:\n#     def __init__(self, val=0, next=None): ...\ncur = head\nwhile cur:\n    print(cur.val)\n    cur = cur.next   # 走到下一個節點`),
        p('鏈結串列不能用索引直接跳到第 i 個，只能一個一個走。'),
        tip('<b>快慢指標</b>：slow 一次走一步、fast 一次走兩步。fast 走到底時，slow 剛好走到一半！'),
      ],
    },
    {
      id: '4-4', ch: 4, problem: 'reverse-list', concept: '指標操作', chest: 'wood',
      story: '鎖鏈的魔力是單向流動的。把它反轉，魔力就會消散！',
      lesson: [
        p('反轉鏈結串列是必學的基本功。關鍵是在改變 <code>cur.next</code> 之前，先把原本的下一個節點<b>存起來</b>，不然就找不到了！'),
        code(`const next = cur.next;  // 1. 先記住下一個\ncur.next = prev;        // 2. 反轉指標\nprev = cur;             // 3. 往前走\ncur = next;`, `nxt = cur.next     # 1. 先記住下一個\ncur.next = prev    # 2. 反轉指標\nprev = cur         # 3. 往前走\ncur = nxt`),
        tip('在紙上畫出 1 → 2 → 3 → null，一步一步模擬，會清楚很多。'),
        cx('迭代法：O(n) 時間、O(1) 空間。'),
      ],
    },
    {
      id: '4-5', ch: 4, problem: 'merge-two-lists', concept: '虛擬頭節點', chest: 'wood',
      story: '兩條排好序的鎖鏈必須合而為一，才能打開下一層的門。',
      lesson: [
        p('建立新串列時，第一個節點常常需要特殊處理。小技巧：先建一個<b>假的頭節點（dummy）</b>，最後回傳 <code>dummy.next</code>。'),
        code(`const dummy = new ListNode(0);\nlet tail = dummy;\n// 每次把一個節點接在 tail 後面\ntail.next = node;\ntail = tail.next;\n// ...\nreturn dummy.next;`, `dummy = ListNode(0)\ntail = dummy\n# 每次把一個節點接在 tail 後面\ntail.next = node\ntail = tail.next\n# ...\nreturn dummy.next`),
        cx('每個節點只處理一次：O(m + n) 時間；只是重新接指標，O(1) 額外空間。'),
      ],
    },
    {
      id: '4-6', ch: 4, problem: 'max-depth', concept: '二元樹與 DFS', chest: 'bronze',
      story: '塔的中央長著一棵世界樹，樹靈問：「我有多高？」',
      lesson: [
        p('<b>二元樹</b>的每個節點最多有兩個孩子：<code>left</code> 和 <code>right</code>。'),
        code(`// class TreeNode { val, left, right }\nfunction visit(node) {\n  if (!node) return;      // 空節點\n  visit(node.left);\n  visit(node.right);\n}`, `# class TreeNode: val, left, right\ndef visit(node):\n    if not node:          # 空節點\n        return\n    visit(node.left)\n    visit(node.right)`),
        p('樹的題目幾乎都可以用遞迴思考：「假設我已經知道左子樹和右子樹的答案，那整棵樹的答案是什麼？」'),
        tip('題目中的樹以「層序陣列」表示，例如 <code>[3,9,20,null,null,15,7]</code>：根是 3，第二層是 9、20，接著是 9 的兩個孩子（null、null），20 的兩個孩子 15、7。'),
        cx('每個節點拜訪一次：O(n)。遞迴深度等於樹高 h：空間 <b>O(h)</b>。'),
      ],
    },
    {
      id: '4-7', ch: 4, problem: 'invert-tree', concept: '樹的遞迴變換', chest: 'wood',
      story: '鏡之迴廊裡的樹全都左右顛倒了……其實是你被顛倒了？',
      lesson: [
        p('遞迴不只能「計算」，也能「修改」。翻轉一棵樹 = 翻轉左子樹、翻轉右子樹，再把它們交換。'),
        code(`// 交換兩個變數\n[a, b] = [b, a];`, `# 交換兩個變數\na, b = b, a`),
        tip('這題有個著名的故事：Homebrew 的作者說他在面試時沒寫出來。現在你可以超越他了！'),
      ],
    },
    {
      id: '4-8', ch: 4, problem: 'level-order', concept: '廣度優先搜尋 BFS', chest: 'bronze',
      story: '幽靈們一層一層地巡邏著世界樹。記錄下每一層的巡邏名單吧！',
      lesson: [
        p('DFS 是「一路走到底再回頭」；<b>BFS</b> 是「一層一層往外擴散」，需要用<b>佇列</b>。'),
        code(`let queue = [root];\nwhile (queue.length) {\n  const next = [];\n  for (const node of queue) {\n    // 處理 node\n    if (node.left) next.push(node.left);\n    if (node.right) next.push(node.right);\n  }\n  queue = next;   // 換下一層\n}`, `from collections import deque\nq = deque([root])\nwhile q:\n    for _ in range(len(q)):   # 這一層有幾個節點\n        node = q.popleft()\n        # 處理 node\n        if node.left: q.append(node.left)\n        if node.right: q.append(node.right)`),
        cx('每個節點進出佇列一次：O(n) 時間、O(n) 空間。BFS 也常用來找「最短路徑」。'),
      ],
    },
    {
      id: '4-9', ch: 4, problem: 'valid-bst', concept: 'BOSS：二元搜尋樹', chest: 'gold', boss: true,
      story: '世界樹守護靈現身：「秩序之樹必須完美無瑕。證明它是有秩序的！」',
      lesson: [
        p('<b>二元搜尋樹（BST）</b>：左子樹所有節點 &lt; 根 &lt; 右子樹所有節點。這讓搜尋可以像二分搜尋一樣快。'),
        p('常見陷阱：只檢查「父子」關係是不夠的！'),
        code(`//      5\n//     / \\\n//    4   6\n//       / \\\n//      3   7     ← 3 < 5，卻在 5 的右子樹裡！`, `#      5\n#     / \\\n#    4   6\n#       / \\\n#      3   7     ← 3 < 5，卻在 5 的右子樹裡！`),
        tip('遞迴時往下傳遞「允許的範圍」(low, high)。'),
      ],
    },

    /* ------------------------------ Chapter 5 ------------------------------ */
    {
      id: '5-1', ch: 5, problem: 'number-of-islands', concept: '網格搜尋', chest: 'bronze',
      story: '王座之間外是一片被岩漿包圍的群島。龍族斥候問：「這裡有幾座島？」',
      lesson: [
        p('很多題目的「圖」藏在二維網格裡：每個格子和上下左右相鄰的格子相連。'),
        code(`const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\nfor (const [dr, dc] of dirs) {\n  const r2 = r + dr, c2 = c + dc;\n  if (r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols) {\n    // (r2, c2) 是合法的鄰居\n  }\n}`, `for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n    r2, c2 = r + dr, c + dc\n    if 0 <= r2 < rows and 0 <= c2 < cols:\n        pass  # (r2, c2) 是合法的鄰居`),
        p('找到一塊陸地後，用 DFS 或 BFS 把整座島標記為「已拜訪」，就不會重複計算。'),
        tip('遞迴版 DFS 在超大網格上可能堆疊溢位，這時可以改用自己維護的 stack。'),
      ],
    },
    {
      id: '5-2', ch: 5, problem: 'subsets', concept: '回溯法', chest: 'bronze',
      story: '龍的寶庫裡堆滿寶物。牠問：「這些寶物總共有幾種挑法？全部列出來！」',
      lesson: [
        p('<b>回溯</b> = 系統化地嘗試所有可能：做出選擇 → 遞迴 → <b>撤銷選擇</b>。'),
        code(`function backtrack(i) {\n  if (i === nums.length) {\n    result.push([...path]);   // 記得複製！\n    return;\n  }\n  path.push(nums[i]);   // 選\n  backtrack(i + 1);\n  path.pop();           // 撤銷\n  backtrack(i + 1);     // 不選\n}`, `def backtrack(i):\n    if i == len(nums):\n        result.append(path[:])   # 記得複製！\n        return\n    path.append(nums[i])   # 選\n    backtrack(i + 1)\n    path.pop()             # 撤銷\n    backtrack(i + 1)       # 不選`),
        cx('n 個元素有 2ⁿ 個子集，這是<b>指數時間</b>——但輸出本身就這麼大，無法更快。'),
      ],
    },
    {
      id: '5-3', ch: 5, problem: 'permutations', concept: '回溯：排列', chest: 'wood',
      story: '龍騎士們要決定出陣順序，每一種順序都要演練一次。',
      lesson: [
        p('排列和子集不同：每一步要從「還沒用過」的元素中挑一個。用一個 <code>used</code> 陣列記錄。'),
        code(`for (let i = 0; i < nums.length; i++) {\n  if (used[i]) continue;\n  used[i] = true; path.push(nums[i]);\n  backtrack();\n  path.pop(); used[i] = false;   // 撤銷\n}`, `for i in range(len(nums)):\n    if used[i]:\n        continue\n    used[i] = True; path.append(nums[i])\n    backtrack()\n    path.pop(); used[i] = False    # 撤銷`),
        cx('n! 個排列，每個長度 n：O(n·n!)。'),
      ],
    },
    {
      id: '5-4', ch: 5, problem: 'house-robber', concept: '動態規劃：狀態轉移', chest: 'bronze',
      story: '義賊潛入了龍族的宿舍，但相鄰的房間之間裝了警報器……',
      lesson: [
        p('動態規劃的三步驟：'),
        p('1️⃣ <b>定義狀態</b>：dp[i] 代表什麼？（前 i 間房子能拿到的最多金幣）<br>2️⃣ <b>狀態轉移</b>：dp[i] 怎麼由更小的狀態算出來？<br>3️⃣ <b>初始條件</b>：最小的情況是什麼？'),
        p('對第 i 間房：拿它（就不能拿 i−1）→ <code>dp[i-2] + nums[i]</code>；不拿 → <code>dp[i-1]</code>。取最大值！'),
        cx('如果 dp[i] 只依賴前幾項，就不需要整個陣列，用幾個變數就能做到 <b>O(1) 空間</b>。'),
      ],
    },
    {
      id: '5-5', ch: 5, problem: 'unique-paths', concept: '二維動態規劃', chest: 'wood',
      story: '通往王座的迷宮只能往右或往下走。到底有幾條路呢？',
      lesson: [
        p('二維 DP：dp[i][j] = 走到 (i, j) 的方法數 = 從上面來的 + 從左邊來的。'),
        code(`const dp = Array.from({ length: m }, () => new Array(n).fill(1));\nfor (let i = 1; i < m; i++)\n  for (let j = 1; j < n; j++)\n    dp[i][j] = dp[i - 1][j] + dp[i][j - 1];`, `dp = [[1] * n for _ in range(m)]\nfor i in range(1, m):\n    for j in range(1, n):\n        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]`),
        cx('O(m·n) 時間。觀察：每一列只用到上一列 → 可以壓縮成一維，空間 <b>O(n)</b>。'),
      ],
    },
    {
      id: '5-6', ch: 5, problem: 'coin-change', concept: 'DP：最佳化問題', chest: 'bronze',
      story: '龍族的商店只收特定面額的硬幣，而且討厭被找零。',
      lesson: [
        p('貪婪法（每次拿最大面額）不一定是最佳解！例如 coins = [1, 3, 4]、amount = 6：貪婪得到 4+1+1（3 枚），但最佳是 3+3（2 枚）。'),
        p('DP：dp[x] = 湊出 x 元的最少硬幣數。'),
        code(`dp[x] = min over c in coins of (dp[x - c] + 1)`, `dp[x] = min(dp[x - c] + 1 for c in coins if c <= x)`),
        tip('湊不出來的金額用「無限大」表示：JS 的 <code>Infinity</code>、Python 的 <code>float("inf")</code>。'),
      ],
    },
    {
      id: '5-7', ch: 5, problem: 'kth-largest', concept: '堆積 Heap', chest: 'bronze', cxTime: 'nlogn',
      story: '龍族競技場要選出第 K 強的勇者作為挑戰者。',
      lesson: [
        p('<b>堆積（優先佇列）</b>可以在 O(log n) 時間放入元素，並隨時 O(1) 取得最小值（最小堆積）。'),
        code(`// 本遊戲提供 PriorityQueue（LeetCode 也有類似的工具）\nconst heap = new PriorityQueue((a, b) => a - b); // 最小堆積\nheap.push(5); heap.push(1); heap.push(3);\nheap.peek();   // 1\nheap.pop();    // 1\nheap.size();   // 2`, `import heapq   # 遊戲中已經預先匯入\nheap = []\nheapq.heappush(heap, 5)\nheapq.heappush(heap, 1)\nheap[0]               # 1（最小值）\nheapq.heappop(heap)   # 1\n# 想要最大堆積？放入 -x 就好！`),
        p('找第 k 大：維持一個大小為 k 的最小堆積。超過 k 個就把最小的丟掉，最後堆頂就是第 k 大！'),
        cx('O(n log k)。這一關用排序（O(n log n)）也能拿到第二顆星；挑戰模式中的最佳解則是平均 O(n) 的 Quickselect。'),
      ],
    },
    {
      id: '5-8', ch: 5, problem: 'daily-temperatures', concept: '單調堆疊', chest: 'wood',
      story: '王座之間寒冷刺骨，每個人都在等待溫暖的日子。',
      lesson: [
        p('<b>單調堆疊</b>：堆疊中的元素保持遞增或遞減。新元素進來時，把破壞單調性的元素彈出——彈出的那一刻，往往就是它「找到答案」的時候。'),
        code(`for (let i = 0; i < n; i++) {\n  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {\n    const j = stack.pop();\n    // i 是 j 右邊第一個比它大的元素！\n  }\n  stack.push(i);\n}`, `for i in range(n):\n    while stack and nums[stack[-1]] < nums[i]:\n        j = stack.pop()\n        # i 是 j 右邊第一個比它大的元素！\n    stack.append(i)`),
        cx('每個索引最多進出堆疊一次：<b>O(n)</b>，雖然有兩層迴圈！'),
      ],
    },
    {
      id: '5-9', ch: 5, problem: 'merge-intervals', concept: '排序 + 掃描', chest: 'bronze',
      story: '魔王的結界由許多重疊的區間組成。合併它們，就能找到破綻！',
      lesson: [
        p('區間題的萬用起手式：<b>先排序</b>。排序後，重疊的區間一定會相鄰。'),
        code(`intervals.sort((a, b) => a[0] - b[0]);  // 依起點排序`, `intervals.sort(key=lambda x: x[0])  # 依起點排序`),
        p('然後只需要和「結果中的最後一個區間」比較就好。'),
        cx('排序 O(n log n) + 掃描 O(n) = <b>O(n log n)</b>。'),
      ],
    },
    {
      id: '5-10', ch: 5, problem: 'trapping-rain-water', concept: '最終 BOSS：接雨水', chest: 'diamond', boss: true,
      story: '蟲蟲魔王召喚了暴雨！「你能算出我的王座之間能積多少水嗎？哈哈哈！」',
      lesson: [
        p('最終 BOSS 是一道經典的 <b>Hard</b> 題（LeetCode 42）。你已經學會了所有需要的武器：'),
        p('🗡️ 對每個位置：水位 = min(左邊最高, 右邊最高) − 自己的高度<br>🛡️ 前綴最大值：先算出每個位置的 leftMax、rightMax（O(n) 空間）<br>✨ 雙指標：哪邊比較矮，那邊的水位就已經確定（O(1) 空間）'),
        cx('目標：<b>O(n) 時間、O(1) 空間</b>。擊敗魔王，淨化整座城堡吧！'),
      ],
    },
  ];

  LC.Story = { chapters, levels, byId: Object.fromEntries(levels.map((l) => [l.id, l])) };
})(typeof window !== 'undefined' ? window : globalThis);
