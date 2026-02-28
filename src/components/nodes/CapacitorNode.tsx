import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


export function CapacitorNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const capacitance = data?.params?.capacitance ?? '100µF';
    const label = data?.label || 'C';

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 55, height: 50}}>
            <svg width="55" height="50" viewBox="0 0 55 50" fill="none">
                <line x1="0" y1="25" x2="20" y2="25" stroke="#475569" strokeWidth="2" />
                <line x1="20" y1="10" x2="20" y2="40" stroke={selected ? '#38bdf8' : '#06b6d4'} strokeWidth="3" />
                <line x1="30" y1="10" x2="30" y2="40" stroke={selected ? '#38bdf8' : '#06b6d4'} strokeWidth="3" />
                <line x1="30" y1="25" x2="50" y2="25" stroke="#475569" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label} {capacitance}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
