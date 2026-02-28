import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * TVS / Surge Clamp node.
 * Clamps voltage above a configured threshold.
 * Protects against load dump and inductive spikes.
 */
export function TVSClampNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const clampVoltage = data?.params?.clampVoltage ?? 36;
    const label = data?.label || 'TVS';

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 65, height: 55}}>
            <svg width="65" height="55" viewBox="0 0 65 55" fill="none">
                {/* Diode triangle */}
                <polygon points="12,10 42,27.5 12,45" fill="#0f172a" stroke={selected ? '#38bdf8' : '#7c3aed'} strokeWidth="2.5" />
                {/* Cathode bar with TVS bends */}
                <polyline points="42,10 42,45" stroke={selected ? '#38bdf8' : '#7c3aed'} strokeWidth="2.5" fill="none" />
                <polyline points="38,10 42,10 46,14" stroke={selected ? '#38bdf8' : '#7c3aed'} strokeWidth="2" fill="none" />
                <polyline points="38,45 42,45 46,41" stroke={selected ? '#38bdf8' : '#7c3aed'} strokeWidth="2" fill="none" />
                {/* Leads */}
                <line x1="0" y1="27.5" x2="12" y2="27.5" stroke="#475569" strokeWidth="2" />
                <line x1="42" y1="27.5" x2="55" y2="27.5" stroke="#475569" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label} {clampVoltage}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="anode"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="cathode"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
