import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';

import { Disc } from 'lucide-react';

export function WheelSpeedSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const speed = data?.state?.speed ?? 0;
    const maxSpeed = data?.params?.maxVal ?? 300;
    const label = data?.label || 'WSS';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // VR sensor: voltage scales 0-12V over 0-maxSpeed km/h
    const vOut = (speed / maxSpeed) * 12;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { speed: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-blue-400 tracking-wider flex items-center gap-1">
                <Disc size={12} /> {label}
            </div>
            <input
                type="range" min="0" max={maxSpeed} value={speed}
                onChange={handleChange}
                className="w-20 my-1 accent-blue-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-blue-300 px-2 py-0.5 bg-blue-500/10 rounded">
                {speed.toFixed(0)} km/h
            </div>
            <div className="text-[9px] font-mono text-slate-500 mb-1.5 mt-0.5">
                OUT {vOut.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
