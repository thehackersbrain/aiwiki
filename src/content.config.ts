import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const marginNote = z.object({
  /** Mono label above the note: 'aside', 'annotation', 'caveat', 'in practice'… */
  label: z.string(),
  html: z.string(),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    /** Two-digit ordinal used as the shelf mark throughout the book. */
    num: z.string().regex(/^\d{2}$/),
    name: z.string(),
    blurb: z.string(),
  }),
});

const subcategories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/subcategories' }),
  schema: z.object({
    /** Two-digit ordinal within the parent shelf. */
    num: z.string().regex(/^\d{2}$/),
    name: z.string(),
    blurb: z.string(),
    category: reference('categories'),
  }),
});

const entries = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/entries' }),
  schema: z.object({
    name: z.string(),
    desc: z.string(),
    category: reference('categories'),
    /** Asymptotic cost, or `—` where the entry is not an algorithm. */
    complexity: z.string(),
    memory: z.string().optional(),
    tags: z.array(z.string()).nonempty(),
    /** A stub means the maths is not yet rederived or the code has not been run. */
    stub: z.boolean().default(false),
    /**
     * Where the technique stands in current practice. Optional on purpose:
     * a badge on everything is a badge on nothing, so entries carry one only
     * where the judgement is worth making. See src/lib/status.ts, and
     * STATUS_AS_OF for when these were last reviewed.
     */
    status: z.enum(['standard', 'common', 'emerging', 'superseded']).optional(),
    /** One line on why it has that status, shown beside the badge. */
    statusNote: z.string().optional(),
    /**
     * The shelf the entry sits on. Its id is `<category>/<subcategory>`, which
     * is also the path printed on the spec sheet, so the string a writer types
     * is the same one the old free-text field held — but it is now checked, and
     * a typo fails the build rather than inventing an orphan subtree.
     */
    path: reference('subcategories'),
    difficulty: z.enum(['introductory', 'intermediate', 'advanced']),
    /** Year the technique first appeared in the literature. */
    described: z.string(),
    /** Real dates: the relative strings the page shows are derived from these. */
    revised: z.coerce.date(),
    added: z.coerce.date(),
    /** Standfirst under the title. Inline markdown is allowed. */
    lede: z.string(),
    metrics: z
      .object({
        caption: z.string(),
        rows: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              accent: z.boolean().default(false),
            })
          )
          .nonempty(),
      })
      .optional(),
    /** Margin note beside the Implementation section. */
    implNote: marginNote.optional(),
    related: z.array(reference('entries')).default([]),
    refs: z
      .array(
        z.object({
          cite: z.string(),
          id: z.string(),
          href: z.url().optional(),
        })
      )
      .default([]),
  }),
});

/**
 * The other half of the book. An entry answers "what is this and how does it
 * work"; a note answers "how did I come to understand it". Notes carry no spec
 * sheet, because there is nothing to specify — they are prose, and they are
 * allowed to be unfinished in a way an entry is not.
 */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    desc: z.string(),
    lede: z.string(),
    revised: z.coerce.date(),
    added: z.coerce.date(),
    tags: z.array(z.string()).nonempty(),
    /** Notes that read in order share a series slug and number their parts. */
    series: z.string().optional(),
    part: z.number().int().positive().optional(),
    /** Roughly how long it takes to read, in minutes; shown in the listing. */
    minutes: z.number().int().positive(),
    /** Said plainly at the top of the page rather than quietly omitted. */
    unfinished: z.boolean().default(false),
    /** The reference entries this note is a way into. */
    related: z.array(reference('entries')).default([]),
    refs: z
      .array(
        z.object({
          cite: z.string(),
          id: z.string(),
          href: z.url().optional(),
        })
      )
      .default([]),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({
    name: z.string(),
    blurb: z.string(),
    /** Order among series on the notes index. */
    num: z.string().regex(/^\d{2}$/),
  }),
});

export const collections = { entries, categories, subcategories, notes, series };
