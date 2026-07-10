import { useState } from "react";

/**
 * A generic, accessible collapsible panel. Used for anything the user might
 * want to scan past quickly: individual user-agent groups, the raw file view, etc.
 */
export default function Collapsible({ title, subtitle, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId(title);

  return (
    <div className="rounded-xl2 border border-ink-100 bg-paper-raised shadow-panel overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink-100/40 transition-colors"
      >
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display font-semibold text-ink-900 text-[15px] truncate">{title}</span>
          {subtitle && <span className="text-sm text-ink-500 truncate">{subtitle}</span>}
        </span>
        <span className="flex items-center gap-3 shrink-0">
          {badge}
          <svg
            className={`w-4 h-4 text-ink-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div id={id} hidden={!open} className="border-t border-ink-100 px-5 py-4">
        {children}
      </div>
    </div>
  );
}

let counter = 0;
function useId(seed) {
  const [id] = useState(() => `collapsible-${seed?.toString().replace(/\s+/g, "-").toLowerCase() || "x"}-${counter++}`);
  return id;
}
