import Collapsible from "./Collapsible.jsx";

export default function RawRobotsPanel({ content }) {
  const lines = content.split(/\r\n|\r|\n/);

  return (
    <Collapsible title="Raw robots.txt" subtitle={`${lines.length} lines`} defaultOpen={false}>
      <div className="rounded-lg bg-ink-950 scanline-track overflow-x-auto">
        <pre className="text-[13px] leading-6 p-4 font-mono text-ink-100 min-w-max">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-ink-500 select-none w-8 text-right shrink-0">{i + 1}</span>
              <span className="whitespace-pre">{line || " "}</span>
            </div>
          ))}
        </pre>
      </div>
    </Collapsible>
  );
}
