import { Handle, Position } from '@xyflow/react';
import useStore from '../../store/useStore';
import { getRotationPosition } from '../../utils/rotation';

export function PotentiometerNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const totalR = data?.params?.resistance ?? 10000;
    const position = data?.state?.position ?? 50; // 0-100%
    const label = data?.label || 'POT';
    const rotation = data?.rotation ?? 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { position: Number(e.target.value) } });
    };

    const sideA = getRotationPosition(Position.Left, rotation);
    const sideB = getRotationPosition(Position.Right, rotation);
    const sideWiper = getRotationPosition(Position.Bottom, rotation);

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <input
                type="range" min="0" max="100" value={position}
                onChange={handleChange}
                className="w-20 my-1.5 accent-teal-400"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[9px] font-mono text-teal-300 mb-1.5">
                {position}% • {(totalR * position / 100).toFixed(0)}Ω
            </div>

            <Handle type="target" position={sideA} id="a"
                className="!w-3 !h-3 !bg-teal-400 !border-2 !border-white"
                style={(sideA === Position.Left || sideA === Position.Right) ? { top: '35%' } : { left: '35%' }} />
            <Handle type="source" position={sideB} id="b"
                className="!w-3 !h-3 !bg-teal-400 !border-2 !border-white"
                style={(sideB === Position.Left || sideB === Position.Right) ? { top: '35%' } : { left: '35%' }} />
            <Handle type="source" position={sideWiper} id="wiper"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" />
        </div>
    );
}
