import {
  AUTHOR,
  AUTHOR_HANDLE,
  AUTHOR_URL,
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '../consts';
import type { Entry, Note } from './grimoire';

const url = (path = '/') => new URL(path, SITE_URL).href;

const SITE_ID = `${url()}#website`;
const AUTHOR_ID = `${url()}#author`;

/** Nodes every page carries, so the graph is connected wherever a crawler lands. */
export function siteNodes(): Record<string, unknown>[] {
  return [
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: url(),
      name: SITE_TITLE,
      alternateName: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: SITE_LANG,
      publisher: { '@id': AUTHOR_ID },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url('/entries')}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Person',
      '@id': AUTHOR_ID,
      name: AUTHOR,
      alternateName: `@${AUTHOR_HANDLE}`,
      url: AUTHOR_URL,
      email: `mailto:${CONTACT_EMAIL}`,
    },
  ];
}

export function breadcrumbs(
  trail: { name: string; path?: string }[]
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: url(crumb.path) } : {}),
    })),
  };
}

/**
 * An entry is a TechArticle: it has a thesis, sources and a revision date.
 * `citation` carries the reference list, which is the part a crawler can
 * actually corroborate.
 */
export function entryNode(entry: Entry, categoryName: string): Record<string, unknown> {
  const data = entry.data;
  const path = `/entries/${entry.id}`;

  return {
    '@type': 'TechArticle',
    '@id': `${url(path)}#article`,
    isPartOf: { '@id': SITE_ID },
    mainEntityOfPage: url(path),
    url: url(path),
    headline: data.name,
    name: data.name,
    description: data.desc,
    abstract: data.desc,
    inLanguage: SITE_LANG,
    articleSection: categoryName,
    keywords: data.tags.join(', '),
    proficiencyLevel: data.difficulty,
    datePublished: data.added.toISOString(),
    dateModified: data.revised.toISOString(),
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': AUTHOR_ID },
    image: url(`/og/${entry.id}.png`),
    ...(data.refs.length > 0
      ? {
          citation: data.refs.map((ref) => ({
            '@type': 'CreativeWork',
            name: ref.cite,
            identifier: ref.id,
            ...(ref.href ? { url: ref.href } : {}),
          })),
        }
      : {}),
  };
}

/**
 * A note is an Article rather than a TechArticle: it argues towards a result
 * instead of specifying one, and `proficiencyLevel` would be a claim it does
 * not make.
 */
export function noteNode(note: Note, sectionName: string): Record<string, unknown> {
  const data = note.data;
  const path = `/notes/${note.id}`;

  return {
    '@type': 'Article',
    '@id': `${url(path)}#article`,
    isPartOf: { '@id': SITE_ID },
    mainEntityOfPage: url(path),
    url: url(path),
    headline: data.title,
    name: data.title,
    description: data.desc,
    inLanguage: SITE_LANG,
    articleSection: sectionName,
    keywords: data.tags.join(', '),
    wordCount: data.minutes * 200,
    datePublished: data.added.toISOString(),
    dateModified: data.revised.toISOString(),
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': AUTHOR_ID },
    image: url('/og/default.png'),
    ...(data.refs.length > 0
      ? {
          citation: data.refs.map((ref) => ({
            '@type': 'CreativeWork',
            name: ref.cite,
            identifier: ref.id,
            ...(ref.href ? { url: ref.href } : {}),
          })),
        }
      : {}),
  };
}

export function collectionNode(options: {
  path: string;
  name: string;
  description: string;
  entries: Entry[];
}): Record<string, unknown> {
  return {
    '@type': 'CollectionPage',
    '@id': `${url(options.path)}#collection`,
    isPartOf: { '@id': SITE_ID },
    url: url(options.path),
    name: options.name,
    description: options.description,
    inLanguage: SITE_LANG,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.entries.length,
      itemListElement: options.entries.map((entry, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: url(`/entries/${entry.id}`),
        name: entry.data.name,
      })),
    },
  };
}
