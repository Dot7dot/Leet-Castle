/*
 * Problem bank, part 1: the problems used by Story Mode (they are also in the challenge pool
 * unless diff === 'intro').
 *
 * Fields:
 *   id, title, diff ('intro'|'easy'|'medium'|'hard'), tags, fn, params [[name,type]], ret (type)
 *   desc (HTML), examples [{args, note}], tests [[args]], gen(R, n, worst) -> args, rand [lo,hi], big [n]
 *   cmp ('unordered'|'unorderedDeep'|'float') or check(out, args, expected)
 *   inplace (index of the argument that is the answer after the call)
 *   cx: { time, space, sizes, labels, note, exponential }
 *   hints [], explain (HTML), ref (JS reference solution), py (Python reference solution)
 */
(function (root) {
  const LC = (root.LC = root.LC || {});
  LC.Problems = LC.Problems || {};
  const add = (p) => { LC.Problems[p.id] = p; };
  const sorted = (a) => a.slice().sort((x, y) => x - y);

  /* ======================= Chapter 1 : basics ======================= */
  add({
    id: 'hello', title: '城門的口令', diff: 'intro', tags: ['函式', '回傳值'],
    fn: 'hello', params: [], ret: 'string',
    desc: '城門守衛要你說出口令才肯放行。請讓函式 <code>hello()</code> <b>回傳</b>字串 <code>"Hello, Castle!"</code>（注意大小寫與標點符號）。',
    examples: [{ args: [] }],
    hints: ['用 <code>return</code> 把值交回去。', '字串要用引號包起來：<code>"Hello, Castle!"</code>'],
    explain: '函式就像一台機器：呼叫它，它會用 <code>return</code> 交出結果。這題只要回傳固定的字串即可。',
    ref: function hello() {
      return 'Hello, Castle!';
    },
    py: `
      def hello():
          return "Hello, Castle!"
    `,
  });

  add({
    id: 'rect-area', title: '計算城牆面積', diff: 'intro', tags: ['變數', '運算'],
    fn: 'rectangleArea', params: [['width', 'int'], ['height', 'int']], ret: 'int',
    desc: '工匠要粉刷一面長方形城牆。給定寬 <code>width</code> 與高 <code>height</code>，回傳城牆的面積（寬 × 高）。',
    examples: [{ args: [3, 4], note: '3 × 4 = 12' }, { args: [10, 1] }],
    tests: [[0, 5], [1, 1], [100, 250]],
    gen: (R) => [R.int(0, 1000), R.int(0, 1000)], randCount: 5,
    hints: ['先把結果存進一個變數，例如 <code>area</code>。', '乘法運算子是 <code>*</code>。'],
    explain: '把 <code>width * height</code> 的結果存進變數再回傳即可。',
    ref: function rectangleArea(width, height) {
      const area = width * height;
      return area;
    },
    py: `
      def rectangleArea(width, height):
          area = width * height
          return area
    `,
  });

  add({
    id: 'split-coins', title: '平分金幣', diff: 'intro', tags: ['整數除法', '餘數'],
    fn: 'splitCoins', params: [['coins', 'int'], ['people', 'int']], ret: 'int[]',
    desc: '冒險隊伍打倒了史萊姆，獲得 <code>coins</code> 枚金幣，要平分給 <code>people</code> 位隊員。每人只能拿整數枚，剩下的放進公基金。<br>請回傳陣列 <code>[每人拿到的金幣, 剩下的金幣]</code>。',
    examples: [{ args: [17, 5], note: '每人 3 枚，剩 2 枚' }, { args: [20, 4] }],
    tests: [[0, 3], [5, 7], [1000000, 3]],
    gen: (R) => [R.int(0, 10000), R.int(1, 50)], randCount: 6,
    hints: ['JavaScript：<code>Math.floor(a / b)</code> 取整數商；Python：<code>a // b</code>。', '餘數運算子是 <code>%</code>。'],
    explain: '整數除法取得「每人幾枚」，餘數運算取得「剩幾枚」。',
    ref: function splitCoins(coins, people) {
      const each = Math.floor(coins / people);
      const left = coins % people;
      return [each, left];
    },
    py: `
      def splitCoins(coins, people):
          each = coins // people
          left = coins % people
          return [each, left]
    `,
  });

  add({
    id: 'grade', title: '騎士考核', diff: 'intro', tags: ['條件判斷'],
    fn: 'grade', params: [['score', 'int']], ret: 'string',
    desc: '騎士學院依照分數 <code>score</code>（0～100）給予等第：<ul><li>90 分以上：<code>"A"</code></li><li>80～89：<code>"B"</code></li><li>70～79：<code>"C"</code></li><li>60～69：<code>"D"</code></li><li>低於 60：<code>"F"</code></li></ul>',
    examples: [{ args: [95] }, { args: [80] }, { args: [42] }],
    tests: [[90], [89], [70], [69], [60], [59], [0], [100]],
    gen: (R) => [R.int(0, 100)], randCount: 8,
    hints: ['使用 if / else if（Python 是 elif）一層一層判斷。', '從最高分開始判斷，就不用寫上下界。'],
    explain: '從高分往低分依序判斷，第一個成立的條件就回傳。',
    ref: function grade(score) {
      if (score >= 90) return 'A';
      else if (score >= 80) return 'B';
      else if (score >= 70) return 'C';
      else if (score >= 60) return 'D';
      return 'F';
    },
    py: `
      def grade(score):
          if score >= 90:
              return "A"
          elif score >= 80:
              return "B"
          elif score >= 70:
              return "C"
          elif score >= 60:
              return "D"
          return "F"
    `,
  });

  add({
    id: 'leap-year', title: '閏年的祭典', diff: 'intro', tags: ['邏輯運算'],
    fn: 'isLeapYear', params: [['year', 'int']], ret: 'bool',
    desc: '城堡每逢閏年舉辦祭典。判斷 <code>year</code> 是否為閏年：<ul><li>能被 4 整除 <b>且</b> 不能被 100 整除，或</li><li>能被 400 整除</li></ul>',
    examples: [{ args: [2024] }, { args: [1900], note: '能被 100 整除但不能被 400 整除' }, { args: [2000] }],
    tests: [[2023], [2100], [2400], [4], [1]],
    gen: (R) => [R.int(1, 3000)], randCount: 10,
    hints: ['「能被 4 整除」就是 <code>year % 4 == 0</code>。', 'JS 用 <code>&&</code>、<code>||</code>；Python 用 <code>and</code>、<code>or</code>。'],
    explain: '把規則直接翻譯成布林運算式：<code>(y%4==0 and y%100!=0) or y%400==0</code>。',
    ref: function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },
    py: `
      def isLeapYear(year):
          return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
    `,
  });

  add({
    id: 'sum-to', title: '階梯上的寶石', diff: 'intro', tags: ['迴圈', '數學'],
    fn: 'sumTo', params: [['n', 'int']], ret: 'int',
    desc: '城堡的階梯第 1 階有 1 顆寶石、第 2 階有 2 顆……第 <code>n</code> 階有 <code>n</code> 顆。回傳 1～n 階的寶石總數。',
    examples: [{ args: [5], note: '1+2+3+4+5 = 15' }, { args: [1] }],
    tests: [[0], [100], [99999]],
    gen: (R, n) => [n], rand: [1, 10000],
    cx: { time: '1', space: '1', sizes: [1000, 2000, 4000, 8000, 16000, 32000, 64000] },
    hints: ['用 for 迴圈從 1 跑到 n，逐一累加。', '進階：高斯的公式 <code>n × (n + 1) / 2</code> 可以不用迴圈！（第二顆星需要 O(1)）'],
    explain: '迴圈累加是 O(n)；使用梯形公式 <code>n(n+1)/2</code> 只要一次運算，時間複雜度 O(1)。',
    ref: function sumTo(n) {
      return (n * (n + 1)) / 2;
    },
    py: `
      def sumTo(n):
          return n * (n + 1) // 2
    `,
  });

  add({
    id: 'count-digits', title: '數字有幾位', diff: 'intro', tags: ['while 迴圈'],
    fn: 'countDigits', params: [['n', 'int']], ret: 'int',
    desc: '給定非負整數 <code>n</code>，回傳它有幾位數。注意 <code>0</code> 是 1 位數。',
    examples: [{ args: [12345] }, { args: [0] }, { args: [7] }],
    tests: [[10], [99], [100], [1000000000]],
    gen: (R) => [R.int(0, 2000000000)], randCount: 8,
    cx: { time: 'logn', space: '1', sizes: [10, 1000, 100000, 1e7, 1e9, 1e11, 1e13], gen: (R, n) => [n] },
    hints: ['每次把 n 除以 10（取整數），就少一位。', '用 while 迴圈：當 n > 0 時一直除。別忘了 n = 0 的特殊情況。'],
    explain: '每次除以 10 會去掉一位數，迴圈次數 = 位數 = log₁₀(n)，所以時間複雜度是 O(log n)。',
    ref: function countDigits(n) {
      if (n === 0) return 1;
      let count = 0;
      while (n > 0) {
        n = Math.floor(n / 10);
        count++;
      }
      return count;
    },
    py: `
      def countDigits(n):
          if n == 0:
              return 1
          count = 0
          while n > 0:
              n //= 10
              count += 1
          return count
    `,
  });

  add({
    id: 'array-sum', title: '寶箱裡的金幣', diff: 'intro', tags: ['陣列', '迴圈'],
    fn: 'arraySum', params: [['nums', 'int[]']], ret: 'int',
    desc: '陣列 <code>nums</code> 記錄了每個寶箱裡的金幣數，回傳金幣總和。空陣列的總和是 0。',
    examples: [{ args: [[3, 1, 4, 1, 5]] }, { args: [[]] }],
    tests: [[[-5, 5]], [[1000000]]],
    gen: (R, n) => [R.arr(n, -1000, 1000)], rand: [1, 200],
    cx: { time: 'n', space: '1' },
    hints: ['準備一個變數 <code>total = 0</code>。', '用 for 迴圈走過每個元素並加到 total。'],
    explain: '走訪每個元素一次並累加：時間 O(n)，只用一個變數：空間 O(1)。',
    ref: function arraySum(nums) {
      let total = 0;
      for (const x of nums) total += x;
      return total;
    },
    py: `
      def arraySum(nums):
          total = 0
          for x in nums:
              total += x
          return total
    `,
  });

  add({
    id: 'find-max', title: '最強的怪物', diff: 'intro', tags: ['陣列', '迴圈'],
    fn: 'findMax', params: [['nums', 'int[]']], ret: 'int',
    desc: '陣列 <code>nums</code>（至少一個元素）記錄了怪物的戰鬥力，回傳最大的戰鬥力。請試著<b>不要</b>使用內建的 max 函式。',
    examples: [{ args: [[3, 9, 2, 7]] }, { args: [[-4, -2, -9]] }],
    tests: [[[5]], [[1, 1, 1]]],
    gen: (R, n) => [R.arr(n, -100000, 100000)], rand: [1, 200],
    cx: { time: 'n', space: '1' },
    hints: ['先假設第一個元素最大：<code>best = nums[0]</code>。', '走過其餘元素，遇到更大的就更新 best。'],
    explain: '維護「目前看過的最大值」，一次走訪即可：O(n) 時間、O(1) 空間。',
    ref: function findMax(nums) {
      let best = nums[0];
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] > best) best = nums[i];
      }
      return best;
    },
    py: `
      def findMax(nums):
          best = nums[0]
          for x in nums:
              if x > best:
                  best = x
          return best
    `,
  });

  add({
    id: 'fizz-buzz', title: 'FizzBuzz 守門人', diff: 'easy', tags: ['迴圈', '條件判斷', '字串'], lc: 412,
    fn: 'fizzBuzz', params: [['n', 'int']], ret: 'string[]',
    desc: '回傳一個長度為 <code>n</code> 的字串陣列 <code>answer</code>（從 1 開始數）：<ul><li>i 同時是 3 和 5 的倍數：<code>"FizzBuzz"</code></li><li>i 是 3 的倍數：<code>"Fizz"</code></li><li>i 是 5 的倍數：<code>"Buzz"</code></li><li>其他：數字 i 本身轉成字串</li></ul>',
    examples: [{ args: [5] }, { args: [15] }],
    tests: [[1], [3]],
    gen: (R, n) => [n], rand: [1, 300],
    cx: { time: 'n', space: 'n', note: '回傳的陣列本身佔 O(n)' },
    hints: ['先檢查「同時是 3 和 5 的倍數」（也就是 15 的倍數），順序很重要！', '數字轉字串：JS 用 <code>String(i)</code>，Python 用 <code>str(i)</code>。'],
    explain: '依序判斷 15、3、5 的倍數。把最嚴格的條件放在最前面，避免被較寬鬆的條件搶先。',
    ref: function fizzBuzz(n) {
      const answer = [];
      for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) answer.push('FizzBuzz');
        else if (i % 3 === 0) answer.push('Fizz');
        else if (i % 5 === 0) answer.push('Buzz');
        else answer.push(String(i));
      }
      return answer;
    },
    py: `
      def fizzBuzz(n):
          answer = []
          for i in range(1, n + 1):
              if i % 15 == 0:
                  answer.append("FizzBuzz")
              elif i % 3 == 0:
                  answer.append("Fizz")
              elif i % 5 == 0:
                  answer.append("Buzz")
              else:
                  answer.append(str(i))
          return answer
    `,
  });

  /* ======================= Chapter 2 : strings & hashing ======================= */
  add({
    id: 'count-vowels', title: '母音精靈', diff: 'intro', tags: ['字串'],
    fn: 'countVowels', params: [['s', 'string']], ret: 'int',
    desc: '森林裡的母音精靈喜歡 <code>a e i o u</code>（大小寫都算）。回傳字串 <code>s</code> 中母音的數量。',
    examples: [{ args: ['Hello World'] }, { args: ['AEIOU xyz'] }],
    tests: [[''], ['bcd'], ['aaaa']],
    gen: (R, n) => [R.str(n, 'abcdeiouxyzAEIOU ')], rand: [1, 200],
    cx: { time: 'n', space: '1' },
    hints: ['字串也可以用 for 迴圈一個字一個字走訪。', '判斷字元是否在 <code>"aeiouAEIOU"</code> 裡面。'],
    explain: '走訪每個字元並檢查是否為母音。檢查一個固定 10 個字元的字串是常數時間，所以總共 O(n)。',
    ref: function countVowels(s) {
      let count = 0;
      for (const ch of s) {
        if ('aeiouAEIOU'.includes(ch)) count++;
      }
      return count;
    },
    py: `
      def countVowels(s):
          count = 0
          for ch in s:
              if ch in "aeiouAEIOU":
                  count += 1
          return count
    `,
  });

  add({
    id: 'reverse-string', title: '鏡之咒語', diff: 'intro', tags: ['字串'],
    fn: 'reverseString', params: [['s', 'string']], ret: 'string',
    desc: '魔鏡裡的咒語是倒過來寫的。回傳把字串 <code>s</code> 反轉後的結果。',
    examples: [{ args: ['castle'] }, { args: ['ab cd'] }],
    tests: [[''], ['a'], ['racecar']],
    gen: (R, n) => [R.str(n)], rand: [1, 200],
    cx: { time: 'n', space: 'n' },
    hints: ['從最後一個字元往前走，把字元接起來。', 'JS：<code>s.split("").reverse().join("")</code>；Python：<code>s[::-1]</code>。'],
    explain: '反轉需要看過每個字元一次，O(n) 時間；新字串需要 O(n) 空間。',
    ref: function reverseString(s) {
      return s.split('').reverse().join('');
    },
    py: `
      def reverseString(s):
          return s[::-1]
    `,
  });

  add({
    id: 'palindrome-basic', title: '迴文之橋', diff: 'intro', tags: ['字串', '雙指標'],
    fn: 'isPalindrome', params: [['s', 'string']], ret: 'bool',
    desc: '只有「迴文」能通過這座橋：正著念和倒著念都一樣。<code>s</code> 只包含小寫英文字母，判斷它是否是迴文。',
    examples: [{ args: ['level'] }, { args: ['castle'] }],
    tests: [['a'], ['ab'], ['aa'], ['abcba'], ['abccba']],
    gen: (R, n, worst) => { const h = R.str(Math.ceil(n / 2), 'ab'); const pal = h + h.split('').reverse().join('').slice(n % 2); return [worst || R.bool() ? pal : R.str(n, 'ab')]; }, rand: [1, 100],
    cx: { time: 'n', space: '1' },
    hints: ['用兩個索引 <code>left = 0</code>、<code>right = 長度-1</code>。', '比較 s[left] 與 s[right]，不同就回傳 false；相同就往中間靠攏。'],
    explain: '雙指標從兩端往中間比較，最多比較 n/2 次：O(n) 時間、O(1) 空間。',
    ref: function isPalindrome(s) {
      let left = 0, right = s.length - 1;
      while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
      }
      return true;
    },
    py: `
      def isPalindrome(s):
          left, right = 0, len(s) - 1
          while left < right:
              if s[left] != s[right]:
                  return False
              left += 1
              right -= 1
          return True
    `,
  });

  const primeBelow = (n) => { const isP = (x) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; }; while (!isP(n)) n--; return n; };
  add({
    id: 'is-prime', title: '質數水晶', diff: 'intro', tags: ['函式', '數學'],
    fn: 'isPrime', params: [['n', 'int']], ret: 'bool',
    desc: '只有質數水晶能啟動魔法陣。判斷 <code>n</code> 是否為質數（大於 1 且只能被 1 和自己整除）。',
    examples: [{ args: [7] }, { args: [12] }, { args: [1] }],
    tests: [[2], [0], [9], [97], [7919], [1000003]],
    gen: (R) => [R.int(0, 100000)], randCount: 10,
    cx: { time: 'sqrtn', space: '1', sizes: [1e4, 1e5, 1e6, 1e7, 1e8, 1e9], gen: (R, n) => [primeBelow(n)] },
    hints: ['小於 2 的數都不是質數。', '只需要檢查到 √n：若 n = a × b，其中一個因數一定 ≤ √n。用 <code>d * d <= n</code> 當迴圈條件。'],
    explain: '若 n 有因數，必定有一個 ≤ √n，所以只要試除到 √n：時間 O(√n)。',
    ref: function isPrime(n) {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) return false;
      }
      return true;
    },
    py: `
      def isPrime(n):
          if n < 2:
              return False
          d = 2
          while d * d <= n:
              if n % d == 0:
                  return False
              d += 1
          return True
    `,
  });

  add({
    id: 'first-uniq-char', title: '孤單的符文', diff: 'easy', tags: ['雜湊表', '字串'], lc: 387,
    fn: 'firstUniqChar', params: [['s', 'string']], ret: 'int',
    desc: '找出字串 <code>s</code> 中<b>第一個只出現一次</b>的字元，回傳它的索引；若不存在則回傳 <code>-1</code>。<code>s</code> 只包含小寫字母。',
    examples: [{ args: ['leetcode'] }, { args: ['loveleetcode'] }, { args: ['aabb'] }],
    tests: [['z'], ['zz'], ['abcabcd']],
    gen: (R, n, worst) => { if (worst) { const s = R.str(n - 1, 'abcdefghijklmnopqrstuvwxy'); return [s + s.slice(0, 0) + 'z']; } return [R.str(n, 'abcdefghij')]; }, rand: [1, 120],
    cx: { time: 'n', space: '1', note: '字母種類固定 26 個，所以計數表是 O(1)' },
    hints: ['先用一個雜湊表（Map / dict）數每個字元出現幾次。', '再走一次字串，第一個次數為 1 的字元就是答案。'],
    explain: '兩趟走訪：第一趟計數，第二趟找第一個計數為 1 的字元。字母只有 26 種，表的大小是常數。',
    ref: function firstUniqChar(s) {
      const count = new Map();
      for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1);
      for (let i = 0; i < s.length; i++) {
        if (count.get(s[i]) === 1) return i;
      }
      return -1;
    },
    py: `
      def firstUniqChar(s):
          count = {}
          for ch in s:
              count[ch] = count.get(ch, 0) + 1
          for i, ch in enumerate(s):
              if count[ch] == 1:
                  return i
          return -1
    `,
  });

  add({
    id: 'contains-duplicate', title: '分身術偵測', diff: 'easy', tags: ['雜湊表', '集合'], lc: 217,
    fn: 'containsDuplicate', params: [['nums', 'int[]']], ret: 'bool',
    desc: '只要有任何數字在陣列 <code>nums</code> 中出現兩次以上，就回傳 <code>true</code>；所有數字都不同則回傳 <code>false</code>。',
    examples: [{ args: [[1, 2, 3, 1]] }, { args: [[1, 2, 3, 4]] }],
    tests: [[[1]], [[5, 5]], [[-1, 0, 1, -1]]],
    gen: (R, n, worst) => [worst ? R.distinct(n, -1e9, 1e9) : (R.bool() ? R.distinct(n, -1e6, 1e6) : R.arr(n, 0, n * 2))], rand: [1, 200], big: [20000],
    cx: { time: 'n', space: 'n' },
    hints: ['暴力法：兩層迴圈比較每一對，O(n²)。', '用集合（Set / set）記錄看過的數字，看過就代表重複。'],
    explain: '集合的查詢與加入都是平均 O(1)，走訪一次即可：時間 O(n)、空間 O(n)。',
    ref: function containsDuplicate(nums) {
      const seen = new Set();
      for (const x of nums) {
        if (seen.has(x)) return true;
        seen.add(x);
      }
      return false;
    },
    py: `
      def containsDuplicate(nums):
          seen = set()
          for x in nums:
              if x in seen:
                  return True
              seen.add(x)
          return False
    `,
  });

  add({
    id: 'two-sum', title: '兩數之和', diff: 'easy', tags: ['陣列', '雜湊表'], lc: 1,
    fn: 'twoSum', params: [['nums', 'int[]'], ['target', 'int']], ret: 'int[]',
    desc: '給定整數陣列 <code>nums</code> 與目標值 <code>target</code>，找出<b>兩個不同位置</b>的數字使其和等於 <code>target</code>，回傳它們的索引（順序不限）。保證恰好有一組解。',
    examples: [{ args: [[2, 7, 11, 15], 9], note: 'nums[0] + nums[1] = 2 + 7 = 9' }, { args: [[3, 2, 4], 6] }, { args: [[3, 3], 6] }],
    tests: [[[-3, 4, 3, 90], 0], [[0, 4, 3, 0], 0]],
    gen: (R, n, worst) => {
      n = Math.max(2, n);
      const nums = R.distinct(n, 0, 1e8).map((x) => x * 2); // all even
      const i = worst ? n - 2 : R.int(0, n - 1);
      let j = worst ? n - 1 : R.int(0, n - 1); if (j === i) j = (i + 1) % n;
      nums[i] += 1; nums[j] += 1000000001; // the only odd numbers -> the answer is unique
      return [nums, nums[i] + nums[j]];
    },
    rand: [2, 100], big: [20000],
    check: (out, args) => { const [nums, t] = args; return Array.isArray(out) && out.length === 2 && out[0] !== out[1] && out[0] >= 0 && out[1] >= 0 && out[0] < nums.length && out[1] < nums.length && nums[out[0]] + nums[out[1]] === t; },
    cx: { time: 'n', space: 'n' },
    hints: ['暴力法：檢查每一對 (i, j)，時間 O(n²)。', '換個問法：對每個 x，想知道「target − x」是否出現過。', '用雜湊表記錄「數值 → 索引」，一邊走一邊查。'],
    explain: '走訪時對每個數字 x 查詢 <code>target - x</code> 是否在雜湊表中，有就找到答案；沒有就把 x 存進去。一次走訪：O(n) 時間、O(n) 空間。',
    ref: function twoSum(nums, target) {
      const seen = new Map();
      for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
      }
      return [];
    },
    py: `
      def twoSum(nums, target):
          seen = {}
          for i, x in enumerate(nums):
              need = target - x
              if need in seen:
                  return [seen[need], i]
              seen[x] = i
          return []
    `,
  });
  add({
    id: 'valid-anagram', title: '字母重組術', diff: 'easy', tags: ['雜湊表', '排序', '字串'], lc: 242,
    fn: 'isAnagram', params: [['s', 'string'], ['t', 'string']], ret: 'bool',
    desc: '判斷 <code>t</code> 是否為 <code>s</code> 的「字母異位詞」：兩者使用完全相同的字母（含次數），只是順序不同。只包含小寫字母。',
    examples: [{ args: ['anagram', 'nagaram'] }, { args: ['rat', 'car'] }],
    tests: [['a', 'a'], ['a', 'ab'], ['ab', 'ba'], ['aacc', 'ccac']],
    gen: (R, n, worst) => { const s = R.str(n, 'abcdef'); const t = R.shuffle(s.split('')); if (!worst && R.bool(0.4)) t[0] = t[0] === 'a' ? 'b' : 'a'; return [s, t.join('')]; }, rand: [1, 120], big: [50000],
    cx: { time: 'n', space: '1', note: '字母種類固定，計數表是 O(1)' },
    hints: ['方法一：把兩個字串排序後比較，O(n log n)。', '方法二：計算每個字母出現的次數，s 加一、t 減一，最後全部是 0 就對了，O(n)。'],
    explain: '用長度 26 的計數表：s 的字母 +1、t 的字母 −1，最後檢查是否全為 0。時間 O(n)，空間 O(1)（26 是常數）。',
    ref: function isAnagram(s, t) {
      if (s.length !== t.length) return false;
      const count = new Array(26).fill(0);
      for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;
        count[t.charCodeAt(i) - 97]--;
      }
      return count.every((c) => c === 0);
    },
    py: `
      def isAnagram(s, t):
          if len(s) != len(t):
              return False
          count = [0] * 26
          for a, b in zip(s, t):
              count[ord(a) - 97] += 1
              count[ord(b) - 97] -= 1
          return all(c == 0 for c in count)
    `,
  });

  add({
    id: 'transpose', title: '翻轉魔法陣', diff: 'easy', tags: ['二維陣列'], lc: 867,
    fn: 'transpose', params: [['matrix', 'int[][]']], ret: 'int[][]',
    desc: '回傳矩陣 <code>matrix</code> 的<b>轉置</b>：原本第 i 列第 j 行的元素，變成第 j 列第 i 行。矩陣不一定是正方形。',
    examples: [{ args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]] }, { args: [[[1, 2, 3], [4, 5, 6]]] }],
    tests: [[[[1]]], [[[1, 2]]], [[[1], [2]]]],
    gen: (R, n) => { const r = Math.max(1, Math.round(Math.sqrt(n) * (0.5 + R.next()))); const c = Math.max(1, Math.round(n / r)); return [Array.from({ length: r }, () => R.arr(c, -100, 100))]; }, rand: [1, 60],
    cx: { time: 'n', space: 'n', labels: { n: 'O(m·n)' }, sizes: [64, 256, 1024, 4096, 16384], gen: (R, n) => { const s = Math.round(Math.sqrt(n)); return [Array.from({ length: s }, () => R.arr(s, 0, 9))]; }, note: 'n = 矩陣元素總數' },
    hints: ['新矩陣的大小是「行數 × 列數」（反過來）。', '兩層迴圈：<code>result[j][i] = matrix[i][j]</code>。'],
    explain: '建立 cols × rows 的新矩陣並逐一填入：時間與空間都是 O(m·n)。',
    ref: function transpose(matrix) {
      const rows = matrix.length, cols = matrix[0].length;
      const result = [];
      for (let j = 0; j < cols; j++) {
        const row = [];
        for (let i = 0; i < rows; i++) row.push(matrix[i][j]);
        result.push(row);
      }
      return result;
    },
    py: `
      def transpose(matrix):
          rows, cols = len(matrix), len(matrix[0])
          result = []
          for j in range(cols):
              row = []
              for i in range(rows):
                  row.append(matrix[i][j])
              result.append(row)
          return result
    `,
  });

  add({
    id: 'group-anagrams', title: '異位詞分組', diff: 'medium', tags: ['雜湊表', '字串', '排序'], lc: 49,
    fn: 'groupAnagrams', params: [['strs', 'string[]']], ret: 'string[][]',
    desc: '把字串陣列 <code>strs</code> 中互為「字母異位詞」的字串分在同一組。組的順序與組內順序都不限。',
    examples: [{ args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']] }, { args: [['']] }, { args: [['a']] }],
    tests: [[['abc', 'bca', 'cab', 'xyz']], [['', '', 'a']]],
    gen: (R, n) => { const base = Array.from({ length: Math.max(1, n >> 2) }, () => R.str(R.int(1, 5), 'abcde')); return [Array.from({ length: n }, () => R.shuffle(R.pick(base).split('')).join(''))]; }, rand: [1, 80], big: [6000],
    cmp: 'unorderedDeep',
    cx: { time: 'n', space: 'n', gen: (R, n) => [Array.from({ length: n }, () => R.str(6, 'abcdef'))], note: 'n = 字串數量（每個字串長度固定）' },
    hints: ['互為異位詞的字串，排序後會變成一模一樣。', '用「排序後的字串」當雜湊表的 key，把原字串放進對應的清單。'],
    explain: '對每個字串計算一個「標準形式」（排序後的字串或字母計數），以它為 key 分組。時間 O(n·k log k)，k 為字串長度。',
    ref: function groupAnagrams(strs) {
      const groups = new Map();
      for (const s of strs) {
        const key = s.split('').sort().join('');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
      }
      return Array.from(groups.values());
    },
    py: `
      def groupAnagrams(strs):
          groups = defaultdict(list)
          for s in strs:
              key = "".join(sorted(s))
              groups[key].append(s)
          return list(groups.values())
    `,
  });

  /* ======================= Chapter 3 : classic techniques ======================= */
  const parenGen = (R, n, worst) => {
    const pairs = { '(': ')', '[': ']', '{': '}' };
    const opens = Object.keys(pairs);
    if (worst || R.bool(0.6)) { // valid
      let s = ''; const st = [];
      for (let i = 0; i < n; i++) {
        if (st.length && (R.bool() || st.length >= n - i)) s += pairs[st.pop()];
        else { const o = R.pick(opens); st.push(o); s += o; }
      }
      while (st.length) s += pairs[st.pop()];
      return [s];
    }
    return [R.str(n, '()[]{}')];
  };
  add({
    id: 'valid-parentheses', title: '括號封印', diff: 'easy', tags: ['堆疊', '字串'], lc: 20,
    fn: 'isValid', params: [['s', 'string']], ret: 'bool',
    desc: '封印由括號 <code>()[]{}</code> 組成。當每個左括號都被<b>同類型</b>的右括號以<b>正確順序</b>關閉時，封印才有效。判斷 <code>s</code> 是否有效。',
    examples: [{ args: ['()[]{}'] }, { args: ['(]'] }, { args: ['([{}])'] }, { args: ['([)]'] }],
    tests: [['('], [')'], ['(('], ['{[]}'], ['']],
    gen: parenGen, rand: [1, 60], big: [30000],
    cx: { time: 'n', space: 'n', gen: (R, n) => ['('.repeat(n >> 1) + ')'.repeat(n >> 1)], note: '最壞情況：全部巢狀的括號' },
    hints: ['最後打開的括號要最先被關閉——這正是「堆疊」（後進先出）。', '遇到左括號就推入堆疊；遇到右括號就檢查堆疊頂端是否為對應的左括號。', '最後堆疊必須是空的。'],
    explain: '用堆疊存放尚未關閉的左括號。每個字元處理一次：時間 O(n)；最壞情況全是左括號：空間 O(n)。',
    ref: function isValid(s) {
      const pair = { ')': '(', ']': '[', '}': '{' };
      const stack = [];
      for (const ch of s) {
        if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
        else if (stack.length === 0 || stack.pop() !== pair[ch]) return false;
      }
      return stack.length === 0;
    },
    py: `
      def isValid(s):
          pair = {")": "(", "]": "[", "}": "{"}
          stack = []
          for ch in s:
              if ch in "([{":
                  stack.append(ch)
              elif not stack or stack.pop() != pair[ch]:
                  return False
          return not stack
    `,
  });

  add({
    id: 'time-to-buy', title: '排隊買藥水', diff: 'easy', tags: ['佇列', '模擬'], lc: 2073,
    fn: 'timeRequiredToBuy', params: [['tickets', 'int[]'], ['k', 'int']], ret: 'int',
    desc: '<code>n</code> 位冒險者排隊買藥水，第 i 位想買 <code>tickets[i]</code> 瓶。每人每次只能買 1 瓶（花 1 秒），買完若還想買就要<b>重新排到隊尾</b>；買夠了就離開。回傳排在位置 <code>k</code> 的人買完所需的秒數。',
    examples: [{ args: [[2, 3, 2], 2], note: '6 秒' }, { args: [[5, 1, 1, 1], 0], note: '8 秒' }],
    tests: [[[1], 0], [[3, 3, 3], 1], [[1, 5, 1], 1]],
    gen: (R, n) => { const t = R.arr(Math.max(1, n), 1, 20); return [t, R.int(0, t.length - 1)]; }, rand: [1, 60],
    cx: { time: 'n', space: '1', gen: (R, n) => [R.arr(n, 1, 20), n - 1], note: '每人購買數上限為常數' },
    hints: ['可以真的用佇列模擬：取出隊頭、買一瓶、若還要買就放回隊尾。', '進階：排在 k 前面（含 k）的人最多買 tickets[k] 瓶；排在 k 後面的人最多買 tickets[k]−1 瓶。'],
    explain: '不用真的模擬：第 i 人對答案的貢獻是 <code>min(tickets[i], tickets[k])</code>（i ≤ k）或 <code>min(tickets[i], tickets[k]-1)</code>（i > k）。一次走訪 O(n)。',
    ref: function timeRequiredToBuy(tickets, k) {
      let time = 0;
      for (let i = 0; i < tickets.length; i++) {
        time += Math.min(tickets[i], i <= k ? tickets[k] : tickets[k] - 1);
      }
      return time;
    },
    py: `
      def timeRequiredToBuy(tickets, k):
          time = 0
          for i, t in enumerate(tickets):
              time += min(t, tickets[k] if i <= k else tickets[k] - 1)
          return time
    `,
  });

  add({
    id: 'move-zeroes', title: '清除空白符文', diff: 'easy', tags: ['陣列', '雙指標'], lc: 283,
    fn: 'moveZeroes', params: [['nums', 'int[]']], ret: 'void', inplace: 0,
    desc: '把陣列 <code>nums</code> 中所有的 <code>0</code> 移到最後面，同時保持非零元素的相對順序。<b>必須原地修改</b>，不需要回傳任何東西。',
    examples: [{ args: [[0, 1, 0, 3, 12]] }, { args: [[0]] }],
    tests: [[[1, 2, 3]], [[0, 0, 1]], [[4, 0, 0, 0, 5, 0, 6]]],
    gen: (R, n) => [Array.from({ length: n }, () => (R.bool(0.4) ? 0 : R.int(-50, 50)))], rand: [1, 100], big: [30000],
    cx: { time: 'n', space: '1' },
    hints: ['用一個指標 <code>write</code> 記錄「下一個非零元素該放的位置」。', '把非零元素依序寫到 write 的位置，最後把剩下的位置補 0。'],
    explain: '慢指標記錄寫入位置、快指標走訪陣列。每個元素只處理一次：時間 O(n)、空間 O(1)。',
    ref: function moveZeroes(nums) {
      let write = 0;
      for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) nums[write++] = nums[i];
      }
      while (write < nums.length) nums[write++] = 0;
    },
    py: `
      def moveZeroes(nums):
          write = 0
          for x in nums:
              if x != 0:
                  nums[write] = x
                  write += 1
          for i in range(write, len(nums)):
              nums[i] = 0
    `,
  });

  add({
    id: 'two-sum-sorted', title: '排序後的兩數之和', diff: 'medium', tags: ['陣列', '雙指標'], lc: 167,
    fn: 'twoSumSorted', params: [['numbers', 'int[]'], ['target', 'int']], ret: 'int[]',
    desc: '<code>numbers</code> 已經由小到大<b>排序</b>。找出兩個數使其和為 <code>target</code>，回傳它們的位置 <code>[index1, index2]</code>（<b>從 1 開始</b>，且 index1 &lt; index2）。保證恰有一組解，請只用常數額外空間。',
    examples: [{ args: [[2, 7, 11, 15], 9] }, { args: [[2, 3, 4], 6] }, { args: [[-1, 0], -1] }],
    tests: [[[1, 2], 3], [[0, 0, 3, 4], 0]],
    gen: (R, n, worst) => { n = Math.max(2, n); const a = R.distinct(n, 0, 1e7).map((x) => x * 2).sort((x, y) => x - y); let i = worst ? 0 : R.int(0, n - 2); let j = worst ? 1 : R.int(i + 1, n - 1); a[i] += 1; a[j] += 1; return [a, a[i] + a[j]]; },
    rand: [2, 100], big: [30000],
    check: (out, args) => { const [a, t] = args; return Array.isArray(out) && out.length === 2 && out[0] >= 1 && out[0] < out[1] && out[1] <= a.length && a[out[0] - 1] + a[out[1] - 1] === t; },
    cx: { time: 'n', space: '1' },
    hints: ['陣列已排序！左右各放一個指標。', '如果兩數和太大，右指標左移；太小，左指標右移。'],
    explain: '對撞雙指標：和太大就讓大的變小（右指標左移），和太小就讓小的變大（左指標右移）。O(n) 時間、O(1) 空間。',
    ref: function twoSumSorted(numbers, target) {
      let l = 0, r = numbers.length - 1;
      while (l < r) {
        const sum = numbers[l] + numbers[r];
        if (sum === target) return [l + 1, r + 1];
        if (sum < target) l++;
        else r--;
      }
      return [];
    },
    py: `
      def twoSumSorted(numbers, target):
          l, r = 0, len(numbers) - 1
          while l < r:
              s = numbers[l] + numbers[r]
              if s == target:
                  return [l + 1, r + 1]
              if s < target:
                  l += 1
              else:
                  r -= 1
          return []
    `,
  });

  add({
    id: 'max-sum-k', title: '連續 k 天的最大收穫', diff: 'easy', tags: ['滑動視窗'],
    fn: 'maxSumK', params: [['nums', 'int[]'], ['k', 'int']], ret: 'int',
    desc: '<code>nums[i]</code> 是第 i 天採集到的魔法草數量。找出<b>連續 <code>k</code> 天</b>能採集到的最大總量。（1 ≤ k ≤ nums.length）',
    examples: [{ args: [[1, 12, -5, -6, 50, 3], 4], note: '12 − 5 − 6 + 50 = 51' }, { args: [[5], 1] }],
    tests: [[[1, 2, 3], 3], [[-1, -2, -3], 1], [[4, 4, 4, 4], 2]],
    gen: (R, n) => { n = Math.max(1, n); return [R.arr(n, -100, 100), R.int(1, n)]; }, rand: [1, 120], big: [40000],
    cx: { time: 'n', space: '1', gen: (R, n) => [R.arr(n, -100, 100), Math.max(1, n >> 1)] },
    hints: ['暴力法：每個起點都加總 k 個數，O(n·k)。', '視窗往右滑一格時：加上新進來的數、減掉離開的數。'],
    explain: '先算出第一個視窗的總和，之後每次滑動只做「加一個、減一個」。O(n) 時間、O(1) 空間。',
    ref: function maxSumK(nums, k) {
      let sum = 0;
      for (let i = 0; i < k; i++) sum += nums[i];
      let best = sum;
      for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        best = Math.max(best, sum);
      }
      return best;
    },
    py: `
      def maxSumK(nums, k):
          s = 0
          for i in range(k):
              s += nums[i]
          best = s
          for i in range(k, len(nums)):
              s += nums[i] - nums[i - k]
              best = max(best, s)
          return best
    `,
  });

  add({
    id: 'pivot-index', title: '天秤的支點', diff: 'easy', tags: ['前綴和', '陣列'], lc: 724,
    fn: 'pivotIndex', params: [['nums', 'int[]']], ret: 'int',
    desc: '找出天秤的「支點」索引：該位置<b>左邊所有數的和</b>等於<b>右邊所有數的和</b>（不含自己；邊界外視為 0）。有多個則回傳最左邊的，沒有則回傳 <code>-1</code>。',
    examples: [{ args: [[1, 7, 3, 6, 5, 6]], note: '左邊 1+7+3 = 11，右邊 5+6 = 11' }, { args: [[1, 2, 3]] }, { args: [[2, 1, -1]] }],
    tests: [[[0]], [[1, -1, 0]], [[-1, -1, -1, -1, -1, 0]]],
    gen: (R, n) => { const a = R.arr(Math.max(1, n), -5, 5); if (R.bool(0.5) && a.length > 2) { const p = R.int(0, a.length - 1); let l = 0, r = 0; for (let i = 0; i < p; i++) l += a[i]; for (let i = p + 1; i < a.length; i++) r += a[i]; if (p + 1 < a.length) a[a.length - 1] += l - r; else if (p > 0) a[0] += r - l; } return [a]; }, rand: [1, 100], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['先算出整個陣列的總和 total。', '走訪時維護「左邊的和」left；右邊的和就是 total − left − nums[i]。'],
    explain: '總和減去左邊和與自己，就是右邊和。一次走訪：O(n) 時間、O(1) 空間。這是「前綴和」思想的應用。',
    ref: function pivotIndex(nums) {
      let total = 0;
      for (const x of nums) total += x;
      let left = 0;
      for (let i = 0; i < nums.length; i++) {
        if (left === total - left - nums[i]) return i;
        left += nums[i];
      }
      return -1;
    },
    py: `
      def pivotIndex(nums):
          total = sum(nums)
          left = 0
          for i, x in enumerate(nums):
              if left == total - left - x:
                  return i
              left += x
          return -1
    `,
  });

  add({
    id: 'binary-search', title: '二分搜尋之眼', diff: 'easy', tags: ['二分搜尋'], lc: 704,
    fn: 'search', params: [['nums', 'int[]'], ['target', 'int']], ret: 'int',
    desc: '給定<b>由小到大排序且不重複</b>的陣列 <code>nums</code>，搜尋 <code>target</code>，存在就回傳索引，否則回傳 <code>-1</code>。必須使用 O(log n) 的演算法。',
    examples: [{ args: [[-1, 0, 3, 5, 9, 12], 9] }, { args: [[-1, 0, 3, 5, 9, 12], 2] }],
    tests: [[[5], 5], [[5], -5], [[1, 3], 3], [[1, 3], 0]],
    gen: (R, n) => { const a = R.distinct(Math.max(1, n), -10000, 10000).sort((x, y) => x - y); return [a, R.bool() ? R.pick(a) : R.int(-10001, 10001)]; }, rand: [1, 200],
    cx: { time: 'logn', space: '1', sizes: [1000, 4000, 16000, 64000, 256000], gen: (R, n) => { const a = Array.from({ length: n }, (_, i) => i * 2); return [a, 1]; } },
    hints: ['看中間的元素：比 target 大，答案只可能在左半邊；比較小，就在右半邊。', '用 <code>lo</code>、<code>hi</code> 兩個邊界，每次把範圍砍半。'],
    explain: '每次比較都把搜尋範圍砍半，最多 log₂(n) 次：時間 O(log n)、空間 O(1)。',
    ref: function search(nums, target) {
      let lo = 0, hi = nums.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
      return -1;
    },
    py: `
      def search(nums, target):
          lo, hi = 0, len(nums) - 1
          while lo <= hi:
              mid = (lo + hi) // 2
              if nums[mid] == target:
                  return mid
              if nums[mid] < target:
                  lo = mid + 1
              else:
                  hi = mid - 1
          return -1
    `,
  });

  add({
    id: 'best-time-stock', title: '魔法石的買賣時機', diff: 'easy', tags: ['陣列', '貪婪'], lc: 121,
    fn: 'maxProfit', params: [['prices', 'int[]']], ret: 'int',
    desc: '<code>prices[i]</code> 是魔法石第 i 天的價格。你只能選某一天買入、並在<b>之後</b>的某一天賣出。回傳最大利潤；無法獲利則回傳 <code>0</code>。',
    examples: [{ args: [[7, 1, 5, 3, 6, 4]], note: '第 2 天以 1 買入、第 5 天以 6 賣出' }, { args: [[7, 6, 4, 3, 1]] }],
    tests: [[[1]], [[2, 4, 1]], [[3, 3, 3]]],
    gen: (R, n, worst) => [worst ? Array.from({ length: n }, (_, i) => n - i) : R.arr(Math.max(1, n), 0, 1000)], rand: [1, 200], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['暴力法：每一對 (買, 賣) 都試，O(n²)。', '走訪時記住「到目前為止的最低價」，今天賣出的利潤 = 今天價格 − 最低價。'],
    explain: '一邊走訪一邊維護歷史最低價與最大利潤：O(n) 時間、O(1) 空間。',
    ref: function maxProfit(prices) {
      let minPrice = Infinity, best = 0;
      for (const p of prices) {
        minPrice = Math.min(minPrice, p);
        best = Math.max(best, p - minPrice);
      }
      return best;
    },
    py: `
      def maxProfit(prices):
          min_price = float("inf")
          best = 0
          for p in prices:
              min_price = min(min_price, p)
              best = max(best, p - min_price)
          return best
    `,
  });

  add({
    id: 'longest-substring', title: '不重複的咒文', diff: 'medium', tags: ['滑動視窗', '雜湊表', '字串'], lc: 3,
    fn: 'lengthOfLongestSubstring', params: [['s', 'string']], ret: 'int',
    desc: '找出字串 <code>s</code> 中<b>不含重複字元</b>的最長<b>連續</b>子字串，回傳其長度。',
    examples: [{ args: ['abcabcbb'], note: '"abc"' }, { args: ['bbbbb'] }, { args: ['pwwkew'], note: '"wke"' }],
    tests: [[''], [' '], ['dvdf'], ['abba'], ['tmmzuxt']],
    gen: (R, n) => [R.str(n, R.bool() ? 'abcdefghijklmnopqrstuvwxyz0123456789' : 'abcd')], rand: [1, 150], big: [50000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [Array.from({ length: n }, (_, i) => String.fromCharCode(0x4e00 + i)).join('')], note: '量測時使用「每個字元都不同」的字串（大字元集）；若字元集固定為 k，空間為 O(k)' },
    hints: ['用滑動視窗 [left, right]：右邊不斷擴張。', '如果新字元在視窗內出現過，就把 left 移到「它上次出現的位置 + 1」。', '用雜湊表記錄每個字元最後出現的位置。'],
    explain: '維護一個沒有重複字元的視窗，並記錄每個字元最後出現的位置。right 每前進一步，left 只會往右跳，所以總時間 O(n)。',
    ref: function lengthOfLongestSubstring(s) {
      const last = new Map();
      let left = 0, best = 0;
      for (let right = 0; right < s.length; right++) {
        const ch = s[right];
        if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
        last.set(ch, right);
        best = Math.max(best, right - left + 1);
      }
      return best;
    },
    py: `
      def lengthOfLongestSubstring(s):
          last = {}
          left = best = 0
          for right, ch in enumerate(s):
              if ch in last and last[ch] >= left:
                  left = last[ch] + 1
              last[ch] = right
              best = max(best, right - left + 1)
          return best
    `,
  });

  /* ======================= Chapter 4 : recursion, lists, trees ======================= */
  add({
    id: 'factorial', title: '階乘的回音', diff: 'intro', tags: ['遞迴'],
    fn: 'factorial', params: [['n', 'int']], ret: 'int',
    desc: '回傳 <code>n!</code> = 1 × 2 × … × n（0! = 1）。請試著用<b>遞迴</b>完成：n! = n × (n−1)!。（0 ≤ n ≤ 18）',
    examples: [{ args: [5] }, { args: [0] }],
    tests: [[1], [10], [18]],
    gen: (R) => [R.int(0, 18)], randCount: 6,
    cx: { time: 'n', space: 'n', sizes: [2, 4, 6, 9, 12, 15, 18], gen: (R, n) => [n], note: '遞迴深度 n，所以遞迴寫法的空間是 O(n)' },
    hints: ['基本情況（base case）：n 為 0 時回傳 1。', '遞迴情況：回傳 <code>n * factorial(n - 1)</code>。'],
    explain: '每層遞迴把問題縮小 1，共 n 層：時間 O(n)，呼叫堆疊深度 O(n)。',
    ref: function factorial(n) {
      if (n === 0) return 1;
      return n * factorial(n - 1);
    },
    py: `
      def factorial(n):
          if n == 0:
              return 1
          return n * factorial(n - 1)
    `,
  });

  add({
    id: 'climbing-stairs', title: '爬上高塔', diff: 'easy', tags: ['動態規劃', '遞迴', '記憶化'], lc: 70,
    fn: 'climbStairs', params: [['n', 'int']], ret: 'int',
    desc: '高塔有 <code>n</code> 階樓梯，你每次可以爬 <b>1 階</b>或 <b>2 階</b>。有幾種不同的方法可以爬到頂端？（1 ≤ n ≤ 45）',
    examples: [{ args: [2], note: '1+1、2' }, { args: [3], note: '1+1+1、1+2、2+1' }],
    tests: [[1], [4], [10], [45]],
    gen: (R) => [R.int(1, 45)], randCount: 8,
    cx: { time: 'n', space: '1', sizes: [8, 14, 20, 26, 32, 38, 45], gen: (R, n) => [n] },
    hints: ['到第 n 階的最後一步，不是從 n−1 階、就是從 n−2 階上來。', '所以 ways(n) = ways(n−1) + ways(n−2)——但直接遞迴會重複計算非常多次（指數時間）！', '記住算過的答案（記憶化），或從小到大用兩個變數往上推。'],
    explain: '這其實是費氏數列。純遞迴是 O(2ⁿ)；記憶化或由下而上 DP 變成 O(n)；只保留前兩項可達到 O(1) 空間。',
    ref: function climbStairs(n) {
      let a = 1, b = 1;
      for (let i = 2; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
      }
      return b;
    },
    py: `
      def climbStairs(n):
          a, b = 1, 1
          for _ in range(2, n + 1):
              a, b = b, a + b
          return b
    `,
  });

  const listGen = (R, n) => [R.arr(n, -100, 100)];
  add({
    id: 'middle-node', title: '鎖鏈的中心', diff: 'easy', tags: ['鏈結串列', '快慢指標'], lc: 876,
    fn: 'middleNode', params: [['head', 'ListNode']], ret: 'ListNode',
    desc: '給定鏈結串列的頭節點 <code>head</code>，回傳<b>中間節點</b>（以及其後的串列）。若有兩個中間節點，回傳第二個。',
    examples: [{ args: [[1, 2, 3, 4, 5]] }, { args: [[1, 2, 3, 4, 5, 6]] }],
    tests: [[[1]], [[1, 2]]],
    gen: (R, n) => listGen(R, Math.max(1, n)), rand: [1, 100],
    cx: { time: 'n', space: '1' },
    hints: ['方法一：先數長度，再走一半。', '方法二（快慢指標）：slow 每次走 1 步、fast 每次走 2 步，fast 到底時 slow 剛好在中間。'],
    explain: '快慢指標只需一趟：O(n) 時間、O(1) 空間。',
    ref: function middleNode(head) {
      let slow = head, fast = head;
      while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
      }
      return slow;
    },
    py: `
      def middleNode(head):
          slow = fast = head
          while fast and fast.next:
              slow = slow.next
              fast = fast.next.next
          return slow
    `,
  });

  add({
    id: 'reverse-list', title: '逆轉鎖鏈', diff: 'easy', tags: ['鏈結串列'], lc: 206,
    fn: 'reverseList', params: [['head', 'ListNode']], ret: 'ListNode',
    desc: '反轉鏈結串列，回傳反轉後的頭節點。',
    examples: [{ args: [[1, 2, 3, 4, 5]] }, { args: [[1, 2]] }, { args: [[]] }],
    tests: [[[7]]],
    gen: listGen, rand: [0, 100], big: [20000],
    cx: { time: 'n', space: '1' },
    hints: ['用三個變數：<code>prev</code>、<code>cur</code>、<code>next</code>。', '每一步：先記住 cur.next，再把 cur.next 指向 prev，然後兩個指標都往前走。'],
    explain: '迭代地把每個節點的 next 反過來指向前一個節點：O(n) 時間、O(1) 空間。遞迴版本則需要 O(n) 堆疊空間。',
    ref: function reverseList(head) {
      let prev = null, cur = head;
      while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
      }
      return prev;
    },
    py: `
      def reverseList(head):
          prev, cur = None, head
          while cur:
              nxt = cur.next
              cur.next = prev
              prev, cur = cur, nxt
          return prev
    `,
  });

  add({
    id: 'merge-two-lists', title: '合併兩條鎖鏈', diff: 'easy', tags: ['鏈結串列', '雙指標'], lc: 21,
    fn: 'mergeTwoLists', params: [['list1', 'ListNode'], ['list2', 'ListNode']], ret: 'ListNode',
    desc: '把兩條<b>已排序</b>的鏈結串列合併成一條排序的串列，回傳其頭節點。',
    examples: [{ args: [[1, 2, 4], [1, 3, 4]] }, { args: [[], []] }, { args: [[], [0]] }],
    tests: [[[5], [1, 2, 3]], [[1, 1], [1]]],
    gen: (R, n) => [sorted(R.arr(R.int(0, n), -100, 100)), sorted(R.arr(R.int(0, n), -100, 100))], rand: [0, 60], big: [10000],
    cx: { time: 'n', space: '1', gen: (R, n) => [sorted(R.arr(n >> 1, 0, 1e6)), sorted(R.arr(n >> 1, 0, 1e6))] },
    hints: ['建立一個「假的頭節點」dummy，可以省去很多特殊判斷。', '比較兩條串列目前的節點，把較小的接到結果後面。'],
    explain: '用 dummy 節點與尾指標，每次接上較小的節點，最後接上剩餘部分。O(m+n) 時間、O(1) 額外空間。',
    ref: function mergeTwoLists(list1, list2) {
      const dummy = new ListNode(0);
      let tail = dummy;
      while (list1 && list2) {
        if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
        else { tail.next = list2; list2 = list2.next; }
        tail = tail.next;
      }
      tail.next = list1 || list2;
      return dummy.next;
    },
    py: `
      def mergeTwoLists(list1, list2):
          dummy = tail = ListNode(0)
          while list1 and list2:
              if list1.val <= list2.val:
                  tail.next, list1 = list1, list1.next
              else:
                  tail.next, list2 = list2, list2.next
              tail = tail.next
          tail.next = list1 or list2
          return dummy.next
    `,
  });

  const treeLabels = { logn: 'O(h)', n: 'O(n)' };
  add({
    id: 'max-depth', title: '世界樹的高度', diff: 'easy', tags: ['二元樹', 'DFS', '遞迴'], lc: 104,
    fn: 'maxDepth', params: [['root', 'TreeNode']], ret: 'int',
    desc: '回傳二元樹的<b>最大深度</b>：從根節點到最遠葉節點的路徑上的節點數。<br><small>樹以「層序陣列」表示，<code>null</code> 代表空位。</small>',
    examples: [{ args: [[3, 9, 20, null, null, 15, 7]] }, { args: [[1, null, 2]] }, { args: [[]] }],
    tests: [[[1]], [[1, 2, null, 3, null, 4]]],
    gen: (R, n) => [R.tree(n, -100, 100)], rand: [0, 60],
    cx: { time: 'n', space: 'logn', labels: treeLabels, sizes: [63, 127, 255, 511, 1023, 2047], gen: (R, n) => [R.bst(n, 0, 1e6)], note: 'h = 樹高（隨機樹約為 log n）' },
    hints: ['空樹的深度是 0。', '一棵樹的深度 = 1 + max(左子樹深度, 右子樹深度)。'],
    explain: '遞迴定義：depth(node) = 1 + max(depth(left), depth(right))。每個節點拜訪一次 O(n)，遞迴深度為樹高 O(h)。',
    ref: function maxDepth(root) {
      if (!root) return 0;
      return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    },
    py: `
      def maxDepth(root):
          if not root:
              return 0
          return 1 + max(maxDepth(root.left), maxDepth(root.right))
    `,
  });

  add({
    id: 'invert-tree', title: '鏡像之樹', diff: 'easy', tags: ['二元樹', '遞迴'], lc: 226,
    fn: 'invertTree', params: [['root', 'TreeNode']], ret: 'TreeNode',
    desc: '把二元樹左右翻轉（每個節點的左右子樹互換），回傳根節點。',
    examples: [{ args: [[4, 2, 7, 1, 3, 6, 9]] }, { args: [[2, 1, 3]] }, { args: [[]] }],
    tests: [[[1]], [[1, 2]]],
    gen: (R, n) => [R.tree(n, -100, 100)], rand: [0, 60],
    cx: { time: 'n', space: 'logn', labels: treeLabels, sizes: [63, 127, 255, 511, 1023, 2047], gen: (R, n) => [R.bst(n, 0, 1e6)] },
    hints: ['對每個節點：交換它的 left 與 right。', '然後對左右子樹做同樣的事（遞迴）。'],
    explain: '遞迴地交換每個節點的左右子節點：O(n) 時間，O(h) 遞迴空間。',
    ref: function invertTree(root) {
      if (!root) return null;
      const left = invertTree(root.left);
      root.left = invertTree(root.right);
      root.right = left;
      return root;
    },
    py: `
      def invertTree(root):
          if not root:
              return None
          root.left, root.right = invertTree(root.right), invertTree(root.left)
          return root
    `,
  });

  add({
    id: 'level-order', title: '逐層探索', diff: 'medium', tags: ['二元樹', 'BFS', '佇列'], lc: 102,
    fn: 'levelOrder', params: [['root', 'TreeNode']], ret: 'int[][]',
    desc: '回傳二元樹的<b>層序走訪</b>結果：由上到下、每一層由左到右，每層放在一個陣列中。',
    examples: [{ args: [[3, 9, 20, null, null, 15, 7]] }, { args: [[1]] }, { args: [[]] }],
    tests: [[[1, 2, 3, 4, null, null, 5]]],
    gen: (R, n) => [R.tree(n, -100, 100)], rand: [0, 60],
    cx: { time: 'n', space: 'n', sizes: [63, 127, 255, 511, 1023, 2047, 4095], gen: (R, n) => [R.bst(n, 0, 1e6)] },
    hints: ['使用佇列（先進先出）做廣度優先搜尋 BFS。', '每一輪先記下佇列目前的長度 size，這 size 個節點就是同一層。'],
    explain: 'BFS 每次處理一整層：先取得該層節點數，再依序取出並把子節點加入佇列。O(n) 時間、O(n) 空間。',
    ref: function levelOrder(root) {
      const result = [];
      if (!root) return result;
      let queue = [root];
      while (queue.length) {
        const level = [], next = [];
        for (const node of queue) {
          level.push(node.val);
          if (node.left) next.push(node.left);
          if (node.right) next.push(node.right);
        }
        result.push(level);
        queue = next;
      }
      return result;
    },
    py: `
      def levelOrder(root):
          result = []
          if not root:
              return result
          q = deque([root])
          while q:
              level = []
              for _ in range(len(q)):
                  node = q.popleft()
                  level.append(node.val)
                  if node.left:
                      q.append(node.left)
                  if node.right:
                      q.append(node.right)
              result.append(level)
          return result
    `,
  });

  add({
    id: 'valid-bst', title: '秩序之樹', diff: 'medium', tags: ['二元樹', '二元搜尋樹', 'DFS'], lc: 98,
    fn: 'isValidBST', params: [['root', 'TreeNode']], ret: 'bool',
    desc: '判斷二元樹是否為有效的<b>二元搜尋樹</b>（BST）：<ul><li>左子樹所有節點都<b>小於</b>根</li><li>右子樹所有節點都<b>大於</b>根</li><li>左右子樹也都是 BST</li></ul>',
    examples: [{ args: [[2, 1, 3]] }, { args: [[5, 1, 4, null, null, 3, 6]], note: '4 在 5 的右邊卻比 5 小' }],
    tests: [[[1]], [[2, 2, 2]], [[5, 4, 6, null, null, 3, 7]], [[3, 1, 5, 0, 2, 4, 6]], [[-2147483648, null, 2147483647]]],
    gen: (R, n) => { const t = R.bst(n, -1000, 1000); if (R.bool(0.4) && t.length > 1) { const i = R.int(0, t.length - 1); if (t[i] !== null) t[i] = R.int(-1000, 1000); } return [t]; }, rand: [0, 60],
    cx: { time: 'n', space: 'logn', labels: treeLabels, sizes: [63, 127, 255, 511, 1023, 2047], gen: (R, n) => [R.bst(n, 0, 1e6)] },
    hints: ['只比較「父子」是不夠的！右子樹的「所有」節點都要大於根。', '遞迴時傳入允許的範圍 (low, high)：往左走更新 high，往右走更新 low。', '或者：BST 的中序走訪結果必須嚴格遞增。'],
    explain: '帶著上下界遞迴：每個節點的值必須落在 (low, high) 之間。O(n) 時間、O(h) 空間。',
    ref: function isValidBST(root) {
      function check(node, low, high) {
        if (!node) return true;
        if (node.val <= low || node.val >= high) return false;
        return check(node.left, low, node.val) && check(node.right, node.val, high);
      }
      return check(root, -Infinity, Infinity);
    },
    py: `
      def isValidBST(root):
          def check(node, low, high):
              if not node:
                  return True
              if not (low < node.val < high):
                  return False
              return check(node.left, low, node.val) and check(node.right, node.val, high)
          return check(root, float("-inf"), float("inf"))
    `,
  });

  /* ======================= Chapter 5 : advanced ======================= */
  const gridGen = (R, n, density) => { const r = Math.max(1, Math.round(Math.sqrt(n) * (0.6 + 0.8 * R.next()))); const c = Math.max(1, Math.round(n / r)); return [Array.from({ length: r }, () => Array.from({ length: c }, () => (R.bool(density || 0.45) ? '1' : '0')))]; };
  add({
    id: 'number-of-islands', title: '群島探險', diff: 'medium', tags: ['網格', 'DFS', 'BFS'], lc: 200,
    fn: 'numIslands', params: [['grid', 'char[][]']], ret: 'int',
    desc: '地圖 <code>grid</code> 中 <code>"1"</code> 是陸地、<code>"0"</code> 是海。上下左右相連的陸地屬於同一座島。回傳島嶼的數量。',
    examples: [{ args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]] }, { args: [[['1', '1', '1'], ['0', '1', '0'], ['1', '1', '1']]] }],
    tests: [[[['0']]], [[['1']]], [[['1', '0', '1', '0', '1']]]],
    gen: (R, n) => gridGen(R, n), rand: [1, 120], big: [40000],
    cx: { time: 'n', space: 'n', labels: { n: 'O(m·n)' }, sizes: [100, 400, 1600, 6400, 25600], gen: (R, n) => { const s = Math.round(Math.sqrt(n)); return [Array.from({ length: s }, () => Array.from({ length: s }, () => (R.bool(0.4) ? '1' : '0')))]; }, note: 'n = 格子總數' },
    hints: ['走訪每個格子，遇到還沒探索過的陸地，島嶼數 +1。', '然後用 DFS 或 BFS 把整座島「淹掉」（標記成已拜訪），避免重複計算。'],
    explain: '每個格子最多被拜訪常數次：時間 O(m·n)。DFS 的遞迴深度或 BFS 的佇列最壞為 O(m·n)。',
    ref: function numIslands(grid) {
      const rows = grid.length, cols = grid[0].length;
      let count = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] !== '1') continue;
          count++;
          grid[r][c] = '0';
          const stack = [[r, c]];
          while (stack.length) {
            const [i, j] = stack.pop();
            for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const x = i + di, y = j + dj;
              if (x >= 0 && y >= 0 && x < rows && y < cols && grid[x][y] === '1') {
                grid[x][y] = '0';
                stack.push([x, y]);
              }
            }
          }
        }
      }
      return count;
    },
    py: `
      def numIslands(grid):
          rows, cols = len(grid), len(grid[0])
          count = 0
          for r in range(rows):
              for c in range(cols):
                  if grid[r][c] != "1":
                      continue
                  count += 1
                  grid[r][c] = "0"
                  stack = [(r, c)]
                  while stack:
                      i, j = stack.pop()
                      for x, y in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                          if 0 <= x < rows and 0 <= y < cols and grid[x][y] == "1":
                              grid[x][y] = "0"
                              stack.append((x, y))
          return count
    `,
  });

  add({
    id: 'subsets', title: '寶物的所有組合', diff: 'medium', tags: ['回溯', '位元運算'], lc: 78,
    fn: 'subsets', params: [['nums', 'int[]']], ret: 'int[][]',
    desc: '<code>nums</code> 中的元素<b>互不相同</b>，回傳所有可能的子集合（冪集）。結果不能有重複的子集，順序不限。',
    examples: [{ args: [[1, 2, 3]] }, { args: [[0]] }],
    tests: [[[]], [[5, -1]]],
    gen: (R, n) => [R.distinct(Math.min(n, 10), -10, 10)], rand: [0, 10],
    cmp: 'unorderedDeep',
    cx: { time: 'n2^n', space: 'n2^n', exponential: true, sizes: [4, 6, 8, 10, 12, 13], gen: (R, n) => [R.distinct(n, -100, 100)], note: '輸出本身就有 2ⁿ 個子集' },
    hints: ['每個元素都有「選」或「不選」兩種可能，所以共有 2ⁿ 個子集。', '回溯法：遞迴到第 i 個元素時，分別嘗試「加入」與「不加入」。', '記得把目前路徑的「複本」加入答案。'],
    explain: '回溯：對每個元素決定選或不選，每個子集複製到答案需 O(n)：總時間 O(n·2ⁿ)。',
    ref: function subsets(nums) {
      const result = [], path = [];
      function backtrack(i) {
        if (i === nums.length) { result.push([...path]); return; }
        path.push(nums[i]);
        backtrack(i + 1);
        path.pop();
        backtrack(i + 1);
      }
      backtrack(0);
      return result;
    },
    py: `
      def subsets(nums):
          result, path = [], []
          def backtrack(i):
              if i == len(nums):
                  result.append(path[:])
                  return
              path.append(nums[i])
              backtrack(i + 1)
              path.pop()
              backtrack(i + 1)
          backtrack(0)
          return result
    `,
  });

  add({
    id: 'permutations', title: '騎士的排列', diff: 'medium', tags: ['回溯'], lc: 46,
    fn: 'permute', params: [['nums', 'int[]']], ret: 'int[][]',
    desc: '<code>nums</code> 中的元素<b>互不相同</b>，回傳所有可能的排列，順序不限。',
    examples: [{ args: [[1, 2, 3]] }, { args: [[0, 1]] }],
    tests: [[[1]], [[4, 5, 6, 7]]],
    gen: (R, n) => [R.distinct(Math.max(1, Math.min(n, 6)), -10, 10)], rand: [1, 6],
    cmp: 'unordered',
    cx: { time: 'n!', space: 'n!', exponential: true, sizes: [3, 4, 5, 6, 7, 8], gen: (R, n) => [R.distinct(n, -100, 100)], labels: { 'n!': 'O(n·n!)' }, note: '輸出本身就有 n! 個排列' },
    hints: ['回溯：每一層選一個「還沒用過」的數字放到路徑尾端。', '用一個布林陣列 used 記錄哪些數字已經用過。', '路徑長度等於 n 時，把複本加入答案。'],
    explain: '回溯產生全部 n! 種排列，每個排列複製 O(n)：時間 O(n·n!)。',
    ref: function permute(nums) {
      const result = [], path = [], used = new Array(nums.length).fill(false);
      function backtrack() {
        if (path.length === nums.length) { result.push([...path]); return; }
        for (let i = 0; i < nums.length; i++) {
          if (used[i]) continue;
          used[i] = true;
          path.push(nums[i]);
          backtrack();
          path.pop();
          used[i] = false;
        }
      }
      backtrack();
      return result;
    },
    py: `
      def permute(nums):
          result, path = [], []
          used = [False] * len(nums)
          def backtrack():
              if len(path) == len(nums):
                  result.append(path[:])
                  return
              for i in range(len(nums)):
                  if used[i]:
                      continue
                  used[i] = True
                  path.append(nums[i])
                  backtrack()
                  path.pop()
                  used[i] = False
          backtrack()
          return result
    `,
  });

  add({
    id: 'house-robber', title: '義賊的夜晚', diff: 'medium', tags: ['動態規劃'], lc: 198,
    fn: 'rob', params: [['nums', 'int[]']], ret: 'int',
    desc: '義賊要從一排房子拿走金幣分給窮人，<code>nums[i]</code> 是第 i 間房子的金幣數。但<b>相鄰的兩間</b>不能在同一晚都被拿，否則會觸發警報。回傳最多能拿到的金幣。',
    examples: [{ args: [[1, 2, 3, 1]], note: '1 + 3 = 4' }, { args: [[2, 7, 9, 3, 1]], note: '2 + 9 + 1 = 12' }],
    tests: [[[5]], [[2, 1]], [[2, 1, 1, 2]], [[0, 0, 0]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 0, 400)], rand: [1, 100], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['對第 i 間房子只有兩個選擇：拿（那就不能拿 i−1）或不拿。', 'dp[i] = max(dp[i−1], dp[i−2] + nums[i])。', 'dp[i] 只依賴前兩項，用兩個變數就夠了。'],
    explain: '狀態轉移 dp[i] = max(dp[i−1], dp[i−2] + nums[i])；只保留前兩個狀態：O(n) 時間、O(1) 空間。',
    ref: function rob(nums) {
      let prev2 = 0, prev1 = 0;
      for (const x of nums) {
        const cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
      }
      return prev1;
    },
    py: `
      def rob(nums):
          prev2 = prev1 = 0
          for x in nums:
              prev2, prev1 = prev1, max(prev1, prev2 + x)
          return prev1
    `,
  });

  add({
    id: 'unique-paths', title: '迷宮的路徑數', diff: 'medium', tags: ['動態規劃', '組合數學'], lc: 62,
    fn: 'uniquePaths', params: [['m', 'int'], ['n', 'int']], ret: 'int',
    desc: '機器人在 <code>m × n</code> 網格的左上角，每次只能向<b>右</b>或向<b>下</b>走一格。走到右下角共有幾條不同的路徑？',
    examples: [{ args: [3, 7] }, { args: [3, 2], note: '右→下→下、下→下→右、下→右→下' }],
    tests: [[1, 1], [1, 10], [10, 10], [17, 17]],
    gen: (R) => [R.int(1, 16), R.int(1, 16)], randCount: 8,
    cx: { time: 'n^2', space: 'n', sizes: [10, 20, 40, 80, 160, 320], gen: (R, n) => [n, n], labels: { 'n^2': 'O(m·n)', n: 'O(n)' }, note: '以 m = n 量測' },
    hints: ['走到 (i, j) 的方法數 = 從上面來的 + 從左邊來的。', 'dp[i][j] = dp[i−1][j] + dp[i][j−1]，第一列與第一行都是 1。', '空間優化：只需要保留一列。'],
    explain: '二維 DP 每格只依賴上方與左方：O(m·n) 時間；只保留一列可做到 O(n) 空間。',
    ref: function uniquePaths(m, n) {
      const dp = new Array(n).fill(1);
      for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) dp[j] += dp[j - 1];
      }
      return dp[n - 1];
    },
    py: `
      def uniquePaths(m, n):
          dp = [1] * n
          for _ in range(1, m):
              for j in range(1, n):
                  dp[j] += dp[j - 1]
          return dp[n - 1]
    `,
  });

  add({
    id: 'coin-change', title: '找零的魔法', diff: 'medium', tags: ['動態規劃'], lc: 322,
    fn: 'coinChange', params: [['coins', 'int[]'], ['amount', 'int']], ret: 'int',
    desc: '有各種面額的硬幣 <code>coins</code>（每種數量無限），回傳湊出金額 <code>amount</code> 所需的<b>最少</b>硬幣數；湊不出來則回傳 <code>-1</code>。',
    examples: [{ args: [[1, 2, 5], 11], note: '5 + 5 + 1' }, { args: [[2], 3] }, { args: [[1], 0] }],
    tests: [[[186, 419, 83, 408], 6249], [[2, 5, 10, 1], 27], [[3, 7], 5]],
    gen: (R, n) => [R.distinct(R.int(1, 5), 1, 30), R.int(0, Math.max(1, n))], rand: [1, 300], big: [8000],
    cx: { time: 'n', space: 'n', sizes: [200, 400, 800, 1600, 3200, 6400], gen: (R, n) => [[1, 7, 13, 29, 41], n], labels: { n: 'O(S·k)' }, note: '以 S = amount 成長、硬幣種類 k 固定量測' },
    hints: ['貪婪（先拿最大的）不一定對！例如 coins=[1,3,4]、amount=6。', 'dp[x] = 湊出 x 的最少硬幣數；dp[x] = min(dp[x − c] + 1)。', 'dp[0] = 0，其他初始化為無限大。'],
    explain: '完全背包型 DP：對每個金額 x 嘗試每種硬幣。時間 O(S·k)、空間 O(S)。',
    ref: function coinChange(coins, amount) {
      const dp = new Array(amount + 1).fill(Infinity);
      dp[0] = 0;
      for (let x = 1; x <= amount; x++) {
        for (const c of coins) {
          if (c <= x && dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
        }
      }
      return dp[amount] === Infinity ? -1 : dp[amount];
    },
    py: `
      def coinChange(coins, amount):
          dp = [float("inf")] * (amount + 1)
          dp[0] = 0
          for x in range(1, amount + 1):
              for c in coins:
                  if c <= x and dp[x - c] + 1 < dp[x]:
                      dp[x] = dp[x - c] + 1
          return -1 if dp[amount] == float("inf") else dp[amount]
    `,
  });

  add({
    id: 'kth-largest', title: '第 K 強的勇者', diff: 'medium', tags: ['堆積', '排序', 'Quickselect'], lc: 215,
    fn: 'findKthLargest', params: [['nums', 'int[]'], ['k', 'int']], ret: 'int',
    desc: '回傳陣列 <code>nums</code> 中第 <code>k</code> 大的元素（是排序後的第 k 大，不是第 k 個不同的值）。你能不用排序完成嗎？',
    examples: [{ args: [[3, 2, 1, 5, 6, 4], 2] }, { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4] }],
    tests: [[[1], 1], [[2, 1], 2], [[7, 7, 7], 2]],
    gen: (R, n) => { n = Math.max(1, n); return [R.arr(n, -1000, 1000), R.int(1, n)]; }, rand: [1, 150], big: [30000],
    cx: { time: 'nlogn', space: 'n', gen: (R, n) => [R.arr(n, -1e6, 1e6), n >> 1], note: '量測時 k = n/2；最小堆積法為 O(n log k)，Quickselect 平均 O(n)' },
    hints: ['排序後取 nums[n−k] 是 O(n log n)。', '維持一個大小為 k 的「最小堆積」：堆積頂端就是第 k 大。Python 有 heapq；JS 本遊戲提供 <code>new PriorityQueue((a, b) => a - b)</code>。', '進階：Quickselect 平均 O(n)。'],
    explain: '最小堆積保留目前最大的 k 個數，堆頂即為第 k 大：O(n log k)。Quickselect 可達平均 O(n)。',
    ref: function findKthLargest(nums, k) {
      const heap = new PriorityQueue((a, b) => a - b);
      for (const x of nums) {
        heap.push(x);
        if (heap.size() > k) heap.pop();
      }
      return heap.peek();
    },
    py: `
      def findKthLargest(nums, k):
          heap = []
          for x in nums:
              heappush(heap, x)
              if len(heap) > k:
                  heappop(heap)
          return heap[0]
    `,
  });

  add({
    id: 'daily-temperatures', title: '等待暖陽', diff: 'medium', tags: ['單調堆疊'], lc: 739,
    fn: 'dailyTemperatures', params: [['temperatures', 'int[]']], ret: 'int[]',
    desc: '對每一天，找出要再等<b>幾天</b>才會出現更高的溫度；如果之後都不會更暖，填 <code>0</code>。',
    examples: [{ args: [[73, 74, 75, 71, 69, 72, 76, 73]] }, { args: [[30, 40, 50, 60]] }, { args: [[30, 60, 90]] }],
    tests: [[[50]], [[90, 80, 70]], [[70, 70, 71]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 30, 100)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [Array.from({ length: n }, (_, i) => (i === n - 1 ? 1e6 : n - i))], note: '最壞情況：氣溫一路下降，最後一天才變暖' },
    hints: ['暴力法對每天往後找，最壞 O(n²)。', '用堆疊存放「還在等待更暖日子」的日期索引，堆疊中的溫度保持遞減。', '新的一天若比堆疊頂端暖，就幫頂端那天算出答案並彈出。'],
    explain: '單調遞減堆疊：每個索引最多進出堆疊一次，總時間 O(n)、空間 O(n)。',
    ref: function dailyTemperatures(temperatures) {
      const answer = new Array(temperatures.length).fill(0);
      const stack = [];
      for (let i = 0; i < temperatures.length; i++) {
        while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
          const j = stack.pop();
          answer[j] = i - j;
        }
        stack.push(i);
      }
      return answer;
    },
    py: `
      def dailyTemperatures(temperatures):
          answer = [0] * len(temperatures)
          stack = []
          for i, t in enumerate(temperatures):
              while stack and temperatures[stack[-1]] < t:
                  j = stack.pop()
                  answer[j] = i - j
              stack.append(i)
          return answer
    `,
  });

  add({
    id: 'merge-intervals', title: '合併結界', diff: 'medium', tags: ['排序', '區間'], lc: 56,
    fn: 'merge', params: [['intervals', 'int[][]']], ret: 'int[][]',
    desc: '<code>intervals[i] = [start, end]</code>。合併所有<b>重疊</b>的區間（端點相接也算重疊），回傳不重疊的區間陣列（依起點排序）。',
    examples: [{ args: [[[1, 3], [2, 6], [8, 10], [15, 18]]] }, { args: [[[1, 4], [4, 5]]] }],
    tests: [[[[1, 4]]], [[[1, 4], [0, 4]]], [[[1, 4], [2, 3]]], [[[5, 6], [1, 2]]]],
    gen: (R, n) => [Array.from({ length: Math.max(1, n) }, () => { const a = R.int(0, n * 3); return [a, a + R.int(0, 5)]; })], rand: [1, 80], big: [20000],
    cx: { time: 'nlogn', space: 'n', gen: (R, n) => [Array.from({ length: n }, () => { const a = R.int(0, n * 4); return [a, a + R.int(0, 2)]; })] },
    hints: ['先依照起點排序。', '排序後，只需要跟「結果中最後一個區間」比較：重疊就延長它的終點，否則加入新區間。'],
    explain: '排序 O(n log n) 後線性掃描合併：總時間 O(n log n)。',
    ref: function merge(intervals) {
      intervals.sort((a, b) => a[0] - b[0]);
      const result = [];
      for (const [s, e] of intervals) {
        const last = result[result.length - 1];
        if (last && s <= last[1]) last[1] = Math.max(last[1], e);
        else result.push([s, e]);
      }
      return result;
    },
    py: `
      def merge(intervals):
          intervals.sort(key=lambda x: x[0])
          result = []
          for s, e in intervals:
              if result and s <= result[-1][1]:
                  result[-1][1] = max(result[-1][1], e)
              else:
                  result.append([s, e])
          return result
    `,
  });

  add({
    id: 'trapping-rain-water', title: '王座之雨', diff: 'hard', tags: ['雙指標', '單調堆疊', '動態規劃'], lc: 42,
    fn: 'trap', params: [['height', 'int[]']], ret: 'int',
    desc: '<code>height[i]</code> 是寬度為 1 的柱子高度。下雨之後，柱子之間能接住多少單位的雨水？',
    examples: [{ args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]] }, { args: [[4, 2, 0, 3, 2, 5]] }],
    tests: [[[1]], [[3, 0, 3]], [[5, 4, 3, 2, 1]], [[1, 2, 3, 4]], [[2, 0, 2, 0, 2]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 0, 30)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['位置 i 能裝的水 = min(左邊最高, 右邊最高) − height[i]。', '可以先算出 leftMax、rightMax 兩個陣列（O(n) 空間）。', '雙指標：哪邊的最高值比較矮，那一邊的水量就已經確定了。'],
    explain: '雙指標從兩端往內走，維護 leftMax 與 rightMax。較矮的一側水位已確定，可以直接結算：O(n) 時間、O(1) 空間。',
    ref: function trap(height) {
      let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
      while (l < r) {
        if (height[l] < height[r]) {
          leftMax = Math.max(leftMax, height[l]);
          water += leftMax - height[l];
          l++;
        } else {
          rightMax = Math.max(rightMax, height[r]);
          water += rightMax - height[r];
          r--;
        }
      }
      return water;
    },
    py: `
      def trap(height):
          l, r = 0, len(height) - 1
          left_max = right_max = water = 0
          while l < r:
              if height[l] < height[r]:
                  left_max = max(left_max, height[l])
                  water += left_max - height[l]
                  l += 1
              else:
                  right_max = max(right_max, height[r])
                  water += right_max - height[r]
                  r -= 1
          return water
    `,
  });
})(typeof window !== 'undefined' ? window : globalThis);
