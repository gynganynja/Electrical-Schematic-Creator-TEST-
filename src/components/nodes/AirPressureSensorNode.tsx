import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';

import { Wind } from 'lucide-react';

export function AirPressureSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const pressure = data?.state?.pressure ?? 101.3;
    const maxPress = data?.params?.maxVal ?? 250;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const label = data?.label || 'Air Press';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // MAP sensor voltage output: linear vMin..vMax over 0..maxPress kPa
    const vOut = vMin + (pressure / maxPress) * (vMax - vMin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { pressure: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-cyan-400 tracking-wider flex items-center gap-1">
                <Wind size={12} /> {label}
            </div>
            <input
                type="range" min="0" max={maxPress} value={pressure}
                onChange={handleChange}
                className="w-20 my-1 accent-cyan-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 bg-cyan-500/10 rounded">
                {pressure.toFixed(1)} kPa
            </div>
            <div className="text-[9px] font-mono text-slate-500 mb-1.5 mt-0.5">
                OUT {vOut.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
