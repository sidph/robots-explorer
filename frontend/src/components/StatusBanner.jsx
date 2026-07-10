const STATUS_CONFIG = {
  found: {
    dot: "bg-signal-allow",
    border: "border-l-signal-allow",
    label: "robots.txt found",
  },
  not_found: {
    dot: "bg-ink-300",
    border: "border-l-ink-300",
    label: "No robots.txt found",
  },
  error: {
    dot: "bg-signal-disallow",
    border: "border-l-signal-disallow",
    label: "Couldn't check this site",
  },
};

export default function StatusBanner({ result }) {
  const status = result.exists ? "found" : result.reason && result.reason !== "not_found" ? "error" : "not_found";
  const config = STATUS_CONFIG[status];

  return (
    <div className={`rounded-xl2 bg-paper-raised shadow-panel border-l-4 ${config.border} px-5 py-4`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-display font-semibold text-ink-900">{config.label}</h2>
            <span className="font-mono text-sm text-ink-500 break-all">{result.robotsUrl}</span>
          </div>
          <p className="text-sm text-ink-700 mt-1">{result.overallSummary || result.message}</p>
        </div>
      </div>
    </div>
  );
}
