/* Recruiter view renderer. Reads window.RAMY, writes DOM. No innerHTML with raw data. */
window.RECRUITER = (function () {
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k]; /* only used with literal markup below */
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function ageOf(startIso) {
    var ms = Date.now() - new Date(startIso).getTime();
    var d = Math.floor(ms / 86400000);
    if (d < 365) return d + 'd';
    var y = Math.floor(d / 365), r = d % 365;
    return y + 'y' + (r ? r + 'd' : '');
  }

  function statusBadge(status) {
    return el('span', { class: 'status ' + status }, [el('span', { class: 'dot' }), status]);
  }
  function chips(list) {
    if (!list || !list.length) return null;
    return el('ul', { class: 'chips' }, list.map(function (t) { return el('li', { text: t }); }));
  }
  function k9sLink(w, label) {
    return el('a', { class: 'k', href: '#k9s/pod/' + w.name, title: 'Open in the k9s view' }, [label || ('describe ' + w.name + ' ›')]);
  }
  function section(key, note, title, body) {
    var keyEl = el('div', { class: 'key' }, [el('b', { text: key + ':' })]);
    if (note) keyEl.appendChild(el('span', { class: 'n', text: note }));
    var content = el('div', {}, [title ? el('h2', { text: title }) : null].concat(body));
    return el('section', { class: 'sec', id: key.replace(/_/g, '-') }, [keyEl, content]);
  }

  function render(root, D) {
    var P = D.profile;
    var byNs = {};
    D.workloads.forEach(function (w) { (byNs[w.ns] = byNs[w.ns] || []).push(w); });
    var tag = function (t) { return D.workloads.filter(function (w) { return w.tags.indexOf(t) >= 0; }); };

    /* ---- top bar ---- */
    var top = el('div', { class: 'topbar' }, [
      el('div', { class: 'ctx' }, [
        el('span', {}, ['context: ', el('b', { text: P.handle })]),
        el('span', {}, ['status: ', el('b', { class: 'run', text: 'Running' })]),
        el('span', {}, ['age: ', el('b', { text: ageOf('2000-12-01') })]),
        el('span', {}, ['updated: ', el('b', { text: P.updated })] )
      ]),
      el('a', { class: 'btn-k9s', href: '#k9s' }, [el('span', { class: 'caret', text: '>_' }), 'open in k9s'])
    ]);

    /* ---- hero ---- */
    var kget = el('pre', { class: 'kget', 'aria-label': 'kubectl style summary' });
    kget.appendChild(el('span', { class: 'p', text: '$ ' }));
    kget.appendChild(el('span', { class: 'v', text: 'kubectl get engineer ramy -o wide\n' }));
    var cols = [['NAME', 'ramy'], ['TITLE', 'Platform Engineer II'], ['EMPLOYER', "Domino's"], ['LOCATION', P.location], ['STATUS', 'Running'], ['AGE', ageOf('2023-06-01')]];
    var widths = cols.map(function (c) { return Math.max(c[0].length, c[1].length) + 3; });
    var pad = function (s, n) { while (s.length < n) s += ' '; return s; };
    var head = cols.map(function (c, i) { return pad(c[0], widths[i]); }).join('');
    kget.appendChild(el('span', { class: 'h', text: head.replace(/\s+$/, '') + '\n' }));
    cols.forEach(function (c, i) {
      var cell = pad(c[1], widths[i]);
      if (i === cols.length - 1) cell = cell.replace(/\s+$/, '');
      kget.appendChild(el('span', { class: c[0] === 'STATUS' ? 'ok' : 'v', text: cell }));
    });

    var hero = el('header', { class: 'hero' }, [
      el('h1', {}, [P.name.replace(/\s.*/, ''), ' ', P.name.replace(/^\S+\s/, ''), el('span', { class: 'dot', text: '.' })]),
      el('p', { class: 'tagline', text: P.tagline }),
      kget,
      el('div', { class: 'links' }, [
        el('a', { class: 'pdf', href: P.resumePdf, download: '' }, ['Download resume (PDF)']),
        el('a', { href: 'mailto:' + P.links.email }, [P.links.email]),
        el('a', { href: P.links.linkedin, rel: 'me noopener' }, ['LinkedIn']),
        el('a', { href: P.links.github, rel: 'me noopener' }, ['GitHub'])
      ])
    ]);

    /* ---- summary ---- */
    var summary = section('summary', null, null, [el('p', { text: P.summary })]);

    /* ---- experience ---- */
    var eras = ['cloud-eng', 'infra-aks', 'rotation'].map(function (nsName) {
      var ns = D.namespaces.filter(function (n) { return n.name === nsName; })[0];
      var items = (byNs[nsName] || []).filter(function (w) { return w.tags.indexOf('experience') >= 0; });
      var cap = nsName === 'rotation' ? 1 : 2;
      var kids = [el('div', { class: 'era-head' }, [el('h3', { text: ns.label }), el('span', { class: 'period', text: ns.period })])];
      if (nsName === 'rotation') kids.push(el('p', { class: 'muted', text: ns.desc }));
      items.forEach(function (w) {
        var bl = w.bullets.slice(0, cap);
        kids.push(el('div', { class: 'wl' }, [
          el('p', { class: 'wl-title' }, [el('a', { href: '#k9s/pod/' + w.name, title: 'Open in the k9s view' }, [w.title])]),
          el('ul', {}, bl.map(function (b) { return el('li', { text: b }); }))
        ]));
      });
      return el('div', { class: 'era' }, kids);
    });
    var experience = section('experience', '3 roles', 'Experience', [
      el('div', { class: 'employer' }, [el('b', { text: "Domino's" }), ' · Ann Arbor, MI · Jun 2023 - present'])
    ].concat(eras));

    /* ---- selected work ---- */
    function card(w) {
      var foot = [k9sLink(w)];
      (w.links || []).forEach(function (l) { foot.push(el('a', { href: l.url, rel: 'noopener' }, [l.label])); });
      return el('article', { class: 'card' }, [
        statusBadge(w.status),
        el('h3', { text: w.title }),
        el('p', { class: 'tag', text: w.tagline }),
        el('ul', {}, w.bullets.slice(0, 2).map(function (b) { return el('li', { text: b }); })),
        chips(w.tech),
        el('div', { class: 'foot' }, foot)
      ]);
    }
    var featured = tag('featured').filter(function (w) { return w.tags.indexOf('oss') < 0; });
    var selected = section('selected_work', featured.length + ' items', 'Selected work', [
      el('div', { class: 'cards' }, featured.map(card))
    ]);

    /* ---- open source ---- */
    var oss = tag('oss');
    var ps = oss.filter(function (w) { return w.name === 'podscope'; })[0];
    var ossKids = [el('div', { class: 'cards' }, oss.map(card))];
    if (ps) {
      var code = el('pre', { class: 'code' });
      ps.usage.split('\n').forEach(function (line, i) {
        if (i) code.appendChild(document.createTextNode('\n'));
        code.appendChild(el('span', { class: line.charAt(0) === '#' ? 'c' : '', text: line }));
      });
      ossKids.push(el('h3', { style: 'margin-top:26px', text: 'How PodScope works' }));
      ossKids.push(el('p', { text: ps.describe.situation + ' ' + ps.describe.task }));
      ossKids.push(el('div', { class: 'arch' }, ps.architecture.map(function (a) {
        return el('div', { class: 'part' }, [el('b', { text: a.part }), el('span', { text: a.does })]);
      })));
      ossKids.push(code);
      ossKids.push(el('p', { text: 'I designed the architecture and used AI-assisted development to implement it in Go and TypeScript. I own the testing, the production runs, and the decision to keep it ephemeral: when the session ends, nothing is left in the cluster.' }));
      ossKids.push(el('p', {}, [el('a', { href: ps.links[0].url, rel: 'noopener' }, ['Source, demo video, and README on GitHub'])]));
    }
    var openSource = section('open_source', oss.length + ' items', 'Open source', ossKids);

    /* ---- side projects ---- */
    var side = tag('side');
    var sideList = el('ul', { class: 'side' }, side.map(function (w) {
      return el('li', {}, [
        statusBadge(w.status),
        el('div', {}, [
          el('div', { class: 't' }, [el('a', { href: '#k9s/pod/' + w.name }, [w.title])]),
          el('div', { class: 'd', text: w.tagline })
        ])
      ]);
    }));
    var sideSec = section('side_projects', side.length + ' items', 'Side projects and the lab', [
      el('p', { class: 'muted', text: 'Built for fun, for learning, or because the tool did not exist. Statuses are honest.' }),
      sideList
    ]);

    /* ---- now ---- */
    var now = section('now', null, 'Now', [
      el('div', { class: 'now-updated', text: 'last updated ' + D.now.updated }),
      el('ul', {}, D.now.items.map(function (t) { return el('li', { text: t }); }))
    ]);

    /* ---- talks ---- */
    var talks = section('talks_and_teaching', D.talks.length + ' items', 'Talks and teaching', [
      el('ul', { class: 'talks' }, D.talks.map(function (t) {
        return el('li', {}, [el('div', { class: 'w', text: t.when }), el('div', {}, [el('div', { class: 'to', text: t.where }), el('div', { class: 'muted', text: t.what })])]);
      }))
    ]);

    /* ---- skills ---- */
    var dl = el('dl', { class: 'skills' });
    D.skills.forEach(function (s) {
      dl.appendChild(el('dt', { text: s.key }));
      dl.appendChild(el('dd', { class: s.key === 'familiar' ? 'familiar' : '', text: s.values.join(', ') + (s.key === 'familiar' ? ' (working familiarity)' : '') }));
    });
    var skills = section('skills', null, 'Skills', [dl]);

    /* ---- about ---- */
    var img = el('img', { class: 'photo', src: D.about.photo, alt: P.name, width: '160', height: '160' });
    var fallback = el('div', { class: 'photo-fallback', 'aria-hidden': 'true', text: 'RA' });
    fallback.hidden = true;
    img.addEventListener('error', function () { img.hidden = true; fallback.hidden = false; });
    var about = section('about', null, 'About', [
      el('div', { class: 'about' }, [
        el('div', {}, [img, fallback]),
        el('div', {}, D.about.bio.map(function (p) { return el('p', { text: p }); }))
      ])
    ]);

    /* ---- education ---- */
    var edu = (byNs['education'] || []).map(function (w) {
      return el('div', { class: 'wl' }, [el('p', { class: 'wl-title', text: w.title }), el('p', { class: 'muted', text: w.tagline })]);
    });
    var education = section('education', null, 'Education and certification', edu);

    /* ---- footer ---- */
    var footer = el('footer', {}, [
      el('span', {}, ['© ' + new Date().getFullYear() + ' ' + P.name + '. Plain HTML, no framework, no tracking.']),
      el('span', {}, [el('a', { href: '#k9s' }, [':k9s']), '  ·  ', el('a', { href: P.links.github, rel: 'noopener' }, ['github']), '  ·  ', el('a', { href: P.links.linkedin, rel: 'noopener' }, ['linkedin'])])
    ]);

    root.textContent = '';
    root.appendChild(el('div', { class: 'wrap' }, [
      top, hero,
      el('main', { id: 'main' }, [summary, experience, selected, openSource, sideSec, now, talks, skills, about, education]),
      footer
    ]));
  }

  return { render: render };
})();
