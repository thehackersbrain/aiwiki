/**
 * Everything a canonical URL, a feed or a share card needs to know about the
 * site. SITE_URL is the origin every absolute URL is built from: canonicals,
 * the sitemap, robots.txt, the RSS feed and every og: image.
 */
export const SITE_URL = 'https://aiwiki.thehackersbrain.dev';

export const SITE_NAME = 'AI Grimoire';
export const SITE_TITLE = "The AI Engineer's Grimoire";

/** The full line, for the feed and the share card, where length is free. */
export const SITE_DESCRIPTION =
  'A field reference for how these systems actually work: attention, training ' +
  'dynamics that fail quietly, inference kernels, the interpretability ' +
  'toolkit, and the attack surface that follows.';

/** The same claim inside a search snippet's length. */
export const SITE_META_DESCRIPTION =
  'A field reference for transformer internals: attention, training dynamics, ' +
  'inference kernels, interpretability and adversarial ML. Maths first, then ' +
  'runnable code.';

export const SITE_LOCALE = 'en_GB';
export const SITE_LANG = 'en';

/** Named as the author on every entry, and in the JSON-LD Person node. */
export const AUTHOR = 'Gaurav Raj';
export const AUTHOR_HANDLE = 'thehackersbrain';
export const AUTHOR_URL = 'https://thehackersbrain.dev';

/** Where corrections go. Shown on the colophon and in the author schema. */
export const CONTACT_EMAIL = 'gaurav@thehackersbrain.dev';

/**
 * When the `status` judgements on entries were last reviewed as a set. A badge
 * saying "current standard" is a claim about a moment, so the moment is stated
 * wherever the badges are explained.
 */
export const STATUS_AS_OF = '2026-09';

/** Painted behind the browser chrome on mobile; matches --color-ink. */
export const THEME_COLOR = '#0e0f11';
