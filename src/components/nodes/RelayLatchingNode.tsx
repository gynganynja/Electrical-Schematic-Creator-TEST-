import { Handle, Position } from '@xyflow/react';

/**
 * Latching (Bistable) Relay.
 * Has SET and RESET coils. Pulses on SET energize,
 * pulses on RESET de-energize. State persists without power.
 */
export function RelayLatchingNode({ data, selected }: any) {
    const isEnergized = data?.state?.energized || false;
    const label = data?.label || 'K';

    const W = 120;
    const H = 140;
    const pinColor = '#fbbf24';
    const bodyColor = isEnergized ? '#1e293b' : '#0f172a';
    const bodyStroke = selected ? '#38bdf8' : '#334155';
    const textColor = '#94a3b8';

    return (
        <div className={`relative ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]' : ''}`}
            style={{ width: W, height: H + 24 }}>
            <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} fill="none">
                <rect x="5" y="5" width={W - 10} height={H - 10} rx="6"
                    fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" />

                {/* Latching label */}
                <text x="60" y="20" fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="monospace">LATCHING</text>

                {/* SET indicator */}
                <rect x="15" y="30" width="35" height="16" rx="3" fill="#0f4c3a" stroke="#059669" strokeWidth="1" />
                <text x="32" y="42" fontSize="8" fontWeight="bold" fill="#34d399" textAnchor="middle">SET</text>

                {/* RESET indicator */}
                <rect x="70" y="30" width="35" height="16" rx="3" fill="#4c1d0f" stroke="#dc2626" strokeWidth="1" />
                <text x="87" y="42" fontSize="8" fontWeight="bold" fill="#f87171" textAnchor="middle">RST</text>

                {/* NO output bar */}
                <rect x="40" y="58" width="40" height="6" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="55" fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">NO</text>

                {/* COM bar */}
                <rect x="57" y="80" width="6" height="30" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y={H - 8} fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle">COM</text>

                {isEnergized && (
                    <circle cx="60" cy="70" r="4" fill="#22c55e" opacity="0.9">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>

            <div className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm"
                style={{ bottom: 0 }}>
                {label} (Latch)
                <span className={`ml-1 text-[10px] ${isEnergized ? 'text-green-500' : 'text-slate-400'}`}>
                    {isEnergized ? '● SET' : '○ RST'}
                </span>
            </div>

            {/* NO — top */}
            <Handle type="source" position={Position.Top} id="no"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" style={{ left: '50%' }} />
            {/* SET coil — left */}
            <Handle type="target" position={Position.Left} id="set_in"
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" style={{ top: '30%' }} />
            <Handle type="source" position={Position.Left} id="set_out"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white" style={{ top: '50%' }} />
            {/* RESET coil — right */}
            <Handle type="target" position={Position.Right} id="reset_in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" style={{ top: '30%' }} />
            <Handle type="source" position={Position.Right} id="reset_out"
                className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" style={{ top: '50%' }} />
            {/* COM — bottom */}
            <Handle type="target" position={Position.Bottom} id="com"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white" style={{ left: '50%' }} />
        </div>
    );
}
