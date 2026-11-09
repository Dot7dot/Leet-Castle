/* Problem bank, part 2: challenge-only problems (easy / medium / hard). */
(function (root) {
  const LC = (root.LC = root.LC || {});
  LC.Problems = LC.Problems || {};
  const add = (p) => { LC.Problems[p.id] = p; };
  const sorted = (a) => a.slice().sort((x, y) => x - y);

  /* ============================== EASY ============================== */
  add({
    id: 'majority-element', title: '多數決', diff: 'easy', tags: ['陣列', '投票演算法'], lc: 169,
    fn: 'majorityElement', params: [['nums', 'int[]']], ret: 'int',
    desc: '回傳陣列中的「多數元素」：出現次數<b>超過 ⌊n/2⌋</b> 的元素。保證一定存在。進階：O(n) 時間、O(1) 空間。',
    examples: [{ args: [[3, 2, 3]] }, { args: [[2, 2, 1, 1, 1, 2, 2]] }],
    tests: [[[1]], [[6, 5, 5]]],
    gen: (R, n) => { n = Math.max(1, n); const m = R.int(-1e5, 1e5); const k = Math.floor(n / 2) + 1; const a = Array.from({ length: n }, (_, i) => (i < k ? m : R.int(-1e5, 1e5))); return [R.shuffle(a)]; }, rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['用雜湊表計數是 O(n) 空間。', 'Boyer-Moore 投票法：維護一個候選人與票數，遇到相同 +1、不同 −1，票數歸零就換人。'],
    explain: 'Boyer-Moore 投票：多數元素的票數多於其他所有元素總和，抵銷後一定留下它。O(n) 時間、O(1) 空間。',
    ref: function majorityElement(nums) {
      let cand = 0, count = 0;
      for (const x of nums) {
        if (count === 0) cand = x;
        count += x === cand ? 1 : -1;
      }
      return cand;
    },
    py: `
      def majorityElement(nums):
          cand, count = 0, 0
          for x in nums:
              if count == 0:
                  cand = x
              count += 1 if x == cand else -1
          return cand
    `,
  });

  add({
    id: 'single-number', title: '落單的寶石', diff: 'easy', tags: ['位元運算'], lc: 136,
    fn: 'singleNumber', params: [['nums', 'int[]']], ret: 'int',
    desc: '除了某個元素只出現一次，其餘每個元素都恰好出現兩次。找出那個落單的元素。要求 O(n) 時間、O(1) 額外空間。',
    examples: [{ args: [[2, 2, 1]] }, { args: [[4, 1, 2, 1, 2]] }],
    tests: [[[1]], [[-3, 7, 7]]],
    gen: (R, n) => { const k = Math.max(0, n >> 1); const vals = R.distinct(k + 1, -30000, 30000); const a = []; for (let i = 0; i < k; i++) a.push(vals[i], vals[i]); a.push(vals[k]); return [R.shuffle(a)]; }, rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['XOR 有個神奇性質：a ^ a = 0、a ^ 0 = a。', '把所有數字 XOR 起來，成對的都會抵消。'],
    explain: '所有數 XOR 起來，出現兩次的互相抵消成 0，剩下的就是答案。O(n) 時間、O(1) 空間。',
    ref: function singleNumber(nums) {
      let x = 0;
      for (const v of nums) x ^= v;
      return x;
    },
    py: `
      def singleNumber(nums):
          x = 0
          for v in nums:
              x ^= v
          return x
    `,
  });

  add({
    id: 'missing-number', title: '遺失的頁碼', diff: 'easy', tags: ['數學', '位元運算'], lc: 268,
    fn: 'missingNumber', params: [['nums', 'int[]']], ret: 'int',
    desc: '陣列含有 <code>[0, n]</code> 範圍中的 n 個<b>不同</b>數字，正好少了一個。找出缺少的那個數。',
    examples: [{ args: [[3, 0, 1]] }, { args: [[0, 1]] }, { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]] }],
    tests: [[[0]], [[1]]],
    gen: (R, n) => { n = Math.max(1, n); const miss = R.int(0, n); const a = []; for (let i = 0; i <= n; i++) if (i !== miss) a.push(i); return [R.shuffle(a)]; }, rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['0 到 n 的總和是 n(n+1)/2。', '總和減去陣列的和，就是缺少的數。'],
    explain: '期望總和 − 實際總和 = 缺少的數（也可以用 XOR）。O(n) 時間、O(1) 空間。',
    ref: function missingNumber(nums) {
      const n = nums.length;
      let sum = (n * (n + 1)) / 2;
      for (const x of nums) sum -= x;
      return sum;
    },
    py: `
      def missingNumber(nums):
          n = len(nums)
          return n * (n + 1) // 2 - sum(nums)
    `,
  });

  add({
    id: 'valid-palindrome', title: '真正的迴文', diff: 'easy', tags: ['字串', '雙指標'], lc: 125,
    fn: 'isPalindrome', params: [['s', 'string']], ret: 'bool',
    desc: '只考慮<b>英文字母與數字</b>並<b>忽略大小寫</b>，判斷字串 <code>s</code> 是否為迴文。',
    examples: [{ args: ['A man, a plan, a canal: Panama'] }, { args: ['race a car'] }, { args: [' '] }],
    tests: [['0P'], ['ab_a'], ['.,'], ['Aa']],
    gen: (R, n, worst) => { const h = R.str(Math.ceil(n / 2), 'abAB1 ,.'); const s = h + h.split('').reverse().join('').slice(n % 2); return [worst || R.bool() ? s : R.str(n, 'abAB1 ,.')]; }, rand: [1, 100], big: [50000],
    cx: { time: 'n', space: '1' },
    hints: ['左右雙指標，跳過不是字母或數字的字元。', '比較時統一轉成小寫。'],
    explain: '雙指標由兩端往內，略過非英數字元，逐一比較小寫字元。O(n) 時間、O(1) 空間。',
    ref: function isPalindrome(s) {
      const ok = (c) => /[a-z0-9]/i.test(c);
      let l = 0, r = s.length - 1;
      while (l < r) {
        if (!ok(s[l])) l++;
        else if (!ok(s[r])) r--;
        else if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
        else { l++; r--; }
      }
      return true;
    },
    py: `
      def isPalindrome(s):
          l, r = 0, len(s) - 1
          while l < r:
              if not s[l].isalnum():
                  l += 1
              elif not s[r].isalnum():
                  r -= 1
              elif s[l].lower() != s[r].lower():
                  return False
              else:
                  l += 1
                  r -= 1
          return True
    `,
  });

  const toRoman = (num) => { const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]; const s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']; let r = ''; for (let i = 0; i < v.length; i++) while (num >= v[i]) { r += s[i]; num -= v[i]; } return r; };
  add({
    id: 'roman-to-int', title: '古代羅馬碑文', diff: 'easy', tags: ['雜湊表', '字串'], lc: 13,
    fn: 'romanToInt', params: [['s', 'string']], ret: 'int',
    desc: '把羅馬數字轉成整數。I=1, V=5, X=10, L=50, C=100, D=500, M=1000。當小的數字寫在大的數字<b>左邊</b>時代表相減（IV=4、IX=9、XL=40、XC=90、CD=400、CM=900）。範圍 1～3999。',
    examples: [{ args: ['III'] }, { args: ['LVIII'] }, { args: ['MCMXCIV'] }],
    tests: [['IV'], ['IX'], ['MMMCMXCIX'], ['XLIX']],
    gen: (R) => [toRoman(R.int(1, 3999))], randCount: 12,
    cx: false,
    hints: ['先建立一個符號 → 數值的對照表。', '如果目前符號比右邊的符號小，就減掉它；否則加上它。'],
    explain: '從左到右掃描，若目前值小於下一個值就減，否則加。輸入長度有上限，屬於 O(1)。',
    ref: function romanToInt(s) {
      const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
      let total = 0;
      for (let i = 0; i < s.length; i++) {
        const v = val[s[i]];
        if (i + 1 < s.length && v < val[s[i + 1]]) total -= v;
        else total += v;
      }
      return total;
    },
    py: `
      def romanToInt(s):
          val = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
          total = 0
          for i, ch in enumerate(s):
              v = val[ch]
              if i + 1 < len(s) and v < val[s[i + 1]]:
                  total -= v
              else:
                  total += v
          return total
    `,
  });

  add({
    id: 'longest-common-prefix', title: '共同的家徽', diff: 'easy', tags: ['字串'], lc: 14,
    fn: 'longestCommonPrefix', params: [['strs', 'string[]']], ret: 'string',
    desc: '找出字串陣列中所有字串的<b>最長共同前綴</b>；沒有則回傳空字串 <code>""</code>。',
    examples: [{ args: [['flower', 'flow', 'flight']] }, { args: [['dog', 'racecar', 'car']] }],
    tests: [[['a']], [['', 'a']], [['ab', 'ab', 'ab']], [['abc', 'ab']]],
    gen: (R, n) => { const p = R.str(R.int(0, 4), 'ab'); return [Array.from({ length: Math.max(1, n) }, () => p + R.str(R.int(0, 4), 'abc'))]; }, rand: [1, 60],
    cx: { time: 'n', space: '1', gen: (R, n) => [Array.from({ length: n }, () => 'castle' + R.str(4, 'xyz'))], note: 'n = 字串數量（長度固定）' },
    hints: ['以第一個字串為基準，逐字元比對其他字串。', '只要有一個字串在該位置不同（或太短），就停下來。'],
    explain: '縱向掃描：逐位置比較所有字串。時間 O(S)，S 為所有字元總數。',
    ref: function longestCommonPrefix(strs) {
      const first = strs[0];
      for (let i = 0; i < first.length; i++) {
        for (const s of strs) {
          if (i >= s.length || s[i] !== first[i]) return first.slice(0, i);
        }
      }
      return first;
    },
    py: `
      def longestCommonPrefix(strs):
          first = strs[0]
          for i, ch in enumerate(first):
              for s in strs:
                  if i >= len(s) or s[i] != ch:
                      return first[:i]
          return first
    `,
  });

  /* ============================== MEDIUM ============================== */
  add({
    id: 'three-sum', title: '三位一體', diff: 'medium', tags: ['陣列', '雙指標', '排序'], lc: 15,
    fn: 'threeSum', params: [['nums', 'int[]']], ret: 'int[][]',
    desc: '找出所有<b>不重複</b>的三元組 <code>[a, b, c]</code>，使 a + b + c = 0（三個元素來自不同位置）。三元組與答案的順序都不限。',
    examples: [{ args: [[-1, 0, 1, 2, -1, -4]] }, { args: [[0, 1, 1]] }, { args: [[0, 0, 0]] }],
    tests: [[[0, 0, 0, 0]], [[-2, 0, 1, 1, 2]], [[1, -1]]],
    gen: (R, n) => [R.arr(Math.max(3, n), -12, 12)], rand: [3, 60], big: [1500],
    cmp: 'unorderedDeep',
    cx: { time: 'n^2', space: 'n', sizes: [50, 100, 200, 400, 800], gen: (R, n) => [R.arr(n, -1e6, 1e6)] },
    hints: ['先排序！', '固定第一個數 nums[i]，剩下的問題就是「排序陣列中找兩數和為 −nums[i]」——雙指標。', '跳過重複的值以避免重複的三元組。'],
    explain: '排序後固定一個數，用對撞雙指標找另外兩個數，並跳過重複值。O(n²) 時間。',
    ref: function threeSum(nums) {
      nums.sort((a, b) => a - b);
      const res = [];
      for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
          const s = nums[i] + nums[l] + nums[r];
          if (s === 0) {
            res.push([nums[i], nums[l], nums[r]]);
            while (l < r && nums[l] === nums[l + 1]) l++;
            while (l < r && nums[r] === nums[r - 1]) r--;
            l++; r--;
          } else if (s < 0) l++;
          else r--;
        }
      }
      return res;
    },
    py: `
      def threeSum(nums):
          nums.sort()
          res = []
          n = len(nums)
          for i in range(n - 2):
              if i > 0 and nums[i] == nums[i - 1]:
                  continue
              l, r = i + 1, n - 1
              while l < r:
                  s = nums[i] + nums[l] + nums[r]
                  if s == 0:
                      res.append([nums[i], nums[l], nums[r]])
                      while l < r and nums[l] == nums[l + 1]:
                          l += 1
                      while l < r and nums[r] == nums[r - 1]:
                          r -= 1
                      l += 1
                      r -= 1
                  elif s < 0:
                      l += 1
                  else:
                      r -= 1
          return res
    `,
  });

  add({
    id: 'container-water', title: '最大的蓄水池', diff: 'medium', tags: ['雙指標', '貪婪'], lc: 11,
    fn: 'maxArea', params: [['height', 'int[]']], ret: 'int',
    desc: '<code>height[i]</code> 是第 i 條垂直線的高度。選兩條線與 x 軸形成容器，回傳容器能裝的最多水量（寬 × 較矮的高度）。',
    examples: [{ args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]] }, { args: [[1, 1]] }],
    tests: [[[4, 3, 2, 1, 4]], [[1, 2, 1]], [[0, 0]]],
    gen: (R, n) => [R.arr(Math.max(2, n), 0, 1000)], rand: [2, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['暴力法 O(n²) 會超時。', '從最寬的容器開始（左右兩端）。', '每次移動「比較矮」的那一側——移動較高的那側不可能讓面積變大。'],
    explain: '對撞雙指標：面積受較矮的線限制，所以只有移動較矮的一側才可能找到更大的面積。O(n) 時間。',
    ref: function maxArea(height) {
      let l = 0, r = height.length - 1, best = 0;
      while (l < r) {
        best = Math.max(best, (r - l) * Math.min(height[l], height[r]));
        if (height[l] < height[r]) l++;
        else r--;
      }
      return best;
    },
    py: `
      def maxArea(height):
          l, r, best = 0, len(height) - 1, 0
          while l < r:
              best = max(best, (r - l) * min(height[l], height[r]))
              if height[l] < height[r]:
                  l += 1
              else:
                  r -= 1
          return best
    `,
  });

  add({
    id: 'product-except-self', title: '除了自己的乘積', diff: 'medium', tags: ['陣列', '前綴積'], lc: 238,
    fn: 'productExceptSelf', params: [['nums', 'int[]']], ret: 'int[]',
    desc: '回傳陣列 <code>answer</code>，其中 <code>answer[i]</code> 等於 nums 中<b>除了 nums[i] 以外</b>所有元素的乘積。<b>不能使用除法</b>，且要在 O(n) 時間內完成。',
    examples: [{ args: [[1, 2, 3, 4]] }, { args: [[-1, 1, 0, -3, 3]] }],
    tests: [[[2, 3]], [[0, 0]], [[5, 0, 2]]],
    gen: (R, n) => [R.arr(Math.max(2, Math.min(n, 30)), -3, 3)], rand: [2, 30],
    cx: { time: 'n', space: 'n', gen: (R, n) => [R.arr(n, 1, 1)], note: '回傳的陣列佔 O(n)；除此之外可做到 O(1)' },
    hints: ['answer[i] = (i 左邊所有數的乘積) × (i 右邊所有數的乘積)。', '從左到右算一次前綴積，再從右到左乘上後綴積。'],
    explain: '先把前綴積寫入 answer，再用一個變數從右往左累乘後綴積。除了輸出陣列外只用 O(1) 空間。',
    ref: function productExceptSelf(nums) {
      const n = nums.length;
      const answer = new Array(n).fill(1);
      for (let i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
      let suffix = 1;
      for (let i = n - 1; i >= 0; i--) {
        answer[i] *= suffix;
        suffix *= nums[i];
      }
      return answer;
    },
    py: `
      def productExceptSelf(nums):
          n = len(nums)
          answer = [1] * n
          for i in range(1, n):
              answer[i] = answer[i - 1] * nums[i - 1]
          suffix = 1
          for i in range(n - 1, -1, -1):
              answer[i] *= suffix
              suffix *= nums[i]
          return answer
    `,
  });

  add({
    id: 'top-k-frequent', title: '最常出現的 K 個', diff: 'medium', tags: ['雜湊表', '桶排序', '堆積'], lc: 347,
    fn: 'topKFrequent', params: [['nums', 'int[]'], ['k', 'int']], ret: 'int[]',
    desc: '回傳出現頻率<b>最高的 k 個</b>元素，順序不限。保證答案唯一。進階：比 O(n log n) 更快。',
    examples: [{ args: [[1, 1, 1, 2, 2, 3], 2] }, { args: [[1], 1] }],
    tests: [[[4, 4, 5, 5, 5, 6], 1], [[1, 2], 2]],
    gen: (R, n) => { const m = Math.max(1, Math.min(12, Math.floor(Math.sqrt(n)) + 1)); const vals = R.distinct(m, -50, 50); const a = []; vals.forEach((v, i) => { for (let j = 0; j <= i; j++) a.push(v); }); return [R.shuffle(a), R.int(1, m)]; }, rand: [1, 120],
    cmp: 'unordered',
    cx: { time: 'n', space: 'n', gen: (R, n) => [R.arr(n, 0, Math.max(1, n >> 2)), 5], note: '桶排序為 O(n)；排序或堆積為 O(n log n)' },
    hints: ['先用雜湊表數出每個數的頻率。', '桶排序：建立 n+1 個桶，第 f 個桶放「出現 f 次」的數字，再從高頻往低頻收集。'],
    explain: '計數後，用「頻率 → 數字清單」的桶，由高頻往低頻取出 k 個。O(n) 時間。',
    ref: function topKFrequent(nums, k) {
      const count = new Map();
      for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
      const buckets = Array.from({ length: nums.length + 1 }, () => []);
      for (const [x, c] of count) buckets[c].push(x);
      const res = [];
      for (let f = nums.length; f > 0 && res.length < k; f--) {
        for (const x of buckets[f]) { if (res.length < k) res.push(x); }
      }
      return res;
    },
    py: `
      def topKFrequent(nums, k):
          count = Counter(nums)
          buckets = [[] for _ in range(len(nums) + 1)]
          for x, c in count.items():
              buckets[c].append(x)
          res = []
          for f in range(len(nums), 0, -1):
              for x in buckets[f]:
                  if len(res) < k:
                      res.append(x)
              if len(res) >= k:
                  break
          return res
    `,
  });

  add({
    id: 'longest-consecutive', title: '最長的連號', diff: 'medium', tags: ['雜湊表', '集合'], lc: 128,
    fn: 'longestConsecutive', params: [['nums', 'int[]']], ret: 'int',
    desc: '給定<b>未排序</b>的整數陣列，找出數字連續的最長序列長度（不要求在原陣列中連續）。要求 O(n) 時間。',
    examples: [{ args: [[100, 4, 200, 1, 3, 2]], note: '1, 2, 3, 4' }, { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]] }],
    tests: [[[]], [[1]], [[1, 2, 0, 1]], [[9, 1, -3, 2, 4, 8, 3, -1, 6, -2, -4, 7]]],
    gen: (R, n) => [R.arr(n, -n, n)], rand: [0, 150], big: [30000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [R.shuffle(Array.from({ length: n }, (_, i) => i * (i % 7 === 0 ? 3 : 1)))] },
    hints: ['排序是 O(n log n)，不夠快。', '把所有數放進集合。只有當 x−1 不在集合裡時，x 才是一段序列的「起點」。', '從每個起點往上數，每個數只會被數到一次。'],
    explain: '集合 + 只從序列起點開始延伸，每個元素最多被看兩次：O(n) 時間、O(n) 空間。',
    ref: function longestConsecutive(nums) {
      const set = new Set(nums);
      let best = 0;
      for (const x of set) {
        if (set.has(x - 1)) continue;
        let len = 1;
        while (set.has(x + len)) len++;
        best = Math.max(best, len);
      }
      return best;
    },
    py: `
      def longestConsecutive(nums):
          s = set(nums)
          best = 0
          for x in s:
              if x - 1 in s:
                  continue
              length = 1
              while x + length in s:
                  length += 1
              best = max(best, length)
          return best
    `,
  });

  add({
    id: 'subarray-sum-k', title: '和為 K 的子陣列', diff: 'medium', tags: ['前綴和', '雜湊表'], lc: 560,
    fn: 'subarraySum', params: [['nums', 'int[]'], ['k', 'int']], ret: 'int',
    desc: '回傳陣列中「總和等於 <code>k</code>」的<b>連續子陣列</b>個數。陣列可能含有負數。',
    examples: [{ args: [[1, 1, 1], 2] }, { args: [[1, 2, 3], 3] }],
    tests: [[[1], 0], [[0, 0, 0], 0], [[1, -1, 0], 0], [[3, 4, 7, 2, -3, 1, 4, 2], 7]],
    gen: (R, n) => [R.arr(Math.max(1, n), -5, 5), R.int(-5, 8)], rand: [1, 150], big: [30000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [R.arr(n, -1000, 1000), 7] },
    hints: ['子陣列 (i, j] 的和 = prefix[j] − prefix[i]。', '走到 j 時，想知道有幾個 i 使 prefix[i] = prefix[j] − k。', '用雜湊表記錄每個前綴和出現的次數（別忘了 prefix = 0 出現 1 次）。'],
    explain: '前綴和 + 雜湊表計數：每一步查詢 prefix − k 出現過幾次。O(n) 時間、O(n) 空間。滑動視窗在有負數時無法使用。',
    ref: function subarraySum(nums, k) {
      const seen = new Map([[0, 1]]);
      let prefix = 0, count = 0;
      for (const x of nums) {
        prefix += x;
        count += seen.get(prefix - k) || 0;
        seen.set(prefix, (seen.get(prefix) || 0) + 1);
      }
      return count;
    },
    py: `
      def subarraySum(nums, k):
          seen = {0: 1}
          prefix = count = 0
          for x in nums:
              prefix += x
              count += seen.get(prefix - k, 0)
              seen[prefix] = seen.get(prefix, 0) + 1
          return count
    `,
  });

  const rotated = (R, n) => { const a = R.distinct(Math.max(1, n), -1e5, 1e5).sort((x, y) => x - y); const p = R.int(0, a.length - 1); return a.slice(p).concat(a.slice(0, p)); };
  add({
    id: 'search-rotated', title: '旋轉陣列中的搜尋', diff: 'medium', tags: ['二分搜尋'], lc: 33,
    fn: 'search', params: [['nums', 'int[]'], ['target', 'int']], ret: 'int',
    desc: '一個元素互不相同的遞增陣列，在某個未知的位置被「旋轉」了（例如 <code>[0,1,2,4,5,6,7]</code> → <code>[4,5,6,7,0,1,2]</code>）。搜尋 <code>target</code> 的索引，不存在回傳 -1。要求 O(log n)。',
    examples: [{ args: [[4, 5, 6, 7, 0, 1, 2], 0] }, { args: [[4, 5, 6, 7, 0, 1, 2], 3] }, { args: [[1], 0] }],
    tests: [[[1, 3], 3], [[3, 1], 1], [[5, 1, 3], 5], [[4, 5, 6, 7, 8, 1, 2, 3], 8]],
    gen: (R, n) => { const a = rotated(R, n); return [a, R.bool(0.7) ? R.pick(a) : R.int(-1e5, 1e5)]; }, rand: [1, 150],
    cx: { time: 'logn', space: '1', sizes: [1000, 4000, 16000, 64000, 256000], gen: (R, n) => { const p = n >> 2; const a = Array.from({ length: n }, (_, i) => ((i + p) % n) * 2); return [a, 1]; } },
    hints: ['把陣列從中間切開，<b>至少有一半</b>是排好序的。', '判斷 target 是否落在那排好序的一半裡，決定往哪邊走。'],
    explain: '每次二分時，比較 nums[lo] 與 nums[mid] 判斷哪一半有序，再看 target 是否在有序的那半。O(log n)。',
    ref: function search(nums, target) {
      let lo = 0, hi = nums.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[lo] <= nums[mid]) {
          if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
          else lo = mid + 1;
        } else {
          if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
          else hi = mid - 1;
        }
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
              if nums[lo] <= nums[mid]:
                  if nums[lo] <= target < nums[mid]:
                      hi = mid - 1
                  else:
                      lo = mid + 1
              else:
                  if nums[mid] < target <= nums[hi]:
                      lo = mid + 1
                  else:
                      hi = mid - 1
          return -1
    `,
  });

  add({
    id: 'find-min-rotated', title: '旋轉陣列的最小值', diff: 'medium', tags: ['二分搜尋'], lc: 153,
    fn: 'findMin', params: [['nums', 'int[]']], ret: 'int',
    desc: '一個元素互不相同的遞增陣列被旋轉過，找出其中的最小元素。要求 O(log n)。',
    examples: [{ args: [[3, 4, 5, 1, 2]] }, { args: [[4, 5, 6, 7, 0, 1, 2]] }, { args: [[11, 13, 15, 17]] }],
    tests: [[[1]], [[2, 1]], [[1, 2]]],
    gen: (R, n) => [rotated(R, n)], rand: [1, 150],
    cx: { time: 'logn', space: '1', sizes: [1000, 4000, 16000, 64000, 256000], gen: (R, n) => { const p = n >> 2; return [Array.from({ length: n }, (_, i) => (i + p) % n)]; } },
    hints: ['比較 nums[mid] 和 nums[hi]。', '若 nums[mid] > nums[hi]，最小值一定在 mid 右邊；否則在 mid 或其左邊。'],
    explain: '以右端點為參考二分：O(log n) 時間、O(1) 空間。',
    ref: function findMin(nums) {
      let lo = 0, hi = nums.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
      }
      return nums[lo];
    },
    py: `
      def findMin(nums):
          lo, hi = 0, len(nums) - 1
          while lo < hi:
              mid = (lo + hi) // 2
              if nums[mid] > nums[hi]:
                  lo = mid + 1
              else:
                  hi = mid
          return nums[lo]
    `,
  });

  add({
    id: 'jump-game', title: '跳躍之路', diff: 'medium', tags: ['貪婪'], lc: 55,
    fn: 'canJump', params: [['nums', 'int[]']], ret: 'bool',
    desc: '你從索引 0 出發，<code>nums[i]</code> 是在位置 i 時最多能往前跳的步數。判斷能否抵達最後一個索引。',
    examples: [{ args: [[2, 3, 1, 1, 4]] }, { args: [[3, 2, 1, 0, 4]] }],
    tests: [[[0]], [[0, 1]], [[1, 0]], [[2, 0, 0]], [[1, 1, 0, 1]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 0, 3)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1', gen: (R, n) => [Array.from({ length: n }, (_, i) => (i % 5 === 0 ? 5 : 1))] },
    hints: ['記錄目前能到達的最遠位置 farthest。', '走訪每個位置 i：如果 i > farthest 就到不了；否則更新 farthest = max(farthest, i + nums[i])。'],
    explain: '貪婪：維護可達的最遠距離，一次走訪即可。O(n) 時間、O(1) 空間。',
    ref: function canJump(nums) {
      let farthest = 0;
      for (let i = 0; i < nums.length; i++) {
        if (i > farthest) return false;
        farthest = Math.max(farthest, i + nums[i]);
      }
      return true;
    },
    py: `
      def canJump(nums):
          farthest = 0
          for i, x in enumerate(nums):
              if i > farthest:
                  return False
              farthest = max(farthest, i + x)
          return True
    `,
  });

  add({
    id: 'lis', title: '最長遞增子序列', diff: 'medium', tags: ['動態規劃', '二分搜尋'], lc: 300,
    fn: 'lengthOfLIS', params: [['nums', 'int[]']], ret: 'int',
    desc: '回傳陣列中<b>嚴格遞增</b>子序列的最大長度（子序列不需連續，但要保持原順序）。進階：O(n log n)。',
    examples: [{ args: [[10, 9, 2, 5, 3, 7, 101, 18]], note: '[2,3,7,101]' }, { args: [[0, 1, 0, 3, 2, 3]] }, { args: [[7, 7, 7, 7]] }],
    tests: [[[1]], [[5, 4, 3]], [[1, 3, 6, 7, 9, 4, 10, 5, 6]]],
    gen: (R, n) => [R.arr(Math.max(1, n), -100, 100)], rand: [1, 150], big: [8000],
    cx: { time: 'nlogn', space: 'n', gen: (R, n) => [R.distinct(n, -1e7, 1e7).sort((a, b) => a - b)], note: '最壞情況：整個陣列遞增' },
    hints: ['O(n²) DP：dp[i] = 以 nums[i] 結尾的 LIS 長度。', 'O(n log n)：維護 tails 陣列，tails[k] = 長度 k+1 的遞增子序列的最小結尾。', '對每個數用二分搜尋找到它在 tails 中的位置並取代。'],
    explain: '「耐心排序」：tails 保持遞增，每個數用二分搜尋放進去（取代第一個 ≥ 它的位置或接在尾端）。O(n log n)。',
    ref: function lengthOfLIS(nums) {
      const tails = [];
      for (const x of nums) {
        let lo = 0, hi = tails.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (tails[mid] < x) lo = mid + 1;
          else hi = mid;
        }
        tails[lo] = x;
      }
      return tails.length;
    },
    py: `
      def lengthOfLIS(nums):
          tails = []
          for x in nums:
              i = bisect_left(tails, x)
              if i == len(tails):
                  tails.append(x)
              else:
                  tails[i] = x
          return len(tails)
    `,
  });

  add({
    id: 'word-break', title: '拆解咒語', diff: 'medium', tags: ['動態規劃', '字串'], lc: 139,
    fn: 'wordBreak', params: [['s', 'string'], ['wordDict', 'string[]']], ret: 'bool',
    desc: '判斷字串 <code>s</code> 能否被拆分成一個或多個字典 <code>wordDict</code> 中的單字（單字可重複使用）。',
    examples: [{ args: ['leetcode', ['leet', 'code']] }, { args: ['applepenapple', ['apple', 'pen']] }, { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']] }],
    tests: [['a', ['b']], ['aaaaaaa', ['aaaa', 'aaa']], ['cars', ['car', 'ca', 'rs']]],
    gen: (R, n) => { const dict = Array.from({ length: R.int(1, 5) }, () => R.str(R.int(1, 4), 'ab')); let s = ''; while (s.length < n) s += R.pick(dict); if (R.bool(0.4)) s += 'b'; return [s, dict]; }, rand: [1, 60], big: [3000],
    cx: { time: 'n', space: 'n', sizes: [100, 200, 400, 800, 1600, 3200], gen: (R, n) => ['a'.repeat(n) + 'b', ['a', 'aa', 'aaa', 'aaaa']], labels: { n: 'O(n·L)' }, note: 'L = 字典中最長單字長度（量測時固定）' },
    hints: ['dp[i] = s 的前 i 個字元能否被拆解。', 'dp[i] 為真，若存在 j 使 dp[j] 為真且 s[j:i] 在字典中。', '優化：只需要往回看「最長單字長度」那麼遠。'],
    explain: 'DP + 集合：對每個結尾位置 i，只往回檢查長度 ≤ L 的單字。O(n·L²)（含子字串比對），L 為常數時即 O(n)。',
    ref: function wordBreak(s, wordDict) {
      const dict = new Set(wordDict);
      let maxLen = 0;
      for (const w of wordDict) maxLen = Math.max(maxLen, w.length);
      const dp = new Array(s.length + 1).fill(false);
      dp[0] = true;
      for (let i = 1; i <= s.length; i++) {
        for (let j = Math.max(0, i - maxLen); j < i; j++) {
          if (dp[j] && dict.has(s.slice(j, i))) { dp[i] = true; break; }
        }
      }
      return dp[s.length];
    },
    py: `
      def wordBreak(s, wordDict):
          words = set(wordDict)
          max_len = max(len(w) for w in wordDict)
          dp = [False] * (len(s) + 1)
          dp[0] = True
          for i in range(1, len(s) + 1):
              for j in range(max(0, i - max_len), i):
                  if dp[j] and s[j:i] in words:
                      dp[i] = True
                      break
          return dp[len(s)]
    `,
  });

  add({
    id: 'decode-ways', title: '密碼解讀', diff: 'medium', tags: ['動態規劃', '字串'], lc: 91,
    fn: 'numDecodings', params: [['s', 'string']], ret: 'int',
    desc: '字母編碼為 A→"1"、B→"2"、…、Z→"26"。給定只含數字的字串 <code>s</code>，回傳解碼的方法數（"06" 不是合法編碼）。',
    examples: [{ args: ['12'], note: '"AB"(1 2) 或 "L"(12)' }, { args: ['226'] }, { args: ['06'] }],
    tests: [['0'], ['10'], ['27'], ['11106'], ['2101'], ['1201234']],
    gen: (R, n) => [R.str(Math.max(1, Math.min(n, 40)), '1112260')], rand: [1, 40],
    cx: { time: 'n', space: '1', gen: (R, n) => [R.str(n, '12')] },
    hints: ['dp[i] = 前 i 個字元的解碼方法數。', '單獨解碼 s[i−1]（不是 "0"）：加上 dp[i−1]；把 s[i−2..i−1] 當成 10～26：加上 dp[i−2]。', '只依賴前兩項，可壓縮成 O(1) 空間。'],
    explain: '類似爬樓梯的 DP，但要處理 0 與 10～26 的限制。O(n) 時間、O(1) 空間。',
    ref: function numDecodings(s) {
      let prev2 = 1, prev1 = s[0] === '0' ? 0 : 1;
      for (let i = 2; i <= s.length; i++) {
        let cur = 0;
        if (s[i - 1] !== '0') cur += prev1;
        const two = Number(s.slice(i - 2, i));
        if (two >= 10 && two <= 26) cur += prev2;
        prev2 = prev1;
        prev1 = cur;
      }
      return prev1;
    },
    py: `
      def numDecodings(s):
          prev2, prev1 = 1, (0 if s[0] == "0" else 1)
          for i in range(2, len(s) + 1):
              cur = 0
              if s[i - 1] != "0":
                  cur += prev1
              if 10 <= int(s[i - 2:i]) <= 26:
                  cur += prev2
              prev2, prev1 = prev1, cur
          return prev1
    `,
  });

  add({
    id: 'max-subarray', title: '最大子陣列和', diff: 'medium', tags: ['動態規劃', 'Kadane'], lc: 53,
    fn: 'maxSubArray', params: [['nums', 'int[]']], ret: 'int',
    desc: '找出和最大的<b>非空連續子陣列</b>，回傳它的和。',
    examples: [{ args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], note: '[4,-1,2,1] 的和為 6' }, { args: [[1]] }, { args: [[5, 4, -1, 7, 8]] }],
    tests: [[[-1]], [[-3, -2, -5]], [[0, -1, 0]]],
    gen: (R, n) => [R.arr(Math.max(1, n), -100, 100)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['以 i 結尾的最大和，要嘛是 nums[i] 自己，要嘛是「以 i−1 結尾的最大和 + nums[i]」。', '這就是 Kadane 演算法。'],
    explain: 'Kadane：cur = max(x, cur + x)，best = max(best, cur)。O(n) 時間、O(1) 空間。',
    ref: function maxSubArray(nums) {
      let cur = nums[0], best = nums[0];
      for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
      }
      return best;
    },
    py: `
      def maxSubArray(nums):
          cur = best = nums[0]
          for i in range(1, len(nums)):
              x = nums[i]
              cur = max(x, cur + x)
              best = max(best, cur)
          return best
    `,
  });

  const square = (R, n, lo, hi) => Array.from({ length: n }, () => R.arr(n, lo, hi));
  add({
    id: 'rotate-image', title: '旋轉魔法陣', diff: 'medium', tags: ['二維陣列', '矩陣'], lc: 48,
    fn: 'rotate', params: [['matrix', 'int[][]']], ret: 'void', inplace: 0,
    desc: '將 <code>n × n</code> 的矩陣<b>順時針旋轉 90 度</b>。必須<b>原地</b>修改，不要配置另一個矩陣。',
    examples: [{ args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]] }, { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]] }],
    tests: [[[[1]]], [[[1, 2], [3, 4]]]],
    gen: (R, n) => [square(R, Math.max(1, Math.min(n, 20)), -100, 100)], rand: [1, 20],
    cx: { time: 'n^2', space: '1', sizes: [8, 16, 32, 64, 128], gen: (R, n) => [square(R, n, 0, 9)], note: 'n = 矩陣邊長' },
    hints: ['順時針旋轉 = 先「轉置」（沿主對角線翻轉），再把每一列「左右翻轉」。'],
    explain: '轉置後每列反轉，皆可原地完成：O(n²) 時間、O(1) 空間。',
    ref: function rotate(matrix) {
      const n = matrix.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const t = matrix[i][j];
          matrix[i][j] = matrix[j][i];
          matrix[j][i] = t;
        }
      }
      for (const row of matrix) {
        for (let l = 0, r = n - 1; l < r; l++, r--) {
          const t = row[l];
          row[l] = row[r];
          row[r] = t;
        }
      }
    },
    py: `
      def rotate(matrix):
          n = len(matrix)
          for i in range(n):
              for j in range(i + 1, n):
                  matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
          for row in matrix:
              l, r = 0, n - 1
              while l < r:
                  row[l], row[r] = row[r], row[l]
                  l += 1
                  r -= 1
    `,
  });

  add({
    id: 'spiral-matrix', title: '螺旋迴廊', diff: 'medium', tags: ['二維陣列', '模擬'], lc: 54,
    fn: 'spiralOrder', params: [['matrix', 'int[][]']], ret: 'int[]',
    desc: '依照<b>順時針螺旋</b>順序，回傳 <code>m × n</code> 矩陣中的所有元素。',
    examples: [{ args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]] }, { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]] }],
    tests: [[[[1]]], [[[1, 2, 3]]], [[[1], [2], [3]]], [[[1, 2], [3, 4], [5, 6]]]],
    gen: (R, n) => { const r = R.int(1, Math.max(1, Math.min(n, 12))); const c = R.int(1, Math.max(1, Math.min(n, 12))); return [Array.from({ length: r }, () => R.arr(c, -50, 50))]; }, rand: [1, 12],
    cx: { time: 'n', space: 'n', labels: { n: 'O(m·n)' }, sizes: [64, 256, 1024, 4096, 16384], gen: (R, n) => { const s = Math.round(Math.sqrt(n)); return [square(R, s, 0, 9)]; }, note: 'n = 元素總數；輸出陣列佔 O(m·n)' },
    hints: ['維護四個邊界 top、bottom、left、right。', '依序走：上邊（左→右）、右邊（上→下）、下邊（右→左）、左邊（下→上），每走完一邊就收縮該邊界。'],
    explain: '邊界收縮模擬，每個元素恰好拜訪一次：O(m·n) 時間。',
    ref: function spiralOrder(matrix) {
      const res = [];
      let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
      while (top <= bottom && left <= right) {
        for (let j = left; j <= right; j++) res.push(matrix[top][j]);
        top++;
        for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
        right--;
        if (top <= bottom) { for (let j = right; j >= left; j--) res.push(matrix[bottom][j]); bottom--; }
        if (left <= right) { for (let i = bottom; i >= top; i--) res.push(matrix[i][left]); left++; }
      }
      return res;
    },
    py: `
      def spiralOrder(matrix):
          res = []
          top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
          while top <= bottom and left <= right:
              for j in range(left, right + 1):
                  res.append(matrix[top][j])
              top += 1
              for i in range(top, bottom + 1):
                  res.append(matrix[i][right])
              right -= 1
              if top <= bottom:
                  for j in range(right, left - 1, -1):
                      res.append(matrix[bottom][j])
                  bottom -= 1
              if left <= right:
                  for i in range(bottom, top - 1, -1):
                      res.append(matrix[i][left])
                  left += 1
          return res
    `,
  });

  add({
    id: 'longest-palindrome', title: '最長迴文子字串', diff: 'medium', tags: ['字串', '中心擴展', '動態規劃'], lc: 5,
    fn: 'longestPalindrome', params: [['s', 'string']], ret: 'string',
    desc: '回傳字串 <code>s</code> 中最長的<b>迴文子字串</b>（若有多個相同長度，回傳任一個）。',
    examples: [{ args: ['babad'], note: '"bab" 或 "aba"' }, { args: ['cbbd'] }],
    tests: [['a'], ['ac'], ['aaaa'], ['forgeeksskeegfor']],
    gen: (R, n) => [R.str(Math.max(1, n), 'abc')], rand: [1, 80], big: [2000],
    check: (out, args, exp) => { const s = args[0]; return typeof out === 'string' && out.length === exp.length && s.includes(out) && out === out.split('').reverse().join(''); },
    cx: { time: 'n^2', space: 'n', sizes: [50, 100, 200, 400, 800], gen: (R, n) => ['a'.repeat(n)], note: '最壞情況：全部相同字元（回傳的字串佔 O(n)；Manacher 演算法可達 O(n) 時間）' },
    hints: ['迴文以「中心」對稱。中心可能是一個字元，也可能在兩個字元之間（共 2n−1 個中心）。', '從每個中心向兩邊擴展，直到兩邊不相等。'],
    explain: '中心擴展法：2n−1 個中心各擴展最多 O(n)：O(n²) 時間、O(1) 空間。',
    ref: function longestPalindrome(s) {
      let start = 0, len = 0;
      const expand = (l, r) => {
        while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
        if (r - l - 1 > len) { len = r - l - 1; start = l + 1; }
      };
      for (let i = 0; i < s.length; i++) {
        expand(i, i);
        expand(i, i + 1);
      }
      return s.slice(start, start + len);
    },
    py: `
      def longestPalindrome(s):
          start, length = 0, 0
          for c in range(2 * len(s) - 1):
              l, r = c // 2, c // 2 + c % 2
              while l >= 0 and r < len(s) and s[l] == s[r]:
                  l -= 1
                  r += 1
              if r - l - 1 > length:
                  start, length = l + 1, r - l - 1
          return s[start:start + length]
    `,
  });

  add({
    id: 'sort-colors', title: '三色旗', diff: 'medium', tags: ['雙指標', '排序'], lc: 75,
    fn: 'sortColors', params: [['nums', 'int[]']], ret: 'void', inplace: 0,
    desc: '陣列只包含 0、1、2（紅、白、藍）。請<b>原地</b>排序使相同顏色相鄰，順序為 0、1、2。不能使用內建排序。進階：只走訪一次、O(1) 空間。',
    examples: [{ args: [[2, 0, 2, 1, 1, 0]] }, { args: [[2, 0, 1]] }],
    tests: [[[0]], [[2, 2]], [[1, 0]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 0, 2)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1' },
    hints: ['荷蘭國旗問題：用三個指標 low、mid、high。', 'nums[mid] 是 0 就和 low 交換；是 2 就和 high 交換（mid 不動）；是 1 就跳過。'],
    explain: 'Dijkstra 的三路分割：一次走訪 O(n)、O(1) 空間。',
    ref: function sortColors(nums) {
      let low = 0, mid = 0, high = nums.length - 1;
      while (mid <= high) {
        if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }
        else if (nums[mid] === 2) { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }
        else mid++;
      }
    },
    py: `
      def sortColors(nums):
          low, mid, high = 0, 0, len(nums) - 1
          while mid <= high:
              if nums[mid] == 0:
                  nums[low], nums[mid] = nums[mid], nums[low]
                  low += 1
                  mid += 1
              elif nums[mid] == 2:
                  nums[mid], nums[high] = nums[high], nums[mid]
                  high -= 1
              else:
                  mid += 1
    `,
  });

  add({
    id: 'min-path-sum', title: '最省力的路線', diff: 'medium', tags: ['動態規劃', '網格'], lc: 64,
    fn: 'minPathSum', params: [['grid', 'int[][]']], ret: 'int',
    desc: '在 <code>m × n</code> 的網格中，從左上角走到右下角，每次只能向<b>右</b>或向<b>下</b>。回傳路徑上數字總和的最小值。',
    examples: [{ args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], note: '1→3→1→1→1 = 7' }, { args: [[[1, 2, 3], [4, 5, 6]]] }],
    tests: [[[[5]]], [[[1, 2]]], [[[1], [2]]]],
    gen: (R, n) => { const r = R.int(1, Math.max(1, Math.min(n, 15))); const c = R.int(1, Math.max(1, Math.min(n, 15))); return [Array.from({ length: r }, () => R.arr(c, 0, 9))]; }, rand: [1, 15],
    cx: { time: 'n', space: 'sqrtn', labels: { n: 'O(m·n)', sqrtn: 'O(n)' }, sizes: [64, 256, 1024, 4096, 16384], gen: (R, n) => { const s = Math.round(Math.sqrt(n)); return [square(R, s, 0, 9)]; }, note: 'n = 格子總數；只保留一列 DP 為 O(n)，直接在 grid 上 DP 為 O(1)' },
    hints: ['dp[i][j] = grid[i][j] + min(dp[i−1][j], dp[i][j−1])。', '第一列只能從左邊來、第一行只能從上面來。'],
    explain: '網格 DP，可以直接覆寫 grid 或只保留一列。O(m·n) 時間。',
    ref: function minPathSum(grid) {
      const m = grid.length, n = grid[0].length;
      const dp = new Array(n).fill(Infinity);
      dp[0] = 0;
      for (let i = 0; i < m; i++) {
        dp[0] += grid[i][0];
        for (let j = 1; j < n; j++) dp[j] = grid[i][j] + Math.min(dp[j], dp[j - 1]);
      }
      return dp[n - 1];
    },
    py: `
      def minPathSum(grid):
          m, n = len(grid), len(grid[0])
          for i in range(m):
              for j in range(n):
                  if i == 0 and j == 0:
                      continue
                  up = grid[i - 1][j] if i > 0 else float("inf")
                  left = grid[i][j - 1] if j > 0 else float("inf")
                  grid[i][j] += min(up, left)
          return grid[m - 1][n - 1]
    `,
  });

  /* ============================== HARD ============================== */
  add({
    id: 'min-window', title: '最小覆蓋子字串', diff: 'hard', tags: ['滑動視窗', '雜湊表'], lc: 76,
    fn: 'minWindow', params: [['s', 'string'], ['t', 'string']], ret: 'string',
    desc: '回傳 <code>s</code> 中<b>涵蓋 t 所有字元</b>（含重複次數）的最短子字串；不存在則回傳 <code>""</code>。',
    examples: [{ args: ['ADOBECODEBANC', 'ABC'], note: '"BANC"' }, { args: ['a', 'a'] }, { args: ['a', 'aa'] }],
    tests: [['ab', 'b'], ['bba', 'ab'], ['aa', 'aa'], ['cabwefgewcwaefgcf', 'cae']],
    gen: (R, n) => [R.str(Math.max(1, n), 'abcde'), R.str(R.int(1, 4), 'abcde')], rand: [1, 120], big: [40000],
    check: (out, args, exp) => {
      const [s, t] = args;
      if (typeof out !== 'string' || out.length !== exp.length) return false;
      if (exp === '') return out === '';
      if (!s.includes(out)) return false;
      const need = {}; for (const c of t) need[c] = (need[c] || 0) + 1;
      for (const c of out) if (need[c]) need[c]--;
      return Object.values(need).every((v) => v === 0);
    },
    cx: { time: 'n', space: '1', gen: (R, n) => [R.str(n, 'abcdefgh'), 'abch'], note: '字元集固定' },
    hints: ['滑動視窗：右指標擴張直到視窗包含 t 的所有字元。', '接著左指標盡量收縮，同時更新最短答案。', '用計數表 need 與一個變數 missing（還缺幾個字元）來快速判斷。'],
    explain: '可變長度滑動視窗，左右指標各最多走 n 步：O(|s| + |t|) 時間。',
    ref: function minWindow(s, t) {
      const need = new Map();
      for (const c of t) need.set(c, (need.get(c) || 0) + 1);
      let missing = t.length, left = 0, bestL = 0, bestLen = Infinity;
      for (let right = 0; right < s.length; right++) {
        const c = s[right];
        if (need.has(c)) { if (need.get(c) > 0) missing--; need.set(c, need.get(c) - 1); }
        while (missing === 0) {
          if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestL = left; }
          const d = s[left++];
          if (need.has(d)) { need.set(d, need.get(d) + 1); if (need.get(d) > 0) missing++; }
        }
      }
      return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
    },
    py: `
      def minWindow(s, t):
          need = Counter(t)
          missing = len(t)
          left = best_l = 0
          best_len = float("inf")
          for right, c in enumerate(s):
              if c in need:
                  if need[c] > 0:
                      missing -= 1
                  need[c] -= 1
              while missing == 0:
                  if right - left + 1 < best_len:
                      best_len, best_l = right - left + 1, left
                  d = s[left]
                  left += 1
                  if d in need:
                      need[d] += 1
                      if need[d] > 0:
                          missing += 1
          return "" if best_len == float("inf") else s[best_l:best_l + best_len]
    `,
  });

  add({
    id: 'largest-rectangle', title: '直方圖中的最大矩形', diff: 'hard', tags: ['單調堆疊'], lc: 84,
    fn: 'largestRectangleArea', params: [['heights', 'int[]']], ret: 'int',
    desc: '<code>heights</code> 是寬度為 1 的長條高度，回傳直方圖中能勾勒出的<b>最大矩形面積</b>。',
    examples: [{ args: [[2, 1, 5, 6, 2, 3]], note: '5 和 6 兩根組成 5×2 = 10' }, { args: [[2, 4]] }],
    tests: [[[1]], [[0]], [[2, 2, 2]], [[6, 2, 5, 4, 5, 1, 6]], [[1, 2, 3, 4, 5]]],
    gen: (R, n) => [R.arr(Math.max(1, n), 0, 50)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [Array.from({ length: n }, (_, i) => i + 1)] },
    hints: ['以每根長條為「矩形高度」，要找它往左、往右能延伸多遠（遇到比它矮的就停）。', '單調遞增堆疊：遇到較矮的長條時，彈出的長條就找到了右邊界，而堆疊中它下面的元素就是左邊界。'],
    explain: '單調遞增堆疊：每根長條進出堆疊各一次，彈出時計算以它為高的最大矩形。O(n) 時間、O(n) 空間。',
    ref: function largestRectangleArea(heights) {
      const stack = [];
      let best = 0;
      for (let i = 0; i <= heights.length; i++) {
        const h = i === heights.length ? 0 : heights[i];
        while (stack.length && heights[stack[stack.length - 1]] >= h) {
          const height = heights[stack.pop()];
          const left = stack.length ? stack[stack.length - 1] + 1 : 0;
          best = Math.max(best, height * (i - left));
        }
        stack.push(i);
      }
      return best;
    },
    py: `
      def largestRectangleArea(heights):
          stack = []
          best = 0
          for i in range(len(heights) + 1):
              h = 0 if i == len(heights) else heights[i]
              while stack and heights[stack[-1]] >= h:
                  height = heights[stack.pop()]
                  left = stack[-1] + 1 if stack else 0
                  best = max(best, height * (i - left))
              stack.append(i)
          return best
    `,
  });

  add({
    id: 'edit-distance', title: '編輯距離', diff: 'hard', tags: ['動態規劃', '字串'], lc: 72,
    fn: 'minDistance', params: [['word1', 'string'], ['word2', 'string']], ret: 'int',
    desc: '把 <code>word1</code> 轉換成 <code>word2</code> 所需的最少操作次數。可用的操作：插入一個字元、刪除一個字元、替換一個字元。',
    examples: [{ args: ['horse', 'ros'], note: 'horse → rorse → rose → ros' }, { args: ['intention', 'execution'] }],
    tests: [['', ''], ['', 'abc'], ['abc', ''], ['abc', 'abc'], ['kitten', 'sitting']],
    gen: (R, n) => [R.str(R.int(0, n), 'abc'), R.str(R.int(0, n), 'abc')], rand: [0, 40], big: [600],
    cx: { time: 'n^2', space: 'n', sizes: [16, 32, 64, 128, 256, 512], gen: (R, n) => [R.str(n, 'abcd'), R.str(n, 'abcd')], labels: { 'n^2': 'O(m·n)', n: 'O(n)' }, note: '以 m = n 量測；二維 DP 為 O(m·n) 空間，滾動陣列為 O(n)' },
    hints: ['dp[i][j] = word1 前 i 個字元轉成 word2 前 j 個字元的最少步數。', '若 word1[i−1] == word2[j−1]：dp[i][j] = dp[i−1][j−1]；否則 = 1 + min(刪除, 插入, 替換)。', '只依賴上一列：可用兩個一維陣列。'],
    explain: '經典二維 DP：O(m·n) 時間；用滾動陣列可降到 O(n) 空間。',
    ref: function minDistance(word1, word2) {
      const m = word1.length, n = word2.length;
      let prev = Array.from({ length: n + 1 }, (_, j) => j);
      for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) {
          if (word1[i - 1] === word2[j - 1]) cur[j] = prev[j - 1];
          else cur[j] = 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
        }
        prev = cur;
      }
      return prev[n];
    },
    py: `
      def minDistance(word1, word2):
          m, n = len(word1), len(word2)
          prev = list(range(n + 1))
          for i in range(1, m + 1):
              cur = [i] + [0] * n
              for j in range(1, n + 1):
                  if word1[i - 1] == word2[j - 1]:
                      cur[j] = prev[j - 1]
                  else:
                      cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
              prev = cur
          return prev[n]
    `,
  });

  add({
    id: 'sliding-window-max', title: '滑動視窗最大值', diff: 'hard', tags: ['單調佇列', '滑動視窗'], lc: 239,
    fn: 'maxSlidingWindow', params: [['nums', 'int[]'], ['k', 'int']], ret: 'int[]',
    desc: '大小為 <code>k</code> 的視窗從陣列最左邊滑到最右邊，每次移動一格。回傳每個視窗中的最大值。',
    examples: [{ args: [[1, 3, -1, -3, 5, 3, 6, 7], 3] }, { args: [[1], 1] }],
    tests: [[[1, -1], 1], [[9, 8, 7, 6], 2], [[1, 2, 3, 4], 4]],
    gen: (R, n) => { n = Math.max(1, n); return [R.arr(n, -100, 100), R.int(1, n)]; }, rand: [1, 150], big: [40000],
    cx: { time: 'n', space: 'n', gen: (R, n) => [R.arr(n, -1e5, 1e5), Math.max(1, n >> 2)], note: '量測時 k = n/4；回傳陣列佔 O(n)' },
    hints: ['暴力法 O(n·k)；堆積法 O(n log n)。', '單調遞減的雙端佇列（存索引）：新元素進來前，把隊尾比它小的都踢掉。', '隊頭若已滑出視窗就移除；隊頭永遠是目前視窗的最大值。'],
    explain: '單調佇列：每個索引最多進出一次，O(n) 時間。JS 沒有內建 deque，可以用陣列 + 頭指標模擬。',
    ref: function maxSlidingWindow(nums, k) {
      const dq = new Array(nums.length);
      let head = 0, tail = 0;
      const res = [];
      for (let i = 0; i < nums.length; i++) {
        while (tail > head && nums[dq[tail - 1]] <= nums[i]) tail--;
        dq[tail++] = i;
        if (dq[head] <= i - k) head++;
        if (i >= k - 1) res.push(nums[dq[head]]);
      }
      return res;
    },
    py: `
      def maxSlidingWindow(nums, k):
          dq = deque()
          res = []
          for i, x in enumerate(nums):
              while dq and nums[dq[-1]] <= x:
                  dq.pop()
              dq.append(i)
              if dq[0] <= i - k:
                  dq.popleft()
              if i >= k - 1:
                  res.append(nums[dq[0]])
          return res
    `,
  });

  add({
    id: 'longest-valid-parentheses', title: '最長有效括號', diff: 'hard', tags: ['堆疊', '動態規劃'], lc: 32,
    fn: 'longestValidParentheses', params: [['s', 'string']], ret: 'int',
    desc: '字串只包含 <code>(</code> 與 <code>)</code>，回傳<b>最長的有效（格式正確且連續）括號子字串</b>的長度。',
    examples: [{ args: ['(()'] }, { args: [')()())'] }, { args: [''] }],
    tests: [['()(()'], ['()(())'], ['(((('], ['))(('], ['(()())']],
    gen: (R, n) => [R.str(n, '(()')], rand: [0, 150], big: [40000],
    cx: { time: 'n', space: 'n', gen: (R, n) => ['('.repeat(n >> 1) + ')'.repeat(n >> 1)] },
    hints: ['用堆疊存放索引，堆疊底部放一個「分隔點」−1。', '遇到 "(" 推入索引；遇到 ")" 彈出，若堆疊空了就把目前索引當新的分隔點；否則長度 = i − 堆疊頂端。'],
    explain: '堆疊記錄「最後一個無法配對的位置」，每次成功配對就用目前索引減去它得到長度。O(n) 時間。',
    ref: function longestValidParentheses(s) {
      const stack = [-1];
      let best = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') stack.push(i);
        else {
          stack.pop();
          if (stack.length === 0) stack.push(i);
          else best = Math.max(best, i - stack[stack.length - 1]);
        }
      }
      return best;
    },
    py: `
      def longestValidParentheses(s):
          stack = [-1]
          best = 0
          for i, ch in enumerate(s):
              if ch == "(":
                  stack.append(i)
              else:
                  stack.pop()
                  if not stack:
                      stack.append(i)
                  else:
                      best = max(best, i - stack[-1])
          return best
    `,
  });

  add({
    id: 'first-missing-positive', title: '缺失的第一個正數', diff: 'hard', tags: ['陣列', '原地雜湊'], lc: 41,
    fn: 'firstMissingPositive', params: [['nums', 'int[]']], ret: 'int',
    desc: '給定未排序的整數陣列，找出其中<b>沒有出現的最小正整數</b>。要求 O(n) 時間、O(1) 額外空間。',
    examples: [{ args: [[1, 2, 0]] }, { args: [[3, 4, -1, 1]] }, { args: [[7, 8, 9, 11, 12]] }],
    tests: [[[1]], [[2]], [[1, 1]], [[2, 1]], [[-5]]],
    gen: (R, n) => [R.arr(Math.max(1, n), -3, n + 2)], rand: [1, 150], big: [40000],
    cx: { time: 'n', space: '1', gen: (R, n) => [R.shuffle(Array.from({ length: n }, (_, i) => i + 1))] },
    hints: ['答案一定在 1 到 n+1 之間。', '把數字 x（1 ≤ x ≤ n）放到索引 x−1 的位置（用交換，「原地雜湊」）。', '最後第一個 nums[i] ≠ i+1 的位置，答案就是 i+1。'],
    explain: '循環交換把每個 x 放到 x−1 的位置，每次交換都讓一個數歸位，總交換次數 ≤ n。O(n) 時間、O(1) 空間。',
    ref: function firstMissingPositive(nums) {
      const n = nums.length;
      for (let i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
          const j = nums[i] - 1;
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }
      }
      for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
      return n + 1;
    },
    py: `
      def firstMissingPositive(nums):
          n = len(nums)
          for i in range(n):
              while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                  j = nums[i] - 1
                  nums[i], nums[j] = nums[j], nums[i]
          for i in range(n):
              if nums[i] != i + 1:
                  return i + 1
          return n + 1
    `,
  });

  add({
    id: 'n-queens-ii', title: 'N 皇后', diff: 'hard', tags: ['回溯'], lc: 52,
    fn: 'totalNQueens', params: [['n', 'int']], ret: 'int',
    desc: '在 <code>n × n</code> 棋盤上放 n 個皇后，使任兩個皇后都不在同一列、同一行或同一斜線上。回傳不同解法的數量。（1 ≤ n ≤ 9）',
    examples: [{ args: [4] }, { args: [1] }],
    tests: [[2], [3], [5], [6], [8]],
    gen: (R) => [R.int(1, 8)], randCount: 4,
    cx: { time: 'n!', space: 'n', exponential: true, sizes: [4, 5, 6, 7, 8, 9], gen: (R, n) => [n], note: '回溯的搜尋樹大小以 n! 為上界（剪枝後實際更小）' },
    hints: ['一列放一個皇后，逐列回溯。', '用三個集合記錄被佔用的：行、主對角線 (r − c)、副對角線 (r + c)。'],
    explain: '逐列回溯並用集合 O(1) 檢查衝突，搜尋空間約 O(n!)。',
    ref: function totalNQueens(n) {
      const cols = new Set(), d1 = new Set(), d2 = new Set();
      let count = 0;
      function place(r) {
        if (r === n) { count++; return; }
        for (let c = 0; c < n; c++) {
          if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
          cols.add(c); d1.add(r - c); d2.add(r + c);
          place(r + 1);
          cols.delete(c); d1.delete(r - c); d2.delete(r + c);
        }
      }
      place(0);
      return count;
    },
    py: `
      def totalNQueens(n):
          cols, d1, d2 = set(), set(), set()
          count = 0
          def place(r):
              nonlocal count
              if r == n:
                  count += 1
                  return
              for c in range(n):
                  if c in cols or r - c in d1 or r + c in d2:
                      continue
                  cols.add(c); d1.add(r - c); d2.add(r + c)
                  place(r + 1)
                  cols.remove(c); d1.remove(r - c); d2.remove(r + c)
          place(0)
          return count
    `,
  });

  add({
    id: 'merge-k-lists', title: '合併 K 條鎖鏈', diff: 'hard', tags: ['鏈結串列', '堆積', '分治'], lc: 23,
    fn: 'mergeKLists', params: [['lists', 'ListNode[]']], ret: 'ListNode',
    desc: '給定 k 條<b>已排序</b>的鏈結串列，把它們合併成一條排序的串列並回傳。',
    examples: [{ args: [[[1, 4, 5], [1, 3, 4], [2, 6]]] }, { args: [[]] }, { args: [[[]]] }],
    tests: [[[[1], [0]]], [[[], [1, 2], []]]],
    gen: (R, n) => [Array.from({ length: R.int(0, Math.max(1, n >> 2)) }, () => sorted(R.arr(R.int(0, 6), -50, 50)))], rand: [1, 80], big: [4000],
    cx: { time: 'nlogn', space: 'n', gen: (R, n) => [Array.from({ length: Math.max(1, n >> 3) }, () => sorted(R.arr(8, 0, 1e6)))], labels: { nlogn: 'O(N log k)', n: 'O(k)' }, note: 'N = 節點總數；量測時 k = N/8' },
    hints: ['兩兩依序合併會是 O(k·N)。', '用最小堆積存放每條串列目前的頭節點，每次取出最小的。', '或者分治：兩兩配對合併，共 log k 輪。'],
    explain: '最小堆積大小為 k，每個節點進出堆積一次：O(N log k)。分治合併同樣 O(N log k)。',
    ref: function mergeKLists(lists) {
      function mergeTwo(a, b) {
        const dummy = new ListNode(0);
        let t = dummy;
        while (a && b) {
          if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; }
          t = t.next;
        }
        t.next = a || b;
        return dummy.next;
      }
      if (!lists.length) return null;
      let step = 1;
      while (step < lists.length) {
        for (let i = 0; i + step < lists.length; i += step * 2) lists[i] = mergeTwo(lists[i], lists[i + step]);
        step *= 2;
      }
      return lists[0];
    },
    py: `
      def mergeKLists(lists):
          heap = []
          for i, node in enumerate(lists):
              if node:
                  heappush(heap, (node.val, i, node))
          dummy = tail = ListNode(0)
          while heap:
              val, i, node = heappop(heap)
              tail.next = node
              tail = node
              if node.next:
                  heappush(heap, (node.next.val, i, node.next))
          return dummy.next
    `,
  });

  add({
    id: 'median-two-arrays', title: '兩個排序陣列的中位數', diff: 'hard', tags: ['二分搜尋', '分治'], lc: 4,
    fn: 'findMedianSortedArrays', params: [['nums1', 'int[]'], ['nums2', 'int[]']], ret: 'float',
    desc: '給定兩個已排序的陣列，回傳合併後的<b>中位數</b>。要求 O(log(m+n)) 時間。',
    examples: [{ args: [[1, 3], [2]] }, { args: [[1, 2], [3, 4]], note: '(2 + 3) / 2 = 2.5' }],
    tests: [[[], [1]], [[2], []], [[1, 1], [1, 1]], [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 12]]],
    gen: (R, n) => { const a = sorted(R.arr(R.int(0, n), -1000, 1000)); let b = sorted(R.arr(R.int(0, n), -1000, 1000)); if (!a.length && !b.length) b = [R.int(-5, 5)]; return [a, b]; }, rand: [0, 100], big: [20000],
    cmp: 'float',
    cx: { time: 'logn', space: '1', sizes: [1000, 4000, 16000, 64000, 256000], gen: (R, n) => [Array.from({ length: n }, (_, i) => i), Array.from({ length: n + 1 }, (_, i) => n + i)], labels: { logn: 'O(log(m+n))' } },
    hints: ['合併後找中位數是 O(m+n)。', '在較短的陣列上二分「切割點」i，另一個陣列的切割點 j 由總長度決定。', '正確的切割滿足：左半部最大值 ≤ 右半部最小值。'],
    explain: '在較短陣列上二分切割位置，使兩邊左半的元素總數等於一半且 maxLeft ≤ minRight。O(log(min(m, n)))。',
    ref: function findMedianSortedArrays(nums1, nums2) {
      if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
      const m = nums1.length, n = nums2.length, half = (m + n + 1) >> 1;
      let lo = 0, hi = m;
      while (lo <= hi) {
        const i = (lo + hi) >> 1, j = half - i;
        const aL = i > 0 ? nums1[i - 1] : -Infinity, aR = i < m ? nums1[i] : Infinity;
        const bL = j > 0 ? nums2[j - 1] : -Infinity, bR = j < n ? nums2[j] : Infinity;
        if (aL <= bR && bL <= aR) {
          if ((m + n) % 2) return Math.max(aL, bL);
          return (Math.max(aL, bL) + Math.min(aR, bR)) / 2;
        }
        if (aL > bR) hi = i - 1;
        else lo = i + 1;
      }
      return 0;
    },
    py: `
      def findMedianSortedArrays(nums1, nums2):
          if len(nums1) > len(nums2):
              nums1, nums2 = nums2, nums1
          m, n = len(nums1), len(nums2)
          half = (m + n + 1) // 2
          lo, hi = 0, m
          while lo <= hi:
              i = (lo + hi) // 2
              j = half - i
              a_l = nums1[i - 1] if i > 0 else float("-inf")
              a_r = nums1[i] if i < m else float("inf")
              b_l = nums2[j - 1] if j > 0 else float("-inf")
              b_r = nums2[j] if j < n else float("inf")
              if a_l <= b_r and b_l <= a_r:
                  if (m + n) % 2:
                      return float(max(a_l, b_l))
                  return (max(a_l, b_l) + min(a_r, b_r)) / 2
              if a_l > b_r:
                  hi = i - 1
              else:
                  lo = i + 1
          return 0.0
    `,
  });

  add({
    id: 'max-path-sum', title: '二元樹的最大路徑和', diff: 'hard', tags: ['二元樹', 'DFS'], lc: 124,
    fn: 'maxPathSum', params: [['root', 'TreeNode']], ret: 'int',
    desc: '路徑是樹中任意節點序列，相鄰節點有邊相連，每個節點最多出現一次（不一定經過根）。回傳所有<b>非空路徑</b>中，節點值總和的最大值。',
    examples: [{ args: [[1, 2, 3]], note: '2 → 1 → 3' }, { args: [[-10, 9, 20, null, null, 15, 7]], note: '15 → 20 → 7' }],
    tests: [[[-3]], [[2, -1]], [[-2, -1]], [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]]],
    gen: (R, n) => [R.tree(Math.max(1, n), -50, 50)], rand: [1, 60],
    cx: { time: 'n', space: 'logn', labels: { logn: 'O(h)' }, sizes: [63, 127, 255, 511, 1023, 2047], gen: (R, n) => [R.bst(n, -1e5, 1e5)] },
    hints: ['對每個節點計算「從它往下走的單邊最大貢獻」gain(node) = val + max(0, gain(left), gain(right))。', '以該節點為「轉折點」的路徑和 = val + max(0, gain(left)) + max(0, gain(right))，用它更新全域答案。'],
    explain: '後序 DFS 回傳單邊最大貢獻，同時以每個節點為轉折點更新答案。O(n) 時間、O(h) 空間。',
    ref: function maxPathSum(root) {
      let best = -Infinity;
      function gain(node) {
        if (!node) return 0;
        const l = Math.max(0, gain(node.left));
        const r = Math.max(0, gain(node.right));
        best = Math.max(best, node.val + l + r);
        return node.val + Math.max(l, r);
      }
      gain(root);
      return best;
    },
    py: `
      def maxPathSum(root):
          best = float("-inf")
          def gain(node):
              nonlocal best
              if not node:
                  return 0
              l = max(0, gain(node.left))
              r = max(0, gain(node.right))
              best = max(best, node.val + l + r)
              return node.val + max(l, r)
          gain(root)
          return best
    `,
  });

  add({
    id: 'longest-increasing-path', title: '矩陣中的最長遞增路徑', diff: 'hard', tags: ['DFS', '記憶化', '拓撲排序'], lc: 329,
    fn: 'longestIncreasingPath', params: [['matrix', 'int[][]']], ret: 'int',
    desc: '在整數矩陣中，每次可以往上下左右移動到<b>嚴格更大</b>的格子。回傳最長遞增路徑的長度。',
    examples: [{ args: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], note: '1 → 2 → 6 → 9' }, { args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]] }],
    tests: [[[[1]]], [[[1, 2]]], [[[7, 7], [7, 7]]]],
    gen: (R, n) => { const r = R.int(1, Math.max(1, Math.min(n, 12))); const c = R.int(1, Math.max(1, Math.min(n, 12))); return [Array.from({ length: r }, () => R.arr(c, 0, 20))]; }, rand: [1, 12],
    cx: { time: 'n', space: 'n', labels: { n: 'O(m·n)' }, sizes: [64, 256, 1024, 4096], gen: (R, n) => { const s = Math.round(Math.sqrt(n)); return [Array.from({ length: s }, () => R.arr(s, 0, 1e6))]; }, note: 'n = 格子總數' },
    hints: ['從每個格子出發做 DFS，但同一個格子的答案會被重複計算。', '記憶化：memo[i][j] = 從 (i, j) 出發的最長遞增路徑長度。', '因為路徑嚴格遞增，不會有環，不需要 visited。'],
    explain: 'DFS + 記憶化，每個格子只計算一次、每次檢查 4 個鄰居：O(m·n) 時間與空間。',
    ref: function longestIncreasingPath(matrix) {
      const m = matrix.length, n = matrix[0].length;
      const memo = Array.from({ length: m }, () => new Array(n).fill(0));
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      function dfs(i, j) {
        if (memo[i][j]) return memo[i][j];
        let best = 1;
        for (const [di, dj] of dirs) {
          const x = i + di, y = j + dj;
          if (x >= 0 && y >= 0 && x < m && y < n && matrix[x][y] > matrix[i][j]) best = Math.max(best, 1 + dfs(x, y));
        }
        memo[i][j] = best;
        return best;
      }
      let ans = 0;
      for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) ans = Math.max(ans, dfs(i, j));
      return ans;
    },
    py: `
      def longestIncreasingPath(matrix):
          m, n = len(matrix), len(matrix[0])
          memo = [[0] * n for _ in range(m)]
          def dfs(i, j):
              if memo[i][j]:
                  return memo[i][j]
              best = 1
              for x, y in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                  if 0 <= x < m and 0 <= y < n and matrix[x][y] > matrix[i][j]:
                      best = max(best, 1 + dfs(x, y))
              memo[i][j] = best
              return best
          return max(dfs(i, j) for i in range(m) for j in range(n))
    `,
  });
})(typeof window !== 'undefined' ? window : globalThis);
