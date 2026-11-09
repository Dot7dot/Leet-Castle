/*
 * Shared helpers used both on the main thread and inside the JS Web Worker.
 * Everything lives inside one function so that its source can be embedded
 * into a Blob worker via Function.prototype.toString().
 */
(function (root) {
  function __lcShared() {
    class ListNode {
      constructor(val, next) {
        this.val = val === undefined ? 0 : val;
        this.next = next === undefined ? null : next;
      }
    }
    class TreeNode {
      constructor(val, left, right) {
        this.val = val === undefined ? 0 : val;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
      }
    }

    function toList(arr) {
      const dummy = new ListNode(0);
      let cur = dummy;
      for (const v of arr || []) { cur.next = new ListNode(v); cur = cur.next; }
      return dummy.next;
    }
    function fromList(head) {
      const out = [];
      let guard = 0;
      while (head && guard++ < 500000) { out.push(head.val); head = head.next; }
      return out;
    }
    function toTree(arr) {
      if (!arr || !arr.length || arr[0] === null) return null;
      const root = new TreeNode(arr[0]);
      const q = [root];
      let qi = 0, i = 1;
      while (qi < q.length && i < arr.length) {
        const node = q[qi++];
        if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); q.push(node.left); }
        i++;
        if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); q.push(node.right); }
        i++;
      }
      return root;
    }
    function fromTree(root) {
      if (!root) return [];
      const out = [];
      const q = [root];
      let qi = 0, guard = 0;
      while (qi < q.length && guard++ < 500000) {
        const n = q[qi++];
        if (n) { out.push(n.val); q.push(n.left || null, n.right || null); }
        else out.push(null);
      }
      while (out.length && out[out.length - 1] === null) out.pop();
      return out;
    }

    function convertIn(type, v) {
      if (type === 'ListNode') return toList(v);
      if (type === 'TreeNode') return toTree(v);
      if (type === 'ListNode[]') return (v || []).map(toList);
      return v;
    }
    function normalizeOut(v, depth) {
      depth = depth || 0;
      if (v === undefined) return null;
      if (v === null) return null;
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      if (typeof v !== 'object') return v;
      if (depth > 50) return null;
      if (v instanceof ListNode || ('val' in v && 'next' in v && !('left' in v))) return fromList(v);
      if (v instanceof TreeNode || ('val' in v && 'left' in v && 'right' in v)) return fromTree(v);
      if (Array.isArray(v) || ArrayBuffer.isView(v)) return Array.from(v, (x) => normalizeOut(x, depth + 1));
      if (v instanceof Set) return Array.from(v, (x) => normalizeOut(x, depth + 1));
      if (v instanceof Map) return Array.from(v.entries(), (x) => normalizeOut(x, depth + 1));
      return JSON.parse(JSON.stringify(v));
    }

    // Collect every object reachable from the (already converted) inputs.
    function walkInputs(v, visit, depth) {
      depth = depth || 0;
      if (!v || typeof v !== 'object' || depth > 4) return;
      visit(v);
      if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) if (v[i] && typeof v[i] === 'object') walkInputs(v[i], visit, depth + 1); return; }
      if (v instanceof ListNode) { let c = v.next, g = 0; while (c && g++ < 500000) { visit(c); c = c.next; } return; }
      if (v instanceof TreeNode) {
        const st = [v.left, v.right]; let g = 0;
        while (st.length && g++ < 500000) { const n = st.pop(); if (n) { visit(n); st.push(n.left, n.right); } }
      }
    }

    // Seeded RNG with helpers used by test generators.
    function makeRng(seed) {
      let s = (seed >>> 0) || 1;
      const next = () => {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const R = {
        next,
        int: (a, b) => a + Math.floor(next() * (b - a + 1)),
        bool: (p) => next() < (p === undefined ? 0.5 : p),
        pick: (arr) => arr[Math.floor(next() * arr.length)],
        arr: (n, a, b) => Array.from({ length: n }, () => R.int(a, b)),
        str: (n, alpha) => { alpha = alpha || 'abcdefghijklmnopqrstuvwxyz'; let s = ''; for (let i = 0; i < n; i++) s += alpha[Math.floor(next() * alpha.length)]; return s; },
        shuffle: (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
        distinct: (n, a, b) => { const set = new Set(); while (set.size < n) set.add(R.int(a, b)); return R.shuffle(Array.from(set)); },
        sortedArr: (n, a, b) => R.arr(n, a, b).sort((x, y) => x - y),
        // Random binary tree in level-order array form with n nodes.
        tree: (n, a, b) => {
          if (n <= 0) return [];
          const vals = R.arr(n, a, b);
          const root = new TreeNode(vals[0]);
          const nodes = [root];
          for (let i = 1; i < n; i++) {
            let cur = root;
            while (true) {
              const goLeft = next() < 0.5;
              if (goLeft) { if (!cur.left) { cur.left = new TreeNode(vals[i]); nodes.push(cur.left); break; } cur = cur.left; }
              else { if (!cur.right) { cur.right = new TreeNode(vals[i]); nodes.push(cur.right); break; } cur = cur.right; }
            }
          }
          return fromTree(root);
        },
        // Random BST (level-order array) built from distinct values.
        bst: (n, a, b) => {
          if (n <= 0) return [];
          const vals = R.distinct(n, a, b);
          let root = null;
          for (const v of vals) {
            if (!root) { root = new TreeNode(v); continue; }
            let cur = root;
            while (true) {
              if (v < cur.val) { if (!cur.left) { cur.left = new TreeNode(v); break; } cur = cur.left; }
              else { if (!cur.right) { cur.right = new TreeNode(v); break; } cur = cur.right; }
            }
          }
          return fromTree(root);
        },
      };
      return R;
    }

    function deepEqual(a, b, eps) {
      if (a === b) return true;
      if (typeof a === 'number' && typeof b === 'number') {
        if (eps) return Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));
        return false;
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i], eps)) return false;
        return true;
      }
      if (a && b && typeof a === 'object' && typeof b === 'object') {
        const ka = Object.keys(a), kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (const k of ka) if (!deepEqual(a[k], b[k], eps)) return false;
        return true;
      }
      return false;
    }

    return { ListNode, TreeNode, toList, fromList, toTree, fromTree, convertIn, normalizeOut, walkInputs, makeRng, deepEqual };
  }
  root.__lcShared = __lcShared;
})(typeof window !== 'undefined' ? window : globalThis);
