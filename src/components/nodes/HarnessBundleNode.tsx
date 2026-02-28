import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * Harness Bundle Node — CAT-style schematic representation.
 * Multiple wires converge into a thick bundle line, then break out at the destination.
 * Configurable pin count (1-12). Each pin is a straight pass-through (in_N ↔ out_N).
 */
export function HarnessBundleNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'H001';
    const numPins = Math.min(Math.max(data?.params?.numPins ?? 6, 1), 12);
    const bundleColor = data?.params?.color ?? '#64748b';

    // Dimensions
    const pinSpacing = 20;
    const margin = 20;
    const pinAreaH = numPins * pinSpacing;
    const totalH = pinAreaH + margin * 2;
    const W = 220;
    const fanW = 50; // width of the fan-in / fan-out area
    const bundleW = W - fanW * 2; // middle thick bundle section

    return (            <div
            className={`relative transition-all ${selected ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : ''}`}
            style={{ width: W, height: totalH}}
        >
            <svg width={W} height={totalH} viewBox={`0 0 ${W} ${totalH}`} fill="none">
                {/* Background */}
                <rect x="0" y="0" width={W} height={totalH} rx="4" fill="#0f172a" fillOpacity="0.3" />

                {/* --- Left fan-in lines (individual wires converge) --- */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    const bundleTopY = totalH / 2 - 12;
                    const bundleBotY = totalH / 2 + 12;
                    // Map each wire to a point within the bundle thickness
                    const bundleY = bundleTopY + ((bundleBotY - bundleTopY) * i / Math.max(numPins - 1, 1));
                    return (
                        <line key={`fan_l_${i}`}
                            x1={0} y1={y}
                            x2={fanW} y2={bundleY}
                            stroke={bundleColor} strokeWidth="1.5" opacity="0.6"
                        />
                    );
                })}

                {/* --- Thick bundle line (center) --- */}
                <rect
                    x={fanW} y={totalH / 2 - 14}
                    width={bundleW} height={28}
                    rx="4"
                    fill="#1e293b"
                    stroke={selected ? '#38bdf8' : bundleColor}
                    strokeWidth="2"
                />
                {/* Hatching lines inside bundle */}
                {Array.from({ length: Math.floor(bundleW / 16) }, (_, i) => (
                    <line key={`hatch_${i}`}
                        x1={fanW + 10 + i * 16} y1={totalH / 2 - 10}
                        x2={fanW + 18 + i * 16} y2={totalH / 2 + 10}
                        stroke={bundleColor} strokeWidth="1" opacity="0.3"
                    />
                ))}

                {/* --- Right fan-out lines (wires break out) --- */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    const bundleTopY = totalH / 2 - 12;
                    const bundleBotY = totalH / 2 + 12;
                    const bundleY = bundleTopY + ((bundleBotY - bundleTopY) * i / Math.max(numPins - 1, 1));
                    return (
                        <line key={`fan_r_${i}`}
                            x1={W - fanW} y1={bundleY}
                            x2={W} y2={y}
                            stroke={bundleColor} strokeWidth="1.5" opacity="0.6"
                        />
                    );
                })}

                {/* Pin numbers on left */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    return (
                        <text key={`lbl_l_${i}`} x={8} y={y + 4} fontSize="8" fill="#94a3b8" fontFamily="monospace">
                            {i + 1}
                        </text>
                    );
                })}

                {/* Pin numbers on right */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    return (
                        <text key={`lbl_r_${i}`} x={W - 14} y={y + 4} fontSize="8" fill="#94a3b8" fontFamily="monospace">
                            {i + 1}
                        </text>
                    );
                })}

                {/* Harness label on bundle */}
                <text
                    x={W / 2} y={totalH / 2 + 4}
                    fontSize="11" fontWeight="bold" fill={selected ? '#38bdf8' : '#e2e8f0'}
                    textAnchor="middle" fontFamily="monospace"
                >
                    {label}
                </text>

                {/* Wire count badge */}
                <rect x={W / 2 - 16} y={totalH / 2 + 8} width="32" height="14" rx="3" fill="#0f172a" stroke={bundleColor} strokeWidth="1" />
                <text x={W / 2} y={totalH / 2 + 19} fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">
                    {numPins}W
                </text>
            </svg>

            {/* --- Handles: left inputs, right outputs --- */}
            {Array.from({ length: numPins }, (_, i) => {
                const y = margin + i * pinSpacing + pinSpacing / 2;
                const pct = (y / totalH) * 100;
                return (
                    <MirroredHandle key={`in_${i}`}
                        type="target" side={Position.Left} id={`in_${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                        style={{ top: `${pct}%` }}
                     flipX={flipX} flipY={flipY} />
                );
            })}
            {Array.from({ length: numPins }, (_, i) => {
                const y = margin + i * pinSpacing + pinSpacing / 2;
                const pct = (y / totalH) * 100;
                return (
                    <MirroredHandle key={`out_${i}`}
                        type="source" side={Position.Right} id={`out_${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                        style={{ top: `${pct}%` }}
                     flipX={flipX} flipY={flipY} />
                );
            })}
        </div>
    );
}
