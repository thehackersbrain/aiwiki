import type { APIRoute } from 'astro';
import { SITE_URL } from '../consts';

const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', SITE_URL).href}
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
