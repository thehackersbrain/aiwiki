// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import fs from 'node:fs';
import path from 'node:path';
import { grimoireCodeTheme } from './src/lib/code-theme';
import { SITE_URL } from './src/consts';

/**
 * slug -> last revision, read straight off the entry frontmatter so the
 * sitemap's lastmod is the same date the page shows.
 */
const ENTRY_DIR = './src/content/entries';
const lastmod = new Map();

for (const file of fs.readdirSync(ENTRY_DIR)) {
  if (!file.endsWith('.mdx')) continue;
  const source = fs.readFileSync(path.join(ENTRY_DIR, file), 'utf8');
  const revised = /^revised: (\d{4}-\d{2}-\d{2})$/m.exec(source)?.[1];
  const category = /^category: '([^']+)'$/m.exec(source)?.[1];
  // `path` is `<category>/<subcategory>`, so it addresses the branch page too.
  const branch = /^path: '([^']+)'$/m.exec(source)?.[1];
  if (!revised) continue;

  lastmod.set(`/entries/${file.replace(/\.mdx$/, '')}`, revised);

  // A shelf, and each branch of it, is as fresh as the most recently revised
  // entry filed under it.
  for (const listing of [`/categories/${category}`, `/categories/${branch}`]) {
    if (revised > (lastmod.get(listing) ?? '')) lastmod.set(listing, revised);
  }
}

const NOTE_DIR = './src/content/notes';
if (fs.existsSync(NOTE_DIR)) {
  for (const file of fs.readdirSync(NOTE_DIR)) {
    if (!file.endsWith('.mdx')) continue;
    const source = fs.readFileSync(path.join(NOTE_DIR, file), 'utf8');
    const revised = /^revised: (\d{4}-\d{2}-\d{2})$/m.exec(source)?.[1];
    if (!revised) continue;

    lastmod.set(`/notes/${file.replace(/\.mdx$/, '')}`, revised);
    if (revised > (lastmod.get('/notes') ?? '')) lastmod.set('/notes', revised);
  }
}

/** The book as a whole is as fresh as its most recent revision. */
const newest = [...lastmod.values()].sort().at(-1);

export default defineConfig({
  site: SITE_URL,
  // Canonicals, internal links and the sitemap all agree on no trailing slash.
  trailingSlash: 'never',
  integrations: [
    mdx(),
    sitemap({
      // The 404 is not a destination.
      filter: (page) => !page.endsWith('/404'),
      serialize: (item) => {
        const { pathname } = new URL(item.url);
        // Anything that indexes entries rather than being one: the two roots,
        // and every shelf and branch page beneath /categories.
        const isListing =
          pathname === '/' ||
          pathname === '/entries' ||
          pathname === '/categories' ||
          pathname === '/notes' ||
          pathname.startsWith('/categories/');
        return {
          ...item,
          lastmod: lastmod.get(pathname) ?? newest,
          // The listings move whenever any entry does; an entry moves when it
          // is revised, which is rarer.
          changefreq: isListing ? 'weekly' : 'monthly',
          priority: pathname === '/' ? 1.0 : isListing ? 0.8 : 0.7,
        };
      },
    }),
  ],
  markdown: {
    // Sätteri is Astro's default Markdown processor and does not run
    // remark/rehype plugins; maths needs the unified pipeline.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [
          rehypeKatex,
          {
            // Errors belong in the build log, not rendered in red on the page.
            throwOnError: false,
            strict: 'ignore',
            macros: {
              '\\R': '\\mathbb{R}',
              '\\E': '\\mathbb{E}',
              '\\softmax': '\\operatorname{softmax}',
              '\\diag': '\\operatorname{diag}',
              '\\Var': '\\operatorname{Var}',
              '\\clip': '\\operatorname{clip}',
              '\\TopK': '\\operatorname{TopK}',
              '\\norm': '\\operatorname{norm}',
            },
          },
        ],
      ],
    }),
    shikiConfig: { theme: grimoireCodeTheme },
  },
  vite: { plugins: [tailwindcss()] },
});
