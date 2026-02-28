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

export function TachoGaugeNode({ data, selected }: any) {
    const voltage = data?.state?.vcc ?? data?.state?.voltage ?? 0;
    const label = data?.label || 'Tacho';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const maxVal = data?.params?.maxVal ?? 8000;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const redline = data?.params?.warnVal ?? maxVal * 0.75;

    const ratio = Math.max(0, Math.min(1, (voltage - vMin) / (vMax - vMin)));
    const displayRpm = ratio * maxVal;

    const START = -130; const END = 130;
    const needleDeg = START + ratio * (END - START);
    const redlineRatio = redline / maxVal;
    const redlineDeg = START + redlineRatio * (END - START);

    const cx = 64; const cy = 64; const r = 52;
    const needlePt = polarToXY(cx, cy, r - 14, needleDeg);
    const isRedline = displayRpm >= redline;

    const numTicks = 9;
    const ticks = Array.from({ length: numTicks }, (_, i) => {
        const deg = START + (i / (numTicks - 1)) * (END - START);
        const outer = polarToXY(cx, cy, r - 2, deg);
        const inner = polarToXY(cx, cy, r - (i % 2 === 0 ? 10 : 6), deg);
        return { outer, inner, major: i % 2 === 0, inRedzone: deg > redlineDeg };
    });

    return (
        <div className={`bg-slate-900 border-2 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg relative transition-all ${
            selected ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'border-slate-800 hover:border-slate-600'
        }`}>
            <svg width="128" height="128" className="absolute inset-0">
                {/* Background track */}
                <path d={arcPath(cx, cy, r - 2, START, END)} fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                {/* Normal arc */}
                <path d={arcPath(cx, cy, r - 2, START, redlineDeg)} fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
                {/* Redline arc */}
                <path d={arcPath(cx, cy, r - 2, redlineDeg, END)} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                {/* Active fill */}
                {ratio > 0.001 && (
                    <path d={arcPath(cx, cy, r - 2, START, needleDeg)} fill="none"
                        stroke={isRedline ? '#ef4444' : '#f59e0b'} strokeWidth="5" strokeLinecap="round" />
                )}
                {/* Tick marks */}
                {ticks.map((t, i) => (
                    <line key={i} x1={t.outer.x} y1={t.outer.y} x2={t.inner.x} y2={t.inner.y}
                        stroke={t.inRedzone ? '#ef4444' : (t.major ? '#64748b' : '#334155')}
                        strokeWidth={t.major ? 1.5 : 1} />
                ))}
                {/* Needle */}
                <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y}
                    stroke={isRedline ? '#ef4444' : '#f8fafc'} strokeWidth="2" strokeLinecap="round" />
                {/* Pivot */}
                <circle cx={cx} cy={cy} r="4" fill="#475569" />
                <circle cx={cx} cy={cy} r="2" fill="#94a3b8" />
            </svg>
            <div className="relative z-10 flex flex-col items-center mt-6">
                <span className={`text-base font-black font-mono leading-none ${
                    isRedline ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                }`}>{(displayRpm / 1000).toFixed(1)}</span>
                <span className="text-[8px] text-slate-500 font-bold tracking-widest">x1000 RPM</span>
                <span className="text-[7px] text-slate-600 mt-0.5">{label}</span>
            </div>
            <MirroredHandle type="target" side={Position.Bottom} id="in"
                className="!w-4 !h-4 !bg-amber-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Top} id="gnd"
                className="!w-3 !h-3 !bg-green-600 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
