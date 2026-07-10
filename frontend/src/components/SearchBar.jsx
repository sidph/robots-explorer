import { useState } from "react";

export default function SearchBar({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-stretch gap-2 rounded-xl2 bg-ink-900 shadow-panel p-2 focus-within:ring-2 focus-within:ring-signal-accent">
        <div className="flex items-center pl-3 pr-1 text-ink-300 font-mono text-sm select-none">
          <span className="hidden sm:inline">https://</span>
          <span className="sm:hidden">/</span>
        </div>
        <input
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="example.com"
          aria-label="Website URL"
          className="flex-1 min-w-0 bg-transparent text-paper placeholder:text-ink-500 font-mono text-[15px] sm:text-base py-3 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-signal-accent text-ink-950 font-display font-semibold text-sm px-4 sm:px-5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:brightness-95 transition"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span className="hidden sm:inline">Scanning</span>
            </>
          ) : (
            <>
              <span>Scan</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
