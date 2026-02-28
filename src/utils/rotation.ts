import { Position } from '@xyflow/react';

/**
 * Maps a base handle position to its logical mirrored position.
 * Best Practice: use this for 'position' prop in Handle to match physical world.
 */
export function mapSideByFlip(
    side: Position,
    flipX: boolean = false,
    flipY: boolean = false
): Position {
    let s = side;
    if (flipX) {
        if (s === Position.Left) s = Position.Right;
        else if (s === Position.Right) s = Position.Left;
    }
    if (flipY) {
        if (s === Position.Top) s = Position.Bottom;
        else if (s === Position.Bottom) s = Position.Top;
    }
    return s;
}

/**
 * Legacy rotation mapper. Deprecated in favor of flipping.
 */
export function getRotationPosition(basePos: Position, rotation: number = 0): Position {
    const r = ((rotation % 360) + 360) % 360;
    if (r === 0) return basePos;
    if (r === 90) {
        switch (basePos) {
            case Position.Left: return Position.Top;
            case Position.Right: return Position.Bottom;
            case Position.Top: return Position.Right;
            case Position.Bottom: return Position.Left;
        }
    }
    if (r === 180) {
        switch (basePos) {
            case Position.Left: return Position.Right;
            case Position.Right: return Position.Left;
            case Position.Top: return Position.Bottom;
            case Position.Bottom: return Position.Top;
        }
    }
    if (r === 270) {
        switch (basePos) {
            case Position.Left: return Position.Bottom;
            case Position.Right: return Position.Top;
            case Position.Top: return Position.Left;
            case Position.Bottom: return Position.Right;
        }
    }
    return basePos;
}

/** 
 * Backward compatibility alias 
 */
export const getMirrorPosition = mapSideByFlip;
