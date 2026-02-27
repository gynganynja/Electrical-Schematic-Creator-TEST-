import { Handle, Position } from '@xyflow/react';
import { getRotationPosition } from '../../utils/rotation';

/**
 * LED node — dashboard indicator, signal light.
 * Handles: anode (in), cathode (out)
 */
export function LEDNode({ data, selected }: any) {
    const label = data?.label || 'LED';
    const color = data?.params?.color || '#ef4444';
    const on = data?.state?.on || false;
    const rotation = data?.rotation ?? 0;

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 60, height: 60 }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className={on ? 'drop-shadow-[0_0_12px_var(--led-color)]' : ''} style={{ '--led-color': color } as React.CSSProperties}>
                {/* LED triangle */}
                <polygon points="15,15 45,30 15,45" fill={on ? color : '#0f172a'} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                {/* Cathode bar */}
                <line x1="45" y1="15" x2="45" y2="45" stroke={selected ? '#38bdf8' : '#475569'} strokeWidth="2.5" />
                {/* Light rays when on */}
                {on && (
                    <g stroke={color} strokeWidth="1.5" opacity="0.7">
                        <line x1="50" y1="18" x2="56" y2="12" />
                        <line x1="52" y1="24" x2="58" y2="20" />
                    </g>
                )}
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <Handle type="target" position={getRotationPosition(Position.Left, rotation)} id="anode" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" />
            <Handle type="source" position={getRotationPosition(Position.Right, rotation)} id="cathode" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
