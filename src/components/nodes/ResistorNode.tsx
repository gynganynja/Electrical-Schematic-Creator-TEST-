import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


export function ResistorNode({ data, selected }: any) {
    const resistance = data?.params?.resistance ?? 100;
    const label = data?.label || 'R';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-20 h-14 flex flex-col items-center justify-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <svg width="40" height="10" className="mb-0.5 overflow-visible">
                <path d="M 0 5 L 5 0 L 15 10 L 25 0 L 35 10 L 40 5" stroke="#38bdf8" fill="none" strokeWidth="2.5" strokeLinejoin="round" className="drop-shadow-[0_0_3px_rgba(56,189,248,0.8)]" />
            </svg>
            <div className="text-[10px] font-bold text-slate-300 tracking-wider">{resistance}Ω</div>
            <div className="absolute -bottom-6 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
