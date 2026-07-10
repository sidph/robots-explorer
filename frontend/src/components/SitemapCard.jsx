export default function SitemapCard({ sitemaps }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-paper-raised shadow-panel px-5 py-4">
      <h3 className="font-display font-semibold text-ink-900 text-[15px] mb-1">
        Sitemaps {sitemaps.length > 0 && <span className="text-ink-500 font-normal">({sitemaps.length})</span>}
      </h3>
      {sitemaps.length === 0 ? (
        <p className="text-sm text-ink-500">No sitemap URLs are listed in robots.txt.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-2">
          {sitemaps.map((url, i) => (
            <li key={i} className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-neutral shrink-0" aria-hidden="true" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-signal-neutral hover:underline truncate"
                title={url}
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
