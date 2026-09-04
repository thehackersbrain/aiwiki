import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allCategories, allNotes, recentlyRevised } from '../lib/grimoire';
import { SITE_DESCRIPTION, SITE_LANG, SITE_TITLE } from '../consts';

/**
 * The book is "kept open, revised often" — so the feed is a revision log
 * rather than a publication log, newest revision first.
 */
export async function GET(context: APIContext) {
  const entries = await recentlyRevised(30);
  const notes = await allNotes();
  const categoryName = new Map(
    (await allCategories()).map((c) => [c.id, c.data.name])
  );

  // Entries and notes interleaved by revision date: a reader following the feed
  // wants whatever changed most recently, whichever half of the book it is in.
  const items = [
    ...entries.map((entry) => ({
      title: entry.data.name,
      description: entry.data.desc,
      link: `/entries/${entry.id}`,
      pubDate: entry.data.revised,
      categories: [categoryName.get(entry.data.category.id)!, ...entry.data.tags],
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      description: note.data.desc,
      link: `/notes/${note.id}`,
      pubDate: note.data.revised,
      categories: ['Notes', ...note.data.tags],
    })),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 30);

  return rss({
    title: `${SITE_TITLE} — recent revisions`,
    description: SITE_DESCRIPTION,
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData:
      `<language>${SITE_LANG}</language>` +
      `<atom:link href="${new URL('/rss.xml', context.site!).href}" rel="self" type="application/rss+xml"/>`,
    items,
  });
}
