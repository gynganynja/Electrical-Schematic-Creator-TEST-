import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { ShieldAlert, RefreshCw } from 'lucide-react';


/**
 * Auto Reset Circuit Breaker.
 * Trips when current exceeds threshold, automatically resets after delay.
 * No manual intervention needed.
 */
export function BreakerAutoNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const isTripped = data?.state?.tripped || false;
    const tripCurrent = data?.params?.tripCurrent ?? 20;
    const label = data?.label || 'ACB';

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isTripped ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <div className="my-1.5 flex items-center gap-1.5">
                <ShieldAlert size={16} className={isTripped ? 'text-red-400' : 'text-emerald-400'} />
                <span className={`text-xs font-bold font-mono ${isTripped ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isTripped ? 'TRIPPED' : `${tripCurrent}A`}
                </span>
            </div>
            <div className="mb-1.5 flex items-center gap-1 text-[9px] font-mono text-slate-500">
                <RefreshCw size={10} /> AUTO
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
