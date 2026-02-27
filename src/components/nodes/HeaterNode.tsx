import { Handle, Position } from '@xyflow/react';
import { Flame } from 'lucide-react';

export function HeaterNode({ data, selected }: any) {
    const resistance = data?.params?.resistance ?? 12;
    const label = data?.label || 'HTR';
    const isOn = data?.state?.on || false;

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <Flame size={20} className={`my-1.5 ${isOn ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'text-slate-600'}`} />
            <div className="text-[10px] font-mono text-slate-400 mb-1.5">{resistance}Ω</div>

            <Handle type="target" position={Position.Left} id="in"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white" />
        </div>
    );
}
