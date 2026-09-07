/* Editorial recruiter view. RAMY remains the single source of truth. */
window.RECRUITER = (function () {
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function chips(list, primary) { return el('ul', { class: 'chips' + (primary ? ' primary' : '') }, (list || []).map(function (x) { return el('li', { text: x }); })); }
  function section(i, id, title, note, body) {
    return el('section', { class: 'section', id: id }, [el('div', { class: 'section-label' }, [el('span', { class: 'section-index', text: '/' + String(i).padStart(2, '0') }), el('span', { text: title }), note ? el('span', { class: 'section-note', text: note }) : null]), el('div', { class: 'section-body' }, body)]);
  }
  function dot(status) { return el('span', { class: 'status-dot status-' + status.toLowerCase(), 'aria-hidden': 'true' }); }
  function details(w, label) { return el('a', { class: 'detail-link', href: '#k9s/pod/' + w.name, title: 'Open full detail in the interactive k9s view' }, [label || 'VIEW DETAILS', ' ↗']); }
  function card(w, i) {
    return el('article', { class: 'project-card' }, [
      /* Replace this placeholder with an img later; CSS preserves the aspect ratio. */
      el('div', { class: 'media-placeholder project-media', role: 'img', 'aria-label': 'Placeholder for ' + w.title }, [el('span', { class: 'media-code', text: 'WORKLOAD_' + String(i + 1).padStart(2, '0') }), el('span', { class: 'media-icon', 'aria-hidden': 'true', text: w.kind === 'Job' ? '{ }' : '< />' }), el('span', { class: 'media-status', text: w.status.toUpperCase() })]),
      el('div', { class: 'project-copy' }, [el('div', { class: 'project-meta' }, [el('span', { text: w.kind }), el('span', { text: w.role })]), el('h3', {}, [el('a', { href: '#k9s/pod/' + w.name, text: w.title })]), el('p', { text: w.tagline }), chips(w.tech.slice(0, 5)), el('div', { class: 'card-links' }, [details(w)].concat((w.links || []).map(function (l) { return el('a', { href: l.url, rel: 'noopener', text: l.label }); })))])
    ]);
  }
  function render(root, D) {
    var P = D.profile, byNs = {};
    D.workloads.forEach(function (w) { (byNs[w.ns] = byNs[w.ns] || []).push(w); });
    var tagged = function (t) { return D.workloads.filter(function (w) { return w.tags.indexOf(t) >= 0; }); };
    var first = P.name.split(' ')[0], last = P.name.slice(first.length + 1);
    var nav = el('nav', { class: 'site-nav', 'aria-label': 'Primary navigation' }, [el('a', { class: 'wordmark', href: '#top', 'aria-label': P.name + ' home' }, [el('span', { text: 'RA' }), el('i')]), el('div', { class: 'nav-status', text: 'SYS.TIME ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), el('div', { class: 'nav-links' }, [el('a', { href: '#experience', text: 'EXPERIENCE' }), el('a', { href: '#selected-work', text: 'PROJECTS' }), el('a', { href: '#skills', text: 'SKILLS' }), el('a', { href: '#about', text: 'ABOUT' })]), el('a', { class: 'terminal-link', href: '#k9s' }, [el('span', { text: '>_' }), ' K9S'])]);
    var hero = el('header', { class: 'hero', id: 'top' }, [
      el('div', { class: 'hero-grid' }, [
        el('div', { class: 'hero-copy' }, [el('div', { class: 'eyebrow' }, [el('span', { text: '/01' }), dot('running'), el('span', { text: 'ONLINE' })]), el('h1', {}, [el('span', { text: first }), el('span', { class: 'accent-name' }, [last, el('i', { class: 'name-cursor', 'aria-hidden': 'true' })])]), el('p', { class: 'hero-role', text: P.title + ' · ' + P.handle.replace(/-/g, ' ') }), el('p', { class: 'hero-tagline', text: P.tagline }), el('p', { class: 'hero-coordinates', text: 'X_' + P.updated.replace(/-/g, '.') + ' / LOC_' + P.location.toUpperCase() }), el('div', { class: 'hero-actions' }, [el('a', { class: 'button primary-button', href: 'mailto:' + P.links.email, text: 'CONTACT ↗' }), el('a', { class: 'button', href: P.links.github, rel: 'me noopener', text: 'GITHUB ↗' }), el('a', { class: 'button', href: P.resumePdf, download: '', text: 'RESUME.PDF ↓' })])]),
        el('div', { class: 'hero-visual frame-corners' }, [el('div', { class: 'media-placeholder hero-placeholder' }, [el('span', { class: 'visual-label', text: 'INFRASTRUCTURE / SYSTEMS' }), el('div', { class: 'network', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('i'), el('i'), el('i'), el('i')]), el('img', { class: 'hero-art', src: 'assets/img/image.png', alt: 'Abstract platform engineering infrastructure illustration', width: '2500', height: '2500', decoding: 'async', fetchpriority: 'high' }), el('span', { class: 'visual-readout', text: 'SYSTEMS\nOBSERVABLE\nRELIABLE\nSELF-HEALING' })]), el('span', { class: 'hero-badge', text: 'PLATFORM\nENGINEERING' })])
      ]),
      el('div', { class: 'status-bar' }, [['PROJECTS', String(D.workloads.length)], ['FOCUS', 'K8S + GITOPS'], ['STATUS', 'ACTIVE'], ['LOCATION', P.location.toUpperCase()]].map(function (x, i) { return el('div', {}, [el('span', { text: x[0] }), el('b', { text: x[1] }), i < 3 ? el('i') : null]); }))
    ]);
    var profile = section(2, 'profile', 'PROFILE', 'MANIFEST', [el('div', { class: 'summary-grid' }, [el('p', { class: 'summary-lead', text: P.summary }), el('pre', { class: 'code-panel', text: '$ kubectl get engineer ramy\nNAME    ROLE                  STATUS\nramy    Platform Engineer II  Running' })])]);
    var experienceRows = ['cloud-eng', 'infra-aks', 'rotation'].map(function (nsName) {
      var ns = D.namespaces.filter(function (n) { return n.name === nsName; })[0], jobs = (byNs[nsName] || []).filter(function (w) { return w.tags.indexOf('experience') >= 0; });
      var tech = jobs.reduce(function (a, w) { return a.concat(w.tech); }, []).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 4);
      return el('article', { class: 'experience-row' }, [el('div', { class: 'experience-meta' }, [el('time', { text: ns.period }), el('span', { text: "Domino's · " + P.location }), chips(tech)]), el('div', { class: 'experience-content' }, [el('h3', { text: ns.label }), el('p', { class: 'experience-desc', text: ns.desc }), el('div', { class: 'experience-work' }, jobs.map(function (w) { return el('div', {}, [el('h4', {}, [el('a', { href: '#k9s/pod/' + w.name, text: w.title })]), el('ul', {}, w.bullets.map(function (b) { return el('li', { text: b }); }))]); }))])]);
    });
    var experience = section(3, 'experience', 'EXPERIENCE', '3 CAREER ERAS', experienceRows);
    var featured = tagged('featured');
    var selected = section(4, 'selected-work', 'SELECTED WORK', featured.length + ' DEPLOYMENTS', [el('div', { class: 'project-grid' }, featured.map(card))]);
    var skills = section(5, 'skills', 'SKILLS', D.skills.length + ' DOMAINS', [el('div', { class: 'skills-matrix' }, D.skills.map(function (s) { return el('div', { class: 'skill-row' }, [el('h3', { text: s.key }), chips(s.values, s.key !== 'familiar')]); }))]);
    var side = tagged('side');
    var now = section(6, 'now', 'NOW / LAB', 'UPDATED ' + D.now.updated, [el('div', { class: 'lab-grid' }, [el('div', { class: 'current-list' }, [el('div', { class: 'terminal-kicker', text: '# currently_active' }), el('ol', {}, D.now.items.map(function (x) { return el('li', { text: x }); }))]), el('div', { class: 'lab-projects' }, side.map(function (w) { return el('a', { href: '#k9s/pod/' + w.name }, [dot(w.status), el('span', {}, [el('b', { text: w.title }), el('small', { text: w.tagline })])]); }))])]);
    var talks = section(7, 'talks', 'TALKS & TEACHING', D.talks.length + ' ENTRIES', [el('div', { class: 'talk-list' }, D.talks.map(function (t) { return el('article', {}, [el('time', { text: t.when }), el('div', {}, [el('h3', { text: t.where }), el('p', { text: t.what })])]); }))]);
    var education = byNs.education || [];
    var about = section(8, 'about', 'ABOUT', P.location.toUpperCase(), [el('div', { class: 'about-grid' }, [el('aside', { class: 'identity-card' }, [el('img', { class: 'portrait', src: D.about.photo, alt: P.name, width: '420', height: '420', loading: 'lazy' }), el('strong', { text: P.name.toUpperCase() }), el('span', { text: P.location }), el('div', { class: 'education-list' }, education.map(function (w) { return el('div', {}, [el('small', { text: w.role.toUpperCase() }), el('b', { text: w.title }), el('span', { text: w.tagline })]); }))]), el('div', { class: 'bio' }, D.about.bio.map(function (p) { return el('p', { text: p }); }).concat([el('pre', { class: 'about-code', text: '$ ramy --location "' + P.location + '"\n$ ramy --focus "platforms, tooling, people"\n$ ramy --contact ' + P.links.email + '\n> ready_' })]))])]);
    var footer = el('footer', { id: 'contact' }, [el('span', {}, [dot('running'), ' CONNECTION SECURE']), el('a', { class: 'access', href: 'mailto:' + P.links.email, text: '→ ACCESS GRANTED_' }), el('span', { text: '© ' + new Date().getFullYear() + ' ' + P.name + ' · NO TRACKING' }), el('div', {}, [el('a', { href: P.links.linkedin, rel: 'noopener', text: 'LINKEDIN' }), el('a', { href: P.links.github, rel: 'noopener', text: 'GITHUB' }), el('a', { href: '#k9s', text: 'K9S' })])]);
    root.textContent = '';
    root.appendChild(el('div', { class: 'site-shell' }, [nav, hero, el('main', { id: 'main' }, [profile, experience, selected, skills, now, talks, about]), footer]));
  }
  return { render: render };
})();
