import { useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import StatusBanner from "./components/StatusBanner.jsx";
import UserAgentCard from "./components/UserAgentCard.jsx";
import SitemapCard from "./components/SitemapCard.jsx";
import RawRobotsPanel from "./components/RawRobotsPanel.jsx";
import { runRobotsDiagnostic } from "./api/diagnosticsApi.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState("");

  async function handleSubmit(url) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastQuery(url);
    try {
      const data = await runRobotsDiagnostic(url);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="flex items-center gap-2 text-signal-accent font-mono text-xs tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-accent" />
            Site diagnostics
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink-900 tracking-tight">
            Robots Explorer
          </h1>
          <p className="text-ink-500 mt-2 max-w-xl">
            Enter a website and see exactly what its robots.txt tells crawlers &mdash; who's allowed
            where, and what it means in simple words.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <SearchBar onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && <LoadingState query={lastQuery} />}

        {!isLoading && error && <ErrorState message={error} />}

        {!isLoading && !error && result && (
          <div className="flex flex-col gap-5">
            <StatusBanner result={result} />

            {result.exists && (
              <>
                {result.groups.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h3 className="font-display font-semibold text-ink-900 text-sm uppercase tracking-wide">
                      User-agent rules
                    </h3>
                    <div className="flex flex-col gap-3">
                      {result.groups.map((group, i) => (
                        <UserAgentCard key={i} group={group} defaultOpen={i === 0} />
                      ))}
                    </div>
                  </section>
                )}

                <SitemapCard sitemaps={result.sitemaps} />

                {result.rawContent && <RawRobotsPanel content={result.rawContent} />}
              </>
            )}
          </div>
        )}

        {!isLoading && !error && !result && <EmptyState />}
      </main>

      <footer className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 text-xs text-ink-500">
        Robots Explorer reads publicly available robots.txt files. It doesn't crawl or index any site.
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl2 border border-dashed border-ink-300 px-6 py-10 text-center">
      <p className="text-ink-700 font-display font-medium">Nothing scanned yet</p>
      <p className="text-ink-500 text-sm mt-1">
        Type a domain above, like <code className="font-mono">wikipedia.org</code>, and hit Scan.
      </p>
    </div>
  );
}

function LoadingState({ query }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-paper-raised shadow-panel px-6 py-10 text-center">
      <div className="inline-flex items-center gap-2 text-ink-500 font-mono text-sm">
        <span className="w-2 h-2 rounded-full bg-signal-accent animate-pulse" />
        Fetching robots.txt for {query}&hellip;
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-xl2 border-l-4 border-l-signal-disallow bg-paper-raised shadow-panel px-5 py-4">
      <h2 className="font-display font-semibold text-ink-900">Couldn&rsquo;t complete that scan</h2>
      <p className="text-sm text-ink-700 mt-1">{message}</p>
    </div>
  );
}
