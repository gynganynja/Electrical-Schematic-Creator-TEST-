import { Handle, Position } from '@xyflow/react';

/**
 * DC Motor node — wiper motors, window motors, fan motors, etc.
 * Handles: in (power), out (ground return)
 */
export function MotorNode({ data, selected }: any) {
    const label = data?.label || 'Motor';
    const running = data?.state?.running || false;

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                {/* Motor circle */}
                <circle cx="40" cy="40" r="28" fill={running ? '#0ea5e9' : '#0f172a'} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5" className={running ? 'drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]' : ''} />
                {/* M label */}
                <text x="40" y="47" fontSize="20" fontWeight="bold" fill={running ? '#fff' : '#94a3b8'} textAnchor="middle" fontFamily="sans-serif">M</text>
                {/* Rotation indicator when running */}
                {running && (
                    <g className="animate-[spin_1s_linear_infinite]" style={{ transformOrigin: '40px 40px' }}>
                        <path d="M 25 25 A 20 20 0 0 1 55 25" stroke="#bae6fd" strokeWidth="2.5" fill="none" markerEnd="url(#arrowM)" />
                        <defs><marker id="arrowM" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#bae6fd" /></marker></defs>
                    </g>
                )}
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <Handle type="target" position={Position.Left} id="in" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
