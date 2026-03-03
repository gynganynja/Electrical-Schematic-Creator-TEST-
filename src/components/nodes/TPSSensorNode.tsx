import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';
import { Gauge } from 'lucide-react';

export function TPSSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const position = data?.state?.position ?? 0; // 0-100%
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const label = data?.label || 'TPS';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Linear voltage output: vMin..vMax over 0..100%
    const vOut = vMin + (position / 100) * (vMax - vMin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { position: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-yellow-400 tracking-wider flex items-center gap-1">
                <Gauge size={12} /> {label}
            </div>
            <input
                type="range" min="0" max="100" value={position}
                onChange={handleChange}
                className="w-20 my-1 accent-yellow-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-yellow-300 px-2 py-0.5 bg-yellow-500/10 rounded">
                {position.toFixed(0)}% open
            </div>
            <div className="text-[9px] font-mono text-slate-400 mb-1.5 mt-0.5">
                OUT {vOut.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Bottom} id="gnd"
                className="!w-2 !h-2 !bg-green-500 !border !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-yellow-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
