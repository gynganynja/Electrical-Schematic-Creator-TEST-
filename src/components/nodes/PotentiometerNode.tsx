import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { mapSideByFlip } from '../../utils/rotation';
import useStore from '../../store/useStore';


export function PotentiometerNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const totalR = data?.params?.resistance ?? 10000;
    const position = data?.state?.position ?? 50; // 0-100%
    const label = data?.label || 'POT';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Wiper voltage is solved and stored back by the solver via nodeVoltages
    const wiperVoltage = data?.state?.wiperVoltage;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateNodeData(id, { state: { position: Number(e.target.value) } });
    };

    const sideA = Position.Left;
    const sideB = Position.Right;
    const sideWiper = Position.Bottom;

    const visA = mapSideByFlip(sideA, flipX, flipY);
    const visB = mapSideByFlip(sideB, flipX, flipY);

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <input
                type="range" min="0" max="100" value={position}
                onChange={handleChange}
                className="w-20 my-1.5 accent-teal-400"
                onClick={e => e.stopPropagation()}
            />
            <div className="text-[9px] font-mono text-teal-300">
                {position}% • {(totalR * position / 100).toFixed(0)}Ω
            </div>
            <div className="text-[9px] font-mono mb-1.5 mt-0.5" style={{ color: wiperVoltage !== undefined ? '#fbbf24' : '#475569' }}>
                {wiperVoltage !== undefined ? `Wiper: ${wiperVoltage.toFixed(2)}V` : 'Wiper: —'}
            </div>

            <MirroredHandle type="target" side={sideA} id="a"
                className="!w-3 !h-3 !bg-teal-400 !border-2 !border-white"
                style={(visA === Position.Left || visA === Position.Right) ? { top: '35%' } : { left: '35%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={sideB} id="b"
                className="!w-3 !h-3 !bg-teal-400 !border-2 !border-white"
                style={(visB === Position.Left || visB === Position.Right) ? { top: '35%' } : { left: '35%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={sideWiper} id="wiper"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
