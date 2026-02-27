import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { getRotationPosition } from '../../utils/rotation';

export function FuseNode({ data, selected }: any) {
    const isBlown = data?.state?.blown || false;
    const tripCurrent = data?.params?.tripCurrent ?? 15;
    const label = data?.label || 'Fuse';
    const rotation = data?.rotation ?? 0;

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-20 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isBlown ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <div className={`my-2 mb-2.5 flex items-center gap-1 text-xs font-bold ${isBlown ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : 'text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]'}`}>
                <Zap size={14} className={isBlown ? 'text-red-500' : 'text-emerald-500'} />
                {isBlown ? 'BLOWN' : `${tripCurrent}A`}
            </div>

            <Handle type="target" position={getRotationPosition(Position.Left, rotation)} id="in"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white" />
            <Handle type="source" position={getRotationPosition(Position.Right, rotation)} id="out"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white" />
        </div>
    );
}
