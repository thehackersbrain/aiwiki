import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;
export type Category = CollectionEntry<'categories'>;
export type Subcategory = CollectionEntry<'subcategories'>;
export type Note = CollectionEntry<'notes'>;
export type Series = CollectionEntry<'series'>;

/** Entries, alphabetical. The collection's own order is filesystem order. */
export async function allEntries(): Promise<Entry[]> {
  const entries = await getCollection('entries');
  return entries.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

/** Categories in shelf order. */
export async function allCategories(): Promise<Category[]> {
  const categories = await getCollection('categories');
  return categories.sort((a, b) => a.data.num.localeCompare(b.data.num));
}

export async function entriesIn(categoryId: string): Promise<Entry[]> {
  const entries = await allEntries();
  return entries.filter((e) => e.data.category.id === categoryId);
}

export async function counts(): Promise<{ total: number; stubs: number }> {
  const entries = await getCollection('entries');
  return { total: entries.length, stubs: entries.filter((e) => e.data.stub).length };
}

export async function recentlyRevised(count?: number): Promise<Entry[]> {
  const entries = await getCollection('entries');
  const sorted = entries.sort(
    (a, b) => b.data.revised.getTime() - a.data.revised.getTime()
  );
  return count === undefined ? sorted : sorted.slice(0, count);
}

/** Tags offered in the index margin, most-used first. */
export async function tagCounts(limit = 10): Promise<{ tag: string; count: number }[]> {
  const entries = await getCollection('entries');
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

/** Subcategories in shelf order, across every category. */
export async function allSubcategories(): Promise<Subcategory[]> {
  const subs = await getCollection('subcategories');
  return subs.sort((a, b) => a.id.localeCompare(b.id));
}

/** The subcategories of one shelf, in their declared order. */
export async function subcategoriesIn(categoryId: string): Promise<Subcategory[]> {
  const subs = await getCollection('subcategories');
  return subs
    .filter((s) => s.data.category.id === categoryId)
    .sort((a, b) => a.data.num.localeCompare(b.data.num));
}

export async function entriesInSub(subcategoryId: string): Promise<Entry[]> {
  const entries = await allEntries();
  return entries.filter((e) => e.data.path.id === subcategoryId);
}

/**
 * The directory listing in a category's margin. Every subcategory of the shelf
 * appears, in declared order, whether or not anything has been filed under it
 * yet — an empty branch is a gap worth showing rather than one to hide.
 */
export async function subtreesOf(
  categoryId: string
): Promise<{ id: string; leaf: string; name: string; count: number }[]> {
  const [subs, entries] = await Promise.all([
    subcategoriesIn(categoryId),
    entriesIn(categoryId),
  ]);
  return subs.map((sub) => ({
    id: sub.id,
    leaf: sub.id.split('/').pop()!,
    name: sub.data.name,
    count: entries.filter((e) => e.data.path.id === sub.id).length,
  }));
}

/** Notes, newest revision first. */
export async function allNotes(): Promise<Note[]> {
  const notes = await getCollection('notes');
  return notes.sort((a, b) => b.data.revised.getTime() - a.data.revised.getTime());
}

export async function allSeries(): Promise<Series[]> {
  const series = await getCollection('series');
  return series.sort((a, b) => a.data.num.localeCompare(b.data.num));
}

/**
 * Notes grouped into their series, parts in order, with the loose notes — the
 * ones belonging to no sequence — returned separately.
 */
export async function seriesGroups(): Promise<{
  groups: { series: Series; notes: Note[] }[];
  loose: Note[];
}> {
  const [notes, series] = await Promise.all([allNotes(), allSeries()]);
  const groups = series.map((s) => ({
    series: s,
    notes: notes
      .filter((n) => n.data.series === s.id)
      .sort((a, b) => (a.data.part ?? 0) - (b.data.part ?? 0)),
  }));
  const grouped = new Set(groups.flatMap((g) => g.notes.map((n) => n.id)));
  return { groups, loose: notes.filter((n) => !grouped.has(n.id)) };
}

/** The parts either side of a note, so a series can be read straight through. */
export async function seriesNeighbours(
  note: Note
): Promise<{ series: Series | null; prev: Note | null; next: Note | null; parts: Note[] }> {
  if (!note.data.series) return { series: null, prev: null, next: null, parts: [] };

  const [notes, series] = await Promise.all([allNotes(), allSeries()]);
  const parts = notes
    .filter((n) => n.data.series === note.data.series)
    .sort((a, b) => (a.data.part ?? 0) - (b.data.part ?? 0));
  const at = parts.findIndex((n) => n.id === note.id);

  return {
    series: series.find((s) => s.id === note.data.series) ?? null,
    prev: parts[at - 1] ?? null,
    next: parts[at + 1] ?? null,
    parts,
  };
}

/**
 * The span the book covers, from the earliest entry to the most recent
 * revision — the range a copyright line should name. Both ends come from the
 * content, so neither can go stale.
 */
export async function copyrightYears(): Promise<{ from: number; to: number }> {
  const [entries, notes] = await Promise.all([
    getCollection('entries'),
    getCollection('notes'),
  ]);
  const all = [...entries, ...notes];
  return {
    from: Math.min(...all.map((e) => e.data.added.getUTCFullYear())),
    to: Math.max(...all.map((e) => e.data.revised.getUTCFullYear())),
  };
}

/** The date of the most recent revision anywhere in the book. */
export async function lastRevised(): Promise<Date> {
  const [entries, notes] = await Promise.all([
    getCollection('entries'),
    getCollection('notes'),
  ]);
  return [...entries, ...notes].reduce(
    (latest, e) => (e.data.revised > latest ? e.data.revised : latest),
    new Date(0)
  );
}

/** Render a date as the relative string the book shows: "4d ago", "3w ago". */
export function relativeDate(date: Date, now = new Date()): string {
  const days = Math.max(0, Math.round((now.getTime() - date.getTime()) / 86_400_000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

/** ISO-8601 date, for structured data and feeds. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * A meta description, built from the entry's standfirst rather than its
 * one-line summary: the summary is written for an index row and runs too
 * short to fill a search snippet. Strips the inline markup the lede allows.
 */
export function metaDescription(source: string, limit = 158): string {
  const text = source
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…';
}
