# The AI Engineer's Grimoire

A static field reference for transformer internals — architectures, training,
fine-tuning, inference, interpretability, adversarial ML and evaluation. Built
from the design in `design/AI Grimoire v2.dc.html`.

## Stack

Astro content collections · MDX · KaTeX · Shiki · Tailwind CSS v4 · TypeScript.

No client framework. The three interactive pieces — the home terminal, the index
filter/sort/grep, and the code copy button — are small vanilla scripts. Fonts are
self-hosted, so a page needs no third-party request to render.

Written and maintained by [Gaurav Raj](https://thehackersbrain.dev)
(@thehackersbrain). Corrections to <gaurav@thehackersbrain.dev>.

## Deploying

The site is served from `https://aiwiki.thehackersbrain.dev`, set as `SITE_URL`
in `src/consts.ts`. Canonicals, the sitemap, `robots.txt`, the RSS feed and
every `og:` image URL are built from it, so it is the one value to change if the
origin ever moves.

`npm run build` produces a plain static tree in `dist/` — no server, no runtime.

`vercel.json` pins the response headers rather than inheriting defaults:

- `/_astro/*` is content-hashed, so it is cached `immutable` for a year. Nothing
  else is — `/fonts` and `/og` have stable filenames, so they get a long TTL with
  revalidation, and HTML is `max-age=0, must-revalidate` so a deploy is picked
  up at once.
- A CSP locked to `'self'`. The site loads nothing third-party, so the only
  relaxations are `'unsafe-inline'` for Astro's inline scripts and KaTeX's
  inline styles, and `data:` for the KaTeX font files the build inlines.
- `trailingSlash: false` and `cleanUrls`, matching the canonical URLs.

### If the CSS 404s after a deploy

An error response cached under the `/_astro/*` immutable rule will persist for a
year. Confirm with a cache-buster — `curl -I '<asset-url>?x=1'` returning 200
while the bare URL 404s is the signature — then purge that URL at the CDN. The
site sits behind Cloudflare in front of Vercel, so both layers cache
independently and both need purging.

## Commands

| Command           | Does                             |
| ----------------- | -------------------------------- |
| `npm run dev`     | dev server on `localhost:4321`   |
| `npm run build`   | static build into `dist/`        |
| `npm run preview` | serve the built site             |
| `npm run check`   | Astro + TypeScript diagnostics   |

## Layout

```
src/
  content/
    entries/*.mdx        the book itself — one file per entry
    categories/*.md      the seven shelves; the body is the shelf description
    subcategories/
      <shelf>/*.md       branches of a shelf; the body is the branch description
  content.config.ts      collection schemas (zod), including entry↔entry refs
  components/
    mdx/Note.astro       margin note, lifted out of the flow into the margin
    mdx/Eq.astro         display equation with caption and attribution
    mdx/CodeFrame.astro  code frame with gutter label and copy button
    mdx/Rule.astro       section hairline with a margin label
    Rail.astro           the 210px margin / 1fr body grid used by every section
    Breadcrumb.astro
    Seo.astro            canonical, robots, OG, Twitter, JSON-LD, feed links
  lib/
    grimoire.ts          derived views over the collections (counts, tags, trees)
    schema.ts            JSON-LD nodes: WebSite, TechArticle, BreadcrumbList…
    og.ts                share-card renderer (satori → resvg)
    code-theme.ts        Shiki theme matching the palette
  consts.ts              site URL, name, descriptions, locale
  assets/fonts/          TTFs, used only to draw share cards at build time
  layouts/BaseLayout.astro
  pages/
    ...                  /  /entries  /entries/[slug]  /categories
                         /categories/[category]  /categories/[category]/[sub]
                         /colophon
    og/[slug].png.ts     a 1200×630 share card per entry, plus a default
    rss.xml.ts           revision log, newest first
    robots.txt.ts
  styles/
    global.css           design tokens as Tailwind @theme vars, plus entry prose
    fonts.css            generated @font-face rules for public/fonts
public/fonts/            self-hosted woff2 subsets (latin, latin-ext, greek)
```

## Shelves and branches

Categories nest one level. A shelf (`src/content/categories/inference.md`) holds
branches (`src/content/subcategories/inference/kv-cache.md`), and an entry is
filed on exactly one branch. Each level has a page:

```
/categories                        the seven shelves, branches listed under each
/categories/inference              one shelf, its entries grouped by branch
/categories/inference/kv-cache     one branch
```

The invariant the whole thing rests on: **a subcategory's id is
`<category>/<subcategory>`, and that is also its URL under `/categories/` and
the `path` printed on an entry's spec sheet.** So the directory a branch file
lives in must be named for its parent shelf's id, and the `category:` field
inside it must name that same shelf.

`path` on an entry is a `reference('subcategories')`, not a free string, so a
typo fails the build instead of quietly inventing an orphan branch.

### Adding a branch

Create `src/content/subcategories/<shelf>/<slug>.md`:

```md
---
num: '03'          # position within the shelf; two digits
name: Quantisation
blurb: fewer bits per weight, and where the error goes
category: inference
---

One paragraph of standfirst, shown on the branch page.
```

Then set `path: 'inference/quantisation'` on the entries that belong to it.
Branches are ordered by `num`, and an empty one still gets a page and still
appears in the shelf's margin — a gap in the book is worth showing.

## Writing an entry

Add an `.mdx` file to `src/content/entries/`. The filename is the slug and the
URL. Frontmatter carries the apparatus (spec sheet, tags, metrics, references,
related entries); the body carries the argument.

````mdx
---
name: Scaled Dot-Product Attention
desc: Content-based retrieval over key–value pairs with 1/√d_k logit scaling.
category: architectures
complexity: O(n²·d)
memory: O(n²)
tags: [attention, transformer, core]
path: architectures/attention
difficulty: intermediate
described: '2017'          # when the literature described it
added: 2024-11-02          # when it was promoted from a note
revised: 2026-08-28        # last touched; shown as "5d ago"
lede: Content-based retrieval over a set of key–value pairs.
related: [flash-attention]
refs:
  - cite: Vaswani et al. — Attention Is All You Need (2017)
    id: arXiv:1706.03762
    href: https://arxiv.org/abs/1706.03762
---

Inline maths is $\softmax(QK^\top / \sqrt{d_k})$, display maths goes in an `Eq`:

<Eq caption="eq. 1 — row-wise softmax" source="Vaswani et al. §3.2.1" lead>

$$
\mathrm{Attention}(Q, K, V) = \softmax\!\left( \frac{QK^{\top}}{\sqrt{d_k}} \right) V
$$

</Eq>

<Note label="in numbers">
A short remark, set beside the paragraph that provoked it.
</Note>

<Rule label="Implementation" />

<CodeFrame meta="python · torch ≥ 2.1">

```python
def attention(q, k, v): ...
```

</CodeFrame>
````

`Note`, `Eq`, `CodeFrame` and `Rule` need no import — the entry page passes them
to `<Content components={…} />`, so MDX resolves them by name.

### Maths

`remark-math` + `rehype-katex`, rendered at build time; no KaTeX runs in the
browser. A few macros are defined in `astro.config.mjs`: `\R`, `\E`, `\softmax`,
`\diag`, `\Var`, `\clip`, `\TopK`, `\norm`.

Display maths is set `nowrap` and runs the full width of the column rather than
the prose measure. Break a long expression yourself with an `aligned` block
rather than letting it wrap or scroll.

### Margin notes

`<Note>` sits in the flow at the point you place it but contributes no height,
so the prose reads straight through while the note is lifted into the margin
beside it. Below `md` the two collapse and the note becomes a callout above the
paragraph. Keep them short — a raised eyebrow, not an essay — and do not place
two long ones back to back, or the second will overlap the first.

### Stubs

Set `stub: true` on anything whose maths has not been rederived by hand or whose
code has not been run. The entry then renders a status block saying so, and is
marked as a stub in the index and its category. It is the one convention the
book enforces on itself.

## Derived, not maintained

Everything countable comes from the collection: the number in the header, the
standing note on the home page, per-category totals and stub counts, the tag
filter in the index margin, the recent-revisions list and every relative date
(from `revised`), and the pseudo-directory tree in each category's margin (from
each entry's `path`), including each branch's own count. Add an entry and they
all move.

## SEO

Every page carries a canonical URL, a description sized for a search snippet, an
Open Graph and Twitter card, and a JSON-LD graph. What each page type declares:

| Page       | Schema.org                                              |
| ---------- | ------------------------------------------------------- |
| every page | `WebSite` (with a `SearchAction`) + `Person`             |
| entry      | `TechArticle` + `BreadcrumbList`                         |
| category   | `CollectionPage` + `ItemList` + `BreadcrumbList`         |
| index      | `CollectionPage` + `ItemList` + `BreadcrumbList`         |

The `SearchAction` points at `/entries?q=…`, which the index page honours — so
it is a real entry point, not a decorative claim. Tag chips on an entry deep-link
to `/entries?tag=…` the same way.

**Dates.** `revised` and `added` are real dates in the frontmatter. The page
shows them relatively ("5d ago") via `relativeDate`, while `dateModified`,
`article:modified_time`, the RSS `pubDate` and the sitemap's `lastmod` all get
the ISO value. A category's `lastmod` is the newest revision on that shelf.

**Share cards.** `src/lib/og.ts` draws each entry's own header at 1200×630 with
satori — same palette, same two typefaces, the entry's complexity and tags along
the foot. They are rendered at build time into `dist/og/`.

**Citations.** An entry's reference list is emitted as `citation` nodes on the
`TechArticle`, which is the part of the page a crawler can corroborate against
the sources themselves.

**Headings.** One `h1` per page (the title), `h2` for each margin-labelled
section, `h3` for headings inside one. Keep maths out of headings — KaTeX
duplicates the TeX into the text layer, and that is what gets read back as the
heading text.

`npm run build` emits `sitemap-index.xml`, `robots.txt` and `rss.xml` alongside
the pages.
