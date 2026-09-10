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
    var media = w.image
      ? el('div', { class: 'project-media has-image', role: 'img', 'aria-label': w.title }, [el('img', { class: 'project-art', src: w.image, alt: w.title, loading: 'lazy' }), el('span', { class: 'media-code', text: 'WORKLOAD_' + String(i + 1).padStart(2, '0') }), el('span', { class: 'media-status', text: w.status.toUpperCase() })])
      : el('div', { class: 'media-placeholder project-media', role: 'img', 'aria-label': 'Placeholder for ' + w.title }, [el('span', { class: 'media-code', text: 'WORKLOAD_' + String(i + 1).padStart(2, '0') }), el('span', { class: 'media-icon', 'aria-hidden': 'true', text: w.kind === 'Job' ? '{ }' : '< />' }), el('span', { class: 'media-status', text: w.status.toUpperCase() })]);
    return el('article', { class: 'project-card' }, [
      media,
      el('div', { class: 'project-copy' }, [el('div', { class: 'project-meta' }, [el('span', { text: w.kind }), el('span', { text: w.role })]), el('h3', {}, [el('a', { href: '#k9s/pod/' + w.name, text: w.title })]), el('p', { text: w.tagline }), chips(w.tech.slice(0, 5)), el('div', { class: 'card-links' }, [details(w)].concat((w.links || []).map(function (l) { return el('a', { href: l.url, rel: 'noopener', text: l.label }); })))])
    ]);
  }
  /* Typewriter slots. Each animated line keeps its text in a .type-text span so the shared cursor can be
     re-parented between lines without textContent writes wiping it out. */
  function nameLine(text, cls) { return el('span', { class: 'type-line' + cls }, [el('span', { class: 'type-text', text: text })]); }
  function roleLine(P) {
    var roles = (P.roles && P.roles.length) ? P.roles : [P.title];
    return el('p', { class: 'hero-role' }, [
      /* Screen readers get the roles once, flat; the animated copy would otherwise chatter a character at a time. */
      el('span', { class: 'sr-only', text: roles.join(', ') }),
      el('span', { class: 'typed-role', 'aria-hidden': 'true' }, [el('span', { class: 'type-text' }), el('i', { class: 'name-cursor' })])
    ]);
  }
  function typewriter(hero, P) {
    var roles = (P.roles && P.roles.length) ? P.roles : [P.title];
    var slots = hero.querySelectorAll('.type-text'), cursor = hero.querySelector('.name-cursor');
    if (slots.length < 3 || !cursor) return;
    var firstSlot = slots[0], lastSlot = slots[1], roleSlot = slots[2];
    var names = [firstSlot.textContent, lastSlot.textContent];
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { roleSlot.textContent = roles[0]; return; }

    function jitter(ms) { return ms * (0.72 + Math.random() * 0.56); }
    function moveCursor(slot) { slot.parentNode.appendChild(cursor); }
    /* Idle instead of advancing while the tab is backgrounded or the k9s view is up, so the loop never
       burns through the role list off-screen and returns mid-word. */
    function step(ms, next) { setTimeout(function () { if (document.hidden || hero.offsetParent === null) { step(420, next); } else { next(); } }, ms); }
    function type(slot, text, speed, next) {
      var n = slot.textContent.length;
      if (n >= text.length) { next(); return; }
      slot.textContent = text.slice(0, n + 1);
      step(jitter(speed), function () { type(slot, text, speed, next); });
    }
    function erase(slot, speed, next) {
      if (!slot.textContent) { next(); return; }
      slot.textContent = slot.textContent.slice(0, -1);
      step(jitter(speed), function () { erase(slot, speed, next); });
    }
    function cycle(i) {
      type(roleSlot, roles[i % roles.length], 66, function () {
        step(1750, function () { erase(roleSlot, 34, function () { step(320, function () { cycle(i + 1); }); }); });
      });
    }
    roleSlot.textContent = '';
    moveCursor(roleSlot);
    cycle(0);
  }
  function render(root, D) {
    var P = D.profile, byNs = {};
    D.workloads.forEach(function (w) { (byNs[w.ns] = byNs[w.ns] || []).push(w); });
    var tagged = function (t) { return D.workloads.filter(function (w) { return w.tags.indexOf(t) >= 0; }); };
    var first = P.name.split(' ')[0], last = P.name.slice(first.length + 1);
    var nav = el('nav', { class: 'site-nav', 'aria-label': 'Primary navigation' }, [el('a', { class: 'wordmark', href: '#top', 'aria-label': P.name + ' home' }, [el('span', { text: 'RA' }), el('i')]), el('div', { class: 'nav-status', text: 'SYS.TIME ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), el('div', { class: 'nav-links' }, [el('a', { href: '#experience', text: 'EXPERIENCE' }), el('a', { href: '#selected-work', text: 'PROJECTS' }), el('a', { href: '#skills', text: 'SKILLS' }), el('a', { href: '#about', text: 'ABOUT' })]), el('a', { class: 'terminal-link', href: '#k9s' }, [el('span', { text: '>_' }), ' K9S'])]);
    var hero = el('header', { class: 'hero', id: 'top' }, [
      el('div', { class: 'hero-grid' }, [
        el('div', { class: 'hero-copy' }, [el('div', { class: 'eyebrow' }, [dot('running'), el('span', { text: 'PLATFORM ENGINEERING' })]), el('h1', {}, [nameLine(first, ''), nameLine(last, ' accent-name')]), roleLine(P), el('p', { class: 'hero-tagline', text: P.tagline }), el('p', { class: 'hero-coordinates', text: P.location + ' / Kubernetes / GitOps / Azure' }), el('div', { class: 'hero-actions' }, [el('a', { class: 'button primary-button', href: 'mailto:' + P.links.email, text: 'CONTACT ↗' }), el('a', { class: 'button', href: P.links.github, rel: 'me noopener', text: 'GITHUB ↗' }), el('a', { class: 'button', href: P.resumePdf, download: '', text: 'RESUME.PDF ↓' })])]),
        el('div', { class: 'hero-visual' }, [el('div', { class: 'hero-window-bar', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('span', { text: 'ramy / workspace' })]), el('div', { class: 'media-placeholder hero-placeholder' }, [el('img', { class: 'hero-art', src: 'assets/img/hero-pixel.png', alt: 'Pixel-art scene of a developer coding at night: city skyline through the window, house plants, a bookshelf, a neon code icon, and a mug that reads code sleep repeat', width: '1916', height: '821', decoding: 'async', fetchpriority: 'high' })]), el('div', { class: 'hero-window-caption' }, [el('span', { text: 'Infrastructure. Tooling. People.' }), el('span', {}, [dot('running'), ' Always building'])])])
      ]),
      el('div', { class: 'status-bar' }, [['PROJECTS', String(D.workloads.length)], ['FOCUS', 'K8S + GITOPS'], ['STATUS', 'ACTIVE'], ['LOCATION', P.location.toUpperCase()]].map(function (x, i) { return el('div', {}, [el('span', { text: x[0] }), el('b', { text: x[1] }), i < 3 ? el('i') : null]); }))
    ]);
    var profile = section(2, 'profile', 'PROFILE', 'MANIFEST', [el('div', { class: 'summary-grid' }, [el('p', { class: 'summary-lead', text: P.summary }), el('pre', { class: 'code-panel', text: '$ kubectl get engineer ramy\nNAME    ROLE                  STATUS\nramy    Platform Engineer II  Running' })])]);
    var experienceRows = ['cloud-eng', 'infra-aks', 'software-eng'].map(function (nsName) {
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
    typewriter(hero, P);
  }
  return { render: render };
})();
