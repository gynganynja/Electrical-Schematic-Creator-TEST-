import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';

// Arc helpers: sweep from startDeg to endDeg (SVG coords, 0=right)
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

export function SpeedoGaugeNode({ data, selected }: any) {
    const voltage = data?.state?.vcc ?? data?.state?.voltage ?? 0;
    const label = data?.label || 'Speedo';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const maxVal = data?.params?.maxVal ?? 240;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const warnVal = data?.params?.warnVal ?? maxVal * 0.85;

    // Convert measured voltage to display value
    const ratio = Math.max(0, Math.min(1, (voltage - vMin) / (vMax - vMin)));
    const displayVal = ratio * maxVal;

    // Needle: sweeps from -130deg to +130deg (260deg total)
    const START = -130; const END = 130;
    const needleDeg = START + ratio * (END - START);
    const warnRatio = warnVal / maxVal;
    const warnDeg = START + warnRatio * (END - START);

    const cx = 64; const cy = 64; const r = 52;
    const needlePt = polarToXY(cx, cy, r - 14, needleDeg);
    const isWarn = displayVal >= warnVal;

    // Tick marks
    const numTicks = 9;
    const ticks = Array.from({ length: numTicks }, (_, i) => {
        const deg = START + (i / (numTicks - 1)) * (END - START);
        const outer = polarToXY(cx, cy, r - 2, deg);
        const inner = polarToXY(cx, cy, r - (i % 2 === 0 ? 10 : 6), deg);
        return { outer, inner, major: i % 2 === 0 };
    });

    return (
        <div className={`bg-slate-900 border-2 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg relative transition-all ${
            selected ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-slate-800 hover:border-slate-600'
        }`}>
            <svg width="128" height="128" className="absolute inset-0">
                {/* Background track */}
                <path d={arcPath(cx, cy, r - 2, START, END)} fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                {/* Normal arc */}
                <path d={arcPath(cx, cy, r - 2, START, warnDeg)} fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                {/* Warning arc */}
                <path d={arcPath(cx, cy, r - 2, warnDeg, END)} fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
                {/* Active fill */}
                {ratio > 0.001 && (
                    <path d={arcPath(cx, cy, r - 2, START, needleDeg)} fill="none"
                        stroke={isWarn ? '#ef4444' : '#60a5fa'} strokeWidth="5" strokeLinecap="round" />
                )}
                {/* Tick marks */}
                {ticks.map((t, i) => (
                    <line key={i} x1={t.outer.x} y1={t.outer.y} x2={t.inner.x} y2={t.inner.y}
                        stroke={t.major ? '#64748b' : '#334155'} strokeWidth={t.major ? 1.5 : 1} />
                ))}
                {/* Needle */}
                <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y}
                    stroke={isWarn ? '#ef4444' : '#f8fafc'} strokeWidth="2" strokeLinecap="round" />
                {/* Pivot */}
                <circle cx={cx} cy={cy} r="4" fill="#475569" />
                <circle cx={cx} cy={cy} r="2" fill="#94a3b8" />
            </svg>
            {/* Digital readout */}
            <div className="relative z-10 flex flex-col items-center mt-6">
                <span className={`text-base font-black font-mono leading-none ${
                    isWarn ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]'
                }`}>{displayVal.toFixed(0)}</span>
                <span className="text-[8px] text-slate-500 font-bold tracking-widest">KM/H</span>
                <span className="text-[7px] text-slate-600 mt-0.5">{label}</span>
            </div>
            <MirroredHandle type="target" side={Position.Bottom} id="in"
                className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Top} id="gnd"
                className="!w-3 !h-3 !bg-green-600 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
