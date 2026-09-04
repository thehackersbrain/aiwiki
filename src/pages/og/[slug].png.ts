import type { APIRoute } from 'astro';
import { allCategories, allEntries } from '../../lib/grimoire';
import { renderCard } from '../../lib/og';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

/** One share card per entry, plus a default for every other page. */
export async function getStaticPaths() {
  const entries = await allEntries();
  const categoryName = new Map(
    (await allCategories()).map((c) => [c.id, c.data.name])
  );

  return [
    {
      params: { slug: 'default' },
      props: {
        eyebrow: 'Field reference',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        spec: [],
        tags: [],
      },
    },
    ...entries.map((entry) => ({
      params: { slug: entry.id },
      props: {
        eyebrow: categoryName.get(entry.data.category.id)!,
        title: entry.data.name,
        description: entry.data.desc,
        spec: [
          { k: 'time', v: entry.data.complexity },
          ...(entry.data.memory ? [{ k: 'mem', v: entry.data.memory }] : []),
        ],
        tags: entry.data.tags,
      },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderCard(props as never), {
    headers: {
      'Content-Type': 'image/png',
      // Ignored by a static build — vercel.json governs. Kept in step with it.
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
