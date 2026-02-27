import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

/**
 * Fusible Link.
 * Like a fuse but higher trip current and slower blow time.
 * Used as last-resort protection on battery cables.
 */
export function FusibleLinkNode({ data, selected }: any) {
    const isBlown = data?.state?.blown || false;
    const tripCurrent = data?.params?.tripCurrent ?? 80;
    const label = data?.label || 'FL';

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isBlown ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <div className="my-2 flex items-center gap-1.5">
                <Zap size={14} className={isBlown ? 'text-red-500' : 'text-amber-500'} />
                <span className={`text-xs font-bold font-mono ${isBlown ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : 'text-amber-400'}`}>
                    {isBlown ? 'BLOWN' : `${tripCurrent}A`}
                </span>
            </div>
            <div className="mb-1.5 text-[8px] font-mono text-slate-600 uppercase">Fusible Link</div>

            <Handle type="target" position={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" />
        </div>
    );
}
