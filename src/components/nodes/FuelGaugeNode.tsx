import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';

function polarToXY(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const s = polarToXY(cx, cy, r, startDeg);
    const e = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function FuelGaugeNode({ data, selected }: any) {
    const voltage = data?.state?.vcc ?? data?.state?.voltage ?? 0;
    const label = data?.label || 'Fuel';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const warnVal = data?.params?.warnVal ?? 15; // % low fuel warning

    // vMin = empty, vMax = full
    const ratio = Math.max(0, Math.min(1, (voltage - vMin) / (vMax - vMin)));
    const level = ratio * 100;
    const isLow = level <= warnVal;

    // Half-arc: START=-120 to END=120 (bottom-half of circle)
    const START = -120; const END = 120;
    const cx = 60; const cy = 60; const r = 44;
    const needleDeg = START + ratio * (END - START);
    const needlePt = polarToXY(cx, cy, r - 14, needleDeg);
    const warnRatio = warnVal / 100;
    const warnDeg = START + warnRatio * (END - START);

    // E and F label positions
    const ePos = polarToXY(cx, cy, r - 6, START);
    const fPos = polarToXY(cx, cy, r - 6, END);

    const ticks = Array.from({ length: 7 }, (_, i) => {
        const deg = START + (i / 6) * (END - START);
        const outer = polarToXY(cx, cy, r, deg);
        const inner = polarToXY(cx, cy, r - (i % 3 === 0 ? 9 : 5), deg);
        return { outer, inner, major: i % 3 === 0 };
    });

    return (
        <div className={`bg-slate-900 border-2 rounded-xl w-32 h-28 flex flex-col items-center justify-center shadow-lg relative transition-all ${
            selected ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border-slate-800 hover:border-slate-600'
        }`}>
            <svg width="120" height="96" className="absolute" style={{ top: 4, left: 4 }}>
                {/* Background arc */}
                <path d={arcPath(cx, cy, r, START, END)} fill="none" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
                {/* Low fuel zone */}
                <path d={arcPath(cx, cy, r, START, warnDeg)} fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                {/* Normal zone */}
                <path d={arcPath(cx, cy, r, warnDeg, END)} fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
                {/* Active fill */}
                {ratio > 0.001 && (
                    <path d={arcPath(cx, cy, r, START, needleDeg)} fill="none"
                        stroke={isLow ? '#ef4444' : '#10b981'} strokeWidth="5" strokeLinecap="round" />
                )}
                {/* Tick marks */}
                {ticks.map((t, i) => (
                    <line key={i} x1={t.outer.x} y1={t.outer.y} x2={t.inner.x} y2={t.inner.y}
                        stroke={t.major ? '#64748b' : '#334155'} strokeWidth={t.major ? 1.5 : 1} />
                ))}
                {/* E / F labels */}
                <text x={ePos.x - 4} y={ePos.y + 3} fontSize="8" fill="#ef4444" fontWeight="bold">E</text>
                <text x={fPos.x - 3} y={fPos.y + 3} fontSize="8" fill="#10b981" fontWeight="bold">F</text>
                {/* Needle */}
                <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y}
                    stroke={isLow ? '#ef4444' : '#f8fafc'} strokeWidth="2" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="4" fill="#475569" />
                <circle cx={cx} cy={cy} r="2" fill="#94a3b8" />
            </svg>
            <div className="relative z-10 flex flex-col items-center" style={{ marginTop: 52 }}>
                <span className={`text-sm font-black font-mono leading-none ${
                    isLow ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'text-emerald-400'
                }`}>{level.toFixed(0)}%{isLow ? ' LOW' : ''}</span>
                <span className="text-[7px] text-slate-600">{label}</span>
            </div>
            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Right} id="gnd"
                className="!w-3 !h-3 !bg-green-600 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
