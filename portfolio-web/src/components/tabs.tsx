"use client";

import { useRef, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

// Accessible tabs (arrow-key navigation). Every panel is rendered; inactive
// ones are `hidden`, so all copy stays in the HTML.
export function Tabs({
  idBase,
  items,
  stacked,
}: {
  idBase: string;
  items: TabItem[];
  // Keep inactive panels laid out (invisible + inert) so the container is as
  // tall as the tallest one. `hidden` can't do this: Tailwind's preflight
  // forces display:none on it from a CSS layer that wins over any override.
  stacked?: boolean;
}) {
  const [active, setActive] = useState(items[0].id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const i = items.findIndex((x) => x.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else return;
    e.preventDefault();
    setActive(items[next].id);
    refs.current[items[next].id]?.focus();
  }

  return (
    <div className="tabs">
      <div role="tablist" className="tablist" onKeyDown={onKeyDown}>
        {items.map((it) => (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[it.id] = el;
            }}
            role="tab"
            type="button"
            id={`${idBase}-tab-${it.id}`}
            aria-selected={active === it.id}
            aria-controls={`${idBase}-panel-${it.id}`}
            tabIndex={active === it.id ? 0 : -1}
            className="tab"
            onClick={() => setActive(it.id)}
          >
            {it.label}
          </button>
        ))}
      </div>
      {items.map((it) => (
        <div
          key={it.id}
          role="tabpanel"
          id={`${idBase}-panel-${it.id}`}
          aria-labelledby={`${idBase}-tab-${it.id}`}
          hidden={stacked ? undefined : active !== it.id}
          inert={stacked && active !== it.id}
          data-inactive={stacked && active !== it.id ? "" : undefined}
          className="tabpanel"
        >
          {it.panel}
        </div>
      ))}
    </div>
  );
}
