import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { mapSideByFlip } from '../../utils/rotation';


export function GroundNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const handleSide = Position.Top;

    // Compute the visual side of the handle after flipping
    const visSide = mapSideByFlip(handleSide, flipX, flipY);

    // Rotate the ground symbol so it always points away from the handle
    const symbolRotation =
        visSide === Position.Top ? 0 :
        visSide === Position.Bottom ? 180 :
        visSide === Position.Left ? 90 :
        visSide === Position.Right ? -90 : 0;

    return (
        <div className={`bg-transparent flex flex-col items-center justify-center p-2 relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`}>
            <MirroredHandle type="target" side={handleSide} id="gnd"
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]" flipX={flipX} flipY={flipY} />

            <div className="flex flex-col items-center mt-3 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]"
                style={{ transform: `rotate(${symbolRotation}deg)` }}>
                <div className="w-0.5 h-3 bg-emerald-500"></div>
                <div className="w-8 h-1 bg-emerald-500 mb-1 rounded-full"></div>
                <div className="w-5 h-1 bg-emerald-500 mb-1 rounded-full"></div>
                <div className="w-2 h-1 bg-emerald-500 rounded-full"></div>
            </div>
        </div>
    );
}
