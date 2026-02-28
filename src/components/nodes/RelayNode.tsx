import { MirroredHandle, NodeBody } from './NodeBase';
import { Position } from '@xyflow/react';
import { mapSideByFlip } from '../../utils/rotation';

/**
 * Standard automotive 5-pin relay node.
 * Updated for Logical Flipping (No CSS scale on outer node).
 */
export function RelayNode({ data, selected }: any) {
    const isEnergized = data?.state?.energized || false;
    const label = data?.label || 'Relay';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    const W = 120;
    const H = 140;
    const pinColor = '#fbbf24';
    const bodyColor = isEnergized ? '#1e293b' : '#0f172a';
    const bodyStroke = selected ? '#38bdf8' : '#334155';


    // Logical sides
    const side87 = Position.Top;
    const side87a = Position.Right;
    const sideCoilIn = Position.Bottom; // 86
    const sideCoilOut = Position.Bottom; // 85
    const side30 = Position.Bottom;

    return (
        <NodeBody selected={selected} width={W} height={H + 24}>
            {/* Visual Container for the Drawing (This can be scaled/flipped) */}
            <div
                className="absolute inset-0 transition-transform"
                style={{
                    transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
                    transformOrigin: 'center'
                }}
            >
                <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width={W - 10} height={H - 10} rx="6" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" />

                    {/* Pin 87 */}
                    <rect x="40" y="18" width="40" height="6" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />

                    {/* Pin 87a */}
                    <rect x="40" y="46" width="40" height="6" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />

                    {/* Pin 86 (Coil +) */}
                    <rect x="22" y="70" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />

                    {/* Pin 85 (Coil -) */}
                    <rect x="92" y="70" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />

                    {/* Pin 30 */}
                    <rect x="57" y="80" width="6" height="36" rx="1" fill={pinColor} stroke="#b45309" strokeWidth="0.5" />

                    {isEnergized && (
                        <circle cx="60" cy="68" r="4" fill="#22c55e" opacity="0.9">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                    )}
                </svg>
            </div>

            {/* Labels - Rendered OUTSIDE the scale container so they don't mirror */}
            <div className="absolute inset-0 pointer-events-none text-[10px] font-bold fill-slate-400">
                {/* 87 - Mapped to physical side */}
                <span className="absolute left-1/2 -translate-x-1/2 top-1 text-slate-400">87</span>

                {/* 87a - This swap is tricky if we don't scale the labels. 
                    If flipX is true, 87a (Right) moves to physical Left. */}
                <span className={`absolute top-11 p-1 ${mapSideByFlip(side87a, flipX, flipY) === Position.Left ? 'left-2' : 'right-2'}`}>87a</span>

                {/* Bottom pins: 86 (L), 30 (C), 85 (R) */}
                <span className={`absolute bottom-8 ${mapSideByFlip(Position.Left, flipX, flipY) === Position.Left ? 'left-6' : 'right-6'}`}>86</span>
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2">30</span>
                <span className={`absolute bottom-8 ${mapSideByFlip(Position.Right, flipX, flipY) === Position.Left ? 'left-6' : 'right-6'}`}>85</span>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 shadow-sm whitespace-nowrap">
                {label} {isEnergized ? '●' : '○'}
            </div>

            {/* Handles - Standardized MirroredHandle */}
            <MirroredHandle type="source" side={side87} id="no" className="!bg-blue-500" flipX={flipX} flipY={flipY} style={{ top: '0%', left: '50%' }} />
            <MirroredHandle type="source" side={side87a} id="nc" className="!bg-slate-500" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={sideCoilIn} id="coil_in" className="!bg-purple-500" flipX={flipX} flipY={flipY} style={{ bottom: '0%', left: '21%' }} />
            <MirroredHandle type="source" side={side30} id="com" className="!bg-yellow-500" flipX={flipX} flipY={flipY} style={{ bottom: '0%', left: '50%' }} />
            <MirroredHandle type="source" side={sideCoilOut} id="coil_out" className="!bg-purple-400" flipX={flipX} flipY={flipY} style={{ bottom: '0%', left: '79%' }} />

        </NodeBody>
    );
}
