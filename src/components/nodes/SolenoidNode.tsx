import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * Solenoid node — door lock actuator, valve, starter solenoid.
 * Electromagnetic linear actuator.
 * Handles: in (power), out (ground return)
 */
export function SolenoidNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'Solenoid';
    const activated = data?.state?.activated || false;

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 80, height: 55}}>
            <svg width="80" height="55" viewBox="0 0 80 55" fill="none">
                {/* Coil (zigzag) */}
                <polyline
                    points="10,28 18,10 26,45 34,10 42,45 50,10 58,45 66,28"
                    stroke={activated ? '#38bdf8' : '#475569'}
                    strokeWidth="2.5"
                    fill="none"
                    className={activated ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''}
                />
                {/* Plunger arrow */}
                <line x1="38" y1="48" x2="38" y2="52" stroke={activated ? '#38bdf8' : '#475569'} strokeWidth="2.5" />
                {activated && (
                    <polygon points="33,48 43,48 38,42" fill="#38bdf8" />
                )}
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>
            <MirroredHandle type="target" side={Position.Left} id="in" className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" style={{ top: '45%' }} flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out" className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" style={{ top: '45%' }} flipX={flipX} flipY={flipY} />
        </div>
    );
}
