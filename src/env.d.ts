/// <reference types="astro/client" />

declare global {
  interface Window {
    /** Slug list published by the home page for the "random entry" link. */
    __GRIMOIRE_SLUGS__?: string[];
  }
}

export {};
