import { Handle, Position } from '@xyflow/react';
import { Snowflake } from 'lucide-react';

export function CompressorClutchNode({ data, selected }: any) {
    const resistance = data?.params?.resistance ?? 3;
    const label = data?.label || 'A/C';
    const isActivated = data?.state?.activated || false;

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <Snowflake size={20} className={`my-1.5 ${isActivated ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-600'}`} />
            <div className={`text-[9px] font-mono mb-1.5 ${isActivated ? 'text-cyan-400' : 'text-slate-500'}`}>
                {isActivated ? 'ENGAGED' : `${resistance}Ω`}
            </div>

            <Handle type="target" position={Position.Left} id="in"
                className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out"
                className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-white" />
        </div>
    );
}
