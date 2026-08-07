import type { CircuitSpec } from "./gateLibrary";

/**
 * Renders the standard quantum-circuit symbol for a gate as inline SVG, in the
 * same visual language used in textbooks: boxes on wires for single-qubit
 * gates, control dots and ⊕ / × markers for two-qubit gates.
 */
export function CircuitSymbol({ spec }: { spec: CircuitSpec }) {
  const two = spec.kind !== "box";
  const W = 150;
  const H = two ? 104 : 60;
  const yTop = two ? 32 : 30;
  const yBot = 72;
  const cx = W / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full text-ink"
      style={{ maxWidth: 190 }}
      role="img"
      aria-label="circuit symbol"
    >
      {/* wires */}
      <line x1="10" y1={yTop} x2={W - 10} y2={yTop} stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      {two && (
        <line x1="10" y1={yBot} x2={W - 10} y2={yBot} stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      )}

      {/* wire labels */}
      <text x="4" y={yTop - 8} fontSize="11" fill="currentColor" opacity="0.5" fontFamily="monospace">
        {two ? "q₀" : "q"}
      </text>
      {two && (
        <text x="4" y={yBot - 8} fontSize="11" fill="currentColor" opacity="0.5" fontFamily="monospace">
          q₁
        </text>
      )}

      {spec.kind === "box" && <Box x={cx} y={yTop} label={spec.label} />}

      {spec.kind === "cnot" && (
        <>
          <Connector x={cx} y1={yTop} y2={yBot} />
          <Dot x={cx} y={yTop} />
          <Xor x={cx} y={yBot} />
        </>
      )}

      {spec.kind === "cz" && (
        <>
          <Connector x={cx} y1={yTop} y2={yBot} />
          <Dot x={cx} y={yTop} />
          <Dot x={cx} y={yBot} />
        </>
      )}

      {spec.kind === "swap" && (
        <>
          <Connector x={cx} y1={yTop} y2={yBot} />
          <SwapX x={cx} y={yTop} />
          <SwapX x={cx} y={yBot} />
        </>
      )}

      {spec.kind === "control-box" && (
        <>
          <Connector x={cx} y1={yTop} y2={yBot - 18} />
          <Dot x={cx} y={yTop} />
          <Box x={cx} y={yBot} label={spec.label} />
        </>
      )}
    </svg>
  );
}

function Box({ x, y, label }: { x: number; y: number; label: string }) {
  const w = label.length > 2 ? 46 : 38;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 18}
        width={w}
        height={36}
        rx="6"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <text x={x} y={y + 5} fontSize="16" textAnchor="middle" fill="currentColor" fontFamily="ui-monospace, monospace" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6" fill="currentColor" />;
}

function Connector({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeWidth="1.75" />;
}

function Xor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="14" fill="#ffffff" stroke="currentColor" strokeWidth="1.75" />
      <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke="currentColor" strokeWidth="1.75" />
      <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke="currentColor" strokeWidth="1.75" />
    </g>
  );
}

function SwapX({ x, y }: { x: number; y: number }) {
  const s = 8;
  return (
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} />
    </g>
  );
}
