import { Handle, Position } from '@xyflow/react';

/**
 * Buzzer / Horn node — audible alert component.
 * Handles: in (power), out (ground return)
 */
export function BuzzerNode({ data, selected }: any) {
    const label = data?.label || 'Buzzer';
    const on = data?.state?.on || false;

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 70, height: 65 }}>
            <svg width="70" height="65" viewBox="0 0 70 65" fill="none" className={on ? 'drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : ''}>
                {/* Buzzer body */}
                <rect x="10" y="10" width="30" height="40" rx="3" fill={on ? '#f59e0b' : '#0f172a'} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                {/* Speaker cone */}
                <path d="M 40 15 L 55 5 L 55 55 L 40 45 Z" fill={on ? '#f59e0b' : '#1e293b'} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                {/* Sound waves when on */}
                {on && (
                    <g stroke="#fde68a" strokeWidth="2" fill="none" opacity="0.9">
                        <path d="M 58 22 Q 63 30, 58 38" />
                        <path d="M 62 18 Q 68 30, 62 42" />
                    </g>
                )}
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <Handle type="target" position={Position.Left} id="in" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" style={{ top: '45%' }} />
            <Handle type="source" position={Position.Right} id="out" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" style={{ top: '45%' }} />
        </div>
    );
}
