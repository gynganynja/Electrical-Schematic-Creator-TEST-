import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { getRotationPosition } from '../../utils/rotation';

export function GroundNode({ data, selected }: any) {
    const rotation = data?.rotation ?? 0;
    const handlePos = getRotationPosition(Position.Top, rotation);

    // The visual orientation of the ground symbol itself
    const visualRotation = `rotate(${rotation}deg)`;

    return (
        <div className={`bg-transparent flex flex-col items-center justify-center p-2 relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`}>
            <Handle type="target" position={handlePos} id="gnd"
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />

            <div className="flex flex-col items-center mt-3 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]"
                style={{ transform: visualRotation }}>
                <div className="w-0.5 h-3 bg-emerald-500"></div>
                <div className="w-8 h-1 bg-emerald-500 mb-1 rounded-full"></div>
                <div className="w-5 h-1 bg-emerald-500 mb-1 rounded-full"></div>
                <div className="w-2 h-1 bg-emerald-500 rounded-full"></div>
            </div>
        </div>
    );
}
