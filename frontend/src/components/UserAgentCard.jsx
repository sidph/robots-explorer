import Collapsible from "./Collapsible.jsx";
import RuleChip from "./RuleChip.jsx";

export default function UserAgentCard({ group, defaultOpen }) {
  const disallowCount = group.rules.filter((r) => r.type === "disallow" && r.value !== "").length;
  const allowCount = group.rules.filter((r) => r.type === "allow").length;

  return (
    <Collapsible
      title={group.userAgents.length ? group.userAgents.join(", ") : "Unnamed"}
      subtitle={group.summary}
      defaultOpen={defaultOpen}
      badge={
        <span className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-ink-500">
          {allowCount > 0 && <span className="text-signal-allow">{allowCount} allow</span>}
          {allowCount > 0 && disallowCount > 0 && <span className="text-ink-300">&middot;</span>}
          {disallowCount > 0 && <span className="text-signal-disallow">{disallowCount} disallow</span>}
        </span>
      }
    >
      {group.rules.length === 0 ? (
        <p className="text-sm text-ink-500 italic">No path rules in this group.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {group.rules.map((rule, i) => (
            <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
              <div className="flex items-center gap-2 shrink-0 sm:w-40">
                <RuleChip type={rule.type} />
                {rule.value && (
                  <code className="text-xs text-ink-700 font-mono truncate" title={rule.value}>
                    {rule.value}
                  </code>
                )}
              </div>
              <p className="text-sm text-ink-700 leading-relaxed">{rule.explanation}</p>
            </li>
          ))}
        </ul>
      )}
    </Collapsible>
  );
}
