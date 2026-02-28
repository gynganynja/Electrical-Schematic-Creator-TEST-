import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';
import { Gauge } from 'lucide-react';

export function RPMSensorNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const rpm = data?.state?.rpm ?? 0;
    const maxRpm = data?.params?.maxVal ?? 8000;
    const vMin = data?.params?.vMin ?? 0.5;
    const vMax = data?.params?.vMax ?? 4.5;
    const label = data?.label || 'RPM Sensor';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Linear voltage output: vMin..vMax over 0..maxRpm
    const vOut = Math.max(vMin, Math.min(vMax, vMin + (rpm / maxRpm) * (vMax - vMin)));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { rpm: Number(e.target.value) } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-rose-400 tracking-wider flex items-center gap-1">
                <Gauge size={12} /> {label}
            </div>
            <input
                type="range" min="0" max={maxRpm} value={rpm}
                onChange={handleChange}
                className="w-20 my-1 accent-rose-500"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[10px] font-mono text-rose-300 px-2 py-0.5 bg-rose-500/10 rounded">
                {rpm.toFixed(0)} RPM
            </div>
            <div className="text-[9px] font-mono text-amber-400 mb-1.5 mt-0.5">
                OUT {vOut.toFixed(2)}V
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-rose-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
