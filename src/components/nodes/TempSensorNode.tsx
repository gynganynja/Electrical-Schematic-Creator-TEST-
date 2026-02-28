import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';
import { Thermometer } from 'lucide-react';

export function TempSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const temperature = data?.state?.temperature ?? 25;
    const minTemp = data?.params?.minVal ?? -40;
    const maxTemp = data?.params?.maxVal ?? 150;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const label = data?.label || 'Temp Sensor';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Linear voltage output: vMin..vMax over minTemp..maxTemp
    const vOut = vMin + ((temperature - minTemp) / (maxTemp - minTemp)) * (vMax - vMin);
    const vClamped = Math.max(vMin, Math.min(vMax, vOut));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { temperature: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-orange-400 tracking-wider flex items-center gap-1">
                <Thermometer size={12} /> {label}
            </div>
            <input
                type="range" min={minTemp} max={maxTemp} value={temperature}
                onChange={handleChange}
                className="w-20 my-1 accent-orange-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-orange-300 px-2 py-0.5 bg-orange-500/10 rounded">
                {temperature.toFixed(1)}°C
            </div>
            <div className="text-[9px] font-mono text-amber-400 mb-1.5 mt-0.5">
                OUT {vClamped.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
