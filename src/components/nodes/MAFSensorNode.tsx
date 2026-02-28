import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';

import { Activity } from 'lucide-react';

export function MAFSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const flow = data?.state?.flow ?? 5;
    const maxFlow = data?.params?.maxVal ?? 500;
    const vMin = data?.params?.vMin ?? 1.0;
    const vMax = data?.params?.vMax ?? 5.0;
    const label = data?.label || 'MAF Sensor';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Linear voltage output: vMin..vMax over 0..maxFlow g/s
    const vOut = vMin + (flow / maxFlow) * (vMax - vMin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { flow: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-purple-400 tracking-wider flex items-center gap-1">
                <Activity size={12} /> {label}
            </div>
            <input
                type="range" min="0" max={maxFlow} value={flow}
                onChange={handleChange}
                className="w-20 my-1 accent-purple-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-purple-300 px-2 py-0.5 bg-purple-500/10 rounded">
                {flow.toFixed(1)} g/s
            </div>
            <div className="text-[9px] font-mono text-slate-500 mb-1.5 mt-0.5">
                OUT {vOut.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Top} id="vcc"
                className="!w-2 !h-2 !bg-red-500 !border !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Bottom} id="gnd"
                className="!w-2 !h-2 !bg-green-500 !border !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-purple-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
