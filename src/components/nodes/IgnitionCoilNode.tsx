import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function IgnitionCoilNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const resistance = data?.params?.resistance ?? 1.2;
    const label = data?.label || 'IGN COIL';
    const isActivated = data?.state?.activated || false;

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : isActivated ? 'border-orange-600' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-orange-400 tracking-wider">{label}</div>

            {/* Coil symbol */}
            <div className="my-1.5 flex flex-col items-center gap-0.5">
                <Zap size={18} className={isActivated ? 'text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.9)]' : 'text-slate-500'} />
                <svg width="40" height="16" viewBox="0 0 40 16">
                    <path d="M2,8 Q5,2 8,8 Q11,14 14,8 Q17,2 20,8 Q23,14 26,8 Q29,2 32,8 Q35,14 38,8"
                        fill="none" stroke={isActivated ? '#fb923c' : '#475569'} strokeWidth="2" />
                </svg>
            </div>

            <div className={`text-[9px] font-mono mb-1.5 ${isActivated ? 'text-orange-400' : 'text-slate-500'}`}>
                {isActivated ? 'FIRING' : `${resistance}Ω pri`}
            </div>

            {/* Primary winding */}
            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
