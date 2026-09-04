/**
 * Client-side pagination. Runs in the browser only.
 *
 * Rows are hidden, never removed: filtering, in-page find and a crawler all
 * still see the whole list, and the page costs no extra requests to walk.
 *
 * Two callers share this. Simple lists drop in `<Pager />` and let `autoPager`
 * take charge of the rows in the enclosing `[data-paged]`. The index page draws
 * the same controls with `auto={false}` and drives them from its own script,
 * because there paging has to interleave with filtering and sorting; it borrows
 * `paintPages` so the two cannot drift apart visually.
 */

/** Draw the numbered page buttons, marking the current one. */
export function paintPages(
  into: HTMLElement,
  pages: number,
  current: number,
): void {
  into.replaceChildren(
    ...Array.from({ length: pages }, (_, i) => {
      const n = i + 1;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(n);
      button.dataset.page = String(n);
      button.setAttribute("aria-current", n === current ? "page" : "false");
      button.className =
        "border px-2.5 py-1 transition-colors " +
        (n === current
          ? "border-accent text-chalk"
          : "border-edge text-mute-2 hover:border-accent hover:text-chalk");
      return button;
    }),
  );
}

/** Wire up every self-driving pager on the page. */
export function autoPager(): void {
  for (const pager of document.querySelectorAll<HTMLElement>(
    "[data-pager][data-auto]",
  )) {
    // A pager with no list to page is a mistake in the caller, but it must not
    // take the other pagers on the page down with it.
    const scope = pager.closest<HTMLElement>("[data-paged]");
    if (!scope) {
      console.warn("Pager: no [data-paged] ancestor", pager);
      continue;
    }

    const rows = [...scope.querySelectorAll<HTMLElement>("[data-row]")];
    const range = pager.querySelector<HTMLElement>("[data-range]")!;
    const numbers = pager.querySelector<HTMLElement>("[data-page-numbers]")!;
    const prev = pager.querySelector<HTMLButtonElement>("[data-page-prev]")!;
    const next = pager.querySelector<HTMLButtonElement>("[data-page-next]")!;

    const per = Number(pager.dataset.per) || 10;
    const pages = Math.max(1, Math.ceil(rows.length / per));
    let page = 1;

    const render = () => {
      const start = (page - 1) * per;
      rows.forEach((row, i) => {
        row.hidden = i < start || i >= start + per;
      });

      pager.hidden = rows.length <= per;
      range.textContent = rows.length
        ? `${start + 1}–${Math.min(start + per, rows.length)} of ${rows.length}`
        : "";
      prev.disabled = page === 1;
      next.disabled = page === pages;
      paintPages(numbers, pages, page);
    };

    /** Change page, then put the top of the list back in view. */
    const goTo = (n: number) => {
      page = Math.min(Math.max(n, 1), pages);
      render();
      scope.scrollIntoView({ block: "start", behavior: "smooth" });
    };

    prev.addEventListener("click", () => goTo(page - 1));
    next.addEventListener("click", () => goTo(page + 1));
    numbers.addEventListener("click", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-page]",
      );
      if (target) goTo(Number(target.dataset.page));
    });

    render();
  }
}
