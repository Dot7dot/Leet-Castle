/*
 * Python sandbox worker body (Pyodide).
 * The Python harness instruments the user's code with the `ast` module to count operations
 * (loops, calls, cost of built-ins) and periodically samples the containers reachable from the
 * solution's frames to estimate peak auxiliary space (element count, like the JS tracker).
 */
(function (root) {
  const PY_HARNESS = String.raw`
import ast, sys, json, time, math, io, traceback, types
import collections, heapq, bisect, functools, itertools, string, re, random, operator
from typing import *
from collections import deque, Counter, defaultdict, OrderedDict
from heapq import heappush, heappop, heapify, heappushpop, heapreplace, nlargest, nsmallest
from bisect import bisect_left, bisect_right, insort
from functools import lru_cache, cache, reduce, cmp_to_key
from math import inf

sys.setrecursionlimit(3500)

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return "ListNode(" + repr(_from_list(self)) + ")"

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return "TreeNode(" + repr(_from_tree(self)) + ")"

def _to_list(arr):
    d = ListNode(0); c = d
    for v in arr or []:
        c.next = ListNode(v); c = c.next
    return d.next

def _from_list(h):
    out = []; g = 0
    while h is not None and g < 500000:
        out.append(h.val); h = h.next; g += 1
    return out

def _to_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0]); q = [root]; qi = 0; i = 1
    while qi < len(q) and i < len(arr):
        node = q[qi]; qi += 1
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i]); q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i]); q.append(node.right)
        i += 1
    return root

def _from_tree(root):
    if root is None:
        return []
    out = []; q = [root]; qi = 0
    while qi < len(q) and qi < 500000:
        n = q[qi]; qi += 1
        if n is not None:
            out.append(n.val); q.append(n.left); q.append(n.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out

def _conv_in(t, v):
    if t == "ListNode": return _to_list(v)
    if t == "TreeNode": return _to_tree(v)
    if t == "ListNode[]": return [_to_list(x) for x in v]
    return v

def _norm(v, depth=0):
    if depth > 50: return None
    if v is None or isinstance(v, (bool, int, str)): return v
    if isinstance(v, float):
        return v if math.isfinite(v) else None
    if isinstance(v, ListNode): return _from_list(v)
    if isinstance(v, TreeNode): return _from_tree(v)
    if isinstance(v, dict): return [[_norm(k, depth+1), _norm(x, depth+1)] for k, x in v.items()]
    if isinstance(v, (list, tuple, set, frozenset, deque)) or hasattr(v, "__iter__"):
        return [_norm(x, depth+1) for x in v]
    return str(v)

# ---------------- operation counting ----------------
class _Budget(BaseException):
    pass

_S = [0, 0, 0, 10**9, 16, 0, 0]   # ops, depth, maxdepth, budget, sample countdown, peak units, ticks
_INP = set()       # ids of input containers (not counted as extra space)
_UG = [None]       # user globals of the current job
_SAMPLING = [False]
_CONT = (list, tuple, deque)

def _units(o, seen, top=True):
    if isinstance(o, str):
        return len(o) if id(o) not in _INP else 0
    if isinstance(o, _CONT):
        oid = id(o)
        if oid in seen or oid in _INP:
            return 0
        seen.add(oid)
        n = len(o)
        if top and n:
            inner = cnt = 0
            for x in itertools.islice(o, 0, 8):
                cnt += 1
                if isinstance(x, (list, tuple, deque, set, dict)) and id(x) not in _INP:
                    inner += len(x)
            return n + (inner * n) // cnt
        return n
    if isinstance(o, dict):
        oid = id(o)
        if oid in seen or oid in _INP:
            return 0
        seen.add(oid)
        n = len(o)
        if top and n:
            inner = cnt = 0
            for x in itertools.islice(o.values(), 0, 8):
                cnt += 1
                if isinstance(x, (list, tuple, deque, set, dict)):
                    inner += len(x)
            return n + (inner * n) // cnt
        return n
    if isinstance(o, (set, frozenset)):
        oid = id(o)
        if oid in seen or oid in _INP:
            return 0
        seen.add(oid)
        return len(o)
    if top and callable(o):
        ci = getattr(o, "cache_info", None)
        if ci is not None:
            oid = id(o)
            if oid in seen:
                return 0
            seen.add(oid)
            try:
                return ci().currsize
            except Exception:
                return 0
        return 0
    if top and hasattr(o, "__dict__") and not isinstance(o, (type, types.ModuleType)):
        oid = id(o)
        if oid in seen:
            return 0
        seen.add(oid)
        t = 0
        for v in list(vars(o).values()):
            t += _units(v, seen, False)
        return t
    return 0

def _sample(extra=None):
    _S[4] = max(16, _S[6] >> 6)
    if not _SAMPLING[0]:
        return
    seen = set()
    total = 0
    f = sys._getframe(2)
    while f is not None:
        if f.f_code.co_filename == "<solution>" and f.f_code.co_name != "<module>":
            for v in list(f.f_locals.values()):
                total += _units(v, seen)
        f = f.f_back
    g = _UG[0]
    if g is not None:
        for k, v in list(g.items()):
            if k in _BASE or k.startswith("__") or isinstance(v, (type, types.ModuleType)):
                continue
            total += _units(v, seen)
    if extra is not None:
        total += _units(extra, seen)
    if total > _S[5]:
        _S[5] = total

def __tk():
    _S[0] += 1
    _S[6] += 1
    if _S[0] > _S[3]: raise _Budget()
    _S[4] -= 1
    if _S[4] <= 0: _sample()

def __tkt():
    _S[0] += 1
    _S[6] += 1
    if _S[0] > _S[3]: raise _Budget()
    _S[4] -= 1
    if _S[4] <= 0: _sample()
    return True

def __en():
    _S[0] += 1
    _S[6] += 1
    if _S[0] > _S[3]: raise _Budget()
    _S[1] += 1
    if _S[1] > _S[2]: _S[2] = _S[1]
    _S[4] -= 1
    if _S[4] <= 0: _sample()

def __ex():
    if _S[1] == 1 and _SAMPLING[0]:
        _sample()   # the top-level call is returning: its locals are still alive here
    _S[1] -= 1

def _mark_inputs(v, depth=0):
    if depth > 3:
        return
    if isinstance(v, (list, tuple, deque, set, dict, str)):
        _INP.add(id(v))
        if isinstance(v, (list, tuple)) and v and isinstance(v[0], (list, tuple, str)):
            for x in v:
                _mark_inputs(x, depth + 1)

def _cost(k):
    _S[0] += k
    if _S[0] > _S[3]: raise _Budget()

def _ln(x):
    try:
        return len(x)
    except Exception:
        return 0

def _lg(n):
    return max(1, int(math.log2(n)) + 1) if n > 1 else 1

_SEQ = (list, tuple, str, deque)

def __in(a, b):
    if isinstance(b, _SEQ):
        _cost(len(b))
    return a in b

def __sl(v, lo, hi, st):
    r = v[lo:hi:st]
    _cost(_ln(r))
    return r

def __mul(a, b):
    r = a * b
    if isinstance(r, (list, str, tuple)): _cost(len(r))
    return r

def __add(a, b):
    r = a + b
    if isinstance(r, (list, tuple)): _cost(len(r))
    return r

_LIN_METHODS = {"index", "count", "remove", "copy", "reverse", "split", "replace", "find", "rfind", "lower",
                "upper", "strip", "lstrip", "rstrip", "startswith", "endswith", "rotate", "isalnum", "isalpha", "isdigit"}

def __m(obj, name, *args, **kw):
    f = getattr(obj, name)
    if name in ("sort",):
        n = _ln(obj); _cost(n * _lg(n))
    elif name in ("insert", "pop"):
        if isinstance(obj, list) and args:
            i = args[0] if isinstance(args[0], int) else 0
            n = len(obj)
            if i < 0: i += n
            _cost(max(1, n - i))
        else:
            _cost(1)
    elif name in ("extend", "update", "union", "intersection", "difference", "join"):
        _cost(max(1, _ln(args[0]) if args else 1))
    elif name in ("heappush", "heappop", "heappushpop", "heapreplace"):
        _cost(_lg(_ln(args[0]) + 1) if args else 1)
    elif name == "heapify":
        _cost(_ln(args[0]) if args else 1)
    elif name in ("nlargest", "nsmallest"):
        n = _ln(args[1]) if len(args) > 1 else 1; _cost(n * _lg(n))
    elif name in ("insort", "insort_left", "insort_right"):
        _cost(_ln(args[0]) if args else 1)
    elif name in ("bisect", "bisect_left", "bisect_right"):
        _cost(_lg(_ln(args[0])) if args else 1)
    elif name in _LIN_METHODS:
        _cost(max(1, _ln(obj)))
    return f(*args, **kw)

_FN_LIN = {"sum", "min", "max", "list", "tuple", "set", "dict", "frozenset", "any", "all", "Counter", "deque", "str", "sorted",
           "heappush", "heappop", "heapify", "heappushpop", "heapreplace", "nlargest", "nsmallest", "insort", "bisect_left",
           "bisect_right", "bisect", "reversed", "enumerate", "zip", "map", "filter", "range", "len", "abs"}

def __fc(f, name, *args, **kw):
    if name == "sorted":
        n = _ln(args[0]) if args else 0; _cost(max(1, n * _lg(n)))
    elif name in ("sum", "min", "max", "list", "tuple", "set", "dict", "frozenset", "any", "all", "Counter", "deque"):
        if len(args) == 1: _cost(max(1, _ln(args[0])))
        else: _cost(1)
    elif name in ("heappush", "heappop", "heappushpop", "heapreplace"):
        _cost(_lg(_ln(args[0]) + 1) if args else 1)
    elif name == "heapify":
        _cost(_ln(args[0]) if args else 1)
    elif name in ("nlargest", "nsmallest"):
        n = _ln(args[1]) if len(args) > 1 else 1; _cost(n * _lg(n))
    elif name in ("insort",):
        _cost(_ln(args[0]) if args else 1)
    elif name in ("bisect_left", "bisect_right", "bisect"):
        _cost(_lg(_ln(args[0])) if args else 1)
    elif name == "str":
        pass
    return f(*args, **kw)

_METHODS = _LIN_METHODS | {"sort", "insert", "pop", "extend", "update", "union", "intersection", "difference", "join",
                           "heappush", "heappop", "heappushpop", "heapreplace", "heapify", "nlargest", "nsmallest",
                           "insort", "insort_left", "insort_right", "bisect", "bisect_left", "bisect_right"}
_FN_NAMES = {"sorted", "sum", "min", "max", "list", "tuple", "set", "dict", "frozenset", "any", "all", "Counter", "deque",
             "heappush", "heappop", "heapify", "heappushpop", "heapreplace", "nlargest", "nsmallest", "insort",
             "bisect_left", "bisect_right"}

def _call(name, args):
    return ast.Call(func=ast.Name(id=name, ctx=ast.Load()), args=args, keywords=[])

class _Inst(ast.NodeTransformer):
    def _fn(self, node):
        self.generic_visit(node)
        body = node.body
        new = [ast.Expr(_call("__en", []))]
        new.append(ast.Try(body=body, handlers=[], orelse=[], finalbody=[ast.Expr(_call("__ex", []))]))
        node.body = new
        return node
    def visit_FunctionDef(self, node): return self._fn(node)
    def visit_AsyncFunctionDef(self, node): return self._fn(node)
    def _loop(self, node):
        self.generic_visit(node)
        node.body.insert(0, ast.Expr(_call("__tk", [])))
        return node
    def visit_For(self, node): return self._loop(node)
    def visit_While(self, node): return self._loop(node)
    def visit_AsyncFor(self, node): return self._loop(node)
    def visit_comprehension(self, node):
        self.generic_visit(node)
        node.ifs.insert(0, _call("__tkt", []))
        return node
    def visit_Lambda(self, node):
        self.generic_visit(node)
        node.body = ast.Subscript(value=ast.Tuple(elts=[_call("__tkt", []), node.body], ctx=ast.Load()),
                                  slice=ast.Constant(value=1), ctx=ast.Load())
        return node
    def visit_Compare(self, node):
        self.generic_visit(node)
        if len(node.ops) == 1 and isinstance(node.ops[0], (ast.In, ast.NotIn)):
            c = _call("__in", [node.left, node.comparators[0]])
            if isinstance(node.ops[0], ast.NotIn):
                return ast.UnaryOp(op=ast.Not(), operand=c)
            return c
        return node
    def visit_Subscript(self, node):
        self.generic_visit(node)
        if isinstance(node.ctx, ast.Load) and isinstance(node.slice, ast.Slice):
            s = node.slice
            none = lambda: ast.Constant(value=None)
            return _call("__sl", [node.value, s.lower or none(), s.upper or none(), s.step or none()])
        return node
    def visit_BinOp(self, node):
        self.generic_visit(node)
        listy = (ast.List, ast.ListComp, ast.Tuple)
        if isinstance(node.op, ast.Mult) and (isinstance(node.left, listy) or isinstance(node.right, listy) or
                                              isinstance(node.left, ast.Constant) and isinstance(node.left.value, str)):
            return _call("__mul", [node.left, node.right])
        if isinstance(node.op, ast.Add) and (isinstance(node.left, listy) or isinstance(node.right, listy)):
            return _call("__add", [node.left, node.right])
        return node
    def visit_Call(self, node):
        self.generic_visit(node)
        f = node.func
        if isinstance(f, ast.Attribute) and f.attr in _METHODS:
            return ast.Call(func=ast.Name(id="__m", ctx=ast.Load()),
                            args=[f.value, ast.Constant(value=f.attr)] + node.args, keywords=node.keywords)
        if isinstance(f, ast.Name) and f.id in _FN_NAMES:
            return ast.Call(func=ast.Name(id="__fc", ctx=ast.Load()),
                            args=[f, ast.Constant(value=f.id)] + node.args, keywords=node.keywords)
        return node

_BASE = {}
for _k in ["ListNode", "TreeNode", "List", "Optional", "Dict", "Set", "Tuple", "Deque", "Any", "Union",
           "deque", "Counter", "defaultdict", "OrderedDict", "heappush", "heappop", "heapify", "heappushpop",
           "heapreplace", "nlargest", "nsmallest", "bisect_left", "bisect_right", "insort", "lru_cache", "cache",
           "reduce", "cmp_to_key", "inf", "math", "collections", "heapq", "bisect", "functools", "itertools",
           "string", "re", "random", "operator", "__tk", "__tkt", "__en", "__ex", "__in", "__sl", "__mul", "__add",
           "__m", "__fc"]:
    _BASE[_k] = globals()[_k]

def _compile(code):
    tree = ast.parse(code, filename="<solution>")
    tree = _Inst().visit(tree)
    ast.fix_missing_locations(tree)
    return compile(tree, "<solution>", "exec")

def _err_info(e):
    tb = traceback.extract_tb(e.__traceback__)
    line = None
    for fr in tb:
        if fr.filename == "<solution>":
            line = fr.lineno
    name = type(e).__name__
    msg = str(e)
    if isinstance(e, RecursionError):
        msg = "遞迴太深（maximum recursion depth exceeded）"
    return name + (": " + msg if msg else ""), line

def run_job(job_json):
    job = json.loads(job_json)
    code = job["code"]; fn_name = job["fn"]; params = job["params"]; mode = job["mode"]
    inplace = job.get("inplace")
    try:
        compiled = _compile(code)
    except SyntaxError as e:
        return json.dumps({"compileError": "SyntaxError: " + str(e.msg), "line": e.lineno})
    g = dict(_BASE)
    g["__name__"] = "__solution__"
    out_buf = io.StringIO()
    old_out = sys.stdout
    sys.stdout = out_buf
    try:
        try:
            exec(compiled, g)
        except BaseException as e:
            sys.stdout = old_out
            m, ln = _err_info(e)
            return json.dumps({"compileError": m, "line": ln})
    finally:
        sys.stdout = old_out
    f = g.get(fn_name)
    if f is None and "Solution" in g:
        try:
            f = getattr(g["Solution"](), fn_name)
        except Exception:
            f = None
    if not callable(f):
        return json.dumps({"compileError": "找不到函式 " + fn_name + "()，請確認函式名稱沒有被改掉。"})

    results = []
    t_start = time.perf_counter()
    budget = int(job.get("budget", 10**9))
    first = True
    for case in job["cases"]:
        if not first:
            # fresh globals per case: module-level caches (dict memo, @lru_cache) must not leak between cases
            g = dict(_BASE)
            g["__name__"] = "__solution__"
            try:
                sys.stdout = io.StringIO()
                exec(compiled, g)
            except BaseException:
                pass
            finally:
                sys.stdout = old_out
            nf = g.get(fn_name)
            if nf is None and "Solution" in g:
                try:
                    nf = getattr(g["Solution"](), fn_name)
                except Exception:
                    nf = None
            if callable(nf):
                f = nf
        first = False
        args = [_conv_in(p[1], a) for p, a in zip(params, case["args"])]
        _S[0] = 0; _S[1] = 0; _S[2] = 0; _S[3] = budget; _S[4] = 16; _S[5] = 0; _S[6] = 0
        item = {"n": case.get("n")}
        out_buf = io.StringIO()
        sys.stdout = out_buf
        measure = mode == "analyze"
        _INP.clear()
        if measure:
            for a in args:
                _mark_inputs(a)
        _UG[0] = g
        _SAMPLING[0] = measure
        t0 = time.perf_counter()
        res = None
        try:
            res = f(*args)
            if inplace is not None:
                res = args[inplace]
        except _Budget:
            item["tle"] = True
        except BaseException as e:
            m, ln = _err_info(e)
            item["error"] = m; item["line"] = ln
        finally:
            sys.stdout = old_out
            item["ms"] = (time.perf_counter() - t0) * 1000
            if measure:
                if "tle" not in item and "error" not in item and inplace is None:
                    seen = set()
                    _S[5] = max(_S[5], _units(res, seen))
                _SAMPLING[0] = False
                item["peak"] = _S[5]
        item["ops"] = _S[0]
        item["depth"] = _S[2]
        if measure:
            item["space"] = item["peak"] + _S[2]
        if "tle" not in item and "error" not in item:
            try:
                item["out"] = _norm(res)
            except BaseException as e:
                item["error"] = "無法序列化回傳值：" + str(e)
        if mode == "test":
            s = out_buf.getvalue()
            item["stdout"] = s[:8000]
        results.append(item)
        if mode == "analyze" and ("tle" in item or "error" in item):
            break
        if mode == "analyze" and (time.perf_counter() - t_start) * 1000 > job.get("timeLimit", 8000):
            break
        if mode == "test" and job.get("stopOnError") and ("tle" in item or "error" in item):
            break
    return json.dumps({"results": results}, allow_nan=False, default=str)
`;

  function __lcPyWorker() {
    let pyodide = null, runJob = null, loading = null;
    async function boot() {
      if (loading) return loading;
      loading = (async () => {
        importScripts(self.__PYODIDE_URL + 'pyodide.js');
        pyodide = await loadPyodide({ indexURL: self.__PYODIDE_URL });
        pyodide.runPython(self.__PY_HARNESS);
        runJob = pyodide.globals.get('run_job');
      })();
      return loading;
    }
    self.onmessage = async function (ev) {
      const msg = ev.data;
      const reply = (data) => self.postMessage(Object.assign({ id: msg.id }, data));
      try {
        await boot();
      } catch (e) {
        return reply({ fatal: 'Python 引擎載入失敗：' + (e && e.message ? e.message : e) });
      }
      if (msg.type === 'ping') return reply({ ok: true });
      try {
        const res = runJob(JSON.stringify(msg));
        reply(JSON.parse(res));
      } catch (e) {
        reply({ fatal: String(e && e.message ? e.message : e).slice(-2000) });
      }
    };
  }
  root.__lcPyWorker = __lcPyWorker;
  root.__lcPyHarness = PY_HARNESS;
})(typeof window !== 'undefined' ? window : globalThis);
