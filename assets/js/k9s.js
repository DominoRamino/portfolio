/* k9s view: a small terminal UI engine that renders window.RAMY as a cluster. Pure DOM, no deps. */
window.K9S = (function () {
  var D, root, opts, els = {};
  var S = {
    view: 'pods', ns: 'all', filter: '', sel: 0, stack: [],
    cmd: false, cmdText: '', flt: false, fltText: '',
    decoded: false, autoscroll: true, help: false, flash: '', arg: null, cur: null
  };
  var CPU = 12, MEM = 34, timers = [];

  /* ---------- helpers ---------- */
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function span(cls, text) { return h('span', cls, text); }
  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
  function age(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (d < 1) return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)) + 'h';
    if (d < 365) return d + 'd';
    var y = Math.floor(d / 365), r = d % 365;
    return y + 'y' + (r ? r + 'd' : '');
  }
  function b64(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return s; } }
  function nsList() { return D.namespaces.map(function (n) { return n.name; }); }
  function wl(name) { return D.workloads.filter(function (w) { return w.name === name; })[0]; }
  function matches(text) {
    if (!S.filter) return true;
    return String(text).toLowerCase().indexOf(S.filter.toLowerCase()) >= 0;
  }
  function pods() {
    return D.workloads
      .filter(function (w) { return S.ns === 'all' || w.ns === S.ns; })
      .filter(function (w) { return S.arg !== 'deploy' || w.kind === 'Deployment'; })
      .filter(function (w) { return matches([w.name, w.ns, w.title, w.status, w.kind].join(' ')); })
      .sort(function (a, b) { return a.started < b.started ? 1 : -1; });
  }

  /* ---------- views ---------- */
  var VIEWS = {
    pods: {
      title: function () { return (S.arg === 'deploy' ? 'Deployments' : 'Pods') + '(' + S.ns + ')'; },
      rows: pods,
      cols: ['NAMESPACE', 'NAME', 'KIND', 'READY', 'STATUS', 'RESTARTS', 'AGE'],
      cell: function (w) { return [w.ns, w.name, w.kind, w.ready, w.status, w.restarts, age(w.started)]; },
      cls: function (w) { return w.status === 'Failed' ? 'failed' : w.status === 'Completed' ? 'completed' : ''; },
      enter: function (w) { push('describe', w.name); }
    },
    ns: {
      title: function () { return 'Namespaces(all)'; },
      rows: function () { return D.namespaces.filter(function (n) { return matches(n.name + ' ' + n.label); }); },
      cols: ['NAME', 'STATUS', 'PERIOD', 'DESCRIPTION'],
      cell: function (n) { return [n.name, n.status, n.period, n.label]; },
      cls: function () { return ''; },
      enter: function (n) { S.ns = n.name; S.filter = ''; S.stack = []; go('pods'); }
    },
    events: {
      title: function () { return 'Events(all)'; },
      rows: function () { return D.events.slice().reverse().filter(function (e) { return matches(e.m + ' ' + e.obj + ' ' + e.reason); }); },
      cols: ['LAST SEEN', 'TYPE', 'REASON', 'OBJECT', 'MESSAGE'],
      cell: function (e) { return [e.t, e.type, e.reason, e.obj, e.m]; },
      cls: function (e) { return e.type === 'Warning' ? 'warn' : ''; },
      enter: function (e) { var n = e.obj.split('/')[1]; if (wl(n)) push('describe', n); }
    },
    ctx: {
      title: function () { return 'Contexts(all)'; },
      rows: function () {
        return [
          { name: 'ramy-alrammahi', cluster: 'career', user: 'k9s', active: true, note: 'this view' },
          { name: 'recruiter', cluster: 'career', user: 'recruiter', active: false, note: 'plain HTML view of the same data' }
        ];
      },
      cols: ['NAME', 'CLUSTER', 'AUTHINFO', 'ACTIVE', 'NOTE'],
      cell: function (c) { return [c.name, c.cluster, c.user, c.active ? '*' : '', c.note]; },
      cls: function () { return ''; },
      enter: function (c) { if (c.name === 'recruiter') quit(); }
    },
    cm: {
      title: function () { return 'ConfigMaps(all)'; },
      rows: function () {
        return [
          { name: 'skills', ns: 'cloud-eng', data: D.skills, age: '2023-06-01' },
          { name: 'tools', ns: 'sandbox', data: D.tools, age: '2024-06-01' }
        ].filter(function (c) { return matches(c.name); });
      },
      cols: ['NAMESPACE', 'NAME', 'DATA', 'AGE'],
      cell: function (c) { return [c.ns, c.name, c.data.length, age(c.age)]; },
      cls: function () { return ''; },
      enter: function (c) { push('cmdata', c.name); }
    },
    secret: {
      title: function () { return 'Secrets(all)'; },
      rows: function () { return [{ name: 'contact', ns: 'cloud-eng', type: 'Opaque', data: Object.keys(D.contact).length, age: '2023-06-01' }]; },
      cols: ['NAMESPACE', 'NAME', 'TYPE', 'DATA', 'AGE'],
      cell: function (s) { return [s.ns, s.name, s.type, s.data, age(s.age)]; },
      cls: function () { return ''; },
      enter: function () { push('secretdata', 'contact'); }
    },
    decisions: {
      title: function () { return 'Decisions(all)'; },
      rows: function () { return D.decisions.filter(function (d) { return matches(d.name + ' ' + d.decision); }); },
      cols: ['NAME', 'DATE', 'DECISION'],
      cell: function (d) { return [d.name, d.date, d.decision]; },
      cls: function () { return ''; },
      enter: function (d) { push('decision', d.name); }
    },
    talks: {
      title: function () { return 'Talks(all)'; },
      rows: function () { return D.talks.filter(function (t) { return matches(t.where + ' ' + t.what); }); },
      cols: ['WHEN', 'AUDIENCE', 'TOPIC'],
      cell: function (t) { return [t.when, t.where, t.what]; },
      cls: function () { return ''; },
      enter: function () {}
    },
    aliases: {
      title: function () { return 'Aliases(all)'; },
      rows: function () { return ALIASES.filter(function (a) { return matches(a[0] + ' ' + a[1]); }); },
      cols: ['RESOURCE', 'COMMAND', 'DESCRIPTION'],
      cell: function (a) { return [a[0], a[1], a[2]]; },
      cls: function () { return ''; },
      enter: function (a) { runCmd(a[1].split(' ')[0].replace(':', '')); }
    }
  };
  var TEXT_VIEWS = { describe: 1, logs: 1, yaml: 1, cmdata: 1, secretdata: 1, decision: 1, now: 1, pcap: 1 };

  var ALIASES = [
    ['pods', ':pods', 'roles and projects, the default view'],
    ['deployments', ':deploy', 'only the long-running ones'],
    ['namespaces', ':ns', 'career eras; enter to scope pods'],
    ['events', ':events', 'timeline'],
    ['configmaps', ':cm', 'skills and tools'],
    ['secrets', ':secret', 'contact info (press x to decode)'],
    ['decisions', ':decisions', 'architecture decision records'],
    ['talks', ':talks', 'presentations and teaching'],
    ['now', ':now', 'what I am doing right now'],
    ['podscope', ':pcap', 'simulated PodScope capture'],
    ['contexts', ':ctx', 'switch to the recruiter view'],
    ['help', ':help', 'keys and commands'],
    ['quit', ':q', 'back to the recruiter view']
  ];

  /* ---------- navigation ---------- */
  function go(view, arg) {
    S.view = view; S.arg = arg == null ? null : arg; S.sel = 0; S.filter = ''; S.decoded = false; S.help = false;
    stopTimers(); render();
  }
  function push(view, arg) {
    S.stack.push({ view: S.view, arg: S.arg, sel: S.sel, ns: S.ns, filter: S.filter });
    S.view = view; S.arg = arg; S.sel = 0; S.decoded = false; S.help = false;
    stopTimers(); render();
    if (view === 'logs' || view === 'pcap') startStream();
  }
  function back() {
    if (S.help) { S.help = false; render(); return; }
    if (S.filter && !TEXT_VIEWS[S.view]) { S.filter = ''; render(); return; }
    var p = S.stack.pop();
    stopTimers();
    if (!p) { if (S.view !== 'pods') { go('pods'); } else { flash('at root. <q> or :q returns to the recruiter view'); } return; }
    S.view = p.view; S.arg = p.arg; S.sel = p.sel; S.ns = p.ns; S.filter = p.filter; S.decoded = false;
    render();
  }
  function quit() { stopTimers(); if (opts && opts.onQuit) opts.onQuit(); }
  function flash(m) { S.flash = m; render(); setTimeout(function () { if (S.flash === m) { S.flash = ''; render(); } }, 1800); }

  function runCmd(raw) {
    var parts = raw.trim().split(/\s+/), c = parts[0].toLowerCase(), a = parts[1];
    var saved = S.stack; S.stack = [];
    switch (c) {
      case 'pods': case 'po': case 'pod':
        if (a) { if (nsList().indexOf(a) >= 0) S.ns = a; else { flash('namespace ' + a + ' not found'); return; } }
        go('pods'); break;
      case 'deploy': case 'deployments': case 'dp':
        if (a && nsList().indexOf(a) >= 0) S.ns = a;
        go('pods', 'deploy'); break;
      case 'ns': case 'namespaces': case 'namespace': go('ns'); break;
      case 'ev': case 'events': go('events'); break;
      case 'ctx': case 'contexts': case 'context': go('ctx'); break;
      case 'cm': case 'configmaps': case 'configmap':
        if (a === 'skills' || a === 'tools') { go('cm'); push('cmdata', a); } else go('cm'); break;
      case 'secret': case 'secrets': case 'sec':
        go('secret'); if (a === 'contact') push('secretdata', 'contact'); break;
      case 'decisions': case 'decision': case 'crd': case 'adr': go('decisions'); break;
      case 'talks': case 'talk': go('talks'); break;
      case 'now': go('pods'); push('now'); break;
      case 'pcap': case 'podscope': go('pods'); push('pcap', 'podscope'); break;
      case 'alias': case 'aliases': go('aliases'); break;
      case 'help': case 'h': case '?': S.help = true; render(); break;
      case 'q': case 'quit': case 'q!': case 'exit': quit(); break;
      case 'recruiter': quit(); break;
      default:
        if (nsList().indexOf(c) >= 0) { S.ns = c; go('pods'); }
        else if (wl(c)) { go('pods'); push('describe', c); }
        else { S.stack = saved; flash('unknown command: ' + c + '  (try :help)'); }
    }
  }

  /* ---------- rendering ---------- */
  function render() {
    renderHead(); renderFrame(); renderPrompt(); renderCrumbs(); renderModal();
  }

  var LOGO = [
    ' ____  __.________       ',
    '|    |/ _/   __   \\______',
    '|      < \\____    /  ___/',
    '|    |  \\   /    /\\___ \\ ',
    '|____|__ \\ /____//____  >',
    '        \\/            \\/ '
  ].join('\n');

  function bar(pct) {
    var n = Math.round(pct / 10), s = '';
    for (var i = 0; i < 10; i++) s += i < n ? '█' : '░';
    return s + ' ' + pad(pct + '%', 4);
  }
  function renderHead() {
    var info = els.info; info.textContent = '';
    var rows = [
      ['Context: ', 'ramy-alrammahi'], ['Cluster: ', 'career'], ['User:    ', 'recruiter'],
      ['K9s Rev: ', 'v0.50.6'], ['K8s Rev: ', 'v1.33.0']
    ];
    rows.forEach(function (r) { info.appendChild(span('k', r[0])); info.appendChild(span('v', r[1])); info.appendChild(document.createTextNode('\n')); });
    info.appendChild(span('k', 'CPU:     ')); info.appendChild(span('bar' + (CPU > 70 ? ' warn' : ''), bar(CPU))); info.appendChild(document.createTextNode('\n'));
    info.appendChild(span('k', 'MEM:     ')); info.appendChild(span('bar' + (MEM > 70 ? ' warn' : ''), bar(MEM)));

    var hints = els.hints; hints.textContent = '';
    var left = [['<0>', 'all']].concat(D.namespaces.map(function (n, i) { return ['<' + (i + 1) + '>', n.name]; }));
    var right = [['<d>', 'describe'], ['<l>', 'logs'], ['<y>', 'yaml'], ['</>', 'filter'], ['<:>', 'command'], ['<?>', 'help'], ['<esc>', 'back']];
    var colL = h('div'), colR = h('div');
    left.forEach(function (x) {
      var line = h('div'); line.appendChild(span('key num', pad(x[0], 6)));
      var on = (x[1] === 'all' && S.ns === 'all') || x[1] === S.ns;
      line.appendChild(span('lbl' + (on ? ' on' : ''), x[1])); colL.appendChild(line);
    });
    right.forEach(function (x) {
      var line = h('div'); line.appendChild(span('key', pad(x[0], 6))); line.appendChild(span('lbl', x[1])); colR.appendChild(line);
    });
    hints.appendChild(colL); hints.appendChild(colR);
    els.logo.textContent = LOGO;
  }

  function renderFrame() {
    var body = els.body; body.textContent = '';
    var title = els.title; title.textContent = '';
    if (TEXT_VIEWS[S.view]) { renderText(body, title); return; }
    var V = VIEWS[S.view], rows = V.rows();
    if (S.sel >= rows.length) S.sel = Math.max(0, rows.length - 1);
    title.appendChild(span('', ' ' + V.title() + '['));
    title.appendChild(span('cnt', String(rows.length)));
    title.appendChild(span('', ']'));
    if (S.filter) { title.appendChild(span('flt', ' </' + S.filter + '>')); }
    title.appendChild(span('', ' '));

    var t = h('table', 'k-table'), thead = h('thead'), tr = h('tr');
    V.cols.forEach(function (c, i) { tr.appendChild(h('th', i === (S.view === 'pods' ? 6 : 0) ? 'sort' : '', c + (i === (S.view === 'pods' ? 6 : 0) ? '↓' : ''))); });
    thead.appendChild(tr); t.appendChild(thead);
    var tb = h('tbody');
    rows.forEach(function (r, i) {
      var row = h('tr', (i === S.sel ? 'sel ' : '') + V.cls(r));
      V.cell(r).forEach(function (c) { row.appendChild(h('td', '', String(c))); });
      row.addEventListener('click', function () { if (S.sel === i) V.enter(r); else { S.sel = i; render(); } });
      tb.appendChild(row);
    });
    if (!rows.length) { var e = h('tr'); e.appendChild(h('td', '', S.filter ? 'no match for "' + S.filter + '"' : 'no resources found')); tb.appendChild(e); }
    t.appendChild(tb); body.appendChild(t);
    var selRow = tb.children[S.sel]; if (selRow && selRow.scrollIntoView) selRow.scrollIntoView({ block: 'nearest' });
  }

  function kv(pre, key, val, cls) {
    pre.appendChild(span('key', key)); pre.appendChild(span(cls || 'str', val)); pre.appendChild(document.createTextNode('\n'));
  }
  function renderText(body, title) {
    var pre = h('pre', 'k-text');
    var w = wl(S.arg);
    if (S.view === 'describe' && w) {
      title.appendChild(span('', ' Describe(' + w.ns + '/' + w.name + ') '));
      kv(pre, 'Name:         ', w.name); kv(pre, 'Namespace:    ', w.ns); kv(pre, 'Kind:         ', w.kind);
      kv(pre, 'Status:       ', w.status, w.status === 'Failed' ? 'err' : w.status === 'Completed' ? 'dim' : 'ok');
      kv(pre, 'Started:      ', w.started + (w.ended ? '   Ended: ' + w.ended : '') + '   Age: ' + age(w.started));
      kv(pre, 'Labels:       ', 'role=' + w.role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '\n              ' + w.tags.map(function (t) { return 'tag/' + t + '=true'; }).join('\n              '));
      kv(pre, 'Title:        ', w.title); kv(pre, 'Summary:      ', w.tagline);
      pre.appendChild(document.createTextNode('\n'));
      var d = w.describe;
      if (d.situation) { pre.appendChild(span('hd', 'Situation:\n')); pre.appendChild(span('str', '  ' + d.situation + '\n\n')); }
      if (d.task) { pre.appendChild(span('hd', 'Task:\n')); pre.appendChild(span('str', '  ' + d.task + '\n\n')); }
      if (d.action) { pre.appendChild(span('hd', 'Action:\n')); pre.appendChild(span('str', '  ' + d.action + '\n\n')); }
      if (d.result) { pre.appendChild(span('hd', 'Result:\n')); pre.appendChild(span('str', '  ' + d.result + '\n\n')); }
      if (w.bullets.length) { pre.appendChild(span('hd', 'Resume bullets:\n')); w.bullets.forEach(function (b) { pre.appendChild(span('str', '  - ' + b + '\n')); }); pre.appendChild(document.createTextNode('\n')); }
      if (w.tech.length) { pre.appendChild(span('hd', 'Tech:\n')); pre.appendChild(span('str', '  ' + w.tech.join(', ') + '\n\n')); }
      if (w.links.length) { pre.appendChild(span('hd', 'Links:\n')); w.links.forEach(function (l) { pre.appendChild(document.createTextNode('  ')); var a = h('a', '', l.label + '  ' + l.url); a.href = l.url; a.rel = 'noopener'; pre.appendChild(a); pre.appendChild(document.createTextNode('\n')); }); pre.appendChild(document.createTextNode('\n')); }
      pre.appendChild(span('hd', 'Events:\n'));
      pre.appendChild(span('dim', '  Type    Reason     Age        Message\n  ----    ------     ---        -------\n'));
      w.logs.forEach(function (l) {
        var warn = /^Warning/.test(l.m);
        pre.appendChild(span(warn ? 'warn' : 'str', '  ' + pad(warn ? 'Warning' : 'Normal', 8) + pad(warn ? 'SourceLost' : 'Progress', 11) + pad(age(l.t + '-01'), 11) + (warn ? l.m.replace(/^Warning\s+SourceLost\s+/, '') : l.m) + '\n'));
      });
      pre.appendChild(span('dim', '\n<l> logs   <y> yaml   <esc> back'));
    } else if (S.view === 'logs' && w) {
      title.appendChild(span('', ' Logs(' + w.ns + '/' + w.name + ')'));
      title.appendChild(span('hl', S.autoscroll ? '[Autoscroll:On]' : '[Autoscroll:Off]')); title.appendChild(span('', ' '));
      pre.id = 'k-log'; pre.className += ' k-raw';
    } else if (S.view === 'pcap') {
      title.appendChild(span('', ' PodScope(simulated capture) ')); title.appendChild(span('hl', S.autoscroll ? '[Live]' : '[Paused]')); title.appendChild(span('', ' '));
      pre.id = 'k-log'; pre.className += ' k-raw';
      pre.appendChild(span('dim', 'podscope tap -n cloud-eng -l app=uk-connectivity-proxy   # simulated, not real traffic\n'));
      pre.appendChild(span('key', pad('No.', 6) + pad('Time', 11) + pad('Source', 24) + pad('Destination', 24) + pad('Proto', 9) + pad('Len', 6) + 'Info\n'));
    } else if (S.view === 'yaml' && w) {
      title.appendChild(span('', ' YAML(' + w.ns + '/' + w.name + ') '));
      var obj = {
        apiVersion: 'career.ramymahi.dev/v1', kind: w.kind,
        metadata: { name: w.name, namespace: w.ns, labels: { role: w.role, tags: w.tags.join(',') }, creationTimestamp: w.started },
        spec: { title: w.title, summary: w.tagline, tech: w.tech, links: w.links.map(function (l) { return l.url; }), story: w.describe, bullets: w.bullets },
        status: { phase: w.status, ready: w.ready, restarts: w.restarts, ended: w.ended || null }
      };
      yaml(pre, obj, 0);
    } else if (S.view === 'cmdata') {
      var data = S.arg === 'tools' ? D.tools : D.skills;
      title.appendChild(span('', ' ConfigMap(' + S.arg + ') '));
      kv(pre, 'Name:         ', S.arg); kv(pre, 'Namespace:    ', S.arg === 'tools' ? 'sandbox' : 'cloud-eng');
      pre.appendChild(span('hd', '\nData\n====\n'));
      data.forEach(function (row) {
        pre.appendChild(span('key', row.key + ':\n')); pre.appendChild(span('dim', '----\n'));
        pre.appendChild(span('str', row.values.join('\n') + '\n\n'));
      });
    } else if (S.view === 'secretdata') {
      title.appendChild(span('', ' Secret(contact) ')); title.appendChild(span('hl', S.decoded ? '[decoded]' : '[base64]')); title.appendChild(span('', ' '));
      kv(pre, 'Name:         ', 'contact'); kv(pre, 'Namespace:    ', 'cloud-eng'); kv(pre, 'Type:         ', 'Opaque');
      pre.appendChild(span('hd', '\nData\n====\n'));
      Object.keys(D.contact).forEach(function (k) {
        var v = D.contact[k];
        pre.appendChild(span('key', k + ':  '));
        if (S.decoded) {
          if (/^https?:/.test(v) || k === 'email') { var a = h('a', '', v); a.href = k === 'email' ? 'mailto:' + v : v; a.rel = 'noopener'; pre.appendChild(a); }
          else pre.appendChild(span('str', v));
        } else pre.appendChild(span('str', b64(v)));
        pre.appendChild(document.createTextNode('\n'));
      });
      pre.appendChild(span('dim', '\n<x> ' + (S.decoded ? 'encode' : 'decode') + '   <esc> back'));
    } else if (S.view === 'decision') {
      var dec = D.decisions.filter(function (x) { return x.name === S.arg; })[0];
      title.appendChild(span('', ' Decision(' + dec.name + ') '));
      kv(pre, 'Name:         ', dec.name); kv(pre, 'Date:         ', dec.date);
      pre.appendChild(span('hd', '\nContext:\n')); pre.appendChild(span('str', '  ' + dec.context + '\n\n'));
      pre.appendChild(span('hd', 'Options considered:\n')); dec.options.forEach(function (o) { pre.appendChild(span('str', '  - ' + o + '\n')); });
      pre.appendChild(span('hd', '\nDecision:\n')); pre.appendChild(span('ok', '  ' + dec.decision + '\n\n'));
      pre.appendChild(span('hd', 'Why:\n')); pre.appendChild(span('str', '  ' + dec.why + '\n\n'));
      pre.appendChild(span('hd', 'Consequences:\n')); pre.appendChild(span('str', '  ' + dec.consequence + '\n'));
    } else if (S.view === 'now') {
      title.appendChild(span('', ' Now(' + D.now.updated + ') '));
      kv(pre, 'Name:         ', 'now'); kv(pre, 'Namespace:    ', 'sandbox'); kv(pre, 'Updated:      ', D.now.updated);
      pre.appendChild(span('hd', '\nCurrently:\n'));
      D.now.items.forEach(function (i) { pre.appendChild(span('str', '  - ' + i + '\n')); });
      pre.appendChild(span('dim', '\nThis is a living list. If it looks stale, so am I.'));
    } else {
      pre.appendChild(span('err', 'nothing here'));
    }
    body.appendChild(pre);
  }

  function yaml(pre, v, ind) {
    var sp = function (n) { var s = ''; while (n--) s += ' '; return s; };
    if (Array.isArray(v)) {
      if (!v.length) { pre.appendChild(span('dim', ' []\n')); return; }
      pre.appendChild(document.createTextNode('\n'));
      v.forEach(function (x) {
        pre.appendChild(span('str', sp(ind) + '- '));
        if (x && typeof x === 'object') { yamlObj(pre, x, ind + 2, true); }
        else { pre.appendChild(span(typeof x === 'number' ? 'num' : 'str', String(x) + '\n')); }
      });
      return;
    }
    if (v && typeof v === 'object') { pre.appendChild(document.createTextNode('\n')); yamlObj(pre, v, ind, false); return; }
    pre.appendChild(span(typeof v === 'number' ? 'num' : v === null ? 'dim' : 'str', ' ' + (v === null ? 'null' : String(v)) + '\n'));
  }
  function yamlObj(pre, o, ind, inline) {
    var keys = Object.keys(o), first = true;
    var sp = function (n) { var s = ''; while (n--) s += ' '; return s; };
    keys.forEach(function (k) {
      if (!(inline && first)) pre.appendChild(document.createTextNode(sp(ind)));
      first = false;
      pre.appendChild(span('key', k + ':'));
      yaml(pre, o[k], ind + 2);
    });
  }

  function renderPrompt() {
    var p = els.prompt; p.textContent = '';
    if (S.cmd) {
      p.className = 'k-prompt on';
      p.appendChild(span('p', '> ')); p.appendChild(span('', S.cmdText)); p.appendChild(span('cur', ' '));
      var sug = ALIASES.filter(function (a) { return S.cmdText && a[0].indexOf(S.cmdText.split(' ')[0]) === 0; })[0];
      if (sug && sug[0] !== S.cmdText) p.appendChild(span('sug', '  ' + sug[0]));
      p.appendChild(span('hint', '<tab> complete  <enter> run  <esc> cancel'));
    } else if (S.flt) {
      p.className = 'k-prompt on';
      p.appendChild(span('p', '/ ')); p.appendChild(span('', S.fltText)); p.appendChild(span('cur', ' '));
      p.appendChild(span('hint', '<enter> apply  <esc> clear'));
    } else p.className = 'k-prompt';
    if (els.mobileInput) els.mobileInput.value = S.cmd ? ':' + S.cmdText : S.flt ? '/' + S.fltText : '';
  }

  function renderCrumbs() {
    var c = els.crumbs; c.textContent = '';
    var trail = S.stack.map(function (s) { return s.view; }).concat([S.view]);
    trail = trail.map(function (v) { return v === 'pods' && S.arg === 'deploy' ? 'deploy' : v; });
    trail.forEach(function (v, i) { c.appendChild(span('k-crumb' + (i === trail.length - 1 ? ' active' : ''), '<' + v + '>')); });
    if (S.flash) c.appendChild(span('k-flash', S.flash));
  }

  function renderModal() {
    var m = els.modal;
    m.hidden = !S.help;
    if (!S.help) return;
    m.textContent = '';
    m.appendChild(h('h3', '', 'Help'));
    var cols = h('div', 'cols');
    var groups = [
      ['NAVIGATION', [['j/k ↓↑', 'move'], ['enter', 'drill in'], ['esc', 'back'], ['g / G', 'top / bottom'], ['q', 'back, quit at root']]],
      ['RESOURCE', [['d', 'describe'], ['l', 'logs'], ['y', 'yaml'], ['x', 'decode secret'], ['s', 'toggle autoscroll']]],
      ['GENERAL', [[':', 'command'], ['/', 'filter'], ['?', 'this help'], ['ctrl-a', 'aliases'], ['0-6', 'namespace']]],
      ['COMMANDS', ALIASES.map(function (a) { return [a[1], a[2]]; })]
    ];
    groups.forEach(function (g) {
      var box = h('div', g[0] === 'COMMANDS' ? 'wide' : ''); box.appendChild(span('dim', g[0] + '\n'));
      g[1].forEach(function (k) { var line = h('div'); line.appendChild(span('key' + (/^\d/.test(k[0]) ? ' num' : ''), pad(k[0], 10))); line.appendChild(span('lbl', k[1])); box.appendChild(line); });
      cols.appendChild(box);
    });
    m.appendChild(cols);
    m.appendChild(span('dim', '\nThis is a resume. Nothing you press here can delete a pod. Press esc to close.'));
  }

  /* ---------- streams (logs, pcap) ---------- */
  function stopTimers() { timers.forEach(clearTimeout); timers = []; }
  function startStream() {
    var w = wl(S.arg), pre = document.getElementById('k-log'); if (!pre) return;
    var i = 0;
    if (S.view === 'logs' && w) {
      var lines = w.logs.slice();
      var tick = function () {
        if (i >= lines.length) { pre.appendChild(span('dim', '\n[end of log stream]')); return; }
        if (!S.autoscroll) { timers.push(setTimeout(tick, 400)); return; }
        var l = lines[i++];
        pre.appendChild(span('ts', l.t + '-01T09:00:00Z ')); pre.appendChild(span('pod', w.name + ' '));
        pre.appendChild(span(/^Warning/.test(l.m) ? 'warn' : 'str', l.m + '\n'));
        pre.scrollTop = pre.scrollHeight; els.body.scrollTop = els.body.scrollHeight;
        timers.push(setTimeout(tick, i < 2 ? 120 : 380));
      };
      tick();
    } else if (S.view === 'pcap') {
      var t0 = Date.now(), n = 0;
      var srcs = ['10.244.1.17', '10.244.2.41', '10.244.0.9', '10.244.3.22'];
      var dsts = [['10.0.12.5:443', 'TLSv1.3', 'Application Data'], ['10.0.12.5:443', 'TCP', '[ACK] Seq=1 Ack=1 Win=501'], ['10.96.0.10:53', 'DNS', 'Standard query A partner.internal'], ['10.96.0.10:53', 'DNS', 'Standard query response A 10.0.12.5'], ['10.0.12.5:443', 'TLSv1.3', 'Client Hello (SNI=partner.internal)'], ['10.0.12.5:443', 'TLSv1.3', 'Server Hello, Change Cipher Spec'], ['10.0.12.5:443', 'HTTP', 'GET /api/v2/orders?region=uk (reassembled)'], ['10.0.12.5:443', 'TCP', '[FIN, ACK] Seq=2211 Ack=1812']];
      var tick = function () {
        if (!S.autoscroll) { timers.push(setTimeout(tick, 300)); return; }
        n++;
        var s = srcs[n % srcs.length] + ':' + (40000 + (n * 37) % 20000), d = dsts[n % dsts.length];
        var line = pad(n, 6) + pad(((Date.now() - t0) / 1000).toFixed(3), 11) + pad(s, 24) + pad(d[0], 24) + pad(d[1], 9) + pad(60 + (n * 53) % 1400, 6) + d[2] + '\n';
        pre.appendChild(span(d[1] === 'DNS' ? 'warn' : d[1] === 'HTTP' ? 'ok' : 'str', line));
        while (pre.childNodes.length > 200) pre.removeChild(pre.childNodes[2]);
        els.body.scrollTop = els.body.scrollHeight;
        timers.push(setTimeout(tick, 140 + Math.random() * 400));
      };
      tick();
    }
  }
  function jitter() {
    CPU = Math.max(4, Math.min(90, CPU + Math.round((Math.random() - 0.5) * 8)));
    MEM = Math.max(10, Math.min(95, MEM + Math.round((Math.random() - 0.5) * 4)));
    if (!root.hidden) renderHead();
  }

  /* ---------- keys ---------- */
  function onKey(e) {
    if (root.hidden) return;
    if (e.metaKey && !e.ctrlKey) return;
    var k = e.key;
    if (S.cmd) {
      e.preventDefault();
      if (k === 'Escape') { S.cmd = false; S.cmdText = ''; render(); }
      else if (k === 'Enter') { var c = S.cmdText; S.cmd = false; S.cmdText = ''; if (c.trim()) runCmd(c); else render(); }
      else if (k === 'Backspace') { S.cmdText = S.cmdText.slice(0, -1); renderPrompt(); }
      else if (k === 'Tab') { var sug = ALIASES.filter(function (a) { return a[0].indexOf(S.cmdText) === 0; })[0]; if (sug) S.cmdText = sug[0]; renderPrompt(); }
      else if (k.length === 1) { S.cmdText += k; renderPrompt(); }
      return;
    }
    if (S.flt) {
      e.preventDefault();
      if (k === 'Escape') { S.flt = false; S.fltText = ''; S.filter = ''; render(); }
      else if (k === 'Enter') { S.flt = false; S.filter = S.fltText; S.sel = 0; render(); }
      else if (k === 'Backspace') { S.fltText = S.fltText.slice(0, -1); S.filter = S.fltText; S.sel = 0; render(); }
      else if (k.length === 1) { S.fltText += k; S.filter = S.fltText; S.sel = 0; render(); }
      return;
    }
    if (S.help) { if (k === 'Escape' || k === '?' || k === 'q' || k === 'Enter') { S.help = false; render(); } e.preventDefault(); return; }
    if (e.ctrlKey && k === 'a') { e.preventDefault(); S.stack = []; go('aliases'); return; }
    if (e.ctrlKey && k === 'c') { quit(); return; }
    if (e.ctrlKey) return;

    var V = VIEWS[S.view], rows = V ? V.rows() : [];
    var isText = !!TEXT_VIEWS[S.view];
    if (e.shiftKey && k === ';') k = ':';
    if (e.shiftKey && k === '/') k = '?';
    switch (k) {
      case ':': e.preventDefault(); S.cmd = true; S.cmdText = ''; renderPrompt(); break;
      case '/': e.preventDefault(); if (!isText) { S.flt = true; S.fltText = S.filter; renderPrompt(); } break;
      case '?': e.preventDefault(); S.help = true; render(); break;
      case 'Escape': e.preventDefault(); back(); break;
      case 'q': e.preventDefault(); if (S.view === 'pods' && !S.stack.length && !S.filter) quit(); else back(); break;
      case 'j': case 'ArrowDown': e.preventDefault(); if (isText) { els.body.scrollTop += 40; } else if (rows.length) { S.sel = Math.min(rows.length - 1, S.sel + 1); render(); } break;
      case 'k': case 'ArrowUp': e.preventDefault(); if (isText) { els.body.scrollTop -= 40; } else if (rows.length) { S.sel = Math.max(0, S.sel - 1); render(); } break;
      case 'g': e.preventDefault(); if (isText) els.body.scrollTop = 0; else { S.sel = 0; render(); } break;
      case 'G': e.preventDefault(); if (isText) els.body.scrollTop = els.body.scrollHeight; else { S.sel = rows.length - 1; render(); } break;
      case 'PageDown': case ' ': if (isText) { e.preventDefault(); els.body.scrollTop += els.body.clientHeight * 0.8; } break;
      case 'PageUp': if (isText) { e.preventDefault(); els.body.scrollTop -= els.body.clientHeight * 0.8; } break;
      case 'Enter': e.preventDefault(); if (!isText && rows[S.sel]) V.enter(rows[S.sel]); break;
      case 'd': e.preventDefault(); if (S.view === 'pods' && rows[S.sel]) push('describe', rows[S.sel].name); else if (S.view === 'decisions' && rows[S.sel]) push('decision', rows[S.sel].name); else if (S.view === 'cm' && rows[S.sel]) push('cmdata', rows[S.sel].name); else if (S.view === 'secret') push('secretdata', 'contact'); break;
      case 'l': e.preventDefault(); if (S.view === 'pods' && rows[S.sel]) push('logs', rows[S.sel].name); else if ((S.view === 'describe' || S.view === 'yaml') && S.arg) push('logs', S.arg); break;
      case 'y': e.preventDefault(); if (S.view === 'pods' && rows[S.sel]) push('yaml', rows[S.sel].name); else if ((S.view === 'describe' || S.view === 'logs') && wl(S.arg)) push('yaml', S.arg); break;
      case 'x': e.preventDefault(); if (S.view === 'secretdata') { S.decoded = !S.decoded; render(); } break;
      case 's': e.preventDefault(); if (S.view === 'logs' || S.view === 'pcap') { S.autoscroll = !S.autoscroll; renderFrame(); } break;
      default:
        if (/^[0-9]$/.test(k)) {
          e.preventDefault();
          var idx = parseInt(k, 10);
          if (idx === 0) { S.ns = 'all'; } else if (D.namespaces[idx - 1]) { S.ns = D.namespaces[idx - 1].name; } else break;
          S.stack = []; go('pods', S.arg === 'deploy' ? 'deploy' : null);
        }
    }
  }

  /* ---------- mount / open ---------- */
  function build() {
    root.textContent = '';
    var boot = h('pre', 'k-boot'); els.boot = boot;
    var head = h('div', 'k-head');
    els.info = h('pre', 'k-info'); els.hints = h('div', 'k-hints'); els.logo = h('pre', 'k-logo');
    head.appendChild(els.info); head.appendChild(els.hints); head.appendChild(els.logo);
    var frame = h('div', 'k-frame');
    els.title = h('div', 'k-title'); els.body = h('div', 'k-body'); els.body.tabIndex = -1;
    els.modal = h('div', 'k-modal'); els.modal.hidden = true;
    frame.appendChild(els.title); frame.appendChild(els.body); frame.appendChild(els.modal);
    els.prompt = h('div', 'k-prompt');
    els.crumbs = h('div', 'k-crumbs');

    var tools = h('div', 'k-tools');
    var mk = function (label, fn, cls) { var b = h('button', cls || '', label); b.type = 'button'; b.addEventListener('click', function () { fn(); }); return b; };
    var fake = function (key, extra) { var ev = { key: key, preventDefault: function () {}, ctrlKey: !!(extra && extra.ctrl), metaKey: false }; onKey(ev); };
    els.mobileInput = h('input'); els.mobileInput.placeholder = ':command or /filter'; els.mobileInput.setAttribute('aria-label', 'command');
    els.mobileInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var v = els.mobileInput.value.trim(); els.mobileInput.value = ''; els.mobileInput.blur(); if (v.charAt(0) === '/') { S.filter = v.slice(1); S.sel = 0; render(); } else if (v) { runCmd(v.replace(/^:/, '')); } }
      e.stopPropagation();
    });
    tools.appendChild(mk('↑', function () { fake('ArrowUp'); }));
    tools.appendChild(mk('↓', function () { fake('ArrowDown'); }));
    tools.appendChild(mk('enter', function () { fake('Enter'); }));
    tools.appendChild(mk('esc', function () { fake('Escape'); }));
    tools.appendChild(mk('d', function () { fake('d'); }));
    tools.appendChild(mk('l', function () { fake('l'); }));
    tools.appendChild(mk('x', function () { fake('x'); }));
    tools.appendChild(els.mobileInput);
    tools.appendChild(mk('?', function () { fake('?'); }));
    tools.appendChild(mk('quit', function () { quit(); }, 'q'));

    root.appendChild(boot); root.appendChild(head); root.appendChild(frame); root.appendChild(els.prompt); root.appendChild(els.crumbs); root.appendChild(tools);
    els.body.addEventListener('click', function () { els.body.focus({ preventScroll: true }); });
  }

  function bootSequence() {
    var boot = els.boot;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false; try { seen = sessionStorage.getItem('k9s-booted') === '1'; } catch (e) {}
    if (reduce || seen) { boot.remove(); return; }
    try { sessionStorage.setItem('k9s-booted', '1'); } catch (e) {}
    var steps = [
      ['p', '$ '], ['', 'kubectl config use-context ramy-alrammahi\n'],
      ['d', 'Switched to context "ramy-alrammahi".\n'],
      ['p', '$ '], ['', 'k9s\n']
    ];
    var i = 0;
    var next = function () {
      if (i >= steps.length) { timers.push(setTimeout(function () { boot.remove(); }, 350)); return; }
      var s = steps[i++]; boot.appendChild(span(s[0], s[1]));
      timers.push(setTimeout(next, s[0] === 'p' ? 120 : 330));
    };
    next();
  }

  function mount(el, data, o) {
    root = el; D = data; opts = o || {};
    build();
    document.addEventListener('keydown', onKey);
    setInterval(jitter, 2500);
    render();
    bootSequence();
  }

  /* open('' | '/pod/<name>' | '/ns/<name>' | '/<command>') */
  function open(path) {
    path = (path || '').replace(/^\/+/, '');
    if (!path) { if (S.view === 'pods' && !S.stack.length) render(); return; }
    var p = path.split('/');
    if (p[0] === 'pod' && p[1] && wl(p[1])) { S.ns = 'all'; go('pods'); var rows = pods(); S.sel = Math.max(0, rows.map(function (r) { return r.name; }).indexOf(p[1])); push('describe', p[1]); return; }
    if (p[0] === 'ns' && p[1] && nsList().indexOf(p[1]) >= 0) { S.ns = p[1]; go('pods'); return; }
    runCmd(p.join(' '));
  }

  return { mount: mount, open: open };
})();
