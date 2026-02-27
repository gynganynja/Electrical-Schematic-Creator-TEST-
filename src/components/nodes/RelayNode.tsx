import { Handle, Position } from '@xyflow/react';
import { getRotationPosition } from '../../utils/rotation';

/**
 * Standard automotive 5-pin relay node.
 */
export function RelayNode({ data, selected }: any) {
    const isEnergized = data?.state?.energized || false;
    const label = data?.label || 'Relay';
    const rotation = data?.rotation ?? 0;

    const W = 120;
    const H = 140;
    const pinColor = '#fbbf24'; // amber-400 pins
    const bodyColor = isEnergized ? '#1e293b' : '#0f172a'; // slate-800/900 body
    const bodyStroke = selected ? '#38bdf8' : '#334155'; // neon blue or slate-700
    const textColor = '#94a3b8'; // slate-400 text

    // Handlers side mapping
    const sideTop = getRotationPosition(Position.Top, rotation);
    const sideBottom = getRotationPosition(Position.Bottom, rotation);
    const sideRight = getRotationPosition(Position.Right, rotation);

    return (
        <div
            className={`relative ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]' : ''}`}
            style={{ width: W, height: H + 24 }}
        >
            <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Relay body */}
                <rect
                    x="5" y="5" width={W - 10} height={H - 10} rx="6"
                    fill={bodyColor}
                    stroke={bodyStroke}
                    strokeWidth="1.5"
                />

                {/* --- Pin 87 (NO) --- */}
                <rect x="40" y="18" width="40" height="6" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="15" fontSize="11" fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="sans-serif">87</text>

                {/* --- Pin 87a (NC) --- */}
                <rect x="40" y="46" width="40" height="6" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="43" fontSize="10" fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="sans-serif">87a</text>

                {/* --- Pin 86 (Coil +) --- */}
                <rect x="22" y="70" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="25" y="118" fontSize="11" fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="sans-serif">86</text>

                {/* --- Pin 85 (Coil -) --- */}
                <rect x="92" y="70" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="95" y="118" fontSize="11" fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="sans-serif">85</text>

                {/* --- Pin 30 (Common) --- */}
                <rect x="57" y="80" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="128" fontSize="11" fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="sans-serif">30</text>

                {/* Energized indicator dot */}
                {isEnergized && (
                    <circle cx="60" cy="68" r="4" fill="#22c55e" opacity="0.9">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>

            {/* Component label */}
            <div
                className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm"
                style={{ bottom: 0 }}
            >
                {label}
                <span className={`ml-1 text-[10px] ${isEnergized ? 'text-green-500' : 'text-slate-400'}`}>
                    {isEnergized ? '● ON' : '○ OFF'}
                </span>
            </div>

            {/* Pin 87 (NO) */}
            <Handle type="source" position={sideTop} id="no"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
                style={sideTop === Position.Top || sideTop === Position.Bottom ? { left: '50%' } : { top: '50%' }} />

            {/* Pin 87a (NC) */}
            <Handle type="source" position={sideRight} id="nc"
                className="!w-3 !h-3 !bg-slate-500 !border-2 !border-white"
                style={sideRight === Position.Right || sideRight === Position.Left ? { top: '32%' } : { left: '32%' }} />

            {/* Pin 86 (Coil +) */}
            <Handle type="target" position={sideBottom} id="coil_in"
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
                style={sideBottom === Position.Bottom || sideBottom === Position.Top ? { left: '21%' } : { top: '21%' }} />

            {/* Pin 30 (Common) */}
            <Handle type="target" position={sideBottom} id="com"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white"
                style={sideBottom === Position.Bottom || sideBottom === Position.Top ? { left: '50%' } : { top: '50%' }} />

            {/* Pin 85 (Coil -) */}
            <Handle type="source" position={sideBottom} id="coil_out"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white"
                style={sideBottom === Position.Bottom || sideBottom === Position.Top ? { left: '79%' } : { top: '79%' }} />
        </div>
    );
}
