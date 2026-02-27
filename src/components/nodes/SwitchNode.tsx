import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { getRotationPosition } from '../../utils/rotation';

export function SwitchNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const isClosed = data?.state?.closed || false;
    const label = data?.label || 'Switch';
    const rotation = data?.rotation ?? 0;

    const toggleSwitch = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { closed: !isClosed } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-20 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>

            <button
                onClick={toggleSwitch}
                className="my-2 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none"
                title={isClosed ? "Click to Open" : "Click to Close"}
            >
                {isClosed ? <ToggleRight size={28} className="text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" /> : <ToggleLeft size={28} className="text-slate-600" />}
            </button>

            <Handle type="target" position={getRotationPosition(Position.Left, rotation)} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
            <Handle type="source" position={getRotationPosition(Position.Right, rotation)} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
