import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


export function ZenerNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const breakdownV = data?.params?.breakdownVoltage ?? 5.1;
    const label = data?.label || 'ZD';

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 65, height: 50}}>
            <svg width="65" height="50" viewBox="0 0 65 50" fill="none">
                <polygon points="12,10 42,25 12,40" fill="#0f172a" stroke={selected ? '#38bdf8' : '#eab308'} strokeWidth="2.5" />
                {/* Zener cathode (bent bar) */}
                <polyline points="38,10 42,10 42,40 46,40" stroke={selected ? '#38bdf8' : '#eab308'} strokeWidth="2.5" fill="none" />
                <line x1="0" y1="25" x2="12" y2="25" stroke="#475569" strokeWidth="2" />
                <line x1="42" y1="25" x2="55" y2="25" stroke="#475569" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-yellow-300 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label} {breakdownV}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="anode"
                className="!w-3 !h-3 !bg-yellow-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="cathode"
                className="!w-3 !h-3 !bg-yellow-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
