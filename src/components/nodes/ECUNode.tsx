import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { getRotationPosition } from '../../utils/rotation';

/**
 * ECU Module — Programmable controller with dynamic I/O count.
 */
export function ECUNode({ data, selected }: any) {
    const label = data?.label || 'ECU';
    const numInputs = Math.min(Math.max(data?.params?.numInputs ?? 4, 1), 8);
    const numOutputs = Math.min(Math.max(data?.params?.numOutputs ?? 4, 1), 8);
    const rules: any[] = data?.params?.rules || [];
    const rotation = data?.rotation ?? 0;
    const maxPins = Math.max(numInputs, numOutputs);

    // Dynamic sizing
    const pinSpacing = 22;
    const headerH = 28;
    const footerH = 18;
    const pinAreaH = maxPins * pinSpacing;
    const totalH = headerH + pinAreaH + footerH + 8;
    const W = 160;

    // Terminals based on rotation
    const inputSide = getRotationPosition(Position.Left, rotation);
    const outputSide = getRotationPosition(Position.Right, rotation);
    const powerSide = getRotationPosition(Position.Top, rotation);

    return (
        <div
            className={`bg-slate-900 border-2 rounded-lg flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-indigo-500/40 hover:border-indigo-400/60'}`}
            style={{ width: W, height: totalH }}
        >
            {/* Header */}
            <div className="text-[10px] font-bold mt-1.5 text-indigo-300 tracking-wider flex items-center gap-1">
                <Cpu size={12} /> {label}
            </div>

            {/* Pin labels */}
            <div className="w-full px-3 mt-1" style={{ height: pinAreaH }}>
                <div className="flex justify-between text-[8px] font-mono relative" style={{ height: '100%' }}>
                    {/* Input labels */}
                    <div className="text-emerald-400 flex flex-col justify-start" style={{ gap: `${pinSpacing - 14}px` }}>
                        {Array.from({ length: numInputs }, (_, i) => (
                            <div key={i} className="leading-[14px]">IN{i + 1} ●</div>
                        ))}
                    </div>
                    {/* Output labels */}
                    <div className="text-amber-400 text-right flex flex-col justify-start" style={{ gap: `${pinSpacing - 14}px` }}>
                        {Array.from({ length: numOutputs }, (_, i) => {
                            const driveType = data?.params?.outputDrives?.[`out${i + 1}`] || 'high';
                            const indicator = driveType === 'high' ? '+' : '-';
                            return (
                                <div key={i} className="leading-[14px]">
                                    <span className={`text-[7px] mr-1 ${driveType === 'high' ? 'text-red-400' : 'text-blue-400'}`}>{indicator}</span>
                                    ● OUT{i + 1}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Rules indicator */}
            <div className="text-[7px] font-mono text-slate-500 mb-0.5">
                {rules.length > 0 ? `${rules.length} RULE${rules.length > 1 ? 'S' : ''}` : 'NO RULES'}
            </div>

            {/* Footer */}
            <div className="text-[8px] font-mono text-slate-500 mb-1">VCC + GND</div>

            {/* Power handles */}
            <Handle type="target" position={powerSide} id="vcc"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
                style={powerSide === Position.Top || powerSide === Position.Bottom ? { left: '30%' } : { top: '30%' }} />
            <Handle type="target" position={powerSide} id="gnd"
                className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
                style={powerSide === Position.Top || powerSide === Position.Bottom ? { left: '70%' } : { top: '70%' }} />

            {/* Dynamic input handles */}
            {Array.from({ length: numInputs }, (_, i) => {
                const stepIdx = ((headerH + i * pinSpacing + pinSpacing / 2) / totalH) * 100;
                const style = (inputSide === Position.Left || inputSide === Position.Right)
                    ? { top: `${stepIdx}%` }
                    : { left: `${stepIdx}%` };
                return (
                    <Handle key={`in${i}`} type="target" position={inputSide} id={`in${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-white"
                        style={style} />
                );
            })}

            {/* Dynamic output handles */}
            {Array.from({ length: numOutputs }, (_, i) => {
                const stepIdx = ((headerH + i * pinSpacing + pinSpacing / 2) / totalH) * 100;
                const style = (outputSide === Position.Left || outputSide === Position.Right)
                    ? { top: `${stepIdx}%` }
                    : { left: `${stepIdx}%` };
                return (
                    <Handle key={`out${i}`} type="source" position={outputSide} id={`out${i + 1}`}
                        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-white"
                        style={style} />
                );
            })}
        </div>
    );
}
