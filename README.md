# ramymahi.dev

Portfolio site for Ramy AlRammahi. Plain HTML, CSS, and JavaScript. No build step, no framework, no tracking.

Two views of the same data:

- **Recruiter view** (default): `index.html`
- **k9s view**: `index.html#k9s`. A k9s-style terminal where the career is a cluster. Deep links: `#k9s/pod/podscope`, `#k9s/ns/sandbox`, `#k9s/events`.

## Editing content

Everything both views show lives in `assets/js/data.js`. Edit there only.

- `workloads`: roles and projects. `tags` control where they appear in the recruiter view (`experience`, `featured`, `oss`, `side`, `education`).
- `namespaces`: career eras.
- `now`, `talks`, `decisions`, `skills`, `tools`, `about`, `contact`.

Drop a headshot at `assets/img/ramy.jpg` (square, at least 320px). Until then the About section shows initials.

Replace `assets/Ramy_AlRammahi_Resume.pdf` whenever the resume changes.

## Local preview

Any static server works:

```bash
python -m http.server 8080
```

Then open http://localhost:8080 and http://localhost:8080/#k9s.

## Hosting (GitHub Pages + custom domain)

1. Push this repo to GitHub (for example `DominoRamino/portfolio`).
2. Settings > Pages > Source: Deploy from branch `main`, folder `/ (root)`.
3. `CNAME` already contains `ramymahi.dev`. Pages picks it up automatically.
4. At the registrar for ramymahi.dev, add DNS records:
   - `A` records for the apex (`@`) pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` pointing to `dominoramino.github.io`
5. Back in Settings > Pages, confirm the custom domain shows a green check, then enable **Enforce HTTPS** (may take up to an hour after DNS propagates).

## k9s view keys

`:` command, `/` filter, `j`/`k` move, `enter` drill in, `d` describe, `l` logs, `y` yaml, `x` decode secret, `s` toggle autoscroll, `0`-`6` namespaces, `?` help, `esc` back, `:q` quit to recruiter view.
