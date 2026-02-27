import { Handle, Position } from '@xyflow/react';

/**
 * Flasher / Blinker timer relay.
 * Oscillates output on/off at configurable rate.
 * Handles: in (power), out (flashing output)
 */
export function FlasherNode({ data, selected }: any) {
    const label = data?.label || 'Flasher';
    const on = data?.state?.outputOn || false;

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 70, height: 70 }}>
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none" className={on ? 'drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : ''}>
                {/* Body */}
                <rect x="5" y="5" width="60" height="60" rx="6" fill={on ? '#f59e0b' : '#0f172a'} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                {/* Square wave symbol */}
                <polyline points="15,40 15,25 25,25 25,40 35,40 35,25 45,25 45,40 55,40" stroke={on ? '#fff' : '#475569'} strokeWidth="2.5" fill="none" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
                <span className={`ml-1 text-[9px] ${on ? 'text-amber-400' : 'text-slate-500'}`}>
                    {on ? '●' : '○'}
                </span>
            </div>
            <Handle type="target" position={Position.Left} id="in" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" />
        </div>
    );
}
