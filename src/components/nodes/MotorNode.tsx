import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * DC Motor node — wiper motors, window motors, fan motors, etc.
 * Handles: in (power), out (ground return)
 */
export function MotorNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'Motor';
    const running = data?.state?.running || false;
    const speedRatio = data?.state?.speedRatio ?? (running ? 1 : 0);

    // Spin duration: fast at full speed, slow at low speed (0.4s - 3s)
    const spinDuration = running ? Math.max(0.4, 3 - speedRatio * 2.6) : 1;
    // Color intensity based on speed
    const fillOpacity = 0.2 + speedRatio * 0.8;
    const fillColor = running ? `rgba(14,165,233,${fillOpacity.toFixed(2)})` : '#0f172a';

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="28" fill={fillColor} stroke={selected ? '#38bdf8' : '#334155'} strokeWidth="2.5"
                    style={running ? { filter: `drop-shadow(0 0 ${Math.round(speedRatio * 12)}px rgba(14,165,233,0.6))` } : undefined} />
                <text x="40" y="47" fontSize="20" fontWeight="bold" fill={running ? '#fff' : '#94a3b8'} textAnchor="middle" fontFamily="sans-serif">M</text>
                {running && (
                    <g style={{ transformOrigin: '40px 40px', animation: `spin ${spinDuration}s linear infinite` }}>
                        <path d="M 25 25 A 20 20 0 0 1 55 25" stroke="#bae6fd" strokeWidth="2.5" fill="none" markerEnd="url(#arrowM)" />
                        <defs><marker id="arrowM" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#bae6fd" /></marker></defs>
                    </g>
                )}
            </svg>
            {running && speedRatio < 0.95 && (
                <div className="absolute -top-1 -right-1 bg-sky-900/80 border border-sky-500/40 rounded px-0.5 text-[8px] text-sky-300 font-mono leading-tight">
                    {Math.round(speedRatio * 100)}%
                </div>
            )}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <MirroredHandle type="target" side={Position.Left} id="in" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
