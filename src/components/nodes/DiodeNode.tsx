import { Handle, Position } from '@xyflow/react';

/**
 * Diode node — flyback diode, blocking diode.
 * Current flows anode → cathode only.
 * Handles: anode (in), cathode (out)
 */
export function DiodeNode({ data, selected }: any) {
    const label = data?.label || 'Diode';

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 60, height: 50 }}>
            <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
                {/* Diode triangle */}
                <polygon points="10,10 40,25 10,40" fill="#0f172a" stroke={selected ? '#38bdf8' : '#475569'} strokeWidth="2.5" />
                {/* Cathode bar */}
                <line x1="40" y1="10" x2="40" y2="40" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Leads */}
                <line x1="0" y1="25" x2="10" y2="25" stroke="#475569" strokeWidth="2" />
                <line x1="40" y1="25" x2="50" y2="25" stroke="#475569" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <Handle type="target" position={Position.Left} id="anode" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="cathode" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
