import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, useNodeId } from '@xyflow/react';
import { mapSideByFlip } from '../../utils/rotation';

/**
 * A handle that re-maps its side logically. 
 * NO CSS scale flips on the node.
 */
export const MirroredHandle = ({
    side,
    flipX = false,
    flipY = false,
    id,
    type,
    style,
    className = '',
    ...props
}: any) => {
    const nodeId = useNodeId();
    const updateNodeInternals = useUpdateNodeInternals();

    const physicalPos = mapSideByFlip(side, flipX, flipY);

    useEffect(() => {
        if (nodeId) updateNodeInternals(nodeId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (nodeId) updateNodeInternals(nodeId);
    }, [flipX, flipY, side, nodeId, updateNodeInternals]);

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
        ...style
    };

    const visSide = mapSideByFlip(side, flipX, flipY);
    const isVisLeft = visSide === Position.Left;
    const isVisRight = visSide === Position.Right;
    const isVisTop = visSide === Position.Top;
    const isVisBottom = visSide === Position.Bottom;

    if (isVisLeft) {
        baseStyle.left = '0%';
        baseStyle.right = 'auto';
    } else if (isVisRight) {
        baseStyle.left = '100%';
        baseStyle.right = 'auto';
    } else if (isVisTop) {
        baseStyle.top = '0%';
        baseStyle.bottom = 'auto';
    } else if (isVisBottom) {
        baseStyle.top = '100%';
        baseStyle.bottom = 'auto';
    }

    return (
        <Handle
            {...props}
            type={type}
            id={id}
            position={physicalPos}
            className={`!pointer-events-auto ${className}`}
            style={baseStyle}
        />
    );
};

export const RotatedHandle = (props: any) => <MirroredHandle {...props} />;

/** 
 * VisualContainer - Flips the internal drawing but NOT the handles or text 
 * (unless desired). 
 */
export const VisualContainer = ({ flipX, flipY, children, className = "" }: any) => (
    <div
        className={`w-full h-full transition-transform ${className}`}
        style={{
            transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
            transformOrigin: 'center'
        }}
    >
        {children}
    </div>
);

/**
 * Legacy wrapper
 */
export const RotatedContainer = ({ flipX, flipY, children }: any) => (
    <VisualContainer flipX={flipX} flipY={flipY}>
        {children}
    </VisualContainer>
);

interface PinRowProps {
    id: string;
    type: 'source' | 'target';
    label: string;
    side: Position;
    flipX?: boolean;
    flipY?: boolean;
    className?: string;
    labelClassName?: string;
    handleClassName?: string;
}

export const PinRow = ({
    id,
    type,
    label,
    side,
    flipX = false,
    flipY = false,
    className = '',
    labelClassName = '',
    handleClassName = ''
}: PinRowProps) => {
    const visSide = mapSideByFlip(side, flipX, flipY);
    const isVisRight = visSide === Position.Right;

    return (
        <div className={`relative flex items-center h-7 w-full px-3 ${isVisRight ? 'justify-end pr-4 text-right' : 'justify-start pl-4 text-left'} ${className}`}>
            <span className={`text-[9px] font-bold uppercase tracking-tight whitespace-nowrap pointer-events-none z-10 ${labelClassName}`}>
                {label}
            </span>
            <MirroredHandle type={type} side={side} flipX={flipX} flipY={flipY} id={id} className={`!w-3 !h-3 !border-2 !border-white !bg-slate-400 ${handleClassName}`} />
        </div>
    );
};

/**
 * NodeBody - The non-scaling outer shell.
 */
export const NodeBody = ({
    children,
    selected = false,
    className = '',
    width = 200,
    height = 100
}: any) => {
    const containerClasses = className.includes('rounded-') ? className : `rounded-xl ${className}`;

    return (
        <div style={{ width, height }} className="relative flex items-center justify-center bg-transparent">
            <div
                className={`bg-slate-900 border-2 shadow-2xl transition-all relative flex-shrink-0 ${selected ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-slate-800'
                    } ${containerClasses}`}
                style={{ width, height }}
            >
                {children}
            </div>
        </div>
    );
};
