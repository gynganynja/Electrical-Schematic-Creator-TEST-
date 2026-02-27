import { Handle, Position } from '@xyflow/react';

/**
 * Harness Exit Node (Right side).
 * Thick harness bundle arrives on the left, wires fan out to individual
 * output handles on the right.
 * Same-named HarnessEntry + HarnessExit nodes merge electrically (like net labels).
 */
export function HarnessExitNode({ data, selected }: any) {
    const label = data?.label || 'H001';
    const numPins = Math.min(Math.max(data?.params?.numPins ?? 6, 1), 12);
    const bundleColor = data?.params?.color ?? '#64748b';

    const pinSpacing = 20;
    const margin = 18;
    const pinAreaH = numPins * pinSpacing;
    const totalH = pinAreaH + margin * 2;
    const W = 110;

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : ''}`}
            style={{ width: W, height: totalH }}>
            <svg width={W} height={totalH} viewBox={`0 0 ${W} ${totalH}`} fill="none">
                {/* Background */}
                <rect x="0" y="0" width={W} height={totalH} rx="4" fill="#0f172a" fillOpacity="0.4" />

                {/* Bundle endpoint (thick bar on left) */}
                <rect
                    x={0} y={totalH / 2 - Math.min(numPins * 2 + 4, 18)}
                    width={12} height={Math.min(numPins * 4 + 8, 36)}
                    rx="3"
                    fill="#1e293b"
                    stroke={selected ? '#38bdf8' : bundleColor}
                    strokeWidth="2"
                />

                {/* Wire lines fanning out from bundle */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    const bundleTopY = totalH / 2 - Math.min(numPins * 2, 14);
                    const bundleBotY = totalH / 2 + Math.min(numPins * 2, 14);
                    const bundleY = bundleTopY + ((bundleBotY - bundleTopY) * i / Math.max(numPins - 1, 1));
                    return (
                        <line key={`wire_${i}`}
                            x1={8} y1={bundleY}
                            x2={W} y2={y}
                            stroke={bundleColor} strokeWidth="1.5" opacity="0.6"
                        />
                    );
                })}

                {/* Pin numbers */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    return (
                        <text key={`lbl_${i}`} x={W - 18} y={y + 4} fontSize="8" fill="#94a3b8" fontFamily="monospace">
                            {i + 1}
                        </text>
                    );
                })}

                {/* Label */}
                <text x={W / 2 + 10} y={totalH - 4} fontSize="9" fontWeight="bold" fill={selected ? '#38bdf8' : '#94a3b8'} textAnchor="middle" fontFamily="monospace">
                    → {label}
                </text>
            </svg>

            {/* Output handles on right */}
            {Array.from({ length: numPins }, (_, i) => {
                const y = margin + i * pinSpacing + pinSpacing / 2;
                const pct = (y / totalH) * 100;
                return (
                    <Handle key={`out_${i}`}
                        type="source" position={Position.Right} id={`pin_${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                        style={{ top: `${pct}%` }}
                    />
                );
            })}
        </div>
    );
}
