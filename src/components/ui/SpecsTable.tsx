export interface SpecItem {
  label: string;
  value: string;
  muted?: boolean;
}

export interface SpecsTableProps {
  items: SpecItem[];
  caption?: string;
  className?: string;
}

/**
 * Tabla técnica tipo placa trasera de amplificador (DESIGN.md §7):
 * Etiqueta en Cinzel a la izquierda y valor en JetBrains Mono a la derecha.
 */
export function SpecsTable({ items, caption, className = "" }: SpecsTableProps) {
  return (
    <div className={`w-full max-w-2xl ${className}`.trim()}>
      {caption && (
        <p className="font-mono-specs text-xs text-ash mb-3">{caption}</p>
      )}
      <dl className="divide-y divide-tolex border-y border-tolex">
        {items.map((item) => (
          <div
            key={item.label}
            className="py-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4"
          >
            <dt className="font-label-caps text-ash">{item.label}</dt>
            <dd
              className={`font-mono-specs text-sm sm:text-base ${
                item.muted ? "text-smoke" : "text-bone"
              }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
