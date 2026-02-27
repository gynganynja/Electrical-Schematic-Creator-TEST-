import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

/**
 * Time-Delay Relay (Off-Delay).
 * Contacts stay energized for a configurable time after coil de-energizes.
 * Standard SPDT contacts.
 */
export function RelayDelayOffNode({ data, selected }: any) {
    const isEnergized = data?.state?.energized || false;
    const delayMs = data?.params?.delayMs ?? 5000;
    const label = data?.label || 'K';

    const W = 120;
    const H = 140;
    const bodyColor = isEnergized ? '#1e293b' : '#0f172a';
    const bodyStroke = selected ? '#38bdf8' : '#334155';

    return (
        <div className={`relative ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]' : ''}`}
            style={{ width: W, height: H + 24 }}>
            <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} fill="none">
                <rect x="5" y="5" width={W - 10} height={H - 10} rx="6"
                    fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" />

                {/* Timer icon area */}
                <rect x="30" y="15" width="60" height="20" rx="3" fill="#1b1e4b" stroke="#f59e0b" strokeWidth="1" />
                <text x="60" y="29" fontSize="9" fontWeight="bold" fill="#fbbf24" textAnchor="middle">{delayMs}ms OFF↓</text>

                {/* Standard relay pins */}
                <rect x="40" y="45" width="40" height="5" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="42" fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">87</text>

                <rect x="40" y="65" width="40" height="5" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y="62" fontSize="9" fontWeight="bold" fill="#94a3b8" textAnchor="middle">87a</text>

                <rect x="22" y="80" width="6" height="30" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                <text x="25" y={H - 4} fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">86</text>

                <rect x="57" y="80" width="6" height="30" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                <text x="60" y={H - 4} fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">30</text>

                <rect x="92" y="80" width="6" height="30" rx="1" fill="#fbbf24" stroke="#b45309" strokeWidth="0.5" />
                <text x="95" y={H - 4} fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">85</text>

                {isEnergized && (
                    <circle cx="60" cy="78" r="4" fill="#22c55e" opacity="0.9">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>

            <div className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm flex items-center gap-1"
                style={{ bottom: 0 }}>
                <Clock size={10} className="text-amber-400" />
                {label} (OFF-DLY)
                <span className={`text-[10px] ${isEnergized ? 'text-green-500' : 'text-slate-400'}`}>
                    {isEnergized ? '● ON' : '○ OFF'}
                </span>
            </div>

            <Handle type="source" position={Position.Top} id="no"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" style={{ left: '50%' }} />
            <Handle type="source" position={Position.Right} id="nc"
                className="!w-3 !h-3 !bg-slate-500 !border-2 !border-white" style={{ top: '50%' }} />
            <Handle type="target" position={Position.Bottom} id="coil_in"
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" style={{ left: '21%' }} />
            <Handle type="target" position={Position.Bottom} id="com"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white" style={{ left: '50%' }} />
            <Handle type="source" position={Position.Bottom} id="coil_out"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white" style={{ left: '79%' }} />
        </div>
    );
}
