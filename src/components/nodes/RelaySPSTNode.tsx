import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * SPST Relay (Normally Open).
 * Common automotive relay — coil energizes to close contact.
 * Pins: 85 (coil-), 86 (coil+), 30 (COM), 87 (NO)
 */
export function RelaySPSTNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const isEnergized = data?.state?.energized || false;
    const label = data?.label || 'K';

    const W = 100;
    const H = 120;
    const pinColor = '#fbbf24';
    const bodyColor = isEnergized ? '#1e293b' : '#0f172a';
    const bodyStroke = selected ? '#38bdf8' : '#334155';
    const textColor = '#94a3b8';

    return (            <div className={`relative ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]' : ''}`}
            style={{ width: W, height: H + 20}}>
            <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`} fill="none">
                <rect x="5" y="5" width={W - 10} height={H - 10} rx="6"
                    fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" />

                {/* Pin 87 (NO) — top */}
                <rect x="42" y="15" width="16" height="5" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="50" y="13" fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">87</text>

                {/* Pin 30 (COM) — center */}
                <rect x="42" y="55" width="6" height="30" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="50" y={H} fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">30</text>

                {/* Pin 86 (Coil +) — bottom left */}
                <rect x="18" y="60" width="6" height="30" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="21" y={H} fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">86</text>

                {/* Pin 85 (Coil -) — bottom right */}
                <rect x="76" y="60" width="6" height="30" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="79" y={H} fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">85</text>

                {isEnergized && (
                    <circle cx="50" cy="50" r="4" fill="#22c55e" opacity="0.9">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>

            <div className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm"
                style={{ bottom: 0 }}>
                {label}
                <span className={`ml-1 text-[10px] ${isEnergized ? 'text-green-500' : 'text-slate-400'}`}>
                    {isEnergized ? '● ON' : '○ OFF'}
                </span>
            </div>

            {/* Pin 87 (NO) — top */}
            <MirroredHandle type="source" side={Position.Top} id="no"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" style={{ left: '50%' }}  flipX={flipX} flipY={flipY} />
            {/* Pin 86 (Coil +) — bottom left */}
            <MirroredHandle type="target" side={Position.Bottom} id="coil_in"
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" style={{ left: '21%' }}  flipX={flipX} flipY={flipY} />
            {/* Pin 30 (COM) — bottom center */}
            <MirroredHandle type="target" side={Position.Bottom} id="in"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white" style={{ left: '50%' }}  flipX={flipX} flipY={flipY} />
            {/* Pin 85 (Coil -) — bottom right */}
            <MirroredHandle type="source" side={Position.Bottom} id="coil_out"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white" style={{ left: '79%' }}  flipX={flipX} flipY={flipY} />
        </div>
    );
}
