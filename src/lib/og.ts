import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE_NAME } from '../consts';

const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');

const load = (file: string) => fs.readFile(path.join(FONT_DIR, file));

let fonts: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  const [serif, serifMedium, mono, monoBold] = await Promise.all([
    load('literata-400.ttf'),
    load('literata-500.ttf'),
    load('space-mono-400.ttf'),
    load('space-mono-700.ttf'),
  ]);
  return [
    { name: 'Literata', data: serif, weight: 400 as const, style: 'normal' as const },
    { name: 'Literata', data: serifMedium, weight: 500 as const, style: 'normal' as const },
    { name: 'Space Mono', data: mono, weight: 400 as const, style: 'normal' as const },
    { name: 'Space Mono', data: monoBold, weight: 700 as const, style: 'normal' as const },
  ];
}

const INK = '#0e0f11';
const RULE = '#1e2023';
const ACCENT = '#e0a86a';
const BONE = '#f4f6f8';
const LEDE = '#a9aeb5';
const DIM = '#6a6f76';

export interface CardOptions {
  /** Mono kicker above the title: the category, or the site name. */
  eyebrow: string;
  title: string;
  description: string;
  /** Mono spec pairs along the foot, e.g. `time / O(n²·d)`. */
  spec?: { k: string; v: string }[];
  tags?: string[];
}

/**
 * The share card is the entry's own header, redrawn at 1200×630: the same
 * margin rule, the same two typefaces, the same one accent.
 */
function card(o: CardOptions) {
  // Uppercase is for labels only: `n` and `d` in a complexity are variables,
  // and `[attention]` is a tag as the book writes it.
  const mono = (size: number, color: string, upper = false) => ({
    fontFamily: 'Space Mono',
    fontSize: size,
    fontWeight: 400 as const,
    color,
    letterSpacing: upper ? 3 : 1,
    ...(upper ? { textTransform: 'uppercase' as const } : {}),
  });

  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: INK,
        padding: '64px 72px',
        fontFamily: 'Literata',
      },
      children: [
        // ── Head rule ───────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${RULE}`,
              paddingBottom: 22,
            },
            children: [
              { type: 'div', props: { style: mono(19, BONE, true), children: SITE_NAME } },
              { type: 'div', props: { style: mono(19, ACCENT, true), children: o.eyebrow } },
            ],
          },
        },

        // ── Title and standfirst ────────────────────────────────────
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: o.title.length > 34 ? 62 : 76,
                    lineHeight: 1.12,
                    letterSpacing: -2,
                    color: BONE,
                    marginBottom: 22,
                  },
                  children: o.title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 27,
                    lineHeight: 1.5,
                    color: LEDE,
                    // Two lines of standfirst; the rest is on the page.
                    maxHeight: 82,
                    overflow: 'hidden',
                  },
                  children: o.description,
                },
              },
            ],
          },
        },

        // ── Foot rule ───────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${RULE}`,
              paddingTop: 22,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 26 },
                  children: (o.spec ?? []).map((s) => ({
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: 9, alignItems: 'baseline' },
                      children: [
                        { type: 'span', props: { style: mono(17, DIM, true), children: s.k } },
                        { type: 'span', props: { style: mono(17, ACCENT), children: s.v } },
                      ],
                    },
                  })),
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 10 },
                  children: (o.tags ?? []).slice(0, 3).map((t) => ({
                    type: 'div',
                    props: {
                      style: {
                        ...mono(15, ACCENT),
                        border: `1px solid #3d2c17`,
                        backgroundColor: '#1a1611',
                        padding: '6px 12px',
                      },
                      children: `[${t}]`,
                    },
                  })),
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** Render a card to PNG bytes, as an ArrayBuffer a Response can take directly. */
export async function renderCard(options: CardOptions): Promise<ArrayBuffer> {
  fonts ??= await loadFonts();

  const svg = await satori(card(options) as never, {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();
  return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}
