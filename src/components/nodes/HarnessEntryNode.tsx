import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * Harness Entry Node (Left side).
 * Individual wires connect to input handles on the left,
 * and visually fan into a thick harness bundle on the right.
 * Same-named HarnessEntry + HarnessExit nodes merge electrically (like net labels).
 */
export function HarnessEntryNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'H001';
    const numPins = Math.min(Math.max(data?.params?.numPins ?? 6, 1), 12);
    const bundleColor = data?.params?.color ?? '#64748b';

    const pinSpacing = 20;
    const margin = 18;
    const pinAreaH = numPins * pinSpacing;
    const totalH = pinAreaH + margin * 2;
    const W = 110;

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : ''}`}
            style={{ width: W, height: totalH}}>
            <svg width={W} height={totalH} viewBox={`0 0 ${W} ${totalH}`} fill="none">
                {/* Background */}
                <rect x="0" y="0" width={W} height={totalH} rx="4" fill="#0f172a" fillOpacity="0.4" />

                {/* Individual wire lines fanning into bundle */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    const bundleTopY = totalH / 2 - Math.min(numPins * 2, 14);
                    const bundleBotY = totalH / 2 + Math.min(numPins * 2, 14);
                    const bundleY = bundleTopY + ((bundleBotY - bundleTopY) * i / Math.max(numPins - 1, 1));
                    return (
                        <line key={`wire_${i}`}
                            x1={0} y1={y}
                            x2={W - 8} y2={bundleY}
                            stroke={bundleColor} strokeWidth="1.5" opacity="0.6"
                        />
                    );
                })}

                {/* Bundle endpoint (thick bar on right) */}
                <rect
                    x={W - 12} y={totalH / 2 - Math.min(numPins * 2 + 4, 18)}
                    width={12} height={Math.min(numPins * 4 + 8, 36)}
                    rx="3"
                    fill="#1e293b"
                    stroke={selected ? '#38bdf8' : bundleColor}
                    strokeWidth="2"
                />

                {/* Pin numbers */}
                {Array.from({ length: numPins }, (_, i) => {
                    const y = margin + i * pinSpacing + pinSpacing / 2;
                    return (
                        <text key={`lbl_${i}`} x={12} y={y + 4} fontSize="8" fill="#94a3b8" fontFamily="monospace">
                            {i + 1}
                        </text>
                    );
                })}

                {/* Label */}
                <text x={W / 2 - 10} y={totalH - 4} fontSize="9" fontWeight="bold" fill={selected ? '#38bdf8' : '#94a3b8'} textAnchor="middle" fontFamily="monospace">
                    {label} →
                </text>
            </svg>

            {/* Input handles on left */}
            {Array.from({ length: numPins }, (_, i) => {
                const y = margin + i * pinSpacing + pinSpacing / 2;
                const pct = (y / totalH) * 100;
                return (
                    <MirroredHandle key={`in_${i}`}
                        type="target" side={Position.Left} id={`pin_${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                        style={{ top: `${pct}%` }}
                     flipX={flipX} flipY={flipY} />
                );
            })}
        </div>
    );
}
