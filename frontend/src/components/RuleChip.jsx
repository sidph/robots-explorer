const CHIP_STYLES = {
  disallow: "bg-signal-disallowSoft text-signal-disallow",
  allow: "bg-signal-allowSoft text-signal-allow",
  "crawl-delay": "bg-signal-neutralSoft text-signal-neutral",
  host: "bg-signal-neutralSoft text-signal-neutral",
  noindex: "bg-ink-100 text-ink-700",
};

const CHIP_LABELS = {
  disallow: "Disallow",
  allow: "Allow",
  "crawl-delay": "Crawl-delay",
  host: "Host",
  noindex: "Noindex",
};

export default function RuleChip({ type }) {
  const style = CHIP_STYLES[type] || "bg-ink-100 text-ink-700";
  const label = CHIP_LABELS[type] || type;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-medium shrink-0 ${style}`}>
      {label}
    </span>
  );
}
